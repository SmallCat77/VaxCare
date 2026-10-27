import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

/** GET /api/schedules */
export const listSchedules = asyncHandler(async (req: Request, res: Response) => {
  const baseQuery = `SELECT s.id, s.scheduled_date, s.appointment_type, s.details, s.status, s.worker, s.purok,
                            r.id as resident_id, r.name as resident_name, r.phone
                     FROM schedules s
                     JOIN residents r ON s.resident_id = r.id`;
  // Never expose other residents' appointment details to a resident account.
  const result = req.user?.role === "resident"
    ? await pool.query(`${baseQuery} WHERE s.resident_id = $1 ORDER BY s.scheduled_date ASC`, [req.user.residentId])
    : await pool.query(`${baseQuery} ORDER BY s.scheduled_date ASC`);
  res.json(result.rows);
});

/** POST /api/schedules */
export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id, residentId, appointmentType, details, scheduledDate, worker, purok } = req.body;
  if (!id || !residentId || !appointmentType || !scheduledDate) {
    throw new ApiError(400, "id, residentId, appointmentType, and scheduledDate are required");
  }

  const { rows } = await pool.query(
    `INSERT INTO schedules (id, resident_id, appointment_type, details, scheduled_date, worker, purok)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, residentId, appointmentType, details, scheduledDate, worker, purok]
  );
  res.status(201).json(rows[0]);
});

/** PUT /api/schedules/:id — update status (Upcoming/Completed/Missed/Rescheduled) */
export const updateScheduleStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["Upcoming", "Completed", "Missed", "Rescheduled"];
  if (!valid.includes(status)) throw new ApiError(400, `status must be one of: ${valid.join(", ")}`);

  const { rows } = await pool.query(
    `UPDATE schedules SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!rows[0]) throw new ApiError(404, "Schedule not found");
  res.json(rows[0]);
});
