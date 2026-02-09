import React, { useState } from "react";
import { Search } from "lucide-react";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";

const HeroSection = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Advancing Medical Research
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Peer-reviewed, open-access journal publishing cutting-edge research
            in medicine and healthcare
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search articles by title, author, keyword, or DOI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-lg text-gray-900 text-lg border-0 focus:ring-4 focus:ring-blue-300"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
            >
              Search
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <button
              type="button"
              className="text-blue-100 hover:text-white transition-colors"
            >
              Advanced Search
            </button>
            <span className="text-blue-300">•</span>
            <button
              type="button"
              className="text-blue-100 hover:text-white transition-colors"
            >
              Browse by Topic
            </button>
            <span className="text-blue-300">•</span>
            <button
              type="button"
              className="text-blue-100 hover:text-white transition-colors"
            >
              Most Cited
            </button>
            <span className="text-blue-300">•</span>
            <button
              type="button"
              className="text-blue-100 hover:text-white transition-colors"
            >
              Recent Publications
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-blue-200 text-sm">Published Articles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.5</div>
            <div className="text-blue-200 text-sm">Impact Factor</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-blue-200 text-sm">Acceptance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">2-4</div>
            <div className="text-blue-200 text-sm">Weeks Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
