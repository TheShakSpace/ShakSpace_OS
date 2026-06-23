const API_BASE = "http://localhost:5000/api/v1";
const REQUEST_TIMEOUT_MS = 30000;

function buildUrl(url, params) {
  if (!params || typeof params !== "object") return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  if (!qs) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err = new Error(`Request failed: ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }

    return { data, status: res.status };
  } catch (error) {
    if (error?.name === "AbortError") {
      const err = new Error("Request timed out");
      err.response = { status: 408, data: { error: { message: "Request timed out" } } };
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: async (url, config = {}) => {
    const fullUrl = buildUrl(url, config.params);
    return request(fullUrl, { method: "GET" });
  },

  post: async (url, payload) => {
    return request(url, {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    });
  },

  put: async (url, payload) => {
    return request(url, {
      method: "PUT",
      body: JSON.stringify(payload ?? {}),
    });
  },

  delete: async (url) => {
    return request(url, { method: "DELETE" });
  },

  patch: async (url, payload) => {
    return request(url, {
      method: "PATCH",
      body: JSON.stringify(payload ?? {}),
    });
  },
};
