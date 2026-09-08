import { prisma } from "@/lib/prisma";
import {
  EscrowStatus,
  PaymentStatus,
  Prisma,
  TransactionType,
  UserRole,
  WorkStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";
import { defaultPaymentProvider } from "./mock-provider";
import {
  canCancelPayment,
  canRefundEscrow,
  canReleaseEscrow,
  isValidEscrowTransition,
  isValidPaymentTransition,
} from "./state-machine";

/**
 * Parses and determines the authoritative monetary amount for a work contract.
 * Priority:
 * 1. application.proposedBudget (parsed numeric)
 * 2. project.budgetValue (if present and > 0)
 * 3. project.budget (parsed numeric)
 */
export function determineAuthoritativeAmount(contract: {
  application?: { proposedBudget?: string | null } | null;
  project: { budgetValue?: number | null; budget: string };
}): Prisma.Decimal {
  let rawAmount: number | null = null;

  if (contract.application?.proposedBudget) {
    const parsed = parseFloat(contract.application.proposedBudget.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed > 0) {
      rawAmount = parsed;
    }
  }

  if (rawAmount === null && contract.project.budgetValue && contract.project.budgetValue > 0) {
    rawAmount = contract.project.budgetValue;
  }

  if (rawAmount === null && contract.project.budget) {
    const parsed = parseFloat(contract.project.budget.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed > 0) {
      rawAmount = parsed;
    }
  }

  if (rawAmount === null || rawAmount <= 0 || !isFinite(rawAmount)) {
    throw new Error("Unable to determine valid authoritative amount for project/contract");
  }

  // Safety upper bound for demo/student projects
  if (rawAmount > 1000000) {
    throw new Error("Amount exceeds maximum platform limit");
  }

  return new Prisma.Decimal(rawAmount.toFixed(2));
}

export interface CreatePaymentInput {
  workContractId: string;
  amount?: number | string;
  currency?: string;
  paymentMethod?: string;
  simulateFailure?: boolean;
}

/**
 * Creates a payment for a WorkContract and holds funds in Escrow.
 * Only the owning Client can initiate this.
 */
export async function createContractPayment(
  input: CreatePaymentInput,
  auth: AuthenticatedUser
) {
  if (auth.role !== UserRole.CLIENT || !auth.clientProfile) {
    return { error: "FORBIDDEN" as const, message: "Only clients can create payments" };
  }

  if (!input.workContractId?.trim()) {
    return { error: "BAD_REQUEST" as const, message: "workContractId is required" };
  }

  const contract = await prisma.workContract.findUnique({
    where: { id: input.workContractId.trim() },
    include: {
      project: true,
      application: true,
      student: {
        include: {
          user: true,
        },
      },
      client: {
        include: {
          user: true,
        },
      },
      escrow: true,
      payments: {
        where: {
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED],
          },
        },
      },
    },
  });

  if (!contract) {
    return { error: "NOT_FOUND" as const, message: "Work contract not found" };
  }

  // Authorize: Client must own this contract
  if (contract.clientId !== auth.clientProfile.id) {
    return { error: "FORBIDDEN" as const, message: "You do not own this work contract" };
  }

  // Prevent duplicate payments if active payment or escrow exists
  if (contract.payments.length > 0 || contract.escrow) {
    const activePayment = contract.payments[0];
    if (contract.escrow?.status === EscrowStatus.HELD) {
      return {
        error: "DUPLICATE_PAYMENT" as const,
        message: "Escrow funds are already held for this contract",
      };
    }
    if (contract.escrow?.status === EscrowStatus.RELEASED) {
      return {
        error: "DUPLICATE_PAYMENT" as const,
        message: "Payment has already been completed and released for this contract",
      };
    }
    if (activePayment?.status === PaymentStatus.SUCCEEDED) {
      return {
        error: "DUPLICATE_PAYMENT" as const,
        message: "A successful payment already exists for this contract",
      };
    }
  }

  // Derive authoritative amount server-side
  let authoritativeAmount: Prisma.Decimal;
  try {
    authoritativeAmount = determineAuthoritativeAmount(contract);
  } catch (err: any) {
    return { error: "INVALID_AMOUNT" as const, message: err.message };
  }

  // Validate currency
  const currency = (input.currency || "USD").toUpperCase();
  if (currency !== "USD") {
    return { error: "INVALID_CURRENCY" as const, message: "Only USD currency is supported" };
  }

  // If client provided an amount, verify it strictly matches the authoritative amount
  if (input.amount !== undefined && input.amount !== null) {
    try {
      const clientAmount = new Prisma.Decimal(input.amount);
      if (clientAmount.isNegative() || clientAmount.isZero() || !clientAmount.isFinite()) {
        return { error: "INVALID_AMOUNT" as const, message: "Payment amount must be positive and non-zero" };
      }
      if (!clientAmount.equals(authoritativeAmount)) {
        return {
          error: "AMOUNT_MISMATCH" as const,
          message: `Provided amount (${clientAmount.toString()}) does not match authoritative contract amount (${authoritativeAmount.toString()})`,
        };
      }
    } catch {
      return { error: "INVALID_AMOUNT" as const, message: "Invalid numeric amount provided" };
    }
  }

  // Create PENDING Payment record
  const payment = await prisma.payment.create({
    data: {
      clientId: contract.clientId,
      studentId: contract.studentId,
      projectId: contract.projectId,
      workContractId: contract.id,
      amount: authoritativeAmount,
      currency,
      status: PaymentStatus.PENDING,
      provider: defaultPaymentProvider.providerName,
    },
  });

  // Call mock payment provider
  const providerResult = await defaultPaymentProvider.createPaymentIntent({
    amount: authoritativeAmount,
    currency,
    paymentMethod: input.paymentMethod,
    simulateFailure: input.simulateFailure,
    metadata: {
      paymentId: payment.id,
      workContractId: contract.id,
      clientId: contract.clientId,
      studentId: contract.studentId,
    },
  });

  // Handle provider failure
  if (!providerResult.success || providerResult.status === "FAILED") {
    const failedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        providerPaymentId: providerResult.providerPaymentId,
      },
    });

    return {
      error: "PAYMENT_FAILED" as const,
      message: providerResult.error || "Payment processing failed",
      payment: failedPayment,
    };
  }

  // Atomic transaction to transition Payment to SUCCEEDED, hold Escrow, update StudentWallet, record ledger
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Payment status
    const succeededPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        providerPaymentId: providerResult.providerPaymentId,
      },
    });

    // 2. Create Escrow record (status: HELD)
    const escrow = await tx.escrow.create({
      data: {
        paymentId: succeededPayment.id,
        workContractId: contract.id,
        amount: authoritativeAmount,
        currency,
        status: EscrowStatus.HELD,
        heldAt: new Date(),
      },
    });

    // 3. Upsert StudentWallet (increment pendingBalance)
    await tx.studentWallet.upsert({
      where: { studentId: contract.studentId },
      create: {
        studentId: contract.studentId,
        availableBalance: new Prisma.Decimal(0),
        pendingBalance: authoritativeAmount,
        totalEarned: new Prisma.Decimal(0),
        currency,
      },
      update: {
        pendingBalance: {
          increment: authoritativeAmount,
        },
      },
    });

    // 4. Record ledger transaction for Client (PAYMENT)
    await tx.paymentTransaction.create({
      data: {
        paymentId: succeededPayment.id,
        userId: auth.user.id,
        type: TransactionType.PAYMENT,
        amount: authoritativeAmount,
        currency,
        description: `Payment for project "${contract.project.title}" (Held in Escrow)`,
      },
    });

    // 5. Record ledger transaction for Student (ESCROW_HOLD)
    await tx.paymentTransaction.create({
      data: {
        paymentId: succeededPayment.id,
        userId: contract.student.userId,
        type: TransactionType.ESCROW_HOLD,
        amount: authoritativeAmount,
        currency,
        description: `Escrow funded and held for project "${contract.project.title}"`,
      },
    });

    return { payment: succeededPayment, escrow };
  }, {
    maxWait: 15000,
    timeout: 20000,
  });

  return { success: true as const, payment: result.payment, escrow: result.escrow };
}

