import { prisma } from "../lib/prisma";

export const ReportService = {
  async daily(shopId: string, query: Record<string, unknown>) {
    const date = query["date"] ? new Date(String(query["date"])) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const [salesAgg, expensesAgg] = await Promise.all([
      prisma.invoice.aggregate({ where: { shopId, status: "active", createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true, totalTax: true } }),
      prisma.expense.aggregate({ where: { shopId, isActive: true, createdAt: { gte: start, lte: end } }, _sum: { amount: true } }),
    ]);

    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalTax = Number(salesAgg._sum.totalTax ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    return { date: start.toISOString().split("T")[0], totalSales, totalTax, totalExpenses, netRevenue: totalSales - totalExpenses };
  },

  async monthly(shopId: string, query: Record<string, unknown>) {
    const year = Number(query["year"] ?? new Date().getFullYear());
    const month = Number(query["month"] ?? new Date().getMonth() + 1);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [salesAgg, expensesAgg] = await Promise.all([
      prisma.invoice.aggregate({ where: { shopId, status: "active", createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true, totalTax: true } }),
      prisma.expense.aggregate({ where: { shopId, isActive: true, createdAt: { gte: start, lte: end } }, _sum: { amount: true } }),
    ]);

    return { year, month, totalSales: Number(salesAgg._sum.totalAmount ?? 0), totalTax: Number(salesAgg._sum.totalTax ?? 0), totalExpenses: Number(expensesAgg._sum.amount ?? 0) };
  },

  async financialYear(shopId: string, query: Record<string, unknown>) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { financialYearStartMonth: true } });
    const startMonth = shop?.financialYearStartMonth ?? 4;
    const year = Number(query["year"] ?? new Date().getFullYear());
    const start = new Date(year, startMonth - 1, 1);
    const end = new Date(startMonth > 3 ? year + 1 : year, startMonth - 2, 31, 23, 59, 59);

    const [salesAgg, expensesAgg] = await Promise.all([
      prisma.invoice.aggregate({ where: { shopId, status: "active", createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true, totalTax: true } }),
      prisma.expense.aggregate({ where: { shopId, isActive: true, createdAt: { gte: start, lte: end } }, _sum: { amount: true } }),
    ]);

    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalTax = Number(salesAgg._sum.totalTax ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    return { financialYear: `${year}-${year + 1}`, totalSales, totalTax, totalExpenses, netProfit: totalSales - totalExpenses - totalTax };
  },
};
