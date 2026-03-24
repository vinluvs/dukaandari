import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({ name: z.string().min(1), description: z.string().optional() });

export const CategoryService = {
  async create(body: unknown, shopId: string) {
    const data = Schema.parse(body);
    return prisma.productCategory.create({ data: { ...data, shopId } });
  },
  async list(shopId: string) {
    return prisma.productCategory.findMany({ where: { shopId, isActive: true }, orderBy: { name: "asc" } });
  },
  async update(id: string, body: unknown, shopId: string) {
    const cat = await prisma.productCategory.findFirst({ where: { id, shopId } });
    if (!cat) throw new AppError(404, "Category not found");
    return prisma.productCategory.update({ where: { id }, data: Schema.partial().parse(body) });
  },
  async deactivate(id: string, shopId: string) {
    const cat = await prisma.productCategory.findFirst({ where: { id, shopId } });
    if (!cat) throw new AppError(404, "Category not found");
    await prisma.productCategory.update({ where: { id }, data: { isActive: false } });
  },
};
