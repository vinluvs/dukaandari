import { Router } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { AuthService } = await import("../services/auth.service");
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, message: "User registered successfully", data: result });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { AuthService } = await import("../services/auth.service");
    const result = await AuthService.login(req.body);
    res.json({ success: true, message: "Login successful", data: result });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { AuthService } = await import("../services/auth.service");
    const result = await AuthService.refresh(req.body.refreshToken);
    res.json({ success: true, message: "Token refreshed", data: result });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/reset-password
router.post("/reset-password", authenticate, async (req, res, next) => {
  try {
    const { AuthService } = await import("../services/auth.service");
    await AuthService.resetPassword(req.body);
    res.json({ success: true, message: "Password updated", data: null });
  } catch (err) { next(err); }
});

export default router;
