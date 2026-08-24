import { MetricCard } from "@/components/MetricCard";
import { formatCurrency } from "@/lib/format";
import type { RetentionDashboardModel } from "@/lib/types";

interface MetricGridProps {
  model: RetentionDashboardModel;
}

export function MetricGrid({ model }: MetricGridProps) {
  return (
    <section className="metric-grid" aria-label="Retention metrics">
      <MetricCard
        label="Active Subscribers"
        value={String(model.activeSubscribers)}
        hint="Subscriptions with status active"
      />
      <MetricCard
        label="Monthly Recurring Revenue"
        value={formatCurrency(model.mrr)}
        hint="Sum of active monthly values"
      />
      <MetricCard
        label="Customers at Risk"
        value={String(model.customersAtRisk)}
        hint="Open subscriptions with a churn signal"
        tone="High"
      />
      <MetricCard
        label="Failed Payments"
        value={String(model.failedPayments)}
        hint="Payment records with status failed"
        tone="High"
      />
      <MetricCard
        label="Revenue at Risk"
        value={formatCurrency(model.revenueAtRisk)}
        hint="Monthly value of at-risk subscriptions"
        tone="Medium"
      />
      <MetricCard
        label="Recovered Revenue"
        value={formatCurrency(model.recoveredRevenue)}
        hint="Paid charges after a failed payment"
        tone="Low"
      />
    </section>
  );
}
