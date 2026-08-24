"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { RetentionInsight } from "@/lib/types";

interface RetentionOpportunitiesProps {
  insights: RetentionInsight[];
}

function insightCopy(insight: RetentionInsight): string {
  const amount = formatCurrency(insight.amount);

  if (insight.amountMode === "ltv") {
    return `${insight.customerCount} customers started cancellation representing ${amount} in LTV.`;
  }

  if (insight.reason === "Failed Payment") {
    return `${insight.customerCount} customers have failed payments representing ${amount} in revenue at risk.`;
  }

  return `${insight.customerCount} customers skipped renewal representing ${amount} in revenue at risk.`;
}

export function RetentionOpportunities({
  insights,
}: RetentionOpportunitiesProps) {
  const [ran, setRan] = useState(false);

  const totalCustomers = insights.reduce(
    (sum, insight) => sum + insight.customerCount,
    0,
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Retention Opportunities</h2>
          <p>Turn risk signals into simulated operational playbooks.</p>
        </div>
        <button
          type="button"
          className="action-button"
          onClick={() => setRan(true)}
          disabled={insights.length === 0}
        >
          Run Retention Actions
        </button>
      </div>

      <ul className="insight-list">
        {insights.map((insight) => (
          <li key={insight.id}>{insightCopy(insight)}</li>
        ))}
      </ul>

      {ran ? (
        <div className="action-summary" role="status">
          <h3>Simulated run</h3>
          <p>
            No emails or messages were sent. This is a dry-run of what an ops
            tool would enqueue.
          </p>
          <ul>
            {insights.map((insight) => (
              <li key={insight.id}>
                <strong>{insight.id}:</strong> {insight.customerCount} customers
              </li>
            ))}
          </ul>
          <p className="action-total">
            {totalCustomers} targeted customers across {insights.length}{" "}
            playbooks
          </p>
        </div>
      ) : null}
    </section>
  );
}
