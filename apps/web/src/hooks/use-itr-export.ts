import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface ItrSalesItem {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  subtotal: number;
  discount: number;
  taxableValue: number;
  igst: number; cgst: number; sgst: number;
  totalTax: number;
  totalAmount: number;
  paymentStatus: string;
  gstEnabled: boolean;
  isIgst: boolean;
  items: {
    productName: string; hsnCode: string; uom: string;
    quantity: number; price: number; discount: number;
    gstPercentage: number; taxAmount: number; total: number;
  }[];
}

export interface ItrPurchaseItem {
  id: string; date: string; referenceId: string;
  supplierName: string; supplierGst: string;
  description: string; amount: number;
}

export interface ItrExpenseItem {
  id: string; date: string; category: string;
  description: string; amount: number;
}

export interface ItrReceivable {
  customerId: string; customerName: string;
  debit: number; credit: number; outstanding: number;
}

export interface ItrPayable {
  supplierId: string; supplierName: string;
  debit: number; credit: number; outstanding: number;
}

export interface ItrExportData {
  shopInfo: { name: string; gstNumber: string; address: string; ownerName: string; ownerEmail: string };
  financialYear: string;
  period: { start: string; end: string };
  plSummary: {
    totalSales: number; totalPurchases: number; totalExpenses: number;
    grossProfit: number; netProfit: number; taxCollected: number;
    invoiceCount: number; purchaseCount: number; expenseCount: number;
  };
  gstSummary: { totalTaxCollected: number; igst: number; cgst: number; sgst: number };
  paymentSummary: Record<string, { total: number; count: number }>;
  expenseByCategory: Record<string, number>;
  salesRegister: ItrSalesItem[];
  purchaseRegister: ItrPurchaseItem[];
  expenseRegister: ItrExpenseItem[];
  receivables: ItrReceivable[];
  payables: ItrPayable[];
}

export function useItrExport(year?: number) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "itr-export", activeShop?.id, year],
    queryFn: async () => {
      const url = `/reports/itr-export?shop_id=${activeShop?.id}&year=${year ?? new Date().getFullYear()}`;
      const { data } = await api.get(url);
      return data.data as ItrExportData;
    },
    enabled: !!activeShop?.id && !!year,
    staleTime: 5 * 60 * 1000, // cache 5 min — heavy query
  });
}
