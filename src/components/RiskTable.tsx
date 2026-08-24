import {
  formatCurrency,
  formatSubscriptionStatus,
  riskLevelClass,
} from "@/lib/format";
import type { CustomerRisk } from "@/lib/types";

interface RiskTableProps {
  rows: CustomerRisk[];
}

export function RiskTable({ rows }: RiskTableProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Customers at Risk</h2>
          <p>Simple rules: failed payment, skipped renewal, or cancellation started.</p>
        </div>
        <span className="count-pill">{rows.length} customers</span>
      </div>

      <div className="table-wrap">
        <table className="risk-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>LTV</th>
              <th>Subscription</th>
              <th>Risk</th>
              <th>Reason</th>
              <th>Suggested Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.customer.id}>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{row.customer.name}</span>
                    <span className="customer-email">{row.customer.email}</span>
                  </div>
                </td>
                <td className="numeric">{formatCurrency(row.ltv)}</td>
                <td>{formatSubscriptionStatus(row.subscription.status)}</td>
                <td>
                  <span className={`badge ${riskLevelClass(row.level)}`}>
                    {row.level}
                  </span>
                </td>
                <td>{row.primaryReason}</td>
                <td>{row.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mobile-risk-list">
        {rows.map((row) => (
          <li key={row.customer.id} className="mobile-risk-card">
            <div className="mobile-risk-top">
              <div>
                <p className="customer-name">{row.customer.name}</p>
                <p className="customer-email">{row.customer.email}</p>
              </div>
              <span className={`badge ${riskLevelClass(row.level)}`}>
                {row.level}
              </span>
            </div>
            <dl>
              <div>
                <dt>LTV</dt>
                <dd>{formatCurrency(row.ltv)}</dd>
              </div>
              <div>
                <dt>Subscription</dt>
                <dd>{formatSubscriptionStatus(row.subscription.status)}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{row.primaryReason}</dd>
              </div>
              <div>
                <dt>Action</dt>
                <dd>{row.suggestedAction}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
