import "dotenv/config";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// DIRECT_URL is used for migrations (bypasses PgBouncer / transaction pooler).
// DATABASE_URL is the pooled connection used at runtime via the adapter.
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const runtimeUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

if (!migrationUrl) {
  // Only fail hard when running CLI commands, not during import resolution
  if (process.env.NODE_ENV !== "test") {
    console.error(
      "[prisma.config] WARNING: Neither DIRECT_URL nor DATABASE_URL is set."
    );
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Used by `prisma migrate deploy` and other CLI commands
    url: migrationUrl,
  },
});