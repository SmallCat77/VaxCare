import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { checkLowStock } from "../services/notification.service";

/** GET /api/stock */
export const listStock = asyncHandler(async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`SELECT * FROM medical_supplies ORDER BY name`);
  res.json(rows);
});

/** PUT /api/stock/:id — update quantity (e.g. restock or deduct on use) */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, minStock, expiryDate, manufacturer, lastRestocked } = req.body;

  const { rows } = await pool.query(
    `UPDATE medical_supplies
     SET quantity = COALESCE($1, quantity),
         min_stock = COALESCE($2, min_stock),
         expiry_date = COALESCE($3, expiry_date),
         manufacturer = COALESCE($4, manufacturer),
         last_restocked = COALESCE($5, last_restocked)
     WHERE id = $6 RETURNING *`,
    [quantity, minStock, expiryDate, manufacturer, lastRestocked, id]
  );
  if (!rows[0]) throw new ApiError(404, "Stock item not found");

  // Fires a low-stock notification if the new quantity dips below min_stock
  await checkLowStock(id);

  res.json(rows[0]);
});
