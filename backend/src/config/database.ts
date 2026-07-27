import { PrismaClient } from '@prisma/client/index';

const prisma = new PrismaClient();

async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('Database connection established.');
}

export { prisma, connectDatabase };
