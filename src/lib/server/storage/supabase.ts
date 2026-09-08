import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "skillbridge-files";

function getNormalizedUrl(): string {
  let url = process.env.SUPABASE_URL || "";
  url = url.trim().replace(/^["']|["']$/g, "");
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

function getNormalizedKey(): string {
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return key.trim().replace(/^["']|["']$/g, "");
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseStorageClient(): SupabaseClient {
  if (!supabaseInstance) {
    const url = getNormalizedUrl();
    const key = getNormalizedKey();

    if (!url || !key) {
      throw new Error(
        "Supabase credentials missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
      );
    }

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

/**
 * Creates a signed upload URL for private direct uploads from authorized clients.
 * Returns the signed URL, path, and upload token.
 */
export async function createSignedUploadUrl(path: string) {
  const supabase = getSupabaseStorageClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message || "Unknown error"}`);
  }

  return data;
}

/**
 * Uploads a file buffer directly from the server to Supabase private storage.
 */
export async function uploadFileDirect(
  path: string,
  buffer: Buffer,
  contentType: string
) {
  const supabase = getSupabaseStorageClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error || !data) {
    throw new Error(`Failed to upload file to storage: ${error?.message || "Unknown error"}`);
  }

  return data;
}

/**
 * Generates an authorized, short-lived signed URL for downloading private files.
 * Default expiry: 300 seconds (5 minutes).
 */
export async function createSignedDownloadUrl(path: string, expiresInSeconds: number = 300) {
  const supabase = getSupabaseStorageClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed download URL: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

/**
 * Deletes a file object from Supabase private storage.
 */
export async function deleteFileFromStorage(path: string) {
  const supabase = getSupabaseStorageClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error(`Failed to delete object "${path}" from Supabase storage:`, error);
    throw new Error(`Failed to delete file from storage: ${error.message}`);
  }

  return true;
}
