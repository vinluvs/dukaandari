import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useCustomers() {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["customers", activeShop?.id],
    queryFn: async () => {
      const { data } = await api.get(`/customers?shop_id=${activeShop?.id}&limit=200`);
      return data.data?.items ?? [];
    },
    enabled: !!activeShop?.id,
  });
}
