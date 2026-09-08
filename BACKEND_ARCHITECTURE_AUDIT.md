# SKILLBRIDGE BACKEND ARCHITECTURE AUDIT

## 1. Current Architecture

- **Next.js Version:** 16.3.4 (Turbopack, App Router)
- **React Version:** 19.2.8
- **TypeScript Version:** ^5
- **App Router Structure:** IMPLEMENTED (`src/app` routing is strictly utilized for Client and Student interfaces).
- **State Management:** IMPLEMENTED natively via React hooks (`useState`, `useMemo`, `useEffect`) subscribing to window storage events.
- **Repository / Data Layer:** IMPLEMENTED (Client-side Repository Pattern via `src/lib/shared-repository.ts`).
- **Persistence Mechanism:** PARTIALLY IMPLEMENTED (Uses Browser `localStorage`, completely mocking a database).
- **Authentication:** MISSING (Client uses mock localStorage flags; Student identity is hardcoded to `"student-1"`).
- **Authorization:** MISSING (No server-side verification; UI conditionally renders based on local mock state).
- **Important Dependencies:** `framer-motion`, `lucide-react`, `@react-three/drei`, `tailwindcss v4`.
- **Architectural Constraints:** The UI relies heavily on synchronous, cross-component DOM events (`skillbridge_data_updated`) and `storage` events to trigger real-time reactivity without page reloads.

## 2. Implemented vs Missing

| Feature | Status | Notes |
| :--- | :--- | :--- |
| E2E Application Workflow | IMPLEMENTED | Local state successfully mimics the full E2E process. |
| UI Component Library | IMPLEMENTED | Tailwind + Framer Motion components are mature. |
| Canonical Types | IMPLEMENTED | `src/types/index.ts` cleanly unifies the domain models. |
| Server API Layer | MISSING | No Route Handlers exist. |
| Database | MISSING | No ORM or SQL database exists. |
| Authentication | MISSING | No secure session management exists. |

## 3. Backend Stack Comparison

| Stack | Ease of Integration | TypeScript Support | Next.js Compatibility | Developer Experience | Scalability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A: PostgreSQL + Prisma + Route Handlers** | Excellent | Perfect (Auto-generated) | Native | Industry standard, intuitive | High |
| **B: PostgreSQL + Drizzle + Route Handlers**| Good | Excellent | Native | SQL-like, slightly steeper | Very High |
| **C: Supabase** | High | Good | Good | BAAS, limits custom REST | High |

## 4. Recommended Backend Stack

**Option A (PostgreSQL + Prisma + Next.js Route Handlers)** is highly recommended. 
*Reasoning:* The current application uses a clean Object-Oriented repository pattern (`sharedRepository.getApplications()`). Prisma's syntax (`prisma.application.findMany()`) maps almost 1:1 with the current mental model, making the migration incredibly smooth for this Next.js 16 app. NextAuth (Auth.js) also integrates perfectly with Prisma.

## 5. Database Schema

Derived directly from `src/types/index.ts`:

*   **User**: `id` (PK), `role` (Enum: STUDENT, CLIENT), `email` (Unique), `passwordHash`, `name`, `avatar`, `createdAt`
*   **StudentProfile**: `id` (PK), `userId` (Unique FK), `headline`, `about`, `location`, `college`, `hourlyRate`, `availability`
*   **ClientProfile**: `id` (PK), `userId` (Unique FK), `companyName`, `industry`, `description`
*   **Skill**: `id` (PK), `name` (Unique)
*   **Project**: `id` (PK), `clientId` (FK), `title`, `description`, `category`, `budget`, `duration`, `status` (Enum: OPEN, IN_PROGRESS, CLOSED), `deadline`, `createdAt`
*   **Application**: `id` (PK), `projectId` (FK), `studentId` (FK), `status` (Enum: PENDING, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN), `proposal`, `proposedBudget`, `appliedAt`
    *   *Constraint:* Unique index on `[projectId, studentId]` (prevents double applying).
*   **WorkContract**: `id` (PK), `applicationId` (Unique FK), `projectId` (FK), `studentId` (FK), `clientId` (FK), `status` (Enum: IN_PROGRESS, AWAITING_REVIEW, COMPLETED), `progress`, `createdAt`

