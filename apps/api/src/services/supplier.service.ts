import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  gstNumber: z.string().optional().nullable(),
});

export const SupplierService = {
  async create(body: unknown, shopId: string) {
    const data = Schema.parse(body);
    return prisma.supplier.create({ data: { ...data, shopId } });
  },
  async list({ shopId, query }: { shopId: string; query: Record<string, unknown> }) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 20), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.supplier.findMany({ where: { shopId, isActive: true }, skip, take: limit, orderBy: { name: "asc" } }),
      prisma.supplier.count({ where: { shopId, isActive: true } }),
    ]);

    const supplierIds = items.map(i => i.id);
    const ledgerAggregations = await prisma.ledgerEntry.groupBy({
      by: ['entityId'],
      where: { shopId, entityType: 'supplier', entityId: { in: supplierIds } },
      _sum: { debit: true, credit: true }
    });
    
    const balanceMap = ledgerAggregations.reduce((acc, curr) => {
      acc[curr.entityId] = Number(curr._sum.credit || 0) - Number(curr._sum.debit || 0); // supplier balance: credit decreases owed, wait... Payables: credit increases amount we owe
      return acc;
    }, {} as Record<string, number>);

    const enrichedItems = items.map(item => ({
      ...item,
      balance: balanceMap[item.id] || 0
    }));

    return { items: enrichedItems, total, page, limit, pages: Math.ceil(total / limit) };
  },
  async getLedger(supplierId: string, shopId: string) {
    const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, shopId } });
    if (!supplier) throw new AppError(404, "Supplier not found");
    const entries = await prisma.ledgerEntry.findMany({
      where: { shopId, entityType: "supplier", entityId: supplierId },
      orderBy: { createdAt: "desc" },
    });
    const balance = entries.reduce((acc, e) => acc + Number(e.credit) - Number(e.debit), 0);
    return { supplier, entries, balance };
  },
};
