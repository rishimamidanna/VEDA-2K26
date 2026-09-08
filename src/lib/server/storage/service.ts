import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";
import {
  STORAGE_BUCKET,
  createSignedUploadUrl,
  uploadFileDirect,
  createSignedDownloadUrl,
  deleteFileFromStorage,
} from "./supabase";
import crypto from "crypto";

export class StorageError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 400, code: string = "STORAGE_ERROR") {
    super(message);
    this.name = "StorageError";
    this.status = status;
    this.code = code;
  }
}

export type FileCategory =
  | "PROFILE_AVATAR"
  | "PORTFOLIO_IMAGE"
  | "PROJECT_FILE"
  | "WORK_DELIVERABLE"
  | "MESSAGE_ATTACHMENT";

const CATEGORY_LIMITS: Record<FileCategory, { maxSize: number; allowedMimes: string[] }> = {
  PROFILE_AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2 MB
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
  },
  PORTFOLIO_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  PROJECT_FILE: {
    maxSize: 15 * 1024 * 1024, // 15 MB
    allowedMimes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
      "application/json",
    ],
  },
  WORK_DELIVERABLE: {
    maxSize: 25 * 1024 * 1024, // 25 MB
    allowedMimes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
      "application/json",
    ],
  },
  MESSAGE_ATTACHMENT: {
    maxSize: 15 * 1024 * 1024, // 15 MB
    allowedMimes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
      "application/json",
    ],
  },
};

const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".vbs", ".msi", ".jar", ".com", ".pif", ".scr", ".reg"
]);

export function sanitizeFileName(fileName: string): string {
  // Strip any leading directory components (both / and \)
  const base = fileName.replace(/^.*[\\\/]/, "");
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.slice(0, 100);
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : "";
}

export function validateFileMetadata(
  fileName: string,
  fileSize: number,
  mimeType: string,
  category: FileCategory
) {
  if (!fileName || !fileName.trim()) {
    throw new StorageError("Filename is required", 400, "INVALID_FILENAME");
  }

  const ext = getFileExtension(fileName);
  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new StorageError(`File type "${ext}" is not permitted for security reasons`, 400, "DANGEROUS_FILE_TYPE");
  }

  const limits = CATEGORY_LIMITS[category];
  if (!limits) {
    throw new StorageError(`Invalid storage category: ${category}`, 400, "INVALID_CATEGORY");
  }

  if (fileSize <= 0) {
    throw new StorageError("File cannot be empty", 400, "EMPTY_FILE");
  }

  if (fileSize > limits.maxSize) {
    const maxMb = Math.round(limits.maxSize / (1024 * 1024));
    throw new StorageError(
      `File exceeds maximum permitted size of ${maxMb}MB for ${category}`,
      400,
      "FILE_TOO_LARGE"
    );
  }

  const normalizedMime = mimeType.toLowerCase().trim();
  if (!limits.allowedMimes.includes(normalizedMime)) {
    throw new StorageError(
      `Unsupported MIME type "${mimeType}". Allowed types: ${limits.allowedMimes.join(", ")}`,
      400,
      "UNSUPPORTED_MIME_TYPE"
    );
  }
}

async function validateCategoryAuthorization(
  auth: AuthenticatedUser,
  category: FileCategory,
  contextId?: string
) {
  switch (category) {
    case "PROFILE_AVATAR": {
      // Must have studentProfile or clientProfile
      if (!auth.studentProfile && !auth.clientProfile) {
        throw new StorageError("Profile not found for authenticated user", 403, "FORBIDDEN");
      }
      return;
    }
    case "PORTFOLIO_IMAGE": {
      if (auth.role !== UserRole.STUDENT || !auth.studentProfile) {
        throw new StorageError("Only students can upload portfolio files", 403, "FORBIDDEN");
      }
      return;
    }
    case "MESSAGE_ATTACHMENT": {
      if (!contextId) {
        throw new StorageError("conversationId is required for message attachments", 400, "MISSING_CONTEXT");
      }
      const conv = await prisma.conversation.findUnique({
        where: { id: contextId },
      });
      if (!conv) {
        throw new StorageError("Conversation not found", 404, "NOT_FOUND");
      }
      const isParticipant =
        (auth.role === UserRole.STUDENT && conv.studentId === auth.studentProfile?.id) ||
        (auth.role === UserRole.CLIENT && conv.clientId === auth.clientProfile?.id);
      if (!isParticipant) {
        throw new StorageError("You are not authorized to upload attachments to this conversation", 403, "FORBIDDEN");
      }
      return;
    }
    case "PROJECT_FILE": {
      if (!contextId) {
        throw new StorageError("projectId is required for project files", 400, "MISSING_CONTEXT");
      }
      const project = await prisma.project.findUnique({
        where: { id: contextId },
        include: { applications: true },
      });
      if (!project) {
        throw new StorageError("Project not found", 404, "NOT_FOUND");
      }
      const isProjectClient = auth.role === UserRole.CLIENT && project.clientId === auth.clientProfile?.id;
      const isAppliedStudent =
        auth.role === UserRole.STUDENT &&
        project.applications.some((a) => a.studentId === auth.studentProfile?.id);

      if (!isProjectClient && !isAppliedStudent) {
        throw new StorageError("You are not authorized to upload files for this project", 403, "FORBIDDEN");
      }
      return;
    }
    case "WORK_DELIVERABLE": {
      if (!contextId) {
        throw new StorageError("workContractId is required for work deliverables", 400, "MISSING_CONTEXT");
      }
      const contract = await prisma.workContract.findUnique({
        where: { id: contextId },
      });
      if (!contract) {
        throw new StorageError("Work contract not found", 404, "NOT_FOUND");
      }
      const isContractStudent = auth.role === UserRole.STUDENT && contract.studentId === auth.studentProfile?.id;
      if (!isContractStudent) {
        throw new StorageError("Only the assigned student can upload deliverables for this contract", 403, "FORBIDDEN");
      }
      return;
    }
    default:
      throw new StorageError(`Unknown category: ${category}`, 400, "INVALID_CATEGORY");
  }
}

