"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Sheet, Download, Loader2, ChevronDown, TrendingUp, Receipt, ShoppingCart, Wallet, Users, Truck, Tag, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useItrExport, type ItrExportData } from "@/hooks/use-itr-export";
import { exportItrPdf, exportItrExcel } from "@/lib/itr-export";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultYear?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const INR = (v: number) =>
  "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "red" | "blue" }) {
  const colors = {
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-500",
    blue: "text-indigo-600 dark:text-indigo-400",
    undefined: "text-foreground",
  };
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${colors[highlight ?? "undefined"]}`}>{value}</span>
    </div>
  );
}

function AccordionSection({
  icon: Icon,
  title,
  badge,
  color,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className={`p-1.5 rounded-lg ${color} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm flex-1 text-left">{title}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small data table renderers ────────────────────────────────────────────────
function MiniTable({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, i) => (
            <tr key={i} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length > 10 && (
            <tr className="border-t border-border/30">
              <td colSpan={cols.length} className="px-3 py-2 text-center text-muted-foreground italic">
                ...and {rows.length - 10} more rows (visible in export)
              </td>
            </tr>
          )}
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-4 text-center text-muted-foreground italic">No data for this period</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Preview panels ────────────────────────────────────────────────────────────
function PreviewContent({ data }: { data: ItrExportData }) {
  const { plSummary, gstSummary, paymentSummary, expenseByCategory,
    salesRegister, purchaseRegister, expenseRegister, receivables, payables } = data;

  const profit_is_positive = plSummary.netProfit >= 0;

  return (
    <div className="space-y-3">
      {/* P&L Summary */}
      <AccordionSection icon={TrendingUp} title="Profit & Loss Summary" color="bg-indigo-500" defaultOpen>
        <StatRow label="Gross Turnover (Sales)" value={INR(plSummary.totalSales)} highlight="blue" />
        <StatRow label="(-) Cost of Purchases" value={INR(plSummary.totalPurchases)} />
        <StatRow label="Gross Profit" value={INR(plSummary.grossProfit)} highlight={plSummary.grossProfit >= 0 ? "green" : "red"} />
        <StatRow label="(-) Business Expenses" value={INR(plSummary.totalExpenses)} />
        <StatRow label="Net Profit / (Loss)" value={INR(plSummary.netProfit)} highlight={profit_is_positive ? "green" : "red"} />
        <Separator className="my-2" />
        <StatRow label="GST / Tax Collected" value={INR(plSummary.taxCollected)} />
        <StatRow label="Total Invoices" value={plSummary.invoiceCount.toString()} />
        <StatRow label="Total Purchases" value={plSummary.purchaseCount.toString()} />
        <StatRow label="Total Expenses" value={plSummary.expenseCount.toString()} />
      </AccordionSection>

      {/* GST Summary */}
      <AccordionSection icon={Tag} title="GST Summary" color="bg-emerald-500">
        <StatRow label="Total Tax Collected" value={INR(gstSummary.totalTaxCollected)} highlight="blue" />
        <StatRow label="IGST (Interstate)" value={INR(gstSummary.igst)} />
        <StatRow label="CGST (Intrastate – Central)" value={INR(gstSummary.cgst)} />
        <StatRow label="SGST (Intrastate – State)" value={INR(gstSummary.sgst)} />
      </AccordionSection>

      {/* Payment modes */}
      <AccordionSection icon={CreditCard} title="Payment Mode Breakdown" color="bg-amber-500">
        {Object.entries(paymentSummary).length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No payments recorded</p>
        ) : (
          Object.entries(paymentSummary).map(([mode, v]) => (
            <StatRow key={mode} label={`${mode.toUpperCase()} (${v.count} txn)`} value={INR(v.total)} />
          ))
        )}
      </AccordionSection>

      {/* Expenses by category */}
      <AccordionSection icon={Wallet} title="Expenses by Category" color="bg-red-500"
        badge={`${plSummary.expenseCount} entries`}>
        {Object.entries(expenseByCategory).map(([cat, amt]) => (
          <StatRow key={cat} label={cat} value={INR(amt)} />
        ))}
        {Object.keys(expenseByCategory).length === 0 && (
          <p className="text-sm text-muted-foreground italic">No expenses recorded</p>
        )}
      </AccordionSection>

      {/* Sales Register */}
      <AccordionSection icon={Receipt} title="Sales Register" color="bg-indigo-600"
        badge={`${salesRegister.length} invoices`}>
        <MiniTable
          cols={["Invoice #", "Date", "Customer", "Taxable", "IGST", "CGST", "SGST", "Total"]}
          rows={salesRegister.map((s) => [
            s.invoiceNumber, s.date, s.customerName,
            INR(s.taxableValue), INR(s.igst), INR(s.cgst), INR(s.sgst), INR(s.totalAmount),
          ])}
        />
      </AccordionSection>

      {/* Purchase Register */}
      <AccordionSection icon={ShoppingCart} title="Purchase Register" color="bg-orange-500"
        badge={`${purchaseRegister.length} entries`}>
        <MiniTable
          cols={["PO Ref", "Date", "Supplier", "Supplier GST", "Amount"]}
          rows={purchaseRegister.map((p) => [
            p.referenceId, p.date, p.supplierName, p.supplierGst || "—", INR(p.amount),
          ])}
        />
      </AccordionSection>

      {/* Expense Register */}
      <AccordionSection icon={Wallet} title="Expense Register" color="bg-red-600"
        badge={`${expenseRegister.length} entries`}>
        <MiniTable
          cols={["Date", "Category", "Description", "Amount"]}
          rows={expenseRegister.map((e) => [e.date, e.category, e.description || "—", INR(e.amount)])}
        />
      </AccordionSection>

      {/* Receivables */}
      <AccordionSection icon={Users} title="Debtors / Receivables" color="bg-cyan-500"
        badge={receivables.length ? `${receivables.length} debtors` : "Nil"}>
        <MiniTable
          cols={["Customer", "Billed", "Received", "Outstanding"]}
          rows={receivables.map((r) => [r.customerName, INR(r.debit), INR(r.credit), INR(r.outstanding)])}
        />
      </AccordionSection>

      {/* Payables */}
      <AccordionSection icon={Truck} title="Creditors / Payables" color="bg-purple-500"
        badge={payables.length ? `${payables.length} creditors` : "Nil"}>
        <MiniTable
          cols={["Supplier", "Purchased", "Paid", "Outstanding"]}
          rows={payables.map((p) => [p.supplierName, INR(p.debit), INR(p.credit), INR(p.outstanding)])}
        />
      </AccordionSection>
    </div>
  );
}

