// Wired to POST /api/users/login
// On success: token + user saved to Zustand store → navigates to "/"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../../services/authService";
import useAuthStore from "../../store/authStore";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast("Password reset coming soon.", { icon: "ℹ️" });
  };

  return (
    /*
      This fixed overlay sits on top of everything (including the AuthPage wrapper
      and the MinimalHeader) so the split-screen fills the full viewport cleanly.
    */
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      zIndex: 40,
    }}>

      {/* ── LEFT – Journal Info Panel ── */}
      <div style={{
        width: "42%",
        background: "linear-gradient(160deg, #1e3a5f 0%, #2d6a4f 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 40px",
        color: "white",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "40px", height: "2px", background: "rgba(255,255,255,0.35)", borderRadius: "2px", marginBottom: "28px" }} />

          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.55rem", fontWeight: 600, textAlign: "center", lineHeight: 1.45, marginBottom: "14px", margin: "0 0 14px" }}>
            Journal of Advanced &amp; Integrated Research in Acute Medicine
          </h1>

          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", textAlign: "center", marginBottom: "36px", lineHeight: 1.6, margin: "0 0 36px" }}>
            Secure manuscript submission &amp; peer-review system
          </p>

          <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", marginBottom: "36px" }}>
            <img src="/assets/home.jpeg" alt="Journal cover" style={{ width: "260px", display: "block" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
            {[
              { label: "Visit journal's website", href: "/" },
              { label: "Current issue",           href: "/" },
              { label: "About the journal",       href: "/about" },
            ].map((link) => (
              <a key={link.label} href={link.href} style={{
                color: "rgba(255,255,255,0.72)", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none", display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", textAlign: "center", margin: "40px 0 0 0" }}> 
          © 2026 JAIRAM Journal Portal
        </p>
      </div>

      {/* ── RIGHT – Login Form ── */}
      <div style={{
        flex: 1,
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "36px", height: "3px", borderRadius: "2px", background: "linear-gradient(90deg,#1e40af,#3b82f6)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "1.65rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Log In
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              Sign in to your JAIRAM account
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "32px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Email */}
              <div>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                 <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "6px", letterSpacing: "0.01em" }}>
                  Email Address
                </label>
               </div>
                <input
                  type="email" placeholder="author@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required disabled={loading}
                  style={{ width: "100%", padding: "10px 14px", fontSize: "0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", color: "#1e293b", boxSizing: "border-box", transition: "border-color 0.15s", background: loading ? "#f8fafc" : "#fff" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}>
                    Password
                  </label>
                  <button type="button" onClick={handleForgotPassword}
                    style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required disabled={loading}
                    style={{ width: "100%", padding: "10px 42px 10px 14px", fontSize: "0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", color: "#1e293b", boxSizing: "border-box", transition: "border-color 0.15s", background: loading ? "#f8fafc" : "#fff" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px", display: "flex", alignItems: "center" }}>
                    {showPassword ? (
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
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: "100%", padding: "11px 20px", borderRadius: "10px", border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg,#1e40af,#2563eb)",
                  color: "#fff", fontSize: "0.9rem", fontWeight: 600,
                  boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s",
                }}>
                {loading ? (
                  <>
                    <svg width="16" height="16" style={{ animation: "lf-spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
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

            {/* Register link */}
            <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                New Author?{" "}
                <button type="button" onClick={() => navigate("/auth/register")}
                  style={{ color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px", fontSize: "inherit" }}>
                  Create an account
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes lf-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginForm;