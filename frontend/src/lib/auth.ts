/**
 * Token management for JWT auth.
 *
 * Uses an in-memory variable as the primary store, with sessionStorage as a
 * persistence layer so tokens survive page refreshes (but not new tabs/browser close).
 */

const STORAGE_KEY_ACCESS = "ld_access_token";
const STORAGE_KEY_REFRESH = "ld_refresh_token";
const AUTH_COOKIE = "is_authenticated";

// In-memory cache — fastest access, cleared on page unload
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Store both tokens.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;

  if (isBrowser()) {
    sessionStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
    sessionStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
    // Set a lightweight cookie for middleware route-guard checks
    document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Lax`;
  }
}

/**
 * Get the current access token.
 */
export function getAccessToken(): string | null {
  if (memoryAccessToken) return memoryAccessToken;

  if (isBrowser()) {
    const stored = sessionStorage.getItem(STORAGE_KEY_ACCESS);
    if (stored) {
      memoryAccessToken = stored;
      return stored;
    }
  }
  return null;
}

/**
 * Get the current refresh token.
 */
export function getRefreshToken(): string | null {
  if (memoryRefreshToken) return memoryRefreshToken;

  if (isBrowser()) {
    const stored = sessionStorage.getItem(STORAGE_KEY_REFRESH);
    if (stored) {
      memoryRefreshToken = stored;
      return stored;
    }
  }
  return null;
}

/**
 * Clear all tokens and the auth cookie.
 */
export function clearTokens(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;

  if (isBrowser()) {
    sessionStorage.removeItem(STORAGE_KEY_ACCESS);
    sessionStorage.removeItem(STORAGE_KEY_REFRESH);
    // Expire the cookie
    document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/**
 * Quick check if a token exists (does NOT validate expiry).
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
