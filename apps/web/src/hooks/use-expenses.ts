import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreateExpenseInput, Expense } from "@dukaandari/shared";
import { toast } from "sonner";

export function useExpenses() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["expenses", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get(`/expenses?shop_id=${activeShop?.id}&limit=200`);
      return (data.data?.items ?? []) as Expense[];
    },
    enabled: !!activeShop?.id,
  });
}

export function useCreateExpense() {
  const { activeShop } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpenseInput) => {
      const { data } = await api.post(`/expenses?shop_id=${activeShop?.id}`, payload);
      return data.data as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", activeShop?.id] });
      toast.success("Expense recorded successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to record expense");
    },
  });
}

export function useDeleteExpense() {
  const { activeShop } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/expenses/${id}?shop_id=${activeShop?.id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", activeShop?.id] });
      toast.success("Expense deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    },
  });
}
