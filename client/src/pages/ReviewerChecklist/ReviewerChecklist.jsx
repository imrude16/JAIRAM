import React, { useState, useRef } from "react";
import {
  Upload,
  Send,
  CheckCircle,
  FileText,
  AlertCircle,
  Shield,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Eye,
  Save,
  ClipboardList,
  Star,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: "#0f3460",
  primaryLight: "#e8eef6",
  primaryMid: "#1a4a7a",
  secondary: "#0e7490",
  secondaryLight: "#e0f2fe",
  border: "#c8d5e4",
  surface: "#f7f9fc",
  muted: "#4a5e72",
};

// ─── Reusable: Field Label ────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-800 mb-2">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// ─── Reusable: Error Message ──────────────────────────────────────────────────
const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

// ─── Reusable: Section Card ───────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, teal = false, children }) => (
  <div className="bg-white rounded-2xl border border-[#c8d5e4] overflow-hidden shadow-sm mb-5">
    <div
      className="flex items-center gap-3 px-6 py-4"
      style={{
        background: teal
          ? "linear-gradient(135deg,#0e7490,#0891b2)"
          : "linear-gradient(135deg,#0f3460,#1a4a7a)",
      }}
    >
      {Icon && <Icon className="w-4 h-4 text-white shrink-0" />}
      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
        {title}
      </h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Reusable: Sub-section Header ────────────────────────────────────────────
const SubHead = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#eef0f3]">
    <span className="w-7 h-7 rounded-full bg-[#e8eef6] text-[#0f3460] text-xs font-bold flex items-center justify-center shrink-0">
      {number}
    </span>
    <span className="text-sm font-bold text-[#0f3460]">{title}</span>
  </div>
);

// ─── Reusable: Radio Table Row ────────────────────────────────────────────────
const RadioTableRow = ({ label, name, value, options, onChange, hasError }) => (
  <tr
    className={`border-b border-[#eef0f3] last:border-0 transition-colors ${
      hasError ? "bg-red-50 border-l-4 border-l-red-400" : "hover:bg-[#f7f9fc]"
    }`}
  >
    <td className="px-4 py-3 text-sm text-gray-700 text-left">
      {label}
      {hasError && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Required
        </p>
      )}
    </td>
    {options.map((opt) => (
      <td key={opt} className="px-4 py-3 text-center">
        <input
          type="radio"
          name={name}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          className="w-4 h-4 cursor-pointer"
          style={{ accentColor: THEME.primary }}
        />
      </td>
    ))}
  </tr>
);

