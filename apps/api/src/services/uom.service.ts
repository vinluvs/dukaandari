import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const Schema = z.object({ name: z.string().min(1), symbol: z.string().min(1) });

export const UomService = {
  async create(body: unknown, shopId: string) {
    const data = Schema.parse(body);
    return prisma.uom.create({ data: { ...data, shopId } });
  },
  async list(shopId: string) {
    return prisma.uom.findMany({ where: { shopId, isActive: true }, orderBy: { name: "asc" } });
  },
  async update(id: string, body: unknown, shopId: string) {
    const uom = await prisma.uom.findFirst({ where: { id, shopId } });
    if (!uom) throw new AppError(404, "UOM not found");
    return prisma.uom.update({ where: { id }, data: Schema.partial().parse(body) });
  },
  async deactivate(id: string, shopId: string) {
    const uom = await prisma.uom.findFirst({ where: { id, shopId } });
    if (!uom) throw new AppError(404, "UOM not found");
    await prisma.uom.update({ where: { id }, data: { isActive: false } });
  },
};
