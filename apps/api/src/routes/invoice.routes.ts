import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

// POST /api/v1/invoices  – full transaction (validate stock → calc → ledger → inventory → payment)
router.post("/", async (req, res, next) => {
  try {
    const { InvoiceService } = await import("../services/invoice.service");
    const invoice = await InvoiceService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Invoice created", data: invoice });
  } catch (err) { next(err); }
});

// GET /api/v1/invoices?shop_id=&page=&limit=&customer_id=&status=&payment_status=
router.get("/", async (req, res, next) => {
  try {
    const { InvoiceService } = await import("../services/invoice.service");
    const result = await InvoiceService.list({ shopId: (req as any).shopId, query: req.query });
    res.json({ success: true, message: "OK", data: result });
  } catch (err) { next(err); }
});

// GET /api/v1/invoices/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { InvoiceService } = await import("../services/invoice.service");
    const invoice = await InvoiceService.getById(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "OK", data: invoice });
  } catch (err) { next(err); }
});

// POST /api/v1/invoices/:id/void  – append-only; no deletion
router.post("/:id/void", async (req, res, next) => {
  try {
    const { InvoiceService } = await import("../services/invoice.service");
    await InvoiceService.voidInvoice(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "Invoice voided", data: null });
  } catch (err) { next(err); }
});

export default router;
