import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface PurchaseItem {
  productId: string;
  quantity: number;
  price: number;
  gstPercentage?: number;
}

export interface CreatePurchasePayload {
  supplierId?: string;
  items: PurchaseItem[];
  paymentAmount?: number;
  paymentMode: "cash" | "upi" | "bank" | "card";
  notes?: string;
  gstEnabled?: boolean;
}

export interface PurchaseResult {
  purchaseRef: string;
  supplierId: string;
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  paymentAmount: number;
  paymentStatus: string;
  items: Array<PurchaseItem & { taxAmount: number; total: number }>;
}

export function useCreatePurchase() {
  const { activeShop } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreatePurchasePayload) => {
      const { data } = await api.post(`/purchases?shop_id=${activeShop?.id}`, payload);
      return data.data as PurchaseResult;
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to record purchase");
    },
  });
}
