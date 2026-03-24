import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  userId?: string;
  shopId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided", data: null });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");

  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token", data: null });
  }
}

/**
 * Shop scope guard – verifies that the authenticated user is a member of the
 * requested shop. Must be used AFTER `authenticate`.
 * Reads shop_id from: query param → body → route param (in that order).
 */
export async function authorizeShop(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const shopId = (req.query["shop_id"] ?? req.body?.shop_id ?? req.params["shopId"]) as string | undefined;

  if (!shopId) {
    res.status(400).json({ success: false, message: "shop_id is required", data: null });
    return;
  }

  if (!req.userId) {
    res.status(401).json({ success: false, message: "Unauthenticated", data: null });
    return;
  }

  const member = await prisma.shopMember.findUnique({
    where: { shopId_userId: { shopId, userId: req.userId } },
    select: { isActive: true },
  });

  if (!member?.isActive) {
    res.status(403).json({ success: false, message: "Access denied: not a member of this shop", data: null });
    return;
  }

  req.shopId = shopId;
  next();
}