## 6. Type → Database Mapping

Based on `src/types/index.ts`:

*   **`Project`**: 
    *   *Direct Fields*: id, title, description, category, budget, status, etc.
    *   *Normalized Fields*: `skills` (moves to `ProjectSkill` join table).
    *   *UI-Only Fields (Do not persist)*: `clientDetails`, `applicantsCount`, `matchPercentage`.
*   **`Application`**: 
    *   *Direct Fields*: id, projectId, studentId, status, proposal.
    *   *Normalized Fields*: `name`, `avatarInitials`, `headline`, `college`, `relevantSkills`, `portfolioSummary` MUST be stripped from the DB model and fetched via relational JOINs to `StudentProfile` and `User`.
*   **`WorkProject`**: 
    *   *Direct Fields*: status, progress, lastActivity.
    *   *Normalized Fields*: `milestones`, `deliverables`, `recentActivity` become separate one-to-many tables.

## 7. sharedRepository Migration Strategy

**Incremental Phase Plan:**
1.  **PHASE A:** Do not touch `sharedRepository` yet. Set up Prisma and PostgreSQL in the background.
2.  **PHASE B:** Create an internal server-side `AppService` that implements the exact same interface as `sharedRepository`, but uses Prisma.
3.  **PHASE C:** Create Next.js API Routes (`/api/projects`, `/api/applications`) that call the `AppService`.
4.  **PHASE D:** Refactor `sharedRepository` to execute `fetch()` calls to the new APIs instead of accessing `localStorage`. 
5.  **PHASE E:** Replace the localized `dispatchEvent` reactivity with a data fetching library like **SWR** or **React Query**.
6.  **PHASE F:** Convert `src/data/*.ts` files into a `prisma/seed.ts` script. Do not delete them until the DB is fully seeded.

## 8. API Architecture

*   **Auth**
    *   `POST /api/auth/register` (Creates User + Profile)
    *   `POST /api/auth/login` (Establishes secure HttpOnly cookie session)
*   **Projects**
    *   `GET /api/projects` (Public/Student: Lists open projects)
    *   `POST /api/projects` (Client only: Creates a project)
    *   `GET /api/projects/:id` (Public)
*   **Applications**
    *   `POST /api/projects/:id/applications` (Student only: Validates no duplicate, inserts Application)
    *   `GET /api/applications` (Student only: Returns own applications)
    *   `GET /api/projects/:id/applicants` (Client only: Validates ownership of project, returns applicants)
    *   `PATCH /api/applications/:id/status` (Client only: Shortlist/Accept/Reject. Trigger WorkContract creation if Accepted)
    *   `PATCH /api/applications/:id/withdraw` (Student only: Changes status to Withdrawn)
*   **Work**
    *   `GET /api/work` (Client/Student: Returns active contracts)

## 9. Authentication & Authorization

**Recommendation:** **Auth.js (NextAuth v5)** with Credentials provider (for email/password prototype) + JWT session strategy.
*   **Identity Trust:** The backend MUST NEVER trust `studentId: "student-1"` passed in a POST body. The API route must call `await auth()` to extract the User ID from the secure JWT, ensuring a user can only apply or withdraw on their own behalf.
*   **Role Storage:** Store the `role` enum in the database and append it to the JWT payload so Route Handlers can perform `if (session.user.role !== "CLIENT") return 403`.

## 10. Application State Machine

The backend API must enforce these strict transitions:
*   **Pending** → Shortlisted (Client), Rejected (Client), Withdrawn (Student).
*   **Shortlisted** → Accepted (Client), Rejected (Client), Withdrawn (Student).
*   **Accepted** → Terminal. (Student cannot withdraw. Client cannot arbitrarily reject without a cancellation flow).
*   **Rejected / Withdrawn** → Terminal.

## 11. Work / Contract Architecture

