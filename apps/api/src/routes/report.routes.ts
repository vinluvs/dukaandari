import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

// GET /api/v1/reports/daily?shop_id=&date=
router.get("/daily", async (req, res, next) => {
  try {
    const { ReportService } = await import("../services/report.service");
    const data = await ReportService.daily((req as any).shopId, req.query);
    res.json({ success: true, message: "OK", data });
  } catch (err) { next(err); }
});

// GET /api/v1/reports/monthly?shop_id=&year=&month=
router.get("/monthly", async (req, res, next) => {
  try {
    const { ReportService } = await import("../services/report.service");
    const data = await ReportService.monthly((req as any).shopId, req.query);
    res.json({ success: true, message: "OK", data });
  } catch (err) { next(err); }
});

// GET /api/v1/reports/financial-year?shop_id=&year=
router.get("/financial-year", async (req, res, next) => {
  try {
    const { ReportService } = await import("../services/report.service");
    const data = await ReportService.financialYear((req as any).shopId, req.query);
    res.json({ success: true, message: "OK", data });
  } catch (err) { next(err); }
});

export default router;
