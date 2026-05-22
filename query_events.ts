import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.events.findMany({ where: { title: { contains: "Hội Chợ" } } });
  console.log(events.map(e => ({ id: e.id, status: e.status })));
}
main();
