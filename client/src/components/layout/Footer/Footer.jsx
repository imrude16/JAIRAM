import React, { useCallback, useMemo, useState } from "react";
import {
  Send,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Award,
  Users,
  FileText,
  X,
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
      { label: "Copyright Form", path: "/authors/copyright" },
      { label: "Indexing", path: "/indexing" },
      { label: "FAQs", path: "/faqs" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
];

const FooterLinkSection = React.memo(
  ({ section, onCopyrightClick, onComingSoon }) => {
    const navigate = useNavigate();
    const handleClick = useCallback(
      (path, label) => {
        // Check if it's the Copyright Form link
        if (label === "Copyright Form") {
          onCopyrightClick();
          return;
        }

        // Check if it's the Indexing link - show coming soon
        if (label === "Indexing" || label === "Archive") {
          onComingSoon(label);
          return;
        }

        navigate(path);
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      [navigate, onCopyrightClick, onComingSoon],
    );

    return (
      <div>
        <div className="flex items-center gap-2 mb-5">
          <section.icon className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-base text-white">
            {section.title}
          </h4>
        </div>
        <ul className="space-y-3">
          {section.links.map((link, idx) => (
            <li key={idx}>
              <button
                onClick={() => handleClick(link.path, link.label)}
                className="text-gray-300 hover:text-blue-300 transition-colors text-sm flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-blue-300 transition-colors"></span>
                <span>{link.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);

FooterLinkSection.displayName = "FooterLinkSection";

// Coming Soon Modal Component
const ComingSoonModal = React.memo(({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-6 flex items-start justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold">Coming Soon</h2>
            <p className="text-blue-100 text-sm mt-1">JAIRAM</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center text-white transition-colors ml-4 mt-1 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-8 text-center">
          <div className="mb-6 flex justify-center">
            <AlertCircle className="w-16 h-16 text-blue-600 opacity-80" />
          </div>
          <p className="text-gray-800 font-semibold text-lg mb-2">{title}</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            This feature is currently under development. We're working hard to
            bring this to you soon. Thank you for your patience!
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

ComingSoonModal.displayName = "ComingSoonModal";

const NewsletterSection = React.memo(({ onComingSoon }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const validateEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return; // optional safety
    onComingSoon("Newsletter Subscription");
    setEmail(""); // ✅ THIS clears input
  };

  return (
    <div className="bg-gradient-to-br from-blue-800/40 to-blue-900/40 p-6 rounded-xl border border-blue-700/50 backdrop-blur-sm w-full">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-5 h-5 text-blue-300" />
        <h4 className="font-bold text-base text-white">Newsletter</h4>
      </div>
      <p className="text-gray-200 text-xs mb-4 leading-relaxed">
        Stay updated with the latest research articles and medical insights
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs transition-all"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
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
            className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
              status === "success"
                ? "bg-green-900/40 text-green-200 border border-green-600/50"
                : "bg-red-900/40 text-red-200 border border-red-600/50"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0" />
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
  return (
    <div className="flex flex-row items-start gap-4 text-left">
      <div className="shrink-0 w-24">
        <img
          src={home}
          alt="Journal cover"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-white mb-1 leading-snug">
          Journal of Advanced & Integrated Research in Acute Medicine (JAIRAM)
        </h3>
        <p className="text-gray-300 text-xs leading-relaxed">
          The Journal of Advanced & Integrated Research in Acute Medicine
          (JAIRAM) is owned and published by Nexus Biomedical Research
          Foundation Trust, a registered non-profit trust under the Indian
          Trusts Act, 1882 (Reg. No. 202501041059811), Lucknow, Uttar Pradesh,
          India. Editorial decisions are made independently by the Editorial
          Board in accordance with internationally accepted ethical publishing
          standards. JAIRAM is a peer-reviewed, open-access journal.
        </p>
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

// Privacy Policy Modal Component
const PrivacyPolicyModal = React.memo(({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-green-700 rounded-t-lg px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              Privacy & Cookie Notice
            </h2>
            <p className="text-green-100 text-sm mt-0.5">
              JAIRAM — Data Protection Policy
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-gray-700 text-sm leading-relaxed space-y-4 text-left">
          <div>
            <p className="font-semibold text-gray-900 mb-1 text-center">
              Journal of Advanced &amp; Integrated Research in Acute Medicine
              (JAIRAM)
            </p>
            <p>
              The Journal of Advanced &amp; Integrated Research in Acute
              Medicine (JAIRAM) is committed to protecting the privacy and
              personal data of authors, reviewers, editors, and website users in
              accordance with ICMJE Recommendations, COPE Core Practices, and
              GDPR (EU Regulation 2016/679).
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Information We Collect:
            </p>
            <p className="mb-1">
              During registration and manuscript submission, we may collect:
            </p>
            <ul className="space-y-0.5">
              <li>• Name, affiliation, designation</li>
              <li>• Email and contact details</li>
              <li>• ORCID iD (if provided)</li>
              <li>• Manuscript and peer review information</li>
              <li>• Login credentials and IP address</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              How We Use the Information:
            </p>
            <p className="mb-1">Personal data is used solely for:</p>
            <ul className="space-y-0.5">
              <li>• Manuscript processing and peer review</li>
              <li>• Editorial decision-making and publication</li>
              <li>• DOI registration and indexing</li>
              <li>• Journal communication and ethical oversight</li>
            </ul>
            <p className="mt-1">
              We do not sell or commercially distribute personal data.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Legal Basis (GDPR):
            </p>
            <p>
              Data processing is based on user consent, contractual necessity
              (publication process), legitimate academic interests, and legal
              obligations.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Data Sharing:
            </p>
            <p className="mb-1">Limited data may be shared with:</p>
            <ul className="space-y-0.5">
              <li>• Editors and peer reviewers</li>
              <li>• Publishing/hosting service providers</li>
              <li>• DOI registration agencies and indexing databases</li>
              <li>• Legal authorities where required</li>
            </ul>
            <p className="mt-1">
              All submissions are treated confidentially in accordance with
              ICMJE and COPE standards.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Data Retention:
            </p>
            <p>
              Published article metadata forms part of the permanent scholarly
              record. Editorial records may be retained to ensure publication
              integrity.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Your Rights:
            </p>
            <p>
              You may request access, correction, restriction, or deletion of
              your personal data, subject to publication record requirements.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Cookies:
            </p>
            <p>
              JAIRAM uses essential cookies for secure login and website
              functionality, and limited analytics cookies to improve user
              experience. Users may manage cookie preferences through browser
              settings.
            </p>
          </div>

          <div>
            <p className="font-semibold underline text-gray-900 mb-1">
              Contact:
            </p>
            <p>For privacy-related inquiries:</p>
            <p>Editorial Office – JAIRAM</p>
            <p>Email:</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md font-medium transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

PrivacyPolicyModal.displayName = "PrivacyPolicyModal";

// Accessibility Modal Component
const AccessibilityModal = React.memo(({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-blue-700 rounded-t-lg px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Accessibility</h2>
            <p className="text-blue-100 text-sm mt-0.5">
              JAIRAM — Website Accessibility Statement
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-gray-700 text-sm leading-relaxed space-y-4 text-left">
          <div>
            <p className="text-gray-800 leading-relaxed">
              We are committed to ensuring that our journal website is
              accessible to all users, including individuals with disabilities.
              We strive to follow recognized accessibility standards and
              continuously improve the usability of our platform.
            </p>
          </div>

          <div>
            <p className="text-gray-800 leading-relaxed">
              If you experience any difficulty accessing content or navigating
              the website, please contact us so we can assist you and improve
              your experience.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-medium transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

AccessibilityModal.displayName = "AccessibilityModal";

// Copyright Form Modal Component
const CopyrightFormModal = React.memo(({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-blue-700 rounded-t-lg px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              Copyright Transfer & Author Certification Form
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              JAIRAM — Journal of Advanced & Integrated Research in Acute
              Medicine
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-gray-700 text-sm leading-relaxed space-y-4 text-left">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
            <p className="font-semibold text-gray-900 text-center text-base">
              Author Certification and Copyright Transfer Agreement
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Author Certification:</p>
            <p>
              I/we certify that I/we have participated sufficiently in the
              intellectual content, conception and design of this work or the
              analysis and interpretation of the data (when applicable), as well
              as the writing of the manuscript, to take public responsibility
              for it and have agreed to have my/our name listed as a
              contributor. I/we believe the manuscript represents valid work.
              Each author confirms they meet the criteria for authorship as
              established by the JAIRAM.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">
              Originality Statement:
            </p>
            <p>
              Neither this manuscript nor one with substantially similar content
              under my/our authorship has been published or is being considered
              for publication elsewhere, except as described in the covering
              letter. I/we certify that all the data collected during the study
              is presented in this manuscript and no data from the study has
              been or will be published separately.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Data Availability:</p>
            <p>
              I/we attest that, if requested by the editors, I/we will provide
              the data/information or will cooperate fully in obtaining and
              providing the data/information on which the manuscript is based,
              for examination by the editors or their assignees.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">
              Conflict of Interest Disclosure:
            </p>
            <p>
              Financial interests, direct or indirect, that exist or may be
              perceived to exist for individual contributors in connection with
              the content of this paper have been disclosed in the cover letter.
              Sources of outside support of the project are named in the cover
              letter.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Copyright Transfer:</p>
            <p>
              I/we hereby transfer(s), assign(s), or otherwise convey(s) all
              copyright ownership, including any and all rights incidental
              thereto, exclusively to the Journal, in the event that such work
              is published by the Journal. The Journal shall own the work,
              including the right to grant permission to republish the article
              in whole or in part, with or without fee; the right to produce
              reprints or reprints and translate into languages other than
              English for sale or free distribution; and the right to republish
              the work in a collection of articles in any other mechanical or
              electronic format.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Acknowledgments:</p>
            <p>
              All persons who have made substantial contributions to the work
              reported in the manuscript, but who are not contributors, are
              named in the Acknowledgment and have given me/us their written
              permission to be named. If I/we do not include an Acknowledgment
              that means I/we have not received substantial contributions from
              non-contributors and no contributor has been omitted.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">
              Corresponding Author Authorization:
            </p>
            <p>
              I/we give the rights to the corresponding author to make necessary
              changes as per the request of the journal, to do the rest of the
              correspondence on our behalf and he/she will act as the guarantor
              for the manuscript on our behalf.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900">License Agreement:</p>
            <p>
              The article will be published under the terms of the latest
              Creative Commons Attribution 4.0 International License (CC BY
              4.0), unless the journal notifies the author otherwise in writing.
              Under this license, it is permissible to download and share the
              work provided it is properly cited. The work cannot be changed in
              any way or used commercially without permission from the journal.
              Authors mandated to distribute their work under the CC BY license
              can request the appropriate form from the Editorial Office.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-gray-800">
              <strong>Note:</strong> This form must be completed and signed by
              all authors and submitted with the manuscript. The corresponding
              author is responsible for ensuring that all co-authors have read
              and agreed to the terms stated above.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-medium transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

CopyrightFormModal.displayName = "CopyrightFormModal";

const BottomBar = React.memo(() => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);

  const bottomLinks = useMemo(
    () => [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Accessibility", path: "/accessibility" },
    ],
    [],
  );

  const handleClick = useCallback((path) => {
    if (path === "/privacy-policy") {
      setShowPrivacyModal(true);
      return;
    }
    if (path === "/accessibility") {
      setShowAccessibilityModal(true);
      return;
    }
    console.log("Navigate to:", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
      {showAccessibilityModal && (
        <AccessibilityModal onClose={() => setShowAccessibilityModal(false)} />
      )}
      <div className="bg-blue-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-1">
                &copy; {new Date().getFullYear()} Journal of Advanced &
                Integrated Research in Acute Medicine (JAIRAM).Published by
                Nexus Biomedical Research Foundation Trust,Lucknow,India.
              </p>
              <p className="text-xs text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-1 mt-1">
                Articles are published under the Creative Commons Attribution
                4.0 International License(CC BY 4.0)
                <a
                  href="https://creativecommons.org/licenses/by/4.0/deed.en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:opacity-80 transition-opacity duration-200"
                  aria-label="Creative Commons Attribution 4.0 License"
                  title="Licensed under Creative Commons Attribution 4.0"
                >
                  <img
                    src="/assets/by.png"
                    alt="CC BY 4.0 License"
                    className="h-5 w-auto"
                  />
                </a>
              </p>
            </div>

            <div className="flex flex-nowrap justify-center gap-6">
              {bottomLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleClick(link.path)}
                  className="text-xs text-gray-400 hover:text-blue-400 transition-colors duration-200 whitespace-nowrap"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

BottomBar.displayName = "BottomBar";

const Footer = () => {
  const navigate = useNavigate();
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");

  const handleComingSoon = (title) => {
    setComingSoonTitle(title);
    setShowComingSoonModal(true);
  };

  return (
    <>
      {/* Copyright Form Modal */}
      {showCopyrightModal && (
        <CopyrightFormModal onClose={() => setShowCopyrightModal(false)} />
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title={comingSoonTitle}
      />

      <footer
        className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white mt-auto"
        role="contentinfo"
      >
        {/* Main Footer Content */}
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          {/* Top: ContactInfo spanning wider */}
          <div className="mb-6 max-w-2xl">
            <ContactInfo />
          </div>

          {/* Bottom: Links + Newsletter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section, index) => (
              <FooterLinkSection
                key={index}
                section={section}
                onCopyrightClick={() => setShowCopyrightModal(true)}
                onComingSoon={handleComingSoon}
              />
            ))}
            <div>
              <NewsletterSection onComingSoon={handleComingSoon} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <BottomBar />
      </footer>
    </>
  );
};

export default Footer;
