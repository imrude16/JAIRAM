import React, { memo } from "react";

const Button = memo(
  ({
    children,
    variant = "primary",
    size = "md",
    onClick,
    className = "",
    icon: Icon,
    type = "button",
    disabled = false,
  }) => {
    const baseStyles =
      "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";

    const variants = {
      default: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500",
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "bg-gray-300 text-gray-900 hover:bg-gray-400 focus:ring-gray-400",
      outline:
        "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      xl: "px-8 py-4 text-xl",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed";

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
          disabled ? disabledStyles : ""
        } ${className}`}
      >
        {Icon && (
          <Icon
            className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} ${
              children ? "mr-2" : ""
            }`}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
