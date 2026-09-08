# SkillBridge Frontend API Migration (Step 5)

## Overview

Step 5 transitions SkillBridge's Student and Client user interfaces from local, client-side repository mocks (`sharedRepository` / `localStorage`) to production-ready, server-authoritative REST APIs powered by **Next.js App Router**, **Prisma ORM**, and **PostgreSQL (Neon)**.

All project browsing, project creation, proposal submissions, pipeline evaluations, application lifecycle transitions, and work contract execution flows communicate directly with the live database.

---

## 1. Domain Migration Summary

| Domain | Prior State | Current Migrated State | Authority |
| :--- | :--- | :--- | :--- |
| **Authentication & Identity** | Client/Student hardcoded profiles, mock context | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` via HttpOnly `sb_session` JWT | Server DB (PostgreSQL) |
| **Project Marketplace** | `sharedRepository.getProjects()` | `GET /api/projects`, `GET /api/projects/[id]` | Server DB (PostgreSQL) |
| **Project Creation** | `clientProjectsRepository.createProject()` | `POST /api/projects` | Server DB (PostgreSQL) |
| **Student Applications** | `sharedRepository.saveApplication()` | `POST /api/projects/[id]/applications` | Server DB (PostgreSQL) |
| **Applications List & Detail** | `sharedRepository.getApplications()` | `GET /api/applications`, `GET /api/applications/[id]` | Server DB (PostgreSQL) |
| **Client Applicants Pipeline** | `clientApplicationsRepository` | `GET /api/projects/[id]/applications`, `PATCH /api/applications/[id]` | Server DB (PostgreSQL) |
| **Work Contracts** | Mock objects synthesized from localStorage | `GET /api/work`, `GET /api/work/[id]` | Server DB (PostgreSQL) |
| **Work Progress & Delivery** | Local UI state mutation | `PATCH /api/work/[id]` | Server DB (PostgreSQL) |
| **Client Hired Talent** | `clientApplicationsRepository.getAcceptedApplications()` | `GET /api/work` | Server DB (PostgreSQL) |

---

## 2. API Endpoints Called by UI Features

### Authentication Domain
- `POST /api/auth/login`
  - **Called by**: `src/components/student/student-login-form.tsx`, `src/components/client/client-login-form.tsx`
  - **Payload**: `{ email, password }`
  - **Result**: Validates bcrypt hash, issues cryptographically signed JWT via `sb_session` HttpOnly cookie.
- `GET /api/auth/me`
  - **Called by**: `src/components/student/student-auth-context.tsx`, `src/components/client/client-auth-context.tsx`
  - **Result**: Resolves authoritative user profile and role on app load / page reload.
- `POST /api/auth/logout`
  - **Called by**: Student and Client header navigation bars
  - **Result**: Clears `sb_session` cookie securely.

### Project Domain
- `GET /api/projects`
  - **Called by**: `src/app/student/projects/page.tsx`, `src/components/client/client-projects-list.tsx`
  - **Parameters**: `status`, `category`, `search`, `clientId`
  - **Result**: Returns list of database projects with skills and client profile relations.
- `GET /api/projects/[id]`
  - **Called by**: `src/app/student/projects/[id]/page.tsx`, `src/components/client/client-project-detail-client.tsx`
  - **Result**: Full project specifications, client details, and requirement lists.
- `POST /api/projects`
  - **Called by**: `src/components/client/post-project-form.tsx`
  - **Payload**: `{ title, description, category, skills, budget, duration, experienceLevel, deliverables, deadline }`
  - **Security**: Strict server-side `requireClient()` check; assigns ownership to verified `clientProfile.id`.

### Application Domain
- `POST /api/projects/[id]/applications`
  - **Called by**: `src/components/student/ProjectDetails/ApplyModal.tsx`
  - **Payload**: `{ proposal, proposedBudget, estimatedCompletion }`
  - **Security**: Strict server-side `requireStudent()` check; enforces `@@unique([projectId, studentId])` prevention against duplicate submissions (returns 409 Conflict).
- `GET /api/applications`
  - **Called by**: `src/app/student/applications/page.tsx`, `src/components/student/RecentApplications.tsx`
  - **Result**: Returns all applications submitted by the session student, populated with project information.
- `GET /api/applications/[id]`
  - **Called by**: `src/app/student/applications/[id]/page.tsx`
  - **Result**: Single application details including project and work contract.
- `GET /api/projects/[id]/applications`
  - **Called by**: `src/components/client/project-applicants-pipeline.tsx`, `src/components/client/client-project-applicants-client.tsx`
  - **Security**: Verifies caller is the owner client of the project.
- `PATCH /api/applications/[id]`
  - **Called by**: `src/components/client/project-applicants-pipeline.tsx`, `src/app/student/applications/[id]/page.tsx`
  - **Payload**: `{ status: "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" }`
  - **Business Logic**: State machine validates legal transitions. When client accepts an applicant (`ACCEPTED`), the server transactionally generates an active `WorkContract`.

### Work & Contract Domain
- `GET /api/work`
  - **Called by**: `src/app/student/work/page.tsx`, `src/components/student/ActiveProject.tsx`, `src/components/client/hired-students-list.tsx`
  - **Behavior**: Dual-role query; students receive their active contracts, clients receive contracts for their projects.
- `GET /api/work/[id]`
  - **Called by**: `src/app/student/work/[id]/page.tsx`
  - **Result**: Contract specification, milestones, deliverables, and activity records.
- `PATCH /api/work/[id]`
  - **Called by**: `src/app/student/work/[id]/page.tsx`
  - **Payload**: `{ progress: number, status?: string, lastActivity?: string }`
  - **Result**: Updates progress percentage and transitions contract status (e.g., `AWAITING_REVIEW`).

---

## 3. Authentication & Authorization Architecture

1. **HttpOnly Cookie Authority**:
   Identity is stored in a cryptographically signed JSON Web Token inside the `sb_session` cookie (`SameSite=Lax`, `HttpOnly`, `Path=/`).
2. **Server Context Verification**:
   All API routes resolve identity via `getCurrentUser(req)` or role-specific guards (`requireStudent(req)`, `requireClient(req)`). Browser-supplied `x-user-id` or request body identifiers are ignored.
3. **Frontend Context Providers**:
   - `StudentAuthProvider` (`src/components/student/student-auth-context.tsx`) provides `user`, `role`, and `refreshUser()`.
   - `ClientAuthProvider` (`src/components/client/client-auth-context.tsx`) provides client credentials and session state.
4. **Instant Demo Sign-in**:
   - Student portal: `alex.johnson@university.edu` (`Student123!`)
   - Client portal: `client@skillbridge.co` (`Client123!`)

---

## 4. Cross-Actor Verification Results

The automated end-to-end integration test suite was executed against the live Neon PostgreSQL database:

```
=== SKILLBRIDGE STEP 5: CROSS-ACTOR E2E INTEGRATION SUITE ===

