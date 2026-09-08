# SkillBridge — Step 9: Real Persistent Messaging Implementation

**Status**: IMPLEMENTED & VERIFIED  
**Date**: September 7, 2026  
**Author**: Antigravity  

---

## 1. Executive Summary

"Step 9 implements persistent messaging. Full real-time WebSocket/SSE messaging is deferred unless explicitly implemented."

The SkillBridge messaging architecture has been migrated from prototype mock memory state (`src/data/messages.ts`) to a production-grade, relational database-persisted messaging system powered by PostgreSQL on Neon, Prisma ORM, and authenticated Next.js App Router API routes.

Conversations and messages are strictly scoped to verified marketplace relationships between Students and Clients (specifically tied to an Application or an active WorkContract). All messages persist across browser refreshes, sessions, and devices.

---

## 2. Database Schema & Relational Integrity

Two new models were added to `prisma/schema.prisma` and deployed via migration `20260907_add_conversations_and_messages`:

### `Conversation`
```prisma
model Conversation {
  id          String         @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  clientId    String
  client      ClientProfile  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId   String
  project     Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  messages    Message[]

  @@unique([studentId, clientId, projectId])
  @@index([studentId])
  @@index([clientId])
  @@index([projectId])
  @@index([updatedAt])
}
```

### `Message`
```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Restrict)
  content        String
  readAt         DateTime?
  attachmentUrl  String?
  attachmentName String?
  attachmentSize String?

  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
  @@index([conversationId, createdAt])
  @@index([conversationId, readAt])
}
```

### Relational Guarantees:
- **Composite Uniqueness**: `@@unique([studentId, clientId, projectId])` prevents duplicate conversation threads between the same student and client for a given project.
- **Cascading Deletes**: If a project or profile is deleted, conversations and messages cascade safely.
- **Foreign Key Indexing**: Indexes on `studentId`, `clientId`, `projectId`, `updatedAt`, `conversationId`, `senderId`, and `readAt` optimize sorting and unread counts.

---

## 3. API Endpoints

| Endpoint | Method | Authorization | Description |
|---|---|---|---|
| `/api/conversations` | `GET` | Authenticated (`STUDENT` or `CLIENT`) | Lists conversations for the authenticated user, sorted by `updatedAt: desc`. Includes latest message preview and unread counts. |
| `/api/conversations` | `POST` | Authenticated | Creates or retrieves an existing conversation for a given `projectId` and `studentId` after verifying marketplace relationships. |
| `/api/conversations/[id]` | `GET` | Conversation Participant | Fetches conversation metadata, participant details, project context, and work contract info. |
| `/api/conversations/[id]/messages` | `GET` | Conversation Participant | Returns chronological messages with optional pagination (`?limit=50&before=timestamp`). |
| `/api/conversations/[id]/messages` | `POST` | Conversation Participant | Sends a plain-text message with optional attachment metadata. Derives `senderId` strictly from session. |
| `/api/conversations/[id]/read` | `PATCH` | Conversation Participant | Marks all unread messages sent by the counterparty as read (`readAt = now()`). |

---

## 4. Security & Privacy Guarantees

1. **Strict Server-Derived Identity**:
   - The API ignores any client-supplied `senderId`, `userId`, or `role` in the request body.
   - The sender is resolved exclusively from the cryptographically verified `sb_session` JWT cookie.
2. **Cross-Account Isolation**:
   - A student attempting to access or message another student's conversation receives `403 FORBIDDEN`.
   - A client attempting to access or message another client's conversation receives `403 FORBIDDEN`.
   - Non-existent conversations return `404 NOT_FOUND`.
3. **Data Sanitization**:
   - Passwords, `passwordHash`, tokens, and internal auth secrets are never queried or leaked in message or conversation DTOs.
4. **Input Validation**:
   - Empty and whitespace-only messages are rejected (`400 BAD_REQUEST`).
   - Maximum message length is capped at 5,000 characters.
   - HTML/script tags are stored and rendered as raw text, mitigating XSS risks.
5. **Marketplace Relationship Requirement**:
   - Conversations cannot be initiated between arbitrary users. A verified `Application` or active `WorkContract` is mandatory before a conversation can be created.

---

## 5. Read / Unread System

- `readAt: DateTime?` is stored directly on the `Message` table in PostgreSQL.
- Unread counts are computed directly from the database:
  `COUNT(*) WHERE conversationId = id AND senderId != auth.user.id AND readAt IS NULL`.
- When an active conversation is opened or viewed, a `PATCH /api/conversations/[id]/read` request is dispatched, updating `readAt` in PostgreSQL and updating the badge indicator locally.
- Unread status persists across refreshes and multiple devices.

---

## 6. Real-Time Status & Polling Behavior

- True WebSocket / Server-Sent Events (SSE) streaming is deferred for a dedicated real-time communications milestone.
- An intelligent 4-second polling loop runs on the active conversation in the student UI:
  - Periodically syncs incoming counterparty messages.
  - Updates conversation preview and unread counters.
  - Pauses and cleans up immediately on tab change, conversation deselection, or component unmount.
- When sending messages, optimistic submission blocking prevents duplicate messages while the POST request is in flight.

---

## 7. Verification & Test Coverage

- **Automated Test Suite**: 70/70 assertions passed in `scripts/test-step9.ts`:
  - Database relational integrity (no orphaned conversations or messages).
  - List conversations for Student 1 and Client 1.
  - Cross-account isolation (Student 2 receives 403 when accessing Student 1's conversation).
  - Missing conversation returns 404.
  - Message privacy: zero password/token leaks in DTOs.
  - Input validation: empty and >5000 char messages rejected.
  - Server-side sender session derivation: sender ID matched authenticated user.
  - Read/unread persistence verified in PostgreSQL.
  - Marketplace relationship enforcement on conversation creation.
- **Build & Compilation**:
  - `npx prisma validate`: Schema valid.
  - `npx tsc --noEmit`: 0 errors.
  - `@ts-nocheck`: 0 occurrences.
  - `npm run build`: 38/38 routes compiled successfully.

---

## 8. Remaining Limitations & Future Roadmap

1. **WebSocket / SSE**: Live typing indicators and instant push delivery without polling.
2. **File Storage**: Attachments currently record metadata (`name`, `size`, `id`); file uploads will integrate with S3/Cloudflare R2 object storage.
3. **Client Messaging UI**: While the backend API supports both `STUDENT` and `CLIENT` participants, a full client-side messaging pane (e.g. `/client/messages`) can be wired up in a subsequent iteration using the identical API contracts.
