import { prisma } from "../lib/prisma";

// Helper: group raw invoices into a daily bucket map
function groupByDay(rows: { createdAt: Date; totalAmount: unknown }[]) {
  const map: Record<string, { amount: number; count: number }> = {};
  for (const row of rows) {
    const key = row.createdAt.toISOString().split("T")[0]!;
    const existing = map[key];
    if (existing) {
      existing.amount += Number(row.totalAmount ?? 0);
      existing.count += 1;
    } else {
      map[key] = { amount: Number(row.totalAmount ?? 0), count: 1 };
    }
  }
  return Object.entries(map)
    .map(([date, d]) => ({ date, amount: d.amount, count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper: group ledger debit entries into a daily bucket map (for purchases)
function groupLedgerByDay(rows: { createdAt: Date; debit: unknown }[]) {
  const map: Record<string, { amount: number; count: number }> = {};
  for (const row of rows) {
    const key = row.createdAt.toISOString().split("T")[0]!;
    const existing = map[key];
    if (existing) {
      existing.amount += Number(row.debit ?? 0);
      existing.count += 1;
    } else {
      map[key] = { amount: Number(row.debit ?? 0), count: 1 };
    }
  }
  return Object.entries(map)
    .map(([date, d]) => ({ date, amount: d.amount, count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper: group ledger debit entries into a monthly bucket map (for purchases)
function groupLedgerByMonth(rows: { createdAt: Date; debit: unknown }[]) {
  const map: Record<string, { amount: number; count: number }> = {};
  for (const row of rows) {
    const key = row.createdAt.toISOString().substring(0, 7)!; // YYYY-MM
    const existing = map[key];
    if (existing) {
      existing.amount += Number(row.debit ?? 0);
      existing.count += 1;
    } else {
      map[key] = { amount: Number(row.debit ?? 0), count: 1 };
    }
  }
  return Object.entries(map)
    .map(([month, d]) => ({ month, amount: d.amount, count: d.count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}


// Helper: sum payments by mode
async function paymentsByMode(shopId: string, start: Date, end: Date) {
  const payments = await prisma.payment.groupBy({
    by: ["mode"],
    where: { shopId, createdAt: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  const result: Record<string, number> = {};
  for (const p of payments) {
    result[p.mode] = Number(p._sum.amount ?? 0);
  }
  return result;
}

// Helper: total purchases (supplier debit entries = money owed to supplier = cost of goods purchased)
async function purchaseCost(shopId: string, start: Date, end: Date) {
  const agg = await prisma.ledgerEntry.aggregate({
    where: {
      shopId,
      entityType: "supplier",
      createdAt: { gte: start, lte: end },
    },
    _sum: { debit: true },
  });
  return Number(agg._sum.debit ?? 0);
}

export const ReportService = {
  async daily(shopId: string, query: Record<string, unknown>) {
    const date = query["date"] ? new Date(String(query["date"])) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const [salesAgg, expensesAgg, paymentModes] = await Promise.all([
      prisma.invoice.aggregate({
        where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true, totalTax: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: { shopId, isActive: true, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      paymentsByMode(shopId, start, end),
    ]);

    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalTax = Number(salesAgg._sum.totalTax ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);
    const purchases = await purchaseCost(shopId, start, end);

    return {
      date: start.toISOString().split("T")[0],
      sales: { total: totalSales, count: Number(salesAgg._count.id ?? 0), tax: totalTax },
      expenses: totalExpenses,
      purchases,
      payments: paymentModes,
      netProfit: totalSales - totalExpenses - purchases,
      // kept for compat
      totalSales, totalTax, totalExpenses,
    };
  },

  async monthly(shopId: string, query: Record<string, unknown>) {
    const year = Number(query["year"] ?? new Date().getFullYear());
    const month = Number(query["month"] ?? new Date().getMonth() + 1);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Fetch raw invoices + raw purchase ledger entries for day-level grouping
    const [salesAgg, expensesAgg, rawInvoices, paymentModes, purchases, rawPurchaseLedger] = await Promise.all([
      prisma.invoice.aggregate({
        where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true, totalTax: true, totalDiscount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: { shopId, isActive: true, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
        select: { createdAt: true, totalAmount: true },
      }),
      paymentsByMode(shopId, start, end),
      purchaseCost(shopId, start, end),
      prisma.ledgerEntry.findMany({
        where: { shopId, entityType: "supplier", referenceType: "purchase_order", createdAt: { gte: start, lte: end } },
        select: { createdAt: true, debit: true },
      }),
    ]);

    const dailySales = groupByDay(rawInvoices as any);
    const dailyPurchases = groupLedgerByDay(rawPurchaseLedger as any);
    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalTax = Number(salesAgg._sum.totalTax ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    return {
      year,
      month,
      sales: {
        total: totalSales,
        count: Number(salesAgg._count.id ?? 0),
        discount: Number(salesAgg._sum.totalDiscount ?? 0),
        tax: totalTax,
      },
      dailySales,
      dailyPurchases,
      expenses: totalExpenses,
      purchases,
      payments: paymentModes,
      netProfit: totalSales - totalExpenses - purchases,
      // kept for compat
      totalSales, totalTax, totalExpenses,
    };
  },

  async financialYear(shopId: string, query: Record<string, unknown>) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { financialYearStartMonth: true } });
    const startMonth = shop?.financialYearStartMonth ?? 4;
    const year = Number(query["year"] ?? new Date().getFullYear());
    // FY: April (startMonth) of `year` → March of `year+1` (for Indian FY)
    const start = new Date(year, startMonth - 1, 1);
    const endYear = startMonth > 1 ? year + 1 : year;
    const endMonth = startMonth === 1 ? 12 : startMonth - 1;
    const end = new Date(endYear, endMonth, 0, 23, 59, 59);

    // Monthly buckets for chart — sales and purchases in parallel
    const [rawInvoices, rawPurchaseLedger, salesAgg, expensesAgg, paymentModes, purchases] = await Promise.all([
      prisma.invoice.findMany({
        where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.ledgerEntry.findMany({
        where: { shopId, entityType: "supplier", referenceType: "purchase_order", createdAt: { gte: start, lte: end } },
        select: { createdAt: true, debit: true },
      }),
      prisma.invoice.aggregate({
        where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true, totalTax: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: { shopId, isActive: true, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      paymentsByMode(shopId, start, end),
      purchaseCost(shopId, start, end),
    ]);

    // Group by YYYY-MM
    const monthlySales = (() => {
      const map: Record<string, { amount: number; count: number }> = {};
      for (const inv of rawInvoices) {
        const key = inv.createdAt.toISOString().substring(0, 7)!;
        const existing = map[key];
        if (existing) { existing.amount += Number(inv.totalAmount ?? 0); existing.count += 1; }
        else { map[key] = { amount: Number(inv.totalAmount ?? 0), count: 1 }; }
      }
      return Object.entries(map).map(([month, d]) => ({ month, amount: d.amount, count: d.count })).sort((a, b) => a.month.localeCompare(b.month));
    })();

    const monthlyPurchases = groupLedgerByMonth(rawPurchaseLedger as any);

    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalTax = Number(salesAgg._sum.totalTax ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    return {
      financialYear: `${year}-${endYear}`,
      startMonth,
      sales: { total: totalSales, count: Number(salesAgg._count.id ?? 0), tax: totalTax },
      monthlySales,
      monthlyPurchases,
      expenses: totalExpenses,
      purchases,
      payments: paymentModes,
      netProfit: totalSales - totalExpenses - purchases,
      // kept for compat
      totalSales, totalTax, totalExpenses,
    };
  },

  // --- Ledger listing endpoints ---

  async salesLedger(shopId: string, query: Record<string, unknown>) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 50), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { shopId, status: "active" };
    if (query["start_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), gte: new Date(String(query["start_date"])) };
    if (query["end_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), lte: new Date(String(query["end_date"])) };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { id: true, name: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async expenseLedger(shopId: string, query: Record<string, unknown>) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 50), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { shopId, isActive: true };
    if (query["start_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), gte: new Date(String(query["start_date"])) };
    if (query["end_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), lte: new Date(String(query["end_date"])) };

    const [items, total] = await Promise.all([
      prisma.expense.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.expense.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async purchaseLedger(shopId: string, query: Record<string, unknown>) {
    // Purchases = supplier ledger debit entries
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 50), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { shopId, entityType: "supplier" };
    if (query["start_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), gte: new Date(String(query["start_date"])) };
    if (query["end_date"]) where["createdAt"] = { ...(where["createdAt"] as object ?? {}), lte: new Date(String(query["end_date"])) };

    const [items, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.ledgerEntry.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  // ── ITR Export ─────────────────────────────────────────────────────────────
  async itrExport(shopId: string, query: Record<string, unknown>) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        name: true, gstNumber: true, address: true,
        financialYearStartMonth: true,
        owner: { select: { fullName: true, email: true } },
      },
    });
    const startMonth = shop?.financialYearStartMonth ?? 4;
    const year = Number(query["year"] ?? new Date().getFullYear());
    const start = new Date(year, startMonth - 1, 1);
    const endYear = startMonth > 1 ? year + 1 : year;
    const endMonth = startMonth === 1 ? 12 : startMonth - 1;
    const end = new Date(endYear, endMonth, 0, 23, 59, 59, 999);
    const fyLabel = `${year}-${String(endYear).slice(2)}`;

    // ── 1. Sales Register — all active invoices with line-item GST detail ────
    const invoices = await prisma.invoice.findMany({
      where: { shopId, status: "active", createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true, hsnCode: true } },
            uom: { select: { symbol: true } },
          },
        },
      },
    });

    // GST split per invoice (invoice-level, based on isIgst flag)
    const salesRegister = invoices.map((inv) => {
      let igst = 0, cgst = 0, sgst = 0;
      if (Number(inv.totalTax) > 0) {
        if (inv.isIgst) {
          igst = Number(inv.totalTax);
        } else {
          cgst = parseFloat((Number(inv.totalTax) / 2).toFixed(2));
          sgst = parseFloat((Number(inv.totalTax) / 2).toFixed(2));
        }
      }
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.createdAt.toISOString().split("T")[0],
        customerName: inv.customer?.name ?? "Walk-in Customer",
        subtotal: Number(inv.subtotal),
        discount: Number(inv.totalDiscount),
        taxableValue: Number(inv.subtotal) - Number(inv.totalDiscount),
        igst,
        cgst,
        sgst,
        totalTax: Number(inv.totalTax),
        totalAmount: Number(inv.totalAmount),
        paymentStatus: inv.paymentStatus,
        gstEnabled: inv.gstEnabled,
        isIgst: inv.isIgst,
        items: inv.items.map((it) => ({
          productName: it.product.name,
          hsnCode: it.product.hsnCode ?? "",
          uom: it.uom?.symbol ?? "",
          quantity: Number(it.quantity),
          price: Number(it.price),
          discount: Number(it.discount),
          gstPercentage: Number(it.gstPercentage),
          taxAmount: Number(it.taxAmount),
          total: Number(it.total),
        })),
      };
    });

    // ── 2. Purchase Register — supplier ledger debit entries ─────────────────
    const purchaseLedgerEntries = await prisma.ledgerEntry.findMany({
      where: { shopId, entityType: "supplier", referenceType: "purchase_order", createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
    });
    const supplierIds = [...new Set(purchaseLedgerEntries.map((e) => e.entityId))];
    const suppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true, gstNumber: true },
    });
    const supplierMap: Record<string, { name: string; gstNumber: string | null }> = {};
    for (const s of suppliers) supplierMap[s.id] = { name: s.name, gstNumber: s.gstNumber };

    const purchaseRegister = purchaseLedgerEntries.map((e) => ({
      id: e.id,
      date: e.createdAt.toISOString().split("T")[0],
      referenceId: e.referenceId,
      supplierName: supplierMap[e.entityId]?.name ?? "Unknown Supplier",
      supplierGst: supplierMap[e.entityId]?.gstNumber ?? "",
      description: e.description ?? "",
      amount: Number(e.debit),
    }));

    // ── 3. Expense Register ──────────────────────────────────────────────────
    const expenses = await prisma.expense.findMany({
      where: { shopId, isActive: true, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
    });
    const expenseRegister = expenses.map((e) => ({
      id: e.id,
      date: e.createdAt.toISOString().split("T")[0],
      category: e.category,
      description: e.description ?? "",
      amount: Number(e.amount),
    }));
    const expenseByCategory: Record<string, number> = {};
    for (const e of expenseRegister) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + e.amount;
    }

    // ── 4. Payment Mode Summary ──────────────────────────────────────────────
    const paymentRows = await prisma.payment.groupBy({
      by: ["mode"],
      where: { shopId, createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: { id: true },
    });
    const paymentSummary: Record<string, { total: number; count: number }> = {};
    for (const p of paymentRows) {
      paymentSummary[p.mode] = { total: Number(p._sum.amount ?? 0), count: Number(p._count.id) };
    }

    // ── 5. P&L Aggregates ───────────────────────────────────────────────────
    const totalSales    = salesRegister.reduce((s, i) => s + i.totalAmount, 0);
    const totalTaxCollected = salesRegister.reduce((s, i) => s + i.totalTax, 0);
    const totalIGST     = salesRegister.reduce((s, i) => s + i.igst, 0);
    const totalCGST     = salesRegister.reduce((s, i) => s + i.cgst, 0);
    const totalSGST     = salesRegister.reduce((s, i) => s + i.sgst, 0);
    const totalPurchases = purchaseRegister.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseRegister.reduce((s, i) => s + i.amount, 0);
    const grossProfit   = totalSales - totalPurchases;
    const netProfit     = grossProfit - totalExpenses;

    // ── 6. Receivables — customer outstanding balance ────────────────────────
    const customerLedger = await prisma.ledgerEntry.groupBy({
      by: ["entityId"],
      where: { shopId, entityType: "customer" },
      _sum: { debit: true, credit: true },
    });
    const customerIds = customerLedger.map((r) => r.entityId);
    const customersInfo = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, phone: true },
    });
    const customerNameMap: Record<string, string> = {};
    for (const c of customersInfo) customerNameMap[c.id] = c.name;
    const receivables = customerLedger
      .map((r) => ({
        customerId: r.entityId,
        customerName: customerNameMap[r.entityId] ?? "Unknown",
        debit: Number(r._sum.debit ?? 0),
        credit: Number(r._sum.credit ?? 0),
        outstanding: Number(r._sum.debit ?? 0) - Number(r._sum.credit ?? 0),
      }))
      .filter((r) => r.outstanding > 0.005 && r.customerName !== "Walk-in Customer")
      .sort((a, b) => b.outstanding - a.outstanding);

    // ── 7. Payables — supplier outstanding balance ───────────────────────────
    const supplierLedger = await prisma.ledgerEntry.groupBy({
      by: ["entityId"],
      where: { shopId, entityType: "supplier" },
      _sum: { debit: true, credit: true },
    });
    const allSupplierIds = supplierLedger.map((r) => r.entityId);
    const allSuppliersInfo = await prisma.supplier.findMany({
      where: { id: { in: allSupplierIds } },
      select: { id: true, name: true, gstNumber: true },
    });
    const allSupplierMap: Record<string, string> = {};
    for (const s of allSuppliersInfo) allSupplierMap[s.id] = s.name;
    const payables = supplierLedger
      .map((r) => ({
        supplierId: r.entityId,
        supplierName: allSupplierMap[r.entityId] ?? "Unknown",
        debit: Number(r._sum.debit ?? 0),
        credit: Number(r._sum.credit ?? 0),
        outstanding: Number(r._sum.debit ?? 0) - Number(r._sum.credit ?? 0),
      }))
      .filter((r) => r.outstanding > 0.005 && r.supplierName !== "Walk-in Supplier")
      .sort((a, b) => b.outstanding - a.outstanding);

    return {
      shopInfo: {
        name: shop?.name ?? "",
        gstNumber: shop?.gstNumber ?? "",
        address: shop?.address ?? "",
        ownerName: shop?.owner?.fullName ?? "",
        ownerEmail: shop?.owner?.email ?? "",
      },
      financialYear: fyLabel,
      period: { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] },
      plSummary: {
        totalSales:       parseFloat(totalSales.toFixed(2)),
        totalPurchases:   parseFloat(totalPurchases.toFixed(2)),
        totalExpenses:    parseFloat(totalExpenses.toFixed(2)),
        grossProfit:      parseFloat(grossProfit.toFixed(2)),
        netProfit:        parseFloat(netProfit.toFixed(2)),
        taxCollected:     parseFloat(totalTaxCollected.toFixed(2)),
        invoiceCount:     salesRegister.length,
        purchaseCount:    purchaseRegister.length,
        expenseCount:     expenseRegister.length,
      },
      gstSummary: {
        totalTaxCollected: parseFloat(totalTaxCollected.toFixed(2)),
        igst:  parseFloat(totalIGST.toFixed(2)),
        cgst:  parseFloat(totalCGST.toFixed(2)),
        sgst:  parseFloat(totalSGST.toFixed(2)),
      },
      paymentSummary,
      expenseByCategory,
      salesRegister,
      purchaseRegister,
      expenseRegister,
      receivables,
      payables,
    };
  },
};