1. Testing Client Authentication...
  ✓ [PASS] Client login returns 200 OK
  ✓ [PASS] Client receives session token
  ✓ [PASS] Client user role is CLIENT

2. Testing Student Authentication...
  ✓ [PASS] Student login returns 200 OK
  ✓ [PASS] Student receives session token
  ✓ [PASS] Student user role is STUDENT

3. Testing Project Creation by Client...
  ✓ [PASS] Project creation returns 201 Created
  ✓ [PASS] Created project has an ID

4. Testing Project Retrieval...
  ✓ [PASS] GET /api/projects returns 200 OK
  ✓ [PASS] Newly created project is present in marketplace listing

5. Testing Student Application...
  ✓ [PASS] Student application returns 201 Created
  ✓ [PASS] Application initial status is PENDING

6. Testing Duplicate Application Prevention...
  ✓ [PASS] Duplicate application is rejected with 409 Conflict

7. Testing Client View of Applicants Pipeline...
  ✓ [PASS] Client can fetch applicants (200 OK)
  ✓ [PASS] Applicant is visible in client's project pipeline

8. Testing Application Acceptance and Transactional Contract Creation...
  ✓ [PASS] Application acceptance returns 200 OK
  ✓ [PASS] Application status updated to ACCEPTED
  ✓ [PASS] Work contract created in response
  ✓ [PASS] WorkContract was created in PostgreSQL database
  ✓ [PASS] WorkContract status is IN_PROGRESS

9. Testing Student Work Dashboard...
  ✓ [PASS] Student GET /api/work returns 200 OK
  ✓ [PASS] Student sees active WorkContract in work list

10. Testing Student Work Progress Update...
  ✓ [PASS] Updating work progress returns 200 OK
  ✓ [PASS] Work contract progress updated to 100%
  ✓ [PASS] Contract status transitioned to AWAITING_REVIEW

11. Testing Client View of Hired Students / Work...
  ✓ [PASS] Client GET /api/work returns 200 OK
  ✓ [PASS] Client sees contract in work portfolio
  ✓ [PASS] Client sees 100% progress

12. Testing Authorization Enforcement...
  ✓ [PASS] Student cannot create project (403 Forbidden)
  ✓ [PASS] Client cannot apply to project (403 Forbidden)
  ✓ [PASS] Student cannot accept application (403 Forbidden)

==================================================
SUCCESS: All 31/31 integration assertions passed!
==================================================
```

---

## 5. What Remains on Mock Data

Per explicit non-destructive migration requirements:
1. **Public Talent Directory (`/client/talent`)**:
   Static directory of non-registered student portfolios (`src/data/student-talent.ts`) remains available for public browsing until Student Portfolio domain APIs are introduced in future steps.
2. **Messages (`/student/messages`)**:
   Chat interface remains on static simulation; messaging APIs are scheduled for a subsequent release.
3. **Legacy Files Retained**:
   `src/lib/shared-repository.ts` and mock seed datasets are preserved in the repository to prevent breaking any auxiliary build targets, but zero migrated UI components read or write to them.

---

## 6. Build Status

Production compilation verified with Next.js 16.3.4 (Turbopack):
- `npm run build`: Exit code 0, 0 TypeScript errors, 39 static and dynamic routes generated successfully.
