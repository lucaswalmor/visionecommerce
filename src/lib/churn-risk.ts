import type {
  CustomerEvent,
  Payment,
  RiskLevel,
  RiskReason,
  SuggestedAction,
  Subscription,
} from "@/lib/types";

const LEVEL_RANK: Record<RiskLevel, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const REASON_RANK: Record<RiskReason, number> = {
  "Cancellation Started": 3,
  "Failed Payment": 2,
  "Skipped Renewal": 1,
};

/**
 * Transparent, interview-friendly rules.
 *
 * A customer is at risk only while the subscription is still open
 * (`cancelled` is already churned, so they drop out of this list).
 *
 * Signals:
 * - Failed Payment: status `payment_failed` or a failed charge not followed by a later paid charge
 * - Skipped Renewal: status `skipped` or a `renewal_skipped` event
 * - Cancellation Started: status `cancellation_requested` or a `cancellation_started` event
 *
 * Severity (highest signal wins):
 * - High   → Cancellation Started or Failed Payment
 * - Medium → Skipped Renewal
 * - Low    → kept in the type for a future watchlist rule; not assigned today
 */
export const RISK_RULES: Record<
  RiskReason,
  { level: RiskLevel; action: SuggestedAction }
> = {
  "Cancellation Started": {
    level: "High",
    action: "Cancellation retention flow",
  },
  "Failed Payment": {
    level: "High",
    action: "Payment recovery",
  },
  "Skipped Renewal": {
    level: "Medium",
    action: "Skipped renewal re-engagement",
  },
};

export function hasUnresolvedFailedPayment(payments: Payment[]): boolean {
  const chronological = [...payments].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  let unresolved = false;
  for (const payment of chronological) {
    if (payment.status === "failed") {
      unresolved = true;
    }
    if (payment.status === "paid" && unresolved) {
      unresolved = false;
    }
  }

  return unresolved;
}

export function collectRiskReasons(
  subscription: Subscription,
  payments: Payment[],
  events: CustomerEvent[],
): RiskReason[] {
  if (subscription.status === "cancelled") {
    return [];
  }

  const reasons: RiskReason[] = [];

  if (
    subscription.status === "payment_failed" ||
    hasUnresolvedFailedPayment(payments)
  ) {
    reasons.push("Failed Payment");
  }

  if (
    subscription.status === "skipped" ||
    events.some((event) => event.type === "renewal_skipped")
  ) {
    reasons.push("Skipped Renewal");
  }

  if (
    subscription.status === "cancellation_requested" ||
    events.some((event) => event.type === "cancellation_started")
  ) {
    reasons.push("Cancellation Started");
  }

  return reasons;
}

export function classifyRisk(reasons: RiskReason[]): {
  level: RiskLevel;
  primaryReason: RiskReason;
  suggestedAction: SuggestedAction;
} | null {
  if (reasons.length === 0) {
    return null;
  }

  const primaryReason = reasons.reduce((highest, reason) => {
    const current = RISK_RULES[reason];
    const previous = RISK_RULES[highest];
    const levelDelta = LEVEL_RANK[current.level] - LEVEL_RANK[previous.level];
    if (levelDelta !== 0) {
      return levelDelta > 0 ? reason : highest;
    }
    return REASON_RANK[reason] > REASON_RANK[highest] ? reason : highest;
  });

  const rule = RISK_RULES[primaryReason];

  return {
    level: rule.level,
    primaryReason,
    suggestedAction: rule.action,
  };
}
