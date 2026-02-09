import React from "react";
import { FileText, Download } from "lucide-react";
import Button from "../../common/Button/Button";

const CurrentIssueSidebar = ({ issue }) => {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-serif text-stone-800 mb-6 pb-3 border-b-2 border-stone-300">
        Current Issue Highlights
      </h2>

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-stone-50 p-6 rounded border-l-4 border-blue-600 hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              <Badge text={article.type} variant="orange" size="sm" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2 hover:text-blue-600 cursor-pointer">
              {article.title}
            </h3>
            <p className="text-sm text-stone-600 mb-3">
              {article.authors.join(", ")}
            </p>
            <p className="text-stone-700 text-sm mb-3">{article.abstract}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Pages: {article.pages}</span>
              <div className="flex gap-3">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Abstract
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Full Text
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentIssueSidebar;
