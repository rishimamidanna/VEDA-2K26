# SkillBridge — Payment & Escrow Implementation

## 1. Overview & Architecture

SkillBridge operates as a student freelancer marketplace. Under the free-tier / educational constraint ($0 operating cost), financial operations are handled through a **database-backed Payment & Escrow architecture** powered by an extensible **Mock Payment Provider** (`MockPaymentProvider`).

> [!NOTE]
> **DEMO SYSTEM NOTICE**
> The current implementation is a **demonstration and prototype payment system**. No real credit cards are charged, no real bank transfers occur, and zero fees or usage costs are incurred. All monetary values are simulated using deterministic provider responses and recorded in PostgreSQL financial ledger tables.

```
                  ┌──────────────────────────────────────────────┐
                  │                 CLIENT (Buyer)               │
                  └──────────────────────┬───────────────────────┘
                                         │
                                 POST /api/payments
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          SkillBridge Payments Service        │
                  │   - Server-Authoritative Amount Calculation   │
                  │   - Role & Ownership Verification             │
                  │   - Duplicate Payment Prevention              │
                  └───────────────┬──────────────┬───────────────┘
                                  │              │
                   createIntent() │              │ (Atomic DB Tx)
                                  ▼              ▼
                    ┌──────────────────┐   ┌───────────────────────────┐
                    │ PaymentProvider  │   │ Neon PostgreSQL           │
                    │   (Mock / Ext)   │   │ - Payment (SUCCEEDED)     │
                    └──────────────────┘   │ - Escrow (HELD)           │
                                           │ - StudentWallet (+pending)│
                                           │ - PaymentTransaction (Ledger)
                                           └───────────────────────────┘
                                                         │
                                               Student Delivers Work
                                                         │
                                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │                 CLIENT (Buyer)               │
                  │             POST /api/escrows/[id]/release   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          Atomic Escrow Release Tx            │
                  │   - Status: HELD -> RELEASED                 │
                  │   - StudentWallet.pendingBalance  -= Amount  │
                  │   - StudentWallet.availableBalance += Amount │
                  │   - StudentWallet.totalEarned     += Amount  │
                  │   - PaymentTransaction (ESCROW_RELEASE)      │
                  └──────────────────────────────────────────────┘
```

---

## 2. Database Schema

The system uses Neon PostgreSQL managed by Prisma ORM.

### Enums
- `PaymentStatus`: `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `REFUNDED`
- `EscrowStatus`: `HELD`, `RELEASED`, `REFUNDED`, `CANCELLED`
- `TransactionType`: `PAYMENT`, `ESCROW_HOLD`, `ESCROW_RELEASE`, `REFUND`, `PLATFORM_FEE`, `EARNING`

### Models

#### `Payment`
Tracks financial charges initiated by clients for specific work contracts:
- `id`: String (cuid)
- `clientId`: Foreign key to `ClientProfile`
- `studentId`: Foreign key to `StudentProfile`
- `projectId`: Foreign key to `Project`
- `workContractId`: Foreign key to `WorkContract`
- `amount`: `Decimal` (Precision 12, Scale 2)
- `currency`: String (`USD`)
- `status`: `PaymentStatus`
- `provider`: String (`MOCK`)
- `providerPaymentId`: String? (e.g., `mock_pi_1725...`)
- `createdAt`, `updatedAt`

#### `Escrow`
Holds funds in trust until deliverables are approved:
- `id`: String (cuid)
- `paymentId`: Unique foreign key to `Payment`
- `workContractId`: Unique foreign key to `WorkContract` (ensures 1 active escrow per contract)
- `amount`: `Decimal(12, 2)`
- `currency`: String (`USD`)
- `status`: `EscrowStatus`
- `heldAt`: DateTime
- `releasedAt`: DateTime?
- `refundedAt`: DateTime?

#### `StudentWallet`
Tracks aggregated student earnings and pending balances:
- `id`: String (cuid)
- `studentId`: Unique foreign key to `StudentProfile` (Cascade delete)
- `availableBalance`: `Decimal(12, 2)` (Default 0.00)
- `pendingBalance`: `Decimal(12, 2)` (Default 0.00)
- `totalEarned`: `Decimal(12, 2)` (Default 0.00)
- `currency`: String (`USD`)

#### `PaymentTransaction`
Immutable financial audit trail and double-entry ledger:
- `id`: String (cuid)
- `paymentId`: Foreign key to `Payment`?
- `userId`: Foreign key to `User`
- `type`: `TransactionType`
- `amount`: `Decimal(12, 2)`
- `currency`: String (`USD`)
- `description`: String
- `createdAt`: DateTime

---

## 3. Money & Financial Integrity

1. **No JavaScript Floats**: All monetary fields in Prisma and PostgreSQL use `Decimal(12, 2)` (`Prisma.Decimal`). Float rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`) are mathematically prevented.
2. **Server-Determined Pricing**: The client cannot specify arbitrary prices to charge. The authoritative amount is determined strictly on the server from:
   - `workContract.application.proposedBudget` (if agreed), OR
   - `workContract.project.budgetValue` / `workContract.project.budget`
