"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Product } from "@/hooks/use-inventory";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
  cartDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      
      if (product.currentStock !== undefined && currentQty + quantity > product.currentStock) {
        toast.error(`Only ${product.currentStock} units available for ${product.name}`);
        return prev;
      }
      
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.product.currentStock !== undefined && quantity > existing.product.currentStock) {
        toast.error(`Only ${existing.product.currentStock} units available for ${existing.product.name}`);
        return prev;
      }
      return prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
    });
  };

  const clearCart = () => setCart([]);

  const { cartTotal, cartDiscount, totalItems } = useMemo(() => {
    let total = 0;
    let discount = 0;
    let items = 0;
    cart.forEach((item) => {
      const price = Number(item.product.sellingPrice);
      const qty = item.quantity;
      items += qty;
      const subtotal = price * qty;
      
      const bestOffer = item.product.offers?.reduce((prev, curr) => {
        let val = 0;
        if (curr.discountType === "PERCENTAGE") val = (price * Number(curr.discountValue)) / 100;
        else val = Number(curr.discountValue);
        return val > prev.val ? { val, id: curr.id } : prev;
      }, { val: 0, id: null as string | null });

      const lineDiscount = (bestOffer?.val ?? 0) * qty;
      total += subtotal - lineDiscount;
      discount += lineDiscount;
    });
    return { cartTotal: total, cartDiscount: discount, totalItems: items };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, cartTotal, cartDiscount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
