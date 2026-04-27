import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  GitBranch,
  Layers3,
  ShieldCheck,
  User,
  ClipboardCheck,
  MessageSquareText,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { fetchSubmissionTimeline } from "../../services/dashboardService";
import { openFilePreview } from "../../utils/filePreview";

const STATUS_CFG = {
  DRAFT: { label: "Draft", color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" },
  SUBMITTED: { label: "Submitted", color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe" },
  UNDER_REVIEW: { label: "Under Review", color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  REVISION_REQUESTED: { label: "Revision Requested", color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted", color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  ACCEPTED: { label: "Accepted", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
  REJECTED: { label: "Rejected", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca" },
  IN_PROGRESS: { label: "In Progress", color: "#0f766e", bg: "#ccfbf1", border: "#99f6e4" },
  COMPLETED: { label: "Completed", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
};

const STAGE_LABELS = {
  INITIAL_SUBMISSION: "Initial Submission",
  EDITOR_TO_TECH_EDITOR: "Editor to Technical Editor",
  TECH_EDITOR_TO_EDITOR: "Technical Editor to Editor",
  EDITOR_TO_REVIEWER: "Editor to Reviewers",
  REVIEWER_TO_EDITOR: "Reviewer to Editor",
  EDITOR_TO_AUTHOR: "Editor to Author",
};

const DECISION_STAGE_LABELS = {
  INITIAL_SCREENING: "Initial Screening",
  POST_TECH_EDITOR: "Post Technical Editor",
  POST_REVIEWER: "Post Reviewer",
  FINAL_DECISION: "Final Decision",
};

const fmtDate = (value, withTime = true) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
};

const formatFileSize = (size) => {
  if (!size && size !== 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileUrl = (file) => (typeof file === "string" ? file : file?.fileUrl || null);
const getFileName = (file, fallback = "File") => {
  if (typeof file === "string") {
    try {
      return file.split("/").pop().split("?")[0];
    } catch {
      return fallback;
    }
  }
  return file?.fileName || fallback;
};
const getFileSize = (file) => (typeof file === "string" ? null : file?.fileSize ?? null);
const getMimeType = (file) => (typeof file === "string" ? null : file?.mimeType ?? null);
const getUploadedAt = (file) => (typeof file === "string" ? null : file?.uploadedAt ?? null);
const getCycleId = (cycleId) => {
  if (!cycleId) return null;
  if (typeof cycleId === "string") return cycleId;
  if (typeof cycleId === "object" && cycleId._id) return cycleId._id.toString();
  if (typeof cycleId.toString === "function") return cycleId.toString();
  return null;
};

const Field = ({ label, value, fullWidth = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: fullWidth ? "1 / -1" : "auto" }}>
    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: "0.9rem", color: "#1e293b", lineHeight: 1.55, fontWeight: 500 }}>{value || "—"}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.DRAFT;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

const AccordionCard = ({ title, subtitle, icon: Icon, isOpen, onToggle, badge, children, level = "primary" }) => (
  <div style={{
    background: "#fff",
    border: `1px solid ${level === "primary" ? "#dbe5f0" : "#e2e8f0"}`,
    borderRadius: 14,
    boxShadow: level === "primary" ? "0 8px 22px rgba(15, 52, 96, 0.06)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
  }}>
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        padding: level === "primary" ? "18px 22px" : "16px 18px",
        border: "none",
        background: level === "primary" ? "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: level === "primary" ? "#e8eef6" : "#f1f5f9",
          color: "#0f3460",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: level === "primary" ? "1rem" : "0.92rem", fontWeight: 800, color: "#0f172a" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {badge}
        {isOpen ? <ChevronDown size={18} color="#0f3460" /> : <ChevronRight size={18} color="#64748b" />}
      </div>
    </button>
    {isOpen && (
      <div style={{ padding: level === "primary" ? "0 22px 22px" : "0 18px 18px", borderTop: "1px solid #f1f5f9" }}>
        {children}
      </div>
    )}
  </div>
);

const FileList = ({ files, title = "Files" }) => {
  if (!files || files.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f3460", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {files.map((file, index) => {
          const fileUrl = getFileUrl(file);
          return (
            <div key={`${getFileName(file, "file")}-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getFileName(file)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                    {formatFileSize(getFileSize(file))}
                    {getMimeType(file) ? ` • ${getMimeType(file)}` : ""}
                    {getUploadedAt(file) ? ` • ${fmtDate(getUploadedAt(file))}` : ""}
                  </div>
                </div>
              </div>
              {fileUrl && (
                <button
                  type="button"
                  onClick={() => openFilePreview(file)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #dbe5f0", background: "#fff", color: "#0f3460", textDecoration: "none", fontSize: "0.76rem", fontWeight: 700, flexShrink: 0, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Open
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChecklistSummary = ({ checklist }) => {
  const responses = checklist?.responses || [];
  if (!responses.length) return null;

  const grouped = responses.reduce((acc, item) => {
    const key = item.sectionId || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.response);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f3460", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Reviewer Checklist Summary
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {Object.entries(grouped).map(([sectionId, values]) => (
          <div key={sectionId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", padding: "12px 14px" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {sectionId.replaceAll("_", " ")}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: 10 }}>
              {values.length} response{values.length > 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {values.map((value, index) => (
                <span key={`${sectionId}-${index}`} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f3460", background: "#e8eef6", padding: "4px 8px", borderRadius: 999 }}>
                  {typeof value === "boolean" ? (value ? "Checked" : "Unchecked") : String(value)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {checklist?.completedAt && (
        <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
          Completed: {fmtDate(checklist.completedAt)}
        </div>
      )}
    </div>
  );
};

const TimelineRemarkPanel = ({ stage, remark, showReviewerIdentity, version }) => {
  if (!remark) {
    return (
      <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
        No timeline remark recorded for this stage.
      </div>
    );
  }

  const blocks = [];

  if (remark.remarks) {
    blocks.push(
      <Field key="remarks" label="Remarks" value={remark.remarks} fullWidth />
    );
  }

  if (remark.recommendation) {
    blocks.push(
      <Field key="recommendation" label="Recommendation" value={remark.recommendation.replaceAll("_", " ")} />
    );
  }

  if (remark.sentAt) {
    blocks.push(<Field key="sentAt" label="Sent At" value={fmtDate(remark.sentAt)} />);
  }

  if (remark.reviewedAt) {
    blocks.push(<Field key="reviewedAt" label="Reviewed At" value={fmtDate(remark.reviewedAt)} />);
  }

  if (showReviewerIdentity && stage === "REVIEWER_TO_EDITOR") {
    const name = `${version?.uploadedBy?.firstName || ""} ${version?.uploadedBy?.lastName || ""}`.trim();
    blocks.push(<Field key="reviewerName" label="Reviewer Name" value={name || "—"} />);
    blocks.push(<Field key="reviewerEmail" label="Reviewer Email" value={version?.uploadedBy?.email || "—"} />);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {blocks.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 14px" }}>
          {blocks}
        </div>
      )}
      {remark.revisedManuscript && <FileList files={[remark.revisedManuscript]} title="Revised Manuscript" />}
      {remark.responseToEditorComments && <FileList files={[remark.responseToEditorComments]} title="Response to Editor's Comment" />}
      {remark.attachments?.length > 0 && <FileList files={remark.attachments} title="Attachments" />}
      {remark.reviewerChecklist && <ChecklistSummary checklist={remark.reviewerChecklist} />}
    </div>
  );
};

const SubmissionTimelinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCycles, setOpenCycles] = useState({});
  const [openVersions, setOpenVersions] = useState({});

  const isPrivileged = user?.role === "EDITOR" || user?.role === "ADMIN";

  useEffect(() => {
    if (!user) return;

    const loadTimeline = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubmissionTimeline(id);
        setTimeline(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load timeline.");
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [id, user, navigate]);

  const cycles = timeline?.cycles || [];
  const versions = timeline?.versions || [];

  useEffect(() => {
    if (!cycles.length) return;
    setOpenCycles((prev) => {
      if (Object.keys(prev).length) return prev;
      return { [cycles[0]._id]: true };
    });
  }, [cycles]);

  const versionsByCycle = useMemo(() => {
    const map = new Map();
    versions.forEach((version) => {
      const cycleId = getCycleId(version.cycleId);
      if (!map.has(cycleId)) map.set(cycleId, []);
      map.get(cycleId).push(version);
    });
    map.forEach((list) => list.sort((a, b) => (a.versionNumber || 0) - (b.versionNumber || 0)));
    return map;
  }, [versions]);

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 60 }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`/submissions/${id}`, { replace: true });
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.08rem" }}>Submission Timeline</div>
              <div style={{ fontSize: "0.76rem", color: "#64748b" }}>Accordion view of workflow progression across cycles and versions</div>
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: isPrivileged ? "#7c3aed" : "#0f3460", background: isPrivileged ? "#ede9fe" : "#e8eef6", borderRadius: 999, padding: "4px 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {isPrivileged ? user.role : "Author View"}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {loading && (
          <div style={{ minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0f3460", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "0.92rem", color: "#64748b", fontWeight: 500 }}>Preparing manuscript timeline…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: 40, background: "#fff", border: "1px solid #fecaca", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#991b1b", marginBottom: 10 }}>Could not load timeline</div>
            <div style={{ color: "#64748b", marginBottom: 18 }}>{error}</div>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`/submissions/${id}`, { replace: true });
                }
              }}
              style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#0f3460", fontWeight: 700, cursor: "pointer" }}
            >
              Back to Submission
            </button>
          </div>
        )}

        {!loading && !error && timeline && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px", boxShadow: "0 10px 30px rgba(15, 52, 96, 0.05)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#0f3460", fontWeight: 800, background: "#f1f5f9", padding: "4px 8px", borderRadius: 8 }}>
                      {timeline.submission?.submissionNumber || "—"}
                    </span>
                    <StatusBadge status={timeline.submission?.status} />
                  </div>
                  <h1 style={{ margin: "0 0 8px", fontSize: "1.55rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                    {timeline.submission?.title}
                  </h1>
                  <div style={{ color: "#64748b", fontSize: "0.88rem" }}>
                    Complete review-cycle history for this manuscript submission
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(120px, 1fr))", gap: 12, minWidth: 260 }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", background: "#f8fafc" }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cycles</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f3460", marginTop: 4 }}>{cycles.length}</div>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", background: "#f8fafc" }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Versions</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f3460", marginTop: 4 }}>{versions.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {cycles.map((cycle) => {
              const cycleVersions = versionsByCycle.get(getCycleId(cycle._id)) || [];
              const isCycleOpen = !!openCycles[cycle._id];
              return (
                <AccordionCard
                  key={cycle._id}
                  icon={Layers3}
                  title={`Cycle ${cycle.cycleNumber}`}
                  subtitle={`${cycleVersions.length} version${cycleVersions.length !== 1 ? "s" : ""} recorded in this cycle`}
                  badge={<StatusBadge status={cycle.status} />}
                  isOpen={isCycleOpen}
                  onToggle={() => setOpenCycles((prev) => ({ ...prev, [cycle._id]: !prev[cycle._id] }))}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 14px" }}>
                      <Field label="Cycle Number" value={cycle.cycleNumber} />
                      <Field label="Cycle Status" value={STATUS_CFG[cycle.status]?.label || cycle.status} />
                      <Field label="Created At" value={fmtDate(cycle.createdAt)} />
                      <Field label="Updated At" value={fmtDate(cycle.updatedAt)} />
                    </div>

                    {cycle.editorDecision && (
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }}>
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                          <ShieldCheck size={17} color="#0f3460" />
                          <div style={{ fontWeight: 800, color: "#0f3460", fontSize: "0.9rem" }}>Editor Decision</div>
                        </div>
                        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 14px" }}>
                          <Field label="Type" value={cycle.editorDecision.type} />
                          <Field label="Decision Number" value={cycle.editorDecision.decisionNumber} />
                          <Field label="Decision Stage" value={DECISION_STAGE_LABELS[cycle.editorDecision.decisionStage] || cycle.editorDecision.decisionStage} />
                          <Field label="Decided At" value={fmtDate(cycle.editorDecision.decidedAt)} />
                          <Field label="Reason" value={cycle.editorDecision.reason} fullWidth />
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                      {[
                        {
                          key: "tech",
                          title: "Editor to Technical Editor",
                          icon: MessageSquareText,
                          block: cycle.editorRemarksForTechEditor,
                        },
                        {
                          key: "reviewers",
                          title: "Editor to Reviewers",
                          icon: GitBranch,
                          block: cycle.editorRemarksForReviewers,
                        },
                        {
                          key: "author",
                          title: "Editor to Author",
                          icon: User,
                          block: cycle.editorRemarksForAuthor,
                        },
                      ].map(({ key, title, icon: Icon, block }) => (
                        <div key={key} style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
                          <div style={{ padding: "13px 15px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon size={16} color="#0f3460" />
                            <div style={{ fontWeight: 800, color: "#0f3460", fontSize: "0.84rem" }}>{title}</div>
                          </div>
                          <div style={{ padding: "14px 15px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {block ? (
                              <>
                                <Field label="Remarks" value={block.remarks} />
                                {block.revisedManuscript && <FileList files={[block.revisedManuscript]} title="Revised Manuscript" />}
                                {block.attachments?.length > 0 && <FileList files={block.attachments} title="Attachments" />}
                                <Field label={title === "Editor to Author" ? "Sent At" : "Sent At"} value={fmtDate(block.sentAt)} />
                              </>
                            ) : (
                              <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>No remarks recorded in this block.</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
                        <Clock3 size={16} color="#0f3460" />
                        <div style={{ fontWeight: 800, color: "#0f3460", fontSize: "0.95rem" }}>Chronological Version Timeline</div>
                      </div>

                      {cycleVersions.length === 0 ? (
                        <div style={{ padding: "18px 16px", border: "1px dashed #cbd5e1", borderRadius: 12, color: "#94a3b8", fontStyle: "italic" }}>
                          No manuscript versions recorded for this cycle.
                        </div>
                      ) : (
                        cycleVersions.map((version) => {
                          const isVersionOpen = !!openVersions[version._id];
                          const shouldHideReviewerIdentity =
                            !isPrivileged && version.currentStage === "REVIEWER_TO_EDITOR";
                          const uploaderName = `${version.uploadedBy?.firstName || ""} ${version.uploadedBy?.lastName || ""}`.trim();
                          return (
                            <AccordionCard
                              key={version._id}
                              level="secondary"
                              icon={FileText}
                              title={`Version ${version.versionNumber} • ${STAGE_LABELS[version.currentStage] || version.currentStage}`}
                              subtitle={`${uploaderName || "Unknown uploader"}${version.uploaderRole ? ` • ${version.uploaderRole}` : ""} • ${fmtDate(version.createdAt)}`}
                              badge={<span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#0f3460", background: "#e8eef6", borderRadius: 999, padding: "4px 10px" }}>{version.currentStage}</span>}
                              isOpen={isVersionOpen}
                              onToggle={() => setOpenVersions((prev) => ({ ...prev, [version._id]: !prev[version._id] }))}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 16 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 14px" }}>
                                  <Field label="Version Number" value={version.versionNumber} />
                                  <Field label="Current Stage" value={STAGE_LABELS[version.currentStage] || version.currentStage} />
                                  <Field label="Created At" value={fmtDate(version.createdAt)} />
                                  <Field label="Updated At" value={fmtDate(version.updatedAt)} />
                                  <Field label="Uploaded By" value={shouldHideReviewerIdentity ? "Anonymous Reviewer" : (uploaderName || "—")} />
                                  <Field label="Uploader Role" value={version.uploaderRole || "—"} />
                                  {!shouldHideReviewerIdentity && (
                                    <Field label="Uploader Email" value={version.uploadedBy?.email || "—"} fullWidth />
                                  )}
                                </div>

                                {version.fileRefs?.length > 0 && <FileList files={version.fileRefs} title="Version Files" />}

                                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }}>
                                  <div style={{ padding: "13px 15px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                                    {version.currentStage === "REVIEWER_TO_EDITOR" ? <ClipboardCheck size={16} color="#0f3460" /> : <MessageSquareText size={16} color="#0f3460" />}
                                    <div style={{ fontWeight: 800, color: "#0f3460", fontSize: "0.86rem" }}>
                                      {version.currentStage === "REVIEWER_TO_EDITOR"
                                        ? "Reviewer Feedback"
                                        : version.currentStage === "TECH_EDITOR_TO_EDITOR"
                                          ? "Technical Editor Review"
                                          : "Stage Remark"}
                                    </div>
                                  </div>
                                  <div style={{ padding: "15px" }}>
                                    <TimelineRemarkPanel
                                      stage={version.currentStage}
                                      remark={version.timelineRemark}
                                      showReviewerIdentity={isPrivileged}
                                      version={version}
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionCard>
                          );
                        })
                      )}
                    </div>
                  </div>
                </AccordionCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionTimelinePage;
