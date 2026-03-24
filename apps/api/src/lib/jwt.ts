import jwt from "jsonwebtoken";

const ACCESS_SECRET = () => {
  const s = process.env["JWT_SECRET"];
  if (!s) throw new Error("JWT_SECRET not configured");
  return s;
};

const REFRESH_SECRET = () => {
  const s = process.env["JWT_REFRESH_SECRET"];
  if (!s) throw new Error("JWT_REFRESH_SECRET not configured");
  return s;
};

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, ACCESS_SECRET(), {
    expiresIn: (process.env["JWT_EXPIRES_IN"] ?? "15m") as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET(), {
    expiresIn: (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d") as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): { userId: string } {
  return jwt.verify(token, ACCESS_SECRET()) as { userId: string };
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET()) as { userId: string };
}
