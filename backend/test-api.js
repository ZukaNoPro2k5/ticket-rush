const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.log("No admin found");
    return;
  }
  const fetch = require('node-fetch');
  
  console.log("Testing /admin/today-stats...");
  const res1 = await fetch('http://localhost:4000/api/admin/today-stats', {
    headers: { 'Authorization': `Bearer ${admin.token}` }
  });
  console.log("today-stats:", await res1.json());
  
  console.log("Testing /admin/business-report...");
  const res2 = await fetch('http://localhost:4000/api/admin/business-report', {
    headers: { 'Authorization': `Bearer ${admin.token}` }
  });
  console.log("business-report:", await res2.json());
}

main().catch(console.error).finally(() => prisma.$disconnect());
