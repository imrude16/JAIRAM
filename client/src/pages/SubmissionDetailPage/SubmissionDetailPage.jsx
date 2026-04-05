import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FileText, User, Users, CheckCircle, 
  AlertCircle, ClipboardCheck, Scale, FileCheck, Info 
} from "lucide-react";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const STATUS_CFG = {
  DRAFT:                  { label: "Draft",              color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" },
  SUBMITTED:              { label: "Submitted",          color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe" },
  UNDER_REVIEW:           { label: "Under Review",       color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  REVISION_REQUESTED:     { label: "Revision Requested", color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted",     color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  ACCEPTED:               { label: "Accepted",           color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
  REJECTED:               { label: "Rejected",           color: "#b91c1c", bg: "#fee2e2", border: "#fecaca" },
};

// Reusable UI Components for consistency
const Field = ({ label, value, fullWidth }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: fullWidth ? "1 / -1" : "auto" }}>
    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: "0.9rem", color: "#1e293b", lineHeight: 1.5, fontWeight: 500 }}>{value || "—"}</div>
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
    default: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" }
  };
  const theme = styles[type] || styles.default;
  return (
    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: 20, color: theme.color, background: theme.bg, border: `1px solid ${theme.border}` }}>
      {children}
    </span>
  );
};

const getCoAuthorPresentation = (coAuthor) => {
  const linkedName = coAuthor.userDetails
    ? `${coAuthor.userDetails.firstName || ""} ${coAuthor.userDetails.lastName || ""}`.trim()
    : "";
  const manualName = `${coAuthor.title || ""} ${coAuthor.firstName || ""} ${coAuthor.lastName || ""}`.trim();

  return {
    name: linkedName || manualName || (coAuthor.user ? `Author ID: ${coAuthor.user}` : "Unnamed Co-Author"),
    email: coAuthor.userDetails?.email || coAuthor.email || "—",
  };
};

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/auth/login", { replace: true }); return; }
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/submissions/${id}`);
        setSubmission(res.data?.data ?? res.data ?? null);
      } catch (err) {
        setError(err.response?.data?.message ?? "Failed to load submission details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id, user, navigate]);

  if (!user) return null;

  const statusCfg = STATUS_CFG[submission?.status] || STATUS_CFG.DRAFT;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 60 }}>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/dashboard")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f3460"; e.currentTarget.style.color = "#0f3460"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => navigate(`/submissions/${id}/timeline`)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #dbe5f0", background: "#f8fbff", color: "#0f3460", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#eef5ff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fbff"; }}
          >
            <ClipboardCheck size={16} /> View Timeline
          </button>
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
            
            {/* LEFT COLUMN: Main Manuscript Data */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Header Card */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#0f3460", fontWeight: 700, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>
                        {submission.submissionNumber || "DRAFT"}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                        {statusCfg.label}
                      </span>
                      {submission.paymentStatus && <Badge type="success">Payment Verified</Badge>}
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                      {submission.title}
                    </h1>
                    <div style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500 }}>
                      Running Title: {submission.runningTitle || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <Section title="Abstract" icon={FileText}>
                <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {submission.abstract}
                </p>
                {submission.keywords?.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center" }}>Keywords:</span>
                    {submission.keywords.map((kw, i) => (
                      <span key={i} style={{ fontSize: "0.75rem", color: "#0369a1", background: "#f0f9ff", padding: "4px 12px", borderRadius: 16, fontWeight: 600 }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Authorship Section */}
              <Section title="Authors & Co-Authors" icon={Users}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Primary Author */}
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

                  {/* Co-Authors rendering strictly what the backend provides */}
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
                          {ca.source && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Source: {ca.source.replace('_', ' ')}</div>}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Order: {ca.order}</div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Suggested Reviewers Section */}
              {submission.suggestedReviewers?.length > 0 && (
                <Section title="Suggested Reviewers" icon={User}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {submission.suggestedReviewers.map((reviewer, i) => (
                      <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{reviewer.title} {reviewer.firstName} {reviewer.lastName}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 8 }}>{reviewer.email}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}><span style={{ fontWeight: 600 }}>Spec:</span> {reviewer.specialization}</div>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}><span style={{ fontWeight: 600 }}>Inst:</span> {reviewer.institution}, {reviewer.country}</div>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                          <Badge type={reviewer.invitationStatus === 'ACCEPTED' ? 'success' : 'default'}>{reviewer.invitationStatus}</Badge>
                          {reviewer.editorApproved && <Badge type="success">Approved</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Checklist & Compliance */}
              {submission.checklist && (
                <Section title="Compliance & Checklist" icon={ClipboardCheck}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f3460", marginBottom: 12 }}>Checklist Summary</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {['YES', 'NO', 'N/A'].map(type => {
                          const count = submission.checklist.responses.filter(r => r.response === type).length;
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

            {/* RIGHT COLUMN: Sidebar (Meta & Files) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Key Meta Information */}
              <Section title="Submission Details" icon={Info}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px" }}>
                  <Field label="Article Type" value={submission.articleType} fullWidth />
                  <Field label="Submitted" value={submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("en-IN") : "—"} />
                  <Field label="Last Updated" value={submission.lastModifiedAt ? new Date(submission.lastModifiedAt).toLocaleDateString("en-IN") : "—"} />
                  <Field label="Word Count" value={submission.manuscriptDetails?.wordCount} />
                  <Field label="Total Pages" value={submission.manuscriptDetails?.numberOfPages} />
                  
                  <div style={{ gridColumn: "1 / -1", height: 1, background: "#e2e8f0", margin: "8px 0" }} />
                  
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Assigned Editor</div>
                    {submission.assignedEditor ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0f3460", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                          {submission.assignedEditor.firstName[0]}{submission.assignedEditor.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{submission.assignedEditor.firstName} {submission.assignedEditor.lastName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{submission.assignedEditor.email}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontStyle: "italic" }}>Awaiting Assignment</div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Ethics & Approvals */}
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

              {/* Uploaded Documents */}
              <Section title="Manuscript Files" icon={FileCheck}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Cover Letter", file: submission.coverLetter },
                    { label: "Blind Manuscript", file: submission.blindManuscriptFile }
                  ].map((item, idx) => item.file && (
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
                      <a href={item.file.fileUrl} target="_blank" rel="noreferrer"
                        style={{ padding: "6px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, color: "#0f3460", textDecoration: "none", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </Section>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetailPage;
