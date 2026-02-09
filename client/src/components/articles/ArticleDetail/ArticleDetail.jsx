import React, { useState } from "react";
import {
  Calendar,
  Users,
  Download,
  Eye,
  Tag,
  ExternalLink,
  Share2,
  Mail,
  Bookmark,
  Quote,
} from "lucide-react";
import Card from "../../common/Card/Card";
import Badge from "../../common/Badge/Badge";
import Button from "../../common/Button/Button";

const ArticleDetail = ({ article, onBack }) => {
  const [activeTab, setActiveTab] = useState("abstract");

  const tabs = [
    { id: "abstract", label: "Abstract" },
    { id: "fulltext", label: "Full Text" },
    { id: "references", label: "References" },
    { id: "metrics", label: "Metrics" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center"
      >
        ← Back to Articles
      </button>

      <Card>
        {/* Article Header */}
        <div className="mb-6">
          <Badge text={article.type} variant="blue" size="lg" />

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
            {article.title}
          </h1>

          {/* Authors */}
          <div className="flex items-center text-gray-700 mb-4">
            <Users className="w-5 h-5 mr-2 shrink-0" />
            <span className="font-medium">{article.authors}</span>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Published: {article.date}
            </div>
            <div className="flex items-center">
              DOI:{" "}
              <span className="text-blue-600 ml-1">
                {article.doi || "10.xxxx/xxxxx"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-y border-gray-200">
            <div className="flex items-center text-gray-600">
              <Eye className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {article.views?.toLocaleString()}
              </span>
              <span className="text-sm ml-1">views</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Download className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {article.downloads?.toLocaleString()}
              </span>
              <span className="text-sm ml-1">downloads</span>
            </div>
            {article.citations && (
              <div className="flex items-center text-gray-600">
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="font-medium">{article.citations}</span>
                <span className="text-sm ml-1">citations</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="primary" icon={Download} size="lg">
            Download PDF
          </Button>
          <Button variant="outline" icon={Quote}>
            Cite
          </Button>
          <Button variant="outline" icon={Share2}>
            Share
          </Button>
          <Button variant="outline" icon={Mail}>
            Email
          </Button>
          <Button variant="outline" icon={Bookmark}>
            Save
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="prose max-w-none">
          {activeTab === "abstract" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Abstract</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {article.abstract}
              </p>

              {article.keywords && article.keywords.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword, index) => (
                      <Badge key={index} text={keyword} variant="blue" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "fulltext" && (
            <div>
              <p className="text-gray-600">
                Full text content will be displayed here...
              </p>
            </div>
          )}

          {activeTab === "references" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                References
              </h3>
              <p className="text-gray-600">References will be listed here...</p>
            </div>
          )}

          {activeTab === "metrics" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Article Metrics
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {article.views?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </Card>
                <Card className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {article.downloads?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Downloads</div>
                </Card>
                <Card className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {article.citations || 0}
                  </div>
                  <div className="text-sm text-gray-600">Citations</div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ArticleDetail;
