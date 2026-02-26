import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  FileText,
  LogIn,
  UserPlus,
  Bell,
  ChevronDown,
} from "lucide-react";

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
        if (e.key === "Enter") onSearch();
      },
      [onSearch],
    );

    return (
      <div className={`${isMobile ? "space-y-3" : "flex items-center gap-3"}`}>
        <div
          className={`flex ${
            isMobile
              ? "flex-col sm:flex-row gap-2"
              : "items-center rounded-lg overflow-hidden"
          }`}
          style={{
            border: "1px solid rgba(15,42,68,0.25)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="relative shrink-0">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="appearance-none bg-transparent px-3 py-2 pr-7 text-sm focus:outline-none cursor-pointer"
              style={{
                borderRight: isMobile
                  ? "none"
                  : "1px solid rgba(15,42,68,0.25)",
                color: "#0f2a44",
                fontFamily: "Georgia, serif",
              }}
            >
              {searchTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          </div>

          <input
            type="text"
            placeholder="Search articles, authors, issues…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="px-3 py-2 text-sm focus:outline-none bg-transparent"
            style={{
              width: isMobile ? "100%" : "200px",
              color: "#0f2a44",
              fontFamily: "Georgia, serif",
            }}
          />

          <button
            onClick={onSearch}
            className="px-4 py-2 text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #0f2a44, #1a4a7a)",
              borderRadius: isMobile ? "6px" : "0",
            }}
          >
            Search
          </button>
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

  const navigate = useNavigate();
  const location = useLocation();
  const mobileSearchRef = useRef(null);
  const prevPathnameRef = useRef(null);

  const handleLogin = () => {
    setShowLoginMenu(false);
    navigate("/auth/login");
  };

  const handleRegister = () => {
    setShowLoginMenu(false);
    navigate("/auth/register");
  };

  const handleEmailAlerts = () => {
    alert("Subscribe to email alerts for new issues and articles");
  };

  const handleSubmitManuscript = () => {
    navigate("/manuscript-login");
  };

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      if (showMobileSearch) setShowMobileSearch(false);
    }
  }, [searchQuery, searchType, navigate, showMobileSearch]);

  useEffect(() => {
    if (
      location.pathname !== "/search" &&
      prevPathnameRef.current === "/search"
    ) {
      setSearchQuery("");
    }
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

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
    <div
      style={{
        background:
          "linear-gradient(to right, rgba(245,248,252,0.9), rgba(230,238,246,0.95))",
        borderBottom: "1px solid rgba(15,42,68,0.15)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Login/Register Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLoginMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
              style={{
                color: "#0f2a44",
                border: "1px solid rgba(15,42,68,0.25)",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <User size={14} />
              Log in / Register
              <ChevronDown
                size={12}
                style={{
                  transition: "transform 0.2s",
                  transform: showLoginMenu ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {showLoginMenu && (
              <div
                className="absolute left-0 mt-2 w-44 rounded-lg shadow-lg overflow-hidden z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,42,68,0.2)",
                }}
              >
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50"
                  style={{ color: "#0f2a44" }}
                >
                  <LogIn size={14} className="text-blue-700" />
                  Log In
                </button>

                <button
                  type="button"
                  onClick={handleRegister}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-green-50 border-t"
                  style={{ color: "#0f2a44" }}
                >
                  <UserPlus size={14} className="text-green-700" />
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Submit Manuscript (Primary CTA) */}
          <button
            onClick={handleSubmitManuscript}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white shadow-md transition-transform duration-150 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #0f2a44, #1a4a7a)",
            }}
          >
            <FileText size={14} />
            Submit Manuscript
          </button>

          {/* Email Alerts */}
          <button
            onClick={handleEmailAlerts}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
            style={{
              border: "1px solid rgba(15,42,68,0.25)",
              color: "#0f2a44",
              background: "rgba(255,255,255,0.75)",
            }}
          >
            <Mail size={14} />
            Issue Alerts
          </button>
        </div>

        {/* Right — Desktop Search */}
        <div className="hidden lg:flex items-center shrink-0">
          <SearchBar {...searchProps} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;