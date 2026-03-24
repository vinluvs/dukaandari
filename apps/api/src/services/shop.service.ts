import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const CreateShopSchema = z.object({
  name: z.string().min(2),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  financialYearStartMonth: z.number().min(1).max(12).default(4),
});

export const ShopService = {
  async create(body: unknown, userId: string) {
    const data = CreateShopSchema.parse(body);
    return prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { ...data, ownerId: userId },
      });
      // Auto-add creator as owner member
      await tx.shopMember.create({
        data: { shopId: shop.id, userId, role: "owner" },
      });
      return shop;
    });
  },

  async listForUser(userId: string) {
    const memberships = await prisma.shopMember.findMany({
      where: { userId, isActive: true },
      include: { shop: true },
    });
    return memberships.map((m) => m.shop);
  },

  async getById(shopId: string) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new AppError(404, "Shop not found");
    return shop;
  },

  async update(shopId: string, body: unknown) {
    const data = z.object({
      name: z.string().min(2).optional(),
      gstNumber: z.string().optional(),
      address: z.string().optional(),
      financialYearStartMonth: z.number().min(1).max(12).optional(),
    }).parse(body);
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new AppError(404, "Shop not found");
    return prisma.shop.update({ where: { id: shopId }, data });
  },
};
