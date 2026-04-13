import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Eye,
  FileText,
  Loader,
  RefreshCw,
  Search,
  Shield,
  UserCog,
  UserRoundCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  assignEditorToSubmission,
  fetchAdminRoleChangeRequests,
  fetchAdminUserById,
  fetchAllSubmissionsForAdmin,
  reviewAdminRoleChangeRequest,
  searchAdminUsers,
  updateAdminUserProfile,
  updateAdminUserStatus,
} from "../../services/dashboardService";

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

const REQUEST_STATUS_CFG = {
  PENDING: { label: "Pending", color: "#b45309", bg: "#fef3c7" },
  APPROVED: { label: "Approved", color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

const USER_STATUS_CFG = {
  ACTIVE: { label: "Active", color: "#15803d", bg: "#dcfce7" },
  INACTIVE: { label: "Inactive", color: "#64748b", bg: "#f1f5f9" },
  SUSPENDED: { label: "Suspended", color: "#dc2626", bg: "#fee2e2" },
};

const ROLE_BADGE_CFG = {
  USER: { label: "User", color: "#0f3460", bg: "#e8eef6" },
  EDITOR: { label: "Editor", color: "#7c3aed", bg: "#ede9fe" },
  TECHNICAL_EDITOR: { label: "Technical Editor", color: "#0891b2", bg: "#cffafe" },
  REVIEWER: { label: "Reviewer", color: "#0e7490", bg: "#e0f2fe" },
  ADMIN: { label: "Admin", color: "#b45309", bg: "#fef3c7" },
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
  color: "#1e293b",
  background: "#fff",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 100,
  resize: "vertical",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return (
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

const formatDateOnly = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const extractAssignment = (sub) => {
  let techEditor = null;
  let techEditorAssignedAt = null;

  const teDoc = sub._assignedTechEditor;
  if (teDoc?.assignedTechnicalEditors?.length > 0) {
    const te = teDoc.assignedTechnicalEditors[0];
    if (te.technicalEditor) {
      techEditor = `${te.technicalEditor.firstName || ""} ${te.technicalEditor.lastName || ""}`.trim();
      techEditorAssignedAt = te.assignedDate ?? null;
    }
  }

  let reviewers = [];
  const rvDoc = sub._assignedReviewers;
  if (rvDoc?.assignedReviewers?.length > 0) {
    reviewers = rvDoc.assignedReviewers
      .map((r) => {
        if (!r.reviewer) return null;
        return {
          name: `${r.reviewer.firstName || ""} ${r.reviewer.lastName || ""}`.trim(),
          assignedAt: r.assignedDate ?? null,
        };
      })
      .filter(Boolean);
  }

  return {
    _mainAuthor: sub.author
      ? `${sub.author.firstName || ""} ${sub.author.lastName || ""}`.trim()
      : "—",
    _mainAuthorEmail: sub.author?.email || "",
    _techEditor: techEditor,
    _techEditorAssignedAt: techEditorAssignedAt,
    _reviewers: reviewers,
  };
};

const StatusBadge = ({ status, map = STATUS_CFG }) => {
  const c = map[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontWeight: 600,
        borderRadius: 20,
        color: c.color,
        background: c.bg,
        fontSize: "0.7rem",
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
};

const RequestStatusBadge = ({ status }) => {
  const c = REQUEST_STATUS_CFG[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontWeight: 700,
        borderRadius: 20,
        color: c.color,
        background: c.bg,
        fontSize: "0.68rem",
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
};

const EBtn = ({ icon: I, label, color, onClick, disabled = false, small = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: small ? "4px 9px" : "5px 11px",
      borderRadius: 6,
      border: `1.5px solid ${color}40`,
      background: `${color}0d`,
      color,
      fontSize: "0.72rem",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.12s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = `${color}1a`;
        e.currentTarget.style.borderColor = `${color}70`;
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `${color}0d`;
      e.currentTarget.style.borderColor = `${color}40`;
    }}
  >
    {I && <I style={{ width: 11, height: 11 }} />}
    {label}
  </button>
);

const Toast = ({ message, type = "success" }) => (
  <div
    style={{
      position: "fixed",
      right: 24,
      bottom: 24,
      zIndex: 500,
      minWidth: 260,
      maxWidth: 360,
      padding: "12px 14px",
      borderRadius: 10,
      fontSize: "0.78rem",
      fontWeight: 700,
      color: "#fff",
      background: type === "error" ? "#dc2626" : "#15803d",
      boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    }}
  >
    {message}
  </div>
);

const EmptyBlock = ({ message }) => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px",
      }}
    >
      <FileText style={{ width: 20, height: 20, color: "#94a3b8" }} />
    </div>
    <div style={{ fontSize: "0.83rem", color: "#64748b" }}>{message}</div>
  </div>
);

const ModalShell = ({ title, subtitle, onClose, children, maxWidth = 520 }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 300,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth,
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 4, lineHeight: 1.55 }}>
              {subtitle}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "#f8fafc",
            color: "#64748b",
            borderRadius: 8,
            width: 34,
            height: 34,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <X style={{ width: 15, height: 15 }} />
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

const AssignedToCell = ({ submission }) => {
  const te = submission._techEditor;
  const teAt = submission._techEditorAssignedAt;
  const reviewers = submission._reviewers || [];

  if (!te && reviewers.length === 0) {
    return (
      <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic" }}>
        Not Assigned Yet
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      {te && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.69rem",
              fontWeight: 600,
              color: "#7c3aed",
              background: "#ede9fe",
              borderRadius: 10,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            <UserPlus style={{ width: 9, height: 9 }} />
            {te}
          </span>
          {teAt && <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{formatDateTime(teAt)}</span>}
        </div>
      )}

      {reviewers.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.69rem",
              fontWeight: 600,
              color: "#0e7490",
              background: "#e0f2fe",
              borderRadius: 10,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            <Users style={{ width: 9, height: 9 }} />
            {r.name}
          </span>
          {r.assignedAt && <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{formatDateTime(r.assignedAt)}</span>}
        </div>
      ))}
    </div>
  );
};

