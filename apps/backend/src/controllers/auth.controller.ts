import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { JWT_SECRET } from "../middleware/auth";

/** POST /api/auth/login  { username, password } — for admin/worker accounts */
export const staffLogin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) throw new ApiError(400, "username and password are required");

  const { rows } = await pool.query(
    `SELECT * FROM users WHERE username = $1 AND role IN ('admin', 'worker')`,
    [username]
  );
  const user = rows[0];
  if (!user) throw new ApiError(401, "Invalid username or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, "Invalid username or password");

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      avatar: user.avatar,
      title: user.title,
    },
  });
});

/** POST /api/auth/resident-login  { residentId, birthdate } — matches the "Resident ID + birthdate" flow */
export const residentLogin = asyncHandler(async (req: Request, res: Response) => {
  const { residentId, birthdate } = req.body;
  if (!residentId || !birthdate) throw new ApiError(400, "residentId and birthdate are required");

  const { rows } = await pool.query(
    `SELECT id, name, birthdate FROM residents WHERE id = $1`,
    [residentId]
  );
  const resident = rows[0];
  if (!resident) throw new ApiError(401, "Resident ID or birthdate not found");

  const storedDate = new Date(resident.birthdate).toISOString().slice(0, 10);
  if (storedDate !== birthdate) throw new ApiError(401, "Resident ID or birthdate not found");

  const token = jwt.sign(
    { id: resident.id, username: resident.id, role: "resident", residentId: resident.id },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      username: resident.id,
      displayName: resident.name,
      role: "resident",
      residentId: resident.id,
      avatar: resident.name.charAt(0),
      title: "Resident",
    },
  });
});