/**
 * Releases held escrow funds to the student.
 * Only the owning Client can release escrow funds.
 */
export async function releaseEscrow(escrowId: string, auth: AuthenticatedUser) {
  if (auth.role !== UserRole.CLIENT || !auth.clientProfile) {
    return { error: "FORBIDDEN" as const, message: "Only clients can release escrow" };
  }

  if (!escrowId?.trim()) {
    return { error: "BAD_REQUEST" as const, message: "escrowId is required" };
  }

  // Pre-check outside transaction to verify permissions
  const initialEscrow = await prisma.escrow.findUnique({
    where: { id: escrowId.trim() },
    include: {
      workContract: {
        include: {
          project: true,
          student: true,
        },
      },
      payment: true,
    },
  });

  if (!initialEscrow) {
    return { error: "NOT_FOUND" as const, message: "Escrow record not found" };
  }

  if (initialEscrow.workContract.clientId !== auth.clientProfile.id) {
    return { error: "FORBIDDEN" as const, message: "You do not own this contract" };
  }

  // Atomic transaction to verify status and release funds
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch inside transaction for concurrency safety
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId.trim() },
        include: {
          workContract: {
            include: {
              project: true,
              student: true,
            },
          },
          payment: true,
        },
      });

      if (!escrow) {
        throw new Error("NOT_FOUND");
      }

      if (escrow.status === EscrowStatus.RELEASED) {
        throw new Error("ALREADY_RELEASED");
      }

      if (escrow.status !== EscrowStatus.HELD) {
        throw new Error("INVALID_ESCROW_STATUS");
      }

      // 1. Atomic conditional update: only update if status is still HELD
      const updateCount = await tx.escrow.updateMany({
        where: { id: escrow.id, status: EscrowStatus.HELD },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date(),
        },
      });

      if (updateCount.count === 0) {
        throw new Error("ALREADY_RELEASED");
      }

      const updatedEscrow = (await tx.escrow.findUnique({
        where: { id: escrow.id },
      }))!;

      // 2. Update StudentWallet: decrement pendingBalance, increment availableBalance and totalEarned
      const wallet = await tx.studentWallet.upsert({
        where: { studentId: escrow.workContract.studentId },
        create: {
          studentId: escrow.workContract.studentId,
          availableBalance: escrow.amount,
          pendingBalance: new Prisma.Decimal(0),
          totalEarned: escrow.amount,
          currency: escrow.currency,
        },
        update: {
          pendingBalance: {
            decrement: escrow.amount,
          },
          availableBalance: {
            increment: escrow.amount,
          },
          totalEarned: {
            increment: escrow.amount,
          },
        },
      });

      // Safeguard against negative balances
      if (wallet.pendingBalance.isNegative()) {
        await tx.studentWallet.update({
          where: { id: wallet.id },
          data: { pendingBalance: new Prisma.Decimal(0) },
        });
      }

      // 3. Record ledger transaction for Student (ESCROW_RELEASE)
      await tx.paymentTransaction.create({
        data: {
          paymentId: escrow.paymentId,
          userId: escrow.workContract.student.userId,
          type: TransactionType.ESCROW_RELEASE,
          amount: escrow.amount,
          currency: escrow.currency,
          description: `Escrow released for project "${escrow.workContract.project.title}"`,
        },
      });

      // 4. Record ledger transaction for Student (EARNING)
      await tx.paymentTransaction.create({
        data: {
          paymentId: escrow.paymentId,
          userId: escrow.workContract.student.userId,
          type: TransactionType.EARNING,
          amount: escrow.amount,
          currency: escrow.currency,
          description: `Earnings credited to available balance for project "${escrow.workContract.project.title}"`,
        },
      });

      return { escrow: updatedEscrow, wallet };
    }, {
      maxWait: 15000,
      timeout: 20000,
    });

    return { success: true as const, escrow: result.escrow, wallet: result.wallet };
  } catch (err: any) {
    if (err.message === "ALREADY_RELEASED") {
      return { error: "ALREADY_RELEASED" as const, message: "Escrow funds have already been released" };
    }
    if (err.message === "INVALID_ESCROW_STATUS") {
      return { error: "INVALID_STATE" as const, message: "Escrow must be in HELD status to be released" };
    }
    if (err.message === "NOT_FOUND") {
      return { error: "NOT_FOUND" as const, message: "Escrow record not found" };
    }
    throw err;
  }
}

