import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from local directory or workspace root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/backend/.env") });

import authRoutes from "./routes/auth.routes";
import residentsRoutes from "./routes/residents.routes";
import vaccinationsRoutes from "./routes/vaccinations.routes";
import stockRoutes from "./routes/stock.routes";
import analyticsRoutes from "./routes/analytics.routes";
import schedulesRoutes from "./routes/schedules.routes";
import notificationsRoutes from "./routes/notifications.routes";
import usersRoutes from "./routes/users.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// Trust 1 reverse proxy hop (Fly.io terminates TLS at its edge proxy and forwards Fly-Client-IP and X-Forwarded-For)
app.set("trust proxy", 1);

// Allowed frontend origins for CORS (Vercel production URL, local dev, plus optional Vercel previews)
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ALLOW_VERCEL_PREVIEWS defaults to false. Must remain OFF (false) in production.
// Preview deployments get dynamic subdomains that cannot validate production reCAPTCHA tokens.
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";

app.use(cors({
  origin(origin, callback) {
    // Permit non-browser requests (Fly.io health checks, curl) without an Origin header
    if (!origin) return callback(null, true);

    // Exact origin match (e.g. https://vaxcare.vercel.app or http://localhost:5173)
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Optional environment-driven rule to support Vercel preview deployments (*.vercel.app)
    if (allowVercelPreviews && /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-recaptcha-token"],
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/residents", residentsRoutes);
// Nested: /api/residents/:id/vaccinations
app.use("/api/residents/:id/vaccinations", vaccinationsRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Must be registered last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VaxCare backend running on http://localhost:${PORT}`);
});
