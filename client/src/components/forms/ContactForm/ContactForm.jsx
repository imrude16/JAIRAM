import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Globe,
  MessageSquare,
  CheckCircle,
  Loader,
  User,
  AlertCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

// Card Component
const Card = ({ children, className = "", hover = false }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg p-8 ${
      hover
        ? "hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

// Input Component
const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${
          Icon ? "pl-12" : "pl-4"
        } pr-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
        }`}
      />
    </div>
    {error && (
      <p className="mt-2 text-sm text-red-600 flex items-center animate-shake">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Button Component
const Button = ({ children, icon: Icon, loading, onClick, ...props }) => {
  const variants = {
    primary:
      "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
    outline: "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
        variants[props.variant || "primary"]
      } ${props.className || ""}`}
    >
      {loading ? (
        <Loader className="w-5 h-5 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. Our team will get back to you within
            24-48 hours.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Reference ID:</strong> REF-
              {Math.floor(Math.random() * 100000)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Save this reference for future correspondence
            </p>
          </div>
          <Button onClick={onClose} variant="primary" className="w-full">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};

// Contact Info Item Component
const ContactInfoItem = ({ icon: Icon, title, lines, delay }) => (
  <div
    className="flex items-start group hover:bg-blue-50 p-4 rounded-xl transition-all duration-300 animate-slideUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="p-3 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl mr-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h4>
      {lines.map((line, idx) => (
        <p key={idx} className="text-gray-600 text-sm leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  </div>
);

// Social Media Component
const SocialMediaLinks = () => {
  const socials = [
    { icon: Facebook, color: "hover:bg-blue-600", label: "Facebook" },
    { icon: Twitter, color: "hover:bg-sky-500", label: "Twitter" },
    { icon: Linkedin, color: "hover:bg-blue-700", label: "LinkedIn" },
    { icon: Instagram, color: "hover:bg-pink-600", label: "Instagram" },
  ];

  return (
    <div className="flex space-x-3 justify-center">
      {socials.map((social, idx) => (
        <button
          key={idx}
          className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-all duration-300 transform hover:scale-110 hover:text-white ${social.color} hover:shadow-lg`}
          aria-label={social.label}
        >
          <social.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};

// Main Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Contact form submitted:", formData);

    setLoading(false);
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setShowSuccess(false);
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-block p-4 bg-linear-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Contact Information - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card hover className="animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Phone className="w-6 h-6 mr-2 text-blue-600" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <ContactInfoItem
                  icon={MapPin}
                  title="Address"
                  lines={[
                    "Medical Research Center",
                    "123 Healthcare Avenue",
                    "Medical District, MD 12345",
                    "United States",
                  ]}
                  delay={100}
                />

                <ContactInfoItem
                  icon={Phone}
                  title="Phone"
                  lines={["+1 (555) 123-4567", "+1 (555) 123-4568 (Fax)"]}
                  delay={200}
                />

                <ContactInfoItem
                  icon={Mail}
                  title="Email"
                  lines={[
                    "editor@medjournal.com",
                    "submissions@medjournal.com",
                  ]}
                  delay={300}
                />

                <ContactInfoItem
                  icon={Globe}
                  title="Website"
                  lines={["www.medicaljournal.com"]}
                  delay={400}
                />
              </div>
            </Card>

            {/* Office Hours */}
            <Card
              className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 animate-slideUp"
              style={{ animationDelay: "500ms" }}
            >
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    Office Hours
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Monday - Friday
                      </span>
                      <span className="text-blue-600 font-semibold">
                        9:00 AM - 5:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Saturday - Sunday
                      </span>
                      <span className="text-red-600 font-semibold">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    * Eastern Standard Time (EST)
                  </p>
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card
              className="text-center animate-slideUp"
              style={{ animationDelay: "600ms" }}
            >
              <h4 className="font-bold text-gray-900 mb-4">Follow Us</h4>
              <SocialMediaLinks />
              <p className="text-xs text-gray-500 mt-4">
                Stay updated with our latest publications
              </p>
            </Card>
          </div>

          {/* Contact Form - 3 columns */}
          <div className="lg:col-span-3">
            <Card
              className="animate-slideUp"
              style={{ animationDelay: "200ms" }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-2 text-blue-600" />
                Send Us a Message
              </h2>

              <div className="space-y-5">
                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  icon={User}
                  required
                  error={errors.name}
                />

                <Input
                  type="email"
                  label="Your Email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  icon={Mail}
                  required
                  error={errors.email}
                />

                <Input
                  label="Subject"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  icon={MessageSquare}
                  required
                  error={errors.subject}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <textarea
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none resize-none ${
                        errors.message
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                      }`}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {formData.message.length} characters
                    </div>
                  </div>
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-shake">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Privacy Notice:</strong> Your information is secure
                    with us. We will only use your contact details to respond to
                    your inquiry and will never share them with third parties.
                  </p>
                </div>

                <Button
                  variant="primary"
                  icon={Send}
                  loading={loading}
                  onClick={handleSubmit}
                  className="w-full text-lg py-4"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            hover
            className="text-center animate-slideUp"
            style={{ animationDelay: "700ms" }}
          >
            <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get a response within 24 hours
            </p>
            <button className="text-blue-600 font-semibold hover:underline">
              support@medjournal.com
            </button>
          </Card>

          <Card
            hover
            className="text-center animate-slideUp"
            style={{ animationDelay: "800ms" }}
          >
            <div className="w-16 h-16 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Call us during office hours
            </p>
            <button className="text-green-600 font-semibold hover:underline">
              +1 (555) 123-4567
            </button>
          </Card>

          <Card
            hover
            className="text-center animate-slideUp"
            style={{ animationDelay: "900ms" }}
          >
            <div className="w-16 h-16 bg-linear-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Chat with our team now</p>
            <button className="text-purple-600 font-semibold hover:underline">
              Start Conversation
            </button>
          </Card>
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-12 animate-fadeIn">
          <p className="text-gray-600 mb-3">Looking for quick answers?</p>
          <button className="text-blue-600 font-semibold hover:underline text-lg">
            Visit our FAQ Section →
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactForm;
