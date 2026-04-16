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
      <h2 className="text-2xl text-start font-serif text-stone-800 mb-4 pb-3 border-b border-stone-300">
        Current Issue
      </h2>

      <div className="flex flex-row items-start gap-8">
        {/* Cover Image */}
        <div className="shrink-0 border border-stone-200 shadow-md rounded-sm overflow-hidden">
          <img
            src={home}
            alt="Current Issue Cover"
            className="w-40 h-auto block"
          />
        </div>

        {/* Issue Details */}
        <div className="flex flex-col justify-start pt-1">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 leading-snug">
            Jan–Jun 2026 &nbsp;|&nbsp; Volume 1 &nbsp;|&nbsp; Issue 1
          </h3>

          <div className="space-y-2 text-sm text-stone-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-stone-900 min-w-fit">Editor-in-Chief:</span>
              <span>Dr. Rajiv Ratan Singh Yadav</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-stone-900 min-w-fit">Frequency:</span>
              <span>2 issues</span>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};
export default CurrentIssue;
