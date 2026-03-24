import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

router.post("/", async (req, res, next) => {
  try {
    const { CustomerService } = await import("../services/customer.service");
    const customer = await CustomerService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Customer created", data: customer });
  } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try {
    const { CustomerService } = await import("../services/customer.service");
    const result = await CustomerService.list({ shopId: (req as any).shopId, query: req.query });
    res.json({ success: true, message: "OK", data: result });
  } catch (err) { next(err); }
});

// GET /api/v1/customers/:id/ledger
router.get("/:id/ledger", async (req, res, next) => {
  try {
    const { CustomerService } = await import("../services/customer.service");
    const ledger = await CustomerService.getLedger(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "OK", data: ledger });
  } catch (err) { next(err); }
});

// POST /api/v1/customers/:id/payment
router.post("/:id/payment", async (req, res, next) => {
  try {
    const { CustomerService } = await import("../services/customer.service");
    const payment = await CustomerService.recordPayment(req.params["id"]!, req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Payment recorded", data: payment });
  } catch (err) { next(err); }
});

export default router;
