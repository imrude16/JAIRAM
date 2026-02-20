import { useState } from "react";

const RegisterForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profession: "",
    otherProfession: "",
    speciality: "",
    otherSpeciality: "",
    department: "",
    institution: "",
    orcid: "",
    address: "",
    country: "",
    otherCountry: "",
    state: "",
    city: "",
    postalCode: "",
    phoneCode: "",
    otherPhoneCode: "",
    mobile: "",
    agree1: false,
    agree2: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Text-only (letters + spaces)
  const allowOnlyText = (e) => {
    const { name, value } = e.target;
    const clean = value.replace(/[^A-Za-z .'-]/g, "");
    setForm((prev) => ({ ...prev, [name]: clean }));
  };

  const allowOnlyNumbers = (e) => {
    const { name, value } = e.target;
    const clean = value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [name]: clean }));
  };

  const allowPhoneCode = (e) => {
    const { name, value } = e.target;
    const clean = value.replace(/[^0-9+]/g, "");
    setForm((prev) => ({ ...prev, [name]: clean }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agree1) {
      alert("Please accept Terms & Conditions");
      return;
    }

    // India-specific validation (without changing dropdowns)
    if (form.country === "India") {
      if (!/^[6-9]\d{9}$/.test(form.mobile)) {
        alert("Indian mobile number must be 10 digits and start with 6-9");
        return;
      }
      if (!/^[1-9]\d{5}$/.test(form.postalCode)) {
        alert("Indian PIN code must be 6 digits");
        return;
      }
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // fake loading

      alert("Account created successfully. Please verify OTP.");
      window.location.hash = "#/auth/verify-otp";

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        profession: "",
        confirmPassword: "",
        otherProfession: "",
        speciality: "",
        otherSpeciality: "",
        department: "",
        institution: "",
        orcid: "",
        address: "",
        country: "",
        otherCountry: "",
        state: "",
        city: "",
        postalCode: "",
        phoneCode: "",
        otherPhoneCode: "",
        mobile: "",
        agree1: false,
        agree2: false,
      });
    } catch (err) {
      alert("Something went wrong on frontend. Please check your form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-green-50/20 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block mb-4">
            <div className="bg-linear-to-r from-green-800 to-green-800 w-16 h-1 mx-auto rounded-full"></div>
          </div>
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
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-z .'\-]+$"
                    title="Only letters, spaces, apostrophes, and hyphens allowed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-z .'\-]+$"
                    title="Only letters, spaces, apostrophes, and hyphens allowed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$"
                    title="Minimum 8 Letters, at least 1 Special Character and 1 number"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 focus:outline-none transition-colors duration-200 p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$"
                    title="Minimum 8 characters, at least 1 letter and 1 number"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 focus:outline-none transition-colors duration-200 p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Profession <span className="text-red-500">*</span>
                </label>
                <select
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                  required
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
                {form.profession === "Other" && (
                  <input
                    name="otherProfession"
                    placeholder="Please specify your profession"
                    value={form.otherProfession}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-zÀ-ÿ0-9 .,'\-]{2,50}$"
                    title="2–50 characters. Letters, numbers, spaces allowed."
                    className="mt-3 w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 animate-in fade-in slide-in-from-top-2"
                    required
                  />
                )}
              </div>

              {/* Primary Speciality */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Primary Speciality <span className="text-red-500">*</span>
                </label>
                <select
                  name="speciality"
                  value={form.speciality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                  required
                >
                  <option value="">Choose your primary speciality</option>
                  <option>Addiction Medicine</option>
                  <option>Allergy & Immunology</option>
                  <option>Alternative/Chinese Medicine</option>
                  <option>Anesthesiology/Pain Medicine</option>
                  <option>Behavioral Health/Psychology</option>
                  <option>Biomedicine</option>
                  <option>Cardiology</option>
                  <option>Critical Care</option>
                  <option>Dermatology</option>
                  <option>Education</option>
                  <option>Emergency Medicine</option>
                  <option>Endocrinology</option>
                  <option>Epidemiology</option>
                  <option>Forensic Science</option>
                  <option>Gastroenterology</option>
                  <option>General Medicine</option>
                  <option>Genetics</option>
                  <option>Geriatric</option>
                  <option>Health Technology</option>
                  <option>Healthcare Management</option>
                  <option>Healthcare Quality</option>
                  <option>Hematology</option>
                  <option>Hospital Administration</option>
                  <option>Infectious Disease</option>
                  <option>Leadership</option>
                  <option>Nephrology</option>
                  <option>Neurology</option>
                  <option>Neurosurgery</option>
                  <option>Nursing (General)</option>
                  <option>Nursing (Speciality)</option>
                  <option>Nursing Management</option>
                  <option>Nursing Management and Administration</option>
                  <option>Nursing—Advanced Practice</option>
                  <option>Nutrition</option>
                  <option>Obstetrics & Gynecology</option>
                  <option>Oncology</option>
                  <option>Ophthalmology/Optometry</option>
                  <option>Orthopaedics</option>
                  <option>Otolaryngology</option>
                  <option>Pathology</option>
                  <option>Pediatrics</option>
                  <option>Pharmacology</option>
                  <option>Physical Medicine & Rehabilitation</option>
                  <option>Physical Therapy</option>
                  <option>Plastic Surgery</option>
                  <option>Psychiatry w/Addiction</option>
                  <option>Public Health</option>
                  <option>Pulmonary</option>
                  <option>Radiology</option>
                  <option>Rheumatology</option>
                  <option>Speech Language & Hearing</option>
                  <option>Sports Medicine</option>
                  <option>Surgery (General)</option>
                  <option>Surgery (Speciality)</option>
                  <option>Transplantation</option>
                  <option>Trauma</option>
                  <option>Urology</option>
                  <option>Other</option>
                </select>
                {form.speciality === "Other" && (
                  <input
                    name="otherSpeciality"
                    placeholder="Please specify your speciality"
                    value={form.otherSpeciality}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-zÀ-ÿ0-9 .,'\-]{2,50}$"
                    title="2–50 characters allowed"
                    className="mt-3 w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 animate-in fade-in slide-in-from-top-2"
                    required
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
                    name="department"
                    placeholder="Enter Department"
                    value={form.department}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-zÀ-ÿ0-9 .,'\-]{2,50}$"
                    title="2–50 characters allowed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="institution"
                    placeholder="Enter Institution"
                    value={form.institution}
                    onChange={allowOnlyText}
                    pattern="^[A-Za-zÀ-ÿ0-9 .,'\-]{2,50}$"
                    title="2–50 characters allowed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* ORCID */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      ORCID <span className="text-red-500">*</span>
                    </label>
                <input
                  name="orcid"
                  placeholder="0000-0000-0000-0000"
                  value={form.orcid}
                  onChange={handleChange}
                  pattern="\d{4}-\d{4}-\d{4}-\d{4}"
                  title="Format: 0000-0000-0000-0000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Primary Address Section */}
              <div className="bg-linear-to-br from-green-50 to-green-100/50 rounded-xl p-5 sm:p-6 mt-6 border-2 border-green-200/50">
                <div className="flex items-center mb-5">
                  <div className="bg-blue-600 w-1 h-6 rounded-full mr-3"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Primary Address
                  </h3>
                </div>

                {/* Address */}
                <div className="mb-4 sm:mb-5">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    placeholder="Enter Address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Country/Region + State + City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Country or Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select</option>
                      <option>United States</option>
                      <option>India</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                    {form.country === "Other" && (
                      <input
                        name="otherCountry"
                        type="text"
                        placeholder="Enter Country"
                        value={form.otherCountry}
                        onChange={allowOnlyText}
                        pattern="^[A-Za-z .'\-]+$"
                        title="Only letters allowed"
                        className="mt-2 w-full px-4 py-3 border-2 border-blue-300 rounded-lg"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      name="state"
                      type="text"
                      placeholder="Enter State"
                      value={form.state}
                      onChange={allowOnlyText}
                      pattern="^[A-Za-z .'\-]+$"
                      title="Only letters allowed"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="city"
                      type="text"
                      placeholder="Enter City"
                      value={form.city}
                      onChange={allowOnlyText}
                      pattern="^[A-Za-z .'\-]+$"
                      title="Only letters allowed"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Postal Code + Phone + Code + Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="postalCode"
                      type="text"
                      placeholder="Postal / ZIP Code"
                      value={form.postalCode}
                      onChange={allowOnlyNumbers}
                      pattern="^[1-9][0-9]{5}$"
                      title="Indian PIN code must be 6 digits"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Phonecode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="phoneCode"
                      value={form.phoneCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select</option>
                      <option>+1</option>
                      <option>+44</option>
                      <option>+91</option>
                      <option>+61</option>
                      <option>Other</option>
                    </select>
                    {form.phoneCode === "Other" && (
                      <input
                        name="otherPhoneCode"
                        placeholder="e.g. +880"
                        value={form.otherPhoneCode}
                        onChange={allowPhoneCode}
                        className="mt-2 w-full px-4 py-3 border-2 border-blue-300 rounded-lg"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="e.g. 9876543210"
                      value={form.mobile}
                      onChange={allowOnlyNumbers}
                      inputMode="numeric"
                      pattern="^[6-9][0-9]{9}$"
                      title="Indian mobile number must be 10 digits and start with 6-9"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-start bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <input
                    type="checkbox"
                    name="agree1"
                    checked={form.agree1}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                    required
                  />
                  <label className="ml-3 text-sm sm:text-base text-gray-700 cursor-pointer">
                    By selecting, I Agree to the Terms and Conditions.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg disabled:opacity-60"
              >
                {loading ? "Registering..." : "Register"}
              </button>

              {/* Login Link */}
              <div className="text-center mt-6 sm:mt-8 pt-6 border-t-2 border-gray-200">
                <p className="text-sm sm:text-base text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="#/auth/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
                  >
                    Log in
                  </a>
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
