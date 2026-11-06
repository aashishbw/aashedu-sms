import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as { schoolDb?: PrismaClient };
export const db = globalDb.schoolDb ?? new PrismaClient({ adapter: new PrismaPg({connectionString:process.env.DATABASE_URL}) });
if (process.env.NODE_ENV !== "production") globalDb.schoolDb = db;
