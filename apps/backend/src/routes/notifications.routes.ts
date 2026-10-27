import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { listNotifications, markRead } from "../controllers/notifications.controller";

const router = Router();

router.use(requireAuth, requireRole("admin", "worker"));

router.get("/", listNotifications);
router.put("/:id/read", markRead);

export default router;
