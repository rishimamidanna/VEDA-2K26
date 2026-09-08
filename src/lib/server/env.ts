/**
 * Server-Side Environment Variable Validation & Configuration
 *
 * Requirements:
 * - Strictly server-side (never import in client components).
 * - Never prints secret values in error messages.
 * - Distinguishes between production and development requirements.
 */

export interface ServerEnv {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  APP_URL?: string;
  NODE_ENV: "development" | "production" | "test";
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

let cachedEnv: ServerEnv | null = null;

export function validateServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  const isProduction = nodeEnv === "production";
  const isDevelopment = nodeEnv === "development";
  const isTest = nodeEnv === "test";

  const missing: string[] = [];
  const errors: string[] = [];

  // 1. DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    missing.push("DATABASE_URL");
  } else if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string.");
  }

  // 2. AUTH_SECRET
  let authSecret = process.env.AUTH_SECRET?.trim();
  if (isProduction) {
    if (!authSecret) {
      missing.push("AUTH_SECRET");
    } else if (authSecret.length < 32) {
      errors.push("AUTH_SECRET must be at least 32 characters long for production security.");
    }
  } else {
    // Development fallback if not set
    authSecret = authSecret || "skillbridge_development_super_secure_jwt_session_secret_2026_key";
  }

  // 3. Supabase Storage Variables
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (isProduction) {
    if (!supabaseUrl) {
      missing.push("SUPABASE_URL");
    }
    if (!supabaseServiceRoleKey) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }
  }

  // Security guard: ensure SUPABASE_SERVICE_ROLE_KEY is never leaked as a NEXT_PUBLIC_ variable
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("CRITICAL: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY must not be defined. Service keys must never be exposed to the browser.");
  }

  // 4. APP_URL (Optional, but if present must be valid)
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      new URL(appUrl);
    } catch {
      errors.push("APP_URL must be a valid URL (e.g. https://your-domain.com).");
    }
  }

  // If any missing variables or configuration errors in production, throw descriptive error
  if (missing.length > 0 || errors.length > 0) {
    const messages: string[] = [];
    if (missing.length > 0) {
      messages.push(`Missing required environment variable(s): ${missing.join(", ")}.`);
    }
    if (errors.length > 0) {
      messages.push(errors.join(" "));
    }
    messages.push("See .env.example for configuration details.");

    if (isProduction) {
      throw new ConfigurationError(messages.join(" "));
    } else {
      // In development, log a clean warning if non-fatal
      console.warn(`[Config Warning] ${messages.join(" ")}`);
    }
  }

  cachedEnv = {
    DATABASE_URL: databaseUrl || "",
    AUTH_SECRET: authSecret || "",
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    APP_URL: appUrl,
    NODE_ENV: nodeEnv,
    isProduction,
    isDevelopment,
    isTest,
  };

  return cachedEnv;
}

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    return validateServerEnv();
  }
  return cachedEnv;
}
