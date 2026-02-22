// Global authentication state managed by Zustand.
// Token and user are persisted in localStorage so sessions survive page refresh.
//
// Storage keys:
//   "jairam_token"        → JWT string
//   "jairam_user"         → JSON-serialised user object
//   "jairam_pending_email"→ email stored between register → verify-otp steps

import { create } from "zustand";

// ── Helpers ────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "jairam_token";
const USER_KEY = "jairam_user";
const PENDING_EMAIL_KEY = "jairam_pending_email";

const readToken = () => localStorage.getItem(TOKEN_KEY) || null;
const readUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Store ──────────────────────────────────────────────────────────────────────

const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  token: readToken(),
  user: readUser(),
  isAuthenticated: !!readToken(),

  /**
   * Email temporarily held between the Register and Verify-OTP steps.
   * Not persisted across full page reloads intentionally — if the user
   * closes the tab they should start registration again.
   */
  pendingEmail: localStorage.getItem(PENDING_EMAIL_KEY) || null,

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Call after a successful login OR after OTP verification.
   * Stores the token and user in state + localStorage.
   */
  login: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(PENDING_EMAIL_KEY);
    set({ token, user, isAuthenticated: true, pendingEmail: null });
  },

  /**
   * Clear all auth state and redirect to login.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PENDING_EMAIL_KEY);
    set({ token: null, user: null, isAuthenticated: false, pendingEmail: null });
  },

  /**
   * Store the email temporarily while the user is on the OTP verification page.
   * Called right after a successful /register response.
   */
  setPendingEmail: (email) => {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
    set({ pendingEmail: email });
  },

  /**
   * Update the stored user object (e.g. after a profile edit).
   */
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;