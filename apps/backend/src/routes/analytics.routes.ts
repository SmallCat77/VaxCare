import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMonthlyVaccinations } from "../controllers/analytics.controller";

const router = Router();

router.use(requireAuth);

router.get("/monthly-vaccinations", getMonthlyVaccinations);

export default router;
