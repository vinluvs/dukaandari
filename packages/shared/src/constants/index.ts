export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    RESET_PASSWORD: "/auth/reset-password",
  },
  SHOPS: "/shops",
  PRODUCTS: "/products",
  CATEGORIES: "/product-categories",
  UOMS: "/uoms",
  INVOICES: "/invoices",
  CUSTOMERS: "/customers",
  SUPPLIERS: "/suppliers",
  EXPENSES: "/expenses",
  REPORTS: {
    DAILY: "/reports/daily",
    MONTHLY: "/reports/monthly",
    FINANCIAL_YEAR: "/reports/financial-year",
  },
} as const;

export const PAYMENT_MODES = ["cash", "upi", "bank", "card"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = (typeof GST_RATES)[number];

export const INVOICE_STATUS = ["active", "voided"] as const;
export const PAYMENT_STATUS = ["paid", "partial", "unpaid"] as const;

export const CHANGE_TYPES = ["sale", "purchase", "adjustment", "opening"] as const;
