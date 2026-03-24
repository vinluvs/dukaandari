import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

// POST /api/v1/products
router.post("/", async (req, res, next) => {
  try {
    const { ProductService } = await import("../services/product.service");
    const product = await ProductService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) { next(err); }
});

// GET /api/v1/products?shop_id=&page=&limit=&search=&category_id=&low_stock=
router.get("/", async (req, res, next) => {
  try {
    const { ProductService } = await import("../services/product.service");
    const result = await ProductService.list({ shopId: (req as any).shopId, query: req.query });
    res.json({ success: true, message: "OK", data: result });
  } catch (err) { next(err); }
});

// PUT /api/v1/products/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { ProductService } = await import("../services/product.service");
    const product = await ProductService.update(req.params["id"]!, req.body, (req as any).shopId);
    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) { next(err); }
});

// DELETE /api/v1/products/:id  (soft delete via is_active)
router.delete("/:id", async (req, res, next) => {
  try {
    const { ProductService } = await import("../services/product.service");
    await ProductService.deactivate(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "Product deactivated", data: null });
  } catch (err) { next(err); }
});

export default router;
