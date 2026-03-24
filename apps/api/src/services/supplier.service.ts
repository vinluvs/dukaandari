import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({ name: z.string().min(1), phone: z.string().optional(), email: z.string().email().optional(), gstNumber: z.string().optional() });

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
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
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
