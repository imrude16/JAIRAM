import axios from "axios";

/**
 * External API Client
 *
 * Purpose:
 * Used ONLY for third-party services like:
 * - Cloudinary
 * - Stripe
 * - OpenAI
 * - Firebase REST
 * - Any external REST service
 *
 * This client intentionally has:
 * - NO baseURL
 * - NO auth interceptors
 * - NO forced headers
 */

const externalApi = axios.create({
  timeout: 20000, // 20s timeout for slow external APIs
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

/* ─────────────────────────────────────────────────────────────
   Request Interceptor
   - Ensures FormData requests work properly
   - Allows optional custom headers per request
───────────────────────────────────────────────────────────── */

externalApi.interceptors.request.use(
  (config) => {
    // If FormData, let axios set Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ─────────────────────────────────────────────────────────────
   Response Interceptor
   - Normalizes errors
   - Prevents axios raw error leaks
───────────────────────────────────────────────────────────── */

externalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "External API request failed",

      status: error.response?.status || null,
      data: error.response?.data || null,
    };

    return Promise.reject(normalizedError);
  },
);

/* ─────────────────────────────────────────────────────────────
   Utility: Retry Wrapper
   Useful for flaky external APIs
───────────────────────────────────────────────────────────── */

export const externalRequest = async (
  requestFn,
  retries = 2,
) => {
  try {
    return await requestFn();
  } catch (err) {
    if (retries <= 0) throw err;
    return externalRequest(requestFn, retries - 1);
  }
};

export default externalApi;