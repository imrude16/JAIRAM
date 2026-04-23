// Central Axios instance — all API calls go through here.
// Automatically attaches the JWT token from localStorage on every request.
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Increased from 15s to 30s for long-running operations like submission
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Attach Bearer token to every outgoing request if one exists in storage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jairam_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────────────
// Globally handle 401 Unauthorized — clear local storage and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jairam_token");
      localStorage.removeItem("jairam_user");
      // Navigate to login without breaking the Browser
      window.location.replace("/auth/login");
    }
    return Promise.reject(error);
  },
);

export default api;
