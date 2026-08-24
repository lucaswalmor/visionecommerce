import type {
  Customer,
  CustomerEvent,
  Payment,
  Subscription,
} from "./types";

export const customers: Customer[] = [
  { id: "cust_maya", name: "Maya Chen", email: "maya.chen@email.com" },
  { id: "cust_john", name: "John Doe", email: "john.doe@email.com" },
  { id: "cust_sofia", name: "Sofia Alvarez", email: "sofia.alvarez@email.com" },
  { id: "cust_liam", name: "Liam Okafor", email: "liam.okafor@email.com" },
  { id: "cust_emma", name: "Emma Wright", email: "emma.wright@email.com" },
  { id: "cust_noah", name: "Noah Patel", email: "noah.patel@email.com" },
  { id: "cust_ava", name: "Ava Berg", email: "ava.berg@email.com" },
  { id: "cust_lucas", name: "Lucas Moreira", email: "lucas.moreira@email.com" },
  { id: "cust_isla", name: "Isla Nakamura", email: "isla.nakamura@email.com" },
  { id: "cust_ethan", name: "Ethan Brooks", email: "ethan.brooks@email.com" },
  { id: "cust_priya", name: "Priya Shah", email: "priya.shah@email.com" },
  { id: "cust_owen", name: "Owen Gallagher", email: "owen.gallagher@email.com" },
  { id: "cust_clara", name: "Clara Mendes", email: "clara.mendes@email.com" },
];

export const subscriptions: Subscription[] = [
  {
    id: "sub_maya",
    customerId: "cust_maya",
    status: "active",
    monthlyValue: 49,
    nextBillingDate: "2026-09-12",
    createdAt: "2026-01-12",
  },
  {
    id: "sub_john",
    customerId: "cust_john",
    status: "payment_failed",
    monthlyValue: 59,
    nextBillingDate: "2026-08-20",
    createdAt: "2025-11-20",
  },
  {
    id: "sub_sofia",
    customerId: "cust_sofia",
    status: "cancellation_requested",
    monthlyValue: 79,
    nextBillingDate: "2026-09-01",
    createdAt: "2025-09-01",
  },
  {
    id: "sub_liam",
    customerId: "cust_liam",
    status: "skipped",
    monthlyValue: 39,
    nextBillingDate: "2026-09-05",
    createdAt: "2026-03-05",
  },
  {
    id: "sub_emma",
    customerId: "cust_emma",
    status: "active",
    monthlyValue: 49,
    nextBillingDate: "2026-09-08",
    createdAt: "2025-12-08",
  },
  {
    id: "sub_noah",
    customerId: "cust_noah",
    status: "active",
    monthlyValue: 59,
    nextBillingDate: "2026-09-15",
    createdAt: "2026-02-15",
  },
  {
    id: "sub_ava",
    customerId: "cust_ava",
    status: "payment_failed",
    monthlyValue: 49,
    nextBillingDate: "2026-08-18",
    createdAt: "2026-01-18",
  },
  {
    id: "sub_lucas",
    customerId: "cust_lucas",
    status: "cancelled",
    monthlyValue: 69,
    nextBillingDate: "2026-07-01",
    createdAt: "2025-07-01",
  },
  {
    id: "sub_isla",
    customerId: "cust_isla",
    status: "skipped",
    monthlyValue: 39,
    nextBillingDate: "2026-09-10",
    createdAt: "2026-04-10",
  },
  {
    id: "sub_ethan",
    customerId: "cust_ethan",
    status: "cancellation_requested",
    monthlyValue: 89,
    nextBillingDate: "2026-08-28",
    createdAt: "2025-08-28",
  },
  {
    id: "sub_priya",
    customerId: "cust_priya",
    status: "active",
    monthlyValue: 49,
    nextBillingDate: "2026-09-20",
    createdAt: "2026-05-20",
  },
  {
    id: "sub_owen",
    customerId: "cust_owen",
    status: "payment_failed",
    monthlyValue: 59,
    nextBillingDate: "2026-08-22",
    createdAt: "2025-10-22",
  },
  {
    id: "sub_clara",
    customerId: "cust_clara",
    status: "active",
    monthlyValue: 79,
    nextBillingDate: "2026-09-03",
    createdAt: "2025-09-03",
  },
];

