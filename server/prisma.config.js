import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Falls back safely if the terminal hasn't loaded the env yet
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
