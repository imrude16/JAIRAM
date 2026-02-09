import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  User,
  Mail,
  FileText,
  X,
} from "lucide-react";

const Logo =
  process.env.NODE_ENV === "production"
    ? "/assets/Logo.jpg"
    : "/assets/Logo.jpg";
import TopBar from "../../common/TopBar/TopBar";
import Navigation from "../Navigation/Navigation";
import { useNavigate, useLocation } from "react-router-dom";

// ============= OPTIMIZED JOURNAL TITLE =============
const JournalTitle = React.memo(() => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start">
        <div className="hidden sm:block shrink-0 mt-1">
          <div className="w-12 h-12 sm:w-30 sm:h-30 flex items-center justify-center">
            <img
              src={Logo}
              alt="Journal Logo"
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 mt-10">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-4xl font-serif text-stone-900 leading-tight mb-1">
            Journal of Advanced & Integrated Research in Acute Medicine (JAIRAM)
          </h1>
          {/* <p className="text-xs sm:text-sm text-stone-600 mt-2">
            ISSN: 2349-3806 | Online ISSN: 2950-5933
          </p> */}
        </div>
      </div>
    </div>
  );
});

JournalTitle.displayName = "JournalTitle";

// ============= MAIN HEADER COMPONENT =============
const Header = () => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileSearchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <TopBar />

      <header
        className={`bg-stone-100 border-b border-stone-300 transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start justify-between">
            {/* Journal Title */}
            <JournalTitle />

            {/* Mobile Search Toggle */}
            <button
              data-search-toggle
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden shrink-0 p-2 rounded-lg hover:bg-stone-200 transition-colors active:scale-95"
              aria-label={showMobileSearch ? "Close search" : "Open search"}
              aria-expanded={showMobileSearch}
            >
              {showMobileSearch ? (
                <X className="w-5 h-5 text-stone-700" />
              ) : (
                <Search className="w-5 h-5 text-stone-700" />
              )}
            </button>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div
              ref={mobileSearchRef}
              className="lg:hidden mt-4"
              role="dialog"
              aria-label="Mobile search"
            >
              <SearchBar {...searchProps} isMobile={true} />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <Navigation />
      </header>
    </>
  );
};

export default React.memo(Header);
