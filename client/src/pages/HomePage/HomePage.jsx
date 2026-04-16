import React, { useState } from "react";
import { BookOpen, Clock } from "lucide-react";

import CurrentIssue from "../../components/home/CurrentIssue/CurrentIssue";
import Announcements from "../../components/home/Announcements/Announcements";
import { mockCurrentIssue } from "../../data/mockData";

const HomePage = ({ onArticleClick, onSearch }) => {
  return (
    <div className="min-h-screen bg-stone-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Current Issue */}
        <CurrentIssue issue={mockCurrentIssue} />

        {/* Coming Soon - below the current issue */}
        <div className="mt-8 text-center py-16 px-8 bg-white rounded-2xl shadow-sm border border-gray-100 w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Articles Coming Soon
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
            We are currently reviewing submissions for our inaugural issue.
            Published articles will appear here shortly.
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-4 py-2 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Jan–Jun 2026 · Volume 1 · Issue 1
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