// ── Main Dialog ───────────────────────────────────────────────────────────────
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

export function ItrExportDialog({ open, onClose, defaultYear }: Props) {
  const [year, setYear] = useState(defaultYear ?? new Date().getFullYear());
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const { data, isLoading, isError, refetch } = useItrExport(open ? year : undefined);

  const handlePdf = async () => {
    if (!data) return;
    setExporting("pdf");
    try {
      exportItrPdf(data);
      toast.success("PDF downloaded successfully");
    } catch (e) {
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(null);
    }
  };

  const handleExcel = async () => {
    if (!data) return;
    setExporting("excel");
    try {
      exportItrExcel(data);
      toast.success("Excel file downloaded successfully");
    } catch (e) {
      toast.error("Failed to generate Excel");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </span>
                Export for ITR
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Complete financial report for Income Tax Return filing (ITR-4 / Presumptive).
                {data && (
                  <span className="ml-1 text-foreground font-medium">
                    FY {data.financialYear} · {data.period.start} → {data.period.end}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Financial Year</span>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>FY {y}-{String(y + 1).slice(2)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcel}
              disabled={!data || !!exporting || isLoading}
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            >
              {exporting === "excel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sheet className="h-4 w-4" />}
              Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              onClick={handlePdf}
              disabled={!data || !!exporting || isLoading}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-muted-foreground text-sm">Failed to load ITR data.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : data ? (
            <PreviewContent data={data} />
          ) : null}
        </div>

        {/* Footer note */}
        {data && (
          <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> This report is generated from
              your Dukaandari records. Verify with your CA before filing. ITR-4 applicable for
              presumptive income u/s 44AD/44ADA.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
