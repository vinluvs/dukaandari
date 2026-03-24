"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Store, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const { shops, activeShop, setActiveShop, user, logout } = useAuth();
  const [shopOpen, setShopOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  return (
    <header className="flex items-center justify-between px-4 h-16 border-b border-border bg-card shrink-0 relative z-40">
      {/* Shop selector */}
      <div className="relative">
        <button
          onClick={() => { setShopOpen((o) => !o); setUserOpen(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Store size={15} className="text-muted-foreground" />
          <span className="max-w-[150px] truncate">{activeShop?.name ?? "Select shop"}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1 left-0 bg-popover border border-border rounded-md shadow-md min-w-[200px]"
            >
              {shops.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No shops yet</p>
              )}
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => { setActiveShop(shop); setShopOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${activeShop?.id === shop.id ? "font-medium text-primary" : ""}`}
                >
                  <Store size={13} />
                  {shop.name}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1 pb-1">
                <Link
                  href="/onboarding"
                  onClick={() => setShopOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Plus size={13} /> Add shop
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <motion.a
          href="/pos"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          <Plus size={15} /> Add Sale
        </motion.a>
        <motion.a
          href="/purchase"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Plus size={15} /> Purchase
        </motion.a>

        {/* User avatar + dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => { setUserOpen((o) => !o); setShopOpen(false); }}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center hover:opacity-90 transition"
          >
            {initials}
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-md shadow-md min-w-[180px]"
              >
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link href="/account" onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <User size={13} /> Account
                </Link>
                <Link href="/settings" onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Settings size={13} /> Settings
                </Link>
                <div className="border-t border-border mt-1 pt-1 pb-1">
                  <button
                    onClick={() => { setUserOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
