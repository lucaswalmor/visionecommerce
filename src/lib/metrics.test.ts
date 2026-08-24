import { describe, expect, it } from "vitest";
import {
  buildChurnBreakdown,
  buildRetentionDashboard,
  buildRetentionInsights,
  buildRiskRows,
  calculateActiveSubscribers,
  calculateFailedPayments,
  calculateLtv,
  calculateMrr,
  calculateRecoveredRevenue,
  calculateRevenueAtRisk,
} from "@/lib/metrics";
import {
  customers,
  events,
  payments,
  subscriptions,
} from "@/lib/mock-data";
import {
  makeCustomer,
  makeEvent,
  makePayment,
  makeSubscription,
} from "@/lib/test-builders";

describe("calculateActiveSubscribers", () => {
  it("counts only subscriptions with status active", () => {
    expect(
      calculateActiveSubscribers([
        makeSubscription({ id: "s1", status: "active" }),
        makeSubscription({ id: "s2", status: "payment_failed" }),
        makeSubscription({ id: "s3", status: "skipped" }),
        makeSubscription({ id: "s4", status: "cancelled" }),
      ]),
    ).toBe(1);
  });
});

describe("calculateMrr", () => {
  it("sums monthlyValue for active subscriptions only", () => {
    expect(
      calculateMrr([
        makeSubscription({ id: "s1", status: "active", monthlyValue: 49 }),
        makeSubscription({ id: "s2", status: "active", monthlyValue: 59 }),
        makeSubscription({
          id: "s3",
          status: "payment_failed",
          monthlyValue: 79,
        }),
      ]),
    ).toBe(108);
  });
});

describe("calculateFailedPayments", () => {
  it("counts failed payment records, including later recovered ones", () => {
    expect(
      calculateFailedPayments([
        makePayment({ id: "p1", status: "paid" }),
        makePayment({ id: "p2", status: "failed" }),
        makePayment({ id: "p3", status: "failed" }),
      ]),
    ).toBe(2);
  });
});

describe("calculateLtv", () => {
  it("sums paid payments for one customer and ignores others", () => {
    expect(
      calculateLtv("cust_1", [
        makePayment({
          id: "p1",
          customerId: "cust_1",
          amount: 49,
          status: "paid",
        }),
        makePayment({
          id: "p2",
          customerId: "cust_1",
          amount: 49,
          status: "failed",
        }),
        makePayment({
          id: "p3",
          customerId: "cust_2",
          amount: 79,
          status: "paid",
        }),
      ]),
    ).toBe(49);
  });
});

describe("calculateRecoveredRevenue", () => {
  it("adds a paid charge that follows a failed charge on the same subscription", () => {
    expect(
      calculateRecoveredRevenue([
        makePayment({
          id: "p1",
          subscriptionId: "sub_1",
          amount: 49,
          status: "failed",
          createdAt: "2026-07-01",
        }),
        makePayment({
          id: "p2",
          subscriptionId: "sub_1",
          amount: 49,
          status: "paid",
          createdAt: "2026-07-04",
        }),
      ]),
    ).toBe(49);
  });

  it("does not count an unresolved failure", () => {
    expect(
      calculateRecoveredRevenue([
        makePayment({
          id: "p1",
          amount: 59,
          status: "failed",
          createdAt: "2026-08-01",
        }),
      ]),
    ).toBe(0);
  });

  it("does not treat a normal paid cycle as recovery", () => {
    expect(
      calculateRecoveredRevenue([
        makePayment({
          id: "p1",
          amount: 49,
          status: "paid",
          createdAt: "2026-07-01",
        }),
        makePayment({
          id: "p2",
          amount: 49,
          status: "paid",
          createdAt: "2026-08-01",
        }),
      ]),
    ).toBe(0);
  });
});

