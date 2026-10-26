import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "admin" | "worker" | "resident";

export interface AuthPayload {
  id: number;
  username: string;
  role: UserRole;
  residentId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const configuredSecret = process.env.JWT_SECRET;
if (!configuredSecret || configuredSecret.length < 32 || configuredSecret === "change-this-secret") {
  throw new Error(
    "JWT_SECRET must be configured with a unique random value of at least 32 characters."
  );
}
const JWT_SECRET = configuredSecret;

/** Verifies the Bearer token and attaches the decoded payload to req.user */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Restricts a route to a set of roles. Use after requireAuth. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

/** Lets a resident only access their own record; admin/worker pass through */
export function requireSelfOrStaff(residentIdParam = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role === "admin" || req.user.role === "worker") return next();
    if (req.user.role === "resident" && req.user.residentId === req.params[residentIdParam]) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden: not your record" });
  };
}

export { JWT_SECRET };
