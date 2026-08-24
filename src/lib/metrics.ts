import { classifyRisk, collectRiskReasons } from "@/lib/churn-risk";
import type {
  Customer,
  CustomerEvent,
  CustomerRisk,
  DashboardPayload,
  Payment,
  RetentionDashboardModel,
  RetentionInsight,
  RiskReason,
  Subscription,
  SuggestedAction,
} from "@/lib/types";

export function calculateActiveSubscribers(
  subscriptions: Subscription[],
): number {
  return subscriptions.filter((subscription) => subscription.status === "active")
    .length;
}

export function calculateMrr(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((subscription) => subscription.status === "active")
    .reduce((sum, subscription) => sum + subscription.monthlyValue, 0);
}

export function calculateFailedPayments(payments: Payment[]): number {
  return payments.filter((payment) => payment.status === "failed").length;
}

export function calculateLtv(
  customerId: string,
  payments: Payment[],
): number {
  return payments
    .filter(
      (payment) => payment.customerId === customerId && payment.status === "paid",
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateRecoveredRevenue(payments: Payment[]): number {
  const bySubscription = new Map<string, Payment[]>();

  for (const payment of payments) {
    const group = bySubscription.get(payment.subscriptionId) ?? [];
    group.push(payment);
    bySubscription.set(payment.subscriptionId, group);
  }

  let recovered = 0;

  for (const group of bySubscription.values()) {
    const chronological = [...group].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    let awaitingRecovery = false;
    for (const payment of chronological) {
      if (payment.status === "failed") {
        awaitingRecovery = true;
        continue;
      }

      if (payment.status === "paid" && awaitingRecovery) {
        recovered += payment.amount;
        awaitingRecovery = false;
      }
    }
  }

  return recovered;
}

function paymentsFor(
  customerId: string,
  subscriptionId: string,
  payments: Payment[],
): Payment[] {
  return payments.filter(
    (payment) =>
      payment.customerId === customerId &&
      payment.subscriptionId === subscriptionId,
  );
}

function eventsFor(
  customerId: string,
  subscriptionId: string,
  events: CustomerEvent[],
): CustomerEvent[] {
  return events.filter(
    (event) =>
      event.customerId === customerId &&
      event.subscriptionId === subscriptionId,
  );
}

export function buildRiskRows(
  customers: Customer[],
  subscriptions: Subscription[],
  payments: Payment[],
  events: CustomerEvent[],
): CustomerRisk[] {
  const customerById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );

  const rows: CustomerRisk[] = [];

  for (const subscription of subscriptions) {
    const customer = customerById.get(subscription.customerId);
    if (!customer) {
      continue;
    }

    const reasons = collectRiskReasons(
      subscription,
      paymentsFor(customer.id, subscription.id, payments),
      eventsFor(customer.id, subscription.id, events),
    );
    const classification = classifyRisk(reasons);
    if (!classification) {
      continue;
    }

    rows.push({
      customer,
      subscription,
      ltv: calculateLtv(customer.id, payments),
      reasons,
      ...classification,
    });
  }

  return rows.sort((a, b) => {
    const levelDelta =
      Number(b.level === "High") - Number(a.level === "High") ||
      Number(b.level === "Medium") - Number(a.level === "Medium");

    if (levelDelta !== 0) {
      return levelDelta;
    }

    return b.subscription.monthlyValue - a.subscription.monthlyValue;
  });
}

export function calculateRevenueAtRisk(riskRows: CustomerRisk[]): number {
  return riskRows.reduce(
    (sum, row) => sum + row.subscription.monthlyValue,
    0,
  );
}

export function buildChurnBreakdown(
  riskRows: CustomerRisk[],
): Array<{ reason: RiskReason; customers: number }> {
  const reasons: RiskReason[] = [
    "Failed Payment",
    "Skipped Renewal",
    "Cancellation Started",
  ];

  return reasons.map((reason) => ({
    reason,
    customers: riskRows.filter((row) => row.reasons.includes(reason)).length,
  }));
}

export function buildRetentionInsights(
  riskRows: CustomerRisk[],
): RetentionInsight[] {
  const groups: Array<{
    id: SuggestedAction;
    reason: RiskReason;
    amountMode: "mrr" | "ltv";
  }> = [
    {
      id: "Payment recovery",
      reason: "Failed Payment",
      amountMode: "mrr",
    },
    {
      id: "Cancellation retention flow",
      reason: "Cancellation Started",
      amountMode: "ltv",
    },
    {
      id: "Skipped renewal re-engagement",
      reason: "Skipped Renewal",
      amountMode: "mrr",
    },
  ];

  return groups
    .map((group) => {
      const matches = riskRows.filter(
        (row) => row.primaryReason === group.reason,
      );
      const amount = matches.reduce((sum, row) => {
        return (
          sum +
          (group.amountMode === "ltv" ? row.ltv : row.subscription.monthlyValue)
        );
      }, 0);

      return {
        id: group.id,
        customerCount: matches.length,
        amount,
        reason: group.reason,
        amountMode: group.amountMode,
      };
    })
    .filter((insight) => insight.customerCount > 0);
}

export function buildRetentionDashboard(
  payload: DashboardPayload,
): RetentionDashboardModel {
  const riskRows = buildRiskRows(
    payload.customers,
    payload.subscriptions,
    payload.payments,
    payload.events,
  );

  return {
    activeSubscribers: calculateActiveSubscribers(payload.subscriptions),
    mrr: calculateMrr(payload.subscriptions),
    customersAtRisk: riskRows.length,
    failedPayments: calculateFailedPayments(payload.payments),
    revenueAtRisk: calculateRevenueAtRisk(riskRows),
    recoveredRevenue: calculateRecoveredRevenue(payload.payments),
    riskRows,
    churnBreakdown: buildChurnBreakdown(riskRows),
    insights: buildRetentionInsights(riskRows),
  };
}