3. **Price Manipulation Defense**: If a client sends an `amount` in the request payload, the server validates `clientAmount.equals(authoritativeAmount)`. If any divergence is detected, the transaction is aborted with `400 AMOUNT_MISMATCH`.
4. **Boundary Checks**: Amounts must be strictly positive (> 0), finite, non-NaN, and capped below a safety ceiling ($1,000,000.00).

---

## 4. State Machines

### Payment State Machine
```
[PENDING] ──► [PROCESSING] ──► [SUCCEEDED] ──► [REFUNDED]
    │              │
    ▼              ▼
[CANCELLED]    [FAILED]
```
- Direct transition `PENDING -> SUCCEEDED` is supported for instant synchronous mock capture.
- `SUCCEEDED` payments can only transition to `REFUNDED`.
- Terminal states: `CANCELLED`, `FAILED`, `REFUNDED`.

### Escrow State Machine
```
          ┌──► [RELEASED]  (Client approves deliverable)
          │
[HELD] ───┼──► [REFUNDED]  (Client requests refund before work is released)
          │
          └──► [CANCELLED] (Contract cancelled during hold)
```
- Terminal states: `RELEASED`, `REFUNDED`, `CANCELLED`.
- No escrow can be released or refunded more than once.

---

## 5. Mock Payment Provider

Located in `src/lib/server/payments/`:
- `provider.ts`: Declares `PaymentProvider` interface:
  - `createPaymentIntent(params: CreateIntentParams)`
  - `confirmPayment(providerPaymentId: string)`
  - `cancelPayment(providerPaymentId: string)`
  - `refundPayment(providerPaymentId: string, amount: Prisma.Decimal)`
- `mock-provider.ts`: Implements `MockPaymentProvider`:
  - Deterministic test card declination via `simulateFailure: true` or `paymentMethod: "fail"`.
  - Realistic provider IDs (`mock_pi_...`, `mock_re_...`).
  - Zero external HTTP calls, zero secret keys needed.

---

## 6. Concurrency Protection & Transaction Guarantees

All state-changing operations utilize `prisma.$transaction(async (tx) => { ... })`:
1. **Double-Release Prevention**: When releasing an escrow, the escrow record is queried inside the transaction. If its status is not `HELD`, the transaction aborts with `ALREADY_RELEASED`. Simultaneous concurrent release requests cannot double-credit the student's wallet.
2. **Double-Refund Prevention**: Concurrent refund requests check status within the transaction; the second request sees `REFUNDED` and fails with `ALREADY_REFUNDED`.
3. **Atomic Ledger**: Wallet balance increments, escrow status updates, payment status updates, and `PaymentTransaction` records are committed together. A failure in any step rolls back the entire operation.

---

## 7. API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Creates payment and funds escrow | `CLIENT` |
| `GET` | `/api/payments` | Lists payments for user's contracts | Authenticated |
| `GET` | `/api/payments/[id]` | Details of single payment | Contract Participant |
| `POST` | `/api/payments/[id]/cancel` | Cancels pending payment | `CLIENT` owner |
| `POST` | `/api/payments/[id]/refund` | Initiates refund on held escrow | `CLIENT` owner |
| `GET` | `/api/escrows` | Lists escrows for user | Authenticated |
| `GET` | `/api/escrows/[id]` | Details of single escrow | Contract Participant |
| `POST` | `/api/escrows/[id]/release` | Releases escrow funds to student wallet | `CLIENT` owner |
| `POST` | `/api/escrows/[id]/refund` | Refunds escrow to client | `CLIENT` owner |
| `GET` | `/api/student/earnings` | Retrieves wallet balances & ledger | `STUDENT` |

---

## 8. UI Integration

1. **Student Work Page (`/student/work`)**:
   - Replaced static deferred earnings card with live API data from `/api/student/earnings`.
   - Displays real Available Balance, Pending Escrow, and Total Cleared.
   - Labeled with **Demo Escrow** badge.
2. **Client Hired Students Page (`/client/hired-students`)**:
   - Displays active escrow status for each contract (`Escrow: $X (Held)`, `Escrow Released ($X)`, `Payment Needed`).
   - Interactive **Fund Escrow (Demo)** button for unfunded contracts.
   - Interactive **Release Escrow (Demo)** button when funds are held.
   - Header banner clearly stating demo payment mode.

---

## 9. Future Real-Provider Integration Plan (Stripe)

To transition to Stripe without modifying marketplace logic:
1. Implement `StripePaymentProvider implements PaymentProvider`:
   - `createPaymentIntent`: calls `stripe.paymentIntents.create({ amount: toCents(amount), currency })`.
   - `confirmPayment`: confirms client payment intent with Stripe.
   - `refundPayment`: calls `stripe.refunds.create({ payment_intent })`.
2. Configure Stripe Webhook endpoint (`/api/webhooks/stripe`) to call `confirmPayment` or `releaseEscrow` upon receiving `payment_intent.succeeded`.
3. In `src/lib/server/payments/service.ts`, swap `defaultPaymentProvider` to `stripePaymentProvider` based on environment variable (`PAYMENT_PROVIDER=stripe`).
