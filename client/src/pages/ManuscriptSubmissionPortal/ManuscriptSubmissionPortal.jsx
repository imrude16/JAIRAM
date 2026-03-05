import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ManuscriptLoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    {
      value: "author",
      label: "Author",
      icon: "✍️",
      desc: "Submit & track manuscripts",
      active: true,
    },
    {
      value: "editor",
      label: "Editor",
      icon: "📋",
      desc: "Manage editorial workflow",
      active: false,
    },
    {
      value: "technical-editor",
      label: "Technical Editor",
      icon: "🔧",
      desc: "Technical review & formatting",
      active: false,
    },
    {
      value: "reviewer",
      label: "Reviewer",
      icon: "🔍",
      desc: "Peer review manuscripts",
      active: false,
    },
  ];

 const handleContinue = () => {
  if (!selectedRole) return;
  if (selectedRole === "author") {
    navigate("/submit");
    return;
  }
 /* navigate(`/auth/login?role=${selectedRole}`);*/   //rest roles will use the same login page for now, can be changed later to role specific pages if needed
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h2 className="text-2xl font-semibold text-slate-800 text-center mb-1">
          Manuscript Submission Portal
        </h2>
        <p className="text-slate-500 text-sm text-center mb-8">
          Select your role to continue
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() =>role.active && setSelectedRole(role.value)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-lg border-2 text-center transition-all duration-150 ${
                selectedRole === role.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{role.icon}</span>
              <span className="text-sm font-semibold leading-tight">
                {role.label}
              </span>
              <span className="text-xs text-slate-400 leading-tight">
                {role.desc}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-all duration-150 ${
            selectedRole
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ManuscriptLoginPage;
