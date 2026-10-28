import { pool } from "../legacy/postgresql/pool";
import { PoolClient } from "pg";

/**
 * Recomputes a resident's `status` field from their vaccination history
 * and persists it. Call this any time a vaccination record is added.
 * Accepts an optional transaction client.
 */
export async function recalculateResidentStatus(
  residentId: string,
  client?: PoolClient
): Promise<void> {
  const queryable = client || pool;
  const { rows } = await queryable.query(
    `SELECT COUNT(*)::int AS count FROM vaccinations WHERE resident_id = $1`,
    [residentId]
  );
  const count = rows[0]?.count ?? 0;

  const status =
    count === 0 ? "Unvaccinated" : count === 1 ? "Partially Vaccinated" : "Fully Vaccinated";

  await queryable.query(`UPDATE residents SET status = $1 WHERE id = $2`, [status, residentId]);
}

/** Sets or clears next_due for a resident (e.g. when a schedule is created/completed) */
export async function setNextDue(residentId: string, nextDue: string | null): Promise<void> {
  await pool.query(`UPDATE residents SET next_due = $1 WHERE id = $2`, [nextDue, residentId]);
}
