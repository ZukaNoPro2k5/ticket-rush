import prisma from '../../config/prisma';

export async function listEnabledPaymentMethods() {
  const methods = await prisma.payment_gateways.findMany({
    where: { enabled: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  });
  const priority = new Map([['vnpay', 0], ['momo', 1], ['stripe', 2]]);
  return methods.sort((a, b) => (priority.get(a.id) ?? 99) - (priority.get(b.id) ?? 99) || a.name.localeCompare(b.name));
}
