"use client";

import { useState } from "react";
import {
  useDailyReport,
  useMonthlyReport,
  useFinancialYearReport,
} from "@/hooks/use-reports";
import { format } from "date-fns";
import { FileText } from "lucide-react";

import { PeriodSelector, Period, MONTHS, YEARS } from "@/components/reports/period-selector";
import { ReportStatCards } from "@/components/reports/report-stat-cards";
import { ReportChart } from "@/components/reports/report-chart";
import { LedgerModal, LedgerType } from "@/components/reports/ledger-modal";
import { ItrExportDialog } from "@/components/reports/itr-export-dialog";
import { Button } from "@/components/ui/button";

// ── Chart data builder ────────────────────────────────────────────────────────
function buildChartData(
  period: Period,
  monthlyData: ReturnType<typeof useMonthlyReport>["data"],
  fyData: ReturnType<typeof useFinancialYearReport>["data"],
) {
  if (period === "monthly") {
    const salesArr = monthlyData?.dailySales ?? [];
    const purchasesArr = monthlyData?.dailyPurchases ?? [];
    const map: Record<string, { name: string; Sales: number; Purchases: number }> = {};
    for (const d of salesArr) {
      const name = format(new Date(d.date + "T00:00:00"), "d MMM");
      map[d.date] = { name, Sales: d.amount, Purchases: 0 };
    }
    for (const d of purchasesArr) {
      const name = format(new Date(d.date + "T00:00:00"), "d MMM");
      if (map[d.date]) { map[d.date]!.Purchases = d.amount; }
      else { map[d.date] = { name, Sales: 0, Purchases: d.amount }; }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }

  if (period === "financial-year") {
    const salesArr = fyData?.monthlySales ?? [];
    const purchasesArr = fyData?.monthlyPurchases ?? [];
    const map: Record<string, { name: string; Sales: number; Purchases: number }> = {};
    for (const d of salesArr) {
      const name = format(new Date(d.month + "-01T00:00:00"), "MMM yy");
      map[d.month] = { name, Sales: d.amount, Purchases: 0 };
    }
    for (const d of purchasesArr) {
      const name = format(new Date(d.month + "-01T00:00:00"), "MMM yy");
      if (map[d.month]) { map[d.month]!.Purchases = d.amount; }
      else { map[d.month] = { name, Sales: 0, Purchases: d.amount }; }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }

  return [];
}

// ── Ledger date range ─────────────────────────────────────────────────────────
function ledgerDateRange(period: Period, year: number, month: number, date: string) {
  if (period === "daily") return { startDate: date, endDate: date };
  if (period === "monthly") {
    const s = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const e = new Date(year, month, 0).toISOString().split("T")[0];
    return { startDate: s, endDate: e };
  }
  return { startDate: `${year}-04-01`, endDate: `${year + 1}-03-31` };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const today = new Date();
  const [period, setPeriod] = useState<Period>("monthly");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [ledger, setLedger] = useState<LedgerType | null>(null);
  const [itrOpen, setItrOpen] = useState(false);

  const dailyQ = useDailyReport(period === "daily" ? date : undefined);
  const monthlyQ = useMonthlyReport(
    period === "monthly" ? year : undefined,
    period === "monthly" ? month : undefined,
  );
  const fyQ = useFinancialYearReport(period === "financial-year" ? year : undefined);

  const isLoading =
    period === "daily" ? dailyQ.isLoading :
    period === "monthly" ? monthlyQ.isLoading :
    fyQ.isLoading;

  const report =
    period === "daily" ? dailyQ.data :
    period === "monthly" ? monthlyQ.data :
    fyQ.data;

  const sales = report?.sales ?? { total: 0, count: 0 };
  const expenses = report?.expenses ?? 0;
  const purchases = report?.purchases ?? 0;
  const netProfit = report?.netProfit ?? 0;
  const payments = report?.payments ?? {};

  const chartData = buildChartData(period, monthlyQ.data, fyQ.data);

  const chartDescription =
    period === "monthly"
      ? `${MONTHS[month - 1] ?? ""} ${year}`
      : `FY ${year}–${year + 1}`;

  const ledgerDates = ledgerDateRange(period, year, month, date ?? "");

  return (
    <div className="space-y-6">
      {/* Header + Period selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground text-sm">Track sales, expenses, and profit across periods.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector
            period={period}
            onPeriodChange={setPeriod}
            year={year}
            onYearChange={setYear}
            month={month}
            onMonthChange={setMonth}
            date={date}
            onDateChange={setDate}
            maxDate={today.toISOString().split("T")[0]}
          />

          {period === "financial-year" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 whitespace-nowrap"
              onClick={() => setItrOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Export for ITR
            </Button>
          )}
        </div>
      </div>

      {/* Stat Cards + Payment Breakdown */}
      <ReportStatCards
        isLoading={isLoading}
        sales={sales}
        expenses={expenses}
        purchases={purchases}
        netProfit={netProfit}
        payments={payments}
        onViewLedger={setLedger}
      />

      {/* Sales vs Purchases Chart (monthly + FY only) */}
      {(period === "monthly" || period === "financial-year") && !isLoading && (
        <ReportChart
          data={chartData}
          title={period === "monthly" ? "Daily Sales vs Purchases" : "Monthly Sales vs Purchases"}
          description={chartDescription}
        />
      )}

      {/* Ledger Modal */}
      {ledger && (
        <LedgerModal
          open={!!ledger}
          onClose={() => setLedger(null)}
          type={ledger}
          startDate={ledgerDates.startDate}
          endDate={ledgerDates.endDate}
        />
      )}

      {/* ITR Export Dialog */}
      <ItrExportDialog
        open={itrOpen}
        onClose={() => setItrOpen(false)}
        defaultYear={year}
      />
    </div>
  );
}
