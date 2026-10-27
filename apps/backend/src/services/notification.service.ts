import { pool } from "../legacy/postgresql/pool";

export async function createNotification(
  type: "alert" | "info" | "warning" | "success",
  title: string,
  message: string
): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (type, title, message) VALUES ($1, $2, $3)`,
    [type, title, message]
  );
}

/**
 * Checks a single stock item after an update and creates a notification
 * if it has fallen below its minimum threshold. Call this after any
 * quantity change in stock.controller.ts.
 */
export async function checkLowStock(stockId: string): Promise<void> {
  const { rows } = await pool.query(
    `SELECT name, quantity, min_stock FROM medical_supplies WHERE id = $1`,
    [stockId]
  );
  const stock = rows[0];
  if (!stock) return;

  if (stock.quantity < stock.min_stock) {
    await createNotification(
      "warning",
      "Low Inventory Warning",
      `${stock.name} stock is below minimum (${stock.quantity} remaining, minimum ${stock.min_stock}).`
    );
  }
}
