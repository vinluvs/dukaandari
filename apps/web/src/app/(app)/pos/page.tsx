"use client";

import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ShoppingCart, ScanLine, Plus, Minus } from "lucide-react";
import { useProducts } from "@/hooks/use-inventory";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import { motion, AnimatePresence } from "framer-motion";

export default function POSPage() {
  const router = useRouter();
  const { data: products = [] } = useProducts();
  const { cart, addToCart, updateQuantity, totalItems, cartTotal } = useCart();
  const [search, setSearch] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const cartMap = useMemo(() => {
    const m = new Map<string, number>();
    cart.forEach((c) => m.set(c.product.id, c.quantity));
    return m;
  }, [cart]);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    
    // Sort items with offers to the top
    return [...result].sort((a, b) => {
      const aHasOffer = (a.offers?.length || 0) > 0;
      const bHasOffer = (b.offers?.length || 0) > 0;
      if (aHasOffer && !bHasOffer) return -1;
      if (!aHasOffer && bHasOffer) return 1;
      return 0;
    });
  }, [products, search]);

  const handleScan = (code: string) => {
    setScanOpen(false);
    setSearch(code);
    const match = products.find((p) => p.barcode === code);
    if (match) addToCart(match);
  };

  const qty = (id: string) => cartMap.get(id) ?? 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            className="pl-9"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setScanOpen(true)}>
          <ScanLine size={18} />
        </Button>
        <Button
          className="relative gap-2"
          onClick={() => router.push("/pos/checkout")}
          disabled={totalItems === 0}
        >
          <ShoppingCart size={18} />
          Checkout
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="ml-1 rounded-full bg-primary-foreground text-primary text-xs font-bold px-1.5"
            >
              {totalItems}
            </motion.span>
          )}
        </Button>
        {cartTotal > 0 && (
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            ₹{cartTotal.toFixed(2)}
          </span>
        )}
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
          <AnimatePresence>
            {filtered.map((product) => {
              const q = qty(product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative rounded-xl border bg-card p-3 flex flex-col gap-2 transition-shadow ${product.currentStock === 0 ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:shadow-md"} ${q > 0 ? "border-primary/60 ring-1 ring-primary/30" : ""}`}
                  onClick={() => product.currentStock && product.currentStock > 0 && addToCart(product)}
                >
                  {/* Stock and Offer badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {product.currentStock !== undefined && product.currentStock <= product.lowStockThreshold && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                        Low
                      </Badge>
                    )}
                    {(product.offers?.length || 0) > 0 && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-1.5 py-0.5">
                        Offer
                      </Badge>
                    )}
                  </div>
                  {/* Product info */}
                  <div className="flex-1">
                    <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-primary">₹{Number(product.sellingPrice).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">Stock: {product.currentStock ?? 0}</span>
                  </div>

                  {/* Quantity Controls */}
                  {q > 0 && (
                    <div
                      className="flex items-center justify-between gap-1 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(product.id, q - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">{q}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addToCart(product, 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
              <Search size={40} className="opacity-30" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Barcode Scanner Modal */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>Point camera at the product barcode.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {scanOpen && <BarcodeScanner onScan={handleScan} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
