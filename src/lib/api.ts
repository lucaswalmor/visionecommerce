import type { DashboardPayload } from "@/lib/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new ApiError(`Failed to load ${path}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardData(): Promise<DashboardPayload> {
  const [customers, subscriptions, payments, events] = await Promise.all([
    getJson<DashboardPayload["customers"]>("/api/customers"),
    getJson<DashboardPayload["subscriptions"]>("/api/subscriptions"),
    getJson<DashboardPayload["payments"]>("/api/payments"),
    getJson<DashboardPayload["events"]>("/api/events"),
  ]);

  return { customers, subscriptions, payments, events };
}
