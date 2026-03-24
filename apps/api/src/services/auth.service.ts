import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthService = {
  async register(body: unknown) {
    const data = RegisterSchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, fullName: data.fullName, phone: data.phone },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    return { user, accessToken, refreshToken };
  },

  async login(body: unknown) {
    const data = LoginSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new AppError(400, "Refresh token required");
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken(payload.userId);
    return { accessToken };
  },

  async resetPassword(body: unknown) {
    const data = z.object({ userId: z.string(), newPassword: z.string().min(8) }).parse(body);
    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: data.userId }, data: { passwordHash } });
  },
};
