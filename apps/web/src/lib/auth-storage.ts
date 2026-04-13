const ACCESS_TOKEN_KEY = "dk_access_token";
const REFRESH_TOKEN_KEY = "dk_refresh_token";

// Helper to decode JWT and get the expiration timestamp in seconds
function getJwtExp(token: string): number {
  try {
    const payloadUrl = token.split('.')[1];
    if (!payloadUrl) return 0;
    const payloadBase64 = payloadUrl.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(payloadBase64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.exp || 0;
  } catch (err) {
    return 0; // Fallback to 0 if decoding fails
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  // Calculate max-age based on JWT expiration
  const expSeconds = getJwtExp(accessToken);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = expSeconds > nowSeconds ? expSeconds - nowSeconds : 60 * 60 * 24 * 7; // Fallback to 7 days if invalid

  // Also set a cookie for the Next.js middleware (edge runtime can't read localStorage)
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
}
