import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

/** GET /api/notifications */
export const listNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC`);
  res.json(rows);
});

/** PUT /api/notifications/:id/read */
export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `UPDATE notifications SET read = true WHERE id = $1 RETURNING *`,
    [id]
  );
  if (!rows[0]) throw new ApiError(404, "Notification not found");
  res.json(rows[0]);
});
