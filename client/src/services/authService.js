// All authentication-related API calls.
// Backend endpoint map (base: http://localhost:5000/api):
//   POST /users/register      → step 1 of registration
//   POST /users/verify-otp    → step 2 — returns JWT token
//   POST /users/resend-otp    → request a fresh OTP
//   POST /users/login         → standard login — returns JWT token
//   GET  /users/check-email   → real-time email availability check

import api from "./api";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extract a readable error message from an Axios error.
 * The backend always responds with { success, message, ... }.
 */
const extractError = (err) =>
  err.response?.data?.message ||
  err.message ||
  "Something went wrong. Please try again.";

// ── Auth calls ─────────────────────────────────────────────────────────────────

/**
 * Register a new user (step 1).
 * Sends user details; backend sends OTP to the provided email.
 *
 * @param {Object} payload
 * @param {string} payload.firstName
 * @param {string} payload.lastName
 * @param {string} payload.email
 * @param {string} payload.password
 * @param {string} [payload.profession]
 * @param {string} [payload.speciality]
 * @param {string} [payload.department]
 * @param {string} [payload.institution]
 * @param {string} [payload.orcid]
 * @param {string} [payload.country]
 * @param {string} [payload.state]
 * @param {string} [payload.city]
 * @param {string} [payload.postalCode]
 * @param {string} [payload.mobile]
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const registerUser = async (payload) => {
  try {
    const { data } = await api.post("/users/register", payload);
    return { success: true, message: data.message };
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Verify OTP (step 2 of registration).
 * On success, the backend returns a JWT token + user object.
 *
 * @param {Object} payload
 * @param {string} payload.email   — email used during registration
 * @param {string} payload.otp     — 6-digit OTP string
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const verifyOtp = async ({ email, otp }) => {
  try {
    const { data } = await api.post("/users/verify-otp", { email, otp });
    return { token: data.data?.token, user: data.data?.user };
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Resend OTP to the given email.
 *
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const resendOtp = async (email) => {
  try {
    const { data } = await api.post("/users/resend-otp", { email });
    return { success: true, message: data.message };
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Login an existing user.
 * On success, the backend returns a JWT token + user object.
 *
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const loginUser = async ({ email, password }) => {
  try {
    const { data } = await api.post("/users/login", { email, password });
    return { token: data.data?.token, user: data.data?.user };
  } catch (err) {
    throw new Error(extractError(err));
  }
};

/**
 * Check whether an email address is already registered.
 * Used for real-time validation in the registration form.
 *
 * @param {string} email
 * @returns {Promise<{ available: boolean }>}
 *   available: true  → email is free to use
 *   available: false → email already registered
 */
export const checkEmailAvailability = async (email) => {
  try {
    const { data } = await api.get("/users/check-email", {
      params: { email },
    });
    // Backend returns { success: true, data: { available: boolean } }
    return { available: data.data?.available ?? true };
  } catch (err) {
    // If the request itself fails, don't block the user — treat as available.
    console.error("Email check failed:", err.message);
    return { available: true };
  }
};