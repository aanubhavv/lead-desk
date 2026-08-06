/**
 * TypeScript types matching the FastAPI backend schemas.
 */

// --- Enums / Unions ---

export const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000+",
] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const PROJECT_TYPES = [
  "Website",
  "Shopify App",
  "Mobile App",
  "Other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const LEAD_STATUSES = ["New", "Contacted", "Closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// --- Lead ---

export interface Lead {
  id: string;
  name: string;
  email: string;
  budget_range: string;
  message: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadCreatePayload {
  name: string;
  email: string;
  budget_range: BudgetRange;
  message: string;
  project_type?: ProjectType;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadStatusUpdatePayload {
  status: LeadStatus;
}

// --- Auth ---

export interface LoginPayload {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// --- API Error ---

export interface ApiError {
  error: boolean;
  message: string;
  details?: Record<string, string[]>;
}
