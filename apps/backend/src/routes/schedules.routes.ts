import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  listSchedules,
  createSchedule,
  updateScheduleStatus,
} from "../controllers/schedules.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listSchedules);
router.post("/", requireRole("admin", "worker"), createSchedule);
router.put("/:id", requireRole("admin", "worker"), updateScheduleStatus);

export default router;
