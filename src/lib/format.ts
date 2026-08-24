import type { RiskLevel, SubscriptionStatus } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

export function formatSubscriptionStatus(
  status: SubscriptionStatus,
): string {
  const labels: Record<SubscriptionStatus, string> = {
    active: "Active",
    payment_failed: "Payment failed",
    skipped: "Skipped",
    cancellation_requested: "Cancel requested",
    cancelled: "Cancelled",
  };

  return labels[status];
}

export function riskLevelClass(level: RiskLevel): string {
  if (level === "High") return "badge-high";
  if (level === "Medium") return "badge-medium";
  return "badge-low";
}
