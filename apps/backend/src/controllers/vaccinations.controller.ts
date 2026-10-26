import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { recalculateResidentStatus } from "../services/residentStatus.service";

/** POST /api/residents/:id/vaccinations */
export const addVaccination = asyncHandler(async (req: Request, res: Response) => {
  const { id: residentId } = req.params;
  const { vaccine, dose, date, worker, batchNo, site } = req.body;
  if (!vaccine || !dose || !date) throw new ApiError(400, "vaccine, dose, and date are required");

  const residentCheck = await pool.query(`SELECT id FROM residents WHERE id = $1`, [residentId]);
  if (!residentCheck.rows[0]) throw new ApiError(404, "Resident not found");

  const { rows } = await pool.query(
    `INSERT INTO vaccinations (resident_id, vaccine, dose, date, worker, batch_no, site)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [residentId, vaccine, dose, date, worker, batchNo, site]
  );

  // Keep resident.status in sync with their vaccination history
  await recalculateResidentStatus(residentId);

  res.status(201).json(rows[0]);
});

/** GET /api/residents/:id/vaccinations */
export const listVaccinationsForResident = asyncHandler(async (req: Request, res: Response) => {
  const { id: residentId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM vaccinations WHERE resident_id = $1 ORDER BY date DESC`,
    [residentId]
  );
  res.json(rows);
});
