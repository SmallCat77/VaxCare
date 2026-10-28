import { pool } from "../legacy/postgresql/pool";
import { PoolClient } from "pg";

export async function createNotification(
  type: "alert" | "info" | "warning" | "success",
  title: string,
  message: string,
  client?: PoolClient
): Promise<void> {
  const queryable = client || pool;
  await queryable.query(
    `INSERT INTO notifications (type, title, message) VALUES ($1, $2, $3)`,
    [type, title, message]
  );
}

/**
 * Checks a single stock item after an update and creates or updates a notification
 * if it has fallen below its minimum threshold. Deduplicates unread notifications
 * to prevent alert spam.
 */
export async function checkLowStock(stockId: string, client?: PoolClient): Promise<void> {
  const queryable = client || pool;
  const { rows } = await queryable.query(
    `SELECT name, quantity, min_stock FROM medical_supplies WHERE id = $1`,
    [stockId]
  );
  const stock = rows[0];
  if (!stock) return;

  if (stock.quantity <= stock.min_stock) {
    const isCritical = stock.quantity <= Math.floor(stock.min_stock / 2);
    const notifType = isCritical ? "alert" : "warning";
    const title = isCritical ? "Critical Stock Level" : "Low Inventory Warning";
    const message = `${stock.name} stock is below minimum (${stock.quantity} remaining, minimum ${stock.min_stock}).`;

    // Check if an unread alert already exists for this item
    const existing = await queryable.query(
      `SELECT id FROM notifications 
       WHERE read = false 
         AND message LIKE $1 
         AND (title IN ('Low Inventory Warning', 'Critical Stock Level') OR type IN ('warning', 'alert'))
       LIMIT 1`,
      [`%${stock.name}%`]
    );

    if (existing.rows.length > 0) {
      // Update existing unread notification message with current remaining quantity
      await queryable.query(
        `UPDATE notifications SET type = $1, title = $2, message = $3, created_at = now() WHERE id = $4`,
        [notifType, title, message, existing.rows[0].id]
      );
    } else {
      await createNotification(notifType, title, message, client);
    }
  }
}