Currently, `MyWorkPage` dynamically computes active work from "Accepted" applications.
**Target Backend Flow:** 
When the Client calls `PATCH /api/applications/:id/status` with `"Accepted"`, the API must open a Database Transaction:
1. Update Application status to `ACCEPTED`.
2. Insert a new `WorkContract` record mapping the `projectId`, `studentId`, and `clientId`.
3. Update Project status to `IN_PROGRESS` (if it's a single-hire project).
The `/api/work` endpoint will directly query the `WorkContract` table, completely decoupling it from the Application history.

## 12. Security Audit

| Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| **LocalStorage Auth** | CRITICAL | Implement HttpOnly JWT cookies via NextAuth. |
| **Forged Ownership** | CRITICAL | APIs must extract `userId` from the secure session token, ignoring client-provided IDs. |
| **Unauthorized Status Edit** | HIGH | `/api/applications/:id/status` must verify the `session.userId` matches the `Application.Project.clientId`. |
| **Duplicate Applications** | MEDIUM | Add a unique composite index in PostgreSQL: `@@unique([projectId, studentId])`. |

## 13. Synchronization / Realtime Strategy

The current prototype relies heavily on cross-tab DOM events (`storage`). 
**Recommendation:** For the first backend version, replace `sharedRepository` with **SWR (`useSWR`)**. 
SWR automatically provides:
*   Polling on interval (optional).
*   Revalidation on window focus (simulating realtime when switching tabs).
*   Global mutation caching (e.g., `mutate('/api/applications')`).
True WebSockets (Socket.io/Pusher) are overkill for Phase 1 and should be deferred until the Messaging feature is built.

## 14. Technical Debt

*   **MUST FIX BEFORE/DURING BACKEND:** 
    *   Hardcoded identities in `ApplyModal`.
    *   4 files in `src/components/client` containing `// @ts-nocheck` masking prop mismatches (e.g., `studentName` vs `name`).
*   **CAN DEFER:** 
    *   Duplicated layout components between `/client` and `/student`.
    *   Consolidating the `ProjectSearch` and `ProjectSort` filter logic.

## 15. Implementation Roadmap

1.  **Stage 1:** NextAuth.js setup & Session plumbing.
2.  **Stage 2:** Prisma initialization (`prisma init`) and PostgreSQL schema design.
3.  **Stage 3:** Prisma Seed script migrating `src/data/*.ts` JSON arrays into DB rows.
4.  **Stage 4:** API Routes for Projects (Read/Write).
5.  **Stage 5:** API Routes for Applications (Apply, Status transitions, Withdraw).
6.  **Stage 6:** Replace frontend `sharedRepository` calls with `useSWR` fetching the new APIs.
7.  **Stage 7:** Delete `src/lib/shared-repository.ts` and `src/data/*.ts`.

## 16. File-by-File Plan

*   **CREATE:** 
    *   `prisma/schema.prisma` (Database schema)
    *   `src/app/api/auth/[...nextauth]/route.ts` (NextAuth config)
    *   `src/app/api/projects/route.ts` (Project APIs)
    *   `src/app/api/applications/route.ts` (Application APIs)
    *   `src/lib/prisma.ts` (Prisma client singleton)
*   **MODIFY:** 
    *   All UI page components to use SWR hooks.
*   **DEPRECATE/REMOVE LATER:** 
    *   `src/lib/shared-repository.ts`
    *   `src/lib/client-applications-repository.ts`
    *   `src/data/*.ts`

## 17. Risk Assessment

**Biggest Migration Risk:** State Management breakages. The current UI assumes instantaneous, synchronous state updates via `window.dispatchEvent`. Moving to an asynchronous API layer introduces loading states, latency, and hydration mismatches. The UI must be carefully updated to utilize optimistic UI updates (via SWR `mutate` options) to preserve the snappy feel of the prototype.

## 18. Final Recommendation

1. **Stack:** PostgreSQL + Prisma + Next.js Route Handlers + SWR.
2. **Auth:** NextAuth.js (Auth.js v5) using JWTs.
3. **Migration:** Incremental. Build the API parallel to the mock repository, then swap data fetchers at the component level.
4. **First Task:** Initialize Prisma and map the unified types in `src/types/index.ts` to `schema.prisma`.
5. **DO NOT IMPLEMENT YET:** Realtime WebSockets, Payment processing, or heavy UI refactoring.

AUDIT STATUS: READY FOR BACKEND IMPLEMENTATION
