import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchDashboardData, MOCK_API_BASE, mockApiUrl } from "@/lib/api";

describe("mockApiUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("points to the public gist by default", () => {
    expect(mockApiUrl("customers")).toBe(`${MOCK_API_BASE}/customers.json`);
    expect(mockApiUrl("events")).toBe(`${MOCK_API_BASE}/events.json`);
  });

  it("uses local Next.js routes when NEXT_PUBLIC_API_BASE_URL=local", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "local");
    expect(mockApiUrl("payments")).toBe("/api/payments");
  });
});

describe("fetchDashboardData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the four resources in parallel from the public API", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const payload = url.endsWith("customers.json")
        ? [{ id: "cust_1", name: "Jane", email: "jane@email.com" }]
        : [];

      return {
        ok: true,
        json: async () => payload,
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchDashboardData();

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(data.customers).toHaveLength(1);
    expect(data.subscriptions).toEqual([]);
  });

  it("throws ApiError when a resource fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
      })),
    );

    await expect(fetchDashboardData()).rejects.toBeInstanceOf(ApiError);
  });
});