/**
 * Refunds held escrow funds back to the client.
 * Only allowed when Escrow is in HELD status.
 */
export async function refundEscrow(
  escrowId: string,
  auth: AuthenticatedUser,
  reason?: string
) {
  if (auth.role !== UserRole.CLIENT || !auth.clientProfile) {
    return { error: "FORBIDDEN" as const, message: "Only clients can request a refund" };
  }

  if (!escrowId?.trim()) {
    return { error: "BAD_REQUEST" as const, message: "escrowId is required" };
  }

  const initialEscrow = await prisma.escrow.findUnique({
    where: { id: escrowId.trim() },
    include: {
      workContract: {
        include: {
          project: true,
          student: true,
        },
      },
      payment: true,
    },
  });

  if (!initialEscrow) {
    return { error: "NOT_FOUND" as const, message: "Escrow record not found" };
  }

  if (initialEscrow.workContract.clientId !== auth.clientProfile.id) {
    return { error: "FORBIDDEN" as const, message: "You do not own this contract" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch within tx for concurrency lock
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId.trim() },
        include: {
          workContract: {
            include: {
              project: true,
              student: true,
            },
          },
          payment: true,
        },
      });

      if (!escrow) {
        throw new Error("NOT_FOUND");
      }

      if (escrow.status === EscrowStatus.RELEASED) {
        throw new Error("CANNOT_REFUND_RELEASED");
      }

      if (escrow.status === EscrowStatus.REFUNDED) {
        throw new Error("ALREADY_REFUNDED");
      }

      if (escrow.status !== EscrowStatus.HELD) {
        throw new Error("INVALID_ESCROW_STATUS");
      }

      // Call mock payment provider to process refund
      const refundResult = await defaultPaymentProvider.refundPayment(
        escrow.payment.providerPaymentId || escrow.paymentId,
        escrow.amount
      );

      if (!refundResult.success) {
        throw new Error("REFUND_PROVIDER_FAILED");
      }

      // 1. Atomic conditional update: only update if status is still HELD
      const updateCount = await tx.escrow.updateMany({
        where: { id: escrow.id, status: EscrowStatus.HELD },
        data: {
          status: EscrowStatus.REFUNDED,
          refundedAt: new Date(),
        },
      });

      if (updateCount.count === 0) {
        throw new Error("ALREADY_REFUNDED");
      }

      const updatedEscrow = (await tx.escrow.findUnique({
        where: { id: escrow.id },
      }))!;

      // 2. Update Payment status
      const updatedPayment = await tx.payment.update({
        where: { id: escrow.paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });

      // 3. Reverse student's pending balance
      const wallet = await tx.studentWallet.findUnique({
        where: { studentId: escrow.workContract.studentId },
      });

      if (wallet) {
        const newPending = Prisma.Decimal.max(
          new Prisma.Decimal(0),
          wallet.pendingBalance.minus(escrow.amount)
        );
        await tx.studentWallet.update({
          where: { id: wallet.id },
          data: { pendingBalance: newPending },
        });
      }

      // 4. Record ledger transaction for Client (REFUND)
      await tx.paymentTransaction.create({
        data: {
          paymentId: escrow.paymentId,
          userId: auth.user.id,
          type: TransactionType.REFUND,
          amount: escrow.amount,
          currency: escrow.currency,
          description: `Refund for project "${escrow.workContract.project.title}"${reason ? `: ${reason}` : ""}`,
        },
      });

      return { escrow: updatedEscrow, payment: updatedPayment };
    }, {
      maxWait: 15000,
      timeout: 20000,
    });

    return { success: true as const, escrow: result.escrow, payment: result.payment };
  } catch (err: any) {
    if (err.message === "CANNOT_REFUND_RELEASED") {
      return {
        error: "CANNOT_REFUND" as const,
        message: "Cannot refund escrow funds that have already been released to the student",
      };
    }
    if (err.message === "ALREADY_REFUNDED") {
      return { error: "ALREADY_REFUNDED" as const, message: "Escrow funds have already been refunded" };
    }
    if (err.message === "INVALID_ESCROW_STATUS") {
      return { error: "INVALID_STATE" as const, message: "Only HELD escrow funds can be refunded" };
    }
    if (err.message === "REFUND_PROVIDER_FAILED") {
      return { error: "PROVIDER_ERROR" as const, message: "Refund processing by payment provider failed" };
    }
    if (err.message === "NOT_FOUND") {
      return { error: "NOT_FOUND" as const, message: "Escrow record not found" };
    }
    throw err;
  }
}