function monthlyPayments(
  customerId: string,
  subscriptionId: string,
  amount: number,
  start: string,
  count: number,
  prefix: string,
): Payment[] {
  const startDate = new Date(`${start}T12:00:00.000Z`);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCMonth(startDate.getUTCMonth() + index);
    const stamp = date.toISOString().slice(0, 10);

    return {
      id: `${prefix}_${String(index + 1).padStart(2, "0")}`,
      customerId,
      subscriptionId,
      amount,
      status: "paid" as const,
      createdAt: stamp,
    };
  });
}

export const payments: Payment[] = [
  ...monthlyPayments("cust_maya", "sub_maya", 49, "2026-01-12", 7, "pay_maya"),
  ...monthlyPayments("cust_john", "sub_john", 59, "2025-11-20", 9, "pay_john"),
  {
    id: "pay_john_fail",
    customerId: "cust_john",
    subscriptionId: "sub_john",
    amount: 59,
    status: "failed",
    createdAt: "2026-08-20",
  },
  ...monthlyPayments("cust_sofia", "sub_sofia", 79, "2025-09-01", 11, "pay_sofia"),
  ...monthlyPayments("cust_liam", "sub_liam", 39, "2026-03-05", 5, "pay_liam"),
  ...monthlyPayments("cust_emma", "sub_emma", 49, "2025-12-08", 7, "pay_emma"),
  {
    id: "pay_emma_fail",
    customerId: "cust_emma",
    subscriptionId: "sub_emma",
    amount: 49,
    status: "failed",
    createdAt: "2026-07-08",
  },
  {
    id: "pay_emma_recovered",
    customerId: "cust_emma",
    subscriptionId: "sub_emma",
    amount: 49,
    status: "paid",
    createdAt: "2026-07-11",
  },
  ...monthlyPayments("cust_noah", "sub_noah", 59, "2026-02-15", 6, "pay_noah"),
  ...monthlyPayments("cust_ava", "sub_ava", 49, "2026-01-18", 7, "pay_ava"),
  {
    id: "pay_ava_fail",
    customerId: "cust_ava",
    subscriptionId: "sub_ava",
    amount: 49,
    status: "failed",
    createdAt: "2026-08-18",
  },
  ...monthlyPayments("cust_lucas", "sub_lucas", 69, "2025-07-01", 12, "pay_lucas"),
  ...monthlyPayments("cust_isla", "sub_isla", 39, "2026-04-10", 4, "pay_isla"),
  ...monthlyPayments("cust_ethan", "sub_ethan", 89, "2025-08-28", 12, "pay_ethan"),
  ...monthlyPayments("cust_priya", "sub_priya", 49, "2026-05-20", 3, "pay_priya"),
  ...monthlyPayments("cust_owen", "sub_owen", 59, "2025-10-22", 10, "pay_owen"),
  {
    id: "pay_owen_fail",
    customerId: "cust_owen",
    subscriptionId: "sub_owen",
    amount: 59,
    status: "failed",
    createdAt: "2026-08-22",
  },
  ...monthlyPayments("cust_clara", "sub_clara", 79, "2025-09-03", 10, "pay_clara"),
  {
    id: "pay_clara_fail",
    customerId: "cust_clara",
    subscriptionId: "sub_clara",
    amount: 79,
    status: "failed",
    createdAt: "2026-07-03",
  },
  {
    id: "pay_clara_recovered",
    customerId: "cust_clara",
    subscriptionId: "sub_clara",
    amount: 79,
    status: "paid",
    createdAt: "2026-07-06",
  },
];

