// Wired to:
//   POST /api/users/verify-otp   → completes registration, returns token + user
//   POST /api/users/resend-otp   → sends a fresh OTP to the pending email
//
// Email is read from Zustand's pendingEmail (set during RegisterForm submit).
// If pendingEmail is missing (direct URL access), user is redirected back to register.

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOtp, resendOtp } from "../../services/authService";
import useAuthStore from "../../store/authStore";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const { pendingEmail, login } = useAuthStore();

  // ── Redirect guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingEmail) {
      toast.error("Session expired. Please register again.");
      navigate("/auth/register", { replace: true });
    }
  }, [pendingEmail, navigate]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── Digit input handlers ───────────────────────────────────────────────────
  const handleChange = (index, value) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  // Handle paste — fill all boxes from clipboard
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    // Focus the box after the last pasted digit
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");

    if (otp.length < OTP_LENGTH) {
      toast.error(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await verifyOtp({ email: pendingEmail, otp });
      login(token, user);
      toast.success("Email verified! Welcome aboard 🎉");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid OTP. Please try again.");
      // Clear inputs and refocus first box on error
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);
    try {
      await resendOtp(pendingEmail);
      toast.success("A new OTP has been sent to your email.");
      setDigits(Array(OTP_LENGTH).fill(""));
      setCanResend(false);
      setCountdown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!pendingEmail) return null; // Redirect is happening

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100/50 overflow-hidden">

          {/* Header bar */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-5 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
            <p className="text-blue-100 text-sm mt-1">
              We sent a {OTP_LENGTH}-digit code to
            </p>
            <p className="text-white font-semibold text-sm mt-0.5 break-all">{pendingEmail}</p>
          </div>

          <div className="px-8 py-8">

            <form onSubmit={handleSubmit}>
              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                      transition-all duration-200 outline-none
                      ${digit
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-800"
                      }
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || digits.join("").length < OTP_LENGTH}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg
                  transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying…
                  </span>
                ) : "Verify & Continue"}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend OTP"}
                </button>
              ) : (
                <p className="text-gray-400 text-sm">
                  Resend in{" "}
                  <span className="font-semibold text-gray-600">{countdown}s</span>
                </p>
              )}
            </div>

            {/* Back */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/auth/register")}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to Register
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;