import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/index';
import pg from 'pg';
import { env } from './env.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPool() {
  const usesRemoteSsl =
    env.databaseUrl.includes('supabase') || env.databaseUrl.includes('sslmode=require');

  return new pg.Pool({
    connectionString: env.databaseUrl,
    ...(usesRemoteSsl ? { ssl: { rejectUnauthorized: false } } : {})
  });
}

const pool = createPool();
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
