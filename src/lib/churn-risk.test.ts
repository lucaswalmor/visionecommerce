import { describe, expect, it } from "vitest";
import {
  classifyRisk,
  collectRiskReasons,
  hasUnresolvedFailedPayment,
} from "@/lib/churn-risk";
import {
  makeEvent,
  makePayment,
  makeSubscription,
} from "@/lib/test-builders";

describe("hasUnresolvedFailedPayment", () => {
  it("returns false when there are no failed payments", () => {
    expect(
      hasUnresolvedFailedPayment([
        makePayment({ id: "p1", status: "paid", createdAt: "2026-07-01" }),
      ]),
    ).toBe(false);
  });

  it("returns true when a failed payment has no later paid charge", () => {
    expect(
      hasUnresolvedFailedPayment([
        makePayment({ id: "p1", status: "paid", createdAt: "2026-07-01" }),
        makePayment({ id: "p2", status: "failed", createdAt: "2026-08-01" }),
      ]),
    ).toBe(true);
  });

  it("returns false when a later paid charge recovers the failure", () => {
    expect(
      hasUnresolvedFailedPayment([
        makePayment({ id: "p1", status: "failed", createdAt: "2026-07-01" }),
        makePayment({ id: "p2", status: "paid", createdAt: "2026-07-04" }),
      ]),
    ).toBe(false);
  });

  it("returns true when a recovered failure is followed by a new failure", () => {
    expect(
      hasUnresolvedFailedPayment([
        makePayment({ id: "p1", status: "failed", createdAt: "2026-06-01" }),
        makePayment({ id: "p2", status: "paid", createdAt: "2026-06-04" }),
        makePayment({ id: "p3", status: "failed", createdAt: "2026-08-01" }),
      ]),
    ).toBe(true);
  });
});

describe("collectRiskReasons", () => {
  it("ignores cancelled subscriptions even if they have churn events", () => {
    const reasons = collectRiskReasons(
      makeSubscription({ status: "cancelled" }),
      [makePayment({ status: "failed" })],
      [makeEvent({ type: "cancellation_started" })],
    );

    expect(reasons).toEqual([]);
  });

  it("flags Failed Payment from subscription status", () => {
    expect(
      collectRiskReasons(makeSubscription({ status: "payment_failed" }), [], []),
    ).toContain("Failed Payment");
  });

  it("flags Failed Payment from an unresolved failed charge", () => {
    expect(
      collectRiskReasons(
        makeSubscription({ status: "active" }),
        [makePayment({ status: "failed" })],
        [],
      ),
    ).toContain("Failed Payment");
  });

  it("does not flag Failed Payment after a recovered charge", () => {
    expect(
      collectRiskReasons(
        makeSubscription({ status: "active" }),
        [
          makePayment({ id: "p1", status: "failed", createdAt: "2026-07-01" }),
          makePayment({ id: "p2", status: "paid", createdAt: "2026-07-04" }),
        ],
        [],
      ),
    ).not.toContain("Failed Payment");
  });

  it("flags Skipped Renewal from status or event", () => {
    expect(
      collectRiskReasons(makeSubscription({ status: "skipped" }), [], []),
    ).toContain("Skipped Renewal");

    expect(
      collectRiskReasons(
        makeSubscription({ status: "active" }),
        [],
        [makeEvent({ type: "renewal_skipped" })],
      ),
    ).toContain("Skipped Renewal");
  });

  it("flags Cancellation Started from status or event", () => {
    expect(
      collectRiskReasons(
        makeSubscription({ status: "cancellation_requested" }),
        [],
        [],
      ),
    ).toContain("Cancellation Started");

    expect(
      collectRiskReasons(
        makeSubscription({ status: "active" }),
        [],
        [makeEvent({ type: "cancellation_started" })],
      ),
    ).toContain("Cancellation Started");
  });

  it("can collect more than one reason on the same subscription", () => {
    const reasons = collectRiskReasons(
      makeSubscription({ status: "payment_failed" }),
      [],
      [makeEvent({ type: "renewal_skipped" })],
    );

    expect(reasons).toEqual(["Failed Payment", "Skipped Renewal"]);
  });
});

describe("classifyRisk", () => {
  it("returns null when there are no reasons", () => {
    expect(classifyRisk([])).toBeNull();
  });

  it("classifies skipped renewal as Medium", () => {
    expect(classifyRisk(["Skipped Renewal"])).toEqual({
      level: "Medium",
      primaryReason: "Skipped Renewal",
      suggestedAction: "Skipped renewal re-engagement",
    });
  });

  it("classifies failed payment as High with payment recovery", () => {
    expect(classifyRisk(["Failed Payment"])).toEqual({
      level: "High",
      primaryReason: "Failed Payment",
      suggestedAction: "Payment recovery",
    });
  });

  it("classifies cancellation as High with retention flow", () => {
    expect(classifyRisk(["Cancellation Started"])).toEqual({
      level: "High",
      primaryReason: "Cancellation Started",
      suggestedAction: "Cancellation retention flow",
    });
  });

  it("picks Failed Payment over Skipped Renewal", () => {
    expect(classifyRisk(["Skipped Renewal", "Failed Payment"])?.primaryReason).toBe(
      "Failed Payment",
    );
  });

  it("picks Cancellation Started over Failed Payment when both are High", () => {
    expect(
      classifyRisk(["Failed Payment", "Cancellation Started"])?.primaryReason,
    ).toBe("Cancellation Started");
  });
});
