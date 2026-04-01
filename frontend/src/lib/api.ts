// ── Types matching backend Pydantic models ──────────────────────────

export type ListingStatus = "active" | "sold" | "delisted";
export type PurchaseStatus =
  | "pending"
  | "escrowed"
  | "delivered"
  | "completed"
  | "disputed";
export type DataCategory =
  | "healthcare"
  | "finance"
  | "nlp"
  | "computer_vision"
  | "tabular"
  | "time_series"
  | "other";

export interface DatasetMetadata {
  row_count: number;
  column_count: number;
  columns: string[];
  column_types: Record<string, string>;
  size_bytes: number;
  file_format: string;
  sample_stats: Record<string, Record<string, number>>;
}

export interface ZKProof {
  proof_hash: string;
  verified_properties: Record<string, string>;
  proof_timestamp: string;
  midnight_tx_hash: string | null;
}

export interface Listing {
  id: string;
  provider_address: string;
  title: string;
  description: string;
  category: DataCategory;
  price_lovelace: number;
  metadata: DatasetMetadata;
  proof: ZKProof | null;
  encrypted_cid: string | null;
  status: ListingStatus;
  reputation_score: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  listing_id: string;
  buyer_address: string;
  price_lovelace: number;
  status: PurchaseStatus;
  escrow_tx_hash: string | null;
  delivery_tx_hash: string | null;
  decryption_key_encrypted: string | null;
  created_at: string;
}

export interface MarketplaceStats {
  total_listings: number;
  total_value_lovelace: number;
  categories: string[];
}

export interface ProviderStats {
  address: string;
  active_listings: number;
  total_value_lovelace: number;
  avg_reputation: number;
}

// ── API base ────────────────────────────────────────────────────────

const API = ""; // Proxied in dev via vite.config.ts, same origin in prod

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Listings ────────────────────────────────────────────────────────

export async function fetchListings(category?: string): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const qs = params.toString();
  return request<Listing[]>(`/api/listings${qs ? `?${qs}` : ""}`);
}

export async function fetchListing(id: string): Promise<Listing> {
  return request<Listing>(`/api/listings/${id}`);
}

export async function createListing(formData: FormData): Promise<Listing> {
  return request<Listing>("/api/listings", {
    method: "POST",
    body: formData,
  });
}

// ── Purchases ───────────────────────────────────────────────────────

export async function createPurchase(
  listingId: string,
  buyerAddress: string,
): Promise<Purchase> {
  return request<Purchase>("/api/purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listing_id: listingId,
      buyer_address: buyerAddress,
    }),
  });
}

export async function confirmPurchase(
  purchaseId: string,
  buyerAddress: string,
): Promise<{ status: string; message: string }> {
  return request(`/api/purchases/${purchaseId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buyerAddress),
  });
}

// ── Stats / Providers ───────────────────────────────────────────────

export async function fetchStats(): Promise<MarketplaceStats> {
  return request<MarketplaceStats>("/api/stats");
}

export async function fetchProviderStats(
  address: string,
): Promise<ProviderStats> {
  return request<ProviderStats>(`/api/providers/${address}/stats`);
}

export async function fetchProviderListings(
  address: string,
): Promise<Listing[]> {
  return request<Listing[]>(`/api/providers/${address}/listings`);
}

// ── Helpers ─────────────────────────────────────────────────────────

export function lovelaceToAda(lovelace: number): string {
  return (lovelace / 1_000_000).toFixed(2);
}

export function truncateAddress(addr: string, chars = 8): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const CATEGORY_LABELS: Record<DataCategory, string> = {
  healthcare: "Healthcare",
  finance: "Finance",
  nlp: "NLP",
  computer_vision: "Computer Vision",
  tabular: "Tabular",
  time_series: "Time Series",
  other: "Other",
};

export const CATEGORY_COLORS: Record<DataCategory, string> = {
  healthcare: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  finance: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  nlp: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  computer_vision: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  tabular: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  time_series: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
