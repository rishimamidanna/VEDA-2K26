# SkillBridge — Authentication Architecture & Implementation

This document describes the real authentication system implemented during **Step 4: Real Authentication Implementation**.

> [!IMPORTANT]
> **Scope Notice**:
> This phase establishes server-verifiable authentication, secure password hashing, cryptographic session management, and API protection.
> **Full frontend data migration from `localStorage` / `sharedRepository` to the backend APIs is NOT part of Step 4** and will be completed in Step 5.

---

## 1. Authentication Architecture Overview

SkillBridge uses a secure, stateless, server-managed authentication architecture built for Next.js App Router and PostgreSQL:

```text
                                  Client Browser
                                        │
                ┌───────────────────────┴───────────────────────┐
                │                                               │
         HTTP POST /login                                Protected Request
                │                                    (Cookie: sb_session=...)
                ▼                                               │
     ┌──────────────────────┐                                   ▼
     │  /api/auth/login     │                        ┌──────────────────────┐
     │                      │                        │  getCurrentUser(req) │
     │ 1. Validate email    │                        │                      │
     │ 2. Fetch User from DB│                        │ 1. Extract token     │
     │ 3. bcrypt.compare()  │                        │ 2. jose.jwtVerify()  │
     │ 4. Issue signed JWT  │                        │ 3. Fetch User by ID  │
     │ 5. Set HttpOnly      │                        │ 4. Resolve Profile   │
     │    sb_session cookie │                        │ 5. Inject auth ctx   │
     └──────────────────────┘                        └──────────────────────┘
```

---

## 2. Technology Stack & Packages Added

- **Password Hashing**: `bcryptjs` (salt rounds: `10`)
  - Pure JavaScript implementation compatible with Next.js App Router and Node runtimes on Windows/Linux without C++ build toolchain dependencies.
- **Session Tokens**: `jose` (`HS256` HMAC-SHA256)
  - Native Web Crypto API-based JWT signing and verification.
  - Zero external dependencies, fast, tamper-proof.

---

## 3. Session Security Strategy

- **Cookie Name**: `sb_session`
- **Transport Flags**:
  - `HttpOnly: true` (Inaccessible to client JavaScript, protecting against XSS token theft).
  - `SameSite: "lax"` (Protects against CSRF attacks across cross-origin requests).
  - `Secure: true` in production environments (HTTPS only).
  - `Path: "/"`
  - `MaxAge: 604,800` (7 days session validity).
- **Bearer Token Support**: API callers and automated tests can also pass the session token via standard `Authorization: Bearer <token>` headers.
- **No Client Secrets**: Secrets are never saved in `localStorage`.

---

## 4. Canonical Demo Credentials

For local development and testing, canonical accounts are seeded with secure bcrypt hashes:

| Role | Email | Password | Canonical Profile ID |
| :--- | :--- | :--- | :--- |
| **Student** | `alex.johnson@university.edu` | `Student123!` | `student-1` ("Alex Johnson") |
| **Client** | `client@skillbridge.co` | `Client123!` | `client-1` ("Veda Studios") |

---

## 5. Endpoints Implemented

### `POST /api/auth/login`
- **Payload**: `{ email: string, password: string }`
- **Behavior**:
  1. Looks up `User` by lowercase normalized email in PostgreSQL.
  2. Compares password against stored `passwordHash` using `bcrypt.compare`.
  3. Rejects invalid credentials with `401 Unauthorized` (`INVALID_CREDENTIALS`).
  4. Issues a signed 7-day JWT session token containing `userId`, `email`, `role`, and profile IDs.
  5. Sets `sb_session` HttpOnly cookie.
  6. Returns sanitized user object (excluding `passwordHash`).

### `POST /api/auth/signup`
- **Payload**: `{ email: string, password: string, name: string, role: "STUDENT" | "CLIENT", companyName?: string, ... }`
- **Behavior**:
  1. Validates email format, password length (minimum 6 characters), and role (`STUDENT` or `CLIENT`).
  2. For `CLIENT`, requires `companyName`.
  3. Checks email uniqueness against PostgreSQL (returns `409 Conflict` if registered).
  4. Hashes password using bcrypt.
  5. **Transactionally** creates `User` + `StudentProfile` or `ClientProfile` via Prisma transaction (preventing orphaned records).
  6. Automatically signs in the new user, sets `sb_session` cookie, and returns `201 Created`.

