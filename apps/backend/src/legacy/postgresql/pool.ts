import { Pool } from "pg";
import dotenv from "dotenv";
import { executeFallbackQuery } from "./localStore";

dotenv.config();

// If DATABASE_URL is set (e.g. Supabase's connection string), use it directly.
// Otherwise fall back to the individual DB_* vars for local Postgres.
const useConnectionString = !!process.env.DATABASE_URL;

const rawPool = useConnectionString
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

let useFallback = false;
let checkDone = false;

rawPool.on("error", (err: any) => {
  if (useFallback) return;
  console.warn("[VaxCare Postgres] Background client notice:", err?.message || err);
});

export const pool = {
  ...rawPool,
  query: async (text: string, params: any[] = []): Promise<any> => {
    if (useFallback) {
      return executeFallbackQuery(text, params);
    }

    try {
      const res = await rawPool.query(text, params);
      if (!checkDone) {
        checkDone = true;
        console.log("[VaxCare] Successfully connected to PostgreSQL database.");
      }
      return res;
    } catch (err: any) {
      const isConnError =
        err.code === "ECONNREFUSED" ||
        err.code === "ENOTFOUND" ||
        err.code === "EAI_AGAIN" ||
        err.code === "28P01" ||
        err.code === "3D000" ||
        err.message?.includes("connect ECONNREFUSED") ||
        err.message?.includes("Connection terminated") ||
        err.message?.includes("password authentication failed") ||
        err.message?.includes("database") && err.message?.includes("does not exist");

      if (isConnError) {
        if (!useFallback) {
          useFallback = true;
          checkDone = true;
          console.warn("[VaxCare] Local PostgreSQL is offline or unreachable. Automatically using built-in development database.");
        }
        return executeFallbackQuery(text, params);
      }

      throw err;
    }
  },
  on: rawPool.on.bind(rawPool),
  connect: rawPool.connect.bind(rawPool),
  end: rawPool.end.bind(rawPool),
};

export default pool;
