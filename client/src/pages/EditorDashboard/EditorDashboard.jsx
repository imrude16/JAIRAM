/*
 * EditorDashboard.jsx
 *
 * Rendered inside UserDashboard when user.role === "EDITOR".
 * Same design language / structure as the USER dashboard.
 *
 * Features:
 *  - Stats row (total, under review, accepted, rejected)
 *  - Full submissions table with:
 *      Submission ID | Title | Main Author | Status | Payment (editable)
 *      Assigned To   | Days Pending | Actions
 *  - Assign Technical Editor modal  (searchable dropdown)
 *  - Assign Reviewers modal         (multi-select searchable)
 *  - Accept / Reject modals         (with optional remarks + decisionStage)
 *  - Payment toggle modal           (with note field)
 *  - View button → navigate to submission detail
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, CheckCircle, XCircle, UserPlus, Users,
  AlertCircle, RefreshCw, Search, X, Loader,
  CreditCard, Clock, FileText, ChevronDown,
} from "lucide-react";
import api from "../../services/api";
import {
  fetchUsersByRole,
  uploadDashboardFile,
  assignTechnicalEditor as assignTechnicalEditorRequest,
  assignReviewers as assignReviewersRequest,
  fetchReviewerMajorityStatus as fetchReviewerMajorityStatusRequest,
  moveSubmissionToReview as moveSubmissionToReviewRequest,
  searchUsersForRoleChange,
  createRoleChangeRequest as createRoleChangeRequestRequest,
  fetchMyRoleChangeRequests,
} from "../../services/dashboardService";

// ─── SHARED STYLE HELPERS ─────────────────────────────────────────────────────

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

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  SUBMITTED: { label: "Submitted", color: "#0f3460", bg: "#e8eef6" },
  UNDER_REVIEW: { label: "Under Review", color: "#0e7490", bg: "#e0f2fe" },
  REVISION_REQUESTED: { label: "Revision Requested", color: "#b45309", bg: "#fef3c7" },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted", color: "#7c3aed", bg: "#ede9fe" },
  ACCEPTED: { label: "Accepted", color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

const DECISION_STAGES = [
  { value: "INITIAL_SCREENING", label: "Initial Screening" },
  { value: "POST_TECH_EDITOR", label: "Post Tech Editor Review" },
  { value: "POST_REVIEWER", label: "Post Reviewer Feedback" },
  { value: "FINAL_DECISION", label: "Final Decision" },
];

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "EDITOR", label: "Editor" },
  { value: "TECHNICAL_EDITOR", label: "Technical Editor" },
  { value: "REVIEWER", label: "Reviewer" },
  { value: "ADMIN", label: "Admin" },
];

const REQUEST_STATUS_CFG = {
  PENDING: { label: "Pending", color: "#b45309", bg: "#fef3c7" },
  APPROVED: { label: "Approved", color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontWeight: 600, borderRadius: 20, color: c.color, background: c.bg,
      fontSize: "0.7rem", padding: "3px 10px", whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
};

const formatFileSize = (size = 0) => {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const UploadSection = ({
  label,
  required = false,
  helperText,
  accept,
  multiple = false,
  uploading = false,
  progress = 0,
  files = [],
  onPick,
  onRemove,
  accent = "#0f3460",
}) => {
  const inputRef = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
        {helperText && (
          <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}>
            {" "}{helperText}
          </span>
        )}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={onPick}
      />

      <div style={{
        border: `1.5px dashed ${uploading ? `${accent}70` : "#cbd5e1"}`,
        borderRadius: 10,
        background: uploading ? `${accent}08` : "#f8fafc",
        padding: "12px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "nowrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1e293b" }}>
              {multiple ? "Upload supporting files" : "Upload revised manuscript"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 3 }}>
              {uploading
                ? `Uploading... ${progress}%`
                : multiple
                  ? "Optional extra files that accompany the revised manuscript."
                  : "Required file that will be forwarded for the next review step."}
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${uploading ? "#cbd5e1" : `${accent}50`}`,
              background: uploading ? "#e2e8f0" : "#fff",
              color: uploading ? "#94a3b8" : accent,
              fontWeight: 700,
              fontSize: "0.74rem",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {uploading ? <Loader style={{ width: 12, height: 12, animation: "spin 0.8s linear infinite" }} /> : <FileText style={{ width: 12, height: 12 }} />}
            {multiple ? "Add Files" : "Choose File"}
          </button>
        </div>

        {files.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {files.map((file, index) => (
              <div
                key={`${file.fileUrl}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#1e293b", overflowWrap: "anywhere" }}>
                    {file.fileName}
                  </div>
                  <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: 2 }}>
                    {formatFileSize(file.fileSize)}{file.mimeType ? ` • ${file.mimeType}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#dc2626",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EBtn = ({ icon: I, label, color, onClick, disabled = false, small = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: small ? "4px 9px" : "5px 11px",
      borderRadius: 6,
      border: `1.5px solid ${color}40`,
      background: color + "0d",
      color, fontSize: "0.72rem", fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1,
      transition: "all 0.12s",
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = color + "1a"; e.currentTarget.style.borderColor = color + "70"; } }}
    onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.borderColor = color + "40"; }}
  >
    {I && <I style={{ width: 11, height: 11 }} />}
    {label}
  </button>
);

const RequestStatusBadge = ({ status }) => {
  const c = REQUEST_STATUS_CFG[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
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
    }}>
      {c.label}
    </span>
  );
};

// ─── DAYS PENDING BADGE ───────────────────────────────────────────────────────

const DaysBadge = ({ days }) => {
  const warn = days >= 7;
  const mid = days >= 4 && days < 7;
  const color = warn ? "#dc2626" : mid ? "#b45309" : "#15803d";
  const bg = warn ? "#fee2e2" : mid ? "#fef3c7" : "#dcfce7";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontWeight: 700, borderRadius: 20, color, background: bg,
      fontSize: "0.7rem", padding: "3px 9px", whiteSpace: "nowrap",
    }}>
      <Clock style={{ width: 10, height: 10 }} />
      {days}d
      {warn && " ⚠"}
    </span>
  );
};

// ─── ASSIGNED TO CELL ─────────────────────────────────────────────────────────

const AssignedToCell = ({ submission }) => {
  const te = submission._techEditor;
  const teAt = submission._techEditorAssignedAt;
  const reviewers = submission._reviewers || [];

  if (!te && reviewers.length === 0) {
    return <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic" }}>Not Assigned Yet</span>;
  }

  const fmtDate = (dt) => {
    if (!dt) return null;
    const d = new Date(dt);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      {te && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.69rem", fontWeight: 600, color: "#7c3aed", background: "#ede9fe", borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap" }}>
            <UserPlus style={{ width: 9, height: 9 }} />{te}
          </span>
          {fmtDate(teAt) && (
            <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{fmtDate(teAt)}</span>
          )}
        </div>
      )}
      {reviewers.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.69rem", fontWeight: 600, color: "#0e7490", background: "#e0f2fe", borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap" }}>
            <Users style={{ width: 9, height: 9 }} />{r.name}
          </span>
          {fmtDate(r.assignedAt) && (
            <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{fmtDate(r.assignedAt)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── SEARCHABLE DROPDOWN (reusable) ──────────────────────────────────────────

const SearchDropdown = ({ placeholder, items, selected, onSelect, multi = false }) => {
  const [q, setQ] = useState("");
  const filtered = items.filter(it =>
    `${it.firstName} ${it.lastName} ${it.email}`.toLowerCase().includes(q.toLowerCase())
  );

  const isSelected = (id) =>
    multi ? selected.includes(id) : selected === id;

  const toggle = (id) => {
    if (multi) {
      onSelect(
        isSelected(id) ? selected.filter(s => s !== id) : [...selected, id]
      );
    } else {
      onSelect(isSelected(id) ? null : id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8" }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "9px 12px 9px 32px",
            border: "1.5px solid #e2e8f0", borderRadius: 8,
            fontSize: "0.8rem", outline: "none", boxSizing: "border-box",
            color: "#1e293b",
          }}
          onFocus={e => e.target.style.borderColor = "#0f3460"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>
      <div style={{
        maxHeight: 220, overflowY: "auto",
        border: "1px solid #e2e8f0", borderRadius: 8,
        background: "#fff",
      }}>
        {filtered.length === 0 && (
          <div style={{ padding: "14px 16px", fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
            No results found
          </div>
        )}
        {filtered.map(it => (
          <div
            key={it._id}
            onClick={() => toggle(it._id)}
            style={{
              padding: "10px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              borderBottom: "1px solid #f1f5f9",
              background: isSelected(it._id) ? "#e8eef6" : "#fff",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => { if (!isSelected(it._id)) e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { if (!isSelected(it._id)) e.currentTarget.style.background = "#fff"; }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: isSelected(it._id)
                ? "linear-gradient(135deg,#0f3460,#0e7490)"
                : "#f1f5f9",
              color: isSelected(it._id) ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
            }}>
              {it.firstName?.[0]}{it.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b" }}>
                {it.firstName} {it.lastName}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.email}
                {it.primarySpecialty && ` · ${it.primarySpecialty}`}
              </div>
            </div>
            {multi ? (
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${isSelected(it._id) ? "#0f3460" : "#cbd5e1"}`,
                background: isSelected(it._id) ? "#0f3460" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSelected(it._id) && <CheckCircle style={{ width: 11, height: 11, color: "#fff" }} />}
              </div>
            ) : (
              isSelected(it._id) && <CheckCircle style={{ width: 15, height: 15, color: "#0f3460" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MODAL SHELL ─────────────────────────────────────────────────────────────

const ModalShell = ({ title, subtitle, onClose, children, maxWidth = 480 }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: "#fff", borderRadius: 14,
        width: "100%", maxWidth,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        padding: "18px 24px",
        background: "linear-gradient(135deg,#0f3460,#1a4a7a)",
        borderRadius: "14px 14px 0 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", marginTop: 3, maxWidth: 340 }}>
              {subtitle}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: "20px 24px 24px", flex: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

const RoleChangeRequestModal = ({
  open,
  onClose,
  roleSearch,
  roleSearchTouched,
  setRoleSearch,
  onSearch,
  searchLoading,
  users,
  selectedUser,
  setSelectedUser,
  requestedRole,
  setRequestedRole,
  reason,
  setReason,
  onSubmit,
  submitting,
  error,
  history,
  historyLoading,
}) => {
  if (!open) return null;

  return (
    <ModalShell
      title="Role Change Request"
      subtitle="Request admin approval for changing a user's role"
      onClose={onClose}
      maxWidth={820}
    >
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Search User
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search by name or email"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  outline: "none",
                  color: "#1e293b",
                }}
              />
                <button
                  type="button"
                  onClick={onSearch}
                  disabled={searchLoading}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #0f3460",
                  background: searchLoading ? "#cbd5e1" : "#0f3460",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: searchLoading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
                >
                  {searchLoading ? "Searching..." : "Refresh"}
                </button>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", maxHeight: 220, overflowY: "auto" }}>
                {users.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
                    {roleSearch.trim().length === 0
                      ? "Start typing a name or email"
                      : roleSearch.trim().length < 2
                        ? "Type at least 2 characters"
                        : searchLoading
                          ? "Searching users..."
                          : roleSearchTouched
                            ? "No matching users found"
                            : "Search results will appear here"}
                  </div>
                ) : (
                users.map((u) => {
                  const active = selectedUser?._id === u._id;
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        border: "none",
                        borderBottom: "1px solid #f1f5f9",
                        background: active ? "#e8eef6" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                        {u.firstName} {u.lastName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>
                        {u.email}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4 }}>
                        Current Role: {u.role}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Current Selection
              </div>
              {selectedUser ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{selectedUser.email}</div>
                  <div style={{ fontSize: "0.72rem", color: "#0f3460", fontWeight: 700 }}>
                    Current Role: {selectedUser.role}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No user selected yet</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Requested Role
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ROLE_OPTIONS.map((option) => {
                  const disabled = !selectedUser || selectedUser.role === option.value;
                  const active = requestedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setRequestedRole(option.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: `1.5px solid ${active ? "#0f3460" : "#e2e8f0"}`,
                        background: disabled ? "#f8fafc" : active ? "#e8eef6" : "#fff",
                        color: disabled ? "#cbd5e1" : active ? "#0f3460" : "#475569",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedUser && requestedRole && (
              <div style={{ background: "#f8fafc", border: "1px solid #dbe5f0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
                  Transition Preview
                </div>
                <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 700 }}>
                  {selectedUser.role} → {requestedRole}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Reason <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this user's role should be changed..."
            rows={4}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              fontSize: "0.82rem",
              color: "#1e293b",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Minimum 10 characters required.</div>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px", color: "#b91c1c", fontSize: "0.78rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: submitting ? "#cbd5e1" : "#0f3460",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>

        <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.88rem", marginBottom: 12 }}>
            My Role Change Request History
          </div>

          {historyLoading ? (
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Loading request history...</div>
          ) : history.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>No role change requests made yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 260, overflowY: "auto" }}>
              {history.map((request) => (
                <div key={request._id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                        {request.userId?.firstName} {request.userId?.lastName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>
                        {request.userId?.email}
                      </div>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>

                  <div style={{ marginTop: 10, fontSize: "0.74rem", color: "#475569", lineHeight: 1.6 }}>
                    <div><strong>Transition:</strong> {request.currentRole} → {request.requestedRole}</div>
                    <div><strong>Reason:</strong> {request.reason}</div>
                    {request.adminComments && <div><strong>Admin Comments:</strong> {request.adminComments}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

// ─── ASSIGN TECH EDITOR MODAL ─────────────────────────────────────────────────

const AssignTechEditorModal = ({ submission, onClose, onDone }) => {
  const [techEditors, setTechEditors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [revisedManuscript, setRevisedManuscript] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadingRevised, setUploadingRevised] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [revisedProgress, setRevisedProgress] = useState(0);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUsersByRole("TECHNICAL_EDITOR")
      .then(setTechEditors)
      .catch(() => setTechEditors([]))
      .finally(() => setFetching(false));
  }, []);

  const handleRevisedUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingRevised(true);
    setRevisedProgress(0);
    try {
      const uploaded = await uploadDashboardFile(file, "supplementary", setRevisedProgress);
      setRevisedManuscript(uploaded);
    } catch (err) {
      alert(err.message || "Failed to upload revised manuscript.");
    } finally {
      setUploadingRevised(false);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadingAttachments(true);
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const uploaded = await uploadDashboardFile(file, "supplementary", setAttachmentProgress);
        uploadedFiles.push(uploaded);
      }
      setAttachments((prev) => [...prev, ...uploadedFiles].slice(0, 5));
    } catch (err) {
      alert(err.message || "Failed to upload attachment.");
    } finally {
      setUploadingAttachments(false);
      setAttachmentProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!selected || remarks.trim().length < 10 || !revisedManuscript) return;
    setLoading(true);
    try {
      await assignTechnicalEditorRequest(
        submission._id,
        selected,
        remarks.trim(),
        revisedManuscript,
        attachments
      );
      onDone("Technical Editor assigned successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign Technical Editor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Assign Technical Editor"
      subtitle={`Manuscript: ${submission.title?.slice(0, 60)}…`}
      onClose={onClose}
    >
      {fetching ? (
        <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: "0.8rem" }}>
          Loading Technical Editors…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SearchDropdown
            placeholder="Search by name or email…"
            items={techEditors}
            selected={selected}
            onSelect={setSelected}
            multi={false}
          />

          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Remarks <span style={{ color: "#dc2626" }}>*</span>
              <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}> (min 10 characters)</span>
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Provide guidance or notes for the Technical Editor…"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.8rem", resize: "none", outline: "none",
                fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#0f3460"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <UploadSection
            label="Revised Manuscript"
            required={true}
            helperText="(required)"
            accept=".doc,.docx,.pdf"
            uploading={uploadingRevised}
            progress={revisedProgress}
            files={revisedManuscript ? [revisedManuscript] : []}
            onPick={handleRevisedUpload}
            onRemove={() => setRevisedManuscript(null)}
            accent="#0f3460"
          />

          <UploadSection
            label="Attachments"
            helperText="(optional, up to 5)"
            accept=".doc,.docx,.pdf,.xlsx,.xls,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
            multiple={true}
            uploading={uploadingAttachments}
            progress={attachmentProgress}
            files={attachments}
            onPick={handleAttachmentUpload}
            onRemove={(index) => setAttachments((prev) => prev.filter((_, i) => i !== index))}
            accent="#1a4a7a"
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selected || remarks.trim().length < 10 || !revisedManuscript || loading || uploadingRevised || uploadingAttachments}
              style={{
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: (!selected || remarks.trim().length < 10 || !revisedManuscript || loading || uploadingRevised || uploadingAttachments) ? "#cbd5e1" : "linear-gradient(135deg,#0f3460,#1a4a7a)",
                color: "#fff", fontWeight: 600, fontSize: "0.8rem",
                cursor: (!selected || remarks.trim().length < 10 || !revisedManuscript || loading || uploadingRevised || uploadingAttachments) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Assigning…" : "Assign"}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ModalShell>
  );
};

// ─── ASSIGN REVIEWERS MODAL ───────────────────────────────────────────────────

const AssignReviewersModal = ({ submission, onClose, onDone }) => {
  const [reviewers, setReviewers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [revisedManuscript, setRevisedManuscript] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadingRevised, setUploadingRevised] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [revisedProgress, setRevisedProgress] = useState(0);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUsersByRole("REVIEWER")
      .then(setReviewers)
      .catch(() => setReviewers([]))
      .finally(() => setFetching(false));
  }, []);

  const canSubmit = selected.length >= 2 && selected.length <= 5 && remarks.trim().length >= 10 && !!revisedManuscript;

  const handleRevisedUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingRevised(true);
    setRevisedProgress(0);
    try {
      const uploaded = await uploadDashboardFile(file, "supplementary", setRevisedProgress);
      setRevisedManuscript(uploaded);
    } catch (err) {
      alert(err.message || "Failed to upload revised manuscript.");
    } finally {
      setUploadingRevised(false);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadingAttachments(true);
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const uploaded = await uploadDashboardFile(file, "supplementary", setAttachmentProgress);
        uploadedFiles.push(uploaded);
      }
      setAttachments((prev) => [...prev, ...uploadedFiles].slice(0, 5));
    } catch (err) {
      alert(err.message || "Failed to upload attachment.");
    } finally {
      setUploadingAttachments(false);
      setAttachmentProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await assignReviewersRequest(
        submission._id,
        selected,
        remarks.trim(),
        revisedManuscript,
        attachments
      );
      onDone("Reviewers assigned successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign Reviewers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Assign Reviewers"
      subtitle={`Manuscript: ${submission.title?.slice(0, 60)}…`}
      onClose={onClose}
      maxWidth={520}
    >
      {fetching ? (
        <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: "0.8rem" }}>
          Loading Reviewers…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Select 2–5 reviewers
            </span>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700,
              color: selected.length >= 2 ? "#15803d" : "#b45309",
              background: selected.length >= 2 ? "#dcfce7" : "#fef3c7",
              padding: "2px 10px", borderRadius: 20,
            }}>
              {selected.length} selected
            </span>
          </div>

          <SearchDropdown
            placeholder="Search by name, email or speciality…"
            items={reviewers}
            selected={selected}
            onSelect={setSelected}
            multi={true}
          />

          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Remarks <span style={{ color: "#dc2626" }}>*</span>
              <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}> (min 10 characters)</span>
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Provide review instructions or areas to focus on…"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.8rem", resize: "none", outline: "none",
                fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#0f3460"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <UploadSection
            label="Revised Manuscript"
            required={true}
            helperText="(required)"
            accept=".doc,.docx,.pdf"
            uploading={uploadingRevised}
            progress={revisedProgress}
            files={revisedManuscript ? [revisedManuscript] : []}
            onPick={handleRevisedUpload}
            onRemove={() => setRevisedManuscript(null)}
            accent="#0e7490"
          />

          <UploadSection
            label="Attachments"
            helperText="(optional, up to 5)"
            accept=".doc,.docx,.pdf,.xlsx,.xls,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
            multiple={true}
            uploading={uploadingAttachments}
            progress={attachmentProgress}
            files={attachments}
            onPick={handleAttachmentUpload}
            onRemove={(index) => setAttachments((prev) => prev.filter((_, i) => i !== index))}
            accent="#0891b2"
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading || uploadingRevised || uploadingAttachments}
              style={{
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: (!canSubmit || loading || uploadingRevised || uploadingAttachments) ? "#cbd5e1" : "linear-gradient(135deg,#0e7490,#0891b2)",
                color: "#fff", fontWeight: 600, fontSize: "0.8rem",
                cursor: (!canSubmit || loading || uploadingRevised || uploadingAttachments) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Assigning…" : `Assign ${selected.length > 0 ? selected.length : ""} Reviewer${selected.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

// ─── ACCEPT MODAL ─────────────────────────────────────────────────────────────

const AcceptModal = ({ submission, onClose, onDone }) => {
  const [stage, setStage] = useState("INITIAL_SCREENING");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post(`/submissions/${submission._id}/editor-decision`, {
        decision: "ACCEPT",
        decisionStage: stage,
        remarks: remarks.trim() || undefined,
      });
      onDone("Manuscript accepted successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept manuscript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Accept Manuscript"
      subtitle={submission.title?.slice(0, 70)}
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Info strip */}
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "11px 14px", fontSize: "0.78rem", color: "#15803d", lineHeight: 1.5 }}>
          Accepting this manuscript will move its status to <strong>Accepted</strong> and notify the author.
        </div>

        {/* Decision Stage */}
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Decision Stage <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              style={{
                width: "100%", padding: "9px 34px 9px 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.8rem", outline: "none",
                appearance: "none", background: "#fff",
                color: "#1e293b", cursor: "pointer", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#15803d"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            >
              {DECISION_STAGES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Remarks <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Any notes for the acceptance decision…"
            rows={3}
            style={{
              width: "100%", padding: "10px 12px",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: "0.8rem", resize: "none", outline: "none",
              fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#15803d"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: loading ? "#cbd5e1" : "linear-gradient(135deg,#15803d,#16a34a)",
              color: "#fff", fontWeight: 600, fontSize: "0.8rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {loading ? "Processing…" : "Confirm Accept"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── REJECT MODAL ─────────────────────────────────────────────────────────────

const RejectModal = ({ submission, onClose, onDone }) => {
  const [stage, setStage] = useState("INITIAL_SCREENING");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (remarks.trim().length < 10) return;
    setLoading(true);
    try {
      await api.post(`/submissions/${submission._id}/editor-decision`, {
        decision: "REJECT",
        decisionStage: stage,
        remarks: remarks.trim(),
      });
      onDone("Manuscript rejected.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject manuscript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Reject Manuscript"
      subtitle={submission.title?.slice(0, 70)}
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Warning strip */}
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, padding: "11px 14px", fontSize: "0.78rem", color: "#dc2626", lineHeight: 1.5 }}>
          Rejecting will move the status to <strong>Rejected</strong>. This action ends the review process.
        </div>

        {/* Decision Stage */}
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Decision Stage <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              style={{
                width: "100%", padding: "9px 34px 9px 12px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: "0.8rem", outline: "none",
                appearance: "none", background: "#fff",
                color: "#1e293b", cursor: "pointer", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#dc2626"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            >
              {DECISION_STAGES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Remarks — required for rejection */}
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Reason for Rejection <span style={{ color: "#dc2626" }}>*</span>
            <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}> (min 10 characters)</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Provide detailed reason for rejection…"
            rows={4}
            style={{
              width: "100%", padding: "10px 12px",
              border: `1.5px solid ${remarks.length > 0 && remarks.trim().length < 10 ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 8, fontSize: "0.8rem", resize: "none", outline: "none",
              fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#dc2626"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4, textAlign: "right" }}>
            {remarks.trim().length}/10 min
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={remarks.trim().length < 10 || loading}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: (remarks.trim().length < 10 || loading) ? "#cbd5e1" : "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "#fff", fontWeight: 600, fontSize: "0.8rem",
              cursor: (remarks.trim().length < 10 || loading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {loading ? "Processing…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── PAYMENT MODAL ────────────────────────────────────────────────────────────

const RequestRevisionModal = ({ submission, onClose, onDone }) => {
  const [remarks, setRemarks] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const canSubmit = remarks.trim().length >= 10 && !uploadingAttachments;

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadingAttachments(true);
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const uploaded = await uploadDashboardFile(file, "supplementary", setAttachmentProgress);
        uploadedFiles.push(uploaded);
      }
      setAttachments((prev) => [...prev, ...uploadedFiles].slice(0, 10));
    } catch (err) {
      alert(err.message || "Failed to upload attachment.");
    } finally {
      setUploadingAttachments(false);
      setAttachmentProgress(0);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/submissions/revisions", {
        originalSubmissionId: submission._id,
        submitterRoleType: "Editor",
        revisionStage: "EDITOR_TO_AUTHOR",
        remarks: remarks.trim(),
        attachments,
      });
      onDone("Revision requested successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request revision.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Request Revision"
      subtitle={submission.title?.slice(0, 70)}
      onClose={onClose}
      maxWidth={560}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "11px 14px", fontSize: "0.78rem", color: "#92400e", lineHeight: 1.5 }}>
          This will move the manuscript to <strong>Revision Requested</strong> and send your remarks and optional files to the author.
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Remarks for Author <span style={{ color: "#dc2626" }}>*</span>
            <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}> (min 10 characters)</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Explain what the author should revise..."
            rows={5}
            style={{
              width: "100%", padding: "10px 12px",
              border: `1.5px solid ${remarks.length > 0 && remarks.trim().length < 10 ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 8, fontSize: "0.8rem", resize: "none", outline: "none",
              fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#b45309"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4, textAlign: "right" }}>
            {remarks.trim().length}/10 min
          </div>
        </div>

        <UploadSection
          label="Attachments"
          helperText="Optional, up to 10 files"
          multiple
          uploading={uploadingAttachments}
          progress={attachmentProgress}
          files={attachments}
          onPick={handleAttachmentUpload}
          onRemove={handleRemoveAttachment}
          accent="#b45309"
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: (!canSubmit || loading) ? "#cbd5e1" : "linear-gradient(135deg,#b45309,#d97706)",
              color: "#fff", fontWeight: 600, fontSize: "0.8rem",
              cursor: (!canSubmit || loading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {loading ? "Submitting..." : "Submit Revision Request"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const MoveToReviewModal = ({ submission, onClose, onDone }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await fetchReviewerMajorityStatusRequest(submission._id);
        if (!active) return;
        setStatusData(result);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load move-to-review conditions.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStatus();
    return () => { active = false; };
  }, [submission?._id]);

  const totalSuggested = statusData?.totalSuggested ?? statusData?.total ?? submission?.suggestedReviewers?.length ?? 0;
  const acceptedCount = statusData?.accepted ?? 0;
  const requiredAcceptances = statusData?.requiredAcceptances ?? Math.ceil(Math.max(totalSuggested, 0) / 2);
  const hasAcceptedDatabaseReviewer = !!statusData?.hasAcceptedDatabaseReviewer;
  const hasMinimumSuggestedReviewers =
    typeof statusData?.hasMinimumSuggestedReviewers === "boolean"
      ? statusData.hasMinimumSuggestedReviewers
      : totalSuggested >= 2;
  const majorityMet = !!statusData?.majorityMet;
  const reviewerConditionMet = majorityMet || hasAcceptedDatabaseReviewer;
  const canMove =
    typeof statusData?.canMove === "boolean"
      ? statusData.canMove
      : hasMinimumSuggestedReviewers && reviewerConditionMet;

  const conditionRow = (ok, label, helper) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 10,
        border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
        background: ok ? "#f0fdf4" : "#fef2f2",
      }}
    >
      <div style={{ fontSize: "1rem", lineHeight: 1.2, marginTop: 1 }}>{ok ? "✅" : "❌"}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>{label}</div>
        <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{helper}</div>
      </div>
    </div>
  );

  const handleMove = async () => {
    try {
      setSubmitting(true);
      await moveSubmissionToReviewRequest(submission._id);
      onDone("Submission moved to peer review successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move submission to review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Move To Review"
      subtitle={submission?.title || "Check whether this submission can move from Submitted to Under Review"}
      onClose={onClose}
      maxWidth={620}
    >
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: "0.9rem" }}>
          <Loader style={{ width: 15, height: 15, animation: "spin 0.8s linear infinite" }} />
          Checking conditions...
        </div>
      ) : error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", padding: "12px 14px", borderRadius: 10, fontSize: "0.85rem" }}>
          {error}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {conditionRow(
            hasMinimumSuggestedReviewers,
            "At least two Suggested Reviewers required",
            `${totalSuggested} suggested reviewer${totalSuggested === 1 ? "" : "s"} currently available`
          )}

          {conditionRow(
            reviewerConditionMet,
            "Suggested Reviewer invitation accepted",
            `Majority accepted: ${acceptedCount}/${totalSuggested} (need ${requiredAcceptances}) OR one accepted DATABASE_SEARCH reviewer`
          )}

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: canMove ? "#eff6ff" : "#f8fafc",
              border: `1px solid ${canMove ? "#bfdbfe" : "#e2e8f0"}`,
              color: "#334155",
              fontSize: "0.8rem",
              lineHeight: 1.55,
            }}
          >
            {canMove
              ? "All required backend conditions are satisfied. You can now move this submission to Under Review."
              : "One or more required conditions are not met yet. The Move To Review button stays disabled until all required conditions pass."}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#334155",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleMove}
          disabled={loading || !!error || !canMove || submitting}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid #0e7490",
            background: loading || !!error || !canMove || submitting ? "#cbd5e1" : "#0e7490",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: loading || !!error || !canMove || submitting ? "not-allowed" : "pointer",
            opacity: loading || !!error || !canMove || submitting ? 0.75 : 1,
          }}
        >
          {submitting ? "Moving..." : "Move To Review"}
        </button>
      </div>
    </ModalShell>
  );
};

const PaymentModal = ({ submission, onClose, onDone }) => {
  const [newStatus, setNewStatus] = useState(!submission.paymentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/submissions/${submission._id}/payment-status`, {
        paymentStatus: newStatus,
        note: note.trim() || undefined,
      });
      onDone(`Payment status updated to ${newStatus ? "Paid" : "Pending"}.`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update payment status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Update Payment Status"
      subtitle={submission.title?.slice(0, 60)}
      onClose={onClose}
      maxWidth={420}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Toggle */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { val: true, label: "Mark as Paid", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
            { val: false, label: "Mark as Pending", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => setNewStatus(opt.val)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                fontWeight: 700, fontSize: "0.8rem",
                border: `2px solid ${newStatus === opt.val ? opt.border : "#e2e8f0"}`,
                background: newStatus === opt.val ? opt.bg : "#f9fafb",
                color: newStatus === opt.val ? opt.color : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Current status indicator */}
        <div style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center" }}>
          Current status:{" "}
          <strong style={{ color: submission.paymentStatus ? "#15803d" : "#6b7280" }}>
            {submission.paymentStatus ? "Paid" : "Pending"}
          </strong>
          {" → "}
          <strong style={{ color: newStatus ? "#15803d" : "#6b7280" }}>
            {newStatus ? "Paid" : "Pending"}
          </strong>
        </div>

        {/* Note */}
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Note <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}>(Optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Payment received via NEFT on 01-Apr-2026…"
            rows={3}
            style={{
              width: "100%", padding: "10px 12px",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: "0.8rem", resize: "none", outline: "none",
              fontFamily: "system-ui", color: "#1e293b", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: loading ? "#cbd5e1" : "linear-gradient(135deg,#0f3460,#1a4a7a)",
              color: "#fff", fontWeight: 600, fontSize: "0.8rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {loading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {loading ? "Saving…" : "Update Payment"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── TOAST (lightweight inline) ───────────────────────────────────────────────

const Toast = ({ message, type = "success" }) => (
  <div style={{
    position: "fixed", bottom: 28, right: 28, zIndex: 500,
    display: "flex", alignItems: "center", gap: 10,
    padding: "13px 20px", borderRadius: 10,
    background: type === "success" ? "#0f3460" : "#dc2626",
    color: "#fff", fontWeight: 600, fontSize: "0.82rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    animation: "slideUp 0.25s ease-out",
  }}>
    {type === "success"
      ? <CheckCircle style={{ width: 16, height: 16 }} />
      : <XCircle style={{ width: 16, height: 16 }} />}
    {message}
    <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
  </div>
);

// ─── EDITOR STATS ─────────────────────────────────────────────────────────────

const EditorStats = ({ subs }) => {
  const counts = {
    total: subs.length,
    reviewing: subs.filter(s => s.status === "UNDER_REVIEW").length,
    accepted: subs.filter(s => s.status === "ACCEPTED").length,
    revision: subs.filter(s => s.status === "REVISION_REQUESTED").length,
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {[
        { label: "Total Submissions", value: counts.total, color: "#0f3460" },
        { label: "Under Review", value: counts.reviewing, color: "#0e7490" },
        { label: "Accepted", value: counts.accepted, color: "#15803d" },
        { label: "Revision Pending", value: counts.revision, color: "#b45309" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, lineHeight: 1.35 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── EDITOR TABLE ─────────────────────────────────────────────────────────────

const EditorTable = ({ subs, onAction }) => {
  const [filter, setFilter] = useState("ALL");

  const statuses = ["ALL", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "PROVISIONALLY_ACCEPTED", "ACCEPTED", "REJECTED"];

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "ALL" ? subs.length : subs.filter(x => x.status === s).length;
    return acc;
  }, {});

  const displayed = filter === "ALL" ? subs : subs.filter(s => s.status === filter);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      {/* Table header + filter tabs */}
      <div style={{ padding: "15px 20px", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>All Submissions</span>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{displayed.length} of {subs.length}</span>
        </div>
        {/* Filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {statuses.map(s => {
            const cfg = STATUS_CFG[s] || { color: "#0f3460", bg: "#e8eef6" };
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "4px 11px", borderRadius: 20, border: "none",
                  cursor: "pointer", fontSize: "0.68rem", fontWeight: 700,
                  transition: "all 0.12s",
                  background: active ? (s === "ALL" ? "#0f3460" : cfg.color) : "#f1f5f9",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {s === "ALL" ? "All" : (STATUS_CFG[s]?.label || s)}
                {" "}
                <span style={{ opacity: 0.8 }}>({counts[s]})</span>
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
          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>No submissions with this status.</div>
        </div>
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
                  "Submission ID", "Title", "Main Author",
                  "Status", "Payment", "Assigned To", "Actions",
                ].map((h, i, arr) => (
                  <th key={h} style={TH(i === arr.length - 1)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(sub => (
                <tr
                  key={sub._id}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Submission ID */}
                  <td style={TD()}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#0f3460", fontWeight: 700 }}>
                      {sub.submissionNumber || "—"}
                    </span>
                  </td>

                  {/* Title */}
                  <td style={TD()}>
                    <div style={{ fontSize: "0.78rem", color: "#1e293b", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textAlign: "left" }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 3, textAlign: "left" }}>
                      {sub.articleType}
                    </div>
                  </td>

                  {/* Main Author */}
                  <td style={TD()}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#334155" }}>
                      {sub._mainAuthor}
                    </div>
                    {sub._mainAuthorEmail && (
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2, whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}>
                        {sub._mainAuthorEmail}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={TD()}>
                    <StatusBadge status={sub.status} />
                  </td>

                  {/* Payment — clickable to edit */}
                  <td style={TD()}>
                    <button
                      onClick={() => onAction("payment", sub)}
                      title="Click to update payment status"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontWeight: 600, borderRadius: 20, cursor: "pointer",
                        color: sub.paymentStatus ? "#15803d" : "#6b7280",
                        background: sub.paymentStatus ? "#dcfce7" : "#f3f4f6",
                        fontSize: "0.7rem", padding: "3px 9px",
                        border: `1px solid ${sub.paymentStatus ? "#bbf7d0" : "#e5e7eb"}`,
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      <CreditCard style={{ width: 10, height: 10 }} />
                      {sub.paymentStatus ? "Paid" : "Pending"}
                    </button>
                  </td>

                  {/* Assigned To */}
                  <td style={TD()}>
                    <AssignedToCell submission={sub} />
                  </td>

                  {/* Actions */}
                  <td style={{ ...TD(true), textAlign: "left" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {/* View — always visible */}
                      <EBtn icon={Eye} label="View" color="#0e7490" onClick={() => onAction("view", sub)} />

                      <EBtn
                        icon={CheckCircle}
                        label="Move To Review"
                        color="#0e7490"
                        onClick={() => onAction("moveToReview", sub)}
                        disabled={sub.status !== "SUBMITTED"}
                      />

                      {/* Tech Ed — disabled if already assigned OR submission is Accepted/Rejected */}
                      <EBtn
                        icon={UserPlus} label="Tech Ed" color="#7c3aed"
                        onClick={() => onAction("techEditor", sub)}
                        disabled={!!sub._techEditor || sub.status === "ACCEPTED" || sub.status === "REJECTED"}
                      />

                      {/* Reviewers — disabled if already assigned (≥2) OR submission is Accepted/Rejected */}
                      <EBtn
                        icon={Users} label="Reviewers" color="#0891b2"
                        onClick={() => onAction("reviewers", sub)}
                        disabled={sub._reviewers?.length >= 2 || sub.status === "ACCEPTED" || sub.status === "REJECTED"}
                      />

                      {/* Accept — disabled if already Accepted or Rejected */}
                      <EBtn
                        icon={CreditCard} label="Provisionally Accept" color="#7c3aed"
                        onClick={() => onAction("provisionallyAccept", sub)}
                        disabled={sub.status !== "UNDER_REVIEW" || !!sub.paymentStatus}
                      />

                      <EBtn
                        icon={FileText} label="Request Revision" color="#b45309"
                        onClick={() => onAction("requestRevision", sub)}
                        disabled={
                          !["UNDER_REVIEW", "REVISION_REQUESTED", "PROVISIONALLY_ACCEPTED"].includes(sub.status)
                        }
                      />

                      <EBtn
                        icon={CheckCircle} label="Accept" color="#15803d"
                        onClick={() => onAction("accept", sub)}
                        disabled={sub.status === "ACCEPTED" || sub.status === "REJECTED"}
                      />

                      {/* Reject — disabled if already Accepted or Rejected */}
                      <EBtn
                        icon={XCircle} label="Reject" color="#dc2626"
                        onClick={() => onAction("reject", sub)}
                        disabled={sub.status === "ACCEPTED" || sub.status === "REJECTED"}
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

// ─── MAIN EditorDashboard ─────────────────────────────────────────────────────

export default function EditorDashboard({ user, showRoleChangeModal, onCloseRoleChangeModal }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { type, submission }
  const [toast, setToast] = useState(null); // { message, type }
  const [roleUsers, setRoleUsers] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleSearchTouched, setRoleSearchTouched] = useState(false);
  const [roleSearchLoading, setRoleSearchLoading] = useState(false);
  const [selectedRoleUser, setSelectedRoleUser] = useState(null);
  const [requestedRole, setRequestedRole] = useState("");
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [roleChangeSubmitting, setRoleChangeSubmitting] = useState(false);
  const [roleChangeError, setRoleChangeError] = useState("");
  const [myRoleChangeRequests, setMyRoleChangeRequests] = useState([]);
  const [roleHistoryLoading, setRoleHistoryLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Compute days pending ──────────────────────────────────────────────────
  // ── Extract assignment info from the backend-populated submission ─────────
  //
  // Backend populates via listSubmissions (EDITOR role):
  //   assignedEditor   → { _id, firstName, lastName }  (Tech Editor)
  //   currentCycleId   → { assignedReviewers: [{ user: {firstName,lastName}, ... }] }
  //
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
        .map(r => {
          if (!r.reviewer) return null;
          return {
            name: `${r.reviewer.firstName || ""} ${r.reviewer.lastName || ""}`.trim(),
            assignedAt: r.assignedDate ?? null,
          };
        })
        .filter(Boolean);
    }

    return {
      _techEditor: techEditor,
      _techEditorAssignedAt: techEditorAssignedAt,
      _reviewers: reviewers,
    };
  };

  // ── Fetch all submissions ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/submissions", {
        params: { limit: 100, sortBy: "submittedAt", sortOrder: "desc" },
      });
      const raw = data?.data?.submissions || [];

      const normalised = raw.map(sub => ({
        ...sub,
        _mainAuthor: sub.author
          ? `${sub.author.firstName || ""} ${sub.author.lastName || ""}`.trim()
          : "—",
        _mainAuthorEmail: sub.author?.email || "",
        ...extractAssignment(sub),
      }));

      setSubmissions(normalised);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!showRoleChangeModal) return;

    setRoleSearch("");
    setRoleUsers([]);
    setRoleSearchTouched(false);
    setSelectedRoleUser(null);
    setRequestedRole("");
    setRoleChangeReason("");
    setRoleChangeError("");

    const loadHistory = async () => {
      try {
        setRoleHistoryLoading(true);
        const result = await fetchMyRoleChangeRequests();
        setMyRoleChangeRequests(result.requests || []);
      } catch (err) {
        setRoleChangeError(err.response?.data?.message || err.message || "Failed to load role change request history.");
      } finally {
        setRoleHistoryLoading(false);
      }
    };

    loadHistory();
  }, [showRoleChangeModal]);

  useEffect(() => {
    if (!showRoleChangeModal) return;

    const q = roleSearch.trim();

    if (q.length === 0) {
      setRoleUsers([]);
      setRoleSearchLoading(false);
      setRoleChangeError("");
      setRoleSearchTouched(false);
      return;
    }

    if (q.length < 2) {
      setRoleUsers([]);
      setRoleSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setRoleSearchLoading(true);
        setRoleChangeError("");
        setRoleSearchTouched(true);

        const result = await searchUsersForRoleChange(q);
        setRoleUsers(result.users || []);
      } catch (err) {
        setRoleUsers([]);
        setRoleChangeError(
          err.response?.data?.message || err.message || "Failed to search users."
        );
      } finally {
        setRoleSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [roleSearch, showRoleChangeModal]);

  // ── Action handler ────────────────────────────────────────────────────────
  const handleAction = async (type, submission) => {
    if (type === "view") {
      navigate(`/submissions/${submission._id}`);
      return;
    }
    if (type === "moveToReview") {
      setModal({ type, submission });
      return;
    }
    if (type === "provisionallyAccept") {
      try {
        await api.put(`/submissions/${submission._id}/status`, {
          status: "PROVISIONALLY_ACCEPTED",
          comments: "Provisionally accepted pending payment.",
        });
        showToast("Manuscript provisionally accepted.");
        load();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to provisionally accept manuscript.");
      }
      return;
    }
    setModal({ type, submission });
  };

  // ── Modal done callback ───────────────────────────────────────────────────
  const handleModalDone = (msg) => {
    setModal(null);
    showToast(msg);
    load(); // refresh table
  };

  const handleRoleUserSearch = async () => {
    const q = roleSearch.trim();

    if (q.length < 2) {
      setRoleChangeError("Please enter at least 2 characters to search users.");
      return;
    }

    try {
      setRoleSearchLoading(true);
      setRoleChangeError("");
      setRoleSearchTouched(true);
      const result = await searchUsersForRoleChange(q);
      setRoleUsers(result.users || []);
    } catch (err) {
      setRoleChangeError(err.response?.data?.message || err.message || "Failed to search users.");
    } finally {
      setRoleSearchLoading(false);
    }
  };

  const handleCreateRoleChangeRequest = async () => {
    if (!selectedRoleUser) {
      setRoleChangeError("Please select a user.");
      return;
    }

    if (!requestedRole) {
      setRoleChangeError("Please select the requested role.");
      return;
    }

    if (selectedRoleUser.role === requestedRole) {
      setRoleChangeError("Requested role must be different from the user's current role.");
      return;
    }

    if (roleChangeReason.trim().length < 10) {
      setRoleChangeError("Reason must be at least 10 characters.");
      return;
    }

    try {
      setRoleChangeSubmitting(true);
      setRoleChangeError("");

      await createRoleChangeRequestRequest({
        userId: selectedRoleUser._id,
        requestedRole,
        reason: roleChangeReason.trim(),
      });

      const history = await fetchMyRoleChangeRequests();
      setMyRoleChangeRequests(history.requests || []);

      setSelectedRoleUser(null);
      setRequestedRole("");
      setRoleChangeReason("");
      setRoleUsers([]);
      setRoleSearch("");

      showToast("Role change request submitted successfully.");
    } catch (err) {
      setRoleChangeError(err.response?.data?.message || err.message || "Failed to create role change request.");
    } finally {
      setRoleChangeSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Refresh button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 13px", borderRadius: 8,
            border: "1.5px solid #e2e8f0", background: "#fff",
            color: "#64748b", fontSize: "0.75rem", fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0f3460", animation: "espin 0.8s linear infinite" }} />
          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>Loading submissions…</div>
          <style>{`@keyframes espin { to { transform:rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle style={{ width: 22, height: 22, color: "#dc2626" }} />
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>Could not load submissions</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>{error}</div>
          <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f3460", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} />Try Again
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          <EditorStats subs={submissions} />
          <EditorTable subs={submissions} onAction={handleAction} />
        </>
      )}

      {/* ── MODALS ── */}
      {modal?.type === "techEditor" && (
        <AssignTechEditorModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "reviewers" && (
        <AssignReviewersModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "accept" && (
        <AcceptModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "reject" && (
        <RejectModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "requestRevision" && (
        <RequestRevisionModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "moveToReview" && (
        <MoveToReviewModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}
      {modal?.type === "payment" && (
        <PaymentModal
          submission={modal.submission}
          onClose={() => setModal(null)}
          onDone={handleModalDone}
        />
      )}

      <RoleChangeRequestModal
        open={showRoleChangeModal}
        onClose={onCloseRoleChangeModal}
        roleSearch={roleSearch}
        roleSearchTouched={roleSearchTouched}
        setRoleSearch={setRoleSearch}
        onSearch={handleRoleUserSearch}
        searchLoading={roleSearchLoading}
        users={roleUsers}
        selectedUser={selectedRoleUser}
        setSelectedUser={setSelectedRoleUser}
        requestedRole={requestedRole}
        setRequestedRole={setRequestedRole}
        reason={roleChangeReason}
        setReason={setRoleChangeReason}
        onSubmit={handleCreateRoleChangeRequest}
        submitting={roleChangeSubmitting}
        error={roleChangeError}
        history={myRoleChangeRequests}
        historyLoading={roleHistoryLoading}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
