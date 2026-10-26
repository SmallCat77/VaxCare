import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

/** GET /api/residents */
export const listResidents = asyncHandler(async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`SELECT * FROM residents ORDER BY name`);
  res.json(rows);
});

/** GET /api/residents/:id  — includes nested vaccination history */
export const getResident = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const residentResult = await pool.query(`SELECT * FROM residents WHERE id = $1`, [id]);
  const resident = residentResult.rows[0];
  if (!resident) throw new ApiError(404, "Resident not found");

  const vaxResult = await pool.query(
    `SELECT * FROM vaccinations WHERE resident_id = $1 ORDER BY date DESC`,
    [id]
  );

  res.json({ ...resident, vaccinations: vaxResult.rows });
});

/** POST /api/residents */
export const createResident = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, age, gender, birthdate, address, phone, purok } = req.body;
  if (!id || !name || !birthdate) throw new ApiError(400, "id, name, and birthdate are required");

  const { rows } = await pool.query(
    `INSERT INTO residents (id, name, age, gender, birthdate, address, phone, purok)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, name, age, gender, birthdate, address, phone, purok]
  );
  res.status(201).json(rows[0]);
});

/** PUT /api/residents/:id */
export const updateResident = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, age, gender, address, phone, purok } = req.body;

  const { rows } = await pool.query(
    `UPDATE residents SET name = $1, age = $2, gender = $3, address = $4, phone = $5, purok = $6
     WHERE id = $7 RETURNING *`,
    [name, age, gender, address, phone, purok, id]
  );
  if (!rows[0]) throw new ApiError(404, "Resident not found");
  res.json(rows[0]);
});
