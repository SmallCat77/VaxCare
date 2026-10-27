import { Router } from "express";
import { staffLogin, residentLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", staffLogin);
router.post("/resident-login", residentLogin);

export default router;
