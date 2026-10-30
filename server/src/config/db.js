import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ── Connection Strategy ──
// DATABASE_URL  → Supabase Transaction Pooler (port 6543, PgBouncer)
//               → Used at RUNTIME by the application (all queries)
//
// DIRECT_URL    → Supabase Direct Connection (port 5432)
//               → Used by `prisma migrate deploy` in prisma.config.js
//               → NOT used here; PrismaPg adapter works fine with the pooler
//               → provided the schema does NOT use prepared statements
//               → (Prisma's pg adapter does not use prepared statements)
//
// PgBouncer (transaction mode) is compatible with the @prisma/adapter-pg
// because the adapter uses a standard pg.Pool which issues ad-hoc queries,
// not extended-query / prepared-statement protocol.

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

if (!connectionString) {
  throw new Error(
    "[db] No database connection string found. " +
      "Set DATABASE_URL (and optionally DIRECT_URL) in your environment."
  );
}

// Validate it looks like a postgres URL to catch obvious misconfiguration early
if (!connectionString.startsWith("postgres")) {
  throw new Error(
    `[db] DATABASE_URL does not look like a PostgreSQL connection string: "${connectionString.slice(0, 30)}…"`
  );
}

const pool = new Pool({
  connectionString,
  // Supabase Supavisor (transaction pooler) recommends max 10 connections
  // per application instance to avoid exhausting the pooler limit.
  max: parseInt(process.env.DB_POOL_MAX ?? "10", 10),
  // Always connect over TLS when talking to Supabase
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
});

export default prisma;
