import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ManuscriptLoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roleType: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ added: reset form function
  const resetForm = () => {
    setFormData({
      roleType: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      console.log("Manuscript login:", formData);
      alert("Login successful");

      resetForm(); // ✅ clear form after success
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset link will be sent to your email");
  };

  const handleRegister = () => {
    resetForm(); // ✅ clear form before navigating
    navigate("/auth/register");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT – JOURNAL INFO PANEL */}
      <div className="hidden lg:flex w-1/2 bg-slate-600 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-serif font-semibold mb-3 text-center">
            Journal of Advanced & Integrated Research in Acute Medicine
          </h1>
          <p className="text-white text-center mb-12">
            Secure manuscript submission & peer-review system
          </p>

          <div className="flex justify-center">
            <img
              src="/assets/home.jpeg"
              alt="Journal cover"
              className="w-64 rounded-lg shadow-2xl"
            />
          </div>

          <div className="mt-8 flex flex-col items-center space-y-3">
            <a href="#" className="text-white hover:text-black text-lg font-medium hover:underline transition">
              * Visit journal's website
            </a>
            <a href="#" className="text-white hover:text-black text-lg font-medium hover:underline transition">
              * Current issue
            </a>
            <a href="/#/about" className="text-white hover:text-black text-lg font-medium hover:underline transition">
              * About the journal
            </a>
          </div>
        </div>

        <div className="text-sm text--white text-center">
          © 2026 JAIRAM Journal Portal
        </div>
      </div>

      {/* RIGHT – LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-slate-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-slate-300">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1 text-center">
            Manuscript Submission Portal
          </h2>
          <p className="text-slate-500 text-sm mb-8 text-center">
            Enter your credentials to continue
          </p>

          <div className="space-y-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role Type <span className="text-red-500">*</span>
              </label>
              <select
                name="roleType"
                value={formData.roleType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                required
              >
                <option value="">Select role</option>
                <option value="author">Author</option>
                <option value="reviewer">Editor</option>
                <option value="editor">Reviewer</option>
                <option value="chief-editor">Technical Reviewer</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="your.email@institution.edu"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2.5 pr-16 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex justify-between items-center text-sm pt-1">
              <label className="flex gap-2 items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                />
                <span className="text-slate-700">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2.5 rounded text-white font-medium transition mt-6 ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* Register */}
            <button
              type="button"
              onClick={handleRegister}
              className="w-full py-2.5 border border-blue-600 text-blue-600 rounded hover:bg-teal-50 transition font-medium"
            >
              Register as Author
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptLoginPage;
