import type {
  Customer,
  CustomerEvent,
  Payment,
  Subscription,
} from "@/lib/types";

export function makeCustomer(
  overrides: Partial<Customer> = {},
): Customer {
  return {
    id: "cust_1",
    name: "Jane Doe",
    email: "jane@email.com",
    ...overrides,
  };
}

export function makeSubscription(
  overrides: Partial<Subscription> = {},
): Subscription {
  return {
    id: "sub_1",
    customerId: "cust_1",
    status: "active",
    monthlyValue: 49,
    nextBillingDate: "2026-09-01",
    createdAt: "2026-01-01",
    ...overrides,
  };
}

export function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pay_1",
    customerId: "cust_1",
    subscriptionId: "sub_1",
    amount: 49,
    status: "paid",
    createdAt: "2026-08-01",
    ...overrides,
  };
}

export function makeEvent(
  overrides: Partial<CustomerEvent> = {},
): CustomerEvent {
  return {
    id: "evt_1",
    customerId: "cust_1",
    subscriptionId: "sub_1",
    type: "subscription_created",
    createdAt: "2026-01-01",
    ...overrides,
  };
}
