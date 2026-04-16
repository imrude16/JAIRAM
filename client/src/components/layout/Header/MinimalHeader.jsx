import React from "react";
import { useNavigate } from "react-router-dom";
const logo =
  process.env.NODE_ENV === "production"
    ? "/assets/Logo.jpg"
    : "/assets/Logo.jpg";

const MinimalHeader = () => {
const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm ">
      <div className="w-full px-6 h-16 flex items-center">
        
        {/* Logo + Text */}
        <div className="flex items-center gap-3 ml-6 md:ml-16">
          
          {/* Logo */}
         <div
  onClick={() => navigate("/")}
  className="flex items-center gap-3 ml-6 md:ml-16 cursor-pointer hover:opacity-80 transition"
>
  <img
    src={logo}
    alt="JAIRAM Logo"
    className="h-9 w-auto object-contain"
  />

  <div className="leading-tight">
    <p className="text-sm font-bold text-[#0f3460]">
      JAIRAM
    </p>
    <p className="text-[10px] text-gray-400 tracking-wider uppercase">
      Manuscript Portal
    </p>
  </div>
</div>

        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;