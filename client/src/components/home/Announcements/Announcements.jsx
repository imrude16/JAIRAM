import React from "react";
import { Bell } from "lucide-react";

const Announcements = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Latest Announcements
      </h2>

      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-blue-100 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Announcements Yet
        </h3>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          Announcements and updates will be posted here as the journal launches.
          Check back soon.
        </p>
      </div>
    </div>
  );
};

export default Announcements;