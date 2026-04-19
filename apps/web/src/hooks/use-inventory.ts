import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Basic Types based on schema
export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Uom {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  valuationMethod?: string;
  currentStock?: number;
  categoryId?: string;
  uomId?: string;
  sellingPrice: number;
  purchasePrice: number;
  gstPercentage?: number;
  hsnCode?: string;
  lowStockThreshold: number;
  imageUrl?: string;
  isActive: boolean;
  category?: Category;
  uom?: Uom;
  offers?: any[];
}

// ─── CATEGORIES ───
export function useCategories() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["categories", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Category[] }>(`/product-categories?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await api.post(`/product-categories?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", activeShop?.id] });
      toast.success("Category created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; description?: string }) => {
      const { data } = await api.put(`/product-categories/${id}?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", activeShop?.id] });
      toast.success("Category updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/product-categories/${id}?shop_id=${activeShop?.id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", activeShop?.id] });
      toast.success("Category deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });
}


// ─── UOM ───
export function useUoms() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["uoms", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Uom[] }>(`/uoms?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateUom() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (payload: { name: string; symbol: string }) => {
      const { data } = await api.post(`/uoms?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms", activeShop?.id] });
      toast.success("UOM created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create UOM");
    },
  });
}

export function useUpdateUom() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; symbol: string }) => {
      const { data } = await api.put(`/uoms/${id}?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms", activeShop?.id] });
      toast.success("UOM updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update UOM");
    },
  });
}

export function useDeleteUom() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/uoms/${id}?shop_id=${activeShop?.id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms", activeShop?.id] });
      toast.success("UOM deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete UOM");
    },
  });
}


// ─── PRODUCTS ───
export function useProducts() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["products", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { items: Product[]; total: number; page: number; limit: number; pages: number } }>(`/products?shop_id=${activeShop?.id}`);
      return data.data.items;
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/products?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeShop?.id] });
      toast.success("Product created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.put(`/products/${id}?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeShop?.id] });
      toast.success("Product updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/products/${id}?shop_id=${activeShop?.id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeShop?.id] });
      toast.success("Product deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete product");
    },
  });
}
