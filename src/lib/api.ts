import type { DashboardPayload } from "@/lib/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type MockApiResource =
  | "customers"
  | "subscriptions"
  | "payments"
  | "events";

/**
 * Public mock API (GitHub Gist raw JSON, CORS enabled).
 * Set NEXT_PUBLIC_API_BASE_URL=local to use the Next.js route handlers instead.
 */
export const MOCK_API_BASE =
  "https://gist.githubusercontent.com/lucaswalmor/6b6dd88fc949f33da7820c53b88d0741/raw";

export function mockApiUrl(resource: MockApiResource): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? MOCK_API_BASE;

  if (base === "local") {
    return `/api/${resource}`;
  }

  return `${base.replace(/\/$/, "")}/${resource}.json`;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new ApiError(`Failed to load ${url}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardData(): Promise<DashboardPayload> {
  const [customers, subscriptions, payments, events] = await Promise.all([
    getJson<DashboardPayload["customers"]>(mockApiUrl("customers")),
    getJson<DashboardPayload["subscriptions"]>(mockApiUrl("subscriptions")),
    getJson<DashboardPayload["payments"]>(mockApiUrl("payments")),
    getJson<DashboardPayload["events"]>(mockApiUrl("events")),
  ]);

  return { customers, subscriptions, payments, events };
}
