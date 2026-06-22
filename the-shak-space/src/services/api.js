export const api = {
  get: async (url, config) => {
    const res = await fetch(`${"http://localhost:5000/api/v1"}${url}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
    return { data };
  },

  post: async (url, payload) => {
    const res = await fetch(`${"http://localhost:5000/api/v1"}${url}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
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
    return { data };
  },

  put: async (url, payload) => {
    const res = await fetch(`${"http://localhost:5000/api/v1"}${url}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
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
    return { data };
  },

  delete: async (url) => {
    const res = await fetch(`${"http://localhost:5000/api/v1"}${url}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
    return { data };
  },

  patch: async (url, payload) => {
    const res = await fetch(`${"http://localhost:5000/api/v1"}${url}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
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
    return { data };
  },
};

