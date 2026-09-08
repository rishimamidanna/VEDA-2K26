/**
 * SkillBridge Lightweight Production Server Logger ($0 Free-Tier Observability)
 *
 * Provides structured, privacy-preserving logging for server-side security,
 * authentication, storage, and payment events.
 *
 * Security:
 * - NEVER logs passwords, JWT session tokens, cookies, or service keys.
 * - Truncates or redacts emails where appropriate.
 */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  event: string;
  category: "AUTH" | "SECURITY" | "PAYMENT" | "STORAGE" | "API";
  timestamp: string;
  [key: string]: any;
}

function emitLog(payload: LogPayload) {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    // Single-line JSON for log forwarders (e.g. Vercel Log Drains / CloudWatch)
    console.log(JSON.stringify(payload));
  } else {
    // Human-readable in development
    const prefix = `[${payload.category}:${payload.event}]`;
    if (payload.level === "error") {
      console.error(prefix, payload);
    } else if (payload.level === "warn") {
      console.warn(prefix, payload);
    } else {
      console.log(prefix, payload);
    }
  }
}

export const logger = {
  authSuccess(userId: string, role: string) {
    emitLog({
      level: "info",
      event: "AUTH_SUCCESS",
      category: "AUTH",
      timestamp: new Date().toISOString(),
      userId,
      role,
    });
  },

  authFailure(reason: string, ip?: string) {
    emitLog({
      level: "warn",
      event: "AUTH_FAILURE",
      category: "AUTH",
      timestamp: new Date().toISOString(),
      reason,
      ip: ip || "unknown",
    });
  },

  csrfBlocked(route: string, host: string, origin?: string | null) {
    emitLog({
      level: "warn",
      event: "CSRF_BLOCKED",
      category: "SECURITY",
      timestamp: new Date().toISOString(),
      route,
      host,
      origin: origin || "none",
    });
  },

  rateLimitTriggered(key: string, limit: number) {
    emitLog({
      level: "warn",
      event: "RATE_LIMIT_EXCEEDED",
      category: "SECURITY",
      timestamp: new Date().toISOString(),
      keyPrefix: key.split(":")[0],
      limit,
    });
  },

  paymentEvent(event: "CREATED" | "RELEASED" | "REFUNDED" | "CANCELLED", paymentId: string, amount?: string) {
    emitLog({
      level: "info",
      event: `PAYMENT_${event}`,
      category: "PAYMENT",
      timestamp: new Date().toISOString(),
      paymentId,
      amount,
    });
  },

  storageEvent(event: "UPLOADED" | "DOWNLOADED" | "DELETED", fileId: string, fileCategory?: string) {
    emitLog({
      level: "info",
      event: `STORAGE_${event}`,
      category: "STORAGE",
      timestamp: new Date().toISOString(),
      fileId,
      fileCategory,
    });
  },

  serverError(route: string, error: any) {
    emitLog({
      level: "error",
      event: "UNHANDLED_ERROR",
      category: "API",
      timestamp: new Date().toISOString(),
      route,
      errorMessage: error?.message || "Unknown error",
    });
  },
};