### `POST /api/auth/logout`
- **Behavior**: Clears the `sb_session` cookie by setting `Max-Age: 0`.

### `GET /api/auth/me`
- **Behavior**: Inspects and verifies the current session, returning the sanitized user and attached profile, or `401 Unauthorized`.

---

## 6. Server Auth Context & Protection Helpers

Located in [`src/lib/server/auth/context.ts`](file:///c:/Users/manik/Downloads/skill%20Bridge/src/lib/server/auth/context.ts):

- **`getCurrentUser(req)`**: Extracts session from cookie or Bearer header, cryptographically verifies the token, and queries the user and profile from PostgreSQL. Returns `null` if unauthenticated or forged.
- **`requireAuthenticatedUser(req)`**: Ensures user is authenticated; throws `AuthError(401)`.
- **`requireStudent(req)`**: Ensures caller has verified `STUDENT` role and attached `StudentProfile`; throws `AuthError(403)` otherwise.
- **`requireClient(req)`**: Ensures caller has verified `CLIENT` role and attached `ClientProfile`; throws `AuthError(403)` otherwise.

### Elimination of Browser-Controlled Identity Bypasses
- In production, arbitrary headers (`x-user-id`, `x-user-role`, `x-user-email`) are **completely ignored**.
- A caller cannot elevate privileges or impersonate users by passing request headers or body properties.
- Only when `NODE_ENV === "test"` AND a private server-side secret (`x-skillbridge-test-auth === process.env.AUTH_SECRET`) is supplied will header-based identity override execute (strictly for automated test runner isolation).

---

## 7. Automated Test Verification Results

All 16 authentication and security specifications were verified against the live PostgreSQL database:

```text
==================== AUDIT RESULTS ====================
✅ 1. Valid Student login succeeds
   └─ Student authenticated (alex.johnson@university.edu), password verified, session token generated
✅ 2. Valid Client login succeeds
   └─ Client authenticated (client@skillbridge.co), password verified, session token generated
✅ 3. Invalid password fails
   └─ Password verification rejected incorrect password
✅ 4. Unknown email fails
   └─ Lookup for non-existent email safely returns null
✅ 5. Duplicate signup is rejected
   └─ Existing email detected; registration rejects collision with 409 Conflict
✅ 6. Student signup creates User + StudentProfile
   └─ User and StudentProfile created transactionally
✅ 7. Client signup creates User + ClientProfile
   └─ User and ClientProfile created transactionally
✅ 8. Student session resolves STUDENT role
   └─ Resolved role: STUDENT, Profile ID: student-1
✅ 9. Client session resolves CLIENT role
   └─ Resolved role: CLIENT, Profile ID: client-1
✅ 10. Browser-supplied x-user-id cannot impersonate another user
   └─ Unverified header ignored; session resolves to null
✅ 11. Browser-supplied x-user-role cannot elevate privileges
   └─ Unverified role header ignored; session resolves to null
✅ 12. Protected API requests without authentication return 401
   └─ requireAuthenticatedUser rejected anonymous call with 401 UNAUTHORIZED
✅ 13. Student cannot perform Client-only operations
   └─ requireClient rejected student session with 403 FORBIDDEN
✅ 14. Client cannot perform Student-only operations
   └─ requireStudent rejected client session with 403 FORBIDDEN
✅ 15. Existing Step 3 authorization tests still pass
   └─ State machine rejected withdrawal of Accepted application under real session
✅ 16. Accepting an application still creates exactly one WorkContract
   └─ WorkContract created. Idempotency verified: count remained 1 on repeated accept
=======================================================
Final Result: ALL 16 TESTS PASSED
```

---

## 8. How Step 5 Will Consume the Authenticated APIs

In Step 5 (Frontend API Migration):
1. **Client Auth Context**: Already wired to call `/api/auth/login` and `/api/auth/signup` when signing in, establishing the real `sb_session` cookie alongside the local prototype cache.
2. **API Requests**: All browser `fetch` calls to `/api/projects`, `/api/applications`, and `/api/work` will automatically transmit the `sb_session` cookie via browser cookie jar (`credentials: 'same-origin'`).
3. **Identity Derivation**: `POST /api/projects` and `POST /api/projects/[id]/applications` automatically resolve the logged-in client or student profile without requiring any ID in the request body.
