"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getAccessToken, setTokens, clearTokens } from "@/lib/auth-storage";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isVerified: boolean;
}

interface Shop {
  id: string;
  name: string;
  gstNumber?: string | null;
  address?: string | null;
  financialYearStartMonth: number;
}

interface AuthState {
  user: User | null;
  shops: Shop[];
  activeShop: Shop | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  setActiveShop: (shop: Shop) => void;
  refreshUser: () => Promise<void>;
  refreshShops: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShopState] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const res = await api.get<{ success: boolean; data: User }>("/profile");
    setUser(res.data.data);
  }, []);

  const fetchShops = useCallback(async () => {
    const res = await api.get<{ success: boolean; data: Shop[] }>("/shops");
    const list = res.data.data;
    setShops(list);
    // Restore active shop from localStorage or default to first
    const savedId = localStorage.getItem("dk_active_shop");
    const saved = list.find((s) => s.id === savedId) ?? list[0] ?? null;
    setActiveShopState(saved ?? null);
  }, []);

  // Hydrate on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    Promise.all([fetchUser(), fetchShops()])
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, [fetchUser, fetchShops]);

  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    await Promise.all([fetchUser(), fetchShops()]);
  }, [fetchUser, fetchShops]);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem("dk_active_shop");
    setUser(null);
    setShops([]);
    setActiveShopState(null);
    window.location.href = "/login";
  }, []);

  const setActiveShop = useCallback((shop: Shop) => {
    setActiveShopState(shop);
    localStorage.setItem("dk_active_shop", shop.id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        shops,
        activeShop,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setActiveShop,
        refreshUser: fetchUser,
        refreshShops: fetchShops,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
