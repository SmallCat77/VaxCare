import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

// GET /api/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT id, username, display_name, role, avatar, title, created_at FROM users WHERE role IN ('admin', 'worker') ORDER BY created_at ASC`
  );
  
  const mapped = rows.map(r => ({
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    role: r.role,
    avatar: r.avatar,
    title: r.title,
    createdAt: r.created_at
  }));
  
  res.json(mapped);
});

// POST /api/users
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, displayName, role, title } = req.body;
  if (!username || !password || !displayName || !role) {
    throw new ApiError(400, "Missing required fields");
  }

  if (role !== "admin" && role !== "worker") {
    throw new ApiError(400, "Invalid role. Must be 'admin' or 'worker'");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const avatar = displayName.charAt(0).toUpperCase();

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, display_name, role, avatar, title) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, display_name, role, avatar, title, created_at`,
      [username, passwordHash, displayName, role, avatar, title]
    );

    const r = rows[0];
    res.status(201).json({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      role: r.role,
      avatar: r.avatar,
      title: r.title,
      createdAt: r.created_at
    });
  } catch (err: any) {
    if (err.code === "23505") { // unique violation
      throw new ApiError(409, "Username already exists");
    }
    throw err;
  }
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { displayName, role, title } = req.body;
  
  if (!displayName || !role) {
    throw new ApiError(400, "Missing required fields");
  }

  const avatar = displayName.charAt(0).toUpperCase();

  const { rows } = await pool.query(
    `UPDATE users SET display_name = $1, role = $2, title = $3, avatar = $4 WHERE id = $5 RETURNING id, username, display_name, role, avatar, title, created_at`,
    [displayName, role, title, avatar, id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "User not found");
  }

  const r = rows[0];
  res.json({
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    role: r.role,
    avatar: r.avatar,
    title: r.title,
    createdAt: r.created_at
  });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  
  // Prevent deleting oneself
  if ((req as any).user.id.toString() === id) {
    throw new ApiError(400, "Cannot delete your own account");
  }

  const { rowCount } = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  if (rowCount === 0) {
    throw new ApiError(404, "User not found");
  }
  
  res.json({ message: "User deleted successfully" });
});

// PUT /api/users/:id/password
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    throw new ApiError(400, "newPassword is required");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const { rowCount } = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [passwordHash, id]
  );

  if (rowCount === 0) {
    throw new ApiError(404, "User not found");
  }

  res.json({ message: "Password updated successfully" });
});
