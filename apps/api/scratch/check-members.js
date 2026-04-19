const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`\nUser: ${user.fullName} (${user.email})`);
    const memberships = await prisma.shopMember.findMany({
      where: { userId: user.id },
      include: { shop: true }
    });
    console.log(`Memberships: ${memberships.length}`);
    memberships.forEach(m => {
      console.log(`- Shop: ${m.shop.name} (${m.shopId}), Active: ${m.isActive}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
