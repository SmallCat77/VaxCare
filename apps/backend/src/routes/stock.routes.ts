import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { listStock, updateStock } from "../controllers/stock.controller";

const router = Router();

router.use(requireAuth);

// Any authenticated role (including residents) can view stock — the resident
// portal's "Vaccine Info" tab needs this. Only staff can mutate it.
router.get("/", listStock);
router.put("/:id", requireRole("admin", "worker"), updateStock);

export default router;
