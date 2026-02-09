import React from "react";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  label,
  error,
  className = "",
  required = false,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 
            border border-gray-300 rounded-lg outline-none
           
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
            ${className}
          `}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
