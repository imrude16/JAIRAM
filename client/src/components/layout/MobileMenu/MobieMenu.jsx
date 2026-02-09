import React from "react";
import { Home, BookOpen, FileText, Send, Info, Phone, X } from "lucide-react";

const MobileMenu = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "current-issue", label: "Current Issue", icon: BookOpen },
    { id: "all-issues", label: "All Issues", icon: FileText },
    { id: "articles", label: "Articles", icon: FileText },
    { id: "submit", label: "Submit Article", icon: Send },
    { id: "about", label: "About Us", icon: Info },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Menu Panel */}
        <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all
                      ${
                        currentPage === item.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