describe("buildRiskRows", () => {
  it("excludes cancelled subscriptions and healthy active customers", () => {
    const rows = buildRiskRows(
      [
        makeCustomer({ id: "cust_ok" }),
        makeCustomer({ id: "cust_risk", name: "At Risk" }),
        makeCustomer({ id: "cust_gone" }),
      ],
      [
        makeSubscription({
          id: "sub_ok",
          customerId: "cust_ok",
          status: "active",
        }),
        makeSubscription({
          id: "sub_risk",
          customerId: "cust_risk",
          status: "skipped",
          monthlyValue: 39,
        }),
        makeSubscription({
          id: "sub_gone",
          customerId: "cust_gone",
          status: "cancelled",
        }),
      ],
      [],
      [makeEvent({ customerId: "cust_gone", type: "cancellation_started" })],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.customer.id).toBe("cust_risk");
    expect(rows[0]?.level).toBe("Medium");
  });

  it("sorts High risk before Medium", () => {
    const rows = buildRiskRows(
      [
        makeCustomer({ id: "cust_skip" }),
        makeCustomer({ id: "cust_fail" }),
      ],
      [
        makeSubscription({
          id: "sub_skip",
          customerId: "cust_skip",
          status: "skipped",
          monthlyValue: 99,
        }),
        makeSubscription({
          id: "sub_fail",
          customerId: "cust_fail",
          status: "payment_failed",
          monthlyValue: 19,
        }),
      ],
      [],
      [],
    );

    expect(rows.map((row) => row.customer.id)).toEqual([
      "cust_fail",
      "cust_skip",
    ]);
  });
});

describe("calculateRevenueAtRisk", () => {
  it("sums monthlyValue of at-risk subscriptions", () => {
    const rows = buildRiskRows(
      [makeCustomer({ id: "cust_1" }), makeCustomer({ id: "cust_2" })],
      [
        makeSubscription({
          id: "sub_1",
          customerId: "cust_1",
          status: "payment_failed",
          monthlyValue: 59,
        }),
        makeSubscription({
          id: "sub_2",
          customerId: "cust_2",
          status: "skipped",
          monthlyValue: 39,
        }),
      ],
      [],
      [],
    );

    expect(calculateRevenueAtRisk(rows)).toBe(98);
  });
});

describe("buildChurnBreakdown", () => {
  it("counts a customer in every matching reason bucket", () => {
    const rows = buildRiskRows(
      [makeCustomer()],
      [makeSubscription({ status: "payment_failed" })],
      [],
      [makeEvent({ type: "renewal_skipped" })],
    );

    expect(buildChurnBreakdown(rows)).toEqual([
      { reason: "Failed Payment", customers: 1 },
      { reason: "Skipped Renewal", customers: 1 },
      { reason: "Cancellation Started", customers: 0 },
    ]);
  });
});

describe("buildRetentionInsights", () => {
  it("groups customers by primary reason, not every matching signal", () => {
    const rows = buildRiskRows(
      [makeCustomer()],
      [makeSubscription({ status: "payment_failed", monthlyValue: 59 })],
      [makePayment({ status: "paid", amount: 200 })],
      [makeEvent({ type: "renewal_skipped" })],
    );

    const insights = buildRetentionInsights(rows);

    expect(insights).toEqual([
      {
        id: "Payment recovery",
        customerCount: 1,
        amount: 59,
        reason: "Failed Payment",
        amountMode: "mrr",
      },
    ]);
  });
});

describe("buildRetentionDashboard", () => {
  it("returns zeroed metrics for an empty payload", () => {
    const model = buildRetentionDashboard({
      customers: [],
      subscriptions: [],
      payments: [],
      events: [],
    });

    expect(model).toMatchObject({
      activeSubscribers: 0,
      mrr: 0,
      customersAtRisk: 0,
      failedPayments: 0,
      revenueAtRisk: 0,
      recoveredRevenue: 0,
      riskRows: [],
    });
  });

  it("derives dashboard KPIs from the mock dataset", () => {
    const model = buildRetentionDashboard({
      customers,
      subscriptions,
      payments,
      events,
    });

    expect(model.activeSubscribers).toBe(5);
    expect(model.mrr).toBe(285);
    expect(model.customersAtRisk).toBe(7);
    expect(model.failedPayments).toBe(5);
    expect(model.revenueAtRisk).toBe(413);
    expect(model.recoveredRevenue).toBe(128);
  });
});
