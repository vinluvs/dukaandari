import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

router.post("/", async (req, res, next) => {
  try {
    const { SupplierService } = await import("../services/supplier.service");
    const supplier = await SupplierService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Supplier created", data: supplier });
  } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try {
    const { SupplierService } = await import("../services/supplier.service");
    const result = await SupplierService.list({ shopId: (req as any).shopId, query: req.query });
    res.json({ success: true, message: "OK", data: result });
  } catch (err) { next(err); }
});

router.get("/:id/ledger", async (req, res, next) => {
  try {
    const { SupplierService } = await import("../services/supplier.service");
    const ledger = await SupplierService.getLedger(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "OK", data: ledger });
  } catch (err) { next(err); }
});

export default router;
