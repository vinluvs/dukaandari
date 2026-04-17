import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  creditLimit: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
});

export const CustomerService = {
  async create(body: unknown, shopId: string) {
    const data = Schema.parse(body);
    return prisma.customer.create({ data: { ...data, shopId } });
  },
  async list({ shopId, query }: { shopId: string; query: Record<string, unknown> }) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 20), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.customer.findMany({ where: { shopId, isActive: true }, skip, take: limit, orderBy: { name: "asc" } }),
      prisma.customer.count({ where: { shopId, isActive: true } }),
    ]);

    const customerIds = items.map(i => i.id);
    const ledgerAggregations = await prisma.ledgerEntry.groupBy({
      by: ['entityId'],
      where: { shopId, entityType: 'customer', entityId: { in: customerIds } },
      _sum: { debit: true, credit: true }
    });
    
    const balanceMap = ledgerAggregations.reduce((acc, curr) => {
      acc[curr.entityId] = Number(curr._sum.debit || 0) - Number(curr._sum.credit || 0);
      return acc;
    }, {} as Record<string, number>);

    const enrichedItems = items.map(item => ({
      ...item,
      balance: balanceMap[item.id] || 0
    }));

    return { items: enrichedItems, total, page, limit, pages: Math.ceil(total / limit) };
  },
  async getLedger(customerId: string, shopId: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, shopId } });
    if (!customer) throw new AppError(404, "Customer not found");
    const entries = await prisma.ledgerEntry.findMany({
      where: { shopId, entityType: "customer", entityId: customerId },
      orderBy: { createdAt: "desc" },
    });
    const balance = entries.reduce((acc, e) => acc + Number(e.debit) - Number(e.credit), 0);
    return { customer, entries, balance };
  },
  async recordPayment(customerId: string, body: unknown, shopId: string) {
    const data = z.object({ amount: z.number().positive(), mode: z.string().default("cash"), notes: z.string().optional() }).parse(body);
    const customer = await prisma.customer.findFirst({ where: { id: customerId, shopId } });
    if (!customer) throw new AppError(404, "Customer not found");
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { shopId, referenceType: "payment", referenceId: customerId, amount: data.amount, mode: data.mode },
      });
      await tx.ledgerEntry.create({
        data: { shopId, entityType: "customer", entityId: customerId, debit: 0, credit: data.amount, referenceType: "payment", referenceId: payment.id, description: data.notes },
      });
      return payment;
    });
  },
};
