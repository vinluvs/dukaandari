import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const router = Router();
router.use(authenticate);

// GET /api/v1/profile
router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, fullName: true, phone: true, isVerified: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ success: true, message: "OK", data: user });
  } catch (err) { next(err); }
});

// PATCH /api/v1/profile
router.patch("/", async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data,
      select: { id: true, email: true, fullName: true, phone: true, updatedAt: true },
    });
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (err) { next(err); }
});

export default router;
