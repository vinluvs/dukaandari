import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({ category: z.string().min(1), amount: z.number().positive(), description: z.string().optional() });

export const ExpenseService = {
  async create(body: unknown, shopId: string) {
    const data = Schema.parse(body);
    return prisma.expense.create({ data: { ...data, shopId } });
  },
  async list({ shopId, query }: { shopId: string; query: Record<string, unknown> }) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 20), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.expense.findMany({ where: { shopId, isActive: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.expense.count({ where: { shopId, isActive: true } }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
  async deactivate(id: string, shopId: string) {
    const exp = await prisma.expense.findFirst({ where: { id, shopId } });
    if (!exp) throw new AppError(404, "Expense not found");
    await prisma.expense.update({ where: { id }, data: { isActive: false } });
  },
};
