# SkillBridge Production Deployment Guide

This guide provides end-to-end instructions for deploying SkillBridge into a $0 free-tier production environment using GitHub, Vercel, Neon PostgreSQL, and Supabase Storage.

---

## 1. Architecture Overview

- **Frontend & API**: Next.js 16 (App Router) deployed on Vercel Serverless.
- **Primary Database**: PostgreSQL hosted on Neon (Serverless connection pooler).
- **ORM**: Prisma Client with pooled connection lifecycle.
- **File / Object Storage**: Supabase Storage Free Tier (Private bucket `skillbridge-files`).
- **Authentication**: Stateless JWT session cookie (`sb_session`) signed server-side with HMAC-SHA256.
- **Cost**: $0.00 / month across all free-tier infrastructure.

---

## 2. Prerequisites & Accounts

1. **GitHub**: Repository containing the SkillBridge source code.
2. **Vercel Account**: Free Hobby tier.
3. **Neon Account**: Free tier PostgreSQL database (`neondb`).
4. **Supabase Account**: Free tier project for object storage.

---

## 3. Database Setup (Neon PostgreSQL)

1. Log into the Neon Console and select your project.
2. Under **Connection Details**, select **Connection string** and enable **Connection pooling** (port `5432` with `-pooler` host).
3. The connection string format:
   ```
   postgresql://<USER>:<PASSWORD>@<PROJECT_HOST>-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Run schema migrations locally against the Neon database before launching production:
   ```bash
   npx prisma migrate deploy
   ```
   Verify migration status:
   ```bash
   npx prisma migrate status
   ```

---

## 4. File Storage Setup (Supabase Storage)

1. Log into your Supabase Dashboard and select your project.
2. Navigate to **Storage** and click **New Bucket**.
3. Bucket configuration:
   - **Name**: `skillbridge-files`
   - **Public bucket**: `Disabled` (Keep private! Files are served strictly via authenticated Next.js proxy endpoints).
4. Retrieve credentials from **Project Settings > API**:
   - **Project URL**: `https://<PROJECT-REF>.supabase.co`
   - **Service Role Key (`secret`)**: Under **Project API keys**, copy `service_role`.
   > ⚠️ **CRITICAL SECURITY NOTE**: Never prefix the service role key with `NEXT_PUBLIC_`. Keep it strictly in server-side environment variables.

---

## 5. Vercel Project Setup

1. Log into Vercel and click **Add New... > Project**.
2. Import the Git repository.
3. In **Build & Development Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build` (or leave default; `package.json` includes `"postinstall": "prisma generate"`)
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add the following:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview, Dev | Neon pooled PostgreSQL connection string |
| `AUTH_SECRET` | Production, Preview, Dev | High-entropy random string (at least 32 characters) |
| `SUPABASE_URL` | Production, Preview, Dev | Supabase project URL (`https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | Supabase `service_role` private secret |
| `APP_URL` | Production | Your custom domain or production Vercel URL (e.g., `https://skillbridge.vercel.app`) |

> 💡 **Generating AUTH_SECRET**:
> ```bash
> openssl rand -base64 32
> ```

---

## 6. Build Optimization & Prisma Configuration

SkillBridge includes `"postinstall": "prisma generate"` in `package.json`. When Vercel runs `npm install`, the Prisma Engine is automatically generated for the target deployment architecture before `next build` starts.

The remote image pattern for Supabase is configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```

---

## 7. CSRF and Origin Protection in Production

Production CSRF defense is handled in `src/lib/server/security/csrf.ts`:
- Requests originating from the browser validate that the `Origin` or `Referer` header matches `APP_URL`, `VERCEL_URL`, or `localhost` (in development).
- Cross-origin form posts and malicious iframe requests are rejected with `403 Forbidden`.
- Safe idempotent HTTP methods (`GET`, `HEAD`, `OPTIONS`) and programmatic `Bearer` token requests bypass CSRF checks.

---

## 8. Demo Notices & Disclaimers

SkillBridge operates with simulated demo payments and escrow. No real money or bank accounts are touched:
- **Client & Student Work / Milestone UI**: Displays `"Demo Payment — No real money is charged. Demo Escrow — No real funds are held."`
- **Wallet & Ledger**: Tracks virtual marketplace test balances.
- **Notice**: Do not remove demo disclaimers unless integrating a certified PCI-compliant payment gateway.

---

## 9. Deployment Verification & Smoke Testing

After triggering the deployment on Vercel, verify core flows:

1. **Authentication**:
   - Test Student sign-in (`alex@example.com` / demo password or fresh registration).
   - Test Client sign-in (`client@apex.com` / demo password or fresh registration).
   - Verify `sb_session` cookie is set with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes.
2. **Marketplace Pipeline**:
   - Browse projects on `/student/projects`.
   - Submit proposal to an open project.
   - Client views application in `/client/projects/[id]/applicants` and clicks **Hire/Accept**.
   - Contract is created in `IN_PROGRESS` state.
3. **Persisted Messaging**:
   - Navigate to `/student/messages`.
   - Send and receive messages between Student and Client in real time.
4. **File Storage**:
   - Upload milestone deliverable or project attachment.
   - Verify file is stored in private Supabase bucket and download link generates a signed, authenticated stream.
5. **Demo Escrow Flow**:
   - Client funds milestone escrow.
   - Escrow status updates to `HELD`.
   - Client clicks **Release Escrow** upon completion.
   - Escrow updates to `RELEASED`; student wallet balance increments.

---

## 10. Troubleshooting & Common Issues

### Issue 1: Database Connection Pool Exhaustion / Timeout
- **Cause**: Serverless functions opening unpooled connections.
- **Fix**: Verify `DATABASE_URL` points to the `-pooler` Neon hostname, not the direct compute endpoint.

### Issue 2: CSRF Rejection (403 Forbidden)
- **Cause**: `APP_URL` environment variable does not match the actual domain or Vercel deployment URL.
- **Fix**: In Vercel Project Settings, set `APP_URL` to `https://your-custom-domain.com` (or your `*.vercel.app` domain).

### Issue 3: Supabase Storage 403 / 404
- **Cause**: Bucket name mismatch or incorrect `SUPABASE_SERVICE_ROLE_KEY`.
- **Fix**: Verify bucket name is exactly `skillbridge-files` and service role key is active and unrevoked.

---

## 11. Rollback Strategy

1. In the Vercel Dashboard, navigate to **Deployments**.
2. Select the previous stable deployment.
3. Click the three dots `...` and select **Instant Rollback**.
4. Traffic is immediately redirected to the prior immutable build within seconds with zero downtime.
