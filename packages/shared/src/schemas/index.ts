import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  uomId: z.string().uuid().optional(),
  gstPercentage: z.number().min(0).max(100).default(0),
  hsnCode: z.string().optional(),
  sellingPrice: z.number().min(0),
  purchasePrice: z.number().min(0),
  lowStockThreshold: z.number().int().min(0).default(0),
  openingStock: z.number().min(0).default(0),
});

export const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  gstEnabled: z.boolean().default(false),
  isIgst: z.boolean().default(false),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      uomId: z.string().uuid().optional(),
      quantity: z.number().positive(),
      price: z.number().min(0),
      discount: z.number().min(0).default(0),
      gstPercentage: z.number().min(0).max(100).default(0),
    })
  ).min(1),
  notes: z.string().optional(),
  paymentMode: z.enum(["cash", "upi", "bank", "card"]).default("cash"),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  creditLimit: z.coerce.number().min(0),
});

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  gstNumber: z.string().optional().nullable(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  shop_id: z.string().uuid(),
});

export const CreateExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
