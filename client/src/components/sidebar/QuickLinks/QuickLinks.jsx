import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../../components/common/Card/Card";

const QuickLinks = () => {
  const links = [
    "Submit Manuscript",
    "Author Guidelines",
    "Peer Review Process",
    "Editorial Board",
    "Subscription Information",
    "Open Access",
    "Contact Us",
    "About the Journal",
  ];

  return (
    <Card className="bg-stone-50 border border-stone-300">
      <h3 className="text-xl font-serif text-stone-800 mb-4 pb-2 border-b border-stone-300">
        Quick Links
      </h3>
      <ul className="space-y-2">
        {links.map((link, idx) => (
          <li key={idx}>
            <button className="text-blue-600 hover:text-blue-800 text-sm hover:underline flex items-center">
              <ChevronRight className="w-3 h-3 mr-1" />
              {link}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
export default QuickLinks;
