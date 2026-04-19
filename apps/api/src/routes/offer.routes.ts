import { Router, Response, NextFunction } from "express";
import { OfferService } from "../services/offer.service";
import { authenticate, authorizeShop, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorizeShop as any);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.list(req.shopId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.create(req.shopId!, req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.update(req.params.id as string, req.shopId!, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await OfferService.delete(req.params.id as string, req.shopId!);
    res.json({ success: true, message: "Offer deleted" });
  } catch (e) {
    next(e);
  }
});

router.get("/config", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.getConfig(req.shopId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch("/config", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.updateConfig(req.shopId!, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/auto-generate", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await OfferService.generateAutoOffers(req.shopId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
