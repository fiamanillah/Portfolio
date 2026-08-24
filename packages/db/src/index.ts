import { dbEnv } from "@workspace/env/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const connectionString = dbEnv.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (dbEnv.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "./generated/client";
