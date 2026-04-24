import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import {
  fetchSubmissionById,
  submitReviewerReview,
  uploadDashboardFile,
} from "../../services/dashboardService";
import { openFilePreview } from "../../utils/filePreview";

const THEME = {
  primary: "#0f3460",
  secondary: "#0e7490",
  border: "#c8d5e4",
};

const RECOMMENDATION_OPTIONS = [
  { label: "Accept", value: "ACCEPT" },
  { label: "Minor Revision", value: "MINOR_REVISION" },
  { label: "Major Revision", value: "MAJOR_REVISION" },
  { label: "Reject", value: "REJECT" },
];

const CHECKLIST_SECTIONS = {
  declaration: [
    ["noConflict", "I have no conflict of interest with this manuscript."],
    ["confidentiality", "I will maintain strict confidentiality throughout the review process."],
    ["expertise", "I possess appropriate subject expertise to evaluate this manuscript."],
    ["compliance", "This review is objective, constructive, and compliant with COPE & ICMJE standards."],
  ],
  scope: [
    ["relevance", "Relevance to JAIRAM scope"],
    ["novelty", "Novelty / Contribution"],
    ["significance", "Scientific significance"],
  ],
  methodology: [
    ["objectives", "Clear objectives & background"],
    ["studyDesign", "Study design & methodology appropriate"],
    ["ethicalApproval", "Ethical approval / Consent documented"],
    ["statisticalAnalysis", "Statistical analysis appropriate"],
  ],
  results: [
    ["dataClarity", "Data clarity & organization"],
    ["tablesAccurate", "Tables/Figures accurate & relevant"],
    ["discussionLogical", "Discussion logical & evidence-based"],
    ["conclusionsSupported", "Conclusions supported by data"],
  ],
  ethics: [
    ["dataFabrication", "Data fabrication/manipulation concerns"],
    ["citation", "Proper citation & referencing"],
    ["coiFunding", "COI & Funding disclosure provided"],
  ],
  language: [
    ["clearProfessional", "Clear and professional language"],
    ["minorEditing", "Requires minor language editing"],
    ["majorRevision", "Requires major language revision"],
  ],
};

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-800 mb-2">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

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
      <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SubHead = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#eef0f3]">
    <span className="w-7 h-7 rounded-full bg-[#e8eef6] text-[#0f3460] text-xs font-bold flex items-center justify-center shrink-0">
      {number}
    </span>
    <span className="text-sm font-bold text-[#0f3460]">{title}</span>
  </div>
);

const RadioTableRow = ({ label, name, value, options, onChange, hasError }) => (
  <tr className={`border-b border-[#eef0f3] last:border-0 transition-colors ${hasError ? "bg-red-50 border-l-4 border-l-red-400" : "hover:bg-[#f7f9fc]"}`}>
    <td className="px-4 py-3 text-sm text-gray-700 text-left">
      {label}
      {hasError && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Required
        </p>
      )}
    </td>
    {options.map((opt) => (
      <td key={opt.value} className="px-4 py-3 text-center">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="w-4 h-4 cursor-pointer"
          style={{ accentColor: THEME.primary }}
        />
      </td>
    ))}
  </tr>
);

