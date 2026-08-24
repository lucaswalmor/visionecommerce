# Retention Dashboard

Small internal dashboard for a DTC supplements subscription operation. Built as a senior full-stack take-home: transform customer, subscription, payment, and event data into retention metrics an operator can act on.

## Problem

A subscription business needs to see, quickly, which customers are about to churn and how much revenue sits behind those signals. Spreadsheets and raw payment logs do not make that obvious.

## Solution

This app reads a **public mock HTTP API** and calculates retention metrics in the client. The result is a single **Retention Dashboard**: KPI cards, a risk table, a reason breakdown, and simulated retention playbooks.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts
- Vitest
- Deployable on Vercel

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

Unit tests cover the churn rules and metric calculations in `src/lib`. They do not hit the network.

```bash
npm test
npm run test:watch
```

Key files:

- `src/lib/churn-risk.test.ts` — risk signals and High / Medium classification
- `src/lib/metrics.test.ts` — Active Subscribers, MRR, LTV, recovered revenue, and dashboard KPIs
- `src/lib/api.test.ts` — public mock API URLs and fetch error handling

`npm test` also asserts the mock dataset still produces the same dashboard numbers (5 active, $285 MRR, 7 at risk, $128 recovered). If you change `src/lib/mock-data.ts`, update those expectations.

## Data

The dashboard **pulls from a public mock API**: a public GitHub Gist with CORS enabled.

Base URL:

`https://gist.githubusercontent.com/lucaswalmor/6b6dd88fc949f33da7820c53b88d0741/raw`

| Endpoint | Entity |
| --- | --- |
| `GET .../customers.json` | id, name, email |
| `GET .../subscriptions.json` | id, customerId, status, monthlyValue, nextBillingDate, createdAt |
| `GET .../payments.json` | id, customerId, subscriptionId, amount, status, createdAt |
| `GET .../events.json` | journey events (`subscription_created`, `payment_failed`, `payment_success`, `renewal_skipped`, `cancellation_started`, `subscription_cancelled`) |

`src/lib/api.ts` loads the four URLs with `Promise.all`. The UI never hardcodes KPI numbers.

The same JSON also lives in `public/mock/` and `db.json`, generated from `src/lib/mock-data.ts`:

```bash
npm run export-mock
```

For offline work, set `NEXT_PUBLIC_API_BASE_URL=local` to use the Next.js route handlers under `/api/*` instead. See `.env.example`.

## Metrics

| Metric | Rule |
| --- | --- |
| **Active Subscribers** | Count of subscriptions with `status === "active"` |
| **MRR** | Sum of `monthlyValue` for those active subscriptions |
| **Customers at Risk** | Distinct customers with an open subscription and at least one churn signal |
| **Failed Payments** | Count of payment records with `status === "failed"` |
| **Revenue at Risk** | Sum of `monthlyValue` for at-risk subscriptions |
| **LTV** | Sum of that customer's payments with `status === "paid"` |
| **Recovered Revenue** | Sum of paid charges that follow a failed charge on the same subscription. Acceptable for this challenge; in production this would use a recovery window or an explicit retry/recovery id. |

Churn rules live in `src/lib/churn-risk.ts`:

- **Failed Payment** → High → Payment recovery
- **Cancellation Started** → High → Cancellation retention flow
- **Skipped Renewal** → Medium → Skipped renewal re-engagement

`cancelled` subscriptions are treated as already churned and are excluded from the risk list.

## Architecture

```
src/
  app/api/*/route.ts     Optional local fallback (`NEXT_PUBLIC_API_BASE_URL=local`)
  lib/types.ts           Shared types
  lib/api.ts             Fetch layer (public gist by default)
  lib/mock-data.ts       Dataset used by tests and export
  lib/metrics.ts         KPI calculations
  lib/churn-risk.ts      Risk rules
  lib/*.test.ts          Unit tests
  components/            Dashboard UI
public/mock/*.json       JSON served by the public gist
db.json                  Same dataset in one file
```

## Production Evolution

In production the mock routes would be replaced by Shopify, Checkout Champ, a CRM, and payment providers. Events would arrive through APIs/webhooks and land in PostgreSQL or Supabase. **Run Retention Actions** is a dry-run today; later it would enqueue email, SMS, or CRM sequences for payment recovery, cancel-save, and skip re-engagement.
