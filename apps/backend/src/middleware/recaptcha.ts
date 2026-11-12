import { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler";

export interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  score?: number;
  action?: string;
}

export interface VerifyRecaptchaOptions {
  /** Expected action name (e.g. 'login', 'register', 'resident_login') */
  expectedAction?: string | string[];
  /** Optional minimum score override for this specific endpoint (default from RECAPTCHA_MIN_SCORE or 0.5) */
  minScore?: number;
}

/**
 * Extracts the client IP on Fly.io:
 * Prioritizes Fly-Client-IP header; falls back only to req.ip (parsed via trust proxy = 1),
 * not an unvalidated raw x-forwarded-for header.
 */
export function getClientIp(req: Request): string {
  const flyClientIp = req.headers["fly-client-ip"];
  if (typeof flyClientIp === "string" && flyClientIp.trim()) {
    return flyClientIp.trim();
  }
  return req.ip || req.socket.remoteAddress || "";
}

/**
 * Masks the client IP address for privacy in diagnostic logs (e.g. 192.168.1.xxx).
 */
export function truncateIp(ip: string): string {
  if (!ip) return "[unknown]";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  } else if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":xxxx";
  }
  return "[ip-masked]";
}

/**
 * Verifies a Google reCAPTCHA v3 token against Google's siteverify API.
 * - Enforces fail-closed security: rejects if token is missing, secret is missing,
 *   Google is unreachable, or score/action/hostname checks fail.
 * - Sanitizes logs: logs only endpoint, action, score, outcome, and truncated IP.
 * - Never returns or logs secret keys or raw tokens.
 */
