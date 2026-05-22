import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function testConnection(): Promise<void> {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log('✅ Prisma connected');
}

export default prisma;
