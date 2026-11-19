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

/** POST /api/auth/register-resident  { name, birthdate, gender, age, address, phone, purok } */
export const registerResident = asyncHandler(async (req: Request, res: Response) => {
  const { name, birthdate, age, gender, address, phone, purok } = req.body;
  if (!name || !birthdate) throw new ApiError(400, "Full Name and Date of Birth are required");

  // Generate next resident ID
  const countRes = await pool.query(`SELECT id FROM residents ORDER BY id DESC LIMIT 1`);
  let nextNum = 1;
  if (countRes.rows.length > 0) {
    const lastId = countRes.rows[0].id;
    const match = String(lastId).match(/\d+/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  const id = `R${String(nextNum).padStart(3, "0")}`;

  let computedAge = Number(age);
  if (!computedAge) {
    const bDate = new Date(birthdate);
    const diff = Date.now() - bDate.getTime();
    computedAge = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
  }

  const { rows } = await pool.query(
    `INSERT INTO residents (id, name, age, gender, birthdate, address, phone, purok, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Unvaccinated') RETURNING *`,
    [id, name.trim(), computedAge, gender || "Female", birthdate.slice(0, 10), address || "", phone || "", purok || "Purok 1"]
  );
  const resident = rows[0];

  const token = jwt.sign(
    { id: resident.id, username: resident.id, role: "resident", residentId: resident.id },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.status(201).json({
    token,
    residentId: resident.id,
    user: {
      username: resident.id,
      displayName: resident.name,
      role: "resident",
      residentId: resident.id,
      avatar: resident.name.charAt(0).toUpperCase() || "R",
      title: "Resident",
    },
  });
});

/** POST /api/auth/register-staff  { username, password, displayName, role, title } */
export const registerStaff = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, displayName, role = "worker", title } = req.body;
  if (!username || !password || !displayName) {
    throw new ApiError(400, "Username, password, and full name are required");
  }

  const existing = await pool.query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [username.trim()]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, "Username already registered");
  }

  const hash = await bcrypt.hash(password, 10);
  const avatar = displayName.trim().charAt(0).toUpperCase() || "S";
  const staffTitle = title || (role === "admin" ? "Barangay Health Officer" : "Registered Nurse");

  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, display_name, role, avatar, title)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, display_name, role, avatar, title`,
    [username.trim(), hash, displayName.trim(), role === "admin" ? "admin" : "worker", avatar, staffTitle]
  );
  const user = rows[0];

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.status(201).json({
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
