# Retention Dashboard

Small internal dashboard for a DTC supplements subscription operation. Built as a senior full-stack take-home: transform customer, subscription, payment, and event data into retention metrics an operator can act on.

## Problem

A subscription business needs to see, quickly, which customers are about to churn and how much revenue sits behind those signals. Spreadsheets and raw payment logs do not make that obvious.

## Solution

This app reads mock HTTP APIs and calculates retention metrics in the client. The result is a single **Retention Dashboard**: KPI cards, a risk table, a reason breakdown, and simulated retention playbooks.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts
- Deployable on Vercel

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Mock JSON is served by Next.js route handlers:

| Endpoint | Entity |
| --- | --- |
| `GET /api/customers` | id, name, email |
| `GET /api/subscriptions` | id, customerId, status, monthlyValue, nextBillingDate, createdAt |
| `GET /api/payments` | id, customerId, subscriptionId, amount, status, createdAt |
| `GET /api/events` | journey events (`subscription_created`, `payment_failed`, `payment_success`, `renewal_skipped`, `cancellation_started`, `subscription_cancelled`) |

Source data lives in `src/lib/mock-data.ts`. The dashboard never hardcodes KPI numbers; every card is derived from the API payload.

## Metrics

| Metric | Rule |
| --- | --- |
| **Active Subscribers** | Count of subscriptions with `status === "active"` |
| **MRR** | Sum of `monthlyValue` for those active subscriptions |
| **Customers at Risk** | Distinct customers with an open subscription and at least one churn signal |
| **Failed Payments** | Count of payment records with `status === "failed"` |
| **Revenue at Risk** | Sum of `monthlyValue` for at-risk subscriptions |
| **LTV** | Sum of that customer's payments with `status === "paid"` |
| **Recovered Revenue** | Sum of paid charges that follow a failed charge on the same subscription |

Churn rules live in `src/lib/churn-risk.ts`:

- **Failed Payment** → High → Payment recovery
- **Cancellation Started** → High → Cancellation retention flow
- **Skipped Renewal** → Medium → Skipped renewal re-engagement

`cancelled` subscriptions are treated as already churned and are excluded from the risk list.

## Architecture

```
src/
  app/api/*/route.ts     HTTP mock APIs
  lib/types.ts           Shared types
  lib/api.ts             Fetch layer
  lib/mock-data.ts       Dataset
  lib/metrics.ts         KPI calculations
  lib/churn-risk.ts      Risk rules
  components/            Dashboard UI
```

## Production Evolution

In production the mock routes would be replaced by Shopify, Checkout Champ, a CRM, and payment providers. Events would arrive through APIs/webhooks and land in PostgreSQL or Supabase. **Run Retention Actions** is a dry-run today; later it would enqueue email, SMS, or CRM sequences for payment recovery, cancel-save, and skip re-engagement.