export async function verifyRecaptchaToken(
  token: string | undefined,
  remoteIp: string | undefined,
  endpointPath = "/unknown",
  options?: VerifyRecaptchaOptions
): Promise<RecaptchaVerifyResponse> {
  const maskedIp = truncateIp(remoteIp || "");

  // 1. Missing token check -> 400
  if (!token || typeof token !== "string" || !token.trim()) {
    console.warn(`[reCAPTCHA] endpoint=${endpointPath} outcome=REJECTED reason=missing_token ip=${maskedIp}`);
    throw new ApiError(400, "reCAPTCHA verification token is missing.");
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Local development bypass: allow seamless development when running locally without active reCAPTCHA keys
  const isDev = process.env.NODE_ENV !== "production";
  const isPlaceholderSecret = !secretKey || !secretKey.trim() || secretKey === "your_recaptcha_v3_secret_key";
  if (isDev && (token === "dev-mock-recaptcha-token" || isPlaceholderSecret)) {
    const expectedAction = options?.expectedAction;
    const actionName = typeof expectedAction === "string" ? expectedAction : (Array.isArray(expectedAction) ? expectedAction[0] : "login");
    console.log(`[reCAPTCHA] Dev fallback bypass applied for ${endpointPath} (action=${actionName})`);
    return {
      success: true,
      score: 0.95,
      action: actionName,
      hostname: "localhost",
    };
  }

  if (!secretKey || !secretKey.trim()) {
    console.error("[reCAPTCHA] Server misconfiguration: RECAPTCHA_SECRET_KEY is missing from environment.");
    // Fail-closed: reject requests when verification cannot run
    throw new ApiError(500, "Internal authentication verification error.");
  }

  const trimmedToken = token.trim();
  const params = new URLSearchParams();
  params.append("secret", secretKey.trim());
  params.append("response", trimmedToken);
  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  // 2. Short timeout POST to Google siteverify (5 seconds)
  const timeoutMs = 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let verifyRes: globalThis.Response;
  try {
    verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(
      `[reCAPTCHA] endpoint=${endpointPath} outcome=FAILED_CLOSED reason=google_unreachable error="${err?.name === "AbortError" ? "Request timed out (5s)" : err?.message || err}" ip=${maskedIp}`
    );
    throw new ApiError(503, "reCAPTCHA verification service is currently unreachable. Please try again later.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!verifyRes.ok) {
    console.error(`[reCAPTCHA] endpoint=${endpointPath} outcome=FAILED_CLOSED http_status=${verifyRes.status} ip=${maskedIp}`);
    throw new ApiError(503, "reCAPTCHA verification service returned an error. Please try again later.");
  }

  let data: RecaptchaVerifyResponse;
  try {
    data = (await verifyRes.json()) as RecaptchaVerifyResponse;
  } catch {
    console.error(`[reCAPTCHA] endpoint=${endpointPath} outcome=FAILED_CLOSED reason=malformed_json ip=${maskedIp}`);
    throw new ApiError(503, "reCAPTCHA verification service returned a malformed response.");
  }

  // 3. Handle success = false
  if (!data.success) {
    const errorCodes = data["error-codes"] || [];
    console.warn(
      `[reCAPTCHA] endpoint=${endpointPath} outcome=REJECTED error_codes=${errorCodes.join(",") || "unknown"} ip=${maskedIp}`
    );

    // Misconfiguration on server side -> 500
    if (errorCodes.includes("missing-input-secret") || errorCodes.includes("invalid-input-secret")) {
      console.error("[reCAPTCHA] Server misconfiguration: invalid or missing secret key reported by Google.");
      throw new ApiError(500, "Internal authentication verification error.");
    }

    if (errorCodes.includes("timeout-or-duplicate")) {
      throw new ApiError(400, "reCAPTCHA token has expired or was already used.");
    }
    if (errorCodes.includes("invalid-input-response")) {
      throw new ApiError(400, "Invalid reCAPTCHA token.");
    }
    if (errorCodes.includes("missing-input-response")) {
      throw new ApiError(400, "reCAPTCHA verification token is missing.");
    }

    throw new ApiError(400, "reCAPTCHA verification failed. Please try again.");
  }

  // 4. Verify action matches expected action -> 403
  if (options?.expectedAction) {
    const expected = Array.isArray(options.expectedAction)
      ? options.expectedAction
      : [options.expectedAction];

    if (!data.action || !expected.includes(data.action)) {
      console.warn(
        `[reCAPTCHA] endpoint=${endpointPath} outcome=REJECTED reason=action_mismatch got="${data.action}" expected="${expected.join(",")}" score=${data.score} ip=${maskedIp}`
      );
      throw new ApiError(403, "reCAPTCHA action mismatch.");
    }
  }

  // 5. Verify score >= RECAPTCHA_MIN_SCORE -> 403
  const minScore = options?.minScore ?? parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
  const tokenScore = typeof data.score === "number" ? data.score : 0;
  if (tokenScore < minScore) {
    console.warn(
      `[reCAPTCHA] endpoint=${endpointPath} action=${data.action || "none"} score=${tokenScore} outcome=REJECTED reason=score_too_low threshold=${minScore} ip=${maskedIp}`
    );
    throw new ApiError(403, "We couldn't verify this request. Please try again.");
  }

  // 6. Verify hostname against RECAPTCHA_EXPECTED_HOSTNAME (skip if unset in local dev) -> 403
  const expectedHostnamesEnv = process.env.RECAPTCHA_EXPECTED_HOSTNAME;
  if (expectedHostnamesEnv && expectedHostnamesEnv.trim()) {
    const allowedHostnames = expectedHostnamesEnv
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    const tokenHostname = (data.hostname || "").toLowerCase();
    if (!allowedHostnames.includes(tokenHostname)) {
      console.warn(
        `[reCAPTCHA] endpoint=${endpointPath} outcome=REJECTED reason=hostname_mismatch got="${tokenHostname}" expected="${allowedHostnames.join(",")}" ip=${maskedIp}`
      );
      throw new ApiError(403, "reCAPTCHA hostname verification failed.");
    }
  }

  // 10. Log successful outcome without leaking sensitive data
  console.log(
    `[reCAPTCHA] endpoint=${endpointPath} action=${data.action || "none"} score=${tokenScore} outcome=ALLOWED ip=${maskedIp}`
  );

  return data;
}

/**
 * Express middleware factory to verify reCAPTCHA v3 before executing downstream controller logic.
 * Usage:
 *   router.post("/login", verifyRecaptcha({ expectedAction: "login" }), staffLogin);
 *   router.post("/register", verifyRecaptcha({ expectedAction: "register" }), createResident);
 */
export function verifyRecaptcha(options?: VerifyRecaptchaOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Skip OPTIONS preflight requests
    if (req.method === "OPTIONS") {
      return next();
    }

    try {
      const token =
        req.body?.recaptchaToken ||
        req.body?.["g-recaptcha-response"] ||
        (req.headers["x-recaptcha-token"] as string | undefined);

      const remoteIp = getClientIp(req);
      const endpoint = req.originalUrl || req.baseUrl || req.path;

      await verifyRecaptchaToken(token, remoteIp, endpoint, options);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default verifyRecaptcha;
