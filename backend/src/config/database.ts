import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/index';
import { env } from './env.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: env.databaseUrl
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('Database connection established.');
}

export { prisma, connectDatabase };
