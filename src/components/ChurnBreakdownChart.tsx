"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskReason } from "@/lib/types";

interface ChurnBreakdownChartProps {
  data: Array<{ reason: RiskReason; customers: number }>;
}

export function ChurnBreakdownChart({ data }: ChurnBreakdownChartProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Churn Risk Breakdown</h2>
          <p>Customers counted once per matching reason.</p>
        </div>
      </div>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barSize={42} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(200, 214, 196, 0.12)" vertical={false} />
            <XAxis
              dataKey="reason"
              tick={{ fill: "#b7c2b0", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#b7c2b0", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "rgba(184, 212, 168, 0.08)" }}
              contentStyle={{
                background: "#18201b",
                border: "1px solid #314036",
                borderRadius: 8,
                color: "#eef3ea",
              }}
            />
            <Bar dataKey="customers" fill="#c4e1a8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
