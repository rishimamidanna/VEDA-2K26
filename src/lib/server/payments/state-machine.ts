import { PaymentStatus, EscrowStatus } from "@prisma/client";

/**
 * Valid transitions for PaymentStatus
 */
const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  PENDING: [PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
  PROCESSING: [PaymentStatus.SUCCEEDED, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
  SUCCEEDED: [PaymentStatus.REFUNDED],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Valid transitions for EscrowStatus
 */
const VALID_ESCROW_TRANSITIONS: Record<EscrowStatus, readonly EscrowStatus[]> = {
  HELD: [EscrowStatus.RELEASED, EscrowStatus.REFUNDED, EscrowStatus.CANCELLED],
  RELEASED: [],
  REFUNDED: [],
  CANCELLED: [],
};

export function isValidPaymentTransition(current: PaymentStatus, target: PaymentStatus): boolean {
  return VALID_PAYMENT_TRANSITIONS[current]?.includes(target) ?? false;
}

export function isValidEscrowTransition(current: EscrowStatus, target: EscrowStatus): boolean {
  return VALID_ESCROW_TRANSITIONS[current]?.includes(target) ?? false;
}

export function canReleaseEscrow(status: EscrowStatus): boolean {
  return status === EscrowStatus.HELD;
}

export function canRefundEscrow(status: EscrowStatus): boolean {
  return status === EscrowStatus.HELD;
}

export function canCancelPayment(status: PaymentStatus): boolean {
  return status === PaymentStatus.PENDING || status === PaymentStatus.PROCESSING;
}
