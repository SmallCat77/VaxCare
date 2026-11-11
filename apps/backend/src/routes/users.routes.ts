import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getUsers, createUser, updateUser, deleteUser, updatePassword } from "../controllers/users.controller";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

router.use(requireAuth); // Must be logged in

// Only admins can do CRUD on users
router.get("/", requireRole("admin"), getUsers);
router.post("/", requireRole("admin"), createUser);
router.put("/:id", requireRole("admin"), updateUser);
router.delete("/:id", requireRole("admin"), deleteUser);

// Allow users to update their own password, OR admin to update any password
router.put("/:id/password", (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin" && req.user?.id?.toString() !== req.params.id) {
    return next(new ApiError(403, "Forbidden. Can only update your own password."));
  }
  next();
}, updatePassword);

export default router;
