import { Router } from "express";
import authRoutes from "./auth.routes";
import shopRoutes from "./shop.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import uomRoutes from "./uom.routes";
import invoiceRoutes from "./invoice.routes";
import customerRoutes from "./customer.routes";
import supplierRoutes from "./supplier.routes";
import expenseRoutes from "./expense.routes";
import reportRoutes from "./report.routes";
import profileRoutes from "./profile.routes";
import purchaseRoutes from "./purchase.routes";

export const router = Router();

// Health check (public)
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { status: "healthy", timestamp: new Date().toISOString() } });
});

// Auth (public)
router.use("/auth", authRoutes);

// Protected routes (require valid JWT + shop membership)
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/product-categories", categoryRoutes);
router.use("/uoms", uomRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/customers", customerRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/expenses", expenseRoutes);
router.use("/reports", reportRoutes);
router.use("/profile", profileRoutes);
router.use("/purchases", purchaseRoutes);

