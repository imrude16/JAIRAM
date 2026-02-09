import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import Input from "../../common/Input/Input";
import Button from "../../common/Button/Button";
import Card from "../../common/Card/Card";

const ArticleSearch = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    articleType: "",
    dateRange: "",
    sortBy: "relevant",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch}>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by title, author, keyword, or DOI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="py-3"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Type
              </label>
              <select
                value={filters.articleType}
                onChange={(e) =>
                  handleFilterChange("articleType", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Original Research">Original Research</option>
                <option value="Review Article">Review Article</option>
                <option value="Case Study">Case Study</option>
                <option value="Clinical Trial">Clinical Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Time</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-year">Last Year</option>
                <option value="last-5-years">Last 5 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevant">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="cited">Most Cited</option>
                <option value="viewed">Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({
                  articleType: "",
                  dateRange: "",
                  sortBy: "relevant",
                });
                onFilterChange({
                  articleType: "",
                  dateRange: "",
                  sortBy: "relevant",
                });
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => onSearch(query, filters)}>
              Apply Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ArticleSearch;
