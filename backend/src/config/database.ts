import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/index';
import pg from 'pg';
import { env } from './env.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const pool = new pg.Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('Database connection established.');
}

export { prisma, connectDatabase };
