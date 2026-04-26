export type ApiMeta = {
  source: string;
  as_of: string;
  data_version: string;
  warnings: string[];
  took_ms?: number;
};

export type ApiEnvelope<T> = {
  data: T | null;
  meta: ApiMeta;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
};

export type CompanySnapshot = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  change_percent: number;
  volume: number;
  metrics: Record<string, number | string>;
  source: string;
  as_of: string;
  data_version: string;
  warnings: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function fetchCompanySnapshot(symbol: string): Promise<ApiEnvelope<CompanySnapshot>> {
  const response = await fetch(`${API_BASE_URL}/companies/${encodeURIComponent(symbol)}/snapshot`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Snapshot request failed: ${response.status}`);
  }

  return response.json() as Promise<ApiEnvelope<CompanySnapshot>>;
}
