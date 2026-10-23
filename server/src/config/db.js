import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use DIRECT_URL for direct connections (bypasses PgBouncer / connection pooler).
// Falls back to DATABASE_URL if DIRECT_URL is not set.
const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error(
    "No database connection string found. " +
      "Set DATABASE_URL (or DIRECT_URL) in your .env file."
  );
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export default prisma;
