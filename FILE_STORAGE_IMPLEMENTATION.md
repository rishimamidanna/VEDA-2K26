# SkillBridge ? Supabase Storage Integration

**Status**: IMPLEMENTED & VERIFIED  
**Date**: September 7, 2026  
**Storage Provider**: Supabase Storage (Free Tier)  
**Database**: Neon PostgreSQL (Single Application Database)  

---

## 1. Architectural Overview

SkillBridge uses **Supabase Storage** exclusively for private object and binary file storage. The core relational data and file metadata remain strictly housed inside **Neon PostgreSQL** managed via **Prisma ORM**. No application database tables were migrated to Supabase.

- **Storage Bucket**: `skillbridge-files` (Private bucket).
- **Client Library**: `@supabase/supabase-js` v2.
- **Server Access Only**: All storage operations with elevated privileges use `SUPABASE_SERVICE_ROLE_KEY` on the Next.js server runtime only. The service role key is never exposed to browser bundles.

---

## 2. Environment Variables & Setup

In `.env`:

```env
# Supabase Storage Integration (Free Tier)
SUPABASE_URL="https://xuovtkupaiifrgzglyge.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Security Rules:
1. `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_`.
2. The server helper (`src/lib/server/storage/supabase.ts`) normalizes URLs and strips quotes or missing protocol schemes (`https://`) automatically.
3. If credentials are missing in production, storage endpoints fail closed with explicit internal configuration errors rather than exposing raw stack traces.

---

## 3. Database Model & Schema Migration

Migration `20260907_add_stored_files` introduced the `StoredFile` model to PostgreSQL:

```prisma
model StoredFile {
  id             String       @id @default(cuid())
  bucket         String       @default("skillbridge-files")
  path           String       @unique
  originalName   String
  mimeType       String
  size           Int
  category       String       // PROFILE_AVATAR, PORTFOLIO_IMAGE, PROJECT_FILE, WORK_DELIVERABLE, MESSAGE_ATTACHMENT
  
  ownerId        String
  owner          User         @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  // Contextual associations for fine-grained authorization
  studentId      String?
  clientId       String?
  projectId      String?
  workContractId String?
  conversationId String?

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([ownerId])
  @@index([category])
  @@index([conversationId])
  @@index([projectId])
  @@index([workContractId])
  @@index([studentId])
}
```

**Zero binary data is stored in PostgreSQL.** PostgreSQL only maintains audit metadata (`path`, `mimeType`, `size`, `ownerId`, and contextual IDs).

---

## 4. Object Naming & Directory Structure

Objects are organized under strict prefix namespaces:

| Category | Storage Path Structure | Max Size | Allowed MIME Types |
|---|---|---|---|
| `PROFILE_AVATAR` | `profiles/{profileId}/{timestamp}-{hex}.{ext}` | 2 MB | `image/jpeg`, `image/png`, `image/webp` |
| `PORTFOLIO_IMAGE` | `portfolio/{studentId}/{portfolioId}/{timestamp}-{hex}.{ext}` | 5 MB | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| `PROJECT_FILE` | `projects/{projectId}/{timestamp}-{hex}.{ext}` | 15 MB | PDF, images, text, CSV, ZIP |
| `WORK_DELIVERABLE` | `deliverables/{workContractId}/{timestamp}-{hex}.{ext}` | 25 MB | PDF, code ZIPs, images, text, CSV |
| `MESSAGE_ATTACHMENT` | `messages/{conversationId}/{timestamp}-{hex}.{ext}` | 15 MB | PDF, images, text, CSV, ZIP |

Dangerous extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.vbs`, `.msi`, `.jar`, etc.) are blocked universally.

---

## 5. Upload & Download Workflows

### A. Direct Server Upload (`POST /api/files/upload`)
1. Client submits a `multipart/form-data` request containing `file`, `category`, and optional `contextId`.
2. Server verifies `auth` session and confirms the caller is authorized to upload to that category and context (e.g. participant in `conversationId` or student on `workContractId`).
3. Server validates file extension, MIME type, and size limits.
4. Server streams binary buffer to Supabase Storage via `uploadFileDirect`.
5. Server writes metadata record to PostgreSQL `StoredFile` table.
6. Returns sanitized file DTO with generated `id`.

### B. Signed Upload URL (`POST /api/files/upload-url`)
1. Client requests upload permissions with `{ fileName, fileSize, mimeType, category, contextId }`.
2. Server validates authorization, pre-creates `StoredFile`, and requests a signed upload URL from Supabase Storage (`createSignedUploadUrl`).
3. Server returns `{ fileId, signedUrl, token, path }`.
4. Client uploads directly to Supabase Storage using the signed URL.

### C. Authorized Short-Lived Download (`GET /api/files/[id]/download`)
Because the bucket is private, objects cannot be accessed via public static URLs.
1. Client requests download via `GET /api/files/[id]/download?redirect=true` or metadata fetch.
2. Server validates that the authenticated user is authorized to read the file:
   - File owner is always authorized.
   - Message attachments require the user to be a participant in the conversation.
   - Project files require project client or applicant student.
   - Deliverables require work contract student or client.
   - Unauthorized users receive `403 FORBIDDEN`.
3. Server generates a signed URL (`createSignedDownloadUrl`) with 300-second (5 min) TTL.
4. If `?redirect=true`, the API responds with HTTP 307 Redirect directly to the signed download URL.

---

## 6. Cleanup & Orphan Handling

- When a file is deleted via `DELETE /api/files/[id]`, the server verifies ownership, removes the object from Supabase Storage via `supabase.storage.from(bucket).remove([path])`, and deletes the database record.
- Cascading foreign keys on `User` ensure that account deletion removes all associated `StoredFile` metadata records.

---

## 7. Free-Tier Considerations

- Supabase Storage Free Tier provides 1 GB of storage and 2 GB of monthly bandwidth.
- File size limits are capped at 25 MB per file (well within the Supabase 50 MB limit).
- Short-lived signed URLs (5 min TTL) prevent bandwidth scraping and unauthorized link sharing.

---

## 8. Verification Results

All 28 automated integration assertions passed in `scripts/test-storage.ts`:
- Rejection of `.exe` and dangerous file types (`DANGEROUS_FILE_TYPE`).
- Rejection of unsupported MIME types (`UNSUPPORTED_MIME_TYPE`).
- Rejection of oversized files (`FILE_TOO_LARGE`).
- Cross-account upload rejection (Student 2 forbidden from uploading to Student 1's conversation).
- Real binary upload to live Supabase bucket `skillbridge-files`.
- Verification that zero binary data is stored in PostgreSQL.
- Authorized signed URL generation for conversation participants.
- Rejection of unauthorized download attempts with HTTP 403.
- Byte-for-byte verification of downloaded payload via HTTP fetch.
- Owner-only deletion verification.
- Zero secrets or service-role keys leaked in API responses.
- Clean regression across messaging and marketplace queries.
- Production build passes with 40/40 routes compiled.
