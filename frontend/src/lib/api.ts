/**
 * Central API client for the LeadDesk backend.
 *
 * - Auto-attaches Bearer tokens to authenticated requests
 * - Attempts token refresh on 401 and retries once
 * - Redirects to login on unrecoverable auth failures
 */

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./auth";
import type {
  ApiError,
  Lead,
  LeadCreatePayload,
  LeadListResponse,
  LeadStatusUpdatePayload,
  LoginPayload,
  TokenResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// --- Low-level fetch wrapper ---

class ApiRequestError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError) {
    super(data.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

export { ApiRequestError };

/**
 * Try to refresh the access token using the stored refresh token.
 * Returns true on success, false on failure.
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data: TokenResponse = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Core fetch wrapper. Adds JSON headers, auth, and error handling.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
  retryOnUnauth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content (logout)
  if (res.status === 204) {
    return undefined as T;
  }

  // Handle 401 — try refresh once
  if ((res.status === 401 || res.status === 403) && auth && retryOnUnauth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, auth, false);
    }
    // Refresh failed — clear everything and redirect
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new ApiRequestError(res.status, {
      error: true,
      message: "Session expired. Please log in again.",
    });
  }

  // Try to parse response body
  let data: T & ApiError;
  try {
    data = await res.json();
  } catch {
    throw new ApiRequestError(res.status, {
      error: true,
      message: "An unexpected error occurred.",
    });
  }

  if (!res.ok) {
    throw new ApiRequestError(res.status, data as ApiError);
  }

  return data;
}

// --- Typed API functions ---

/**
 * Submit a new lead (public).
 */
export async function submitLead(payload: LeadCreatePayload): Promise<Lead> {
  return apiFetch<Lead>("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Admin login.
 */
export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/**
 * Admin logout — blacklists the current access token.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" }, true);
  } catch {
    // Even if the server call fails, clear local tokens
  }
  clearTokens();
}

/**
 * Fetch leads (admin, paginated + searchable).
 */
export async function fetchLeads(params: {
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}): Promise<LeadListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_order) query.set("sort_order", params.sort_order);

  const qs = query.toString();
  return apiFetch<LeadListResponse>(`/leads${qs ? `?${qs}` : ""}`, {}, true);
}

/**
 * Update a lead's status (admin).
 */
export async function updateLeadStatus(
  leadId: string,
  payload: LeadStatusUpdatePayload
): Promise<Lead> {
  return apiFetch<Lead>(
    `/leads/${leadId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true
  );
}
