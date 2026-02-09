import React from "react";
import {
  Calendar,
  Users,
  Download,
  Eye,
  Tag,
  ExternalLink,
} from "lucide-react";
import Card from "../../common/Card/Card";
import Badge from "../../common/Badge/Badge";
import Button from "../../common/Button/Button";

const ArticleCard = ({ article, onClick }) => {
  const getBadgeVariant = (type) => {
    const variants = {
      "Original Research": "blue",
      "Review Article": "green",
      "Case Study": "purple",
      "Clinical Trial": "yellow",
      "Meta-Analysis": "red",
    };
    return variants[type] || "gray";
  };

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <Badge text={article.type} variant={getBadgeVariant(article.type)} />
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {article.date}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
        {article.title}
      </h3>

      <div className="flex items-center text-sm text-gray-600 mb-3">
        <Users className="w-4 h-4 mr-2 shrink-0" />
        <span className="line-clamp-1">{article.authors}</span>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {article.abstract}
      </p>

      {/* Keywords */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.keywords.slice(0, 4).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              <Tag className="w-3 h-3 mr-1" />
              {keyword}
            </span>
          ))}
          {article.keywords.length > 4 && (
            <span className="text-xs text-gray-500">
              +{article.keywords.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {article.views?.toLocaleString()}
          </span>
          <span className="flex items-center">
            <Download className="w-4 h-4 mr-1" />
            {article.downloads?.toLocaleString()}
          </span>
          {article.citations && (
            <span className="flex items-center">
              <ExternalLink className="w-4 h-4 mr-1" />
              {article.citations} citations
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log("View abstract:", article.id);
            }}
          >
            Abstract
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Download PDF:", article.id);
            }}
          >
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ArticleCard;
