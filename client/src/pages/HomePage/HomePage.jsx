import React, { useState } from "react";
import {
  Calendar,
  FileText,
  Download,
  BookOpen,
  ChevronRight,
  Bell,
  Search,
  ExternalLink,
  Clock,
  Eye,
  Mail,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";

// import HeroSection from "../../components/home/HeroSection/HeroSection";
import Navigation from "../../components/layout/Navigation/Navigation";
import CurrentIssue from "../../components/home/CurrentIssue/CurrentIssue";
import ArticleList from "../../components/home/ArticleList/ArticleList";
import QuickLinks from "../../components/sidebar/QuickLinks/QuickLinks";
import CurrentIssueSidebar from "../../components/sidebar/CurrentIssueSidebar/CurrentIssueSidebar";
import Announcements from "../../components/home/Announcements/Announcements";
import { mockCurrentIssue, mockArticles } from "../../data/mockData";

const HomePage = ({ onArticleClick, onSearch }) => {
  const [activeTab, setActiveTab] = useState("featured");

  const tabs = [
    { id: "featured", label: "Featured Articles" },
    { id: "recent", label: "Most Recent" },
    { id: "popular", label: "Most Popular" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <CurrentIssue issue={mockCurrentIssue} />
          </div>

          {/* Quick Links */}
          {/* <div className="lg:col-span-1 space-y-6">
            <QuickLinks />
          </div> */}

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 font-semibold transition-all ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles */}
            <ArticleList
              articles={mockArticles}
              onArticleClick={onArticleClick}
            />

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">...</span>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  10
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="mt-16">
          <Announcements />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
