import { Pool, types } from "pg";

// node-postgres returns BIGINT (oid 20) as a string to avoid precision loss.
// Our view counts are far below Number.MAX_SAFE_INTEGER, so parse to number
// and keep the rest of the codebase free of string maths.
types.setTypeParser(20, (v) => Number(v));
// NUMERIC (oid 1700) — engagement rates etc.
types.setTypeParser(1700, (v) => Number(v));

declare global {
  // eslint-disable-next-line no-var
  var __txPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local");
  }
  return new Pool({
    connectionString,
    // Supabase / Neon require TLS; local Postgres (localhost or 127.0.0.1) does not.
    ssl:
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1") ||
      connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

/**
 * Lazy. If the pool were created at import time, `next build` would crash while
 * collecting page data whenever DATABASE_URL is absent from the build
 * environment. It also lets the pool survive dev hot reloads instead of leaking
 * a new set of connections on every file save.
 */
export function getPool(): Pool {
  if (!global.__txPool) global.__txPool = createPool();
  return global.__txPool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query(text, params as never[]);
  return res.rows as T[];
}