// ─── Reusable: Radio Table ────────────────────────────────────────────────────
const RadioTable = ({ criteria, stateObj, onChange, options, error, attempted }) => (
  <div className="mb-6 overflow-x-auto">
    <table className="w-full border border-[#c8d5e4] rounded-xl overflow-hidden text-sm">
      <thead>
        <tr className="bg-[#f7f9fc] border-b border-[#c8d5e4]">
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            Criteria
          </th>
          {options.map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {criteria.map(([key, label]) => (
          <RadioTableRow
            key={key}
            label={label}
            name={`rt_${key}`}
            value={stateObj[key]}
            options={options}
            onChange={(val) => onChange(key, val)}
            hasError={attempted && !stateObj[key]}
          />
        ))}
      </tbody>
    </table>
    {error && (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 font-medium">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Reusable: Checkbox Item ──────────────────────────────────────────────────
const CheckItem = ({ label, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group py-2 px-3 rounded-xl hover:bg-[#f7f9fc] transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
      style={{ accentColor: THEME.primary }}
    />
    <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
  </label>
);

// ─── Reusable: File Upload Box ────────────────────────────────────────────────
const FileUploadBox = ({ label, required, description, file, onFile, onRemove, error }) => {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(doc|docx)$/i)) {
      alert("Only Word documents (.doc, .docx) are accepted.");
      return;
    }
    onFile(f);
  };

  const fmtSize = (b) => {
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  };

  if (file) {
    return (
      <div>
        <div className="border-2 border-[#a0d4e8] bg-[#e0f2fe] rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-white border border-[#a0d4e8] rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#0e7490]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{fmtSize(file.size)} · Word Document · Uploaded</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = URL.createObjectURL(file);
                window.open(url, "_blank");
                setTimeout(() => URL.revokeObjectURL(url), 5000);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#b8cfe0] text-[#0f3460] text-xs font-bold rounded-lg hover:bg-[#e8eef6] transition"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Change
              <input
                type="file"
                accept=".doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl px-8 py-10 text-center cursor-pointer transition-all ${
          drag
            ? "border-[#0f3460] bg-[#e8eef6]"
            : error
            ? "border-red-400 bg-red-50"
            : "border-[#c8d5e4] hover:border-[#0f3460] hover:bg-[#e8eef6]/30"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#e8eef6] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-[#0f3460]" />
        </div>
        <p className="text-sm font-bold text-gray-600 mb-1">Drag & drop your file here</p>
        <p className="text-xs text-gray-400 mb-5">{description || "Word document only (.doc, .docx)"}</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-sm transition"
          style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)" }}
        >
          <FileText className="w-4 h-4" /> Browse File
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".doc,.docx"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <ErrorMsg msg={error} />
    </div>
  );
};

// ─── Nav Buttons ──────────────────────────────────────────────────────────────
const NavBar = ({ page, onBack, onNext, onSubmit, loading }) => (
  <div
    className="flex items-center justify-between rounded-2xl px-6 py-5 mt-6 border border-[#c8d5e4]"
    style={{ background: "linear-gradient(135deg,#eef4fb,#eef4fb)" }}
  >
    <p className="text-xs font-semibold text-[#4a5e72]">
      {page === 1 ? "All fields on this page are required" : "Step 2 of 2 — please complete all fields"}
    </p>
    <div className="flex items-center gap-3">
      {page === 2 && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[#0f3460] text-[#0f3460] bg-white hover:bg-[#e8eef6] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      {page === 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 transition"
          style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)" }}
        >
          <Save className="w-4 h-4" /> Save & Continue <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#0e7490,#0891b2)" }}
        >
          <Send className="w-4 h-4" /> Submit Review
        </button>
      )}
    </div>
  </div>
);

// ─── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ onReset }) => (
  <div className="bg-white rounded-3xl border border-[#c8d5e4] shadow-sm p-16 text-center">
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ background: "linear-gradient(135deg,#e0f2fe,#a0d4e8)" }}
    >
      <CheckCircle className="w-14 h-14 text-[#0e7490]" />
    </div>
    <h2 className="text-2xl font-black text-gray-900 mb-3">Review Submitted Successfully!</h2>
    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
      Thank you for your thorough review. The JAIRAM editorial team will process your submission and notify the authors shortly.
    </p>
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border-2 border-[#0f3460] text-[#0f3460] bg-white hover:bg-[#e8eef6] transition"
    >
      Start New Review
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ReviewerChecklist = () => {
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState({});

  // Page 1 state
  const [declaration, setDeclaration] = useState({
    noConflict: false,
    confidentiality: false,
    expertise: false,
    compliance: false,
  });
  const [scopeRatings, setScopeRatings] = useState({ relevance: "", novelty: "", significance: "" });
  const [methodRatings, setMethodRatings] = useState({
    objectives: "", studyDesign: "", ethicalApproval: "", statisticalAnalysis: "",
  });
  const [resultsRatings, setResultsRatings] = useState({
    dataClarity: "", tablesAccurate: "", discussionLogical: "", conclusionsSupported: "",
  });
  const [ethicsRatings, setEthicsRatings] = useState({ dataFabrication: "", citation: "", coiFunding: "" });
  const [language, setLanguage] = useState({ clearProfessional: false, minorEditing: false, majorRevision: false });

  // Page 2 state
  const [authorComments, setAuthorComments] = useState("");
  const [editorComments, setEditorComments] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [files, setFiles] = useState({ revised: null, response: null });

  // ── Progress ──
  const totalFields =
    4 + // declaration
    Object.keys(scopeRatings).length +
    Object.keys(methodRatings).length +
    Object.keys(resultsRatings).length +
    Object.keys(ethicsRatings).length +
    1; // language (any one)

  const doneFields =
    Object.values(declaration).filter(Boolean).length +
    Object.values(scopeRatings).filter(Boolean).length +
    Object.values(methodRatings).filter(Boolean).length +
    Object.values(resultsRatings).filter(Boolean).length +
    Object.values(ethicsRatings).filter(Boolean).length +
    (Object.values(language).some(Boolean) ? 1 : 0);

  const progress = Math.round((doneFields / totalFields) * 100);

  // ── Validate Page 1 ──
  const validatePage1 = () => {
    const e = {};
    if (!Object.values(declaration).every(Boolean))
      e.declaration = "All four declarations must be confirmed.";
    if (Object.values(scopeRatings).some((v) => !v))
      e.scope = "Please rate all criteria in Scope & Originality.";
    if (Object.values(methodRatings).some((v) => !v))
      e.methodology = "Please rate all criteria in Methodological Rigor.";
    if (Object.values(resultsRatings).some((v) => !v))
      e.results = "Please rate all criteria in Results & Interpretation.";
    if (Object.values(ethicsRatings).some((v) => !v))
      e.ethics = "Please complete all Publication Ethics items.";
    if (!Object.values(language).some(Boolean))
      e.language = "Please select at least one language option.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Validate Page 2 ──
  const validatePage2 = () => {
    const e = {};
    if (!authorComments.trim()) e.authorComments = "Comments for Author are required.";
    if (!editorComments.trim()) e.editorComments = "Confidential letter for Editor is required.";
    if (!recommendation) e.recommendation = "Please select a recommendation.";
    if (!files.revised) e.revised = "Revised Manuscript is required.";
    if (!files.response) e.response = "Response to Editor's Comments is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveAndContinue = () => {
    setAttempted(true);
    if (validatePage1()) {
      setAttempted(false);
      setErrors({});
      setPage(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    if (validatePage2()) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setPage(1);
    setSubmitted(false);
    setAttempted(false);
    setErrors({});
    setDeclaration({ noConflict: false, confidentiality: false, expertise: false, compliance: false });
    setScopeRatings({ relevance: "", novelty: "", significance: "" });
    setMethodRatings({ objectives: "", studyDesign: "", ethicalApproval: "", statisticalAnalysis: "" });
    setResultsRatings({ dataClarity: "", tablesAccurate: "", discussionLogical: "", conclusionsSupported: "" });
    setEthicsRatings({ dataFabrication: "", citation: "", coiFunding: "" });
    setLanguage({ clearProfessional: false, minorEditing: false, majorRevision: false });
    setAuthorComments("");
    setEditorComments("");
    setRecommendation("");
    setFiles({ revised: null, response: null });
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(160deg,#eef4fb 0%,#f7f9fc 45%,#e8f6fb 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <SuccessScreen onReset={handleReset} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(160deg,#eef4fb 0%,#f7f9fc 45%,#e8f6fb 100%)" }}>
      {/* Top accent bar */}
      <div className="h-1.5 fixed top-0 left-0 right-0 z-50" style={{ background: "linear-gradient(90deg,#0f3460,#92701a60,#0e7490)" }} />

      <div className="max-w-3xl mx-auto pt-2">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl border border-[#c8d5e4] shadow-sm px-8 py-7 mb-6">
          <div className="inline-flex items-center gap-2 bg-[#e8eef6] border border-[#b8cfe0] rounded-xl px-4 py-2 text-xs font-bold text-[#0f3460] uppercase tracking-widest mb-4">
            <Shield className="w-3.5 h-3.5" />
            Journal of Advanced & Integrated Research in Acute Medicine
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Official Peer Review{" "}
            <span style={{ color: THEME.primary }}>Evaluation Checklist</span>
          </h1>
          <p className="text-sm text-[#4a5e72] leading-relaxed mb-5">
            Complete all sections carefully. Fields marked{" "}
            <strong className="text-red-500">*</strong> are mandatory.
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-5">
            {["Evaluation Checklist", "Comments & Submission"].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                    i + 1 === page
                      ? "bg-[#0f3460] border-[#0f3460] text-white"
                      : i + 1 < page
                      ? "bg-[#0e7490] border-[#0e7490] text-white"
                      : "bg-white border-[#c8d5e4] text-gray-400"
                  }`}
                >
                  {i + 1 < page ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-bold ${
                    i + 1 === page ? "text-[#0f3460]" : i + 1 < page ? "text-[#0e7490]" : "text-gray-400"
                  }`}
                >
                  {s}
                </span>
                {i === 0 && <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />}
              </div>
            ))}
          </div>

          {/* Progress bar (page 1 only) */}
          {page === 1 && (
            <div className="flex items-center gap-3 pt-5 border-t border-[#eef0f3]">
              <span className="text-xs font-bold text-[#4a5e72] uppercase tracking-wider whitespace-nowrap">
                Completion
              </span>
              <div className="flex-1 h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background:
                      progress === 100
                        ? "linear-gradient(90deg,#0e7490,#0891b2)"
                        : "linear-gradient(90deg,#0f3460,#1a4a7a)",
                  }}
                />
              </div>
              <span
                className={`text-xs font-bold whitespace-nowrap ${
                  progress === 100 ? "text-[#0e7490]" : "text-[#0f3460]"
                }`}
              >
                {doneFields} / {totalFields} {progress === 100 ? "✓" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════
            PAGE 1
        ══════════════════════════════════════════════════ */}
        {page === 1 && (
          <>
            {/* Section I: Reviewer Declaration */}
            <SectionCard title="Reviewer Declaration *" icon={Shield}>
              <p className="text-sm text-[#4a5e72] mb-4">
                Please confirm all of the following before proceeding:
              </p>
              {errors.declaration && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{errors.declaration}</p>
                </div>
              )}
              <div className="space-y-1">
                {[
                  ["noConflict", "I have no conflict of interest with this manuscript."],
                  ["confidentiality", "I will maintain strict confidentiality throughout the review process."],
                  ["expertise", "I possess appropriate subject expertise to evaluate this manuscript."],
                  ["compliance", "This review is objective, constructive, and compliant with COPE & ICMJE standards."],
                ].map(([key, label]) => (
                  <CheckItem
                    key={key}
                    label={label}
                    checked={declaration[key]}
                    onChange={(val) => {
                      setDeclaration((p) => ({ ...p, [key]: val }));
                      if (errors.declaration) setErrors((p) => ({ ...p, declaration: "" }));
                    }}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Section II: Scientific Merit */}
            <SectionCard title="Scientific Merit & Quality Assessment *" icon={Star}>
              <SubHead number="1" title="Scope & Originality" />
              <RadioTable
                criteria={[
                  ["relevance", "Relevance to JAIRAM scope"],
                  ["novelty", "Novelty / Contribution"],
                  ["significance", "Scientific significance"],
                ]}
                stateObj={scopeRatings}
                onChange={(key, val) => {
                  setScopeRatings((p) => ({ ...p, [key]: val }));
                  if (errors.scope) setErrors((p) => ({ ...p, scope: "" }));
                }}
                options={["Excellent", "Good", "Fair", "Poor"]}
                error={errors.scope}
                attempted={attempted}
              />

              <SubHead number="2" title="Methodological Rigor" />
              <RadioTable
                criteria={[
                  ["objectives", "Clear objectives & background"],
                  ["studyDesign", "Study design & methodology appropriate"],
                  ["ethicalApproval", "Ethical approval / Consent documented"],
                  ["statisticalAnalysis", "Statistical analysis appropriate"],
                ]}
                stateObj={methodRatings}
                onChange={(key, val) => {
                  setMethodRatings((p) => ({ ...p, [key]: val }));
                  if (errors.methodology) setErrors((p) => ({ ...p, methodology: "" }));
                }}
                options={["Adequate", "Needs Revision", "Inadequate"]}
                error={errors.methodology}
                attempted={attempted}
              />

              <SubHead number="3" title="Results & Interpretation" />
              <RadioTable
                criteria={[
                  ["dataClarity", "Data clarity & organization"],
                  ["tablesAccurate", "Tables/Figures accurate & relevant"],
                  ["discussionLogical", "Discussion logical & evidence-based"],
                  ["conclusionsSupported", "Conclusions supported by data"],
                ]}
                stateObj={resultsRatings}
                onChange={(key, val) => {
                  setResultsRatings((p) => ({ ...p, [key]: val }));
                  if (errors.results) setErrors((p) => ({ ...p, results: "" }));
                }}
                options={["Adequate", "Needs Revision", "Inadequate"]}
                error={errors.results}
                attempted={attempted}
              />
            </SectionCard>

            {/* Section III: Publication Ethics */}
            <SectionCard title="Publication Ethics & Compliance *" icon={Shield}>
              <RadioTable
                criteria={[
                  ["dataFabrication", "Data fabrication/manipulation concerns"],
                  ["citation", "Proper citation & referencing"],
                  ["coiFunding", "COI & Funding disclosure provided"],
                ]}
                stateObj={ethicsRatings}
                onChange={(key, val) => {
                  setEthicsRatings((p) => ({ ...p, [key]: val }));
                  if (errors.ethics) setErrors((p) => ({ ...p, ethics: "" }));
                }}
                options={["Yes", "No", "Concern"]}
                error={errors.ethics}
                attempted={attempted}
              />
            </SectionCard>

            {/* Section IV: Language & Presentation */}
            <SectionCard title="Language & Presentation *" icon={MessageSquare}>
              {errors.language && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{errors.language}</p>
                </div>
              )}
              <div className="space-y-1">
                {[
                  ["clearProfessional", "Clear and professional language"],
                  ["minorEditing", "Requires minor language editing "],
                  ["majorRevision", "Requires major language revision"],
                ].map(([key, label]) => (
                  <CheckItem
                    key={key}
                    label={label}
                    checked={language[key]}
                    onChange={(val) => {
                      setLanguage((p) => ({ ...p, [key]: val }));
                      if (errors.language) setErrors((p) => ({ ...p, language: "" }));
                    }}
                  />
                ))}
              </div>
            </SectionCard>

            <NavBar page={1} onNext={handleSaveAndContinue} />
          </>
        )}

        {/* ══════════════════════════════════════════════════
            PAGE 2
        ══════════════════════════════════════════════════ */}
        {page === 2 && (
          <>
            {/* Section V: Reviewer Comments */}
            <SectionCard title="Reviewer Comments *" icon={MessageSquare} teal>
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Comments for Author</FieldLabel>
                  <textarea
                    rows={6}
                    value={authorComments}
                    onChange={(e) => {
                      setAuthorComments(e.target.value);
                      if (errors.authorComments) setErrors((p) => ({ ...p, authorComments: "" }));
                    }}
                    placeholder="Provide constructive, detailed feedback for the author. Include specific suggestions for improvement, strengths of the work, and areas that need attention..."
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all resize-none ${
                      errors.authorComments
                        ? "border-red-300 bg-red-50"
                        : "border-[#c8d5e4] focus:border-[#0e7490] focus:ring-4 focus:ring-[#e0f2fe]"
                    }`}
                    style={{ minHeight: "140px" }}
                  />
                  <ErrorMsg msg={errors.authorComments} />
                </div>
                <div>
                  <FieldLabel required>Confidential Letter for Editor</FieldLabel>
                  <textarea
                    rows={5}
                    value={editorComments}
                    onChange={(e) => {
                      setEditorComments(e.target.value);
                      if (errors.editorComments) setErrors((p) => ({ ...p, editorComments: "" }));
                    }}
                    placeholder="Private comments visible only to the editor. Include any concerns, observations, or recommendations that should not be shared with the author..."
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all resize-none ${
                      errors.editorComments
                        ? "border-red-300 bg-red-50"
                        : "border-[#c8d5e4] focus:border-[#0e7490] focus:ring-4 focus:ring-[#e0f2fe]"
                    }`}
                    style={{ minHeight: "120px" }}
                  />
                  <ErrorMsg msg={errors.editorComments} />
                </div>
              </div>
            </SectionCard>

            {/* Section VI: Reviewer Recommendation */}
            <SectionCard title="Reviewer Recommendation *" icon={ThumbsUp} teal>
              {errors.recommendation && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{errors.recommendation}</p>
                </div>
              )}
              <p className="text-sm text-[#4a5e72] mb-4">
                Select your overall recommendation for this manuscript:
              </p>
              <div className="space-y-2">
                {["Accept", "Minor Revision", "Major Revision", "Reject"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                      recommendation === opt
                        ? "border-[#0e7490] bg-[#e0f2fe]"
                        : "border-[#e2e8f0] bg-white hover:border-[#a0d4e8] hover:bg-[#f0f9ff]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={opt}
                      checked={recommendation === opt}
                      onChange={() => {
                        setRecommendation(opt);
                        if (errors.recommendation) setErrors((p) => ({ ...p, recommendation: "" }));
                      }}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: THEME.secondary }}
                    />
                    <span className={`text-sm font-bold ${recommendation === opt ? "text-[#0e7490]" : "text-gray-700"}`}>
                      {opt}
                    </span>
                    {recommendation === opt && (
                      <CheckCircle className="w-4 h-4 text-[#0e7490] ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* Section VII: File Uploads */}
            <SectionCard title=" File Uploads *" icon={Upload} teal>
              {/* Instructions */}
              <div className="bg-[#e0f2fe] border border-[#a0d4e8] rounded-xl px-5 py-4 mb-6">
                <p className="text-xs font-bold text-[#0c4a6e] mb-1">Upload Instructions</p>
                <p className="text-xs text-[#0e4f6a] leading-relaxed">
                  Both files are mandatory. Only Word documents (.doc, .docx) are accepted.
                  After uploading, use the <strong>Preview</strong>, <strong>Change</strong>, and{" "}
                  <strong>Remove</strong> icons to manage each file.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <FieldLabel required>1. Revised Manuscript</FieldLabel>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload the revised version of the manuscript incorporating all reviewer changes — Word document only.
                  </p>
                  <FileUploadBox
                    file={files.revised}
                    onFile={(f) => {
                      setFiles((p) => ({ ...p, revised: f }));
                      if (errors.revised) setErrors((p) => ({ ...p, revised: "" }));
                    }}
                    onRemove={() => setFiles((p) => ({ ...p, revised: null }))}
                    error={errors.revised}
                    description="Word document only (.doc, .docx)"
                  />
                </div>

                <div>
                  <FieldLabel required>2. Response to Editor's Comments</FieldLabel>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload a point-by-point response addressing each of the editor's comments — Word document only.
                  </p>
                  <FileUploadBox
                    file={files.response}
                    onFile={(f) => {
                      setFiles((p) => ({ ...p, response: f }));
                      if (errors.response) setErrors((p) => ({ ...p, response: "" }));
                    }}
                    onRemove={() => setFiles((p) => ({ ...p, response: null }))}
                    error={errors.response}
                    description="Word document only (.doc, .docx)"
                  />
                </div>
              </div>
            </SectionCard>

            <NavBar page={2} onBack={() => { setErrors({}); setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} onSubmit={handleSubmit} />
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 pb-4">
          JAIRAM — Journal of Advanced & Integrated Research in Acute Medicine · Peer Review System
        </p>
      </div>
    </div>
  );
};

export default ReviewerChecklist;