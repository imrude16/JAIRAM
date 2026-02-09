import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
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
  ExternalLink,
  Clock,
  Edit,
  CheckCircle,
  Mail,
  Award,
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
    icon: LockOpen, // or Unlock icon
    label: "Article Processing Charge (APC)",
    description: "Open access publication fees",
    path: "/article-processing-charge",
  },
];

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    id: "current-issue",
    label: "Current Issue",
    icon: BookOpen,
    path: "/current-issue",
  },
  {
    id: "all-issues",
    label: "Previous Issues",
    icon: FileText,
    path: "/issues",
  },
  {
    id: "ahead",
    label: "Published Ahead-of-Print",
    icon: Clock,
    path: "/ahead-of-print",
  },
  {
    id: "authors",
    label: "For Authors",
    icon: Edit,
    hasDropdown: true,
    menu: FOR_AUTHORS_MENU,
  },
  {
    id: "info",
    label: "Journal Info",
    icon: Info,
    hasDropdown: true,
    menu: JOURNAL_INFO_MENU,
  },
];

// ============= REUSABLE COMPONENTS =============
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
          ? "bg-stone-900 py-2 animate-slide-down"
          : "absolute left-0 top-full mt-0 w-80 bg-white rounded-b-lg shadow-xl border border-stone-200 overflow-hidden animate-fade-in"
      }`}
      role="menu"
      aria-label="Dropdown menu"
    >
      <div className={isMobile ? "space-y-0" : "py-2"}>
        {menu.map((menuItem, idx) => (
          <button
            key={`${menuItem.path}-${idx}`}
            onClick={() => handleClick(menuItem.path)}
            className={`w-full text-left transition-colors duration-150 group ${
              isMobile
                ? "px-8 py-3 hover:bg-stone-700 flex items-start"
                : "px-4 py-3 hover:bg-stone-50 flex items-start"
            }`}
            role="menuitem"
          >
            <menuItem.icon
              className={`${
                isMobile
                  ? "w-4 h-4 text-stone-400 mr-3 mt-0.5"
                  : "w-5 h-5 text-stone-500 mr-3 mt-0.5 group-hover:text-blue-600 transition-colors"
              }`}
            />
            <div>
              <div
                className={`${
                  isMobile
                    ? "text-sm font-medium text-white"
                    : "text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors"
                }`}
              >
                {menuItem.label}
              </div>
              <div
                className={`mt-0.5 ${
                  isMobile ? "text-xs text-stone-400" : "text-xs text-stone-500"
                }`}
              >
                {menuItem.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

DropdownMenu.displayName = "DropdownMenu";

const MobileMenuButton = React.memo(({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-stone-700 transition-colors duration-200 active:scale-95"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
});

MobileMenuButton.displayName = "MobileMenuButton";

// ============= MAIN COMPONENT =============
const Navigation = React.memo(() => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside - optimized with passive listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, {
      passive: true,
    });
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Close mobile menu when resizing to desktop - debounced
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setMobileMenuOpen(false);
          setActiveDropdown(null);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check if item is active based on current route
  const isItemActive = useCallback(
    (item) => {
      if (item.path === "/") {
        return location.pathname === "/";
      }

      if (item.hasDropdown) {
        return (
          item.menu?.some((menuItem) =>
            location.pathname.startsWith(menuItem.path),
          ) || false
        );
      }

      return location.pathname.startsWith(item.path);
    },
    [location.pathname],
  );

  // Handle navigation with proper cleanup
  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  const handleDropdownToggle = useCallback((itemId) => {
    setActiveDropdown((prev) => (prev === itemId ? null : itemId));
  }, []);

  const handleMobileDropdownToggle = useCallback((itemId) => {
    setActiveDropdown((prev) => (prev === itemId ? null : itemId));
  }, []);

  // Memoize the desktop navigation items rendering
  const desktopNavItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        isActive: isItemActive(item),
      })),
    [isItemActive],
  );

  // Memoize the mobile navigation items rendering
  const mobileNavItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        isActive: isItemActive(item),
      })),
    [isItemActive],
  );

  return (
    <nav
      className="bg-stone-800 text-white relative z-50 shadow-lg"
      ref={dropdownRef}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1">
            {desktopNavItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() =>
                    item.hasDropdown
                      ? handleDropdownToggle(item.id)
                      : handleNavigation(item.path)
                  }
                  className={`px-4 py-4 text-sm font-medium flex items-center transition-colors duration-200 ${
                    item.isActive || activeDropdown === item.id
                      ? "bg-stone-700"
                      : "hover:bg-stone-700"
                  }`}
                  aria-haspopup={item.hasDropdown ? "true" : "false"}
                  aria-expanded={activeDropdown === item.id ? "true" : "false"}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        activeDropdown === item.id ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
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

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          />

          {/* Mobile Menu Label */}
          <div className="lg:hidden flex-1 text-center">
            <span className="text-sm font-medium">Menu</span>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t border-stone-700 py-4 animate-slide-down"
            role="menu"
            aria-label="Mobile menu"
          >
            <div className="space-y-1">
              {mobileNavItems.map((item) => (
                <div key={`mobile-${item.id}`}>
                  <button
                    onClick={() =>
                      item.hasDropdown
                        ? handleMobileDropdownToggle(item.id)
                        : handleNavigation(item.path)
                    }
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between transition-colors duration-200 ${
                      item.isActive ? "bg-stone-700" : "hover:bg-stone-700"
                    }`}
                    aria-haspopup={item.hasDropdown ? "true" : "false"}
                    aria-expanded={
                      activeDropdown === item.id ? "true" : "false"
                    }
                  >
                    <span className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                      {item.label}
                    </span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.id ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {/* Mobile Dropdown */}
                  {item.hasDropdown && activeDropdown === item.id && (
                    <DropdownMenu
                      menu={item.menu}
                      isMobile={true}
                      onClose={() => {
                        setActiveDropdown(null);
                        setMobileMenuOpen(false);
                      }}
                      onNavigate={handleNavigation}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu - performance optimized */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 -z-10"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          style={{
            animation: "fade-in 0.2s ease-out",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
