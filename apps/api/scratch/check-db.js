const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shops = await prisma.shop.findMany();
  for (const shop of shops) {
    console.log(`\nChecking products for Shop: ${shop.name} (${shop.id})`);
    const where = {
      shopId: shop.id,
      isActive: true,
    };
    const products = await prisma.product.findMany({ where });
    console.log(`Found ${products.length} active products.`);
    products.forEach(p => console.log(`- ${p.name} (SKU: ${p.sku})`));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
