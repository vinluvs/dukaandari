import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

router.post("/", async (req, res, next) => {
  try {
    const { UomService } = await import("../services/uom.service");
    const uom = await UomService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "UOM created", data: uom });
  } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try {
    const { UomService } = await import("../services/uom.service");
    const uoms = await UomService.list((req as any).shopId);
    res.json({ success: true, message: "OK", data: uoms });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { UomService } = await import("../services/uom.service");
    const uom = await UomService.update(req.params["id"]!, req.body, (req as any).shopId);
    res.json({ success: true, message: "UOM updated", data: uom });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { UomService } = await import("../services/uom.service");
    await UomService.deactivate(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "UOM deactivated", data: null });
  } catch (err) { next(err); }
});

export default router;