/**
 * Cancels a PENDING or PROCESSING payment.
 */
export async function cancelPayment(paymentId: string, auth: AuthenticatedUser) {
  if (auth.role !== UserRole.CLIENT || !auth.clientProfile) {
    return { error: "FORBIDDEN" as const, message: "Only clients can cancel payments" };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    return { error: "NOT_FOUND" as const, message: "Payment not found" };
  }

  if (payment.clientId !== auth.clientProfile.id) {
    return { error: "FORBIDDEN" as const, message: "You do not own this payment" };
  }

  if (!canCancelPayment(payment.status)) {
    return {
      error: "INVALID_STATE" as const,
      message: `Cannot cancel payment with status ${payment.status}`,
    };
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.CANCELLED },
  });

  return { success: true as const, payment: updated };
}

/**
 * Returns role-scoped payments list.
 */
export async function listPayments(auth: AuthenticatedUser, options: { limit?: number; offset?: number } = {}) {
  const take = Math.min(options.limit || 50, 100);
  const skip = options.offset || 0;

  if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile) return [];
    return prisma.payment.findMany({
      where: { clientId: auth.clientProfile.id },
      take,
      skip,
      include: {
        project: {
          select: { id: true, title: true },
        },
        student: {
          include: {
            user: {
              select: { name: true, email: true, avatar: true },
            },
          },
        },
        escrow: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile) return [];
    return prisma.payment.findMany({
      where: { studentId: auth.studentProfile.id },
      take,
      skip,
      include: {
        project: {
          select: { id: true, title: true },
        },
        escrow: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}

/**
 * Returns a single payment by ID with role-based authorization.
 */
export async function getPaymentById(paymentId: string, auth: AuthenticatedUser) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: true,
      student: {
        include: {
          user: {
            select: { name: true, email: true, avatar: true },
          },
        },
      },
      client: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      escrow: true,
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!payment) {
    return { error: "NOT_FOUND" as const, message: "Payment not found" };
  }

  const isClientOwner = auth.role === UserRole.CLIENT && auth.clientProfile?.id === payment.clientId;
  const isStudentOwner = auth.role === UserRole.STUDENT && auth.studentProfile?.id === payment.studentId;

  if (!isClientOwner && !isStudentOwner) {
    return { error: "FORBIDDEN" as const, message: "You do not have permission to view this payment" };
  }

  return { payment };
}

/**
 * Returns role-scoped escrows list.
 */
export async function listEscrows(auth: AuthenticatedUser, options: { limit?: number; offset?: number } = {}) {
  const take = Math.min(options.limit || 50, 100);
  const skip = options.offset || 0;

  if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile) return [];
    return prisma.escrow.findMany({
      where: {
        workContract: {
          clientId: auth.clientProfile.id,
        },
      },
      take,
      skip,
      include: {
        workContract: {
          include: {
            project: true,
            student: {
              include: {
                user: { select: { name: true, email: true, avatar: true } },
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile) return [];
    return prisma.escrow.findMany({
      where: {
        workContract: {
          studentId: auth.studentProfile.id,
        },
      },
      take,
      skip,
      include: {
        workContract: {
          include: {
            project: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}

/**
 * Returns a single escrow record with authorization.
 */
export async function getEscrowById(escrowId: string, auth: AuthenticatedUser) {
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId },
    include: {
      workContract: {
        include: {
          project: true,
          student: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
            },
          },
          client: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!escrow) {
    return { error: "NOT_FOUND" as const, message: "Escrow record not found" };
  }

  const isClientOwner = auth.role === UserRole.CLIENT && auth.clientProfile?.id === escrow.workContract.clientId;
  const isStudentOwner = auth.role === UserRole.STUDENT && auth.studentProfile?.id === escrow.workContract.studentId;

  if (!isClientOwner && !isStudentOwner) {
    return { error: "FORBIDDEN" as const, message: "You do not have permission to view this escrow" };
  }

  return { escrow };
}

/**
 * Returns real database-backed earnings data for the authenticated student.
 */
export async function getStudentEarnings(auth: AuthenticatedUser) {
  if (auth.role !== UserRole.STUDENT || !auth.studentProfile) {
    return { error: "FORBIDDEN" as const, message: "Only students can access earnings" };
  }

  const studentId = auth.studentProfile.id;

  // 1. Upsert or find student wallet
  const wallet = await prisma.studentWallet.upsert({
    where: { studentId },
    create: {
      studentId,
      availableBalance: new Prisma.Decimal(0),
      pendingBalance: new Prisma.Decimal(0),
      totalEarned: new Prisma.Decimal(0),
      currency: "USD",
    },
    update: {},
  });

  // 2. Fetch student's payment transactions
  const transactions = await prisma.paymentTransaction.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 3. Fetch active and past escrows
  const escrows = await prisma.escrow.findMany({
    where: {
      workContract: {
        studentId,
      },
    },
    include: {
      workContract: {
        include: {
          project: {
            select: { title: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    wallet: {
      availableBalance: wallet.availableBalance.toFixed(2),
      pendingBalance: wallet.pendingBalance.toFixed(2),
      totalEarned: wallet.totalEarned.toFixed(2),
      currency: wallet.currency,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount.toFixed(2),
      currency: t.currency,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
    escrows: escrows.map((e) => ({
      id: e.id,
      workContractId: e.workContractId,
      projectTitle: e.workContract.project.title,
      amount: e.amount.toFixed(2),
      currency: e.currency,
      status: e.status,
      heldAt: e.heldAt.toISOString(),
    })),
  };
}
