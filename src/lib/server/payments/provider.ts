import { Prisma } from "@prisma/client";

export interface CreateIntentParams {
  amount: Prisma.Decimal;
  currency: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  paymentMethod?: string;
  simulateFailure?: boolean;
}

export interface PaymentIntentResult {
  success: boolean;
  providerPaymentId: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  error?: string;
}

export interface PaymentConfirmResult {
  success: boolean;
  providerPaymentId: string;
  error?: string;
}

export interface PaymentCancelResult {
  success: boolean;
  providerPaymentId: string;
  error?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  providerRefundId: string;
  error?: string;
}

export interface PaymentProvider {
  readonly providerName: string;

  createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntentResult>;
  confirmPayment(providerPaymentId: string): Promise<PaymentConfirmResult>;
  cancelPayment(providerPaymentId: string): Promise<PaymentCancelResult>;
  refundPayment(providerPaymentId: string, amount: Prisma.Decimal): Promise<PaymentRefundResult>;
}
