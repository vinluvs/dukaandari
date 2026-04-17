import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreateCustomerInput, Customer } from "@dukaandari/shared";
import { toast } from "sonner";

export function useCustomers() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["customers", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get(`/customers?shop_id=${activeShop?.id}&limit=200`);
      return (data.data?.items ?? []) as Customer[];
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateCustomer() {
  const { activeShop } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCustomerInput) => {
      const { data } = await api.post(`/customers?shop_id=${activeShop?.id}`, payload);
      return data.data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", activeShop?.id] });
      toast.success("Customer created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create customer");
    },
  });
}

export function useCustomerLedger(id: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["customers", activeShop?.id, id, "ledger"],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${id}/ledger?shop_id=${activeShop?.id}`);
      return data.data;
    },
    enabled: !!activeShop?.id && !!id,
  });
}
