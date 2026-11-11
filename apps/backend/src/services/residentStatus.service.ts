import { pool } from "../legacy/postgresql/pool";

/**
 * Recomputes a resident's `status` field from their vaccination history
 * and persists it. Call this any time a vaccination record is added.
 *
 * NOTE: the actual "fully vs partially vaccinated" rule depends on your
 * clinic's vaccine schedule definitions. This is a simple placeholder rule
 * (0 records = Unvaccinated, 1 = Partially, 2+ = Fully) — swap in your real
 * dose-schedule logic once you define it per vaccine.
 */
export async function recalculateResidentStatus(residentId: string): Promise<void> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM vaccinations WHERE resident_id = $1`,
    [residentId]
  );
  const count = rows[0]?.count ?? 0;

  const status =
    count === 0 ? "Unvaccinated" : count === 1 ? "Partially Vaccinated" : "Fully Vaccinated";

  await pool.query(`UPDATE residents SET status = $1 WHERE id = $2`, [status, residentId]);
}

/** Sets or clears next_due for a resident (e.g. when a schedule is created/completed) */
export async function setNextDue(residentId: string, nextDue: string | null): Promise<void> {
  await pool.query(`UPDATE residents SET next_due = $1 WHERE id = $2`, [nextDue, residentId]);
}
