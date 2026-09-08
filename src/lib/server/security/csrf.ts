/**
 * Server-side CSRF Defense-in-Depth for State-Changing Requests
 *
 * Validates request Origin and Host headers for state-changing HTTP methods
 * (POST, PUT, PATCH, DELETE) as recommended by OWASP.
 *
 * In production, respects configured APP_URL or Vercel deployment domains,
 * while allowing local development on localhost/127.0.0.1.
 */

function getAllowedHosts(currentHost: string): Set<string> {
  const allowed = new Set<string>();
  if (currentHost) {
    allowed.add(currentHost.toLowerCase());
  }

  // 1. Configured Production Application URL
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      allowed.add(parsed.host.toLowerCase());
    } catch {}
  }

  // 2. Vercel System Deployment URLs
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    try {
      const parsed = vercelUrl.includes("://") ? new URL(vercelUrl).host : vercelUrl;
      allowed.add(parsed.toLowerCase());
    } catch {}
  }

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProdUrl) {
    try {
      const parsed = vercelProdUrl.includes("://") ? new URL(vercelProdUrl).host : vercelProdUrl;
      allowed.add(parsed.toLowerCase());
    } catch {}
  }

  // 3. Development Fallbacks
  if (process.env.NODE_ENV !== "production") {
    allowed.add("localhost:3000");
    allowed.add("127.0.0.1:3000");
    allowed.add("localhost");
    allowed.add("127.0.0.1");
  }

  return allowed;
}

export function checkCsrf(req: Request): { valid: boolean; message?: string } {
  const method = req.method.toUpperCase();

  // Safe HTTP methods do not mutate state
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  // Programmatic API requests presenting a Bearer token bypass browser cookie CSRF checks
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const host = rawHost ? rawHost.split(",")[0].trim() : null;

  if (!host) {
    return { valid: true };
  }

  const allowedHosts = getAllowedHosts(host);

  // 1. If Origin header is present, verify it matches an authorized host
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.host.toLowerCase();

      // Check if origin matches host or configured allowed hosts
      if (originHost !== host.toLowerCase() && !allowedHosts.has(originHost)) {
        return {
          valid: false,
          message: `Cross-origin request blocked: origin '${originUrl.host}' is not trusted for host '${host}'`,
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        message: "Invalid Origin header provided",
      };
    }
  }

  // 2. If Origin header is not present, check Referer header
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererHost = refererUrl.host.toLowerCase();

      if (refererHost !== host.toLowerCase() && !allowedHosts.has(refererHost)) {
        return {
          valid: false,
          message: `Cross-origin request blocked: referer '${refererUrl.host}' is not trusted for host '${host}'`,
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        message: "Invalid Referer header provided",
      };
    }
  }

  // Requests without Origin/Referer (e.g. non-browser API clients or internal calls)
  return { valid: true };
}
