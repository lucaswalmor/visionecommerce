import type { RiskLevel } from "@/lib/types";

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: RiskLevel | "neutral";
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-hint">{hint}</p>
    </article>
  );
}
