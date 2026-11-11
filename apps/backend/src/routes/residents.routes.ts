import { Router } from "express";
import { requireAuth, requireRole, requireSelfOrStaff } from "../middleware/auth";
import { verifyRecaptcha } from "../middleware/recaptcha";
import { registerRateLimiter } from "../middleware/rateLimiter";
import {
  listResidents,
  getResident,
  createResident,
  updateResident,
} from "../controllers/residents.controller";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("admin", "worker"), listResidents);
router.get("/:id", requireSelfOrStaff(), getResident);
router.post(
  "/",
  requireRole("admin", "worker"),
  registerRateLimiter,
  verifyRecaptcha({ expectedAction: "register" }),
  createResident
);
router.put("/:id", requireRole("admin", "worker"), updateResident);

export default router;
