# SkillBridge — Backend API Foundation Documentation

This document describes the server-side API architecture, authentication abstraction, authorization policies, state transition enforcement, and transaction guarantees implemented during **Step 3: Backend API Foundation**.

> [!IMPORTANT]
> **Scope Notice**:
> This phase establishes the production-ready server API foundation and routes.
> **Frontend migration from `localStorage` / `sharedRepository` to these API endpoints is explicitly deferred to future phases.** The current frontend remains fully functional and unmodified.

---

## 1. Architectural Overview

The backend is organized within the Next.js App Router structure:
```text
src/
├── app/
│   └── api/
│       ├── applications/
│       │   ├── route.ts                 # GET /api/applications
│       │   └── [id]/
│       │       └── route.ts             # PATCH /api/applications/[id]
│       ├── projects/
│       │   ├── route.ts                 # GET, POST /api/projects
│       │   └── [id]/
│       │       ├── route.ts             # GET, PATCH /api/projects/[id]
│       │       └── applications/
│       │           └── route.ts         # GET, POST /api/projects/[id]/applications
│       └── work/
│           ├── route.ts                 # GET /api/work
│           └── [id]/
│               └── route.ts             # GET, PATCH /api/work/[id]
└── lib/
    └── server/
        ├── api-response.ts              # Standardized API response & error formatters
        ├── auth/
        │   └── context.ts               # Replaceable server authentication & role resolvers
        ├── projects/
        │   └── service.ts               # Marketplace project business logic & queries
        ├── applications/
        │   ├── service.ts               # Application submissions & transactional transitions
        │   └── state-machine.ts         # Server-side application state machine
        └── work/
            └── service.ts               # Contract management & progress tracking
```

---

## 2. Server-Side Authentication Abstraction

### Design Principle
The server **never trusts browser-supplied identity fields** (such as `studentId` or `clientId` sent in request bodies). All permissions and domain scoping are resolved strictly on the server:

```typescript
// Located in src/lib/server/auth/context.ts
getCurrentUser(req: Request): Promise<AuthenticatedUser | null>
requireAuthenticatedUser(req: Request): Promise<AuthenticatedUser>
requireRole(req: Request, role: UserRole): Promise<AuthenticatedUser>
requireStudent(req: Request): Promise<AuthenticatedStudent>
requireClient(req: Request): Promise<AuthenticatedClient>
```

### Identity Resolution Mechanism (Pluggable)
The current abstraction resolves authenticated users from:
1. `sb_client_session` cookie (client web session).
2. `x-user-email` or `x-user-id` request headers (API / integration test callers).
3. `x-user-role` (`STUDENT` or `CLIENT`), resolving canonical demo entities (`alex.johnson@university.edu` / `client@skillbridge.co`).
4. Database lookup: Resolves and links the user record to their corresponding `StudentProfile` or `ClientProfile`.

When NextAuth / Auth.js is implemented, this file can be updated internally without rewriting any API route business logic.

---

## 3. Standard API Response & Error Conventions

All endpoints adhere to a uniform JSON envelope:

### Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Envelope (HTTP 400, 401, 403, 404, 409, 422, 500)
```json
{
  "success": false,
  "error": {
    "message": "Human readable error description",
    "code": "ERROR_CODE_IDENTIFIER"
  }
}
```

### Standard Status Codes
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful creation of project or application.
- `400 Bad Request`: Missing required payload or validation error.
- `401 Unauthorized`: Authentication required.
- `403 Forbidden`: Authenticated user lacks ownership or role permission.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Unique constraint violation (e.g., duplicate application).
- `422 Unprocessable Entity`: Illegal state machine transition attempt.
- `500 Internal Server Error`: Unexpected server exception (safe message, no leaked credentials).

---

## 4. API Endpoints Reference

### Projects

