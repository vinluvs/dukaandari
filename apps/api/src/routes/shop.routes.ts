import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// POST /api/v1/shops
router.post("/", async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    const shop = await ShopService.create(req.body, (req as any).userId);
    res.status(201).json({ success: true, message: "Shop created", data: shop });
  } catch (err) { next(err); }
});

// GET /api/v1/shops
router.get("/", async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    const shops = await ShopService.listForUser((req as any).userId);
    res.json({ success: true, message: "OK", data: shops });
  } catch (err) { next(err); }
});

// GET /api/v1/shops/:shopId
router.get("/:shopId", authorizeShop, async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    const shop = await ShopService.getById(String(req.params["shopId"]));
    res.json({ success: true, message: "OK", data: shop });
  } catch (err) { next(err); }
});

// PATCH /api/v1/shops/:shopId
router.patch("/:shopId", authorizeShop, async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    const shop = await ShopService.update(String(req.params["shopId"]), req.body);
    res.json({ success: true, message: "Shop updated", data: shop });
  } catch (err) { next(err); }
});

export default router;
