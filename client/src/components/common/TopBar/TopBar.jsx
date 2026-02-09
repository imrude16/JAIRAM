import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  FileText,
  LogIn,
  UserPlus,
  Bell,
  Upload,
  ChevronDown,
  X,
} from "lucide-react";
import { useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// ============= OPTIMIZED SEARCH COMPONENT =============
const SearchBar = React.memo(
  ({
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    onSearch,
    isMobile = false,
  }) => {
    const searchTypes = useMemo(
      () => [
        { value: "Articles", label: "Articles" },
        { value: "Authors", label: "Authors" },
        { value: "Issues", label: "Issues" },
      ],
      [],
    );

    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter") {
          onSearch();
        }
      },
      [onSearch],
    );

    return (
      <div
        className={`${
          isMobile ? "space-y-3" : "flex -mt-10 items-center gap-3"
        }`}
      >
        <div
          className={`flex ${
            isMobile
              ? "flex-col sm:flex-row gap-2"
              : "items-center bg-white border border-stone-300 rounded shadow-sm"
          }`}
        >
          <div className="relative shrink-0">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={`appearance-none bg-transparent border-stone-300 px-3 py-2 pr-8 text-sm focus:outline-none cursor-pointer hover:bg-stone-50 transition-colors
              ${
                isMobile
                  ? "w-full bg-white border rounded focus:ring-2 focus:ring-blue-500"
                  : "border-r"
              }`}
              aria-label="Search type"
            >
              {searchTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-600 pointer-events-none" />
          </div>
          <div className={`${isMobile ? "flex-1 flex gap-2" : ""}`}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                isMobile
                  ? "flex-1 border border-stone-300 rounded"
                  : "w-48 xl:w-64"
              }`}
              aria-label="Search query"
            />
            {/* <button
              onClick={onSearch}
              className={`px-4 py-2 bg-stone-700 text-white hover:bg-stone-800 transition-colors flex items-center justify-center
              ${isMobile ? "rounded" : ""}`}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button> */}
          </div>
        </div>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

const TopBar = () => {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [searchType, setSearchType] = useState("Articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const mobileSearchRef = useRef(null);

  const handleLogin = () => {
    setShowLoginMenu(false);
    navigate("/auth/login");
  };

  const handleRegister = () => {
    setShowLoginMenu(false);
    navigate("/auth/register");
  };

  const handleEmailAlerts = () => {
    console.log("Email alerts clicked");
    alert("Subscribe to email alerts for new issues and articles");
  };

  const handleSubmitManuscript = () => {
    navigate("/manuscript-login");
  };

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      console.log(`Searching for "${searchQuery}" in ${searchType}`);
      navigate(
        `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
      );

      if (showMobileSearch) {
        setShowMobileSearch(false);
      }
    }
  }, [searchQuery, searchType, navigate, showMobileSearch]);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target) &&
        !event.target.closest("[data-search-toggle]")
      ) {
        setShowMobileSearch(false);
      }
    };

    if (showMobileSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileSearch]);

  useEffect(() => {
    if (location.pathname !== "/search") {
      setSearchQuery("");
    }
  }, [location.pathname]);

  // Memoized search props
  const searchProps = useMemo(
    () => ({
      searchType,
      setSearchType,
      searchQuery,
      setSearchQuery,
      onSearch: handleSearch,
    }),
    [searchType, searchQuery, handleSearch],
  );

  return (
    <div className="bg-stone-200 border-b border-stone-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          {/* Left Section - Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6">
            {/* Login/Register Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="flex items-center text-stone-700 hover:text-stone-900 hover:bg-stone-300 px-3 py-1.5 rounded transition-all group"
              >
                <User className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Log in or Register</span>
                <ChevronDown
                  className={`w-3 h-3 ml-1 transition-transform ${
                    showLoginMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Login Dropdown Menu */}
              {showLoginMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-300 py-2 z-9999 animate-fadeIn">
                  <button
                    type="button"
                    onMouseDown={handleLogin}
                    className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-100 flex items-center transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Log In</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={handleRegister}
                    className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-100 flex items-center transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email Alerts */}
            <button
              onClick={handleEmailAlerts}
              className="flex items-center text-stone-700 hover:text-stone-900 hover:bg-stone-300 px-3 py-1.5 rounded transition-all group"
            >
              <Mail className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden sm:inline">
                Get new issue alerts
              </span>
              <span className="font-medium sm:hidden">Issue Alerts</span>
            </button>

            {/* Submit Manuscript */}
            <div className="relative">
              <button
                onClick={handleSubmitManuscript}
                onMouseEnter={() => setShowSubmitInfo(true)}
                onMouseLeave={() => setShowSubmitInfo(false)}
                className="flex items-center text-stone-700 hover:text-stone-900 hover:bg-stone-300 px-3 py-1.5 rounded transition-all group"
              >
                <FileText className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden sm:inline">
                  Submit a Manuscript
                </span>
                <span className="font-medium sm:hidden">Submit</span>
              </button>
            </div>
          </div>
          {/* Desktop Search */}
          <div className="hidden lg:flex items-start gap-3 mt-10 shrink-0">
            <SearchBar {...searchProps} />
          </div>
        </div>

        {/* Mobile Info Bar */}
        <div className="sm:hidden mt-3 pt-3 border-t border-stone-300">
          <div className="flex items-center justify-center gap-4 text-xs text-stone-600">
            <span className="flex items-center">
              <Bell className="w-3 h-3 mr-1" />3 new updates
            </span>
            <span className="flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              Fast submission
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @media (max-width: 640px) {
          button span {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TopBar;