const AdminStats = ({ subs, pendingRequests }) => {
  const counts = {
    total: subs.length,
    reviewing: subs.filter((s) => s.status === "UNDER_REVIEW").length,
    accepted: subs.filter((s) => s.status === "ACCEPTED").length,
    pendingRequests,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {[
        { label: "Total Submissions", value: counts.total, color: "#0f3460" },
        { label: "Under Review", value: counts.reviewing, color: "#0e7490" },
        { label: "Accepted", value: counts.accepted, color: "#15803d" },
        { label: "Pending Requests", value: counts.pendingRequests, color: "#b45309" },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, lineHeight: 1.35 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const AdminTable = ({ subs, onAction }) => {
  const [filter, setFilter] = useState("ALL");

  const statuses = [
    "ALL",
    "SUBMITTED",
    "UNDER_REVIEW",
    "REVISION_REQUESTED",
    "PROVISIONALLY_ACCEPTED",
    "ACCEPTED",
    "REJECTED",
  ];

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "ALL" ? subs.length : subs.filter((x) => x.status === s).length;
    return acc;
  }, {});

  const displayed = filter === "ALL" ? subs : subs.filter((s) => s.status === filter);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "15px 20px", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>All Submissions</span>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            {displayed.length} of {subs.length}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {statuses.map((s) => {
            const cfg = STATUS_CFG[s] || { color: "#0f3460", bg: "#e8eef6" };
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "4px 11px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  transition: "all 0.12s",
                  background: active ? (s === "ALL" ? "#0f3460" : cfg.color) : "#f1f5f9",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {s === "ALL" ? "All" : STATUS_CFG[s]?.label || s} <span style={{ opacity: 0.8 }}>({counts[s]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {displayed.length === 0 ? (
        <EmptyBlock message="No submissions with this status." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 1000 }}>
            <colgroup>
              <col style={{ width: "140px" }} />
              <col style={{ width: "240px" }} />
              <col style={{ width: "145px" }} />
              <col style={{ width: "155px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "210px" }} />
              <col style={{ width: "210px" }} />
            </colgroup>
            <thead>
              <tr>
                {[
                  "Submission ID",
                  "Title",
                  "Main Author",
                  "Status",
                  "Payment",
                  "Assigned To",
                  "Actions",
                ].map((h, i, arr) => (
                  <th key={h} style={TH(i === arr.length - 1)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((sub) => (
                <tr
                  key={sub._id}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={TD()}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#0f3460", fontWeight: 700 }}>
                      {sub.submissionNumber || "—"}
                    </span>
                  </td>

                  <td style={TD()}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#1e293b",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textAlign: "left",
                      }}
                    >
                      {sub.title}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 3, textAlign: "left" }}>
                      {sub.articleType}
                    </div>
                  </td>

                  <td style={TD()}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#334155" }}>{sub._mainAuthor}</div>
                    {sub._mainAuthorEmail && (
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "#94a3b8",
                          marginTop: 2,
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          lineHeight: 1.35,
                        }}
                      >
                        {sub._mainAuthorEmail}
                      </div>
                    )}
                  </td>

                  <td style={TD()}>
                    <StatusBadge status={sub.status} />
                  </td>

                  <td style={TD()}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600,
                        borderRadius: 20,
                        color: sub.paymentStatus ? "#15803d" : "#6b7280",
                        background: sub.paymentStatus ? "#dcfce7" : "#f3f4f6",
                        fontSize: "0.7rem",
                        padding: "3px 9px",
                        border: `1px solid ${sub.paymentStatus ? "#bbf7d0" : "#e5e7eb"}`,
                      }}
                    >
                      <CreditCard style={{ width: 10, height: 10 }} />
                      {sub.paymentStatus ? "Paid" : "Unpaid"}
                    </span>
                  </td>

                  <td style={TD()}>
                    <AssignedToCell submission={sub} />
                  </td>

                  <td style={{ ...TD(true), textAlign: "left" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      <EBtn icon={Eye} label="View" color="#0e7490" onClick={() => onAction("view", sub)} />
                      <EBtn
                        icon={UserPlus}
                        label="Assign Editor"
                        color="#7c3aed"
                        onClick={() => onAction("assignEditor", sub)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const UserSearchList = ({ users, loading, emptyMessage, selectedId, onSelect }) => (
  <div
    style={{
      maxHeight: 260,
      overflowY: "auto",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      background: "#fff",
    }}
  >
    {loading && (
      <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "0.78rem" }}>
        Searching users...
      </div>
    )}

    {!loading && users.length === 0 && (
      <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "0.78rem" }}>
        {emptyMessage}
      </div>
    )}

    {!loading &&
      users.map((user) => (
        <button
          key={user._id}
          type="button"
          onClick={() => onSelect(user)}
          style={{
            width: "100%",
            border: "none",
            borderBottom: "1px solid #f1f5f9",
            background: selectedId === user._id ? "#e8eef6" : "#fff",
            padding: "12px 14px",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4 }}>{user.email}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <StatusBadge status={user.role} map={ROLE_BADGE_CFG} />
            <StatusBadge status={user.status} map={USER_STATUS_CFG} />
          </div>
        </button>
      ))}
  </div>
);

const RoleChangeRequestsModal = ({
  open,
  onClose,
  requests,
  loading,
  error,
  filter,
  setFilter,
  onReload,
  onDecision,
}) => {
  if (!open) return null;

  return (
    <ModalShell
      title="Review Role Change Requests"
      subtitle="Review requests submitted by editors and approve or reject them with an optional admin reason."
      onClose={onClose}
      maxWidth={960}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["PENDING", "APPROVED", "REJECTED"].map((status) => {
              const active = filter === status;
              const cfg = REQUEST_STATUS_CFG[status];
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    padding: "4px 11px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    background: active ? cfg.color : "#f1f5f9",
                    color: active ? "#fff" : "#64748b",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={onReload}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontSize: "0.74rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Refresh
          </button>
        </div>

        {loading && <EmptyBlock message="Loading role change requests..." />}
        {!loading && error && <EmptyBlock message={error} />}
        {!loading && !error && requests.length === 0 && <EmptyBlock message="No role change requests found." />}

        {!loading && !error && requests.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map((request) => (
              <div
                key={request._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  background: "#fff",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0f172a" }}>
                      {request.userId?.firstName} {request.userId?.lastName}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 3 }}>
                      {request.userId?.email || "-"}
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "#475569", marginTop: 10, lineHeight: 1.7 }}>
                      Current Role: <strong>{request.userId?.role || "-"}</strong>
                      {" | "}
                      Requested Role: <strong>{request.requestedRole || "-"}</strong>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "#475569", lineHeight: 1.7 }}>
                      Requested By: <strong>{request.requestedBy?.firstName} {request.requestedBy?.lastName}</strong>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "#475569", marginTop: 8, lineHeight: 1.7 }}>
                      <strong>Reason:</strong> {request.reason}
                    </div>

                    {request.adminComments && (
                      <div style={{ fontSize: "0.76rem", color: "#475569", marginTop: 8, lineHeight: 1.7 }}>
                        <strong>Admin Comment:</strong> {request.adminComments}
                      </div>
                    )}

                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 10 }}>
                      Requested on {formatDateTime(request.createdAt)}
                      {request.reviewedAt ? ` | Reviewed on ${formatDateTime(request.reviewedAt)}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
                    <RequestStatusBadge status={request.status} />
                    {request.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <EBtn
                          icon={CheckCircle}
                          label="Approve"
                          color="#15803d"
                          onClick={() => onDecision(request, "APPROVE")}
                          small
                        />
                        <EBtn
                          icon={XCircle}
                          label="Reject"
                          color="#dc2626"
                          onClick={() => onDecision(request, "REJECT")}
                          small
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

const RoleDecisionModal = ({
  open,
  request,
  decision,
  comment,
  setComment,
  submitting,
  onClose,
  onSubmit,
}) => {
  if (!open || !request) return null;

  return (
    <ModalShell
      title={decision === "APPROVE" ? "Approve Role Change Request" : "Reject Role Change Request"}
      subtitle="You may provide a reason for approval or rejection. This is optional."
      onClose={onClose}
      maxWidth={560}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "0.78rem",
            color: "#475569",
            lineHeight: 1.65,
          }}
        >
          <strong>User:</strong> {request.userId?.firstName} {request.userId?.lastName}
          <br />
          <strong>Requested Role:</strong> {request.requestedRole}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="You may provide reason for approval / rejection..."
          style={textareaStyle}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Skip and Submit"}
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "none",
              background: decision === "APPROVE" ? "#15803d" : "#dc2626",
              color: "#fff",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? "Submitting..." : "Submit Decision"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ProfileLookupModal = ({
  open,
  onClose,
  search,
  setSearch,
  results,
  loading,
  onSelectUser,
}) => {
  if (!open) return null;

  return (
    <ModalShell
      title="Update Profiles"
      subtitle="Search a user by name or email. Click a user to open the profile details modal."
      onClose={onClose}
      maxWidth={760}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "#94a3b8",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name or email"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        <UserSearchList
          users={results}
          loading={loading}
          emptyMessage={
            search.trim().length < 2
              ? "Enter at least 2 characters to search users."
              : "No users found."
          }
          selectedId={null}
          onSelect={onSelectUser}
        />
      </div>
    </ModalShell>
  );
};

const AssignEditorModal = ({
  open,
  onClose,
  submission,
  search,
  setSearch,
  results,
  loading,
  selectedEditor,
  onSelectEditor,
  onSubmit,
  submitting,
}) => {
  if (!open || !submission) return null;

  return (
    <ModalShell
      title="Assign Editor"
      subtitle="Search editor by name or email, select one editor, and assign that editor to this submission."
      onClose={onClose}
      maxWidth={760}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Submission
          </div>
          <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#0f172a", marginTop: 6 }}>
            {submission.title || "Untitled Submission"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
            {submission.submissionNumber || "-"}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "#94a3b8",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search editor by name or email"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        <UserSearchList
          users={results}
          loading={loading}
          emptyMessage={
            search.trim().length < 2
              ? "Enter at least 2 characters to search editors."
              : "No editors found."
          }
          selectedId={selectedEditor?._id || null}
          onSelect={onSelectEditor}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedEditor || submitting}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "none",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              cursor: !selectedEditor || submitting ? "not-allowed" : "pointer",
              opacity: !selectedEditor || submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Assigning..." : "Assign Editor"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ProfileDetailModal = ({
  open,
  user,
  editMode,
  form,
  saving,
  onClose,
  onEdit,
  onCancelEdit,
  onChange,
  onSave,
}) => {
  if (!open || !user) return null;

  const readRows = [
    { label: "Full Name", value: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "-" },
    { label: "Email", value: user.email || "-" },
    { label: "Role", value: user.role || "-" },
    { label: "Status", value: user.status || "-" },
    { label: "Profession", value: user.profession === "Other" ? user.otherProfession || "Other" : user.profession || "-" },
    { label: "Primary Specialty", value: user.primarySpecialty === "Other" ? user.otherPrimarySpecialty || "Other" : user.primarySpecialty || "-" },
    { label: "Institution", value: user.institution || "-" },
    { label: "Department", value: user.department || "-" },
    { label: "ORCID", value: user.orcid || "-" },
    { label: "Mobile", value: user.phoneCode && user.mobileNumber ? `${user.phoneCode} ${user.mobileNumber}` : "-" },
    {
      label: "Address",
      value:
        [
          user.address?.street,
          user.address?.city,
          user.address?.state,
          user.address?.country,
          user.address?.postalCode,
        ]
          .filter(Boolean)
          .join(", ") || "-",
    },
  ];

  const field = (name, label, placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>{label}</label>
      <input
        value={form[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  return (
    <ModalShell
      title="User Profile"
      subtitle="Review the selected user's profile. Use Edit Profile to update the allowed fields."
      onClose={onClose}
      maxWidth={920}
    >
      {!editMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {readRows.map((row) => (
              <div
                key={row.label}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  background: "#fff",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: "0.67rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {row.label}
                </div>
                <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "#0f172a", marginTop: 6, lineHeight: 1.6 }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <EBtn icon={UserCog} label="Edit Profile" color="#0f3460" onClick={onEdit} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {field("firstName", "First Name")}
            {field("lastName", "Last Name")}
            {field("profession", "Profession")}
            {field("primarySpecialty", "Primary Specialty")}
            {field("institution", "Institution")}
            {field("department", "Department")}
            {field("orcid", "ORCID")}
            {field("phoneCode", "Phone Code", "+91")}
            {field("mobileNumber", "Mobile Number")}
            {field("street", "Street")}
            {field("city", "City")}
            {field("state", "State")}
            {field("country", "Country")}
            {field("postalCode", "Postal Code")}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                padding: "9px 14px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#475569",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              style={{
                padding: "9px 14px",
                borderRadius: 8,
                border: "none",
                background: "#0f3460",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

const StatusUpdateModal = ({
  open,
  onClose,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  results,
  loading,
  selectedUser,
  onSelectUser,
  targetStatus,
  setTargetStatus,
  adminComment,
  setAdminComment,
  onSubmit,
  submitting,
}) => {
  if (!open) return null;

  return (
    <ModalShell
      title="Update User Status"
      subtitle="Search by name or email, optionally filter by status, select a user, then choose the next status and submit an optional admin comment."
      onClose={onClose}
      maxWidth={900}
    >
      <div style={{ display: "grid", gridTemplateColumns: "340px minmax(0, 1fr)", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email"
              style={{ ...inputStyle, paddingLeft: 32 }}
            />
          </div>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          <UserSearchList
            users={results}
            loading={loading}
            emptyMessage="No users found. Adjust the search or status filter."
            selectedId={selectedUser?._id || null}
            onSelect={onSelectUser}
          />
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            background: "#f8fafc",
            padding: 16,
            minHeight: 360,
          }}
        >
          {!selectedUser ? (
            <div style={{ padding: "24px 12px", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
              Select a user from the left to update account status.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 3 }}>{selectedUser.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 700 }}>Current Status</span>
                  <StatusBadge status={selectedUser.status} map={USER_STATUS_CFG} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 10 }}>
                  Change Status To
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => {
                    const isCurrent = selectedUser.status === status;
                    const selected = targetStatus === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setTargetStatus(status)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${selected ? "#0f3460" : "#cbd5e1"}`,
                          background: selected ? "#e8eef6" : "#fff",
                          color: isCurrent ? "#94a3b8" : "#0f172a",
                          fontWeight: 700,
                          cursor: isCurrent ? "not-allowed" : "pointer",
                          opacity: isCurrent ? 0.55 : 1,
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>Admin Comment</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Optional admin comment"
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!targetStatus || submitting}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#0f3460",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: !targetStatus || submitting ? "not-allowed" : "pointer",
                    opacity: !targetStatus || submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default function AdminDashboard({ user, showRoleChangeModal, onCloseRoleChangeModal, adminNavAction }) {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState(null);

  const [requestFilter, setRequestFilter] = useState("PENDING");
  const [roleRequests, setRoleRequests] = useState([]);
  const [roleRequestsLoading, setRoleRequestsLoading] = useState(false);
  const [roleRequestsError, setRoleRequestsError] = useState("");
  const [decisionModal, setDecisionModal] = useState({ open: false, request: null, decision: null });
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  const [profileLookupOpen, setProfileLookupOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [profileResults, setProfileResults] = useState([]);
  const [profileSearchLoading, setProfileSearchLoading] = useState(false);
  const [profileDetailOpen, setProfileDetailOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusResults, setStatusResults] = useState([]);
  const [statusSearchLoading, setStatusSearchLoading] = useState(false);
  const [selectedStatusUser, setSelectedStatusUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [assignEditorModalOpen, setAssignEditorModalOpen] = useState(false);
  const [assignEditorSubmission, setAssignEditorSubmission] = useState(null);
  const [assignEditorSearch, setAssignEditorSearch] = useState("");
  const [assignEditorResults, setAssignEditorResults] = useState([]);
  const [assignEditorLoading, setAssignEditorLoading] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [assignEditorSubmitting, setAssignEditorSubmitting] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAllSubmissionsForAdmin();
      const normalised = raw.map((sub) => ({
        ...sub,
        ...extractAssignment(sub),
      }));
      setSubmissions(normalised);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoleRequests = useCallback(async () => {
    try {
      setRoleRequestsLoading(true);
      setRoleRequestsError("");
      const result = await fetchAdminRoleChangeRequests(requestFilter);
      setRoleRequests(result.requests || []);
    } catch (err) {
      setRoleRequestsError(err.response?.data?.message || err.message || "Failed to load role change requests.");
    } finally {
      setRoleRequestsLoading(false);
    }
  }, [requestFilter]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    loadRoleRequests();
  }, [loadRoleRequests]);

  useEffect(() => {
    if (!showRoleChangeModal) return;
    loadRoleRequests();
  }, [showRoleChangeModal, loadRoleRequests]);

  useEffect(() => {
    if (!profileLookupOpen) return;

    const q = profileSearch.trim();

    if (q.length < 2) {
      setProfileResults([]);
      setProfileSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setProfileSearchLoading(true);
        const result = await searchAdminUsers({ search: q, limit: 12 });
        setProfileResults(result.users || []);
      } catch (err) {
        setProfileResults([]);
      } finally {
        setProfileSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [profileLookupOpen, profileSearch]);

  useEffect(() => {
    if (!statusModalOpen) return;

    const q = statusSearch.trim();

    const timer = setTimeout(async () => {
      try {
        setStatusSearchLoading(true);
        const result = await searchAdminUsers({
          search: q,
          status: statusFilter,
          limit: 12,
        });
        setStatusResults(result.users || []);
      } catch (err) {
        setStatusResults([]);
      } finally {
        setStatusSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [statusModalOpen, statusSearch, statusFilter]);

  useEffect(() => {
    if (!assignEditorModalOpen) return;

    const q = assignEditorSearch.trim();

    if (q.length < 2) {
      setAssignEditorResults([]);
      setAssignEditorLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAssignEditorLoading(true);
        const result = await searchAdminUsers({
          search: q,
          role: "EDITOR",
          limit: 12,
        });
        setAssignEditorResults(result.users || []);
      } catch (err) {
        setAssignEditorResults([]);
      } finally {
        setAssignEditorLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [assignEditorModalOpen, assignEditorSearch]);

  useEffect(() => {
    if (!adminNavAction?.action) return;

    if (adminNavAction.action === "updateProfile") {
      setProfileLookupOpen(true);
      setProfileSearch("");
      setProfileResults([]);
      return;
    }

    if (adminNavAction.action === "updateStatus") {
      setStatusModalOpen(true);
      setStatusSearch("");
      setStatusFilter("");
      setStatusResults([]);
      setSelectedStatusUser(null);
      setTargetStatus("");
      setAdminComment("");
    }
  }, [adminNavAction]);

  const handleAction = (type, submission) => {
    if (type === "view") {
      navigate(`/submissions/${submission._id}`);
      return;
    }

    if (type === "assignEditor") {
      setAssignEditorSubmission(submission);
      setAssignEditorModalOpen(true);
      setAssignEditorSearch("");
      setAssignEditorResults([]);
      setSelectedEditor(null);
      return;
    }

    if (type === "updateProfile") {
      setProfileLookupOpen(true);
      setProfileSearch(submission?._mainAuthorEmail || "");
      setProfileResults([]);
      return;
    }

    if (type === "updateStatus") {
      setStatusModalOpen(true);
      setStatusSearch(submission?._mainAuthorEmail || "");
      setStatusFilter("");
      setSelectedStatusUser(null);
      setTargetStatus("");
      setAdminComment("");
    }
  };

  const handleAssignEditor = async () => {
    if (!assignEditorSubmission?._id || !selectedEditor?._id) {
      showToast("Please select an editor first.", "error");
      return;
    }

    try {
      setAssignEditorSubmitting(true);
      await assignEditorToSubmission(assignEditorSubmission._id, selectedEditor._id);
      setAssignEditorModalOpen(false);
      setAssignEditorSubmission(null);
      setAssignEditorSearch("");
      setAssignEditorResults([]);
      setSelectedEditor(null);
      showToast("Editor assigned successfully.");
      loadSubmissions();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to assign editor.", "error");
    } finally {
      setAssignEditorSubmitting(false);
    }
  };

  const handleSelectProfileUser = async (userEntry) => {
    try {
      const fullUser = await fetchAdminUserById(userEntry._id);
      setSelectedProfileUser(fullUser);
      setProfileForm({
        firstName: fullUser.firstName || "",
        lastName: fullUser.lastName || "",
        profession: fullUser.profession || "",
        primarySpecialty: fullUser.primarySpecialty || "",
        institution: fullUser.institution || "",
        department: fullUser.department || "",
        orcid: fullUser.orcid || "",
        phoneCode: fullUser.phoneCode || "",
        mobileNumber: fullUser.mobileNumber || "",
        street: fullUser.address?.street || "",
        city: fullUser.address?.city || "",
        state: fullUser.address?.state || "",
        country: fullUser.address?.country || "",
        postalCode: fullUser.address?.postalCode || "",
      });
      setProfileEditMode(false);
      setProfileDetailOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load user profile.", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedProfileUser?._id) return;

    const payload = {
      firstName: profileForm.firstName?.trim(),
      lastName: profileForm.lastName?.trim(),
      profession: profileForm.profession?.trim(),
      primarySpecialty: profileForm.primarySpecialty?.trim(),
      institution: profileForm.institution?.trim(),
      department: profileForm.department?.trim(),
      orcid: profileForm.orcid?.trim(),
      phoneCode: profileForm.phoneCode?.trim(),
      mobileNumber: profileForm.mobileNumber?.trim(),
      address: {
        street: profileForm.street?.trim(),
        city: profileForm.city?.trim(),
        state: profileForm.state?.trim(),
        country: profileForm.country?.trim(),
        postalCode: profileForm.postalCode?.trim(),
      },
    };

    Object.keys(payload).forEach((key) => {
      if (key === "address") {
        Object.keys(payload.address).forEach((k) => {
          if (!payload.address[k]) delete payload.address[k];
        });
        if (Object.keys(payload.address).length === 0) delete payload.address;
      } else if (!payload[key]) {
        delete payload[key];
      }
    });

    if (Object.keys(payload).length === 0) {
      showToast("Please make at least one valid profile change before saving.", "error");
      return;
    }

    try {
      setProfileSaving(true);
      const updated = await updateAdminUserProfile(selectedProfileUser._id, payload);
      setSelectedProfileUser(updated);
      setProfileEditMode(false);
      showToast("User profile updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update user profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSubmitStatusUpdate = async () => {
    if (!selectedStatusUser?._id || !targetStatus) {
      showToast("Please select a user and choose the next status.", "error");
      return;
    }

    try {
      setStatusSubmitting(true);
      const result = await updateAdminUserStatus(
        selectedStatusUser._id,
        targetStatus,
        adminComment.trim()
      );
      setSelectedStatusUser(result.user);
      setStatusResults((prev) =>
        prev.map((entry) => (entry._id === result.user._id ? result.user : entry))
      );
      showToast("User status updated successfully.");
      setTargetStatus("");
      setAdminComment("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update user status.", "error");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleSubmitRoleDecision = async () => {
    if (!decisionModal.request?._id || !decisionModal.decision) return;

    try {
      setDecisionSubmitting(true);
      await reviewAdminRoleChangeRequest(
        decisionModal.request._id,
        decisionModal.decision,
        decisionComment.trim()
      );
      setDecisionModal({ open: false, request: null, decision: null });
      setDecisionComment("");
      showToast(
        decisionModal.decision === "APPROVE"
          ? "Role change request approved successfully."
          : "Role change request rejected successfully."
      );
      loadRoleRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to review role change request.", "error");
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const pendingRequestsCount = roleRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={loadSubmissions}
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "3px solid #e2e8f0",
              borderTopColor: "#0f3460",
              animation: "aspin 0.8s linear infinite",
            }}
          />
          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>Loading submissions…</div>
          <style>{`@keyframes aspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle style={{ width: 22, height: 22, color: "#dc2626" }} />
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>Could not load submissions</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>{error}</div>
          <button
            onClick={loadSubmissions}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#0f3460",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <AdminStats subs={submissions} pendingRequests={pendingRequestsCount} />
          <AdminTable subs={submissions} onAction={handleAction} />
        </>
      )}

      <RoleChangeRequestsModal
        open={showRoleChangeModal}
        onClose={onCloseRoleChangeModal}
        requests={roleRequests}
        loading={roleRequestsLoading}
        error={roleRequestsError}
        filter={requestFilter}
        setFilter={setRequestFilter}
        onReload={loadRoleRequests}
        onDecision={(request, decision) => {
          setDecisionModal({ open: true, request, decision });
          setDecisionComment("");
        }}
      />

      <RoleDecisionModal
        open={decisionModal.open}
        request={decisionModal.request}
        decision={decisionModal.decision}
        comment={decisionComment}
        setComment={setDecisionComment}
        submitting={decisionSubmitting}
        onClose={() => {
          setDecisionModal({ open: false, request: null, decision: null });
          setDecisionComment("");
        }}
        onSubmit={handleSubmitRoleDecision}
      />

      <ProfileLookupModal
        open={profileLookupOpen}
        onClose={() => setProfileLookupOpen(false)}
        search={profileSearch}
        setSearch={setProfileSearch}
        results={profileResults}
        loading={profileSearchLoading}
        onSelectUser={handleSelectProfileUser}
      />

      <AssignEditorModal
        open={assignEditorModalOpen}
        onClose={() => {
          setAssignEditorModalOpen(false);
          setAssignEditorSubmission(null);
          setAssignEditorSearch("");
          setAssignEditorResults([]);
          setSelectedEditor(null);
        }}
        submission={assignEditorSubmission}
        search={assignEditorSearch}
        setSearch={setAssignEditorSearch}
        results={assignEditorResults}
        loading={assignEditorLoading}
        selectedEditor={selectedEditor}
        onSelectEditor={setSelectedEditor}
        onSubmit={handleAssignEditor}
        submitting={assignEditorSubmitting}
      />

      <ProfileDetailModal
        open={profileDetailOpen}
        user={selectedProfileUser}
        editMode={profileEditMode}
        form={profileForm}
        saving={profileSaving}
        onClose={() => {
          setProfileDetailOpen(false);
          setProfileEditMode(false);
        }}
        onEdit={() => setProfileEditMode(true)}
        onCancelEdit={() => setProfileEditMode(false)}
        onChange={(key, value) => setProfileForm((prev) => ({ ...prev, [key]: value }))}
        onSave={handleSaveProfile}
      />

      <StatusUpdateModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        search={statusSearch}
        setSearch={setStatusSearch}
        filterStatus={statusFilter}
        setFilterStatus={setStatusFilter}
        results={statusResults}
        loading={statusSearchLoading}
        selectedUser={selectedStatusUser}
        onSelectUser={setSelectedStatusUser}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        adminComment={adminComment}
        setAdminComment={setAdminComment}
        onSubmit={handleSubmitStatusUpdate}
        submitting={statusSubmitting}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
