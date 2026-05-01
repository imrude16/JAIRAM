import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Upload,
  Clock,
  X,
  ClipboardCheck,
} from "lucide-react";
import {
  fetchReviewerSubmissions,
  respondToReviewerAssignment,
} from "../../services/dashboardService";
import { openFilePreview } from "../../utils/filePreview";

const TH = (last = false) => ({
  padding: "11px 14px",
  textAlign: "center",
  fontSize: "0.69rem",
  fontWeight: 800,
  color: "#1e293b",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  background: "#f1f5f9",
  borderBottom: "2px solid #94a3b8",
  borderRight: last ? "none" : "1px solid #94a3b8",
});

const TD = (last = false) => ({
  padding: "13px 14px",
  verticalAlign: "middle",
  borderBottom: "1px solid #e2e8f0",
  borderRight: last ? "none" : "1px solid #e2e8f0",
  textAlign: "center",
});

const STATUS_CFG = {
  SUBMITTED: { label: "Submitted", color: "#0f3460", bg: "#e8eef6" },
  UNDER_REVIEW: { label: "Under Review", color: "#0e7490", bg: "#e0f2fe" },
  REVISION_REQUESTED: { label: "Revision Requested", color: "#b45309", bg: "#fef3c7" },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted", color: "#7c3aed", bg: "#ede9fe" },
  ACCEPTED: { label: "Accepted", color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

const ASSIGNMENT_STATUS_CFG = {
  PENDING: { label: "Pending Response", color: "#b45309", bg: "#fef3c7" },
  ACCEPT: { label: "Accepted", color: "#15803d", bg: "#dcfce7" },
  REJECT: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, borderRadius: 20, color: c.color, background: c.bg, fontSize: "0.7rem", padding: "3px 10px", whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
};

const AssignmentBadge = ({ status }) => {
  const c = ASSIGNMENT_STATUS_CFG[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, borderRadius: 20, color: c.color, background: c.bg, fontSize: "0.68rem", padding: "3px 10px", whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
};

const EBtn = ({ icon: I, label, color, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 11px",
      borderRadius: 6,
      border: `1.5px solid ${color}40`,
      background: color + "0d",
      color,
      fontSize: "0.72rem",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.12s",
    }}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.background = color + "1a";
        e.currentTarget.style.borderColor = color + "70";
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = color + "0d";
      e.currentTarget.style.borderColor = color + "40";
    }}
  >
    {I && <I style={{ width: 11, height: 11 }} />}
    {label}
  </button>
);

