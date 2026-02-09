import React from "react";

const Card = ({ children, className = "", hover = false, padding = "md" }) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded shadow ${
        hover ? "hover:shadow-lg transition-shadow duration-300" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
