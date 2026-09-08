export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always include session cookies
  });

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError(
      `HTTP error ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  if (!response.ok || !payload.success) {
    const errorMsg =
      payload.error?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMsg, response.status, payload.error?.code);
  }

  return payload.data as T;
}

export const apiClient = {
  get: <T>(url: string, queryParams?: Record<string, string | undefined>) => {
    let fullUrl = url;
    if (queryParams) {
      const search = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          search.append(key, val);
        }
      });
      const queryStr = search.toString();
      if (queryStr) {
        fullUrl += (url.includes("?") ? "&" : "?") + queryStr;
      }
    }
    return apiRequest<T>(fullUrl, { method: "GET" });
  },

  post: <T>(url: string, body?: any) => {
    return apiRequest<T>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch: <T>(url: string, body?: any) => {
    return apiRequest<T>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(url: string) => {
    return apiRequest<T>(url, { method: "DELETE" });
  },

  upload: <T>(url: string, formData: FormData) => {
    return apiRequest<T>(url, {
      method: "POST",
      body: formData,
    });
  },
};
