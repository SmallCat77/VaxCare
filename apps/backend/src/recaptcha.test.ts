import { verifyRecaptchaToken, verifyRecaptcha, getClientIp, truncateIp } from "./middleware/recaptcha";
import { createRateLimiter } from "./middleware/rateLimiter";
import { ApiError } from "./middleware/errorHandler";
import cors from "cors";

interface TestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function record(scenario: string, expected: string, actual: string, passed: boolean, notes?: string) {
  results.push({ scenario, expected, actual, passed, notes });
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} - [${scenario}]: Expected ${expected}, got ${actual}${notes ? ` (${notes})` : ""}`);
}

// Helper to simulate running an Express middleware function in-memory
function runMiddleware(
  middleware: (req: any, res: any, next: (err?: any) => void) => any,
  reqData: {
    body?: any;
    headers?: Record<string, string>;
    method?: string;
    path?: string;
    ip?: string;
  }
): Promise<{ passed: boolean; error?: any; status?: number; responseBody?: any }> {
  return new Promise((resolve) => {
    let capturedStatus = 200;
    let capturedBody: any = null;

    const req = {
      method: reqData.method || "POST",
      path: reqData.path || "/api/auth/login",
      originalUrl: reqData.path || "/api/auth/login",
      body: reqData.body || {},
      headers: reqData.headers || {},
      socket: { remoteAddress: "127.0.0.1" },
      ip: reqData.ip || "127.0.0.1",
    };

    const res = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(data: any) {
        capturedBody = data;
        resolve({ passed: false, status: capturedStatus, responseBody: capturedBody });
        return this;
      },
      setHeader() {},
      getHeader() {},
    };

    middleware(req, res as any, (err?: any) => {
      if (err) {
        resolve({ passed: false, error: err, status: err.status });
      } else {
        resolve({ passed: true, status: 200 });
      }
    });
  });
}

// Helper to test CORS origin rules
function testCors(origin: string, allowedOrigins: string[], allowVercelPreviews = false): Promise<boolean> {
  return new Promise((resolve) => {
    const corsMiddleware = cors({
      origin(reqOrigin, callback) {
        if (!reqOrigin) return callback(null, true);
        if (allowedOrigins.includes(reqOrigin)) return callback(null, true);
        if (allowVercelPreviews && /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(reqOrigin)) {
          return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
      },
    });

    const req = { headers: { origin }, method: "POST" };
    const res = { setHeader: () => {}, getHeader: () => {} };
    corsMiddleware(req as any, res as any, (err?: any) => {
      resolve(!err);
    });
  });
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  Running VaxCare Security, reCAPTCHA v3 & Rate Limit  ");
  console.log("=======================================================\n");

  const originalFetch = global.fetch;
  const originalSecret = process.env.RECAPTCHA_SECRET_KEY;
  const originalHostname = process.env.RECAPTCHA_EXPECTED_HOSTNAME;
  const originalMinScore = process.env.RECAPTCHA_MIN_SCORE;

  // Set test environment configuration
  process.env.RECAPTCHA_SECRET_KEY = "mock_secret_key_for_unit_tests";
  process.env.RECAPTCHA_MIN_SCORE = "0.5";
  process.env.RECAPTCHA_EXPECTED_HOSTNAME = "vaxcare.vercel.app,localhost";

  try {
    // -----------------------------------------------------------------------
    // Scenario 1: Valid login token -> Login proceeds
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "login",
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mValidLogin = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "valid-login-token" },
    });
    record(
      "Scenario 1: Valid login token",
      "Login proceeds (next called without error)",
      mValidLogin.passed ? "Login proceeded successfully" : `Error: ${mValidLogin.error?.message}`,
      mValidLogin.passed
    );

    // -----------------------------------------------------------------------
    // Scenario 2: Valid registration token -> Registration proceeds
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.85,
          action: "register",
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mValidRegister = await runMiddleware(verifyRecaptcha({ expectedAction: "register" }), {
      body: { name: "Maria Santos", birthdate: "1995-05-12", recaptchaToken: "valid-register-token" },
      path: "/api/residents",
    });
    record(
      "Scenario 2: Valid registration token",
      "Registration proceeds (next called without error)",
      mValidRegister.passed ? "Registration proceeded successfully" : `Error: ${mValidRegister.error?.message}`,
      mValidRegister.passed
    );

    // -----------------------------------------------------------------------
    // Scenario 3: Resident login strictly accepts 'resident_login' action
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "resident_login",
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mValidResidentLogin = await runMiddleware(verifyRecaptcha({ expectedAction: "resident_login" }), {
      body: { residentId: "R001", birthdate: "1990-03-15", recaptchaToken: "valid-resident-token" },
      path: "/api/auth/resident-login",
    });
    record(
      "Scenario 3a: Resident login with 'resident_login' action",
      "Proceeds successfully",
      mValidResidentLogin.passed ? "Proceeded successfully" : `Error: ${mValidResidentLogin.error?.message}`,
      mValidResidentLogin.passed
    );

    // Resident login rejecting 'login' action
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "login", // Incorrect action for resident login
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mRejectStaffActionOnResident = await runMiddleware(
      verifyRecaptcha({ expectedAction: "resident_login" }),
      {
        body: { residentId: "R001", birthdate: "1990-03-15", recaptchaToken: "token-with-login-action" },
        path: "/api/auth/resident-login",
      }
    );
    record(
      "Scenario 3b: Resident login rejects 'login' action",
      "403 Forbidden (action mismatch)",
      `HTTP ${mRejectStaffActionOnResident.status}: "${mRejectStaffActionOnResident.error?.message}"`,
      mRejectStaffActionOnResident.status === 403
    );

    // -----------------------------------------------------------------------
    // Scenario 4: Missing token -> 400
    // -----------------------------------------------------------------------
    const mMissingToken = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password" },
    });
    record(
      "Scenario 4: Missing token",
      "400 Bad Request",
      `HTTP ${mMissingToken.status}: "${mMissingToken.error?.message}"`,
      mMissingToken.status === 400
    );

    // -----------------------------------------------------------------------
    // Scenario 5: Invalid token -> 400
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mInvalidToken = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "invalid-token" },
    });
    record(
      "Scenario 5: Invalid token",
      "400 Bad Request",
      `HTTP ${mInvalidToken.status}: "${mInvalidToken.error?.message}"`,
      mInvalidToken.status === 400
    );

    // -----------------------------------------------------------------------
    // Scenario 6: Expired / reused token -> 400
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: false,
          "error-codes": ["timeout-or-duplicate"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mExpiredToken = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "expired-or-duplicate-token" },
    });
    record(
      "Scenario 6: Expired / reused token",
      "400 Bad Request",
      `HTTP ${mExpiredToken.status}: "${mExpiredToken.error?.message}"`,
      mExpiredToken.status === 400
    );

    // -----------------------------------------------------------------------
    // Scenario 7: Wrong action (register token sent to login) -> 403
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "register",
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mWrongAction = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "token-minted-for-register" },
    });
    record(
      "Scenario 7: Wrong action (register sent to login)",
      "403 Forbidden (action mismatch)",
      `HTTP ${mWrongAction.status}: "${mWrongAction.error?.message}"`,
      mWrongAction.status === 403
    );

    // -----------------------------------------------------------------------
    // Scenario 8: Low score (bot activity detected) -> 403
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.2,
          action: "login",
          hostname: "vaxcare.vercel.app",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mLowScore = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "low-score-bot-token" },
    });
    record(
      "Scenario 8: Low score (< 0.5)",
      "403 Forbidden (\"We couldn't verify this request. Please try again.\")",
      `HTTP ${mLowScore.status}: "${mLowScore.error?.message}"`,
      mLowScore.status === 403 && mLowScore.error?.message === "We couldn't verify this request. Please try again."
    );

    // -----------------------------------------------------------------------
    // Scenario 9: Wrong hostname -> 403
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "login",
          hostname: "phishing-site.example.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mWrongHostname = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "token-from-foreign-site" },
    });
    record(
      "Scenario 9: Wrong hostname",
      "403 Forbidden (hostname verification failed)",
      `HTTP ${mWrongHostname.status}: "${mWrongHostname.error?.message}"`,
      mWrongHostname.status === 403
    );

    // -----------------------------------------------------------------------
    // Scenario 10: Google unreachable (timeout / error) -> 503 fail closed
    // -----------------------------------------------------------------------
    global.fetch = async () => {
      const abortError = new Error("The operation was aborted due to timeout");
      abortError.name = "AbortError";
      throw abortError;
    };

    const mGoogleTimeout = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "any-token" },
    });
    record(
      "Scenario 10a: Google timeout (fail closed)",
      "503 Service Unavailable",
      `HTTP ${mGoogleTimeout.status}: "${mGoogleTimeout.error?.message}"`,
      mGoogleTimeout.status === 503
    );

    global.fetch = async () => {
      throw new Error("getaddrinfo ENOTFOUND https://www.google.com");
    };

    const mGoogleNetwork = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "any-token" },
    });
    record(
      "Scenario 10b: Google network error (fail closed)",
      "503 Service Unavailable",
      `HTTP ${mGoogleNetwork.status}: "${mGoogleNetwork.error?.message}"`,
      mGoogleNetwork.status === 503
    );

    // -----------------------------------------------------------------------
    // Scenario 11: CORS Origin Security Checks
    // -----------------------------------------------------------------------
    const allowed = ["https://vaxcare.vercel.app", "http://localhost:5173"];
    const blockedOrigin = await testCors("https://malicious-site.com", allowed);
    const allowedProdOrigin = await testCors("https://vaxcare.vercel.app", allowed);
    const allowedLocalOrigin = await testCors("http://localhost:5173", allowed);
    const allowedPreviewOrigin = await testCors("https://vaxcare-preview-abc123.vercel.app", allowed, true);

    record(
      "Scenario 11a: Unauthorized origin blocked by CORS",
      "Rejected by CORS",
      blockedOrigin ? "Allowed (Unexpected)" : "Rejected (Expected)",
      !blockedOrigin
    );
    record(
      "Scenario 11b: Production origin allowed by CORS",
      "Allowed by CORS",
      allowedProdOrigin ? "Allowed (Expected)" : "Rejected (Unexpected)",
      allowedProdOrigin
    );
    record(
      "Scenario 11c: Vercel preview origin allowed when enabled",
      "Allowed by CORS with ALLOW_VERCEL_PREVIEWS=true",
      allowedPreviewOrigin ? "Allowed (Expected)" : "Rejected (Unexpected)",
      allowedPreviewOrigin
    );

    // -----------------------------------------------------------------------
    // Scenario 12: Server misconfiguration (missing secret key) -> 500
    // -----------------------------------------------------------------------
    global.fetch = async () =>
      new globalThis.Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-secret"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const mServerMisconfig = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      body: { username: "admin", password: "password", recaptchaToken: "any-token" },
    });
    record(
      "Scenario 12: Secret key misconfigured on server",
      "500 Internal Server Error",
      `HTTP ${mServerMisconfig.status}: "${mServerMisconfig.error?.message}"`,
      mServerMisconfig.status === 500
    );

    // -----------------------------------------------------------------------
    // Scenario 13: Fly.io client IP resolution (Fly-Client-IP priority over raw X-Forwarded-For)
    // -----------------------------------------------------------------------
    const reqWithFlyHeader: any = {
      headers: {
        "fly-client-ip": "203.0.113.195",
        "x-forwarded-for": "198.51.100.1, 10.0.0.1", // Spoofed / unvalidated header
      },
      ip: "10.0.0.1",
      socket: { remoteAddress: "10.0.0.1" },
    };
    const ipResult = getClientIp(reqWithFlyHeader);
    const masked = truncateIp(ipResult);
    record(
      "Scenario 13a: Prioritizes Fly-Client-IP over raw X-Forwarded-For",
      "Resolved 203.0.113.195, masked to 203.0.113.xxx",
      `Resolved ${ipResult}, masked to ${masked}`,
      ipResult === "203.0.113.195" && masked === "203.0.113.xxx"
    );

    const reqWithoutFlyHeader: any = {
      headers: {},
      ip: "192.0.2.45", // req.ip derived from Express trust proxy = 1
      socket: { remoteAddress: "192.0.2.45" },
    };
    const ipFallback = getClientIp(reqWithoutFlyHeader);
    record(
      "Scenario 13b: Falls back to req.ip when Fly-Client-IP is absent",
      "Resolved 192.0.2.45",
      `Resolved ${ipFallback}`,
      ipFallback === "192.0.2.45"
    );

    // -----------------------------------------------------------------------
    // Scenario 14: Rate limiting enforcement (keyed by client IP)
    // -----------------------------------------------------------------------
    console.log("\n--- Testing Rate Limiter Middleware ---");
    // Create an isolated rate limiter with limit = 2 for quick testing
    const testLimiter = createRateLimiter({
      windowMs: 60000,
      max: 2,
      message: "Rate limit reached for test.",
    });

    const testIp = "198.51.100.50";
    const r1 = await runMiddleware(testLimiter, { headers: { "fly-client-ip": testIp } });
    const r2 = await runMiddleware(testLimiter, { headers: { "fly-client-ip": testIp } });
    const r3 = await runMiddleware(testLimiter, { headers: { "fly-client-ip": testIp } });

    record(
      "Scenario 14: IP-keyed Rate Limiter",
      "Request 1 & 2 pass, Request 3 rejected with HTTP 429",
      `R1=${r1.passed}, R2=${r2.passed}, R3=${r3.status} (${r3.responseBody?.error})`,
      r1.passed && r2.passed && r3.status === 429 && r3.responseBody?.error === "Rate limit reached for test."
    );

    // -----------------------------------------------------------------------
    // Scenario 15: Preflight OPTIONS requests skip verification
    // -----------------------------------------------------------------------
    const mPreflight = await runMiddleware(verifyRecaptcha({ expectedAction: "login" }), {
      method: "OPTIONS",
      body: {},
    });
    record(
      "Scenario 15: Preflight OPTIONS bypasses verification",
      "Passes through without error",
      mPreflight.passed ? "Preflight passed without verification" : "Failed",
      mPreflight.passed
    );
  } finally {
    global.fetch = originalFetch;
    process.env.RECAPTCHA_SECRET_KEY = originalSecret;
    process.env.RECAPTCHA_EXPECTED_HOSTNAME = originalHostname;
    process.env.RECAPTCHA_MIN_SCORE = originalMinScore;
  }

  console.log("\n=======================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`  Tests complete: ${totalPassed} / ${results.length} PASSED`);
  console.log("=======================================================\n");

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
