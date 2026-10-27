import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// If DATABASE_URL is set (e.g. Supabase's connection string), use it directly.
// Otherwise fall back to the individual DB_* vars for local Postgres.
const useConnectionString = !!process.env.DATABASE_URL;

export const pool = useConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required by Supabase's direct connection
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "vaxcare",
    });

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});