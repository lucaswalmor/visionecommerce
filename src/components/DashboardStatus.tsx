interface DashboardStatusProps {
  onRetry?: () => void;
}

export function DashboardLoading() {
  return (
    <div className="status-stack" role="status" aria-live="polite">
      <div className="metric-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton-card" />
        ))}
      </div>
      <div className="skeleton-panel" />
      <p className="status-copy">Loading retention data…</p>
    </div>
  );
}

export function DashboardError({ onRetry }: DashboardStatusProps) {
  return (
    <div className="status-box" role="alert">
      <h2>Could not load the dashboard</h2>
      <p>
        The mock API did not respond. The UI stays up so an operator can retry
        instead of seeing a blank crash.
      </p>
      {onRetry ? (
        <button type="button" className="action-button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function DashboardEmpty() {
  return (
    <div className="status-box">
      <h2>No customer data yet</h2>
      <p>
        When subscriptions start flowing in, active MRR and churn risk will
        appear here.
      </p>
    </div>
  );
}
