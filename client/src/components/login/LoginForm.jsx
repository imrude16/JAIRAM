// Wired to POST /api/users/login, /api/users/forgot-password, /api/users/reset-password
// On success: token + user saved to Zustand store -> navigates to "/dashboard"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  forgotPassword,
  loginUser,
  resetPassword,
} from "../../services/authService";
import useAuthStore from "../../store/authStore";

const inputStyle = (disabled) => ({
  width: "100%",
  padding: "9px 14px",
  fontSize: "0.875rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  outline: "none",
  color: "#1e293b",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  background: disabled ? "#f8fafc" : "#fff",
});

const passwordInputStyle = (disabled) => ({
  ...inputStyle(disabled),
  padding: "9px 42px 9px 14px",
});

const primaryButtonStyle = (disabled) => ({
  width: "100%",
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "#94a3b8" : "linear-gradient(135deg,#1e40af,#2563eb)",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  boxShadow: disabled ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s",
});

const subtleButtonStyle = {
  background: "none",
  border: "none",
  color: "#64748b",
  fontSize: "0.82rem",
  cursor: "pointer",
  padding: 0,
};

const fieldLabelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#374151",
  letterSpacing: "0.01em",
};

const PasswordToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      padding: "2px",
      display: "flex",
      alignItems: "center",
    }}
  >
    {shown ? (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    )}
  </button>
);

const LoginForm = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginUser({ email, password });
      login(token, user);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetEmail(email.trim());
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMode("forgot");
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) { toast.error("Email is required."); return; }
    setForgotLoading(true);
    try {
      const result = await forgotPassword(resetEmail.trim());
      toast.success(result.message || "OTP sent successfully.");
      setMode("reset");
    } catch (err) {
      toast.error(err.message || "Failed to send reset OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !otp.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error("All fields are required."); return;
    }
    if (newPassword !== confirmNewPassword) { toast.error("Passwords do not match."); return; }
    setResetLoading(true);
    try {
      const { token, user, message } = await resetPassword({
        email: resetEmail.trim(), otp: otp.trim(), newPassword, confirmNewPassword,
      });
      login(token, user);
      toast.success(message || "Password reset successful.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const cardTitle =
    mode === "login" ? "Log In" :
    mode === "forgot" ? "Forgot Password" : "Reset Password";

  const cardSubtitle =
    mode === "login" ? "Sign in to your JAIRAM account" :
    mode === "forgot" ? "Enter your email to receive a reset OTP" :
    "Enter the OTP and choose a new password";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", overflow: "hidden" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: "40%",
        minWidth: 300,
        background: "linear-gradient(160deg, #1e3a5f 0%, #2d6a4f 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 32px 24px",
        color: "white",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {/* Top content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minHeight: 0 }}>
          <div style={{ width: "40px", height: "2px", background: "rgba(255,255,255,0.35)", borderRadius: "2px", marginBottom: "20px", flexShrink: 0 }} />

          <h1 style={{
            fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 600,
            textAlign: "center", lineHeight: 1.45, margin: "0 0 8px", flexShrink: 0,
          }}>
            Journal of Advanced &amp; Integrated Research in Acute Medicine
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: "0.8rem",
            textAlign: "center", margin: "0 0 20px", lineHeight: 1.5, flexShrink: 0,
          }}>
            Secure manuscript submission &amp; peer-review system
          </p>

          {/* Image — constrained so it never pushes links off screen */}
          <div style={{
            borderRadius: "10px", overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.15)",
            marginBottom: "20px", flexShrink: 1,
            maxHeight: "calc(100vh - 320px)",
            display: "flex", alignItems: "center",
          }}>
            <img
              src="/assets/home.jpeg"
              alt="Journal cover"
              style={{ width: "220px", maxWidth: "100%", display: "block", objectFit: "cover" }}
            />
          </div>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", flexShrink: 0 }}>
            {[
              { label: "Visit journal's website", href: "/" },
              { label: "Current issue", href: "/" },
              { label: "About the journal", href: "/about" },
            ].map((link) => (
              <a key={link.label} href={link.href} style={{
                color: "rgba(255,255,255,0.72)", fontSize: "0.85rem", fontWeight: 500,
                textDecoration: "none", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", textAlign: "center", margin: "16px 0 0", flexShrink: 0 }}>
          © 2026 JAIRAM Journal Portal
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1,
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <div style={{ width: "36px", height: "3px", borderRadius: "2px", background: "linear-gradient(90deg,#1e40af,#3b82f6)", margin: "0 auto 14px" }} />
            <h2 style={{ fontSize: "1.55rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              {cardTitle}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>{cardSubtitle}</p>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          }}>

            {/* ── Login ── */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={fieldLabelStyle}>Email Address</label>
                  </div>
                  <input
                    type="email" placeholder="author@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required disabled={loading} style={inputStyle(loading)}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={fieldLabelStyle}>Password</label>
                    <button type="button" onClick={handleForgotPassword}
                      style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Forgot Password?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"} placeholder="Enter your password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required disabled={loading} style={passwordInputStyle(loading)}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                    <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={primaryButtonStyle(loading)}>
                  {loading ? (
                    <>
                      <svg width="16" height="16" style={{ animation: "lf-spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Forgot password ── */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={fieldLabelStyle}>Email Address</label>
                  </div>
                  <input
                    type="email" placeholder="author@example.com"
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    required disabled={forgotLoading} style={inputStyle(forgotLoading)}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <button type="submit" disabled={forgotLoading} style={primaryButtonStyle(forgotLoading)}>
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
                <button type="button" onClick={() => setMode("login")} style={subtleButtonStyle}>
                  Back to Login
                </button>
              </form>
            )}

            {/* ── Reset password ── */}
            {mode === "reset" && (
              <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ marginBottom: "5px" }}><label style={fieldLabelStyle}>Email Address</label></div>
                  <input
                    type="email" placeholder="author@example.com"
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    required disabled={resetLoading} style={inputStyle(resetLoading)}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: "5px" }}><label style={fieldLabelStyle}>OTP</label></div>
                  <input
                    type="text" placeholder="Enter OTP"
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    required disabled={resetLoading} style={inputStyle(resetLoading)}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: "5px" }}><label style={fieldLabelStyle}>New Password</label></div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"} placeholder="Enter new password"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      required disabled={resetLoading} style={passwordInputStyle(resetLoading)}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                    <PasswordToggle shown={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: "5px" }}><label style={fieldLabelStyle}>Confirm New Password</label></div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password"
                      value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required disabled={resetLoading} style={passwordInputStyle(resetLoading)}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                    <PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                  </div>
                </div>
                <button type="submit" disabled={resetLoading} style={primaryButtonStyle(resetLoading)}>
                  {resetLoading ? "Resetting Password..." : "Reset Password"}
                </button>
                <button type="button" onClick={() => setMode("forgot")} style={subtleButtonStyle}>
                  Back
                </button>
              </form>
            )}

            {mode === "login" && (
              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                  New Author?{" "}
                  <button type="button" onClick={() => navigate("/auth/register")}
                    style={{ color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px", fontSize: "inherit" }}>
                    Create an account
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes lf-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginForm;