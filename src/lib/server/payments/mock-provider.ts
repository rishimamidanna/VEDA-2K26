import { Prisma } from "@prisma/client";
import {
  CreateIntentParams,
  PaymentCancelResult,
  PaymentConfirmResult,
  PaymentIntentResult,
  PaymentProvider,
  PaymentRefundResult,
} from "./provider";

export class MockPaymentProvider implements PaymentProvider {
  readonly providerName = "MOCK";

  /**
   * Simulates creating and immediately authorizing a payment intent.
   * If simulateFailure is set or a special test payment method is used, simulates card failure.
   */
  async createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const providerPaymentId = `mock_pi_${Date.now()}_${randomSuffix}`;

    // Test hooks for failure simulation
    if (params.simulateFailure || params.paymentMethod === "pm_card_chargeCustomerFail" || params.paymentMethod === "fail") {
      return {
        success: false,
        providerPaymentId,
        status: "FAILED",
        error: "Your mock card was declined. Insufficient demo funds.",
      };
    }

    return {
      success: true,
      providerPaymentId,
      status: "SUCCEEDED",
    };
  }

  async confirmPayment(providerPaymentId: string): Promise<PaymentConfirmResult> {
    if (providerPaymentId.includes("fail")) {
      return {
        success: false,
        providerPaymentId,
        error: "Mock payment confirmation failed.",
      };
    }

    return {
      success: true,
      providerPaymentId,
    };
  }

  async cancelPayment(providerPaymentId: string): Promise<PaymentCancelResult> {
    return {
      success: true,
      providerPaymentId,
    };
  }

  async refundPayment(providerPaymentId: string, _amount: Prisma.Decimal): Promise<PaymentRefundResult> {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const providerRefundId = `mock_re_${Date.now()}_${randomSuffix}`;

    return {
      success: true,
      providerRefundId,
    };
  }
}

// Export a singleton instance of the default provider
export const defaultPaymentProvider: PaymentProvider = new MockPaymentProvider();
