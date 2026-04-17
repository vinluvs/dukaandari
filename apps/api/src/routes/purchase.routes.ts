import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

// POST /api/v1/purchases?shop_id=
router.post("/", async (req, res, next) => {
  try {
    const { PurchaseService } = await import("../services/purchase.service");
    const data = await PurchaseService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Purchase recorded", data });
  } catch (err) { next(err); }
});

export default router;
