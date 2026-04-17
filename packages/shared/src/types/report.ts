export interface SalesStat {
  total: number;
  count: number;
  discount?: number;
  tax?: number;
}

export interface DailyChartEntry {
  date: string; // YYYY-MM-DD
  amount: number;
  count: number;
}

export interface MonthlyChartEntry {
  month: string; // YYYY-MM
  amount: number;
  count: number;
}

export interface DailyReportData {
  date: string;
  sales: SalesStat;
  expenses: number;
  purchases: number;
  payments: Record<string, number>;
  netProfit: number;
  // compat
  totalSales: number;
  totalTax: number;
  totalExpenses: number;
}

export interface MonthlyReportData {
  year: number;
  month: number;
  sales: SalesStat;
  dailySales: DailyChartEntry[];
  dailyPurchases: DailyChartEntry[];
  expenses: number;
  purchases: number;
  payments: Record<string, number>;
  netProfit: number;
  // compat
  totalSales: number;
  totalTax: number;
  totalExpenses: number;
}

export interface FinancialYearReportData {
  financialYear: string;
  startMonth: number;
  sales: SalesStat;
  monthlySales: MonthlyChartEntry[];
  monthlyPurchases: MonthlyChartEntry[];
  expenses: number;
  purchases: number;
  payments: Record<string, number>;
  netProfit: number;
  // compat
  totalSales: number;
  totalTax: number;
  totalExpenses: number;
}

export interface SalesLedgerItem {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  totalTax: number;
  paymentStatus: string;
  createdAt: string | Date;
  customer: { id: string; name: string } | null;
}

export interface PurchaseLedgerItem {
  id: string;
  shopId: string;
  entityType: string;
  entityId: string;
  debit: number;
  credit: number;
  referenceType: string;
  referenceId: string;
  description: string | null;
  createdAt: string | Date;
}