export const events: CustomerEvent[] = [
  { id: "evt_maya_created", customerId: "cust_maya", subscriptionId: "sub_maya", type: "subscription_created", createdAt: "2026-01-12" },
  { id: "evt_maya_paid", customerId: "cust_maya", subscriptionId: "sub_maya", type: "payment_success", createdAt: "2026-08-12" },

  { id: "evt_john_created", customerId: "cust_john", subscriptionId: "sub_john", type: "subscription_created", createdAt: "2025-11-20" },
  { id: "evt_john_fail", customerId: "cust_john", subscriptionId: "sub_john", type: "payment_failed", createdAt: "2026-08-20" },

  { id: "evt_sofia_created", customerId: "cust_sofia", subscriptionId: "sub_sofia", type: "subscription_created", createdAt: "2025-09-01" },
  { id: "evt_sofia_cancel", customerId: "cust_sofia", subscriptionId: "sub_sofia", type: "cancellation_started", createdAt: "2026-08-19" },

  { id: "evt_liam_created", customerId: "cust_liam", subscriptionId: "sub_liam", type: "subscription_created", createdAt: "2026-03-05" },
  { id: "evt_liam_skip", customerId: "cust_liam", subscriptionId: "sub_liam", type: "renewal_skipped", createdAt: "2026-08-05" },

  { id: "evt_emma_created", customerId: "cust_emma", subscriptionId: "sub_emma", type: "subscription_created", createdAt: "2025-12-08" },
  { id: "evt_emma_fail", customerId: "cust_emma", subscriptionId: "sub_emma", type: "payment_failed", createdAt: "2026-07-08" },
  { id: "evt_emma_recovered", customerId: "cust_emma", subscriptionId: "sub_emma", type: "payment_success", createdAt: "2026-07-11" },

  { id: "evt_noah_created", customerId: "cust_noah", subscriptionId: "sub_noah", type: "subscription_created", createdAt: "2026-02-15" },
  { id: "evt_noah_paid", customerId: "cust_noah", subscriptionId: "sub_noah", type: "payment_success", createdAt: "2026-08-15" },

  { id: "evt_ava_created", customerId: "cust_ava", subscriptionId: "sub_ava", type: "subscription_created", createdAt: "2026-01-18" },
  { id: "evt_ava_fail", customerId: "cust_ava", subscriptionId: "sub_ava", type: "payment_failed", createdAt: "2026-08-18" },

  { id: "evt_lucas_created", customerId: "cust_lucas", subscriptionId: "sub_lucas", type: "subscription_created", createdAt: "2025-07-01" },
  { id: "evt_lucas_cancel_start", customerId: "cust_lucas", subscriptionId: "sub_lucas", type: "cancellation_started", createdAt: "2026-06-20" },
  { id: "evt_lucas_cancelled", customerId: "cust_lucas", subscriptionId: "sub_lucas", type: "subscription_cancelled", createdAt: "2026-07-01" },

  { id: "evt_isla_created", customerId: "cust_isla", subscriptionId: "sub_isla", type: "subscription_created", createdAt: "2026-04-10" },
  { id: "evt_isla_skip", customerId: "cust_isla", subscriptionId: "sub_isla", type: "renewal_skipped", createdAt: "2026-08-10" },

  { id: "evt_ethan_created", customerId: "cust_ethan", subscriptionId: "sub_ethan", type: "subscription_created", createdAt: "2025-08-28" },
  { id: "evt_ethan_cancel", customerId: "cust_ethan", subscriptionId: "sub_ethan", type: "cancellation_started", createdAt: "2026-08-16" },

  { id: "evt_priya_created", customerId: "cust_priya", subscriptionId: "sub_priya", type: "subscription_created", createdAt: "2026-05-20" },
  { id: "evt_priya_paid", customerId: "cust_priya", subscriptionId: "sub_priya", type: "payment_success", createdAt: "2026-08-20" },

  { id: "evt_owen_created", customerId: "cust_owen", subscriptionId: "sub_owen", type: "subscription_created", createdAt: "2025-10-22" },
  { id: "evt_owen_skip", customerId: "cust_owen", subscriptionId: "sub_owen", type: "renewal_skipped", createdAt: "2026-07-22" },
  { id: "evt_owen_fail", customerId: "cust_owen", subscriptionId: "sub_owen", type: "payment_failed", createdAt: "2026-08-22" },

  { id: "evt_clara_created", customerId: "cust_clara", subscriptionId: "sub_clara", type: "subscription_created", createdAt: "2025-09-03" },
  { id: "evt_clara_fail", customerId: "cust_clara", subscriptionId: "sub_clara", type: "payment_failed", createdAt: "2026-07-03" },
  { id: "evt_clara_recovered", customerId: "cust_clara", subscriptionId: "sub_clara", type: "payment_success", createdAt: "2026-07-06" },
];
