import React from "react";
import { Calendar, Download, Eye } from "lucide-react";
import Card from "../../common/Card/Card";
import Button from "../../common/Button/Button";
import Badge from "../../common/Badge/Badge";
const home =
  process.env.NODE_ENV === "production"
    ? "/assets/home.jpeg"
    : "/assets/home.jpeg";

const CurrentIssue = () => {
  return (
    <div>
      <h2 className="text-3xl text-start font-serif text-stone-800 mb-6 pb-3 border-b-2 border-stone-300">
        Current Issue
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img
            src={home}
            alt="Current Issue Cover"
            className="w-47 h-60 shadow-lg"
          />
        </div>

        <div className="md:col-span-2">
          <h3 className="text-2xl font-serif text-blue-600 mb-4">
            Jan-Jun 2026 - Volume 1 - Issue 1
          </h3>

          <div className="space-y-2 text-stone-700 mb-6">
            <p>
              <strong>Editor-in-Chief:</strong> Dr. Rajiv Ratan Singh Yadav
            </p>
            {/* <p>
              <strong>ISSN:</strong> N/A
            </p>
            <p>
              <strong>Online ISSN:</strong> N/A
            </p> */}
            <p>
              <strong>Frequency:</strong> 2 issues
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentIssue;
