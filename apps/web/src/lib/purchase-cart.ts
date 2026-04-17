import { Product } from "@/hooks/use-inventory";

export type PurchaseCartItem = {
  product: Product;
  quantity: number;
  price: number;
};

// Module-level singleton — scoped purchase session, cleared on receipt
export const purchaseCart = {
  _items: [] as PurchaseCartItem[],
  getAll() { return this._items; },
  add(product: Product, qty = 1) {
    const existing = this._items.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this._items.push({ product, quantity: qty, price: Number(product.purchasePrice) });
    }
  },
  updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      this._items = this._items.filter(i => i.product.id !== productId);
    } else {
      const item = this._items.find(i => i.product.id === productId);
      if (item) item.quantity = qty;
    }
  },
  updatePrice(productId: string, price: number) {
    const item = this._items.find(i => i.product.id === productId);
    if (item) item.price = price;
  },
  clear() { this._items = []; },
  get total() { return this._items.reduce((s, i) => s + i.price * i.quantity, 0); },
  get count() { return this._items.reduce((s, i) => s + i.quantity, 0); },
};