function generateSafePath(
  auth: AuthenticatedUser,
  category: FileCategory,
  fileName: string,
  contextId?: string
): string {
  const ext = getFileExtension(fileName);
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const uniqueName = `${Date.now()}-${randomSuffix}${ext}`;

  switch (category) {
    case "PROFILE_AVATAR": {
      const profileId = auth.studentProfile?.id || auth.clientProfile?.id;
      return `profiles/${profileId}/${uniqueName}`;
    }
    case "PORTFOLIO_IMAGE": {
      const studentId = auth.studentProfile!.id;
      const portfolioId = contextId || "general";
      return `portfolio/${studentId}/${portfolioId}/${uniqueName}`;
    }
    case "MESSAGE_ATTACHMENT": {
      return `messages/${contextId}/${uniqueName}`;
    }
    case "PROJECT_FILE": {
      return `projects/${contextId}/${uniqueName}`;
    }
    case "WORK_DELIVERABLE": {
      return `deliverables/${contextId}/${uniqueName}`;
    }
  }
}

/**
 * Prepares an upload by validating authorization, generating a safe object key,
 * and returning a signed upload URL to the client.
 */
export async function prepareSignedUpload(
  auth: AuthenticatedUser,
  data: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    category: FileCategory;
    contextId?: string;
  }
) {
  validateFileMetadata(data.fileName, data.fileSize, data.mimeType, data.category);
  await validateCategoryAuthorization(auth, data.category, data.contextId);

  const objectPath = generateSafePath(auth, data.category, data.fileName, data.contextId);
  const signedUpload = await createSignedUploadUrl(objectPath);

  // Pre-create StoredFile record in PostgreSQL
  const storedFile = await prisma.storedFile.create({
    data: {
      bucket: STORAGE_BUCKET,
      path: objectPath,
      originalName: sanitizeFileName(data.fileName),
      mimeType: data.mimeType,
      size: data.fileSize,
      category: data.category,
      ownerId: auth.user.id,
      studentId: auth.studentProfile?.id || null,
      clientId: auth.clientProfile?.id || null,
      projectId: data.category === "PROJECT_FILE" ? data.contextId : null,
      workContractId: data.category === "WORK_DELIVERABLE" ? data.contextId : null,
      conversationId: data.category === "MESSAGE_ATTACHMENT" ? data.contextId : null,
    },
  });

  return {
    fileId: storedFile.id,
    signedUrl: signedUpload.signedUrl,
    token: signedUpload.token,
    path: objectPath,
  };
}

/**
 * Direct file upload from the server to Supabase Storage (e.g. from FormData).
 */
export async function uploadFileBuffer(
  auth: AuthenticatedUser,
  buffer: Buffer,
  metadata: {
    fileName: string;
    mimeType: string;
    category: FileCategory;
    contextId?: string;
  }
) {
  const fileSize = buffer.length;
  validateFileMetadata(metadata.fileName, fileSize, metadata.mimeType, metadata.category);
  await validateCategoryAuthorization(auth, metadata.category, metadata.contextId);

  const objectPath = generateSafePath(auth, metadata.category, metadata.fileName, metadata.contextId);

  // Upload to Supabase Storage
  await uploadFileDirect(objectPath, buffer, metadata.mimeType);

  // Record metadata in PostgreSQL
  const storedFile = await prisma.storedFile.create({
    data: {
      bucket: STORAGE_BUCKET,
      path: objectPath,
      originalName: sanitizeFileName(metadata.fileName),
      mimeType: metadata.mimeType,
      size: fileSize,
      category: metadata.category,
      ownerId: auth.user.id,
      studentId: auth.studentProfile?.id || null,
      clientId: auth.clientProfile?.id || null,
      projectId: metadata.category === "PROJECT_FILE" ? metadata.contextId : null,
      workContractId: metadata.category === "WORK_DELIVERABLE" ? metadata.contextId : null,
      conversationId: metadata.category === "MESSAGE_ATTACHMENT" ? metadata.contextId : null,
    },
  });

  return {
    id: storedFile.id,
    path: storedFile.path,
    originalName: storedFile.originalName,
    mimeType: storedFile.mimeType,
    size: storedFile.size,
    category: storedFile.category,
    createdAt: storedFile.createdAt.toISOString(),
  };
}

