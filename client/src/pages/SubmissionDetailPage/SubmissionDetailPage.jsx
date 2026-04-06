import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Users,
  AlertCircle,
  ClipboardCheck,
  Scale,
  FileCheck,
  Info,
  X,
  ShieldCheck,
  ShieldAlert,
  MessageSquareWarning,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const STATUS_CFG = {
  DRAFT: { label: "Draft", color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" },
  SUBMITTED: { label: "Submitted", color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe" },
  UNDER_REVIEW: { label: "Under Review", color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  REVISION_REQUESTED: { label: "Revision Requested", color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted", color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  ACCEPTED: { label: "Accepted", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
  REJECTED: { label: "Rejected", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca" },
};

const CONSENT_DEADLINE_CFG = {
  ACTIVE: { label: "Active", color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  REMINDED: { label: "Reminded", color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
  NOTIFIED: { label: "Issue Reported", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca" },
  RESOLVED: { label: "Resolved", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
  AUTO_REJECTED: { label: "Auto Rejected", color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
};

const Field = ({ label, value, fullWidth }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: fullWidth ? "1 / -1" : "auto" }}>
    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </div>
    <div style={{ fontSize: "0.9rem", color: "#1e293b", lineHeight: 1.5, fontWeight: 500 }}>
      {value || "-"}
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={18} color="#0f3460" />}
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f3460" }}>{title}</div>
    </div>
    <div style={{ padding: "20px" }}>{children}</div>
  </div>
);

const Badge = ({ children, type = "default" }) => {
  const styles = {
    success: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    warning: { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
    danger: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
    info: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
    default: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  };
  const theme = styles[type] || styles.default;
  return (
    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: 20, color: theme.color, background: theme.bg, border: `1px solid ${theme.border}` }}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, accent = "#0f3460" }) => (
  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: accent }}>{value}</div>
  </div>
);

const ModalField = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </div>
    <div style={{ fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.5, wordBreak: "break-word" }}>
      {value || "-"}
    </div>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
};

const getCoAuthorPresentation = (coAuthor) => {
  const linkedName = coAuthor.userDetails
    ? `${coAuthor.userDetails.firstName || ""} ${coAuthor.userDetails.lastName || ""}`.trim()
    : "";
  const manualName = `${coAuthor.title || ""} ${coAuthor.firstName || ""} ${coAuthor.lastName || ""}`.trim();

  return {
    name: linkedName || manualName || (coAuthor.user ? `Author ID: ${coAuthor.user}` : "Unnamed Co-Author"),
    email: coAuthor.userDetails?.email || coAuthor.email || "-",
  };
};

const getResolvedByPresentation = (resolvedBy) => {
  if (!resolvedBy) return "-";
  if (typeof resolvedBy === "string") return resolvedBy;
  const name = `${resolvedBy.firstName || ""} ${resolvedBy.lastName || ""}`.trim();
  return name || resolvedBy.email || resolvedBy._id || "-";
};

const getConsentIssueReasonLabel = (issueType) => {
  if (issueType === "REJECTED") return "Rejected by Co-Author";
  if (issueType === "NO_RESPONSE") return "No Response from Co-Author";
  return "Unknown Consent Issue";
};

const getConsentIssueFinalStateLabel = (consentDeadlineStatus, issue) => {
  if (issue?.resolvedAt) return "Resolved by Editor";
  if (consentDeadlineStatus === "AUTO_REJECTED") return "Auto-Rejected by System";
  if (issue?.issueType === "REJECTED") return "Awaiting Editor Review After Rejection";
  if (issue?.issueType === "NO_RESPONSE") return "Awaiting Editor Review After No Response";
  if (consentDeadlineStatus === "RESOLVED") return "Resolved";
  return "Pending";
};

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [majorityStatus, setMajorityStatus] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);

  const isEditor = user?.role === "EDITOR";

  const fetchSubmission = async () => {
    const res = await api.get(`/submissions/${id}`);
    const payload = res.data?.data ?? res.data ?? null;
    setSubmission(payload);
    return payload;
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchSubmission();
      } catch (err) {
        setError(err.response?.data?.message ?? "Failed to load submission details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!showAdditionalInfo || !isEditor) return;

    const loadAdditionalInfo = async () => {
      try {
        setInfoLoading(true);
        setInfoError("");
        const response = await api.get(`/submissions/${id}/reviewer-majority-status`);
        setMajorityStatus(response.data?.data?.majorityStatus ?? null);
      } catch (err) {
        setInfoError(err.response?.data?.message ?? "Failed to load additional submission information.");
      } finally {
        setInfoLoading(false);
      }
    };

    loadAdditionalInfo();
  }, [showAdditionalInfo, id, isEditor]);

  if (!user) return null;

  const statusCfg = STATUS_CFG[submission?.status] || STATUS_CFG.DRAFT;
  const consentDeadlineCfg = CONSENT_DEADLINE_CFG[submission?.consentDeadlineStatus] || CONSENT_DEADLINE_CFG.ACTIVE;
  const suggestedReviewerResponses = submission?.suggestedReviewerResponses || {
    totalSuggested: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
    majorityMet: false,
  };

  const consentIssues = Array.isArray(submission?.consentIssues) ? submission.consentIssues : [];
  const unresolvedIssues = consentIssues.filter((issue) => !issue.resolvedAt);
  const hasConsentIssue = consentIssues.length > 0;
  const canResolveConsentIssue =
    isEditor &&
    submission?.consentDeadlineStatus !== "RESOLVED" &&
    submission?.consentDeadlineStatus !== "AUTO_REJECTED" &&
    unresolvedIssues.length > 0;

  const handleResolveConsentIssue = async () => {
    const trimmed = resolutionNote.trim();

    if (trimmed.length < 10) {
      setResolveError("Please provide at least 10 characters explaining the manual approval.");
      return;
    }

    try {
      setResolveLoading(true);
      setResolveError("");

      await api.post(`/submissions/${id}/editor-approve-consent`, {
        resolutionNote: trimmed,
      });

      await fetchSubmission();
      setResolutionNote("");
      setShowAdditionalInfo(false);
    } catch (err) {
      setResolveError(err.response?.data?.message ?? "Failed to resolve consent issue.");
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 60 }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", minHeight: 64, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0f3460";
              e.currentTarget.style.color = "#0f3460";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {isEditor && (
            <>
              <button
                onClick={() => navigate(`/submissions/${id}/timeline`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #dbe5f0", background: "#f8fbff", color: "#0f3460", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#eef5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f8fbff";
                }}
              >
                <ClipboardCheck size={16} /> View Timeline
              </button>

              <button
                onClick={() => {
                  setInfoError("");
                  setResolveError("");
                  setShowAdditionalInfo(true);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #dbe5f0", background: "#f8fbff", color: "#0f3460", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#eef5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f8fbff";
                }}
              >
                <ShieldCheck size={16} /> Additional Information
              </button>
            </>
          )}

          <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "1.1rem" }}>Submission Overview</div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0f3460", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>Fetching submission data...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 64, background: "#fff", borderRadius: 12, border: "1px solid #fecaca" }}>
            <AlertCircle size={48} color="#dc2626" />
            <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0f172a" }}>Could not load submission</div>
            <div style={{ color: "#64748b" }}>{error}</div>
          </div>
        )}

        {!loading && !error && submission && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 350px", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#0f3460", fontWeight: 700, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>
                        {submission.submissionNumber || "DRAFT"}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                        {statusCfg.label}
                      </span>
                      {submission.paymentStatus && <Badge type="success">Payment Verified</Badge>}
                      {isEditor && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: consentDeadlineCfg.color, background: consentDeadlineCfg.bg, border: `1px solid ${consentDeadlineCfg.border}` }}>
                          Consent {consentDeadlineCfg.label}
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                      {submission.title}
                    </h1>
                    <div style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500 }}>
                      Running Title: {submission.runningTitle || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <Section title="Abstract" icon={FileText}>
                <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {submission.abstract}
                </p>
                {submission.keywords?.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center" }}>
                      Keywords:
                    </span>
                    {submission.keywords.map((kw, i) => (
                      <span key={i} style={{ fontSize: "0.75rem", color: "#0369a1", background: "#f0f9ff", padding: "4px 12px", borderRadius: 16, fontWeight: 600 }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Authors & Co-Authors" icon={Users}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                          {submission.author?.firstName} {submission.author?.lastName}
                        </div>
                        {submission.isCorrespondingAuthor && <Badge type="success">Corresponding Author</Badge>}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 4 }}>{submission.author?.email}</div>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Submitting Author</div>
                  </div>

                  {submission.coAuthors?.map((ca, i) => {
                    const display = getCoAuthorPresentation(ca);
                    return (
                      <div key={i} style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>{display.name}</div>
                            {ca.isCorresponding && <Badge type="success">Corresponding</Badge>}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>{display.email}</div>
                          {ca.source && (
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                              Source: {ca.source.replace("_", " ")}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Order: {ca.order}</div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {submission.suggestedReviewers?.length > 0 && (
                <Section title="Suggested Reviewers" icon={User}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {submission.suggestedReviewers.map((reviewer, i) => (
                      <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {reviewer.title} {reviewer.firstName} {reviewer.lastName}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 8 }}>{reviewer.email}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                            <span style={{ fontWeight: 600 }}>Spec:</span> {reviewer.specialization}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                            <span style={{ fontWeight: 600 }}>Inst:</span> {reviewer.institution}, {reviewer.country}
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                          <Badge type={reviewer.invitationStatus === "ACCEPTED" ? "success" : "default"}>{reviewer.invitationStatus}</Badge>
                          {reviewer.editorApproved && <Badge type="success">Approved</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {submission.checklist && (
                <Section title="Compliance & Checklist" icon={ClipboardCheck}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f3460", marginBottom: 12 }}>Checklist Summary</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {["YES", "NO", "N/A"].map((type) => {
                          const count = submission.checklist.responses.filter((r) => r.response === type).length;
                          if (count === 0) return null;
                          return (
                            <div key={type} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "8px 12px", background: "#f8fafc", borderRadius: 6 }}>
                              <span style={{ fontWeight: 600, color: "#475569" }}>Answered {type}</span>
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Field label="COPE Compliance" value={submission.checklist.copeCompliance ? "Verified compliant" : "Pending"} />
                      <Field label="Checklist Completed At" value={new Date(submission.checklist.completedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
                    </div>
                  </div>
                </Section>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Section title="Submission Details" icon={Info}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px" }}>
                  <Field label="Article Type" value={submission.articleType} fullWidth />
                  <Field label="Submitted" value={submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("en-IN") : "-"} />
                  <Field label="Last Updated" value={submission.lastModifiedAt ? new Date(submission.lastModifiedAt).toLocaleDateString("en-IN") : "-"} />
                  <Field label="Word Count" value={submission.manuscriptDetails?.wordCount} />
                  <Field label="Total Pages" value={submission.manuscriptDetails?.numberOfPages} />

                  <div style={{ gridColumn: "1 / -1", height: 1, background: "#e2e8f0", margin: "8px 0" }} />

                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Assigned Editor</div>
                    {submission.assignedEditor ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0f3460", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                          {submission.assignedEditor.firstName[0]}
                          {submission.assignedEditor.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>
                            {submission.assignedEditor.firstName} {submission.assignedEditor.lastName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{submission.assignedEditor.email}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontStyle: "italic" }}>Awaiting Assignment</div>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Ethics & Registrations" icon={Scale}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 4 }}>IEC Approval</div>
                    {submission.iecApproval?.hasIEC ? (
                      <div style={{ fontSize: "0.85rem", color: "#15803d", background: "#dcfce7", padding: "8px 12px", borderRadius: 6, fontWeight: 500, border: "1px solid #bbf7d0" }}>
                        {submission.iecApproval.iecDetails}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Not Applicable / None</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Field label="Prospero" value={submission.prosperoRegistration?.hasProspero ? "Yes" : "No"} />
                    <Field label="Trial Reg." value={submission.trialRegistration?.hasTrial ? "Yes" : "No"} />
                    <Field label="COI" value={submission.conflictOfInterest?.hasConflict ? "Reported" : "None"} />
                  </div>
                </div>
              </Section>

              <Section title="Manuscript Files" icon={FileCheck}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Cover Letter", file: submission.coverLetter },
                    { label: "Blind Manuscript", file: submission.blindManuscriptFile },
                  ].map(
                    (item, idx) =>
                      item.file && (
                        <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                            <div style={{ background: "#e0f2fe", padding: "8px", borderRadius: 6 }}>
                              <FileText size={16} color="#0369a1" />
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{(item.file.fileSize / 1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                          <a
                            href={item.file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ padding: "6px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, color: "#0f3460", textDecoration: "none", transition: "all 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            View
                          </a>
                        </div>
                      )
                  )}
                </div>
              </Section>
            </div>
          </div>
        )}
      </div>

      {showAdditionalInfo && isEditor && (
        <div
          onClick={() => {
            if (!resolveLoading) {
              setShowAdditionalInfo(false);
              setResolveError("");
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 120,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1080px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #dbe5f0",
              borderRadius: 18,
              boxShadow: "0 24px 64px rgba(15, 23, 42, 0.20)",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>Additional Submission Information</div>
                <div style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 4 }}>
                  Reviewer majority status and editor-only consent issue resolution
                </div>
              </div>
              <button
                onClick={() => {
                  if (!resolveLoading) {
                    setShowAdditionalInfo(false);
                    setResolveError("");
                  }
                }}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              {infoLoading && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, color: "#64748b", fontWeight: 600 }}>
                  Loading additional information...
                </div>
              )}

              {infoError && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 16, color: "#9a3412", fontWeight: 600 }}>
                  {infoError}
                </div>
              )}

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ShieldCheck size={18} color="#0f3460" />
                    <div style={{ fontWeight: 800, color: "#0f3460" }}>Suggested Reviewer Response</div>
                  </div>
                  <Badge type={majorityStatus?.majorityMet ? "success" : "warning"}>
                    {majorityStatus?.majorityMet ? "Majority Met" : "Majority Pending"}
                  </Badge>
                </div>

                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
                    <StatCard label="Total Suggested" value={suggestedReviewerResponses.totalSuggested ?? 0} />
                    <StatCard label="Accepted" value={suggestedReviewerResponses.accepted ?? 0} accent="#15803d" />
                    <StatCard label="Declined" value={suggestedReviewerResponses.declined ?? 0} accent="#b91c1c" />
                    <StatCard label="Pending" value={suggestedReviewerResponses.pending ?? 0} accent="#b45309" />
                    <StatCard label="Majority Met" value={(majorityStatus?.majorityMet ?? suggestedReviewerResponses.majorityMet) ? "Yes" : "No"} accent={(majorityStatus?.majorityMet ?? suggestedReviewerResponses.majorityMet) ? "#15803d" : "#b45309"} />
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      Majority Status
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>
                      {majorityStatus?.message || "No majority information available."}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MessageSquareWarning size={18} color="#0f3460" />
                    <div style={{ fontWeight: 800, color: "#0f3460" }}>Co-Author Consent Issue</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: consentDeadlineCfg.color, background: consentDeadlineCfg.bg, border: `1px solid ${consentDeadlineCfg.border}` }}>
                      {consentDeadlineCfg.label}
                    </span>
                    <Badge type={hasConsentIssue ? "warning" : "success"}>
                      {hasConsentIssue ? `${consentIssues.length} Issue${consentIssues.length > 1 ? "s" : ""}` : "No Consent Issue"}
                    </Badge>
                  </div>
                </div>

                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                  {!hasConsentIssue && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle2 size={18} color="#15803d" />
                      <div style={{ fontSize: "0.92rem", color: "#166534", fontWeight: 700 }}>No Consent Issue</div>
                    </div>
                  )}

                  {hasConsentIssue &&
                    consentIssues.map((issue, index) => {
                      const isResolved = Boolean(issue.resolvedAt);
                      return (
                        <div key={`${issue.coAuthorEmail}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                          <div style={{ padding: "12px 16px", background: isResolved ? "#f0fdf4" : "#fff7ed", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {issue.coAuthorName || issue.coAuthorEmail || `Issue ${index + 1}`}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Badge type={issue.issueType === "REJECTED" ? "danger" : "warning"}>
                                {issue.issueType || "UNKNOWN"}
                              </Badge>
                              <Badge type={isResolved ? "success" : "warning"}>
                                {isResolved ? "Resolved" : "Unresolved"}
                              </Badge>
                            </div>
                          </div>

                          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                            <ModalField label="Co-Author ID" value={issue.coAuthorId} />
                            <ModalField label="Co-Author Email" value={issue.coAuthorEmail} />
                            <ModalField label="Co-Author Name" value={issue.coAuthorName} />
                            <ModalField label="Issue Type" value={issue.issueType} />
                            <ModalField label="Issue Reason" value={getConsentIssueReasonLabel(issue.issueType)} />
                            <ModalField label="Final State" value={getConsentIssueFinalStateLabel(submission?.consentDeadlineStatus, issue)} />
                            <ModalField label="Reported At" value={formatDateTime(issue.reportedAt)} />
                            <ModalField label="Resolved At" value={formatDateTime(issue.resolvedAt)} />
                            <ModalField label="Resolved By" value={getResolvedByPresentation(issue.resolvedBy)} />
                            <div style={{ gridColumn: "span 3" }}>
                              <ModalField label="Resolution Note" value={issue.resolutionNote || (isResolved ? "-" : "Pending editor resolution")} />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {canResolveConsentIssue && (
                    <div style={{ background: "#f8fafc", border: "1px solid #dbe5f0", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ShieldAlert size={18} color="#0f3460" />
                        <div style={{ fontWeight: 800, color: "#0f3460" }}>Resolve Consent Issue</div>
                      </div>

                      <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6 }}>
                        This action will mark all unresolved consent issues as resolved, set the submission consent status to <strong>RESOLVED</strong>, and move the submission back to <strong>SUBMITTED</strong> if it is currently in draft.
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                          Resolution Note <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <textarea
                          value={resolutionNote}
                          onChange={(e) => {
                            setResolutionNote(e.target.value);
                            if (resolveError) setResolveError("");
                          }}
                          placeholder="Explain why the submission is being approved despite the consent issue..."
                          rows={5}
                          style={{
                            width: "100%",
                            resize: "vertical",
                            borderRadius: 10,
                            border: "1px solid #cbd5e1",
                            padding: "12px 14px",
                            fontSize: "0.92rem",
                            color: "#0f172a",
                            outline: "none",
                            background: "#fff",
                            boxSizing: "border-box",
                          }}
                        />
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Minimum 10 characters required.</div>
                      </div>

                      {resolveError && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "10px 12px", fontSize: "0.85rem", fontWeight: 600 }}>
                          {resolveError}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setResolutionNote("");
                            setResolveError("");
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            color: "#475569",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleResolveConsentIssue}
                          disabled={resolveLoading}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "1px solid #0f3460",
                            background: resolveLoading ? "#94a3b8" : "#0f3460",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: resolveLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {resolveLoading ? "Resolving..." : "Resolve Consent Issue"}
                        </button>
                      </div>
                    </div>
                  )}

                  {submission?.consentDeadlineStatus === "AUTO_REJECTED" && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 16px", color: "#991b1b", fontWeight: 700 }}>
                      This consent issue can no longer be resolved because the submission has already been auto-rejected.
                    </div>
                  )}

                  {submission?.consentDeadlineStatus === "RESOLVED" && hasConsentIssue && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", color: "#166534", fontWeight: 700 }}>
                      Consent issue has already been resolved.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetailPage;