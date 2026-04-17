import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  DailyReportData,
  MonthlyReportData,
  FinancialYearReportData,
  SalesLedgerItem,
  PurchaseLedgerItem,
  Expense,
} from "@dukaandari/shared";

export function useDailyReport(date?: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "daily", activeShop?.id, date],
    queryFn: async () => {
      let url = `/reports/daily?shop_id=${activeShop?.id}`;
      if (date) url += `&date=${date}`;
      const { data } = await api.get(url);
      return data.data as DailyReportData;
    },
    enabled: !!activeShop?.id,
  });
}

export function useMonthlyReport(year?: number, month?: number) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "monthly", activeShop?.id, year, month],
    queryFn: async () => {
      let url = `/reports/monthly?shop_id=${activeShop?.id}`;
      if (year) url += `&year=${year}`;
      if (month) url += `&month=${month}`;
      const { data } = await api.get(url);
      return data.data as MonthlyReportData;
    },
    enabled: !!activeShop?.id,
  });
}

export function useFinancialYearReport(year?: number) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "financial-year", activeShop?.id, year],
    queryFn: async () => {
      let url = `/reports/financial-year?shop_id=${activeShop?.id}`;
      if (year) url += `&year=${year}`;
      const { data } = await api.get(url);
      return data.data as FinancialYearReportData;
    },
    enabled: !!activeShop?.id,
  });
}

export function useSalesLedger(startDate?: string, endDate?: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "ledger", "sales", activeShop?.id, startDate, endDate],
    queryFn: async () => {
      let url = `/reports/ledger/sales?shop_id=${activeShop?.id}&limit=100`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const { data } = await api.get(url);
      return data.data?.items as SalesLedgerItem[];
    },
    enabled: !!activeShop?.id,
  });
}

export function useExpenseLedger(startDate?: string, endDate?: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "ledger", "expenses", activeShop?.id, startDate, endDate],
    queryFn: async () => {
      let url = `/reports/ledger/expenses?shop_id=${activeShop?.id}&limit=100`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const { data } = await api.get(url);
      return data.data?.items as Expense[];
    },
    enabled: !!activeShop?.id,
  });
}

export function usePurchaseLedger(startDate?: string, endDate?: string) {
  const { activeShop } = useAuth();
  return useQuery({
    queryKey: ["reports", "ledger", "purchases", activeShop?.id, startDate, endDate],
    queryFn: async () => {
      let url = `/reports/ledger/purchases?shop_id=${activeShop?.id}&limit=100`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const { data } = await api.get(url);
      return data.data?.items as PurchaseLedgerItem[];
    },
    enabled: !!activeShop?.id,
  });
}
