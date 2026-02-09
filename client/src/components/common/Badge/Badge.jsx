import React from "react";

const Badge = ({ text, variant = "blue", size = "md" }) => {
  const variants = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
    orange: "bg-orange-100 text-orange-800",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <span
      className={`inline-block font-semibold rounded ${variants[variant]} ${sizes[size]}`}
    >
      {text}
    </span>
  );
};

export default Badge;
