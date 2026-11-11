import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";
import { getClientIp } from "./recaptcha";

/**
 * Creates an IP-keyed rate limiter with Fly.io client IP support and IPv6 normalization.
 */
export function createRateLimiter(options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}) {
  const windowMs =
    options?.windowMs ??
    parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10); // 15 minutes default

  const max =
    options?.max ??
    parseInt(process.env.RATE_LIMIT_MAX || "10", 10); // 10 requests default

  const message =
    options?.message || "Too many requests from this IP address. Please try again later.";

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in standard `RateLimit-*` headers
    legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
    // Key by the real client IP (Fly-Client-IP header on Fly.io or req.ip via trust proxy = 1), normalized for IPv4 & IPv6
    keyGenerator: (req: Request) => {
      const ip = getClientIp(req) || req.ip || "127.0.0.1";
      return ipKeyGenerator(ip);
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: message });
    },
  });
}

/**
 * Rate limiter for authentication endpoints (/login, /resident-login).
 * Defaults: 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10),
  message: "Too many login attempts from this IP address. Please try again after 15 minutes.",
});

/**
 * Rate limiter for resident registration endpoint (POST /api/residents).
 * Defaults: 20 registrations per 15 minutes per IP.
 */
export const registerRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX || "20", 10),
  message: "Too many resident registrations created from this IP. Please try again later.",
});
