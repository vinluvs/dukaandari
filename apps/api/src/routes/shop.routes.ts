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

router.patch("/:shopId", authorizeShop, async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    const shop = await ShopService.update(String(req.params["shopId"]), req.body);
    res.json({ success: true, message: "Shop updated", data: shop });
  } catch (err) { next(err); }
});

// POST /api/v1/shops/:shopId/reset
router.post("/:shopId/reset", authorizeShop, async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    await ShopService.resetData(String(req.params["shopId"]), (req as any).userId);
    res.json({ success: true, message: "Shop data reset successfully" });
  } catch (err) { next(err); }
});

// DELETE /api/v1/shops/:shopId
router.delete("/:shopId", authorizeShop, async (req, res, next) => {
  try {
    const { ShopService } = await import("../services/shop.service");
    await ShopService.deleteShop(String(req.params["shopId"]), (req as any).userId);
    res.json({ success: true, message: "Shop deleted successfully" });
  } catch (err) { next(err); }
});

export default router;
