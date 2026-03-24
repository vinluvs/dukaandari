import { Router } from "express";
import { authenticate, authorizeShop } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorizeShop);

router.post("/", async (req, res, next) => {
  try {
    const { ExpenseService } = await import("../services/expense.service");
    const expense = await ExpenseService.create(req.body, (req as any).shopId);
    res.status(201).json({ success: true, message: "Expense recorded", data: expense });
  } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
  try {
    const { ExpenseService } = await import("../services/expense.service");
    const result = await ExpenseService.list({ shopId: (req as any).shopId, query: req.query });
    res.json({ success: true, message: "OK", data: result });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { ExpenseService } = await import("../services/expense.service");
    await ExpenseService.deactivate(req.params["id"]!, (req as any).shopId);
    res.json({ success: true, message: "Expense deleted", data: null });
  } catch (err) { next(err); }
});

export default router;
