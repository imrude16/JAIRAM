import React, { useState } from "react";
import {
  Calendar,
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  Grid,
  List,
} from "lucide-react";

const Card = ({ children, className = "", hover = false, padding = "md" }) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
      bg-white rounded-lg shadow-md 
      ${hover ? "hover:shadow-xl transition-shadow duration-300" : ""} 
      ${paddings[padding]}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

const Badge = ({ text, variant = "blue", size = "md" }) => {
  const variants = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <span
      className={`inline-block font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {text}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  icon: Icon,
  type = "button",
  disabled = false,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm",
    outline:
      "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled ? disabledStyles : ""
      } ${className}`}
    >
      {Icon && (
        <Icon
          className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} ${
            children ? "mr-2" : ""
          }`}
        />
      )}
      {children}
    </button>
  );
};

const IssuesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const allIssues = [
    {
      id: 1,
      volume: "Volume 15",
      issue: "Issue 4",
      year: 2025,
      month: "December",
      cover:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop",
      articles: 12,
      published: "December 15, 2024",
      pages: "245-380",
      status: "current",
      doi: "10.1234/journal.2024.15.4",
    },
    {
      id: 2,
      volume: "Volume 15",
      issue: "Issue 3",
      year: 2025,
      month: "September",
      cover:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=400&fit=crop",
      articles: 10,
      published: "September 20, 2025",
      pages: "145-244",
      status: "published",
      doi: "10.1234/journal.2024.15.3",
    },
    {
      id: 3,
      volume: "Volume 15",
      issue: "Issue 2",
      year: 2025,
      month: "June",
      cover:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=400&fit=crop",
      articles: 11,
      published: "June 10, 2025",
      pages: "65-144",
      status: "published",
      doi: "10.1234/journal.2024.15.2",
    },
    {
      id: 4,
      volume: "Volume 15",
      issue: "Issue 1",
      year: 2025,
      month: "March",
      cover:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=400&fit=crop",
      articles: 9,
      published: "March 5, 2025",
      pages: "1-64",
      status: "published",
      doi: "10.1234/journal.2024.15.1",
    },
    {
      id: 5,
      volume: "Volume 14",
      issue: "Issue 4",
      year: 2025,
      month: "December",
      cover:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      articles: 13,
      published: "December 12, 2025",
      pages: "320-480",
      status: "published",
      doi: "10.1234/journal.2023.14.4",
    },
    {
      id: 6,
      volume: "Volume 14",
      issue: "Issue 3",
      year: 2026,
      month: "January",
      cover:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop",
      articles: 11,
      published: "September 18, 2026",
      pages: "200-319",
      status: "published",
      doi: "10.1234/journal.2023.14.3",
    },
  ];

  const years = [...new Set(allIssues.map((issue) => issue.year))].sort(
    (a, b) => b - a,
  );

  const filteredIssues = allIssues.filter((issue) => {
    const matchesYear =
      selectedYear === "all" || issue.year.toString() === selectedYear;
    const matchesSearch =
      searchQuery === "" ||
      issue.volume.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.month.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-linear-to-r from-blue-900 to-blue-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Issues</h1>
          <p className="text-xl text-blue-100 mb-6">
            Browse our complete archive of published research and articles
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{allIssues.length} Issues Published</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>
                {allIssues.reduce((sum, issue) => sum + issue.articles, 0)}{" "}
                Total Articles
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by volume, issue, or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Year Filter */}
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 border-l border-gray-300 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredIssues.length}</span> issue
            {filteredIssues.length !== 1 ? "s" : ""}
            {selectedYear !== "all" && ` from ${selectedYear}`}
          </p>
        </div>

        {/* Issues Display */}
        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                hover
                padding="none"
                className="overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={issue.cover}
                    alt={`${issue.volume} ${issue.issue}`}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {issue.status === "current" && (
                    <div className="absolute top-3 right-3">
                      <Badge text="Current Issue" variant="green" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {issue.volume}
                  </h3>
                  <p className="text-lg text-blue-600 font-semibold mb-4">
                    {issue.issue}
                  </p>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {issue.published}
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      {issue.articles} articles • pp. {issue.pages}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" size="sm">
                      View Issue
                    </Button>
                    <Button variant="outline" size="sm" icon={Download} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} hover className="group">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="sm:w-32 sm:h-44 shrink-0">
                    <img
                      src={issue.cover}
                      alt={`${issue.volume} ${issue.issue}`}
                      className="w-full h-48 sm:h-full object-cover rounded-lg group-hover:shadow-lg transition-shadow"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {issue.volume}, {issue.issue}
                          </h3>
                          <p className="text-gray-600">
                            {issue.month} {issue.year}
                          </p>
                        </div>
                        {issue.status === "current" && (
                          <Badge text="Current Issue" variant="green" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Published: {issue.published}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          {issue.articles} articles
                        </div>
                        <div>Pages: {issue.pages}</div>
                      </div>
                      <p className="text-sm text-gray-500">DOI: {issue.doi}</p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="primary" size="sm">
                        View Issue
                      </Button>
                      <Button variant="outline" size="sm">
                        Table of Contents
                      </Button>
                      <Button variant="ghost" size="sm" icon={Download}>
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredIssues.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No issues found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        )}

        {/* Archive Section */}
        <div className="mt-12">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Browse by Year
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(2)].map((_, i) => {
                const year = 2026 - i;
                const hasIssues = allIssues.some(
                  (issue) => issue.year === year,
                );
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year.toString())}
                    disabled={!hasIssues}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedYear === year.toString()
                        ? "bg-blue-600 text-white shadow-md"
                        : hasIssues
                          ? "bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md border border-gray-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card hover className="text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Submit Article
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Share your research with our community
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </Card>
          <Card hover className="text-center">
            <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Download Guidelines
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Author guidelines and submission format
            </p>
            <Button variant="outline" size="sm">
              Download PDF
            </Button>
          </Card>
          <Card hover className="text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Subscribe</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get notified about new issues
            </p>
            <Button variant="outline" size="sm">
              Subscribe Now
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IssuesPage;
