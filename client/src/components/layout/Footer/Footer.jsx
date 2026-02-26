import React, { useCallback, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Award,
  Users,
  FileText,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const home =
  process.env.NODE_ENV === "production"
    ? "/assets/home.jpeg"
    : "/assets/home.jpeg";

// Constants
const FOOTER_SECTIONS = [
  {
    title: "Journal",
    icon: BookOpen,
    links: [
      { label: "About Us", path: "/about" },
      { label: "Editorial Board", path: "/editorial-board" },
      { label: "Current Issue", path: "/current-issue" },
      { label: "Archive", path: "/archive" },
    ],
  },
  {
    title: "For Authors",
    icon: Users,
    links: [
      { label: "Submit Manuscript", path: "/manuscript-login" },
      { label: "Author Guidelines", path: "/authors-guidelines" },
      { label: "Peer Review Process", path: "/peer-review-process" },
      { label: "Ethics & Policies", path: "/ethics" },
      {
        label: "Article Processing Charges",
        path: "/article-processing-charge",
      },
    ],
  },
  {
    title: "Resources",
    icon: FileText,
    links: [
      { label: "Instructions", path: "/instructions" },
      { label: "Copyright Form", path: "/authors/copyright" },
      { label: "Indexing", path: "/indexing" },
      { label: "FAQs", path: "/faqs" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com",
    color: "hover:bg-blue-600",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "https://twitter.com",
    color: "hover:bg-sky-500",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com",
    color: "hover:bg-blue-700",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://youtube.com",
    color: "hover:bg-red-600",
  },
];

const FooterLinkSection = React.memo(({ section }) => {
  const navigate = useNavigate();
  const handleClick = useCallback(
    (path) => {
      navigate(path);
      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <section.icon className="w-5 h-5 text-blue-400" />
        <h4 className="font-semibold text-base text-white">{section.title}</h4>
      </div>
      <ul className="space-y-2.5">
        {section.links.map((link, idx) => (
          <li key={idx}>
            <button
              onClick={() => handleClick(link.path)}
              className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center gap-1.5 group"
            >
              <span className="w-1 h-1 bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"></span>
              <span>{link.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

FooterLinkSection.displayName = "FooterLinkSection";

const NewsletterSection = React.memo(() => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const validateEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email.trim()) {
        setStatus("error");
        setMessage("Please enter your email address");
        return;
      }

      if (!validateEmail(email)) {
        setStatus("error");
        setMessage("Please enter a valid email address");
        return;
      }

      setStatus("loading");

      setTimeout(() => {
        setStatus("success");
        setMessage("Successfully subscribed to our newsletter!");
        setEmail("");

        setTimeout(() => {
          setStatus(null);
          setMessage("");
        }, 5000);
      }, 1000);
    },
    [email, validateEmail],
  );

  return (
    <div className="bg-linear-to-br from-blue-900/20 to-blue-900/20 p-6 rounded-lg border border-blue-800/30">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-5 h-5 text-blue-400" />
        <h4 className="font-semibold text-white">Newsletter Subscription</h4>
      </div>
      <p className="text-gray-300 text-sm mb-4">
        Stay updated with the latest research articles and medical insights
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Subscribe</span>
              </>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
              status === "success"
                ? "bg-green-900/30 text-green-300 border border-green-700/50"
                : "bg-red-900/30 text-red-300 border border-red-700/50"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}
      </form>
    </div>
  );
});

NewsletterSection.displayName = "NewsletterSection";

const ContactInfo = React.memo(() => {
  const contactItems = useMemo(
    () => [
      {
        icon: Mail,
        text: "editor@jairam.org",
        href: "mailto:editor@jairam.org",
        label: "Email us",
      },
      {
        icon: Phone,
        text: "+91-XXXXXXXXXX",
        href: "tel:+91XXXXXXXXXX",
        label: "Call us",
      },
      {
        icon: MapPin,
        text: "Lucknow, India",
        href: "#",
        label: "Our location",
      },
    ],
    [],
  );

  return (
    <div className="lg:col-span-3">
      <div className="flex items-start gap-5 mb-6">
        <div className="max-w-35 md:max-w-45 lg:max-w-55">
          <img
            src={home}
            alt="Journal cover"
            className="w-full h-auto object-contain rounded-md shadow-lg"
          />
        </div>
        <div className="text-start">
          <h3 className="text-xl font-bold text-white mb-1">
            Journal of Advanced & Integrated Research in Acute Medicine (JAIRAM)
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            The Journal of Advanced & Integrated Research in Acute Medicine
            (JAIRAM) is owned and published by Nexus Biomedical Research
            Foundation Trust, a registered non-profit trust under the Indian
            Trusts Act, 1882 (Reg. No. 202501041059811), Lucknow, Uttar Pradesh,
            India. Editorial decisions are made independently by the Editorial
            Board in accordance with internationally accepted ethical publishing
            standards.JAIRAM is a peer-reviewed, open-access journal.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {contactItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-all duration-200 group p-3 rounded-lg hover:bg-gray-800/50"
            aria-label={item.label}
          >
            <div className="bg-blue-800 p-2 rounded-lg group-hover:bg-blue-900/50 transition-colors">
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm">{item.text}</span>
          </a>
        ))}
      </div>
    </div>
  );
});

ContactInfo.displayName = "ContactInfo";

const SocialLinks = React.memo(() => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 font-medium">Follow Us:</span>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-200 ${social.color} hover:scale-110 active:scale-95 border border-gray-700 hover:border-transparent`}
          aria-label={`Visit our ${social.label} page`}
        >
          <social.icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
});

SocialLinks.displayName = "SocialLinks";

const BottomBar = React.memo(() => {
  const bottomLinks = useMemo(
    () => [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Use", path: "/terms" },
      { label: "Accessibility", path: "/accessibility" },
      { label: "Sitemap", path: "/sitemap" },
    ],
    [],
  );

  const handleClick = useCallback((path) => {
    console.log("Navigate to:", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-blue-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Journal of Advanced & Integrated
              Research in Acute Medicine (JAIRAM).Published by Nexus Biomedical
              Research Foundation Trust,Lucknow,India. Articles are published
              under the Creative Commons Attribution 4.0 International
              License(CC BY 4.0)
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {bottomLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleClick(link.path)}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

BottomBar.displayName = "BottomBar";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer
      className="bg-linear-to-b from-blue-900 to-gray-700 text-white"
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="max-w-10xl mx-auto px-5 sm:px-6 lg:px-10 py-15">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 lg:gap-10 mb-12">
          {/* About & Contact Section - Takes 2 columns */}
          <ContactInfo />

  
          {/* Footer Links Sections - Each takes 1 column */}
          {FOOTER_SECTIONS.map((section, index) => (
            <FooterLinkSection key={index} section={section} />
          ))}
        </div>

        {/* Social Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-800">
          <SocialLinks />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {/* Newsletter Section */}
            <NewsletterSection />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </footer>
  );
};

export default Footer;
