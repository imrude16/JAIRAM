import React, { useRef } from "react";
import {
  Upload,
  Send,
  CheckCircle,
  FileText,
  AlertCircle,
  BookOpen,
  Tag,
  Shield,
  Loader,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Eye,
  GripVertical,
  Plus,
  UserPlus,
  Save,
  ClipboardList,
  Stethoscope,
  FlaskConical,
  Users,
  BarChart3,
  X,
  Search,
} from "lucide-react";

const THEME = {
  primary: "#1a6b8a",
  primaryLight: "#e8f4f8",
  primaryMid: "#2a8baa",
  secondary: "#2d7d6b",
  secondaryLight: "#e8f5f0",
  accent: "#c06b2d",
  accentLight: "#fdf0e8",
  muted: "#6b7a8d",
  surface: "#f8fafc",
  border: "#d1dde8",
};

const COPYRIGHT_TEXT = `I/we certify that I/we have participated sufficiently in the intellectual content, conception and design of this work or the analysis and interpretation of the data (when applicable), as well as the writing of the manuscript, to take public responsibility for it and have agreed to have my/our name listed as a contributor. I/we believe the manuscript represents valid work. Each author confirms they meet the criteria for authorship as established by the JAIRAM. Neither this manuscript nor one with substantially similar content under my/our authorship has been published or is being considered for publication elsewhere, except as described in the covering letter. I/we certify that all the data collected during the study is presented in this manuscript and no data from the study has been or will be published separately. I/we attest that, if requested by the editors, I/we will provide the data/information or will cooperate fully in obtaining and providing the data/information on which the manuscript is based, for examination by the editors or their assignees. Financial interests, direct or indirect, that exist or may be perceived to exist for individual contributors in connection with the content of this paper have been disclosed in the cover letter. Sources of outside support of the project are named in the cover letter.

I/we hereby transfer(s), assign(s), or otherwise convey(s) all copyright ownership, including any and all rights incidental thereto, exclusively to the Journal, in the event that such work is published by the Journal. The Journal shall own the work, including the right to grant permission to republish the article in whole or in part, with or without fee; the right to produce reprints or reprints and translate into languages other than English for sale or free distribution; and the right to republish the work in a collection of articles in any other mechanical or electronic format.

All persons who have made substantial contributions to the work reported in the manuscript, but who are not contributors, are named in the Acknowledgment and have given me/us their written permission to be named. If I/we do not include an Acknowledgment that means I/we have not received substantial contributions from non-contributors and no contributor has been omitted.

I/we give the rights to the corresponding author to make necessary changes as per the request of the journal, to do the rest of the correspondence on our behalf and he/she will act as the guarantor for the manuscript on our behalf.

The article will be published under the terms of the latest Creative Commons Attribution 4.0 International License(CC BY 4.0), unless the journal notifies the author otherwise in writing. Under this license, it is permissible to download and share the work provided it is properly cited. The work cannot be changed in any way or used commercially without permission from the journal. Authors mandated to distribute their work under the CC BY license can request the appropriate form from the Editorial Office.`;

const CHECKLIST_SECTIONS = [
  {
    title: "Originality & Authorship",
    icon: ClipboardList,
    color: {
      badge: "bg-[#1a6b8a]",
      header: "bg-[#e8f4f8] border-[#b8d9e8]",
      titleColor: "text-[#1a6b8a]",
      rowHighlight: "bg-[#e8f4f8]/60",
      accentColor: "#1a6b8a",
      numFilled: "bg-[#1a6b8a] text-white",
    },
    questions: [
      "The manuscript is original, unpublished, and not under review elsewhere.",
      "The work does not involve plagiarism, data fabrication, falsification, or redundant publication.",
      "All authors meet ICMJE authorship criteria.",
      "All authors have reviewed and approved the final version of the manuscript.",
      "The sequence of authorship has been mutually agreed upon by all authors.",
    ],
  },
  {
    title: "Ethical Approval & Human Research Compliance",
    icon: Stethoscope,
    color: {
      badge: "bg-[#2d7d6b]",
      header: "bg-[#e8f5f0] border-[#b8ddd6]",
      titleColor: "text-[#2d7d6b]",
      rowHighlight: "bg-[#e8f5f0]/60",
      accentColor: "#2d7d6b",
      numFilled: "bg-[#2d7d6b] text-white",
    },
    questions: [
      "Institutional Ethics Committee (IEC)/IRB approval was obtained prior to study initiation.",
      "The Ethics Approval Number is clearly mentioned in the manuscript.",
      "The study was conducted in accordance with the Declaration of Helsinki (latest revision).",
      "Written informed consent was obtained from all participants.",
      "Written consent for publication of identifiable data/images was obtained (where applicable).",
      "The study complies with CPCSEA / ARRIVE / relevant international animal guidelines.",
      "Confidentiality, anonymity, and data protection standards were strictly maintained.",
    ],
  },
  {
    title: "Transparency & Reporting Standards",
    icon: BarChart3,
    color: {
      badge: "bg-[#6b4c8a]",
      header: "bg-[#f0ebf7] border-[#d0bfe8]",
      titleColor: "text-[#6b4c8a]",
      rowHighlight: "bg-[#f0ebf7]/60",
      accentColor: "#6b4c8a",
      numFilled: "bg-[#6b4c8a] text-white",
    },
    questions: [
      "Conflict of Interest statement is clearly disclosed.",
      "Funding sources and financial disclosures are declared.",
      "Data Availability Statement is included.",
      "Statistical analysis methods are appropriately described.",
      "The manuscript adheres to JAIRAM formatting and reporting guidelines (CONSORT/STROBE/PRISMA where applicable).",
    ],
  },
];

const SECTION_OFFSETS = (() => {
  const o = [];
  let off = 0;
  CHECKLIST_SECTIONS.forEach((s) => {
    o.push(off);
    off += s.questions.length;
  });
  return o;
})();
const TOTAL_CHECKLIST = CHECKLIST_SECTIONS.reduce(
  (s, sec) => s + sec.questions.length,
  0,
);

// Mock registered users database
const MOCK_REGISTERED_USERS = [
  { id: 1, title: "Dr.", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@aiims.edu", specialization: "Cardiology", institution: "AIIMS New Delhi", country: "India" },
  { id: 2, title: "Prof.", firstName: "Rajesh", lastName: "Kumar", email: "rajesh.kumar@pgimer.edu.in", specialization: "Oncology", institution: "PGIMER Chandigarh", country: "India" },
  { id: 3, title: "Dr.", firstName: "Anjali", lastName: "Mehta", email: "anjali.mehta@fortishealthcare.com", specialization: "Neurology", institution: "Fortis Hospital", country: "India" },
  { id: 4, title: "Prof.", firstName: "Suresh", lastName: "Patel", email: "s.patel@manipal.edu", specialization: "Pulmonology", institution: "Manipal University", country: "India" },
  { id: 5, title: "Dr.", firstName: "Nandini", lastName: "Rao", email: "nandini.rao@kmc.edu", specialization: "Endocrinology", institution: "Kasturba Medical College", country: "India" },
  { id: 6, title: "Dr.", firstName: "Vikram", lastName: "Singh", email: "vikram.singh@sgpgi.ac.in", specialization: "Gastroenterology", institution: "SGPGI Lucknow", country: "India" },
  { id: 7, title: "Prof.", firstName: "Meera", lastName: "Nair", email: "meera.nair@amrita.edu", specialization: "Rheumatology", institution: "Amrita Institute", country: "India" },
  { id: 8, title: "Dr.", firstName: "Arun", lastName: "Gupta", email: "arun.gupta@mamc.ac.in", specialization: "Hematology", institution: "Maulana Azad Medical College", country: "India" },
];

const onlyNumbers = (e) => {
  if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
  if (!/[0-9]/.test(e.key)) e.preventDefault();
};

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {msg}
    </p>
  ) : null;

const AutoTextarea = ({ label, error, required, rows = 3, ...props }) => {
  const ref = useRef(null);
  return (
    <div className="w-full">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <textarea
        ref={ref}
        rows={rows}
        onInput={() => {
          if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
          }
        }}
        {...props}
        style={{
          overflow: "hidden",
          resize: "none",
          minHeight: `${rows * 1.75}rem`,
        }}
        className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none text-sm ${error ? "border-red-300 bg-red-50" : "border-[#d1dde8] focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8]"}`}
      />
      <ErrorMsg msg={error} />
    </div>
  );
};

const StyledCheckbox = ({ checked, onChange, children }) => (
  <div className="flex items-start gap-3">
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${checked ? "bg-[#1a6b8a] border-[#1a6b8a]" : "border-gray-400 bg-white"}`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
    <span className="text-sm text-gray-700 leading-relaxed text-left">
      {children}
    </span>
  </div>
);

