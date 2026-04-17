"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
  Wallet,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  onViewLedger?: () => void;
}

function StatCard({ title, value, sub, icon: Icon, color, onViewLedger }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {onViewLedger && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={onViewLedger}
          >
            <ExternalLink className="h-3 w-3" /> View Ledger
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Report Stat Cards Section ─────────────────────────────────────────────────
interface ReportStatCardsProps {
  isLoading: boolean;
  sales: { total: number; count: number; tax?: number };
  expenses: number;
  purchases: number;
  netProfit: number;
  payments: Record<string, number>;
  onViewLedger: (type: "sales" | "expenses" | "purchases") => void;
}

export function ReportStatCards({
  isLoading,
  sales,
  expenses,
  purchases,
  netProfit,
  payments,
  onViewLedger,
}: ReportStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full" />)}
      </div>
    );
  }

  return (
    <>
      {/* Primary stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`₹${sales.total.toFixed(2)}`}
          sub={`${sales.count} transactions`}
          icon={TrendingUp}
          color="text-blue-600"
          onViewLedger={() => onViewLedger("sales")}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${expenses.toFixed(2)}`}
          sub="Operational costs"
          icon={Receipt}
          color="text-red-500"
          onViewLedger={() => onViewLedger("expenses")}
        />
        <StatCard
          title="Purchases Cost"
          value={`₹${purchases.toFixed(2)}`}
          sub="Supplier payments"
          icon={ShoppingCart}
          color="text-orange-500"
          onViewLedger={() => onViewLedger("purchases")}
        />
        <StatCard
          title="Net Profit"
          value={`₹${netProfit.toFixed(2)}`}
          sub="Sales − Expenses − Purchases"
          icon={netProfit >= 0 ? ArrowUpRight : TrendingDown}
          color={netProfit >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Payment mode breakdown + Tax */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {["cash", "upi", "card", "bank"].map((mode) => (
          <Card key={mode}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium capitalize text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />{mode} Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">₹{(payments[mode] ?? 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-violet-600">₹{(sales.tax ?? 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
