"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeShop } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice ? `Invoice-${invoice.invoiceNumber}` : "Invoice",
    pageStyle: `
      @page { size: 80mm auto; margin: 6mm; }
      body { font-family: monospace; font-size: 12px; }
    `,
  });

  useEffect(() => {
    if (!activeShop?.id) return;
    api.get(`/invoices/${id}?shop_id=${activeShop?.id}`)
      .then(({ data }) => {
        setInvoice(data.data);
        if (searchParams.get("print") === "1") {
          setTimeout(() => handlePrint(), 800);
        }
      })
      .finally(() => setLoading(false));
  }, [id, activeShop?.id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4 mt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  const badgeVariant: Record<string, any> = {
    paid: "default",
    partial: "secondary",
    unpaid: "destructive",
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Toolbar (screen only) */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push("/pos")}>
          <ArrowLeft size={14} className="mr-1" /> Back to POS
        </Button>
        <Button size="sm" onClick={() => handlePrint()}>
          <Printer size={14} className="mr-1" /> Print Receipt
        </Button>
      </div>

      {/* ─── PRINTABLE RECEIPT ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        ref={printRef}
        className="rounded-2xl border bg-card p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide print:text-gray-500">
              {activeShop?.name}
            </p>
            <h1 className="text-2xl font-bold print:text-black">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 print:hidden">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              <CheckCircle2 className="text-green-500" size={36} />
            </motion.div>
            <Badge variant={badgeVariant[invoice.paymentStatus]} className="capitalize">
              {invoice.paymentStatus}
            </Badge>
          </div>
          {/* Print-only status text */}
          <p className="hidden print:block text-sm font-semibold capitalize">{invoice.paymentStatus}</p>
        </div>

        {/* Customer */}
        <div className="text-sm">
          <p className="text-muted-foreground print:text-gray-500">Bill To</p>
          <p className="font-medium print:text-black">{invoice.customer?.name ?? "Walk-in Customer"}</p>
          {invoice.customer?.phone && (
            <p className="text-muted-foreground print:text-gray-500">{invoice.customer.phone}</p>
          )}
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          {invoice.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium print:text-black">{item.product?.name}</p>
                <p className="text-muted-foreground text-xs print:text-gray-500">
                  ₹{Number(item.price).toFixed(2)} × {Number(item.quantity)}
                  {Number(item.gstPercentage) > 0 ? ` + ${item.gstPercentage}% GST` : ""}
                </p>
              </div>
              <p className="font-medium print:text-black">₹{Number(item.total).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground print:text-gray-500">
            <span>Subtotal</span>
            <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
          </div>
          {Number(invoice.totalDiscount) > 0 && (
            <div className="flex justify-between text-muted-foreground print:text-gray-500">
              <span>Discount</span>
              <span>–₹{Number(invoice.totalDiscount).toFixed(2)}</span>
            </div>
          )}
          {Number(invoice.totalTax) > 0 && (
            <div className="flex justify-between text-muted-foreground print:text-gray-500">
              <span>{invoice.isIgst ? "IGST" : "CGST + SGST"}</span>
              <span>₹{Number(invoice.totalTax).toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span className="print:text-black">Total</span>
            <span className="text-primary print:text-black">₹{Number(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment info */}
        {invoice.payments?.length > 0 && (
          <div className="text-xs text-muted-foreground print:text-gray-500">
            Paid via {invoice.payments[0].mode.toUpperCase()} — ₹{Number(invoice.payments[0].amount).toFixed(2)}
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground print:text-gray-500 print:mt-6">
          Thank you for your purchase! 🙏
        </div>
      </motion.div>
    </div>
  );
}
