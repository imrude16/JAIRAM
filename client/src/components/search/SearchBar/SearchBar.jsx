import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-6">Search Articles</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, keyword, or DOI..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-400 text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#" className="text-white hover:underline text-sm">
            Advanced Search
          </a>
          <span className="text-white">|</span>
          <a href="#" className="text-white hover:underline text-sm">
            Browse by Topic
          </a>
          <span className="text-white">|</span>
          <a href="#" className="text-white hover:underline text-sm">
            Most Cited
          </a>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
