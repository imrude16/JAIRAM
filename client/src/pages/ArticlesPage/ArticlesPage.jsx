import React, { useState } from "react";
import ArticleSearch from "../../components/articles/ArticleSearch/ArticleSearch";
import ArticleList from "../../components/home/ArticleList/ArticleList";
import { mockArticles } from "../../data/mockData";

const ArticlesPage = ({ onArticleClick }) => {
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);

  const handleSearch = (query, filters) => {
    console.log("Searching with:", query, filters);
    // Implement search logic here
    // For now, just showing all articles
    setFilteredArticles(mockArticles);
  };

  const handleFilterChange = (filters) => {
    console.log("Filters changed:", filters);
    // Implement filter logic here
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Browse All Articles
      </h1>

      <ArticleSearch
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredArticles.length} articles
      </div>

      <ArticleList
        articles={filteredArticles}
        onArticleClick={onArticleClick}
      />
    </main>
  );
};

export default ArticlesPage;
