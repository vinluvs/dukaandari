import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreateSupplierInput, Supplier } from "@dukaandari/shared";
import { toast } from "sonner";

export function useSuppliers() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["suppliers", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get(`/suppliers?shop_id=${activeShop?.id}&limit=200`);
      return (data.data?.items ?? []) as Supplier[];
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateSupplier() {
  const { activeShop } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSupplierInput) => {
      const { data } = await api.post(`/suppliers?shop_id=${activeShop?.id}`, payload);
      return data.data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeShop?.id] });
      toast.success("Supplier created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create supplier");
    },
  });
}

export function useSupplierLedger(id: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["suppliers", activeShop?.id, id, "ledger"],
    queryFn: async () => {
      const { data } = await api.get(`/suppliers/${id}/ledger?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id && !!id,
  });
}
