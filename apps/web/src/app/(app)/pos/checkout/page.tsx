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
import { ArrowLeft, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomers } from "@/hooks/use-customers";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, removeFromCart } = useCart();
  const { activeShop } = useAuth();
  const [gstEnabled, setGstEnabled] = useState(false);
  const [isIgst, setIsIgst] = useState(false);
  const [customerId, setCustomerId] = useState<string>("walk-in");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [manualDiscount, setManualDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: customers = [] } = useCustomers();

  const cartSubtotal = cart.reduce((acc, c) => acc + Number(c.product.sellingPrice) * c.quantity, 0);
  const cartOfferDiscount = cart.reduce((acc, c) => {
    const price = Number(c.product.sellingPrice);
    const bestOffer = c.product.offers?.reduce((prev, curr) => {
      let val = 0;
      if (curr.discountType === "PERCENTAGE") val = (price * Number(curr.discountValue)) / 100;
      else val = Number(curr.discountValue);
      return val > prev.val ? { val, id: curr.id } : prev;
    }, { val: 0, id: null as string | null });
    return acc + (bestOffer?.val ?? 0) * c.quantity;
  }, 0);

  const manualDiscVal = parseFloat(manualDiscount) || 0;
  const totalDiscount = cartOfferDiscount + manualDiscVal;

  const taxTotal = gstEnabled
    ? cart.reduce((acc, c) => {
        const price = Number(c.product.sellingPrice);
        const bestOffer = c.product.offers?.reduce((prev, curr) => {
          let val = 0;
          if (curr.discountType === "PERCENTAGE") val = (price * Number(curr.discountValue)) / 100;
          else val = Number(curr.discountValue);
          return val > prev.val ? { val, id: curr.id } : prev;
        }, { val: 0, id: null as string | null });
        const lineDiscount = bestOffer?.val ?? 0;
        const taxableAmount = (price - lineDiscount) * c.quantity;
        return acc + (taxableAmount * (Number(c.product.gstPercentage) ?? 0)) / 100;
      }, 0)
    : 0;

  const netTotal = cartSubtotal - totalDiscount + taxTotal;

  const handleBill = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        customerId: customerId === "walk-in" ? undefined : customerId,
        gstEnabled,
        isIgst,
        manualDiscount: manualDiscVal,
        paymentAmount: parseFloat(paymentAmount) || netTotal,
        paymentMode,
        items: cart.map((c) => {
          const price = Number(c.product.sellingPrice);
          const bestOffer = c.product.offers?.reduce((prev, curr) => {
            let val = 0;
            if (curr.discountType === "PERCENTAGE") val = (price * Number(curr.discountValue)) / 100;
            else val = Number(curr.discountValue);
            return val > prev.val ? { val, id: curr.id } : prev;
          }, { val: 0, id: null as string | null });

          return {
            productId: c.product.id,
            quantity: c.quantity,
            price,
            discount: (bestOffer?.val ?? 0),
            offerId: bestOffer?.id ?? undefined,
            gstPercentage: Number(c.product.gstPercentage ?? 0),
          };
        }),
      };

      const { data } = await api.post(`/invoices?shop_id=${activeShop?.id}`, payload);
      clearCart();
      router.push(`/pos/invoice/${data.data.id}?print=1`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <ShoppingCart size={48} className="opacity-30" />
        <p>Your cart is empty</p>
        <Button variant="outline" onClick={() => router.push("/pos")}>
          <ArrowLeft size={16} className="mr-2" /> Back to POS
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.push("/pos")}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground text-sm">{cart.length} item(s) in cart</p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <p className="font-medium text-sm">Items</p>
        </div>
        <ScrollArea className="max-h-60">
          <div className="divide-y">
            {cart.map((c) => (
              <div key={c.product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{Number(c.product.sellingPrice).toFixed(2)} × {c.quantity}
                    {gstEnabled && Number(c.product.gstPercentage) > 0
                      ? ` + ${c.product.gstPercentage}% GST`
                      : ""}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  ₹{(Number(c.product.sellingPrice) * c.quantity).toFixed(2)}
                </p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeFromCart(c.product.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Customer & Settings */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid gap-2">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Walk-in Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              {customers.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${gstEnabled ? "bg-primary/10 border border-primary/30" : ""}`}>
          <div>
            <Label className={gstEnabled ? "text-primary font-semibold" : ""}>Enable GST</Label>
            {gstEnabled && <p className="text-xs text-muted-foreground">Tax will be calculated on each item</p>}
          </div>
          <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
        </div>
        {gstEnabled && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <Label className="text-sm">Interstate (use IGST instead of CGST/SGST)</Label>
            <Switch checked={isIgst} onCheckedChange={setIsIgst} />
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{cartSubtotal.toFixed(2)}</span>
        </div>
        {cartOfferDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">Offers Applied</span>
            <span>- ₹{cartOfferDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm gap-4">
          <span className="text-muted-foreground whitespace-nowrap">Manual Discount</span>
          <div className="relative w-24">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              className="h-7 pl-5 text-right text-xs"
              placeholder="0.00"
              value={manualDiscount}
              onChange={(e) => setManualDiscount(e.target.value)}
            />
          </div>
        </div>
        {gstEnabled && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{isIgst ? "IGST" : "CGST + SGST"}</span>
            <span>₹{taxTotal.toFixed(2)}</span>
          </div>
        )}
        <Separator className="my-1" />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="text-primary">₹{netTotal.toFixed(2)}</span>
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
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
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
            ⚠ Balance due: ₹{(netTotal - parseFloat(paymentAmount)).toFixed(2)} — will be tracked as credit.
          </p>
        )}

        <Button className="w-full" size="lg" onClick={handleBill} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {loading ? "Processing..." : `Bill ₹${netTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
