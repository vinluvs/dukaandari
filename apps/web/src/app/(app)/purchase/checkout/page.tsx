"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, ShoppingBag, Trash2, Pencil, Check } from "lucide-react";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCreatePurchase } from "@/hooks/use-purchases";
import { purchaseCart } from "@/lib/purchase-cart";
import { toast } from "sonner";

export default function PurchaseCheckoutPage() {
  const router = useRouter();
  const { data: suppliers = [] } = useSuppliers();
  const { mutateAsync: createPurchase, isPending } = useCreatePurchase();

  const [supplierId, setSupplierId] = useState<string>("walk-in");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "bank" | "card">("cash");
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const items = purchaseCart.getAll();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxTotal = gstEnabled
    ? items.reduce((s, i) => s + (i.price * i.quantity * (Number(i.product.gstPercentage ?? 0))) / 100, 0)
    : 0;
  const netTotal = subtotal + taxTotal;

  const handleRecord = async () => {
    if (items.length === 0) return;
    try {
      const result = await createPurchase({
        supplierId: supplierId === "walk-in" ? undefined : supplierId,
        gstEnabled,
        paymentAmount: parseFloat(paymentAmount) || netTotal,
        paymentMode,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.price,
          gstPercentage: Number(i.product.gstPercentage ?? 0),
        })),
      });
      purchaseCart.clear();
      router.push(`/purchase/receipt?ref=${result.purchaseRef}&total=${result.totalAmount}&paid=${result.paymentAmount}&status=${result.paymentStatus}`);
    } catch {
      // error already handled by hook
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <ShoppingBag size={48} className="opacity-30" />
        <p>Your purchase order is empty</p>
        <Button variant="outline" onClick={() => router.push("/purchase")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Purchase
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.push("/purchase")}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Order</h1>
          <p className="text-muted-foreground text-sm">{items.length} product(s) selected</p>
        </div>
      </div>

      {/* Items List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <p className="font-medium text-sm">Items — tap price to edit</p>
        </div>
        <ScrollArea className="max-h-72">
          <div className="divide-y">
            {items.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* inline price edit */}
                    {editingPrice === item.product.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">₹</span>
                        <Input
                          autoFocus
                          type="number"
                          step="0.01"
                          value={priceInput}
                          onChange={e => setPriceInput(e.target.value)}
                          className="h-6 w-20 text-xs px-1"
                        />
                        <Button size="icon" variant="ghost" className="h-5 w-5"
                          onClick={() => {
                            const p = parseFloat(priceInput);
                            if (!isNaN(p) && p >= 0) purchaseCart.updatePrice(item.product.id, p);
                            setEditingPrice(null);
                            refresh();
                          }}>
                          <Check size={10} />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-orange-600 font-medium flex items-center gap-1 hover:underline"
                        onClick={() => { setEditingPrice(item.product.id); setPriceInput(String(item.price)); }}
                      >
                        ₹{item.price.toFixed(2)} <Pencil size={9} />
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                  </div>
                </div>
                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                  onClick={() => { purchaseCart.updateQty(item.product.id, 0); refresh(); }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Supplier & Settings */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid gap-2">
          <Label>Supplier</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Walk-in Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in Supplier</SelectItem>
              {suppliers.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${gstEnabled ? "bg-orange-50 border border-orange-200 dark:bg-orange-900/20" : ""}`}>
          <div>
            <Label className={gstEnabled ? "text-orange-700 font-semibold dark:text-orange-300" : ""}>Enable GST on Purchase</Label>
            {gstEnabled && <p className="text-xs text-muted-foreground">Tax calculated per item&apos;s GST rate</p>}
          </div>
          <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
        </div>
      </div>

      {/* Bill Summary */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {gstEnabled && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST</span>
            <span>₹{taxTotal.toFixed(2)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="text-orange-600">₹{netTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Amount Paid</Label>
            <Input
              type="number"
              step="0.01"
              placeholder={netTotal.toFixed(2)}
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Mode</Label>
            <Select value={paymentMode} onValueChange={v => setPaymentMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paymentAmount && parseFloat(paymentAmount) < netTotal && (
          <p className="text-sm text-amber-500">
            ⚠ Balance due: ₹{(netTotal - parseFloat(paymentAmount)).toFixed(2)} — will be tracked as supplier credit.
          </p>
        )}

        <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg" onClick={handleRecord} disabled={isPending}>
          {isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {isPending ? "Recording..." : `Record Purchase ₹${netTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
