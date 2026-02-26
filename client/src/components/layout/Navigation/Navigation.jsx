import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Home,
  BookOpen,
  FileText,
  Send,
  Users,
  Globe,
  Phone,
  HelpCircle,
  Handshake,
  Info,
  ChevronDown,
  Menu,
  X,
  Clock,
  Edit,
  CheckCircle,
  Shield,
  LockOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// ============= CONSTANTS AND DATA =============
const FOR_AUTHORS_MENU = [
  {
    icon: Send,
    label: "Submit Manuscript",
    description: "Submit your research online",
    path: "/manuscript-login",
  },
  {
    icon: Edit,
    label: "Author Guidelines",
    description: "Writing and formatting instructions",
    path: "/authors-guidelines",
  },
  {
    icon: CheckCircle,
    label: "Peer Review Process",
    description: "Understanding our review system",
    path: "/peer-review-process",
  },
  {
    icon: HelpCircle,
    label: "FAQ",
    description: "Frequently asked questions & answers",
    path: "/faqs",
  },
  {
    icon: Phone,
    label: "Contact Us",
    description: "Get in touch with our team",
    path: "/contact",
  },
];

const JOURNAL_INFO_MENU = [
  {
    icon: Info,
    label: "About the Journal",
    description: "Mission, scope, and aims",
    path: "/about",
  },
  {
    icon: Users,
    label: "Editorial Board",
    description: "Meet our editors and reviewers",
    path: "/editorial-board",
  },
  {
    icon: Shield,
    label: "Ethics & Policies",
    description: "Publication ethics guidelines",
    path: "/ethics",
  },
  {
    icon: Handshake,
    label: "Powered Trust",
    description: "Ownership and Management",
    path: "/powered-trust",
  },
  {
    icon: LockOpen,
    label: "Article Processing Charge (APC)",
    description: "Open access publication fees",
    path: "/article-processing-charge",
  },
];

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "current-issue", label: "Current Issue", icon: BookOpen, path: "/current-issue" },
  { id: "all-issues", label: "Previous Issues", icon: FileText, path: "/issues" },
  { id: "ahead", label: "Published Ahead-of-Print", icon: Clock, path: "/ahead-of-print" },
  { id: "authors", label: "For Authors", icon: Edit, hasDropdown: true, menu: FOR_AUTHORS_MENU },
  { id: "info", label: "Journal Info", icon: Info, hasDropdown: true, menu: JOURNAL_INFO_MENU },
];

// ============= DROPDOWN MENU =============
const DropdownMenu = React.memo(({ menu, isMobile, onClose, onNavigate }) => {
  const handleClick = useCallback(
    (path) => {
      onNavigate(path);
      onClose();
    },
    [onNavigate, onClose],
  );

  return (
    <div
      className={`${
        isMobile
          ? "bg-white py-2"
          : "absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
      }`}
    >
      {menu.map((menuItem, idx) => (
        <button
          key={`${menuItem.path}-${idx}`}
          onClick={() => handleClick(menuItem.path)}
          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
            isMobile ? "hover:bg-slate-50" : "hover:bg-blue-50"
          }`}
        >
          <menuItem.icon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {menuItem.label}
            </div>
            <div className="text-xs text-slate-500">{menuItem.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
});

DropdownMenu.displayName = "DropdownMenu";

const MobileMenuButton = React.memo(({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 rounded-md border border-slate-200 bg-white"
  >
    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </button>
));

// ============= MAIN COMPONENT =============
const Navigation = React.memo(() => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const isItemActive = useCallback(
    (item) => location.pathname.startsWith(item.path),
    [location.pathname],
  );

  const handleNavigation = useCallback((path) => navigate(path), [navigate]);

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() =>
                  item.hasDropdown
                    ? setActiveDropdown((p) => (p === item.id ? null : item.id))
                    : handleNavigation(item.path)
                }
                className={`px-3 py-3 text-sm font-semibold border-b-2 transition-all ${
                  isItemActive(item) || activeDropdown === item.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-700 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown
                    className={`inline w-4 h-4 ml-1 transition-transform ${
                      activeDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {item.hasDropdown && activeDropdown === item.id && (
                <DropdownMenu
                  menu={item.menu}
                  isMobile={false}
                  onClose={() => setActiveDropdown(null)}
                  onNavigate={handleNavigation}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-slate-700">Menu</span>
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((p) => !p)}
          />
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  item.hasDropdown
                    ? setActiveDropdown((p) => (p === item.id ? null : item.id))
                    : handleNavigation(item.path)
                }
                className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";
export default Navigation;