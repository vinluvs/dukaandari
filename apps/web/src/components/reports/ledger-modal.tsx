"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useSalesLedger,
  useExpenseLedger,
  usePurchaseLedger,
} from "@/hooks/use-reports";
import { format } from "date-fns";

export type LedgerType = "sales" | "expenses" | "purchases";

const TITLES: Record<LedgerType, string> = {
  sales: "Sales Ledger",
  expenses: "Expense Ledger",
  purchases: "Purchase Ledger",
};

interface LedgerModalProps {
  open: boolean;
  onClose: () => void;
  type: LedgerType;
  startDate?: string;
  endDate?: string;
}

export function LedgerModal({ open, onClose, type, startDate, endDate }: LedgerModalProps) {
  const { data: salesData, isLoading: salesLoading } = useSalesLedger(startDate, endDate);
  const { data: expensesData, isLoading: expensesLoading } = useExpenseLedger(startDate, endDate);
  const { data: purchasesData, isLoading: purchasesLoading } = usePurchaseLedger(startDate, endDate);

  const isLoading = type === "sales" ? salesLoading : type === "expenses" ? expensesLoading : purchasesLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="flex flex-col h-max w-max max-w-5xl sm:max-w-none"
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{TITLES[type]}</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto flex-1 rounded-md border">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : type === "sales" ? (
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="w-36">Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(salesData ?? []).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.customer?.name ?? "Walk-in"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{Number(inv.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ₹{Number(inv.totalTax).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inv.paymentStatus === "paid" ? "default" : "secondary"}>
                        {inv.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(inv.createdAt), "dd MMM yyyy, hh:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
                {!salesData?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No sales found for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : type === "expenses" ? (
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expensesData ?? []).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.category}</TableCell>
                    <TableCell className="text-muted-foreground">{exp.description ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ₹{Number(exp.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(exp.createdAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
                {!expensesData?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No expenses found for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(purchasesData ?? []).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs">{entry.referenceId}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.description ?? "Purchase"}</TableCell>
                    <TableCell className="text-right font-semibold text-orange-600">
                      ₹{Number(entry.debit).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs uppercase">
                      {entry.referenceType}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(entry.createdAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
                {!purchasesData?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No purchases found for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Summary footer */}
        <div className="pt-2 text-xs text-muted-foreground border-t">
          {type === "sales" && salesData?.length
            ? `${salesData.length} invoice(s) · Total: ₹${salesData.reduce((s, i) => s + Number(i.totalAmount), 0).toFixed(2)}`
            : type === "expenses" && expensesData?.length
              ? `${expensesData.length} expense(s) · Total: ₹${expensesData.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}`
              : type === "purchases" && purchasesData?.length
                ? `${purchasesData.length} purchase(s) · Total: ₹${purchasesData.reduce((s, p) => s + Number(p.debit), 0).toFixed(2)}`
                : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
