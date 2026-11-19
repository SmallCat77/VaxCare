import { Router } from "express";
import { staffLogin, residentLogin, registerResident, registerStaff } from "../controllers/auth.controller";
import { verifyRecaptcha } from "../middleware/recaptcha";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Protect authentication and registration endpoints with IP rate limiting and server-side reCAPTCHA v3 verification
router.post("/login", authRateLimiter, verifyRecaptcha({ expectedAction: "login" }), staffLogin);
router.post("/resident-login", authRateLimiter, verifyRecaptcha({ expectedAction: "resident_login" }), residentLogin);
router.post("/register-resident", authRateLimiter, verifyRecaptcha({ expectedAction: "resident_register" }), registerResident);
router.post("/register-staff", authRateLimiter, verifyRecaptcha({ expectedAction: "staff_register" }), registerStaff);

export default router;
