import { Router } from "express";
import { staffLogin, residentLogin } from "../controllers/auth.controller";
import { verifyRecaptcha } from "../middleware/recaptcha";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Protect both authentication endpoints with IP rate limiting and server-side reCAPTCHA v3 verification
router.post("/login", authRateLimiter, verifyRecaptcha({ expectedAction: "login" }), staffLogin);
router.post("/resident-login", authRateLimiter, verifyRecaptcha({ expectedAction: "resident_login" }), residentLogin);

export default router;
