import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const envDatabaseUrl = process.env.DATABASE_URL?.trim();
const fallbackDatabaseUrl =
  process.env.NODE_ENV !== "production"
    ? "postgresql://pmwa:pmwa@localhost:5432/pmwa?schema=public"
    : undefined;

const databaseUrl = envDatabaseUrl || fallbackDatabaseUrl;

if (!envDatabaseUrl && databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : undefined,
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
