export type PaymentStatus = "paid" | "partial" | "unpaid";
export type InvoiceStatus = "active" | "voided";

export interface InvoiceItem {
  productId: string;
  uomId?: string;
  quantity: number;
  price: number;
  discount?: number;
  gstPercentage?: number;
}

export interface Invoice {
  id: string;
  shopId: string;
  invoiceNumber: string;
  customerId?: string | null;
  gstEnabled: boolean;
  isIgst: boolean;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
