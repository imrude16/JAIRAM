import React from "react";
const logo =
  process.env.NODE_ENV === "production"
    ? "/assets/Logo.jpg"
    : "/assets/Logo.jpg";

const MinimalHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Logo */}
          <img
            src={logo}
            alt="Journal Logo"
            className="
              w-24 h-auto
              sm:w-28
              md:w-32
              object-contain
              sm:ml-6
              md:ml-16
            "
          />

          {/* Text */}
          <div
            className="
              flex flex-col
              justify-center
              text-center sm:text-left
              sm:mt-2
            "
            style={{
              fontFamily:
                'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              fontWeight: 400,
            }}
          >
            <h1
              className="
                    text-2xl sm:text-3xl md:text-3xl
                    font-normal text-gray-900
                    leading-tight
                    whitespace-normal
                    sm:whitespace-nowrap
                    mt-7"
            >
              Journal of Advanced & Integrated Research in Acute Medicine
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
