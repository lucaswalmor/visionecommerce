export type SubscriptionStatus =
  | "active"
  | "payment_failed"
  | "skipped"
  | "cancellation_requested"
  | "cancelled";

export type PaymentStatus = "paid" | "failed";

export type CustomerEventType =
  | "subscription_created"
  | "payment_failed"
  | "payment_success"
  | "renewal_skipped"
  | "cancellation_started"
  | "subscription_cancelled";

export type RiskLevel = "High" | "Medium" | "Low";

export type RiskReason =
  | "Failed Payment"
  | "Skipped Renewal"
  | "Cancellation Started";

export type SuggestedAction =
  | "Payment recovery"
  | "Cancellation retention flow"
  | "Skipped renewal re-engagement";

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  monthlyValue: number;
  nextBillingDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface CustomerEvent {
  id: string;
  customerId: string;
  subscriptionId: string;
  type: CustomerEventType;
  createdAt: string;
}

export interface DashboardPayload {
  customers: Customer[];
  subscriptions: Subscription[];
  payments: Payment[];
  events: CustomerEvent[];
}

export interface CustomerRisk {
  customer: Customer;
  ltv: number;
  subscription: Subscription;
  level: RiskLevel;
  reasons: RiskReason[];
  primaryReason: RiskReason;
  suggestedAction: SuggestedAction;
}

export interface RetentionInsight {
  id: SuggestedAction;
  customerCount: number;
  amount: number;
  reason: RiskReason;
  amountMode: "mrr" | "ltv";
}

export interface RetentionDashboardModel {
  activeSubscribers: number;
  mrr: number;
  customersAtRisk: number;
  failedPayments: number;
  revenueAtRisk: number;
  recoveredRevenue: number;
  riskRows: CustomerRisk[];
  churnBreakdown: Array<{ reason: RiskReason; customers: number }>;
  insights: RetentionInsight[];
}
