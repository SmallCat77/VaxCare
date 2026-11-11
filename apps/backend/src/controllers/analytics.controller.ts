import { Request, Response } from "express";
import { pool } from "../legacy/postgresql/pool";

export const getMonthlyVaccinations = async (_req: Request, res: Response) => {
  try {
    // We count actual vaccinations grouped by month (1 to 12) for the current year
    const query = `
      SELECT 
        to_char(date, 'Mon') as month,
        COUNT(*) as vaccinations,
        50 as target -- We can keep a static target or calculate it later
      FROM vaccinations
      WHERE extract(year from date) = extract(year from CURRENT_DATE)
      GROUP BY to_char(date, 'Mon'), extract(month from date)
      ORDER BY extract(month from date) ASC
    `;
    
    const { rows } = await pool.query(query);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    // Show from Jan up to current month or at least 6 months
    const displayMonths = months.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);

    const data = displayMonths.map(m => {
      const found = rows.find(r => r.month === m);
      return {
        month: m,
        vaccinations: found ? parseInt(found.vaccinations, 10) : 0,
        target: 50 // Default target
      };
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
