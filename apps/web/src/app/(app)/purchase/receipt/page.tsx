"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Printer, ShoppingBag } from "lucide-react";

function ReceiptContent() {
  const params = useSearchParams();
  const router = useRouter();

  const ref = params.get("ref") ?? "—";
  const total = parseFloat(params.get("total") ?? "0");
  const paid = parseFloat(params.get("paid") ?? "0");
  const status = params.get("status") ?? "unpaid";
  const balance = total - paid;

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      {/* Success header */}
      <div className="text-center space-y-2">
        <CheckCircle2 className="mx-auto text-orange-500" size={52} strokeWidth={1.5} />
        <h1 className="text-2xl font-bold">Purchase Recorded!</h1>
        <p className="text-muted-foreground text-sm">Inventory has been updated and supplier ledger entry created.</p>
      </div>

      {/* Receipt card */}
      <div className="rounded-xl border bg-card overflow-hidden print:shadow-none">
        <div className="bg-orange-600 text-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest font-medium opacity-80">Purchase Order Receipt</p>
          <p className="text-xl font-bold mt-1">{ref}</p>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-semibold">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-semibold text-green-600">₹{paid.toFixed(2)}</span>
          </div>
          {balance > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance Due</span>
              <span className="font-semibold text-red-500">₹{balance.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Payment Status</span>
            <Badge variant={status === "paid" ? "default" : status === "partial" ? "secondary" : "destructive"}>
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </Button>
        <Button className="flex-1 gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/purchase")}>
          <ShoppingBag size={16} /> New Purchase
        </Button>
      </div>
    </div>
  );
}

export default function PurchaseReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
