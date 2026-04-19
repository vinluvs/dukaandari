const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    const logs = await prisma.inventoryLog.findMany({ where: { productId: p.id } });
    const sum = await prisma.inventoryLog.aggregate({
      where: { productId: p.id },
      _sum: { quantityChange: true }
    });
    console.log(`Product: ${p.name} (ID: ${p.id})`);
    console.log(`Logs: ${logs.length}, Total Stock: ${sum._sum.quantityChange ?? 0}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