const STEP_ICONS = [ClipboardList, Upload, BookOpen, Users, Shield];
const ProgressSteps = ({ currentStep, steps }) => (
  <div className="relative mb-12">
    <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#d1dde8] mx-16 z-0" />
    <div
      className="absolute top-5 left-0 h-0.5 z-0 transition-all duration-500"
      style={{
        background: "linear-gradient(90deg, #1a6b8a, #2d7d6b)",
        right: `${(1 - currentStep / (steps.length - 1)) * 100}%`,
        maxWidth: `calc(100% - 8rem)`,
      }}
    />
    <div className="relative z-10 flex items-center justify-between">
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[i];
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2"
            style={{ minWidth: 90 }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${done ? "bg-[#2d7d6b] border-[#2d7d6b] shadow-md" : active ? "bg-[#1a6b8a] border-[#1a6b8a] shadow-lg ring-4 ring-[#e8f4f8]" : "bg-white border-[#d1dde8] text-gray-400"}`}
            >
              {done ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Icon
                  className={`w-5 h-5 ${active ? "text-white" : "text-gray-400"}`}
                />
              )}
            </div>
            <span
              className={`text-xs font-semibold text-center leading-snug ${active ? "text-[#1a6b8a]" : done ? "text-[#2d7d6b]" : "text-gray-400"}`}
              style={{ maxWidth: 90 }}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const ChecklistHeading = ({ title, subtitle }) => (
  <div className="mb-10 pb-6 border-b-2 border-[#d1dde8] text-center">
    <div className="flex items-center justify-center gap-3 mb-2">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "#1a6b8a18" }}
      >
        <ClipboardList className="w-5 h-5" style={{ color: "#1a6b8a" }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
  </div>
);

const SectionHeading = ({ icon: Icon, title, subtitle, color = "#1a6b8a" }) => (
  <div className="mb-8 pb-5 border-b-2 border-[#d1dde8] text-center">
    <div className="flex items-center justify-center gap-3 mb-1">
      {Icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {subtitle && (
      <p className="text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

const NavButtons = ({
  currentStep,
  stepsLength,
  onBack,
  onNext,
  onSubmit,
  loading,
}) => (
  <div className="mt-12 pt-8 border-t-2 border-[#d1dde8]">
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-linear-to-r from-[#f0f6fa] to-[#f0f5f0] rounded-2xl px-8 py-5 border border-[#d1dde8]">
      <div></div>
      <div className="flex gap-4">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-[#1a6b8a] text-[#1a6b8a] bg-white hover:bg-[#e8f4f8] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {currentStep < stepsLength - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
          >
            <Save className="w-4 h-4" /> Save & Continue{" "}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md transition-all hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Submitting…" : "Submit Manuscript"}
          </button>
        )}
      </div>
    </div>
  </div>
);

const DeclarationBlock = ({
  section,
  baseIdx,
  checklistAnswers,
  setChecklistAnswers,
  errors,
  checklistSubmitAttempted,
  setChecklistSubmitAttempted,
  setErrors,
}) => {
  const c = section.color;
  const sectionAnswered = section.questions.filter(
    (_, i) => checklistAnswers[baseIdx + i],
  ).length;
  const sectionHasUnanswered =
    checklistSubmitAttempted && sectionAnswered < section.questions.length;
  const Icon = section.icon;
  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all shadow-sm ${sectionHasUnanswered ? "border-red-300" : "border-[#d1dde8]"}`}
    >
      <div
        className={`px-7 py-5 border-b-2 ${c.header} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-9 h-9 rounded-xl ${c.badge} text-white text-sm font-bold flex items-center justify-center shrink-0`}
          >
            <Icon className="w-4 h-4" />
          </span>
          <h3
            className={`text-sm font-bold uppercase tracking-wider ${c.titleColor} text-left`}
          >
            {section.title}
          </h3>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${sectionHasUnanswered ? "bg-red-100 text-red-600" : sectionAnswered === section.questions.length ? "bg-green-100 text-green-700" : "bg-white/80 text-gray-500 border border-gray-200"}`}
        >
          {sectionHasUnanswered && "⚠ "}
          {sectionAnswered}/{section.questions.length} Answered
        </span>
      </div>
      <div
        className="grid items-center bg-gray-50 border-b border-[#d1dde8] px-7 py-3"
        style={{ gridTemplateColumns: "2.5rem 1fr 8rem" }}
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
          No.
        </span>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
          Declaration
        </span>
        <div className="grid grid-cols-3 gap-1">
          {["Yes", "No", "N/A"].map((h) => (
            <span
              key={h}
              className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {section.questions.map((declaration, qIdx) => {
          const flatIdx = baseIdx + qIdx;
          const isAnswered = !!checklistAnswers[flatIdx];
          const isUnanswered = checklistSubmitAttempted && !isAnswered;
          return (
            <div
              key={qIdx}
              className={`grid items-start px-7 py-5 transition-colors ${isAnswered ? c.rowHighlight : isUnanswered ? "bg-red-50" : "bg-white hover:bg-gray-50/50"} ${isUnanswered ? "border-l-4 border-red-400" : ""}`}
              style={{ gridTemplateColumns: "2.5rem 1fr 8rem" }}
            >
              <div className="flex justify-start pt-0.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAnswered ? c.numFilled : isUnanswered ? "bg-red-200 text-red-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {flatIdx + 1}
                </span>
              </div>
              <div className="pr-6">
                <p className="text-sm text-gray-700 leading-relaxed text-left">
                  {declaration}
                </p>
                {isUnanswered && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> This field is
                    required
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {["Yes", "No", "Not Applicable"].map((option) => (
                  <div key={option} className="flex justify-center">
                    <input
                      type="radio"
                      name={`checklist-${flatIdx}`}
                      value={option}
                      checked={checklistAnswers[flatIdx] === option}
                      onChange={() => {
                        const u = [...checklistAnswers];
                        u[flatIdx] = option;
                        setChecklistAnswers(u);
                        if (errors.checklist)
                          setErrors((p) => ({ ...p, checklist: "" }));
                        if (checklistSubmitAttempted && u.every(Boolean))
                          setChecklistSubmitAttempted(false);
                      }}
                      style={{
                        accentColor: c.accentColor,
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FileUploadBox = ({
  label,
  file,
  onChange,
  onDelete,
  accept,
  required,
  description,
  error,
  hint,
}) => {
  const [drag, setDrag] = React.useState(false);
  const inputId = `fu-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      {!file ? (
        <div
          onDragEnter={() => setDrag(true)}
          onDragLeave={() => setDrag(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onChange(f);
          }}
          className={`border-2 border-dashed rounded-2xl px-8 py-10 text-center transition-all ${drag ? "border-[#1a6b8a] bg-[#e8f4f8]" : error ? "border-red-400 bg-red-50" : "border-[#d1dde8] hover:border-[#1a6b8a] hover:bg-[#e8f4f8]/30"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#e8f4f8] flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-[#1a6b8a]" />
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1.5">
            Drag & drop your file here
          </p>
          {hint && <p className="text-xs text-gray-400 mb-5">{hint}</p>}
          <label
            htmlFor={inputId}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 shadow-sm"
            style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
          >
            <FileText className="w-4 h-4" /> Browse File
          </label>
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onChange(e.target.files[0]);
            }}
          />
        </div>
      ) : (
        <div className="border-2 border-[#b8ddd6] bg-[#e8f5f0] rounded-2xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-[#b8ddd6] rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#2d7d6b]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Uploaded
                successfully
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  const u = URL.createObjectURL(file);
                  window.open(u, "_blank");
                  setTimeout(() => URL.revokeObjectURL(u), 1000);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#b8d9e8] text-[#1a6b8a] text-xs font-semibold rounded-lg hover:bg-[#e8f4f8] transition"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <label
                htmlFor={inputId}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Change
              </label>
              <input
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) onChange(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {error && !file && <ErrorMsg msg={error} />}
    </div>
  );
};

const MultiFileUploadBox = ({
  label,
  files,
  onAdd,
  onRemove,
  onReplace,
  accept,
  required,
  description,
  error,
  max,
  hint,
}) => {
  const [drag, setDrag] = React.useState(false);
  const addInputId = `mfu-add-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <FieldLabel required={required}>
        {label}{" "}
        <span className="font-normal text-gray-400 ml-1">(Max {max})</span>
      </FieldLabel>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <div
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onAdd(Array.from(e.dataTransfer.files || []));
        }}
        className={`border-2 border-dashed rounded-2xl px-8 py-10 text-center transition-all ${drag ? "border-[#1a6b8a] bg-[#e8f4f8]" : error && files.length === 0 ? "border-red-400 bg-red-50" : "border-[#d1dde8] hover:border-[#1a6b8a] hover:bg-[#e8f4f8]/30"}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#e8f4f8] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6 text-[#1a6b8a]" />
        </div>
        <p className="text-sm font-semibold text-gray-600 mb-1.5">
          Drag & drop files here
        </p>
        {hint && <p className="text-xs text-gray-400 mb-4">{hint}</p>}
        {files.length < max ? (
          <>
            <label
              htmlFor={addInputId}
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition hover:opacity-90 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #1a6b8a, #2a8baa)",
              }}
            >
              <FileText className="w-4 h-4" /> Browse Files
            </label>
            <input
              id={addInputId}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  onAdd(Array.from(e.target.files));
                  e.target.value = "";
                }
              }}
            />
          </>
        ) : (
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-3 py-1.5 rounded-lg border border-amber-200">
            Maximum {max} files reached
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2.5">
          {files.length} / {max} uploaded
        </p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2.5 mt-4">
          {files.map((f, i) => {
            const changeId = `mfu-chg-${label.replace(/\s+/g, "-")}-${i}`;
            return (
              <div
                key={i}
                className="flex items-center gap-3 border border-[#b8ddd6] bg-[#e8f5f0] rounded-xl px-5 py-3.5"
              >
                <div className="w-9 h-9 bg-white border border-[#b8ddd6] rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#2d7d6b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    title={f.name}
                    className="text-sm font-semibold text-gray-700 truncate"
                  >
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const u = URL.createObjectURL(f);
                    window.open(u, "_blank");
                    setTimeout(() => URL.revokeObjectURL(u), 1000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#b8d9e8] text-[#1a6b8a] text-xs font-semibold rounded-lg hover:bg-[#e8f4f8] transition"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <label
                  htmlFor={changeId}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Change
                </label>
                <input
                  id={changeId}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onReplace(i, e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
      {error && files.length === 0 && <ErrorMsg msg={error} />}
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }) => {
  const idRef = useRef(null);
  if (!isOpen) {
    idRef.current = null;
    return null;
  }
  if (idRef.current === null)
    idRef.current = Math.floor(Math.random() * 90000) + 10000;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full shadow-2xl text-center border border-[#d1dde8]">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg, #e8f5f0, #b8ddd6)" }}
        >
          <CheckCircle className="w-14 h-14 text-[#2d7d6b]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Submission Successful!
        </h3>
        <p className="text-gray-500 mb-7 leading-relaxed">
          Your manuscript has been submitted. A confirmation email will be sent
          to the corresponding author shortly.
        </p>
        <div
          className="rounded-2xl p-5 mb-7 border border-[#b8d9e8]"
          style={{ background: "linear-gradient(135deg, #e8f4f8, #f0f8fc)" }}
        >
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">
            Submission ID
          </p>
          <p className="text-lg font-bold text-[#1a6b8a]">
            JAIRAM-2026-{idRef.current}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-bold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CopyrightModal = ({ isOpen, onClose }) => {
  const [remarks, setRemarks] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);

  if (!isOpen) return null;

  const handleAgree = (checked) => {
    setAgreed(checked);
    if (checked) {
      setTimeout(() => onClose(), 650);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#d1dde8] flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div
          className="flex items-center gap-3 px-8 py-6 rounded-t-3xl shrink-0"
          style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
        >
          <Shield className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-lg font-bold text-white">Copyright Form</h3>
            <p className="text-xs text-white/70 mt-0.5">
              Read and accept to close this form
            </p>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-7 space-y-6">
          <div className="bg-[#f8fafc] border border-[#d1dde8] rounded-2xl p-6 space-y-5">
            {COPYRIGHT_TEXT.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-sm text-gray-700 leading-relaxed text-left"
              >
                {para}
              </p>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
              Remarks{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter any remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#d1dde8] rounded-xl outline-none text-sm focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8] transition-all resize-none"
            />
          </div>
          <div
            className={`border rounded-xl px-6 py-5 transition-all ${agreed ? "bg-[#e8f5f0] border-[#2d7d6b]" : "bg-[#e8f4f8]/50 border-[#b8d9e8]"}`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => handleAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0 accent-[#1a6b8a]"
              />
              <span className="text-sm text-gray-700 leading-relaxed text-left">
                <span className="text-red-500 font-bold">* </span>I have
                reviewed the Copyright Form and agree to the terms and
                conditions.
                {agreed && (
                  <span className="ml-2 text-[#2d7d6b] font-semibold">
                    ✓ Accepted — closing…
                  </span>
                )}
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-500 text-left bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
            <span className="font-semibold text-amber-700">Note:</span> A copy
            of this form will be sent to all co-authors for their agreement.
            This dialog closes automatically upon acceptance.
          </p>
        </div>
        <div className="flex items-center justify-between px-8 py-5 border-t border-[#d1dde8] shrink-0 bg-[#f8fafc] rounded-b-3xl">
          <p className="text-xs text-gray-400">
            Tick the checkbox above to accept and close.
          </p>
          {!agreed && (
            <span className="text-xs font-semibold text-[#1a6b8a] bg-[#e8f4f8] border border-[#b8d9e8] px-3 py-1.5 rounded-lg">
              Awaiting acceptance
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EMPTY_REVIEWER = {
  title: "Dr.",
  firstName: "",
  lastName: "",
  email: "",
  specialization: "",
  institution: "",
  country: "",
};

// Reviewer Search Component
const ReviewerSearchBox = ({ onSelect, existingEmails }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = MOCK_REGISTERED_USERS.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.specialization.toLowerCase().includes(q) ||
        u.institution.toLowerCase().includes(q)
      );
    }).filter((u) => !existingEmails.includes(u.email));
    setResults(filtered);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search by name, email, or specialization…"
          className="w-full pl-10 pr-4 py-3 border-2 border-[#d1dde8] rounded-xl text-sm outline-none focus:border-[#2d7d6b] focus:ring-4 focus:ring-[#e8f5f0] transition-all bg-white"
        />
      </div>
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border-2 border-[#d1dde8] rounded-xl shadow-lg z-20 overflow-hidden max-h-56 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={() => {
                onSelect(user);
                setQuery("");
                setResults([]);
              }}
              className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-[#e8f5f0] transition text-left border-b border-gray-100 last:border-0"
            >
              <div className="w-9 h-9 rounded-full bg-[#2d7d6b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{user.title} {user.firstName} {user.lastName}</p>
                <p className="text-xs text-[#2d7d6b] font-medium">{user.specialization} · {user.institution}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <span className="text-xs bg-[#e8f5f0] text-[#2d7d6b] border border-[#b8ddd6] px-2 py-1 rounded-lg font-semibold shrink-0 mt-1">Add</span>
            </button>
          ))}
        </div>
      )}
      {focused && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border-2 border-[#d1dde8] rounded-xl shadow-lg z-20 px-4 py-3 text-sm text-gray-500">
          No registered users found. You can fill in the details manually below.
        </div>
      )}
    </div>
  );
};

const ReviewerModal = ({ isOpen, onClose, reviewers, setReviewers }) => {
  if (!isOpen) return null;

  const addReviewer = () => {
    if (reviewers.length < 5)
      setReviewers((p) => [...p, { ...EMPTY_REVIEWER }]);
  };

  const removeReviewer = (i) => {
    if (reviewers.length > 1)
      setReviewers((p) => p.filter((_, idx) => idx !== i));
  };

  const updateReviewer = (i, field, value) =>
    setReviewers((p) =>
      p.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const handleSelectFromSearch = (user) => {
    if (reviewers.length >= 5) {
      alert("Maximum 5 reviewers allowed.");
      return;
    }
    const existingEmails = reviewers.map((r) => r.email).filter(Boolean);
    if (existingEmails.includes(user.email)) {
      alert("This reviewer has already been added.");
      return;
    }
    // Find first empty slot or add new
    const emptyIdx = reviewers.findIndex((r) => !r.firstName && !r.email);
    if (emptyIdx !== -1) {
      setReviewers((p) =>
        p.map((r, idx) =>
          idx === emptyIdx
            ? { title: user.title, firstName: user.firstName, lastName: user.lastName, email: user.email, specialization: user.specialization, institution: user.institution, country: user.country }
            : r
        )
      );
    } else if (reviewers.length < 5) {
      setReviewers((p) => [...p, { title: user.title, firstName: user.firstName, lastName: user.lastName, email: user.email, specialization: user.specialization, institution: user.institution, country: user.country }]);
    }
  };

  const existingEmails = reviewers.map((r) => r.email).filter(Boolean);
  const filledCount = reviewers.filter((r) => r.firstName || r.email).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#d1dde8] flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        <div
          className="flex items-center justify-between px-8 py-6 rounded-t-3xl shrink-0"
          style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Reviewer Suggestions
              </h3>
              <p className="text-xs text-white/80">
                Minimum 1 required · Maximum 5 reviewers can be suggested
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/80 bg-white/20 px-3 py-1.5 rounded-lg">
              {filledCount} / 5
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-7 space-y-6">
          {/* Search Box */}
          <div className="border-2 border-[#b8ddd6] bg-[#e8f5f0]/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4 text-[#2d7d6b]" />
              <h4 className="text-sm font-bold text-[#2d7d6b] uppercase tracking-wider">Search Registered Users</h4>
            </div>
            <p className="text-xs text-gray-500">Search by name, email, or specialization to auto-fill reviewer details from our database.</p>
            <ReviewerSearchBox onSelect={handleSelectFromSearch} existingEmails={existingEmails} />
          </div>

          {reviewers.map((reviewer, i) => (
            <div
              key={i}
              className="border-2 border-[#d1dde8] rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-[#e8f5f0] border-b border-[#b8ddd6]">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#2d7d6b] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-[#2d7d6b] uppercase tracking-wider">
                    Reviewer {i + 1}
                  </span>
                  {i === 0 && (
                    <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold ml-1">Required</span>
                  )}
                </div>
                {reviewers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReviewer(i)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Title
                  </label>
                  <select
                    value={reviewer.title}
                    onChange={(e) => updateReviewer(i, "title", e.target.value)}
                    className="w-full border-2 border-[#d1dde8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d7d6b] transition-all bg-white"
                  >
                    {["Dr.", "Prof.", "Mr.", "Ms."].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                {[
                  { key: "firstName", label: "First Name", placeholder: "First name" },
                  { key: "lastName", label: "Last Name", placeholder: "Last name" },
                  { key: "email", label: "Email Address", placeholder: "email@example.com", type: "email" },
                  { key: "specialization", label: "Specialization", placeholder: "e.g. Cardiology, Oncology" },
                  { key: "institution", label: "Institution", placeholder: "Institution / University" },
                ].map(({ key, label, placeholder, type = "text" }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={reviewer[key]}
                      onChange={(e) => updateReviewer(i, key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border-2 border-[#d1dde8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d7d6b] transition-all bg-white"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Country
                  </label>
                  <input
                    type="text"
                    value={reviewer.country}
                    onChange={(e) => updateReviewer(i, "country", e.target.value)}
                    placeholder="Country"
                    className="w-full border-2 border-[#d1dde8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d7d6b] transition-all bg-white"
                  />
                </div>
              </div>
            </div>
          ))}

          {reviewers.length < 5 ? (
            <button
              type="button"
              onClick={addReviewer}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#2d7d6b] text-[#2d7d6b] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e8f5f0] transition"
            >
              <Plus className="w-4 h-4" /> Add Another Reviewer (
              {reviewers.length}/5)
            </button>
          ) : (
            <p className="text-center text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
              Maximum of 5 reviewers can be added.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 py-6 border-t border-[#d1dde8] shrink-0 bg-[#f8fafc] rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
          >
            <CheckCircle className="w-4 h-4" /> Save Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthorForm = ({ draft, setDraft, onAdd, onCancel }) => {
  const fields = [
    { key: "firstName", label: "First Name", type: "text", placeholder: "First name" },
    { key: "lastName", label: "Last Name", type: "text", placeholder: "Last name" },
    { key: "email", label: "Email Address", type: "email", placeholder: "email@example.com" },
    { key: "phone", label: "Phone Number", type: "text", placeholder: "Phone number", numeric: true },
    { key: "department", label: "Department", type: "text", placeholder: "Department" },
    { key: "country", label: "Country", type: "text", placeholder: "Country" },
    { key: "ORCID", label: "ORCID", type: "text", placeholder: "Enter ORCID" },
  ];
  return (
    <div className="border-2 border-[#b8d9e8] bg-[#e8f4f8]/40 rounded-2xl p-7 space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#1a6b8a] flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#1a6b8a] uppercase tracking-wider">
          New Author Details
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div>
          <FieldLabel>Title</FieldLabel>
          <select
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            className="w-full border-2 border-[#d1dde8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a6b8a] transition-all bg-white"
          >
            {["Dr.", "Prof.", "Mr.", "Ms."].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        {fields.map(({ key, label, type, placeholder, numeric }) => (
          <div key={key}>
            <FieldLabel>{label}</FieldLabel>
            <input
              type={type}
              value={draft[key] || ""}
              onKeyDown={numeric ? onlyNumbers : undefined}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  [key]: numeric
                    ? e.target.value.replace(/\D/g, "")
                    : e.target.value,
                }))
              }
              placeholder={placeholder}
              className="w-full border-2 border-[#d1dde8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a6b8a] transition-all bg-white"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-[#d1dde8]">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-7 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-md"
          style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
        >
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>
    </div>
  );
};

const AuthorsTable = ({ authors, setAuthors }) => {
  const dragIdx = useRef(null);
  const [dragOver, setDragOver] = React.useState(null);

  const handleDragStart = (i) => { dragIdx.current = i; };
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (i) => {
    setDragOver(null);
    if (dragIdx.current === null || dragIdx.current === i) return;
    const updated = [...authors];
    const [moved] = updated.splice(dragIdx.current, 1);
    updated.splice(i, 0, moved);
    setAuthors(updated);
    dragIdx.current = null;
  };

  const setCorresponding = (i) =>
    setAuthors(authors.map((a, idx) => ({ ...a, isCorresponding: idx === i })));

  const deleteAuthor = (id) => {
    if (authors.length > 1) setAuthors(authors.filter((a) => a.id !== id));
  };

  if (authors.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#d1dde8] rounded-2xl py-16 text-center bg-[#f8fafc]">
        <p className="text-sm font-semibold text-gray-500">
          No authors added yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {authors.map((author, index) => (
        <div
          key={author.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => { setDragOver(null); dragIdx.current = null; }}
          className={`border-2 rounded-2xl p-6 transition-all cursor-grab active:cursor-grabbing shadow-sm
            ${dragOver === index ? "border-[#1a6b8a] bg-[#e8f4f8]" : "border-[#d1dde8] bg-white hover:bg-[#f8fafc]"}
            ${author.isCorresponding ? "ring-2 ring-[#2d7d6b]" : ""}
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-5 h-5" />
                <span className="w-7 h-7 rounded-full bg-[#1a6b8a] text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {author.title} {author.firstName} {author.lastName}
                </p>
                {author.isCorresponding && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#2d7d6b] bg-[#e8f5f0] border border-[#b8ddd6] px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Corresponding Author
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!author.isCorresponding && (
                <button
                  type="button"
                  onClick={() => setCorresponding(index)}
                  className="text-xs border border-[#1a6b8a] text-[#1a6b8a] px-3 py-1.5 rounded-lg hover:bg-[#1a6b8a] hover:text-white transition"
                >
                  Set Corresponding
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteAuthor(author.id)}
                disabled={authors.length === 1}
                className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Department</p>
              <p className="font-medium">{author.department || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-1">ORCID</p>
              <p className="font-mono text-[#1a6b8a]">{author.ORCID || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Email</p>
              <p className="break-all">{author.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Country / Phone</p>
              <p>{author.country} • {author.phone}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const InfoCard = ({ title, icon: Icon, children, accentColor = "#1a6b8a" }) => (
  <div className="rounded-2xl border-2 border-[#d1dde8] overflow-hidden shadow-sm">
    <div
      className="flex items-center gap-3 px-7 py-5 border-b-2 border-[#d1dde8]"
      style={{ background: `${accentColor}0d` }}
    >
      {Icon && (
        <Icon className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
      )}
      <h3
        className="text-sm font-bold uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* ═══════════════════════════════
   MAIN COMPONENT
═══════════════════════════════ */
const SubmitManuscript = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [checklistSubmitAttempted, setChecklistSubmitAttempted] = React.useState(false);
  const [copeAccepted, setCopeAccepted] = React.useState(false);
  const [icmjeAccepted, setIcmjeAccepted] = React.useState(false);
  const [authorDraft, setAuthorDraft] = React.useState({
    title: "Dr.",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    department: "",
    ORCID: "",
  });
  const [showAuthorForm, setShowAuthorForm] = React.useState(false);
  const [conflictHasConflict, setConflictHasConflict] = React.useState(null);
  const [conflictDetails, setConflictDetails] = React.useState("");
  const [copyrightAgreed, setCopyrightAgreed] = React.useState(false);
  const [previewConfirmed, setPreviewConfirmed] = React.useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = React.useState(false);
  const [showReviewerModal, setShowReviewerModal] = React.useState(false);
  const [reviewers, setReviewers] = React.useState([{ ...EMPTY_REVIEWER }]);
  const [formData, setFormData] = React.useState({
    articleType: "",
    title: "",
    runningTitle: "",
    abstract: "",
    keywords: "",
    totalWordCount: "",
    bwFigures: "",
    colorFigures: "",
    tables: "",
    pages: "",
    trialRegistration: "",
    trialRegistrationDetails: "",
    iecNumber: "",
    iecNumberDetails: "",
    prosperoRegistration: "",
    prosperoRegistrationDetails: "",
  });
  const [checklistAnswers, setChecklistAnswers] = React.useState(
    Array(TOTAL_CHECKLIST).fill(null),
  );
  const [files, setFiles] = React.useState({
    coverLetter: null,
    blindManuscript: null,
    images: [],
    tables: [],
    supplements: null,
  });
  const [authors, setAuthors] = React.useState([]);

  const wordCount = formData.abstract
    ? formData.abstract.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const answeredCount = checklistAnswers.filter(Boolean).length;
  const checklistProgress = (answeredCount / TOTAL_CHECKLIST) * 100;
  const showIEC = ["original", "case_report", "case_series", "editorial"].includes(formData.articleType);
  const showProspero = ["meta", "review"].includes(formData.articleType);
  const showTrial = formData.articleType === "clinical";

  const handleField = (f, v) => {
    setFormData((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  };

  const handleAddAuthor = () => {
    if (!authorDraft.firstName.trim() && !authorDraft.lastName.trim()) return;
    // Never auto-set corresponding — user must do it manually
    setAuthors((p) => [
      ...p,
      { ...authorDraft, id: Date.now(), isCorresponding: false },
    ]);
    setAuthorDraft({
      title: "Dr.",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      department: "",
      ORCID: "",
    });
    setShowAuthorForm(false);
    if (errors.authors) setErrors((p) => ({ ...p, authors: "" }));
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 0) {
      if (!checklistAnswers.every((v) => v !== null))
        e.checklist = "Please answer all checklist questions before proceeding.";
      if (!copeAccepted)
        e.cope = "You must confirm COPE compliance to proceed.";
      if (!icmjeAccepted)
        e.icmje = "You must confirm the authorship & responsibility declaration to proceed.";
    } else if (step === 1) {
      if (!files.coverLetter) e.coverLetter = "Cover letter is required.";
      if (!files.blindManuscript) e.blindManuscript = "Blind manuscript is required.";
      if (!files.images?.length) e.images = "At least one figure is required.";
      if (!files.tables?.length) e.tables = "At least one table is required.";
      if (!files.supplements) e.supplements = "Supplementary file is required.";
    } else if (step === 2) {
      if (!formData.articleType) e.articleType = "Please select article type";
      if (!formData.title) e.title = "Title is required";
      if (!formData.runningTitle) e.runningTitle = "Running title is required";
      const wc = formData.abstract ? formData.abstract.trim().split(/\s+/).length : 0;
      if (wc === 0) e.abstract = "Abstract is required";
      else if (wc > 250) e.abstract = "Abstract must not exceed 250 words";
      if (!formData.keywords) e.keywords = "Keywords are required";
      if (!formData.totalWordCount) e.totalWordCount = "Word count is required";
      if (!formData.bwFigures) e.bwFigures = "Required";
      if (!formData.colorFigures) e.colorFigures = "Required";
      if (!formData.tables) e.statTables = "Required";
      if (!formData.pages) e.pages = "Required";
    } else if (step === 3) {
      if (!authors.length) e.authors = "At least one author is required";
      const ca = authors.find((a) => a.isCorresponding);
      if (!ca)
        e.correspondingAuthor = "Please mark at least one author as corresponding author";
      else if (!ca.email || !/\S+@\S+\.\S+/.test(ca.email))
        e.correspondingAuthor = "Corresponding author must have a valid email address";
    } else if (step === 4) {
      const filledReviewer = reviewers.find((r) => r.firstName || r.email);
      if (!filledReviewer) e.reviewers = "At least one reviewer suggestion is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) setChecklistSubmitAttempted(true);
    if (validateStep(currentStep)) {
      if (currentStep === 0) setChecklistSubmitAttempted(false);
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentStep(0);
      setFormData({
        articleType: "", title: "", runningTitle: "", abstract: "",
        keywords: "", totalWordCount: "", bwFigures: "", colorFigures: "",
        tables: "", pages: "", trialRegistration: "", trialRegistrationDetails: "",
        iecNumber: "", iecNumberDetails: "", prosperoRegistration: "", prosperoRegistrationDetails: "",
      });
      setFiles({ coverLetter: null, blindManuscript: null, images: [], tables: [], supplements: null });
      setCopeAccepted(false);
      setIcmjeAccepted(false);
      setChecklistAnswers(Array(TOTAL_CHECKLIST).fill(null));
      setChecklistSubmitAttempted(false);
      setAuthors([]);
      setConflictHasConflict(null);
      setConflictDetails("");
      setCopyrightAgreed(false);
      setPreviewConfirmed(false);
      setReviewers([{ ...EMPTY_REVIEWER }]);
    }, 3500);
  };

  const handlePreviewManuscript = () => {
    const fileList = (arr) =>
      arr.length ? arr.map((f, i) => `    ${i + 1}. ${f.name}`).join("\n") : "    None";
    const text =
      `JAIRAM JOURNAL — SUBMISSION PREVIEW\n${"═".repeat(52)}\n\nArticle Type : ${formData.articleType || "—"}\nTitle        : ${formData.title || "—"}\nRunning Title: ${formData.runningTitle || "—"}\nKeywords     : ${formData.keywords || "—"}\nWord Count   : ${formData.totalWordCount || "—"}\n\nABSTRACT\n${formData.abstract || "—"}\n(${wordCount}/250 words)\n\nAUTHORS (${authors.length})\n${authors.map((a, i) => `  ${i + 1}. ${a.title} ${a.firstName} ${a.lastName}${a.isCorresponding ? " [CORRESPONDING]" : ""}\n     ${a.email || "no email"} | ${a.department || "no dept"} | ${a.country || "no country"}`).join("\n")}\n\nUPLOADED FILES\n  Cover Letter   : ${files.coverLetter?.name || "Not uploaded"}\n  Manuscript     : ${files.blindManuscript?.name || "Not uploaded"}\n  Figures (${files.images.length}/6):\n${fileList(files.images)}\n  Tables (${files.tables.length}/8):\n${fileList(files.tables)}\n  Supplementary  : ${files.supplements?.name || "Not uploaded"}\n\nCONFLICT OF INTEREST: ${conflictHasConflict || "—"}\n${conflictHasConflict === "Yes" ? `Details: ${conflictDetails || "Not provided"}` : ""}`.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const steps = ["Checklist", "Upload Files", "Basic Info", "Author Details", "Review & Submit"];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #f0f6fa 0%, #f8fafc 45%, #eef5f1 100%)",
      }}
    >
      {/* Top accent bar */}
      
      <div
        className="h-1.5 w-full"
        style={{
          background: "linear-gradient(90deg, #1a6b8a 0%, #2a8baa 30%, #2d7d6b 60%, #3a9d88 100%)",
        }}
      />
     

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-7 py-3.5 shadow-sm border border-[#d1dde8] mb-6">
           
            <FlaskConical className="w-5 h-5 text-[#2d7d6b]" />
            <span className="text-sm font-bold text-[#1a6b8a] uppercase tracking-widest">
              Journal-Of-Advanced-And-Integrated-Research-In-Acute-Medicine
            </span>
            <Stethoscope className="w-5 h-5 text-[#1a6b8a]" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
            Submit Your <span style={{ color: "#1a6b8a" }}>Manuscript</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
            Complete all five steps to submit your manuscript for peer review.
            Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.
          </p>
          <div className="inline-flex items-center gap-2 mt-5 bg-white border border-[#d1dde8] rounded-full px-5 py-2 text-xs font-semibold text-[#1a6b8a]">
            <span className="w-5 h-5 rounded-full bg-[#1a6b8a] text-white flex items-center justify-center text-xs font-bold">
              {currentStep + 1}
            </span>
            of {steps.length} — {steps[currentStep]}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#d1dde8] overflow-hidden">
          <div
            className="h-1.5"
            style={{ background: "linear-gradient(90deg, #1a6b8a, #2d7d6b)" }}
          />
          <div className="px-10 pt-10 pb-12">
            <ProgressSteps currentStep={currentStep} steps={steps} />

            <form onSubmit={(e) => e.preventDefault()}>

              {/* ═══ STEP 0 — CHECKLIST ═══ */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <ChecklistHeading
                    title="Manuscript Submission Declaration Checklist"
                    subtitle="All declarations are mandatory. Please select the appropriate response for each item."
                  />
                  <div className="flex items-center gap-4 rounded-2xl px-6 py-4 border-2 border-[#d1dde8] bg-[#f8fafc]">
                    <span className="text-xs font-bold text-[#1a6b8a] uppercase tracking-wider whitespace-nowrap">
                      Completion
                    </span>
                    <div className="flex-1 h-2.5 bg-[#d1dde8] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${checklistProgress}%`,
                          background: checklistProgress === 100 ? "linear-gradient(90deg, #2d7d6b, #3a9d88)" : "linear-gradient(90deg, #1a6b8a, #2a8baa)",
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${checklistProgress === 100 ? "text-[#2d7d6b]" : "text-[#1a6b8a]"}`}
                    >
                      {answeredCount} / {TOTAL_CHECKLIST} {checklistProgress === 100 && "✓"}
                    </span>
                  </div>

                  {CHECKLIST_SECTIONS.map((section, sIdx) => (
                    <DeclarationBlock
                      key={sIdx}
                      section={section}
                      baseIdx={SECTION_OFFSETS[sIdx]}
                      checklistAnswers={checklistAnswers}
                      setChecklistAnswers={setChecklistAnswers}
                      errors={errors}
                      checklistSubmitAttempted={checklistSubmitAttempted}
                      setChecklistSubmitAttempted={setChecklistSubmitAttempted}
                      setErrors={setErrors}
                    />
                  ))}

                  {errors.checklist && (
                    <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl px-6 py-4">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{errors.checklist}</p>
                    </div>
                  )}

                  {/* COPE */}
                  <div className="rounded-2xl border-2 border-[#d1dde8] overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-7 py-5 bg-[#e8f4f8] border-b-2 border-[#b8d9e8]">
                      <Shield className="w-5 h-5 text-[#1a6b8a] shrink-0" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a6b8a] text-left">
                        COPE Publication Ethics Compliance Certification
                      </h3>
                    </div>
                    <div className="px-7 py-6 space-y-4 bg-white">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={copeAccepted}
                          onChange={(e) => {
                            setCopeAccepted(e.target.checked);
                            if (errors.cope) setErrors((p) => ({ ...p, cope: "" }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0 accent-[#1a6b8a]"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed text-left">
                          I confirm full compliance with COPE standards.{" "}
                          <span className="text-red-500 font-bold">*</span>
                        </span>
                      </label>
                      {copeAccepted && (
                        <div className="ml-7 bg-[#f0f7fb] border border-[#b8d9e8] rounded-xl px-6 py-5">
                          <p className="text-xs font-bold text-[#1a6b8a] uppercase tracking-widest mb-3 text-left">
                            I hereby certify that:
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed text-left">
                            The submitted manuscript complies with the ethical
                            principles and best practice guidelines of the
                            Committee on Publication Ethics (COPE). The work
                            does not involve plagiarism, duplicate submission,
                            image manipulation, data fabrication, or
                            falsification. All conflicts of interest and funding
                            disclosures have been transparently declared. In the
                            event of post-publication concerns, the authors
                            agree to cooperate fully with editorial
                            investigations as per COPE guidelines. The authors
                            acknowledge that any proven violation of publication
                            ethics may result in manuscript rejection,
                            retraction, or notification to relevant authorities.
                          </p>
                        </div>
                      )}
                      {errors.cope && <ErrorMsg msg={errors.cope} />}
                    </div>
                  </div>

                  {/* ICMJE */}
                  <div className="rounded-2xl border-2 border-[#d1dde8] overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-7 py-5 bg-[#e8f5f0] border-b-2 border-[#b8ddd6]">
                      <FileText className="w-5 h-5 text-[#2d7d6b] shrink-0" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#2d7d6b] text-left">
                        Authorship &amp; Responsibility Declaration
                      </h3>
                    </div>
                    <div className="px-7 py-6 space-y-4 bg-white">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={icmjeAccepted}
                          onChange={(e) => {
                            setIcmjeAccepted(e.target.checked);
                            if (errors.icmje) setErrors((p) => ({ ...p, icmje: "" }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0 accent-[#2d7d6b]"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed text-left">
                          I confirm the authorship and responsibility
                          declaration on behalf of all contributors.{" "}
                          <span className="text-red-500 font-bold">*</span>
                        </span>
                      </label>
                      {icmjeAccepted && (
                        <div className="ml-7 bg-[#f0f9f6] border border-[#b8ddd6] rounded-xl px-6 py-5">
                          <p className="text-xs font-bold text-[#2d7d6b] uppercase tracking-widest mb-3 text-left">
                            On behalf of all contributors, I confirm that:
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed text-left">
                            All authors have made sufficient intellectual
                            contributions to this work, including the concept,
                            design, data analysis and interpretation, and the
                            writing of the manuscript — taking public
                            responsibility for the content and agreeing to be
                            listed as contributors. We agree that if the editors
                            request any data or information related to this
                            manuscript, we will provide it or fully cooperate.
                            Any financial or personal interests that could
                            influence the content have been disclosed in the
                            cover letter. We hereby transfer and assign all
                            copyright ownership to the Journal, if the
                            manuscript is accepted and published. The Journal
                            will have the right to republish, produce reprints,
                            or produce translated versions of the work. All
                            contributors authorise me, as the corresponding
                            author, to make required changes, handle all
                            communication with the journal, and act as the
                            guarantor of this manuscript. We confirm that all
                            non-author contributors have been acknowledged and
                            have given written permission to be named.
                          </p>
                        </div>
                      )}
                      {errors.icmje && <ErrorMsg msg={errors.icmje} />}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ STEP 1 — UPLOAD FILES ═══ */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <SectionHeading
                    icon={Upload}
                    title="Upload Documents"
                    subtitle="All five sections are mandatory. Upload correct file types as specified."
                  />
                  <div className="rounded-2xl overflow-hidden border border-[#b8d9e8] shadow-sm">
                    <div
                      className="flex items-center gap-2 px-6 py-4 text-white"
                      style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">
                        Upload Instructions
                      </h3>
                    </div>
                    <div className="px-7 py-6 space-y-3 bg-[#e8f4f8]/30">
                      {[
                        "Upload files by clicking the Browse Files button or simply drag and drop them. Only one file can be uploaded at a time. Once uploaded, you can preview them using the eye icon. Choose the correct File Type for each file from the dropdown.",
                        "You can upload only one Cover Letter and only one Blind Manuscript file. Make sure you upload only the latest version under these categories.",
                        "Set the sequence of files using the FILE ORDER column. By default, Cover Letter is 1 and Blind Manuscript is 2. Use numbers from 3 onwards for other files. Only the main manuscript files will be merged into the final Preview PDF; figures, tables, and supplementary files will not be included.",
                        "Use the Change button to replace a file, and Remove to delete it. Once all files are uploaded correctly, click Save and Continue to proceed to the next step.",
                        "Figures and Tables accept Word (.doc, .docx) or image files (.jpg, .jpeg, .png).",
                        "Cover Letter, Blind Manuscript, and Supplementary Files accept Word documents only.",
                      ].map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-left">
                          <span
                            className="shrink-0 w-5 h-5 mt-0.5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                            style={{ background: "#1a6b8a" }}
                          >
                            {i + 1}
                          </span>
                          <p className="text-sm text-[#1a4a5a] leading-relaxed text-left">{pt}</p>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 mt-4 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-amber-800 text-left">
                          Do NOT upload revised manuscript files under a new slot. Use the Change button on the existing entry.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-8">
                    <FileUploadBox
                      label="Cover Letter"
                      file={files.coverLetter}
                      onChange={(f) => {
                        if (!f.name.match(/\.(doc|docx)$/i)) { alert("Only Word files (.doc, .docx) accepted."); return; }
                        setFiles((p) => ({ ...p, coverLetter: f }));
                        if (errors.coverLetter) setErrors((p) => ({ ...p, coverLetter: "" }));
                      }}
                      onDelete={() => setFiles((p) => ({ ...p, coverLetter: null }))}
                      accept=".doc,.docx"
                      required
                      description="Accepted: .doc, .docx"
                      hint="Word document only"
                      error={errors.coverLetter}
                    />
                    <FileUploadBox
                      label="Blind Manuscript File"
                      file={files.blindManuscript}
                      onChange={(f) => {
                        if (!f.name.match(/\.(doc|docx)$/i)) { alert("Only Word files (.doc, .docx) accepted."); return; }
                        setFiles((p) => ({ ...p, blindManuscript: f }));
                        if (errors.blindManuscript) setErrors((p) => ({ ...p, blindManuscript: "" }));
                      }}
                      onDelete={() => setFiles((p) => ({ ...p, blindManuscript: null }))}
                      accept=".doc,.docx"
                      required
                      description="Accepted: .doc, .docx — Max 25 MB"
                      hint="Word document only · Max 25 MB"
                      error={errors.blindManuscript}
                    />
                    <MultiFileUploadBox
                      label="Figures"
                      files={files.images}
                      max={6}
                      onAdd={(sel) => {
                        const valid = sel.filter((f) => f.name.match(/\.(doc|docx|jpg|jpeg|png)$/i));
                        if (valid.length !== sel.length) alert("Only Word and image files allowed.");
                        if (files.images.length >= 6) { alert("Maximum 6 figures allowed."); return; }
                        const toAdd = valid.slice(0, 6 - files.images.length);
                        if (toAdd.length) {
                          setFiles((p) => ({ ...p, images: [...p.images, ...toAdd] }));
                          if (errors.images) setErrors((p) => ({ ...p, images: "" }));
                        }
                      }}
                      onRemove={(i) => setFiles((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                      onReplace={(i, f) => {
                        if (!f.name.match(/\.(doc|docx|jpg|jpeg|png)$/i)) { alert("Only Word and image files allowed."); return; }
                        setFiles((p) => { const imgs = [...p.images]; imgs[i] = f; return { ...p, images: imgs }; });
                      }}
                      accept=".doc,.docx,.jpg,.jpeg,.png"
                      required
                      description="Accepted: .doc, .docx, .jpg, .jpeg, .png"
                      hint="Word or image files"
                      error={errors.images}
                    />
                    <MultiFileUploadBox
                      label="Tables"
                      files={files.tables}
                      max={8}
                      onAdd={(sel) => {
                        const valid = sel.filter((f) => f.name.match(/\.(doc|docx|jpg|jpeg|png)$/i));
                        if (valid.length !== sel.length) alert("Only Word and image files allowed.");
                        if ((files.tables?.length || 0) >= 8) { alert("Maximum 8 tables allowed."); return; }
                        const toAdd = valid.slice(0, 8 - (files.tables?.length || 0));
                        if (toAdd.length) {
                          setFiles((p) => ({ ...p, tables: [...(p.tables || []), ...toAdd] }));
                          if (errors.tables) setErrors((p) => ({ ...p, tables: "" }));
                        }
                      }}
                      onRemove={(i) => setFiles((p) => ({ ...p, tables: p.tables.filter((_, idx) => idx !== i) }))}
                      onReplace={(i, f) => {
                        if (!f.name.match(/\.(doc|docx|jpg|jpeg|png)$/i)) { alert("Only Word and image files allowed."); return; }
                        setFiles((p) => { const tbls = [...p.tables]; tbls[i] = f; return { ...p, tables: tbls }; });
                      }}
                      accept=".doc,.docx,.jpg,.jpeg,.png"
                      required
                      description="Accepted: .doc, .docx, .jpg, .jpeg, .png"
                      hint="Word or image files"
                      error={errors.tables}
                    />
                    <FileUploadBox
                      label="Supplementary Files"
                      file={files.supplements}
                      onChange={(f) => {
                        if (!f.name.match(/\.(doc|docx)$/i)) { alert("Only Word files (.doc, .docx) accepted."); return; }
                        setFiles((p) => ({ ...p, supplements: f }));
                        if (errors.supplements) setErrors((p) => ({ ...p, supplements: "" }));
                      }}
                      onDelete={() => setFiles((p) => ({ ...p, supplements: null }))}
                      accept=".doc,.docx"
                      required
                      description="Accepted: .doc, .docx"
                      hint="Word document only"
                      error={errors.supplements}
                    />
                  </div>
                </div>
              )}

              {/* ═══ STEP 2 — BASIC INFO ═══ */}
              {currentStep === 2 && (
                <div className="space-y-7">
                  <SectionHeading
                    icon={BookOpen}
                    title="Basic Information"
                    subtitle="Provide details about your manuscript. All fields marked with * are required."
                    color="#2d7d6b"
                  />
                  <div>
                    <FieldLabel required>Article Type</FieldLabel>
                    <select
                      value={formData.articleType}
                      onChange={(e) => handleField("articleType", e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all ${errors.articleType ? "border-red-300 bg-red-50" : "border-[#d1dde8] focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8]"}`}
                    >
                      <option value="">— Select article type —</option>
                      <option value="original">Original Article</option>
                      <option value="case_report">Case Report</option>
                      <option value="case_series">Case Series</option>
                      <option value="meta">Meta-Analysis</option>
                      <option value="review">Review Article / Systematic Review</option>
                      <option value="editorial">Editorial</option>
                      <option value="clinical">Clinical Trial</option>
                    </select>
                    <ErrorMsg msg={errors.articleType} />
                  </div>
                  <AutoTextarea
                    label="Article Title"
                    required
                    rows={2}
                    placeholder="Enter the full title of your manuscript"
                    value={formData.title}
                    onChange={(e) => handleField("title", e.target.value)}
                    error={errors.title}
                  />
                  <AutoTextarea
                    label="Running Title"
                    required
                    rows={2}
                    placeholder="Short running title (max 50 characters)"
                    value={formData.runningTitle}
                    onChange={(e) => handleField("runningTitle", e.target.value)}
                    error={errors.runningTitle}
                  />
                  <div>
                    <AutoTextarea
                      label="Abstract"
                      required
                      rows={8}
                      placeholder="Enter abstract — not more than 250 words"
                      value={formData.abstract}
                      onChange={(e) => handleField("abstract", e.target.value)}
                      error={errors.abstract}
                    />
                    <p className={`text-xs font-semibold mt-1.5 ${wordCount === 0 ? "text-gray-400" : wordCount > 250 ? "text-red-600" : wordCount >= 230 ? "text-amber-600" : "text-[#2d7d6b]"}`}>
                      {wordCount} / 250 words
                    </p>
                  </div>

                  {/* Manuscript Statistics */}
                  <div
                    className="border-2 border-[#d1dde8] rounded-2xl p-7 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #f8fafc, #f0f6fa)" }}
                  >
                    <h3 className="text-sm font-bold text-[#1a6b8a] uppercase tracking-wider mb-6">
                      Manuscript Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                      {[
                        { field: "totalWordCount", label: "Word Count", errKey: "totalWordCount" },
                        { field: "bwFigures", label: "No. of Black and White Figures", errKey: "bwFigures" },
                        { field: "colorFigures", label: "No. of Color Figures", errKey: "colorFigures" },
                        { field: "tables", label: "No. of Tables", errKey: "statTables" },
                        { field: "pages", label: "No. of Pages", errKey: "pages" },
                      ].map(({ field, label, errKey }) => (
                        <div key={field} className="text-center">
                          <label
                            className="block text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide leading-tight text-center"
                            style={{ minHeight: "3rem", display: "flex", alignItems: "flex-end", justifyContent: "center", textAlign: "center" }}
                          >
                            {label} <span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formData[field] || ""}
                            onKeyDown={onlyNumbers}
                            onChange={(e) => handleField(field, e.target.value.replace(/\D/g, ""))}
                            className={`w-full px-3 py-3 border-2 rounded-xl outline-none text-sm text-center font-semibold transition-all bg-white
                              ${errors[errKey] ? "border-red-300 bg-red-50" : "border-[#d1dde8] focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8]"}`}
                          />
                          {errors[errKey] && (
                            <p className="text-xs text-red-500 mt-1 flex items-center justify-center gap-0.5">
                              <AlertCircle className="w-3 h-3" />{errors[errKey]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Keywords</FieldLabel>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        placeholder="Enter up to 6 keywords, separated by commas"
                        value={formData.keywords}
                        onChange={(e) => handleField("keywords", e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none text-sm transition-all ${errors.keywords ? "border-red-300 bg-red-50" : "border-[#d1dde8] focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8]"}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Maximum 6 keywords, separated by commas</p>
                    <ErrorMsg msg={errors.keywords} />
                  </div>

                  {showIEC && (
                    <div className="border-2 border-[#b8ddd6] bg-[#e8f5f0]/50 rounded-2xl p-7 space-y-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2d7d6b]" />
                        <h3 className="text-sm font-bold text-[#2d7d6b] uppercase tracking-wider">IEC Number OBTAINED</h3>
                      </div>
                      <p className="text-xs text-gray-500 text-left leading-relaxed">Has an Institutional Ethics Committee (IEC) number been obtained?</p>
                      <div className="flex items-center gap-6">
                        {["Yes", "No", "N/A"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input type="radio" name="iecNumber" value={opt} checked={formData.iecNumber === opt} onChange={(e) => handleField("iecNumber", e.target.value)} className="w-4 h-4 accent-[#2d7d6b] cursor-pointer" />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {formData.iecNumber === "Yes" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">IEC number and details</label>
                          <textarea rows={3} placeholder="Enter IEC approval number, issuing authority, and date..." value={formData.iecNumberDetails || ""} onChange={(e) => handleField("iecNumberDetails", e.target.value)} className="w-full px-4 py-3 border-2 border-[#d1dde8] rounded-xl outline-none text-sm focus:border-[#2d7d6b] transition-all" />
                        </div>
                      )}
                    </div>
                  )}

                  {showProspero && (
                    <div className="border-2 border-[#d0bfe8] bg-[#f0ebf7]/50 rounded-2xl p-7 space-y-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6b4c8a]" />
                        <h3 className="text-sm font-bold text-[#6b4c8a] uppercase tracking-wider">PROSPERO REGISTRATION NUMBER</h3>
                      </div>
                      <p className="text-xs text-gray-500 text-left leading-relaxed">Applicable to systematic reviews?</p>
                      <div className="flex items-center gap-6">
                        {["Yes", "No", "N/A"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input type="radio" name="prosperoRegistration" value={opt} checked={formData.prosperoRegistration === opt} onChange={(e) => handleField("prosperoRegistration", e.target.value)} className="w-4 h-4 accent-[#6b4c8a] cursor-pointer" />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {formData.prosperoRegistration === "Yes" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">PROSPERO registration number and details</label>
                          <textarea rows={3} placeholder="E.g. CRD42023XXXXXX — include date and URL..." value={formData.prosperoRegistrationDetails || ""} onChange={(e) => handleField("prosperoRegistrationDetails", e.target.value)} className="w-full px-4 py-3 border-2 border-[#d1dde8] rounded-xl outline-none text-sm focus:border-[#6b4c8a] transition-all" />
                        </div>
                      )}
                    </div>
                  )}

                  {showTrial && (
                    <div className="border-2 border-[#b8d9e8] bg-[#e8f4f8]/50 rounded-2xl p-7 space-y-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a6b8a]" />
                        <h3 className="text-sm font-bold text-[#1a6b8a] uppercase tracking-wider">TRIAL REGISTRATION NUMBER</h3>
                      </div>
                      <p className="text-xs text-gray-500 text-left leading-relaxed">Has this trial been registered in an approved public registry (CTRI, ClinicalTrials.gov, ISRCTN)?</p>
                      <div className="flex items-center gap-6">
                        {["Yes", "No", "N/A"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input type="radio" name="trialRegistration" value={opt} checked={formData.trialRegistration === opt} onChange={(e) => handleField("trialRegistration", e.target.value)} className="w-4 h-4 accent-[#1a6b8a] cursor-pointer" />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {formData.trialRegistration === "Yes" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Trial registration number and details</label>
                          <textarea rows={3} placeholder="E.g. CTRI/2023/01/XXXXXX — include registry name and URL..." value={formData.trialRegistrationDetails || ""} onChange={(e) => handleField("trialRegistrationDetails", e.target.value)} className="w-full px-4 py-3 border-2 border-[#d1dde8] rounded-xl outline-none text-sm focus:border-[#1a6b8a] transition-all" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ STEP 3 — AUTHORS ═══ */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <SectionHeading
                    icon={Users}
                    title="Author Details"
                    subtitle="Add all contributing authors. One must be designated as the corresponding author."
                    color="#2d7d6b"
                  />
                  <div className="rounded-2xl overflow-hidden border border-[#b8ddd6] shadow-sm">
                    <div
                      className="flex items-center gap-2 px-6 py-4 text-white"
                      style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
                    >
                      <FileText className="w-4 h-4" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Author Instructions</h3>
                    </div>
                    <div className="px-7 py-6 space-y-3 bg-[#e8f5f0]/30">
                      {[
                        "Enter complete and accurate details for all authors. The information must match the Cover Letter submitted with the manuscript. After submission, a digital copyright agreement link will be emailed to all listed co-authors.",
                        "Make sure to add every co-author at this stage, as authors cannot be added once the manuscript is submitted.",
                        "Use the Author Reordering option to change the sequence of authors — drag and drop any author card up or down to reorder them. The order shown here will reflect the final author sequence in the published manuscript.",
                        "Only one author may be designated as the Corresponding Author.",
                        "Double-check all co-authors' email addresses before submitting. Incorrect emails can delay the review process and prevent copyright links from being delivered. Post-submission corrections may take time.",
                      ].map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-left">
                          <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "#2d7d6b" }}>{i + 1}</span>
                          <p className="text-sm text-[#1a3a2a] leading-relaxed text-left">{pt}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 text-white" style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}>
                      <FileText className="w-4 h-4" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">ORCID Linking</h3>
                    </div>
                    <div className="px-7 py-6 space-y-3 bg-[#e8f5f0]/30">
                      {[
                        "To connect a co-author's 16-digit ORCID iD, use the Send ORCID authentication email option from the Add Co-authors page.",
                        "The co-author will receive an email with a verification link and must confirm their ORCID through the link.",
                        "Once verified, the ORCID iD will be successfully linked to the co-author's account.",
                      ].map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-left">
                          <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "#2d7d6b" }}>{i + 1}</span>
                          <p className="text-sm text-[#1a3a2a] leading-relaxed text-left">{pt}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">Total Authors:</span>
                      <span className="text-sm font-black text-[#1a6b8a] bg-[#e8f4f8] border border-[#b8d9e8] px-3 py-1 rounded-full">
                        {authors.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAuthorForm((v) => !v)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition hover:opacity-90 shadow-md"
                      style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
                    >
                      <UserPlus className="w-4 h-4" /> Add Co-Author
                    </button>
                  </div>

                  {showAuthorForm && (
                    <AuthorForm
                      draft={authorDraft}
                      setDraft={setAuthorDraft}
                      onAdd={handleAddAuthor}
                      onCancel={() => setShowAuthorForm(false)}
                    />
                  )}

                  <div className="overflow-x-auto rounded-2xl">
                    <AuthorsTable authors={authors} setAuthors={setAuthors} />
                  </div>

                  {errors.authors && <ErrorMsg msg={errors.authors} />}
                  {errors.correspondingAuthor && <ErrorMsg msg={errors.correspondingAuthor} />}
                </div>
              )}

              {/* ═══ STEP 4 — REVIEW & SUBMIT ═══ */}
              {currentStep === 4 && (
                <div className="space-y-7">
                  <SectionHeading
                    icon={Shield}
                    title="Review & Submit"
                    subtitle="Review your submission below, then click Submit Manuscript to complete your submission."
                    color="#6b4c8a"
                  />

                  {/* ── REVIEWER SUGGESTIONS (above manuscript summary) ── */}
                  <div
                    className="rounded-2xl border-2 border-[#b8ddd6] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #e8f5f0, #f0fbf7)" }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-[#2d7d6b]" />
                        <h4 className="text-sm font-bold text-[#2d7d6b]">Reviewer Suggestions</h4>
                        <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">Required</span>
                      </div>
                      <p className="text-xs text-[#1a3a2a] leading-relaxed">
                        Suggest up to 5 qualified peer reviewers. At least 1 suggestion is mandatory. Search by name or email to auto-fill details of registered users.
                      </p>
                      {reviewers.filter((r) => r.firstName || r.email).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reviewers.filter((r) => r.firstName || r.email).map((r, i) => (
                            <span key={i} className="text-xs bg-white border border-[#b8ddd6] text-[#2d7d6b] font-semibold px-3 py-1 rounded-full">
                              {r.title} {r.firstName} {r.lastName}
                            </span>
                          ))}
                        </div>
                      )}
                      {errors.reviewers && <ErrorMsg msg={errors.reviewers} />}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReviewerModal(true)}
                      className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition hover:opacity-90 shadow-md shrink-0"
                      style={{ background: "linear-gradient(135deg, #2d7d6b, #3a9d88)" }}
                    >
                      <Users className="w-4 h-4" /> {reviewers.filter((r) => r.firstName || r.email).length > 0 ? "Edit Suggestions" : "Add Reviewers"}
                    </button>
                  </div>

                  {/* Manuscript Summary */}
                  <InfoCard title="Manuscript Summary" icon={FileText} accentColor="#1a6b8a">
                    <div className="divide-y divide-[#e8f0f5]">
                      {[
                        { label: "Article Type", value: formData.articleType || "—" },
                        { label: "Article Title", value: formData.title || "—" },
                        { label: "Running Title", value: formData.runningTitle || "—" },
                        { label: "Keywords", value: formData.keywords || "—" },
                        { label: "Word Count", value: formData.totalWordCount || "—" },
                        { label: "Total Authors", value: `${authors.length} author${authors.length !== 1 ? "s" : ""}` },
                        { label: "Corresponding Author", value: (() => { const ca = authors.find((a) => a.isCorresponding); return ca ? `${ca.title} ${ca.firstName} ${ca.lastName} — ${ca.email || "no email"}` : "—"; })() },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start gap-4 px-7 py-4 hover:bg-[#f8fafc] transition-colors">
                          <span className="w-44 shrink-0 text-xs font-bold text-[#1a6b8a] uppercase tracking-wider pt-0.5">{label}</span>
                          <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
                        </div>
                      ))}
                    </div>
                  </InfoCard>

                  <InfoCard title="Uploaded Files" icon={Upload} accentColor="#2d7d6b">
                    <div className="divide-y divide-[#e8f0f5]">
                      {[
                        { label: "Cover Letter", value: files.coverLetter ? files.coverLetter.name : null },
                        { label: "Blind Manuscript", value: files.blindManuscript ? files.blindManuscript.name : null },
                        { label: "Figures", value: files.images.length ? `${files.images.length} file${files.images.length !== 1 ? "s" : ""} uploaded` : null },
                        { label: "Tables", value: files.tables.length ? `${files.tables.length} file${files.tables.length !== 1 ? "s" : ""} uploaded` : null },
                        { label: "Supplementary", value: files.supplements ? files.supplements.name : null },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-4 px-7 py-4">
                          <span className="w-44 shrink-0 text-xs font-bold text-[#2d7d6b] uppercase tracking-wider">{label}</span>
                          {value ? (
                            <span className="flex items-center gap-2 text-sm text-gray-800">
                              <CheckCircle className="w-4 h-4 text-[#2d7d6b] shrink-0" />{value}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-sm text-red-500">
                              <AlertCircle className="w-4 h-4 shrink-0" />Not uploaded
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </InfoCard>

                  {/* Preview */}
                  <div
                    className="rounded-2xl border-2 border-[#b8d9e8] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #e8f4f8, #f0f8fc)" }}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#1a6b8a] mb-1.5">Preview Full Submission</h4>
                      <p className="text-xs text-[#2a6a7a]">
                        View a compiled summary of all information before final submission.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePreviewManuscript}
                      className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition hover:opacity-90 shadow-md shrink-0"
                      style={{ background: "linear-gradient(135deg, #1a6b8a, #2a8baa)" }}
                    >
                      <Eye className="w-4 h-4" /> Preview Manuscript
                    </button>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#d1dde8] rounded-xl px-6 py-5">
                    <StyledCheckbox
                      checked={previewConfirmed}
                      onChange={() => setPreviewConfirmed((v) => !v)}
                    >
                      <span className="text-red-500 font-bold">*</span> Confirm you have checked the PDF preview document.
                    </StyledCheckbox>
                  </div>

                  {/* Conflict of Interest */}
                  <div className="border-2 border-[#d1dde8] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-7 py-5 border-b border-[#d1dde8] bg-[#f8fafc]">
                      <h3 className="text-base font-bold text-gray-800 text-left">Declaration of Conflict of Interest</h3>
                    </div>
                    <div className="px-7 py-6 space-y-5">
                      <p className="text-sm text-gray-700 text-left">
                        Are you aware of any conflicts of interest that may arise between your authors and this journal?
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed text-left">
                        A conflict of interest, or competing interest, is anything that may be perceived to influence the authors' work. Conflicts typically stem from financial, personnel, or professional relationships. Declaration of Conflict of Interest statements are published with each article.
                      </p>
                      <div className="space-y-2.5">
                        <p className="text-sm font-semibold text-gray-700 text-left">
                          <span className="text-red-500">*</span> Please select a response
                        </p>
                        <div className="flex gap-8">
                          {["Yes", "No"].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                              <input type="radio" name="conflictResponse" value={opt} checked={conflictHasConflict === opt} onChange={() => setConflictHasConflict(opt)} className="w-4 h-4 accent-[#1a6b8a] cursor-pointer" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                      {conflictHasConflict === "Yes" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 text-left">Please describe the conflict of interest</label>
                          <textarea rows={4} placeholder="Describe the nature of the conflict of interest..." value={conflictDetails} onChange={(e) => setConflictDetails(e.target.value)} className="w-full px-4 py-3 border-2 border-[#d1dde8] rounded-xl outline-none text-sm focus:border-[#1a6b8a] focus:ring-4 focus:ring-[#e8f4f8] transition-all" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copyright Agreement */}
                  <div className="border-2 border-[#d1dde8] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-7 py-5 border-b border-[#d1dde8] bg-[#f8fafc]">
                      <h3 className="text-base font-bold text-gray-800 text-left">Copyright Agreement</h3>
                    </div>
                    <div className="px-7 py-6 space-y-5">
                      <p className="text-sm text-gray-700 text-left">
                        <span className="text-red-500 font-bold">*</span> Please click here to review the{" "}
                        <button
                          type="button"
                          onClick={() => setShowCopyrightModal(true)}
                          className="text-[#1a6b8a] underline font-semibold hover:text-[#2a8baa] transition-colors"
                        >
                          Copyright Form
                        </button>{" "}
                        and agree to the terms and conditions.
                      </p>
                      <StyledCheckbox
                        checked={copyrightAgreed}
                        onChange={() => setCopyrightAgreed((v) => !v)}
                      >
                        I hereby confirm that I have read, understood, and agreed to the submission guidelines, policies and submission declaration of the journal.
                      </StyledCheckbox>
                    </div>
                  </div>
                </div>
              )}

              <NavButtons
                currentStep={currentStep}
                stepsLength={steps.length}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </form>
          </div>
        </div>
      </div>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />

      <CopyrightModal
        isOpen={showCopyrightModal}
        onClose={() => {
          setShowCopyrightModal(false);
          setCopyrightAgreed(true);
        }}
      />

      <ReviewerModal
        isOpen={showReviewerModal}
        onClose={() => setShowReviewerModal(false)}
        reviewers={reviewers}
        setReviewers={setReviewers}
      />
    </div>
  );
};

export default SubmitManuscript;