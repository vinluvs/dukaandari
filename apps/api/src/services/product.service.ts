import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  valuationMethod: z.enum(["WEIGHTED_AVERAGE", "FIFO", "LIFO"]).default("WEIGHTED_AVERAGE"),
  categoryId: z.string().uuid().optional(),
  uomId: z.string().uuid().optional(),
  gstPercentage: z.number().min(0).max(100).default(0),
  hsnCode: z.string().optional(),
  sellingPrice: z.number().min(0),
  purchasePrice: z.number().min(0),
  lowStockThreshold: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  openingStock: z.number().min(0).default(0),
});

export const ProductService = {
  async create(body: unknown, shopId: string) {
    const { openingStock, ...data } = ProductSchema.parse(body);
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: { ...data, shopId } });
      // Record opening stock in inventory log
      if (openingStock > 0) {
        await tx.inventoryLog.create({
          data: {
            shopId,
            productId: product.id,
            changeType: "opening",
            quantityChange: openingStock,
          },
        });
      }
      return product;
    });
  },

  async list({ shopId, query }: { shopId: string; query: Record<string, unknown> }) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 20), 100);
    const skip = (page - 1) * limit;

    const where = {
      shopId,
      isActive: true,
      ...(query["search"] ? { name: { contains: String(query["search"]), mode: "insensitive" as const } } : {}),
      ...(query["category_id"] ? { categoryId: String(query["category_id"]) } : {}),
    };

    const [items, total, allOffers] = await Promise.all([
      prisma.product.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { name: "asc" },
        include: { category: true, uom: true } 
      }),
      prisma.product.count({ where }),
      prisma.offer.findMany({
        where: {
          shopId,
          isActive: true,
          OR: [
            { startDate: { lte: new Date() } },
            { startDate: null as any }
          ],
          AND: [
            { OR: [{ endDate: { gte: new Date() } }, { endDate: null }] }
          ]
        }
      })
    ]);

    const itemsWithDetails = await Promise.all(
      items.map(async (p) => {
        const agg = await prisma.inventoryLog.aggregate({
          where: { productId: p.id },
          _sum: { quantityChange: true },
        });

        // Find applicable offers: product-specific or category-specific
        const applicableOffers = allOffers.filter(o => 
          o.productId === p.id || (o.categoryId && o.categoryId === p.categoryId)
        );

        return { 
          ...p, 
          currentStock: Number(agg._sum.quantityChange ?? 0),
          offers: applicableOffers
        };
      })
    );

    return { items: itemsWithDetails, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async update(id: string, body: unknown, shopId: string) {
    const { openingStock, ...data } = ProductSchema.partial().parse(body);
    const product = await prisma.product.findFirst({ where: { id, shopId } });
    if (!product) throw new AppError(404, "Product not found");
    return prisma.product.update({ where: { id }, data });
  },

  async deactivate(id: string, shopId: string) {
    const product = await prisma.product.findFirst({ where: { id, shopId } });
    if (!product) throw new AppError(404, "Product not found");
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  },
};
