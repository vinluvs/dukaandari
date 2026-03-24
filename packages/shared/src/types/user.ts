export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
