// Wired to POST /api/users/register
// On success: pendingEmail saved to Zustand store → navigates to /auth/verify-otp
// Real-time email check: GET /api/users/check-email
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser, checkEmailAvailability } from "../../services/authService";
import useAuthStore from "../../store/authStore";

// ── Tiny debounce hook ─────────────────────────────────────────────────────────
const useDebounce = (value, delay = 600) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const allowOnlyText = (setter) => (e) =>
  setter(e.target.value.replace(/[^A-Za-z .'-]/g, ""));

const allowOnlyNumbers = (setter) => (e) =>
  setter(e.target.value.replace(/\D/g, ""));

// ── Component ──────────────────────────────────────────────────────────────────
const RegisterForm = () => {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuthStore();

  // Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null); // null | true | false
  const [emailChecking, setEmailChecking] = useState(false);

  // Credentials
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Professional
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [otherSpeciality, setOtherSpeciality] = useState("");
  const [department, setDepartment] = useState("");
  const [institution, setInstitution] = useState("");
  const [orcid, setOrcid] = useState("");

  // Address
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [otherCountry, setOtherCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [otherPhoneCode, setOtherPhoneCode] = useState("");
  const [mobile, setMobile] = useState("");

  // Agreement
  const [agree1, setAgree1] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Real-time email availability check ──────────────────────────────────────
  const debouncedEmail = useDebounce(email, 700);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!debouncedEmail || !emailRegex.test(debouncedEmail)) {
      setEmailAvailable(null);
      return;
    }
    let cancelled = false;
    setEmailChecking(true);
    checkEmailAvailability(debouncedEmail).then(({ available }) => {
      if (!cancelled) setEmailAvailable(available);
    }).finally(() => {
      if (!cancelled) setEmailChecking(false);
    });
    return () => { cancelled = true; };
  }, [debouncedEmail]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required."); return false;
    }
    if (!email.trim()) {
      toast.error("Email is required."); return false;
    }
    if (emailAvailable === false) {
      toast.error("This email is already registered. Please log in."); return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters."); return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      toast.error("Password must contain at least one letter and one number."); return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match."); return false;
    }
    if (!agree1) {
      toast.error("Please accept the Terms & Conditions."); return false;
    }
    if (country === "India") {
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        toast.error("Indian mobile number must be 10 digits starting with 6–9."); return false;
      }
      if (!/^[1-9]\d{5}$/.test(postalCode)) {
        toast.error("Indian PIN code must be 6 digits."); return false;
      }
    }
    return true;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,

      // Profession
      profession,
      otherProfession:
        profession === "Other" ? otherProfession.trim() : "",

      // Primary Specialty
      primarySpecialty: speciality,
      otherPrimarySpecialty:
        speciality === "Other" ? otherSpeciality.trim() : "",

      department: department.trim(),
      institution: institution.trim(),
      orcid: orcid.trim(),

      // Contact
      phoneCode: phoneCode === "Other" ? otherPhoneCode : phoneCode,
      mobileNumber: mobile.trim(),

      // Address (FIXED STRUCTURE)
      address: {
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country === "Other" ? otherCountry : country,
        postalCode: postalCode.trim(),
      },

      // Terms (FIXED NAMING)
      termsAccepted: agree1,
    };

    setLoading(true);
    try {
      await registerUser(payload);
      setPendingEmail(email.trim().toLowerCase());
      toast.success("Account created! Please verify your email.");
      navigate("/auth/verify-otp");
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email status indicator ──────────────────────────────────────────────────
  const EmailStatus = () => {
    if (emailChecking) return <p className="mt-1 text-xs text-gray-400">Checking availability…</p>;
    if (emailAvailable === true) return <p className="mt-1 text-xs text-green-600">✓ Email is available</p>;
    if (emailAvailable === false) return <p className="mt-1 text-xs text-red-600">✗ Email already registered</p>;
    return null;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-white via-green-50/20 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="bg-linear-to-r from-green-800 to-green-800 w-16 h-1 mx-auto rounded-full mb-4" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
            Create Your Account
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Join our community of medical professionals
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-green-100/50 overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Registration Information
            </h3>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">

              {/* First + Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={allowOnlyText(setFirstName)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={allowOnlyText(setLastName)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailAvailable(null);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${emailAvailable === false
                      ? "border-red-400 focus:ring-red-400"
                      : emailAvailable === true
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                    }`}
                  required
                  disabled={loading}
                />
                <EmailStatus />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters, 1 letter + 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                    }`}
                  required
                  disabled={loading}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Profession <span className="text-red-500">*</span>
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                  required
                  disabled={loading}
                >
                  <option value="">Choose your profession</option>
                  <option>Physician (MD)</option>
                  <option>Physician (DO)</option>
                  <option>Physician Resident / Fellow</option>
                  <option>Student, Medical School</option>
                  <option>Administrator</option>
                  <option>PA</option>
                  <option>Nurse Practitioner</option>
                  <option>Nursing Advance Practice</option>
                  <option>Nursing, RN</option>
                  <option>Nursing, LPN</option>
                  <option>Allied Health Professional</option>
                  <option>Other</option>
                </select>
                {profession === "Other" && (
                  <input
                    placeholder="Please specify your profession"
                    value={otherProfession}
                    onChange={allowOnlyText(setOtherProfession)}
                    className="mt-3 w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                )}
              </div>

              {/* Primary Speciality */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Primary Speciality <span className="text-red-500">*</span>
                </label>
                <select
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                  required
                  disabled={loading}
                >
                  <option value="">Choose your primary speciality</option>
                  <option>Addiction Medicine</option><option>Allergy & Immunology</option>
                  <option>Anesthesiology/Pain Medicine</option><option>Behavioral Health/Psychology</option>
                  <option>Cardiology</option><option>Critical Care</option>
                  <option>Dermatology</option><option>Emergency Medicine</option>
                  <option>Endocrinology</option><option>Epidemiology</option>
                  <option>Gastroenterology</option><option>General Medicine</option>
                  <option>Genetics</option><option>Geriatric</option>
                  <option>Hematology</option><option>Infectious Disease</option>
                  <option>Nephrology</option><option>Neurology</option>
                  <option>Neurosurgery</option><option>Nursing (General)</option>
                  <option>Nutrition</option><option>Obstetrics & Gynecology</option>
                  <option>Oncology</option><option>Ophthalmology/Optometry</option>
                  <option>Orthopaedics</option><option>Pathology</option>
                  <option>Pediatrics</option><option>Pharmacology</option>
                  <option>Physical Medicine & Rehabilitation</option>
                  <option>Psychiatry w/Addiction</option><option>Public Health</option>
                  <option>Pulmonary</option><option>Radiology</option>
                  <option>Rheumatology</option><option>Surgery (General)</option>
                  <option>Trauma</option><option>Urology</option>
                  <option>Other</option>
                </select>
                {speciality === "Other" && (
                  <input
                    placeholder="Please specify your speciality"
                    value={otherSpeciality}
                    onChange={allowOnlyText(setOtherSpeciality)}
                    className="mt-3 w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                )}
              </div>

              {/* Department + Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Enter Department"
                    value={department}
                    onChange={allowOnlyText(setDepartment)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Enter Institution"
                    value={institution}
                    onChange={allowOnlyText(setInstitution)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ORCID */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  ORCID <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="0000-0000-0000-0000"
                  value={orcid}
                  onChange={(e) => setOrcid(e.target.value)}
                  pattern="\d{4}-\d{4}-\d{4}-\d{4}"
                  title="Format: 0000-0000-0000-0000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                  required
                  disabled={loading}
                />
              </div>

              {/* Primary Address Section */}
              <div className="bg-linear-to-br from-green-50 to-green-100/50 rounded-xl p-5 sm:p-6 mt-6 border-2 border-green-200/50">
                <div className="flex items-center mb-5">
                  <div className="bg-blue-600 w-1 h-6 rounded-full mr-3" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Primary Address</h3>
                </div>

                {/* Address */}
                <div className="mb-4 sm:mb-5">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none text-sm sm:text-base"
                    disabled={loading}
                  />
                </div>

                {/* Country / State / City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Country or Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                      required
                      disabled={loading}
                    >
                      <option value="">Select</option>
                      <option>United States</option>
                      <option>India</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                    {country === "Other" && (
                      <input
                        placeholder="Enter Country"
                        value={otherCountry}
                        onChange={allowOnlyText(setOtherCountry)}
                        className="mt-2 w-full px-4 py-3 border-2 border-blue-300 rounded-lg"
                        required
                        disabled={loading}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">State</label>
                    <input
                      placeholder="Enter State"
                      value={state}
                      onChange={allowOnlyText(setState)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Enter City"
                      value={city}
                      onChange={allowOnlyText(setCity)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Postal / Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Postal / ZIP Code"
                      value={postalCode}
                      onChange={allowOnlyNumbers(setPostalCode)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Phone Code <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                      required
                      disabled={loading}
                    >
                      <option value="">Select</option>
                      <option>+1</option><option>+44</option>
                      <option>+91</option><option>+61</option>
                      <option>Other</option>
                    </select>
                    {phoneCode === "Other" && (
                      <input
                        placeholder="e.g. +880"
                        value={otherPhoneCode}
                        onChange={(e) => setOtherPhoneCode(e.target.value.replace(/[^0-9+]/g, ""))}
                        className="mt-2 w-full px-4 py-3 border-2 border-blue-300 rounded-lg"
                        required
                        disabled={loading}
                      />
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={mobile}
                      onChange={allowOnlyNumbers(setMobile)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-start bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <input
                    type="checkbox"
                    checked={agree1}
                    onChange={(e) => setAgree1(e.target.checked)}
                    className="mt-1 h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    required
                    disabled={loading}
                  />
                  <label className="ml-3 text-sm sm:text-base text-gray-700 cursor-pointer">
                    By selecting, I agree to the Terms and Conditions.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || emailAvailable === false}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registering…
                  </span>
                ) : "Register"}
              </button>

              {/* Login Link */}
              <div className="text-center mt-6 sm:mt-8 pt-6 border-t-2 border-gray-200">
                <p className="text-sm sm:text-base text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
                  >
                    Log in
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;