const RadioTable = ({ criteria, stateObj, onChange, options, error, attempted }) => (
  <div className="mb-6 overflow-x-auto">
    <table className="w-full border border-[#c8d5e4] rounded-xl overflow-hidden text-sm">
      <thead>
        <tr className="bg-[#f7f9fc] border-b border-[#c8d5e4]">
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Criteria</th>
          {options.map((h) => (
            <th key={h.value} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {h.label}
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
    <ErrorMsg msg={error} />
  </div>
);

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

const FileUploadBox = ({
  label,
  description,
  fileMeta,
  uploading,
  progress,
  error,
  onPick,
  onRemove,
}) => {
  const inputRef = useRef(null);

  return (
    <div>
      <FieldLabel required>{label}</FieldLabel>
      <p className="text-xs text-gray-500 mb-3">{description}</p>

      <input
        ref={inputRef}
        type="file"
        accept=".doc,.docx,.pdf"
        className="hidden"
        onChange={onPick}
      />

      {fileMeta ? (
        <div className="border-2 border-[#a0d4e8] bg-[#e0f2fe] rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-white border border-[#a0d4e8] rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#0e7490]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{fileMeta.fileName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {Math.max(1, Math.round((fileMeta.fileSize || 0) / 1024))} KB
              {fileMeta.mimeType ? ` · ${fileMeta.mimeType}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fileMeta.fileUrl && (
              <button
                type="button"
                onClick={() => openFilePreview(fileMeta)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#b8cfe0] text-[#0f3460] text-xs font-bold rounded-lg hover:bg-[#e8eef6] transition"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl px-8 py-10 text-center transition-all ${uploading ? "border-[#0f3460] bg-[#e8eef6]" : error ? "border-red-400 bg-red-50 cursor-pointer" : "border-[#c8d5e4] hover:border-[#0f3460] hover:bg-[#e8eef6]/30 cursor-pointer"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#e8eef6] flex items-center justify-center mx-auto mb-4">
            {uploading ? <Loader2 className="w-7 h-7 text-[#0f3460] animate-spin" /> : <Upload className="w-7 h-7 text-[#0f3460]" />}
          </div>
          <p className="text-sm font-bold text-gray-600 mb-1">
            {uploading ? `Uploading... ${progress}%` : "Drag & drop your file here"}
          </p>
          <p className="text-xs text-gray-400 mb-5">Word document or PDF only (.doc, .docx, .pdf)</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!uploading) inputRef.current?.click();
            }}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-sm transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)" }}
          >
            <FileText className="w-4 h-4" /> Browse File
          </button>
        </div>
      )}
      <ErrorMsg msg={error} />
    </div>
  );
};

const NavBar = ({ page, onBack, onNext, onSubmit, loading }) => (
  <div className="flex items-center justify-between rounded-2xl px-6 py-5 mt-6 border border-[#c8d5e4]" style={{ background: "linear-gradient(135deg,#eef4fb,#eef4fb)" }}>
    <p className="text-xs font-semibold text-[#4a5e72]">
      {page === 1 ? "Complete the evaluation checklist before continuing" : "Step 2 of 2 — review comments, recommendation, and files"}
    </p>
    <div className="flex items-center gap-3">
      {page === 2 && (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[#0f3460] text-[#0f3460] bg-white hover:bg-[#e8eef6] transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      {page === 1 ? (
        <button type="button" onClick={onNext} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)" }}>
          <Save className="w-4 h-4" /> Save & Continue <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button type="button" onClick={onSubmit} disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 transition disabled:opacity-50" style={{ background: "linear-gradient(135deg,#0e7490,#0891b2)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      )}
    </div>
  </div>
);

const SuccessScreen = ({ title, onBackToDashboard }) => (
  <div className="bg-white rounded-3xl border border-[#c8d5e4] shadow-sm p-16 text-center">
    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg,#e0f2fe,#a0d4e8)" }}>
      <CheckCircle className="w-14 h-14 text-[#0e7490]" />
    </div>
    <h2 className="text-2xl font-black text-gray-900 mb-3">Review Submitted Successfully!</h2>
    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-2">
      Your review for <strong>{title || "this manuscript"}</strong> has been sent to the editor.
    </p>
    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
      The editorial team will now process your feedback as part of the revision workflow.
    </p>
    <button type="button" onClick={onBackToDashboard} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border-2 border-[#0f3460] text-[#0f3460] bg-white hover:bg-[#e8eef6] transition">
      Back to Dashboard
    </button>
  </div>
);

const buildChecklistResponses = ({
  declaration,
  scopeRatings,
  methodRatings,
  resultsRatings,
  ethicsRatings,
  language,
}) => {
  const responses = [];

  CHECKLIST_SECTIONS.declaration.forEach(([key]) => {
    responses.push({
      questionId: key,
      sectionId: "declaration",
      response: !!declaration[key],
    });
  });

  CHECKLIST_SECTIONS.scope.forEach(([key]) => {
    responses.push({ questionId: key, sectionId: "scope", response: scopeRatings[key] });
  });

  CHECKLIST_SECTIONS.methodology.forEach(([key]) => {
    responses.push({ questionId: key, sectionId: "methodology", response: methodRatings[key] });
  });

  CHECKLIST_SECTIONS.results.forEach(([key]) => {
    responses.push({ questionId: key, sectionId: "results", response: resultsRatings[key] });
  });

  CHECKLIST_SECTIONS.ethics.forEach(([key]) => {
    responses.push({ questionId: key, sectionId: "ethics", response: ethicsRatings[key] });
  });

  CHECKLIST_SECTIONS.language.forEach(([key]) => {
    responses.push({
      questionId: key,
      sectionId: "language",
      response: !!language[key],
    });
  });

  return {
    checklistVersion: "1.0.0",
    responses,
    completedAt: new Date().toISOString(),
  };
};

const validateChecklistPage = ({
  declaration,
  scopeRatings,
  methodRatings,
  resultsRatings,
  ethicsRatings,
  language,
}) => {
  const nextErrors = {};

  if (Object.values(declaration).some((value) => !value)) {
    nextErrors.declaration = "Please confirm all reviewer declaration items.";
  }
  if (Object.values(scopeRatings).some((value) => !value)) {
    nextErrors.scope = "Please complete Scope & Originality.";
  }
  if (Object.values(methodRatings).some((value) => !value)) {
    nextErrors.methodology = "Please complete Methodological Rigor.";
  }
  if (Object.values(resultsRatings).some((value) => !value)) {
    nextErrors.results = "Please complete Results & Interpretation.";
  }
  if (Object.values(ethicsRatings).some((value) => !value)) {
    nextErrors.ethics = "Please complete Publication Ethics & Compliance.";
  }
  if (!Object.values(language).some(Boolean)) {
    nextErrors.language = "Please select at least one language and presentation assessment.";
  }

  return nextErrors;
};

export default function ReviewerChecklist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState("");

  const [declaration, setDeclaration] = useState({
    noConflict: false,
    confidentiality: false,
    expertise: false,
    compliance: false,
  });
  const [scopeRatings, setScopeRatings] = useState({ relevance: "", novelty: "", significance: "" });
  const [methodRatings, setMethodRatings] = useState({
    objectives: "",
    studyDesign: "",
    ethicalApproval: "",
    statisticalAnalysis: "",
  });
  const [resultsRatings, setResultsRatings] = useState({
    dataClarity: "",
    tablesAccurate: "",
    discussionLogical: "",
    conclusionsSupported: "",
  });
  const [ethicsRatings, setEthicsRatings] = useState({ dataFabrication: "", citation: "", coiFunding: "" });
  const [language, setLanguage] = useState({ clearProfessional: false, minorEditing: false, majorRevision: false });
  const [authorComments, setAuthorComments] = useState("");
  const [editorComments, setEditorComments] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [files, setFiles] = useState({
    revised: null,
    response: null,
  });
  const [uploading, setUploading] = useState({
    revised: false,
    response: false,
  });
  const [uploadProgress, setUploadProgress] = useState({
    revised: 0,
    response: 0,
  });

  useEffect(() => {
    if (!submissionId) {
      setSubmissionError("No submission was selected for this review.");
      return;
    }

    let isActive = true;

    fetchSubmissionById(submissionId)
      .then((data) => {
        if (!isActive) return;
        setSubmissionTitle(data?.submission?.title || data?.title || "");
        setSubmissionError("");
      })
      .catch((err) => {
        if (!isActive) return;
        setSubmissionError(err.response?.data?.message || err.message || "Could not load submission context for this review.");
      });

    return () => {
      isActive = false;
    };
  }, [submissionId]);

  const totalFields = 4 + Object.keys(scopeRatings).length + Object.keys(methodRatings).length + Object.keys(resultsRatings).length + Object.keys(ethicsRatings).length + 1;
  const doneFields = Object.values(declaration).filter(Boolean).length + Object.values(scopeRatings).filter(Boolean).length + Object.values(methodRatings).filter(Boolean).length + Object.values(resultsRatings).filter(Boolean).length + Object.values(ethicsRatings).filter(Boolean).length + (Object.values(language).some(Boolean) ? 1 : 0);
  const progress = Math.round((doneFields / totalFields) * 100);

  const handleFileUpload = async (kind, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, [kind]: true }));
      setErrors((prev) => ({ ...prev, [kind]: "", submit: "" }));

      const uploaded = await uploadDashboardFile(file, "supplementary", (percent) => {
        setUploadProgress((prev) => ({ ...prev, [kind]: percent }));
      });

      setFiles((prev) => ({ ...prev, [kind]: uploaded }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [kind]: err.response?.data?.message || err.message || "File upload failed.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [kind]: false }));
    }
  };

  const handleSaveAndContinue = () => {
    setAttempted(true);
    const nextErrors = validateChecklistPage({
      declaration,
      scopeRatings,
      methodRatings,
      resultsRatings,
      ethicsRatings,
      language,
    });

    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    setErrors({});
    setPage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const nextErrors = {};

    if (!submissionId) {
      setSubmissionError("This review is not attached to a submission.");
      return;
    }

    if (authorComments.trim().length < 10) {
      nextErrors.authorComments = "Comments for Author must be at least 10 characters.";
    }
    if (editorComments.trim().length < 10) {
      nextErrors.editorComments = "Confidential Letter for Editor must be at least 10 characters.";
    }
    if (!recommendation) {
      nextErrors.recommendation = "Please select a reviewer recommendation.";
    }
    if (!files.revised) {
      nextErrors.revised = "Revised Manuscript is required.";
    }
    if (!files.response) {
      nextErrors.response = "Response to Editor's Comments is required.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    try {
      setSubmitting(true);
      setErrors((prev) => ({ ...prev, submit: "" }));

      await submitReviewerReview({
        submissionId,
        reviewerChecklist: buildChecklistResponses({
          declaration,
          scopeRatings,
          methodRatings,
          resultsRatings,
          ethicsRatings,
          language,
        }),
        remarks: authorComments.trim(),
        confidentialToEditor: editorComments.trim(),
        recommendation,
        revisedManuscript: files.revised,
        responseToEditorComments: files.response,
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.response?.data?.message || err.message || "Failed to submit reviewer review.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(160deg,#eef4fb 0%,#f7f9fc 45%,#e8f6fb 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <SuccessScreen title={submissionTitle} onBackToDashboard={() => navigate("/dashboard", { replace: true })} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(160deg,#eef4fb 0%,#f7f9fc 45%,#e8f6fb 100%)" }}>
      <div className="h-1.5 fixed top-0 left-0 right-0 z-50" style={{ background: "linear-gradient(90deg,#0f3460,#92701a60,#0e7490)" }} />

      <div className="max-w-3xl mx-auto pt-2">
        <div className="bg-white rounded-2xl border border-[#c8d5e4] shadow-sm px-8 py-7 mb-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#e8eef6] border border-[#b8cfe0] rounded-xl px-4 py-2 text-xs font-bold text-[#0f3460] uppercase tracking-widest mb-4">
                <Shield className="w-3.5 h-3.5" />
                Journal of Advanced & Integrated Research in Acute Medicine
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                Official Peer Review <span style={{ color: THEME.primary }}>Evaluation Checklist</span>
              </h1>
              <p className="text-sm text-[#4a5e72] leading-relaxed">
                Complete Step 1 and Step 2 as part of the reviewer revision workflow for this submission.
              </p>
              {submissionTitle && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#f7f9fc] border border-[#dbe5ef] px-4 py-2 text-xs font-semibold text-[#4a5e72]">
                  <ClipboardList className="w-3.5 h-3.5 text-[#0f3460]" />
                  {submissionTitle}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/dashboard", { replace: true });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 border-[#0f3460] text-[#0f3460] bg-white hover:bg-[#e8eef6] transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </div>

          {(submissionError || errors.submit) && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 font-semibold">{submissionError || errors.submit}</p>
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            {["Evaluation Checklist", "Comments & Submission"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${index + 1 === page ? "bg-[#0f3460] border-[#0f3460] text-white" : index + 1 < page ? "bg-[#0e7490] border-[#0e7490] text-white" : "bg-white border-[#c8d5e4] text-gray-400"}`}>
                  {index + 1 < page ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`text-xs font-bold ${index + 1 === page ? "text-[#0f3460]" : index + 1 < page ? "text-[#0e7490]" : "text-gray-400"}`}>
                  {step}
                </span>
                {index === 0 && <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />}
              </div>
            ))}
          </div>

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
                    background: progress === 100 ? "linear-gradient(90deg,#0e7490,#0891b2)" : "linear-gradient(90deg,#0f3460,#1a4a7a)",
                  }}
                />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${progress === 100 ? "text-[#0e7490]" : "text-[#0f3460]"}`}>
                {doneFields} / {totalFields}
              </span>
            </div>
          )}
        </div>

        {page === 1 && (
          <>
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
                {CHECKLIST_SECTIONS.declaration.map(([key, label]) => (
                  <CheckItem
                    key={key}
                    label={label}
                    checked={declaration[key]}
                    onChange={(val) => {
                      setDeclaration((prev) => ({ ...prev, [key]: val }));
                      if (errors.declaration) setErrors((prev) => ({ ...prev, declaration: "" }));
                    }}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Scientific Merit & Quality Assessment *" icon={Star}>
              <SubHead number="1" title="Scope & Originality" />
              <RadioTable
                criteria={CHECKLIST_SECTIONS.scope}
                stateObj={scopeRatings}
                onChange={(key, val) => {
                  setScopeRatings((prev) => ({ ...prev, [key]: val }));
                  if (errors.scope) setErrors((prev) => ({ ...prev, scope: "" }));
                }}
                options={[
                  { label: "Excellent", value: "EXCELLENT" },
                  { label: "Good", value: "GOOD" },
                  { label: "Fair", value: "FAIR" },
                  { label: "Poor", value: "POOR" },
                ]}
                error={errors.scope}
                attempted={attempted}
              />

              <SubHead number="2" title="Methodological Rigor" />
              <RadioTable
                criteria={CHECKLIST_SECTIONS.methodology}
                stateObj={methodRatings}
                onChange={(key, val) => {
                  setMethodRatings((prev) => ({ ...prev, [key]: val }));
                  if (errors.methodology) setErrors((prev) => ({ ...prev, methodology: "" }));
                }}
                options={[
                  { label: "Adequate", value: "ADEQUATE" },
                  { label: "Needs Revision", value: "NEEDS_REVISION" },
                  { label: "Inadequate", value: "INADEQUATE" },
                ]}
                error={errors.methodology}
                attempted={attempted}
              />

              <SubHead number="3" title="Results & Interpretation" />
              <RadioTable
                criteria={CHECKLIST_SECTIONS.results}
                stateObj={resultsRatings}
                onChange={(key, val) => {
                  setResultsRatings((prev) => ({ ...prev, [key]: val }));
                  if (errors.results) setErrors((prev) => ({ ...prev, results: "" }));
                }}
                options={[
                  { label: "Adequate", value: "ADEQUATE" },
                  { label: "Needs Revision", value: "NEEDS_REVISION" },
                  { label: "Inadequate", value: "INADEQUATE" },
                ]}
                error={errors.results}
                attempted={attempted}
              />
            </SectionCard>

            <SectionCard title="Publication Ethics & Compliance *" icon={Shield}>
              <RadioTable
                criteria={CHECKLIST_SECTIONS.ethics}
                stateObj={ethicsRatings}
                onChange={(key, val) => {
                  setEthicsRatings((prev) => ({ ...prev, [key]: val }));
                  if (errors.ethics) setErrors((prev) => ({ ...prev, ethics: "" }));
                }}
                options={[
                  { label: "Yes", value: "YES" },
                  { label: "No", value: "NO" },
                  { label: "Concern", value: "CONCERN" },
                ]}
                error={errors.ethics}
                attempted={attempted}
              />
            </SectionCard>

            <SectionCard title="Language & Presentation *" icon={MessageSquare}>
              {errors.language && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{errors.language}</p>
                </div>
              )}
              <div className="space-y-1">
                {CHECKLIST_SECTIONS.language.map(([key, label]) => (
                  <CheckItem
                    key={key}
                    label={label}
                    checked={language[key]}
                    onChange={(val) => {
                      setLanguage((prev) => ({ ...prev, [key]: val }));
                      if (errors.language) setErrors((prev) => ({ ...prev, language: "" }));
                    }}
                  />
                ))}
              </div>
            </SectionCard>

            <NavBar page={1} onNext={handleSaveAndContinue} />
          </>
        )}

        {page === 2 && (
          <>
            <SectionCard title="Reviewer Comments *" icon={MessageSquare} teal>
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Comments for Author</FieldLabel>
                  <textarea
                    rows={6}
                    value={authorComments}
                    onChange={(e) => {
                      setAuthorComments(e.target.value);
                      if (errors.authorComments) setErrors((prev) => ({ ...prev, authorComments: "" }));
                    }}
                    placeholder="Provide constructive, detailed feedback for the author."
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all resize-none ${errors.authorComments ? "border-red-300 bg-red-50" : "border-[#c8d5e4] focus:border-[#0e7490] focus:ring-4 focus:ring-[#e0f2fe]"}`}
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
                      if (errors.editorComments) setErrors((prev) => ({ ...prev, editorComments: "" }));
                    }}
                    placeholder="Private comments visible only to the editor."
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all resize-none ${errors.editorComments ? "border-red-300 bg-red-50" : "border-[#c8d5e4] focus:border-[#0e7490] focus:ring-4 focus:ring-[#e0f2fe]"}`}
                    style={{ minHeight: "120px" }}
                  />
                  <ErrorMsg msg={errors.editorComments} />
                </div>
              </div>
            </SectionCard>

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
                {RECOMMENDATION_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-all ${recommendation === option.value ? "border-[#0e7490] bg-[#e0f2fe]" : "border-[#e2e8f0] bg-white hover:border-[#a0d4e8] hover:bg-[#f0f9ff]"}`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={option.value}
                      checked={recommendation === option.value}
                      onChange={() => {
                        setRecommendation(option.value);
                        if (errors.recommendation) setErrors((prev) => ({ ...prev, recommendation: "" }));
                      }}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: THEME.secondary }}
                    />
                    <span className={`text-sm font-bold ${recommendation === option.value ? "text-[#0e7490]" : "text-gray-700"}`}>
                      {option.label}
                    </span>
                    {recommendation === option.value && <CheckCircle className="w-4 h-4 text-[#0e7490] ml-auto" />}
                  </label>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="File Uploads *" icon={Upload} teal>
              <div className="bg-[#e0f2fe] border border-[#a0d4e8] rounded-xl px-5 py-4 mb-6">
                <p className="text-xs font-bold text-[#0c4a6e] mb-1">Upload Instructions</p>
                <p className="text-xs text-[#0e4f6a] leading-relaxed">
                  Both files are mandatory. Upload the manuscript file you are sending back to the editor and a point-by-point response to the editor's comments.
                </p>
              </div>

              <div className="space-y-8">
                <FileUploadBox
                  label="1. Revised Manuscript"
                  description="Upload the revised version of the manuscript."
                  fileMeta={files.revised}
                  uploading={uploading.revised}
                  progress={uploadProgress.revised}
                  error={errors.revised}
                  onPick={(e) => handleFileUpload("revised", e)}
                  onRemove={() => setFiles((prev) => ({ ...prev, revised: null }))}
                />

                <FileUploadBox
                  label="2. Response to Editor's Comments"
                  description="Upload a point-by-point response addressing each editor comment."
                  fileMeta={files.response}
                  uploading={uploading.response}
                  progress={uploadProgress.response}
                  error={errors.response}
                  onPick={(e) => handleFileUpload("response", e)}
                  onRemove={() => setFiles((prev) => ({ ...prev, response: null }))}
                />
              </div>
            </SectionCard>

            <NavBar
              page={2}
              onBack={() => {
                setErrors((prev) => ({ ...prev, submit: "" }));
                setPage(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onSubmit={handleSubmit}
              loading={submitting || uploading.revised || uploading.response}
            />
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 pb-4">
          JAIRAM · Journal of Advanced & Integrated Research in Acute Medicine · Peer Review System
        </p>
      </div>
    </div>
  );
}
