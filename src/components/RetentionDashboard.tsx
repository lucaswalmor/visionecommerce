"use client";

import { useEffect, useState } from "react";
import { ChurnBreakdownChart } from "@/components/ChurnBreakdownChart";
import {
  DashboardEmpty,
  DashboardError,
  DashboardLoading,
} from "@/components/DashboardStatus";
import { MetricGrid } from "@/components/MetricGrid";
import { RetentionOpportunities } from "@/components/RetentionOpportunities";
import { RiskTable } from "@/components/RiskTable";
import { fetchDashboardData } from "@/lib/api";
import { buildRetentionDashboard } from "@/lib/metrics";
import type { RetentionDashboardModel } from "@/lib/types";

type ViewState = "loading" | "error" | "ready";

export function RetentionDashboard() {
  const [state, setState] = useState<ViewState>("loading");
  const [model, setModel] = useState<RetentionDashboardModel | null>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardData()
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setCustomerCount(payload.customers.length);
        setModel(buildRetentionDashboard(payload));
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p className="eyebrow">Internal tools · Growth engineering</p>
        <h1>Retention Dashboard</h1>
        <p className="lede">
          Spot churn risk in the subscription base and see which recovery
          plays are worth running first.
        </p>
      </header>

      {state === "loading" ? <DashboardLoading /> : null}
      {state === "error" ? (
        <DashboardError
          onRetry={() => {
            setState("loading");
            setModel(null);
            setRequestId((current) => current + 1);
          }}
        />
      ) : null}
      {state === "ready" && customerCount === 0 ? <DashboardEmpty /> : null}
      {state === "ready" && model && customerCount > 0 ? (
        <div className="dashboard-body">
          <MetricGrid model={model} />
          <RiskTable rows={model.riskRows} />
          <div className="split">
            <ChurnBreakdownChart data={model.churnBreakdown} />
            <RetentionOpportunities insights={model.insights} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