/**
 * Checks authorization and generates a short-lived signed download URL.
 */
export async function getAuthorizedDownloadUrl(
  fileId: string,
  auth: AuthenticatedUser,
  expiresInSeconds: number = 300
) {
  const storedFile = await prisma.storedFile.findUnique({
    where: { id: fileId },
  });

  if (!storedFile) {
    throw new StorageError("File not found", 404, "NOT_FOUND");
  }

  // Check access authorization
  const isOwner = storedFile.ownerId === auth.user.id;
  if (!isOwner) {
    switch (storedFile.category as FileCategory) {
      case "PROFILE_AVATAR":
      case "PORTFOLIO_IMAGE": {
        // Avatars and portfolio images on active profiles are readable across marketplace
        break;
      }
      case "MESSAGE_ATTACHMENT": {
        if (!storedFile.conversationId) {
          throw new StorageError("Access denied", 403, "FORBIDDEN");
        }
        const conv = await prisma.conversation.findUnique({
          where: { id: storedFile.conversationId },
        });
        if (!conv) {
          throw new StorageError("Conversation not found", 404, "NOT_FOUND");
        }
        const isParticipant =
          (auth.role === UserRole.STUDENT && conv.studentId === auth.studentProfile?.id) ||
          (auth.role === UserRole.CLIENT && conv.clientId === auth.clientProfile?.id);
        if (!isParticipant) {
          throw new StorageError("You are not authorized to access this message attachment", 403, "FORBIDDEN");
        }
        break;
      }
      case "PROJECT_FILE": {
        if (!storedFile.projectId) {
          throw new StorageError("Access denied", 403, "FORBIDDEN");
        }
        const project = await prisma.project.findUnique({
          where: { id: storedFile.projectId },
          include: { applications: true },
        });
        if (!project) {
          throw new StorageError("Project not found", 404, "NOT_FOUND");
        }
        const isClient = auth.role === UserRole.CLIENT && project.clientId === auth.clientProfile?.id;
        const isApplied =
          auth.role === UserRole.STUDENT &&
          project.applications.some((a) => a.studentId === auth.studentProfile?.id);
        if (!isClient && !isApplied) {
          throw new StorageError("You are not authorized to access this project file", 403, "FORBIDDEN");
        }
        break;
      }
      case "WORK_DELIVERABLE": {
        if (!storedFile.workContractId) {
          throw new StorageError("Access denied", 403, "FORBIDDEN");
        }
        const contract = await prisma.workContract.findUnique({
          where: { id: storedFile.workContractId },
        });
        if (!contract) {
          throw new StorageError("Contract not found", 404, "NOT_FOUND");
        }
        const isParticipant =
          (auth.role === UserRole.STUDENT && contract.studentId === auth.studentProfile?.id) ||
          (auth.role === UserRole.CLIENT && contract.clientId === auth.clientProfile?.id);
        if (!isParticipant) {
          throw new StorageError("You are not authorized to access this deliverable", 403, "FORBIDDEN");
        }
        break;
      }
      default:
        throw new StorageError("Access denied", 403, "FORBIDDEN");
    }
  }

  const downloadUrl = await createSignedDownloadUrl(storedFile.path, expiresInSeconds);

  return {
    fileId: storedFile.id,
    downloadUrl,
    originalName: storedFile.originalName,
    mimeType: storedFile.mimeType,
    size: storedFile.size,
    expiresIn: expiresInSeconds,
  };
}

/**
 * Deletes a stored file from both Supabase Storage and PostgreSQL.
 */
export async function deleteStoredFile(fileId: string, auth: AuthenticatedUser) {
  const storedFile = await prisma.storedFile.findUnique({
    where: { id: fileId },
  });

  if (!storedFile) {
    throw new StorageError("File not found", 404, "NOT_FOUND");
  }

  // Only the owner can delete their file
  if (storedFile.ownerId !== auth.user.id) {
    throw new StorageError("You are not authorized to delete this file", 403, "FORBIDDEN");
  }

  // Remove from Supabase Storage
  try {
    await deleteFileFromStorage(storedFile.path);
  } catch (err) {
    console.warn(`Failed to delete object "${storedFile.path}" from Supabase, removing DB record:`, err);
  }

  // Remove from PostgreSQL
  await prisma.storedFile.delete({
    where: { id: fileId },
  });

  return { deleted: true, fileId };
}
