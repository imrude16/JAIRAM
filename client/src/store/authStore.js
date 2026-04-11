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
const POST_AUTH_REDIRECT_KEY = "jairam_post_auth_redirect";
const SELECTED_PORTAL_ROLE_KEY = "jairam_selected_portal_role";

const readToken = () => localStorage.getItem(TOKEN_KEY) || null;
const readPostAuthRedirect = () =>
  localStorage.getItem(POST_AUTH_REDIRECT_KEY) || null;
const readSelectedPortalRole = () =>
  localStorage.getItem(SELECTED_PORTAL_ROLE_KEY) || null;
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
  postAuthRedirect: readPostAuthRedirect(),
  selectedPortalRole: readSelectedPortalRole(),

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
   * Store the route that should open once authentication finishes.
   */
  setPostAuthRedirect: (path) => {
    if (!path) {
      localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
      set({ postAuthRedirect: null });
      return;
    }

    localStorage.setItem(POST_AUTH_REDIRECT_KEY, path);
    set({ postAuthRedirect: path });
  },

  /**
   * Return and clear any pending post-auth redirect.
   */
  consumePostAuthRedirect: () => {
    const path = readPostAuthRedirect();
    localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    set({ postAuthRedirect: null });
    return path;
  },

  /**
   * Persist the role selected from the public submit entry points.
   */
  setSelectedPortalRole: (role) => {
    if (!role) {
      localStorage.removeItem(SELECTED_PORTAL_ROLE_KEY);
      set({ selectedPortalRole: null });
      return;
    }

    localStorage.setItem(SELECTED_PORTAL_ROLE_KEY, role);
    set({ selectedPortalRole: role });
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