const Toast = ({ message, type = "success" }) => (
  <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 500, background: "#fff", borderRadius: 12, boxShadow: "0 12px 30px rgba(15,23,42,0.16)", border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`, padding: "12px 14px", minWidth: 260, display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: type === "success" ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {type === "success" ? (
        <CheckCircle style={{ width: 16, height: 16, color: "#15803d" }} />
      ) : (
        <AlertCircle style={{ width: 16, height: 16, color: "#dc2626" }} />
      )}
    </div>
    <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 600 }}>{message}</div>
  </div>
);

const ModalShell = ({ title, subtitle, onClose, children, maxWidth = 520 }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: "18px 24px", background: "linear-gradient(135deg,#0f3460,#1a4a7a)", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{subtitle}</div>}
        </div>
        <button type="button" onClick={onClose} style={{ border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const formatFileSize = (size = 0) => {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const AssignedFilesModal = ({ submission, remarks, onClose }) => {
  const revisedManuscript = remarks?.revisedManuscript || null;
  const attachments = Array.isArray(remarks?.attachments) ? remarks.attachments : [];

  const FileRow = ({ file, label }) => (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
          {file?.fileName || "Unnamed file"}
        </div>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 3 }}>
          {formatFileSize(file?.fileSize)}{file?.mimeType ? ` • ${file.mimeType}` : ""}
        </div>
      </div>
      <button
        type="button"
        onClick={() => openFilePreview(file)}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", borderRadius: 8, border: "1px solid #0f346040", background: "#e8eef6", color: "#0f3460", fontSize: "0.74rem", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}
      >
        Open
      </button>
    </div>
  );

  return (
    <ModalShell
      title="Assigned Files"
      subtitle={submission?.title || "Files shared by the editor for this assignment"}
      onClose={onClose}
      maxWidth={720}
    >
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Revised Manuscript</div>
          {revisedManuscript ? (
            <FileRow file={revisedManuscript} label="Primary File" />
          ) : (
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>No revised manuscript was attached.</div>
          )}
        </div>

        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Attachments</div>
          {attachments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {attachments.map((file, index) => (
                <FileRow key={`${file?.fileUrl || file?.fileName || "attachment"}-${index}`} file={file} label={`Attachment ${index + 1}`} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>No optional attachments were provided.</div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

const RejectAssignmentModal = ({ submission, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");

  return (
    <ModalShell title="Reject Assignment" subtitle={submission?.title || "Provide a reason for declining this reviewer assignment"} onClose={onClose} maxWidth={480}>
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.6 }}>
          Please tell the editor why you are unable to take this review assignment. This reason is required.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Explain why you need to reject this assignment..."
            style={{ padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.82rem", color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Minimum 10 characters required.</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} disabled={loading} style={{ padding: "10px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "0.78rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={() => onSubmit(reason)} disabled={loading} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: loading ? "#cbd5e1" : "#dc2626", color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting..." : "Reject Assignment"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ReviewerStats = ({ subs }) => {
  const counts = {
    total: subs.length,
    pending: subs.filter(s => s._reviewerAssignmentStatus === "PENDING").length,
    accepted: subs.filter(s => s._reviewerAssignmentStatus === "ACCEPT").length,
    submitted: subs.filter(s => s._reviewerReviewSubmitted).length,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {[
        { label: "Total Assignments", value: counts.total, color: "#0f3460" },
        { label: "Pending Response", value: counts.pending, color: "#b45309" },
        { label: "Accepted", value: counts.accepted, color: "#15803d" },
        { label: "Review Submitted", value: counts.submitted, color: "#0e7490" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, lineHeight: 1.35 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const ReviewerTable = ({ subs, onAction }) => {
  const [filter, setFilter] = useState("ALL");

  const filters = ["ALL", "PENDING", "ACCEPT", "REJECT"];
  const counts = filters.reduce((acc, item) => {
    acc[item] = item === "ALL" ? subs.length : subs.filter(s => s._reviewerAssignmentStatus === item).length;
    return acc;
  }, {});

  const displayed = filter === "ALL" ? subs : subs.filter(s => s._reviewerAssignmentStatus === filter);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "15px 20px", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>Assigned Manuscripts</span>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{displayed.length} of {subs.length}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {filters.map((item) => {
            const active = filter === item;
            return (
              <button
                key={item}
                onClick={() => setFilter(item)}
                style={{
                  padding: "4px 11px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  transition: "all 0.12s",
                  background: active ? "#0f3460" : "#f1f5f9",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {item === "ALL" ? "All" : ASSIGNMENT_STATUS_CFG[item]?.label || item} <span style={{ opacity: 0.8 }}>({counts[item]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <FileText style={{ width: 20, height: 20, color: "#94a3b8" }} />
          </div>
          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>No reviewer assignments in this category.</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 1100 }}>
            <colgroup>
              <col style={{ width: "140px" }} />
              <col style={{ width: "250px" }} />
              <col style={{ width: "170px" }} />
              <col style={{ width: "135px" }} />
              <col style={{ width: "280px" }} />
              <col style={{ width: "260px" }} />
            </colgroup>
            <thead>
              <tr>
                {["Submission ID", "Article Title", "Main Author", "Status", "Editor's Remarks", "Actions"].map((h, i, arr) => (
                  <th key={h} style={TH(i === arr.length - 1)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((sub) => {
                const pending = sub._reviewerAssignmentStatus === "PENDING";
                const accepted = sub._reviewerAssignmentStatus === "ACCEPT";
                const reviewSubmitted = !!sub._reviewerReviewSubmitted;
                const hasCurrentAssignment = sub._reviewerHasCurrentAssignment !== false;
                const remarks = sub._editorRemarksForReviewer;

                return (
                  <tr key={sub._id} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={TD()}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#0f3460", fontWeight: 700 }}>
                        {sub.submissionNumber || "—"}
                      </span>
                      <div style={{ marginTop: 6 }}>
                        <AssignmentBadge status={sub._reviewerAssignmentStatus} />
                      </div>
                    </td>

                    <td style={TD()}>
                      <div style={{ fontSize: "0.78rem", color: "#1e293b", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textAlign: "left" }}>
                        {sub.title}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 3, textAlign: "left" }}>
                        {sub.articleType}
                      </div>
                    </td>

                    <td style={TD()}>
                      <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#334155" }}>
                        {sub.author ? `${sub.author.firstName || ""} ${sub.author.lastName || ""}`.trim() : "—"}
                      </div>
                      {sub.author?.email && (
                        <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2, whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}>
                          {sub.author.email}
                        </div>
                      )}
                    </td>

                    <td style={TD()}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                        <StatusBadge status={sub.status} />
                        {reviewSubmitted && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, borderRadius: 20, color: "#0e7490", background: "#e0f2fe", fontSize: "0.68rem", padding: "3px 10px", whiteSpace: "nowrap" }}>
                            <Clock style={{ width: 10, height: 10 }} />
                            Review Submitted
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={TD()}>
                      {remarks?.remarks ? (
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "0.76rem", color: "#334155", lineHeight: 1.45 }}>{remarks.remarks}</div>
                          {(remarks?.revisedManuscript?.fileUrl || (remarks?.attachments && remarks.attachments.length > 0)) && (
                            <button
                              type="button"
                              onClick={() => onAction("files", sub)}
                              style={{
                                marginTop: 10,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "7px 12px",
                                borderRadius: 8,
                                border: "1px solid #0f346040",
                                background: "#e8eef6",
                                color: "#0f3460",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                                cursor: "pointer",
                              }}
                            >
                              View Assigned Files
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No remarks</span>
                      )}
                    </td>

                    <td style={{ ...TD(true), textAlign: "left" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        <EBtn icon={Eye} label="View" color="#0e7490" onClick={() => onAction("view", sub)} />
                        <EBtn icon={CheckCircle} label="Accept" color="#15803d" onClick={() => onAction("accept", sub)} disabled={!pending || !hasCurrentAssignment} />
                        <EBtn icon={XCircle} label="Reject" color="#dc2626" onClick={() => onAction("reject", sub)} disabled={!pending || !hasCurrentAssignment} />
                        <EBtn icon={ClipboardCheck} label="Submit Review" color="#0f3460" onClick={() => onAction("review", sub)} disabled={!accepted || reviewSubmitted || !hasCurrentAssignment} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewerSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load reviewer submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (type, submission) => {
    if (type === "view") {
      navigate(`/submissions/${submission._id}`);
      return;
    }

    if (type === "accept") {
      try {
        setActionLoading(true);
        await respondToReviewerAssignment(submission._id, "ACCEPT");
        showToast("Assignment accepted successfully.");
        load();
      } catch (err) {
        showToast(err.response?.data?.message || err.message || "Failed to accept assignment.", "error");
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (type === "review") {
      navigate(`/reviewer-checklist?submissionId=${submission._id}`);
      return;
    }

    if (type === "files") {
      setModal({ type, submission });
      return;
    }

    setModal({ type, submission });
  };

  const handleReject = async (reason) => {
    if (reason.trim().length < 10) {
      showToast("Rejection reason must be at least 10 characters.", "error");
      return;
    }

    try {
      setActionLoading(true);
      await respondToReviewerAssignment(modal.submission._id, "REJECT", reason.trim());
      setModal(null);
      showToast("Assignment rejected successfully.");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to reject assignment.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 13px",
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} />
          Refresh
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0f3460", animation: "reviewerspin 0.8s linear infinite" }} />
          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>Loading assigned manuscripts…</div>
          <style>{`@keyframes reviewerspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle style={{ width: 22, height: 22, color: "#dc2626" }} />
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>Could not load assignments</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>{error}</div>
          <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f3460", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} />Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <ReviewerStats subs={submissions} />
          <ReviewerTable subs={submissions} onAction={handleAction} />
        </>
      )}

      {modal?.type === "reject" && (
        <RejectAssignmentModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onSubmit={handleReject}
          loading={actionLoading}
        />
      )}

      {modal?.type === "files" && (
        <AssignedFilesModal
          submission={modal.submission}
          remarks={modal.submission?._editorRemarksForReviewer}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
