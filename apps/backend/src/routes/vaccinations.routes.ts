import { Router } from "express";
import { requireAuth, requireRole, requireSelfOrStaff } from "../middleware/auth";
import {
  addVaccination,
  listVaccinationsForResident,
} from "../controllers/vaccinations.controller";

// Mounted at /api/residents/:id/vaccinations — see server.ts
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", requireSelfOrStaff(), listVaccinationsForResident);
router.post("/", requireRole("admin", "worker"), addVaccination);

export default router;
