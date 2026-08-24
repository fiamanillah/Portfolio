import { dbEnv } from "@workspace/env/db";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbEnv.DATABASE_URL,
  },
});
