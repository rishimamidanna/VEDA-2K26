# SkillBridge Production Deployment Checklist

Use this operational checklist before, during, and after deploying SkillBridge to production.

---

## 1. Environment & Secrets Readiness
- [x] **No Secrets Committed**: `.env` and `.env.local` are in `.gitignore` and not tracked in Git.
- [x] **Environment Template**: `.env.example` documents all required production variables with placeholders.
- [x] **Runtime Validation**: `src/lib/server/env.ts` validates `DATABASE_URL`, `AUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `APP_URL`.
- [x] **Client Key Leak Prevention**: Verified `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is completely absent.
- [x] **High Entropy Secret**: `AUTH_SECRET` is at least 32 characters long.

---

## 2. Database (Neon PostgreSQL)
- [x] **Pooled Connection**: Hostname contains `-pooler` to use Neon's AWS pgBouncer pooler.
- [x] **SSL Mode**: Connection string specifies `?sslmode=require`.
- [x] **Prisma Singleton**: Global client singleton in `src/lib/prisma.ts` avoids hot-reload connection leaks.
- [x] **Migrations Applied**: All 4 Prisma migrations (`0_init`, `20260907_add_conversations_and_messages`, `20260907_add_payments_and_escrow`, `20260907_add_stored_files`) are active and verified.
- [x] **Postinstall Hook**: `package.json` executes `"postinstall": "prisma generate"`.

---

## 3. Storage (Supabase Storage)
- [x] **Private Bucket**: `skillbridge-files` configured with public access disabled.
- [x] **Proxy Downloads**: All file downloads route through authenticated `/api/files/[id]/download` proxy endpoints.
- [x] **Metadata Stored in DB**: File metadata and access controls tracked in PostgreSQL `StoredFile` table.
- [x] **Image Domains**: `next.config.ts` includes `*.supabase.co` remote pattern.

---

## 4. Security & Compliance
- [x] **CSRF Protection**: Multi-origin validation in `src/lib/server/security/csrf.ts` checking `APP_URL` and `VERCEL_URL`.
- [x] **Security Headers**: `next.config.ts` injects `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.
- [x] **Cookie Security**: `sb_session` cookie configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (production).
- [x] **IDOR Protection**: All contracts, payments, escrows, messages, and files authorize the caller against session context.
- [x] **Input Sanitization**: File uploads reject dangerous extensions (`.exe`, `.sh`, `.bat`, etc.) and sanitize file names.
- [x] **Rate Limiting**: Tiered rate limits protecting authentication (5/min), file uploads (20/min), and API endpoints (60/min).

---

## 5. Payments & Compliance
- [x] **Zero-Cost Constraint**: Operates strictly at $0.00 cost without paid payment processors.
- [x] **Explicit Disclaimers**: UI prominently displays `"Demo Payment — No real money is charged. Demo Escrow — No real funds are held."`
- [x] **Idempotency & Safety**: State machine enforces strict transitions; duplicate payments and double releases are blocked.

---

## 6. Build & Code Quality Gates
- [x] **Prisma Validation**: `npx prisma validate` passes with 0 schema warnings.
- [x] **Type Safety**: `npx tsc --noEmit` completes with 0 errors.
- [x] **No `@ts-nocheck`**: 0 instances across the entire codebase.
- [x] **Next.js Production Build**: `npm run build` compiles cleanly with Turbopack, generating 43 optimized routes.
- [x] **Automated Smoke Tests**: 31/31 deployment smoke tests passed against live infrastructure.

---

## 7. Post-Deployment Smoke Verification
- [ ] User registration / sign-in functioning on production domain.
- [ ] Project browsing and application submission working.
- [ ] Messaging functional between student and client.
- [ ] Deliverable upload and authenticated download verified.
- [ ] Demo payment and escrow release lifecycle completes without error.
