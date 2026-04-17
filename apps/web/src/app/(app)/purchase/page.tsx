"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ShoppingBag, ScanLine, Plus, Minus } from "lucide-react";
import { useProducts } from "@/hooks/use-inventory";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import { motion, AnimatePresence } from "framer-motion";
import { purchaseCart } from "@/lib/purchase-cart";

export default function PurchasePage() {
  const router = useRouter();
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleScan = (code: string) => {
    setScanOpen(false);
    setSearch(code);
    const match = products.find(p => p.barcode === code);
    if (match) { purchaseCart.add(match); refresh(); }
  };

  const qty = (id: string) => purchaseCart.getAll().find(i => i.product.id === id)?.quantity ?? 0;

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
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setScanOpen(true)}>
          <ScanLine size={18} />
        </Button>
        <Button
          className="relative gap-2 bg-orange-600 hover:bg-orange-700"
          onClick={() => router.push("/purchase/checkout")}
          disabled={purchaseCart.count === 0}
        >
          <ShoppingBag size={18} />
          Review Order
          {purchaseCart.count > 0 && (
            <motion.span
              key={purchaseCart.count}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="ml-1 rounded-full bg-white text-orange-600 text-xs font-bold px-1.5"
            >
              {purchaseCart.count}
            </motion.span>
          )}
        </Button>
        {purchaseCart.total > 0 && (
          <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">
            ₹{purchaseCart.total.toFixed(2)}
          </span>
        )}
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
          <AnimatePresence>
            {filtered.map(product => {
              const q = qty(product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative rounded-xl border bg-card p-3 flex flex-col gap-2 cursor-pointer transition-shadow hover:shadow-md ${q > 0 ? "border-orange-400/60 ring-1 ring-orange-300/40" : ""}`}
                  onClick={() => { purchaseCart.add(product); refresh(); }}
                >
                  {product.currentStock !== undefined && product.currentStock <= product.lowStockThreshold && (
                    <Badge variant="destructive" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">
                      Low
                    </Badge>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-orange-600">
                      ₹{Number(product.purchasePrice).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">Stock: {product.currentStock ?? 0}</span>
                  </div>
                  {q > 0 && (
                    <div className="flex items-center justify-between gap-1 mt-1" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => { purchaseCart.updateQty(product.id, q - 1); refresh(); }}>
                        <Minus size={12} />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">{q}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => { purchaseCart.add(product, 1); refresh(); }}>
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