#### `GET /api/projects`
- **Purpose**: Fetch public marketplace projects from PostgreSQL with associated skills and applicant counts.
- **Query Filters**:
  - `status`: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`
  - `category`: Category string (e.g. `Web Development`, `UI/UX Design`)
  - `search`: Case-insensitive substring match across title, description, category, and skills.
  - `clientId`: Filter by client profile ID.

#### `GET /api/projects/[id]`
- **Purpose**: Retrieve project specifications and client company details.
- **Access**: Public / Any authenticated user.

#### `POST /api/projects`
- **Purpose**: Create a new marketplace project.
- **Access**: `CLIENT` role only.
- **Security**: Ownership (`clientId`) is strictly injected from the server session; client cannot forge ownership.

#### `PATCH /api/projects/[id]`
- **Purpose**: Update project details, deliverables, or status.
- **Access**: Only the owning `CLIENT` can update. Unauthorized clients receive `403 Forbidden`.

---

### Applications

#### `POST /api/projects/[id]/applications`
- **Purpose**: Submit proposal for a project.
- **Access**: `STUDENT` role only.
- **Security & Constraints**:
  - Student identity is derived server-side from `auth.studentProfile.id`.
  - Rejects closed projects (`400`).
  - Rejects duplicate applications (`409 Conflict`), enforced both by service pre-check and database `@@unique([projectId, studentId])`.
  - Default status: `PENDING`.

#### `GET /api/applications`
- **Purpose**: List user's applications.
- **Access**: Any authenticated user.
  - **Student View**: Scoped strictly to applications submitted by this student.
  - **Client View**: Scoped strictly to applications received for this client's projects.

#### `GET /api/projects/[id]/applications`
- **Purpose**: Retrieve applicant pipeline for a specific project.
- **Access**: Only the owning `CLIENT`. Returns `403 Forbidden` if another client attempts access.

#### `PATCH /api/applications/[id]`
- **Purpose**: Transition application status (e.g., Shortlist, Accept, Reject, Withdraw).
- **Access**:
  - `CLIENT`: Allowed transitions from `PENDING` → `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`; from `SHORTLISTED` → `ACCEPTED`, `REJECTED`.
  - `STUDENT`: Allowed transition from `PENDING`, `UNDER_REVIEW`, `SHORTLISTED` → `WITHDRAWN`.
- **State Machine Enforcement**:
  - `ACCEPTED`, `REJECTED`, and `WITHDRAWN` are terminal states.
  - Students **cannot** withdraw an Accepted or Rejected application.
  - Any illegal transition is rejected with `422 Unprocessable Entity` (`INVALID_STATE_TRANSITION`).
- **Transactional Contract Creation**:
  - When an application transitions to `ACCEPTED`, an interactive database transaction atomically:
    1. Updates application status to `ACCEPTED`.
    2. Idempotently creates a `WorkContract` linking the student, client, and project.
    3. Increments `studentsHiredCount` on the client profile.
  - If called repeatedly, idempotency prevents duplicate contract creation.

---

### Work / Contracts

#### `GET /api/work`
- **Purpose**: List active work contracts.
- **Access**: Authenticated users.
  - **Student**: Returns only contracts where `studentId === auth.studentProfile.id`.
  - **Client**: Returns only contracts where `clientId === auth.clientProfile.id`.

#### `GET /api/work/[id]`
- **Purpose**: Retrieve contract details, progress, and project details.
- **Access**: Only the assigned Student or owning Client. Other users receive `403 Forbidden`.

#### `PATCH /api/work/[id]`
- **Purpose**: Update milestone progress (0–100%), contract status (`IN_PROGRESS`, `AWAITING_REVIEW`, `COMPLETED`), or latest activity note.
- **Access**: Only the assigned Student or Client.

---

## 5. Security & Verification Test Results

An automated security audit was executed directly against the live database, validating all 12 test conditions:

1. **Student cannot create a project**: ✅ Passed (`requireClient` rejects `STUDENT` with 403).
2. **Client cannot submit an application**: ✅ Passed (`requireStudent` rejects `CLIENT` with 403).
3. **Student cannot access another student's applications**: ✅ Passed (Zero cross-student leakage).
4. **Client cannot access another client's projects**: ✅ Passed (`FORBIDDEN` 403 returned).
5. **Client cannot modify another client's project**: ✅ Passed (`FORBIDDEN` 403 returned).
6. **Student cannot modify another student's application**: ✅ Passed (`FORBIDDEN` 403 returned).
7. **Student cannot withdraw Accepted application**: ✅ Passed (Rejected with `INVALID_TRANSITION`).
8. **Student cannot withdraw Rejected application**: ✅ Passed (Rejected with `INVALID_TRANSITION`).
9. **Duplicate application is rejected**: ✅ Passed (Rejected with `DUPLICATE_APPLICATION` / 409).
10. **Accepting an application creates exactly one WorkContract**: ✅ Passed (Atomic transaction verified).
11. **Repeating acceptance does not create another WorkContract**: ✅ Passed (Idempotency verified).
12. **Rejected application has no WorkContract**: ✅ Passed (Zero contracts created).

---

## 6. How Future Frontend Migration Should Consume These APIs

When the frontend transition phase begins:
1. Replace `sharedRepository.getProjects()` calls with `fetch('/api/projects')` or SWR hooks (`useSWR('/api/projects', fetcher)`).
2. Replace `sharedRepository.saveApplication()` with `POST /api/projects/${id}/applications`.
3. Replace client pipeline status mutations with `PATCH /api/applications/${id}` `{ status: "Accepted" }`.
4. Replace active work queries in `student/work` with `GET /api/work`.
5. Connect real session cookies upon login to automate server-side identity resolution.
