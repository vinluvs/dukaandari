import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

router.post("/", async (req, res, next) => {
  try {
    const { CategoryService } = await import("../services/category.service");
    const cat = await CategoryService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Category created", data: cat });
  } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try {
    const { CategoryService } = await import("../services/category.service");
    const cats = await CategoryService.list((req as any).shopId);
    res.json({ success: true, message: "OK", data: cats });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { CategoryService } = await import("../services/category.service");
    const cat = await CategoryService.update(req.params["id"]!, req.body, (req as any).shopId);
    res.json({ success: true, message: "Category updated", data: cat });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { CategoryService } = await import("../services/category.service");
    await CategoryService.deactivate(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "Category deactivated", data: null });
  } catch (err) { next(err); }
});

export default router;
