import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Offer {
  id: string;
  shopId: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  productId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  product?: { name: string };
  category?: { name: string };
}

export interface AutoOfferConfig {
  lookbackDays: number;
  limit: number;
  discountPercentage: number;
  enabled: boolean;
}

export function useOffers() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["offers", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Offer[] }>(`/offers?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/offers?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", activeShop?.id] });
      toast.success("Offer created successfully");
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.patch(`/offers/${id}?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", activeShop?.id] });
      toast.success("Offer updated successfully");
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/offers/${id}?shop_id=${activeShop?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", activeShop?.id] });
      toast.success("Offer deleted");
    },
  });
}

export function useOfferConfig() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["offers", "config", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: AutoOfferConfig }>(`/offers/config?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id,
  });
}

export function useUpdateOfferConfig() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async (payload: AutoOfferConfig) => {
      const { data } = await api.patch(`/offers/config?shop_id=${activeShop?.id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "config", activeShop?.id] });
      toast.success("Configuration updated");
    },
  });
}

export function useAutoGenerateOffers() {
  const queryClient = useQueryClient();
  const { activeShop } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/offers/auto-generate?shop_id=${activeShop?.id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", activeShop?.id] });
      toast.success("Offers generated for slow-moving items");
    },
  });
}
