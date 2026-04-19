import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const OfferSchema = z.object({
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  minQuantity: z.number().min(0).default(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

const AutoOfferConfigSchema = z.object({
  lookbackDays: z.number().int().min(1).default(30),
  limit: z.number().int().min(1).default(10),
  discountPercentage: z.number().min(1).max(100).default(10),
});

export const OfferService = {
  async list(shopId: string) {
    return prisma.offer.findMany({
      where: { shopId },
      include: { product: { select: { name: true, sku: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(shopId: string, body: unknown) {
    const data = OfferSchema.parse(body);
    return prisma.offer.create({
      data: {
        ...data,
        shopId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  },

  async update(id: string, shopId: string, body: unknown) {
    const data = OfferSchema.partial().parse(body);
    const offer = await prisma.offer.findFirst({ where: { id, shopId } });
    if (!offer) throw new AppError(404, "Offer not found");

    return prisma.offer.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  },

  async delete(id: string, shopId: string) {
    const offer = await prisma.offer.findFirst({ where: { id, shopId } });
    if (!offer) throw new AppError(404, "Offer not found");
    await prisma.offer.delete({ where: { id } });
  },

  async getConfig(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { autoOfferConfig: true },
    });
    return (shop?.autoOfferConfig as any) || { lookbackDays: 30, limit: 10, discountPercentage: 10 };
  },

  async updateConfig(shopId: string, body: unknown) {
    const config = AutoOfferConfigSchema.parse(body);
    return prisma.shop.update({
      where: { id: shopId },
      data: { autoOfferConfig: config as any },
    });
  },

  async generateAutoOffers(shopId: string) {
    const config = await this.getConfig(shopId);
    const lookbackDays = config.lookbackDays || 30;
    const limit = config.limit || 10;
    const discountPercent = config.discountPercentage || 10;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    // SQL to find products with least sales in last X days
    // We include products with 0 sales by left joining
    const slowMovingProducts: any[] = await prisma.$queryRaw`
      SELECT 
        p.id, 
        p.name, 
        COALESCE(SUM(ii.quantity), 0) as "totalSold"
      FROM products p
      LEFT JOIN invoice_items ii ON p.id = ii.product_id
      LEFT JOIN invoices i ON ii.invoice_id = i.id 
        AND i.created_at >= ${startDate} 
        AND i.status = 'active'
      WHERE p.shop_id = ${shopId} AND p.is_active = true
      GROUP BY p.id, p.name
      ORDER BY "totalSold" ASC
      LIMIT ${limit}
    `;

    const offersCreated = [];

    for (const p of slowMovingProducts) {
      // Check if product already has an active auto-offer
      const existing = await prisma.offer.findFirst({
        where: {
          shopId,
          productId: p.id,
          isAutoOffer: true,
          isActive: true,
        },
      });

      if (!existing) {
        const offer = await prisma.offer.create({
          data: {
            shopId,
            productId: p.id,
            name: `Auto Offer: ${p.name}`,
            discountType: "PERCENTAGE",
            discountValue: discountPercent,
            isAutoOffer: true,
            isActive: true,
          },
        });
        offersCreated.push(offer);
      }
    }

    return { 
      message: `Created ${offersCreated.length} auto offers`, 
      offers: offersCreated,
      totalSlowProductsFound: slowMovingProducts.length 
    };
  },
};
