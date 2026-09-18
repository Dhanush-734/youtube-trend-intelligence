/**
 * Cross-platform Database Migration Script
 * Reads DATABASE_URL and executes db/schema.sql to set up tables and indexes.
 *
 * Usage:
 *   node scripts/setup-db.mjs
 *   or: DATABASE_URL="postgresql://..." node scripts/setup-db.mjs
 */

import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

// Try loading .env.local if DATABASE_URL is not already set in environment
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        databaseUrl = trimmed.substring("DATABASE_URL=".length).trim();
        // Remove quotes if present
        if (
          (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) ||
          (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))
        ) {
          databaseUrl = databaseUrl.slice(1, -1);
        }
        break;
      }
    }
  }
}

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL environment variable is missing.");
  console.error("Please provide it in .env.local or via command line:");
  console.error('  DATABASE_URL="postgresql://..." npm run db:migrate');
  process.exit(1);
}

const isLocal =
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1") ||
  databaseUrl.includes("sslmode=disable");

const client = new Client({
  connectionString: databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function run() {
  console.log("🔌 Connecting to PostgreSQL database...");
  try {
    await client.connect();
    console.log(" Connected to database.");

    const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log(" Applying database schema (db/schema.sql)...");

    await client.query(schemaSql);

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('channels', 'categories', 'videos', 'video_snapshots', 'collection_runs')
      ORDER BY table_name;
    `);

    console.log("\n Tables verified in database:");
    for (const row of res.rows) {
      console.log(`  - ${row.table_name}`);
    }

    console.log("\n Database migration completed successfully!");
  } catch (err) {
    console.error("\n❌ Migration failed with error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
