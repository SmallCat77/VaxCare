import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { recalculateResidentStatus } from "../services/residentStatus.service";
import { checkLowStock } from "../services/notification.service";

/** POST /api/residents/:id/vaccinations */
export const addVaccination = asyncHandler(async (req: Request, res: Response) => {
  const { id: residentId } = req.params;
  const { vaccine, dose, date, worker, batchNo, site, supplyId } = req.body;
  if (!vaccine || !dose || !date) throw new ApiError(400, "vaccine, dose, and date are required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify resident exists (lock FOR SHARE to prevent deletion during transaction)
    const residentCheck = await client.query(
      `SELECT id FROM residents WHERE id = $1 FOR SHARE`,
      [residentId]
    );
    if (!residentCheck.rows[0]) {
      throw new ApiError(404, "Resident not found");
    }

    // 2. Identify the medical supply item and acquire row lock (FOR UPDATE)
    let stockResult;
    if (supplyId) {
      stockResult = await client.query(
        `SELECT id, name, quantity, min_stock FROM medical_supplies WHERE id = $1 FOR UPDATE`,
        [supplyId]
      );
    } else {
      // First try exact match on name
      stockResult = await client.query(
        `SELECT id, name, quantity, min_stock FROM medical_supplies WHERE name = $1 FOR UPDATE`,
        [vaccine]
      );
      // Fallback: prefix or contains match to support shorthand (e.g. "Influenza" -> "Influenza (Quadrivalent)")
      if (!stockResult.rows[0]) {
        stockResult = await client.query(
          `SELECT id, name, quantity, min_stock FROM medical_supplies 
           WHERE name ILIKE $1 || '%' OR $1 ILIKE name || '%'
           ORDER BY (name = $1) DESC, id ASC 
           LIMIT 1 
           FOR UPDATE`,
          [vaccine]
        );
      }
    }

    const stock = stockResult.rows[0];
    if (!stock) {
      throw new ApiError(400, `Vaccine '${vaccine}' not found in medical supplies inventory`);
    }

    // 3. Ensure stock cannot become negative
    if (stock.quantity <= 0) {
      throw new ApiError(400, `Cannot record vaccination: '${stock.name}' is out of stock (0 remaining)`);
    }

    // 4. Safely deduct 1 dose with condition quantity > 0
    const deductResult = await client.query(
      `UPDATE medical_supplies 
       SET quantity = quantity - 1 
       WHERE id = $1 AND quantity > 0 
       RETURNING id, name, quantity, min_stock`,
      [stock.id]
    );

    if (deductResult.rowCount === 0) {
      throw new ApiError(400, `Concurrent inventory conflict: insufficient stock for '${stock.name}'`);
    }

    // 5. Insert vaccination record
    const { rows } = await client.query(
      `INSERT INTO vaccinations (resident_id, vaccine, dose, date, worker, batch_no, site)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [residentId, vaccine, dose, date, worker, batchNo, site]
    );

    // 6. Recalculate resident status within the transaction
    await recalculateResidentStatus(residentId, client);

    // 7. Check low stock threshold and trigger alert (with deduplication) within transaction
    await checkLowStock(stock.id, client);

    // 8. Commit transaction
    await client.query("COMMIT");

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
