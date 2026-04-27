/*
 * UserDashboard.jsx  (updated)
 *
 * Handles:
 *   role USER   → Normal / Author / Co-Author / Both views
 *   role EDITOR → EditorDashboard (same shell, different content)
 *   role TECHNICAL_EDITOR / REVIEWER → RolePlaceholder (coming soon)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, FileText, Plus, Eye, Edit3, Upload,
  CheckCircle, XCircle, AlertCircle, BookOpen, Shield,
  RefreshCw, Loader, User, X, ChevronDown, UserCog, UserRoundCheck,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useDashboard from "../../hooks/useDashboard";
import {
  acceptConsentFromDashboard,
  rejectConsentFromDashboard,
  fetchSubmissionById,
  uploadDashboardFile,
  resubmitAuthorRevision,
} from "../../services/dashboardService";
import EditorDashboard from "../EditorDashboard/EditorDashboard";   // ← NEW import
import TechnicalEditorDashboard from "../TechnicalEditorDashboard/TechnicalEditorDashboard";
import ReviewerDashboard from "../ReviewerDashboard/ReviewerDashboard";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import { openFilePreview } from "../../utils/filePreview";

// ─── STATUS / CONSENT CONFIG ──────────────────────────────────────────────────

const STATUS_CFG = {
  DRAFT:                  { label: "Draft",              color: "#6b7280", bg: "#f3f4f6",  icon: Edit3 },
  SUBMITTED:              { label: "Submitted",          color: "#0f3460", bg: "#e8eef6",  icon: FileText },
  UNDER_REVIEW:           { label: "Under Review",       color: "#0e7490", bg: "#e0f2fe",  icon: Eye },
  REVISION_REQUESTED:     { label: "Revision Requested", color: "#b45309", bg: "#fef3c7",  icon: AlertCircle },
  PROVISIONALLY_ACCEPTED: { label: "Prov. Accepted",     color: "#7c3aed", bg: "#ede9fe",  icon: CheckCircle },
  ACCEPTED:               { label: "Accepted",           color: "#15803d", bg: "#dcfce7",  icon: CheckCircle },
  REJECTED:               { label: "Rejected",           color: "#dc2626", bg: "#fee2e2",  icon: XCircle },
};

const CONSENT_CFG = {
  NOT_REQUIRED: { label: "Not Required", color: "#475569", bg: "#e2e8f0" },
  APPROVED: { label: "All Approved", color: "#15803d", bg: "#dcfce7" },
  PENDING:  { label: "Pending",      color: "#b45309", bg: "#fef3c7" },
  REJECTED: { label: "Rejected",     color: "#dc2626", bg: "#fee2e2" },
};

// ─── TABLE CELL STYLES ────────────────────────────────────────────────────────

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
});

// ─── ATOMS ────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.DRAFT;
  const I = c.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, borderRadius: 20, color: c.color, background: c.bg, fontSize: "0.7rem", padding: "3px 10px", whiteSpace: "nowrap" }}>
      <I style={{ width: 11, height: 11 }} />{c.label}
    </span>
  );
};

const ConsentBadge = ({ status }) => {
  const c = CONSENT_CFG[status] || CONSENT_CFG.PENDING;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, borderRadius: 20, color: c.color, background: c.bg, fontSize: "0.7rem", padding: "3px 10px", whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
};

const Btn = ({ icon: I, label, color, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: `1.5px solid ${color}40`, background: color + "0d", color, fontSize: "0.72rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1 }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = color + "1a"; e.currentTarget.style.borderColor = color + "70"; } }}
    onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.borderColor = color + "40"; }}
  >
    <I style={{ width: 11, height: 11 }} />{label}
  </button>
);

const formatFileSize = (size = 0) => {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

// ─── TOPBAR ───────────────────────────────────────────────────────────────────

const Topbar = ({ user, onLogout, onProfileClick, onRoleChangeClick, onAdminToolSelect }) => {
  const navigate = useNavigate();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  return (
  <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 50 }}>
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div 
       onClick={() => navigate("/")}
       style={{ display: "flex", alignItems: "center", gap: 12,cursor: "pointer", transition: "opacity 0.15s" }}>
        <img src="/assets/Logo.jpg" alt="JAIRAM" style={{ height: 36 }} />
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, color: "#0f3460", fontSize: "0.9rem" }}>JAIRAM</div>
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>Manuscript Portal</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111827" }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{user?.email}</div>
        </div>
        {/* Avatar — click to open profile */}
        <div
          onClick={onProfileClick}
          title="View Profile"
          style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#0f3460,#0e7490)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0, cursor: "pointer", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        {/* Profile text button */}
        <button
          onClick={onProfileClick}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f3460"; e.currentTarget.style.color = "#0f3460"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
        >
          <User style={{ width: 14, height: 14 }} />Profile
        </button>
        {(user?.role === "EDITOR" || user?.role === "ADMIN") && (
          <button
            onClick={onRoleChangeClick}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f3460"; e.currentTarget.style.color = "#0f3460"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            <Shield style={{ width: 14, height: 14 }} />
            {user?.role === "ADMIN" ? "Review Role Change Requests" : "Role Change Request"}
          </button>
        )}
        {user?.role === "ADMIN" && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setAdminMenuOpen((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f3460"; e.currentTarget.style.color = "#0f3460"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
            >
              <Shield style={{ width: 14, height: 14 }} />
              Admin Tools
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            {adminMenuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 12px 30px rgba(15,23,42,0.12)", overflow: "hidden", zIndex: 120 }}>
                <button
                  onClick={() => { setAdminMenuOpen(false); onAdminToolSelect?.("updateProfile"); }}
                  style={{ width: "100%", border: "none", background: "#fff", padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                >
                  <UserCog style={{ width: 14, height: 14 }} />
                  Update Profiles
                </button>
                <button
                  onClick={() => { setAdminMenuOpen(false); onAdminToolSelect?.("updateStatus"); }}
                  style={{ width: "100%", border: "none", borderTop: "1px solid #f1f5f9", background: "#fff", padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                >
                  <UserRoundCheck style={{ width: 14, height: 14 }} />
                  Update User Status
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
        >
          <LogOut style={{ width: 14, height: 14 }} />Logout
        </button>
      </div>
    </div>
  </header>
  );
};

// ─── PROFILE CARD (used in USER views) ───────────────────────────────────────

const ProfileCard = ({ user }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#0f3460,#0e7490)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0 }}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}>{user?.firstName} {user?.lastName}</div>
      <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>{user?.email}</div>
      {user?.institution && <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>{user.institution}</div>}
    </div>
  </div>
);

// ─── PROFILE PANEL (slide-in drawer) ─────────────────────────────────────────

const ProfilePanel = ({ profile, onClose }) => {
  if (!profile) return null;
  const rows = [
    { label: "Full Name",   value: `${profile.firstName} ${profile.lastName}` },
    { label: "Email",       value: profile.email },
    { label: "Role",        value: profile.role },
    { label: "Profession",  value: profile.profession === "Other" ? profile.otherProfession : profile.profession },
    { label: "Speciality",  value: profile.primarySpecialty === "Other" ? profile.otherPrimarySpecialty : profile.primarySpecialty },
    { label: "Department",  value: profile.department || "—" },
    { label: "Institution", value: profile.institution },
    { label: "ORCID",       value: profile.orcid || "—" },
    { label: "Mobile",      value: profile.phoneCode && profile.mobileNumber ? `${profile.phoneCode} ${profile.mobileNumber}` : "—" },
    { label: "City",        value: profile.address?.city || "—" },
    { label: "Country",     value: profile.address?.country || "—" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: 380, height: "100vh", background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#0f3460,#1a4a7a)", color: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>My Profile</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
            <X style={{ width: 13, height: 13 }} />Close
          </button>
        </div>
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#0f3460,#0e7490)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}>{profile.firstName} {profile.lastName}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{profile.email}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "#e8eef6", color: "#0f3460", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <div style={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TAB SWITCHER ─────────────────────────────────────────────────────────────

const Tabs = ({ active, tabs, onChange }) => (
  <div style={{ display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 4, width: "fit-content" }}>
    {tabs.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)}
        style={{ padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 8, background: active === t.key ? "linear-gradient(135deg,#0f3460,#1a4a7a)" : "transparent", color: active === t.key ? "#fff" : "#64748b" }}>
        {t.label}
        <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: active === t.key ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: active === t.key ? "#fff" : "#64748b" }}>{t.count}</span>
      </button>
    ))}
  </div>
);

// ─── LOADING / ERROR STATES ───────────────────────────────────────────────────

const LoadingState = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0f3460", animation: "spin 0.8s linear infinite" }} />
    <div style={{ fontSize: "0.83rem", color: "#64748b" }}>Loading your submissions…</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 16, textAlign: "center", padding: 32 }}>
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AlertCircle style={{ width: 22, height: 22, color: "#dc2626" }} />
    </div>
    <div>
      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: 6 }}>Could not load submissions</div>
      <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: 360, lineHeight: 1.6 }}>{message}</div>
    </div>
    <button onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f3460", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
      <RefreshCw style={{ width: 14, height: 14 }} />Try Again
    </button>
  </div>
);

const EmptyTable = ({ message }) => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
      <FileText style={{ width: 20, height: 20, color: "#94a3b8" }} />
    </div>
    <div style={{ fontSize: "0.83rem", color: "#64748b" }}>{message}</div>
  </div>
);

const Toast = ({ message, type = "success" }) => (
  <div style={{
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    background: type === "success" ? "#f0fdf4" : "#fef2f2",
    color: type === "success" ? "#166534" : "#b91c1c",
    boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
    minWidth: 260,
    maxWidth: 360,
  }}>
    {type === "success" ? <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />}
    <div style={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.45 }}>{message}</div>
  </div>
);

// ─── STATS ────────────────────────────────────────────────────────────────────

const Stats = ({ subs }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
    {[
      { label: "Total Submissions", value: subs.length, color: "#0f3460" },
      { label: "Under Review", value: subs.filter(s => s.status === "UNDER_REVIEW").length, color: "#0e7490" },
      { label: "Accepted", value: subs.filter(s => s.status === "ACCEPTED").length, color: "#15803d" },
      { label: "Drafts", value: subs.filter(s => s.status === "DRAFT").length, color: "#6b7280" },
    ].map(({ label, value, color }) => (
      <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
        <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, lineHeight: 1.35 }}>{label}</div>
      </div>
    ))}
  </div>
);

// ─── CONSENT ALERT ────────────────────────────────────────────────────────────

const ConsentAlert = ({ subs }) => {
  const count = subs.filter(s => s.consentStatus === "PENDING").length;
  if (!count) return null;
  return (
    <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <AlertCircle style={{ width: 17, height: 17, color: "#b45309", flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontWeight: 700, color: "#92400e", fontSize: "0.82rem" }}>Consent Pending — {count} manuscript{count !== 1 ? "s" : ""} awaiting your response</div>
        <div style={{ fontSize: "0.75rem", color: "#78350f", marginTop: 3, lineHeight: 1.5 }}>Please review and respond to the consent requests in the table below.</div>
      </div>
    </div>
  );
};

// ─── SUBMIT CTA ───────────────────────────────────────────────────────────────

const SubmitCTA = ({ onClick }) => (
  <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#334155" }}>Want to submit your own manuscript?</div>
      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>You can also be an Author by submitting a new manuscript.</div>
    </div>
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0f3460,#1a4a7a)", color: "#fff", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", flexShrink: 0 }}>
      <Plus style={{ width: 13, height: 13 }} />New Manuscript Submission
    </button>
  </div>
);

// ─── NEW SUBMISSION BANNER ────────────────────────────────────────────────────

const NewSubmissionBanner = ({ onClick }) => (
  <div style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)", borderRadius: 12, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", boxShadow: "0 8px 24px rgba(15,52,96,0.18)" }}>
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Ready to submit your next manuscript?</div>
      <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>New manuscripts go through our double-blind peer review process</div>
    </div>
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "#fff", color: "#0f3460", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer", flexShrink: 0 }}
      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
      <Plus style={{ width: 14, height: 14 }} />New Manuscript Submission
    </button>
  </div>
);

// ─── AUTHOR TABLE ─────────────────────────────────────────────────────────────

const AuthorTable = ({ subs, nav, onRevise }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: "15px 20px", borderBottom: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>My Submissions</span>
      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{subs.length} manuscript{subs.length !== 1 ? "s" : ""}</span>
    </div>
    {subs.length === 0 ? (
      <EmptyTable message="No submissions yet. Click 'New Manuscript Submission' to get started." />
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 960 }}>
          <colgroup>
            <col style={{ width: "145px" }} /><col style={{ width: "255px" }} /><col style={{ width: "175px" }} />
            <col style={{ width: "175px" }} /><col style={{ width: "180px" }} /><col style={{ width: "110px" }} />
            <col style={{ width: "105px" }} /><col style={{ width: "155px" }} />
          </colgroup>
          <thead>
            <tr>
              {["Submission ID", "Title", "Type", "Status", "Co-Author Consent", "Payment", "Submitted", "Actions"].map((h, i, arr) => (
                <th key={h} style={TH(i === arr.length - 1)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={TD()}><span style={{ fontFamily: "monospace", fontSize: "0.74rem", color: s.submissionNumber ? "#0f3460" : "#94a3b8", fontWeight: 600 }}>{s.submissionNumber || "—"}</span></td>
                <td style={TD()}><div style={{ fontSize: "0.79rem", color: "#1e293b", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</div></td>
                <td style={TD()}><span style={{ fontSize: "0.74rem", color: "#475569" }}>{s.articleType}</span></td>
                <td style={TD()}><StatusBadge status={s.status} /></td>
                <td style={TD()}><ConsentBadge status={s.coAuthorConsentStatus} /></td>
                <td style={TD()}><span style={{ fontSize: "0.71rem", fontWeight: 600, padding: "3px 9px", borderRadius: 20, color: s.paymentStatus ? "#15803d" : "#64748b", background: s.paymentStatus ? "#dcfce7" : "#f1f5f9" }}>{s.paymentStatus ? "Paid" : "Pending"}</span></td>
                <td style={TD()}><span style={{ fontSize: "0.73rem", color: "#64748b", whiteSpace: "nowrap" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span></td>
                <td style={TD(true)}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    {s.status === "DRAFT" && <Btn icon={Edit3} label="Continue" color="#0f3460" onClick={() => nav("/submit")} />}
                    <Btn
                      icon={Upload}
                      label="Revise"
                      color="#b45309"
                      onClick={() => onRevise?.(s)}
                      disabled={s.status !== "REVISION_REQUESTED"}
                    />
                    {s.status !== "DRAFT" && <Btn icon={Eye} label="View" color="#0e7490" onClick={() => nav(`/submissions/${s.id}`)} />}
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

const FileListBlock = ({ files = [], emptyText = "No files uploaded." }) => {
  if (!files.length) {
    return <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>{emptyText}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {files.map((file, index) => (
        <div
          key={`${file.fileUrl || file.fileName || "file"}-${index}`}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fff",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", overflowWrap: "anywhere" }}>
              {file.fileName || "Unnamed file"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>
              {formatFileSize(file.fileSize)}{file.uploadedAt ? ` • ${new Date(file.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
            </div>
          </div>
          {file.fileUrl && (
            <button
              type="button"
              onClick={() => openFilePreview(file)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 11px",
                borderRadius: 7,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#0f3460",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              <Eye style={{ width: 12, height: 12 }} />
              Open
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const RevisionUploadField = ({
  label,
  helperText,
  files,
  accept,
  multiple = false,
  onPick,
  onRemove,
  uploading = false,
  required = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      {helperText && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}> {helperText}</span>}
    </label>
    <input
      type="file"
      multiple={multiple}
      accept={accept}
      onChange={onPick}
      disabled={uploading}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: "1.5px dashed #cbd5e1",
        background: "#f8fafc",
        fontSize: "0.78rem",
      }}
    />
    {uploading && <div style={{ fontSize: "0.72rem", color: "#0e7490" }}>Uploading...</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(files || []).length === 0 && (
        <div style={{ fontSize: "0.74rem", color: "#94a3b8", fontStyle: "italic" }}>No files selected yet.</div>
      )}
      {(files || []).map((file, index) => (
        <div
          key={`${file.fileUrl || file.fileName || label}-${index}`}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fff",
            padding: "9px 11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.77rem", color: "#1e293b", fontWeight: 600, overflowWrap: "anywhere" }}>{file.fileName}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>{formatFileSize(file.fileSize)}</div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              border: "none",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: 7,
              padding: "6px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  </div>
);

const RevisionResubmitModal = ({ submission, detailLoading, submitting, onClose, onSubmit, onNotify }) => {
  const MAX_REVISION_FIGURES = 3;
  const MAX_REVISION_TABLES = 6;
  const [coverLetter, setCoverLetter] = useState([]);
  const [blindManuscriptFile, setBlindManuscriptFile] = useState([]);
  const [figures, setFigures] = useState([]);
  const [tables, setTables] = useState([]);
  const [supplementaryFiles, setSupplementaryFiles] = useState([]);
  const [uploadingKey, setUploadingKey] = useState("");

  const editorBlock = submission?._editorRemarksForAuthor || null;
  const canSubmit = coverLetter.length > 0 && blindManuscriptFile.length > 0 && !uploadingKey && !detailLoading && !submitting;
  const notify = (message, type = "error") => {
    if (onNotify) onNotify(message, type);
    else alert(message);
  };

  const uploadFiles = async (
    fileList,
    setter,
    multiple = false,
    maxFiles = Infinity,
    label = "files",
    allowedExtension = null
  ) => {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;

    if (allowedExtension) {
      const invalidFile = selected.find((file) => !file.name.toLowerCase().endsWith(`.${allowedExtension}`));
      if (invalidFile) {
        notify(`${label} must be ${allowedExtension.toUpperCase()} files only.`);
        return;
      }
    }

    const existingCount = multiple ? setter === setFigures
      ? figures.length
      : setter === setTables
        ? tables.length
        : setter === setSupplementaryFiles
          ? supplementaryFiles.length
          : 0
      : 0;

    if (multiple && existingCount >= maxFiles) {
      notify(`Maximum ${maxFiles} ${label} allowed.`);
      return;
    }

    const filesToUpload = multiple
      ? selected.slice(0, Math.max(maxFiles - existingCount, 0))
      : selected.slice(0, 1);

    setUploadingKey("active");
    try {
      const uploaded = [];
      for (const file of filesToUpload) {
        const uploadedFile = await uploadDashboardFile(file, "supplementary");
        uploaded.push(uploadedFile);
      }
      setter((prev) => (multiple ? [...prev, ...uploaded] : uploaded.slice(0, 1)));
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Failed to upload file.");
    } finally {
      setUploadingKey("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.52)",
        zIndex: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.98rem" }}>Resubmit Revised Manuscript</div>
            <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4 }}>{submission?.title || "Loading submission..."}</div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "#f8fafc", color: "#64748b", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          {detailLoading ? (
            <div style={{ padding: "26px 18px", textAlign: "center", color: "#64748b", fontSize: "0.82rem" }}>Loading revision details...</div>
          ) : (
            <>
              <div style={{ border: "1px solid #fde68a", background: "#fffbeb", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.06em" }}>Editor's Remarks</div>
                  <div style={{ fontSize: "0.82rem", color: "#78350f", marginTop: 8, lineHeight: 1.65 }}>
                    {editorBlock?.remarks || "No remarks were recorded."}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Attachments</div>
                  <FileListBlock files={editorBlock?.attachments || []} emptyText="Editor did not upload any attachments." />
                </div>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f3460", fontSize: "0.92rem" }}>Upload Revised Files</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, lineHeight: 1.6 }}>
                    Replace the live manuscript files for this submission. Your previous files stay preserved in earlier cycle versions.
                    Required files are kept separate below so the revised package is easier to review.
                  </div>
                </div>

                <div style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "#ffffff", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0f3460", textTransform: "uppercase", letterSpacing: "0.06em" }}>Required Files</div>
                    <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 4 }}>These two files are mandatory for revised resubmission.</div>
                  </div>

                  <RevisionUploadField
                    label="Cover Letter"
                    helperText="Required, DOCX only"
                    files={coverLetter}
                    accept=".docx"
                    onPick={(e) => uploadFiles(e.target.files, setCoverLetter, false, Infinity, "Cover Letter", "docx")}
                    onRemove={(index) => setCoverLetter((prev) => prev.filter((_, i) => i !== index))}
                    uploading={uploadingKey === "active"}
                    required
                  />

                  <RevisionUploadField
                    label="Blind Manuscript"
                    helperText="Required, DOCX only"
                    files={blindManuscriptFile}
                    accept=".docx"
                    onPick={(e) => uploadFiles(e.target.files, setBlindManuscriptFile, false, Infinity, "Blind Manuscript", "docx")}
                    onRemove={(index) => setBlindManuscriptFile((prev) => prev.filter((_, i) => i !== index))}
                    uploading={uploadingKey === "active"}
                    required
                  />
                </div>

                <div style={{ border: "1px solid #dbeafe", borderRadius: 12, background: "#f8fbff", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.06em" }}>Optional Supporting Files</div>
                    <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 4 }}>Upload only the supporting files that changed in this revision round.</div>
                  </div>

                  <RevisionUploadField
                    label="Figures"
                    helperText={`Optional, multiple allowed, max ${MAX_REVISION_FIGURES}`}
                    files={figures}
                    multiple
                    onPick={(e) => uploadFiles(e.target.files, setFigures, true, MAX_REVISION_FIGURES, "figures")}
                    onRemove={(index) => setFigures((prev) => prev.filter((_, i) => i !== index))}
                    uploading={uploadingKey === "active"}
                  />

                  {figures.length >= MAX_REVISION_FIGURES && (
                    <div style={{ border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>Pay to unlock more figure uploads</div>
                      <div style={{ fontSize: "0.72rem", marginTop: 4, lineHeight: 1.55 }}>
                        The current revision limit is {MAX_REVISION_FIGURES} figures. Extra figure uploads will be unlocked later through payment flow.
                      </div>
                    </div>
                  )}

                  <RevisionUploadField
                    label="Tables"
                    helperText={`Optional, multiple allowed, max ${MAX_REVISION_TABLES}`}
                    files={tables}
                    multiple
                    onPick={(e) => uploadFiles(e.target.files, setTables, true, MAX_REVISION_TABLES, "tables")}
                    onRemove={(index) => setTables((prev) => prev.filter((_, i) => i !== index))}
                    uploading={uploadingKey === "active"}
                  />

                  <RevisionUploadField
                    label="Supplementary Files"
                    helperText="Optional, multiple allowed, DOCX only"
                    files={supplementaryFiles}
                    multiple
                    accept=".docx"
                    onPick={(e) => uploadFiles(e.target.files, setSupplementaryFiles, true, Infinity, "Supplementary Files", "docx")}
                    onRemove={(index) => setSupplementaryFiles((prev) => prev.filter((_, i) => i !== index))}
                    uploading={uploadingKey === "active"}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit({
              coverLetter: coverLetter[0],
              blindManuscriptFile: blindManuscriptFile[0],
              figures,
              tables,
              supplementaryFiles,
            })}
            disabled={!canSubmit}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: canSubmit ? "linear-gradient(135deg,#0f3460,#1a4a7a)" : "#cbd5e1",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: canSubmit ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {submitting && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {submitting ? "Submitting..." : "Submit Revised Files"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── CO-AUTHOR TABLE ──────────────────────────────────────────────────────────

const CoAuthorTable = ({ subs, consentLoading, onAccept, onRejectClick }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: "15px 20px", borderBottom: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>Manuscripts (As Co-Author)</span>
      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{subs.length} manuscript{subs.length !== 1 ? "s" : ""}</span>
    </div>
    {subs.length === 0 ? (
      <EmptyTable message="You have not been added as a co-author on any manuscripts yet." />
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 960 }}>
          <colgroup>
            <col style={{ width: "145px" }} /><col style={{ width: "265px" }} /><col style={{ width: "190px" }} />
            <col style={{ width: "155px" }} /><col style={{ width: "165px" }} /><col style={{ width: "150px" }} />
            <col style={{ width: "175px" }} />
          </colgroup>
          <thead>
            <tr>
              {["Submission ID", "Title", "Type", "Main Author", "Status", "Your Consent", "Actions"].map((h, i, arr) => (
                <th key={h} style={TH(i === arr.length - 1)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={TD()}><span style={{ fontFamily: "monospace", fontSize: "0.74rem", color: "#0f3460", fontWeight: 600 }}>{s.submissionNumber}</span></td>
                <td style={TD()}>
                  <div style={{ fontSize: "0.79rem", color: "#1e293b", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</div>
                  {s.isCorrespondingCoAuthor && (
                    <span style={{ display: "inline-block", marginTop: 5, fontSize: "0.62rem", color: "#0e7490", background: "#e0f2fe", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Corresponding Author</span>
                  )}
                </td>
                <td style={TD()}><span style={{ fontSize: "0.74rem", color: "#475569" }}>{s.articleType}</span></td>
                <td style={TD()}><span style={{ fontSize: "0.78rem", color: "#334155", fontWeight: 500 }}>{s.mainAuthor}</span></td>
                <td style={TD()}><StatusBadge status={s.status} /></td>
                <td style={TD()}>
                  {s.consentStatus === "PENDING" && !s.tokenValid && <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, borderRadius: 20, color: "#b45309", background: "#fef3c7", fontSize: "0.7rem", padding: "3px 10px" }}>⏱ Link Expired</span>}
                  {s.consentStatus === "PENDING" && s.tokenValid && <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, borderRadius: 20, color: "#b45309", background: "#fef3c7", fontSize: "0.7rem", padding: "3px 10px" }}>⧗ Pending</span>}
                  {s.consentStatus === "APPROVED" && <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, borderRadius: 20, color: "#15803d", background: "#dcfce7", fontSize: "0.7rem", padding: "3px 10px" }}>✓ Approved</span>}
                  {s.consentStatus === "REJECTED" && <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, borderRadius: 20, color: "#dc2626", background: "#fee2e2", fontSize: "0.7rem", padding: "3px 10px" }}>✗ Rejected</span>}
                </td>
                <td style={TD(true)}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    <Btn
                      icon={Eye}
                      label="View"
                      color="#0e7490"
                      onClick={() => window.open(`/submissions/${s.id}`, "_self")}
                      disabled={!s.canView}
                    />
                    <Btn
                      icon={CheckCircle}
                      label="Accept"
                      color="#15803d"
                      onClick={() => onAccept(s.id)}
                      disabled={!s.canRespond || consentLoading[s.id]}
                    />
                    <Btn
                      icon={XCircle}
                      label="Reject"
                      color="#dc2626"
                      onClick={() => onRejectClick(s.id, s.title)}
                      disabled={!s.canRespond || consentLoading[s.id]}
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

// ─── REJECTION MODAL (co-author consent) ─────────────────────────────────────

const RejectionModal = ({ submissionTitle, onSubmit, onSkip, isLoading }) => {
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");

  const handleSubmit = () => {
    if (remark.trim().length < 10) {
      setRemarkError("Reason of rejection must be at least 10 characters.");
      return;
    }

    setRemarkError("");
    onSubmit(remark.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onSkip()}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", maxWidth: 420, width: "100%", boxShadow: "0 20px 25px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem", marginBottom: 8 }}>Reject Consent</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5 }}>You are about to reject the co-author consent for: <strong>{submissionTitle}</strong></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reason of Rejection <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            value={remark}
            onChange={e => {
              setRemark(e.target.value);
              if (remarkError) setRemarkError("");
            }}
            maxLength={1000}
            placeholder="Please provide the reason for rejection..."
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${remarkError ? "#fca5a5" : "#e2e8f0"}`,
              fontSize: "0.8rem",
              fontFamily: "system-ui",
              minHeight: 96,
              resize: "none",
              color: "#1e293b",
              outline: "none",
            }}
          />
          {remarkError && (
            <div style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 500 }}>{remarkError}</div>
          )}
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "right" }}>{remark.length}/1000</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onSkip} disabled={isLoading} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.5 : 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: isLoading ? "#cbd5e1" : "#dc2626", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {isLoading && <Loader style={{ width: 13, height: 13, animation: "spin 0.8s linear infinite" }} />}
            {isLoading ? "Processing..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── ROLE PLACEHOLDER ─────────────────────────────────────────────────────────

const RolePlaceholder = ({ role }) => {
  const cfg = {
    TECHNICAL_EDITOR: { label: "Technical Editor Dashboard", color: "#0891b2", desc: "Review manuscript formatting, technical compliance, and submission quality." },
    REVIEWER:         { label: "Reviewer Dashboard",          color: "#15803d", desc: "Access assigned manuscripts and submit peer review evaluations." },
  }[role] || { label: role, color: "#6b7280", desc: "Dashboard coming soon." };
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: 40 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: cfg.color + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Shield style={{ width: 24, height: 24, color: cfg.color }} />
      </div>
      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>{cfg.label}</div>
      <div style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: 380, lineHeight: 1.6 }}>{cfg.desc}</div>
      <div style={{ fontSize: "0.72rem", color: cfg.color, background: cfg.color + "10", padding: "4px 14px", borderRadius: 20, fontWeight: 600 }}>Coming Soon</div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

void RolePlaceholder;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("author");
  const [showProfile, setShowProfile] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [adminNavAction, setAdminNavAction] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [consentLoading, setConsentLoading] = useState({});
  const [revisionModal, setRevisionModal] = useState(null);
  const [revisionDetail, setRevisionDetail] = useState(null);
  const [revisionDetailLoading, setRevisionDetailLoading] = useState(false);
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { authorSubmissions, coAuthorSubmissions, fullProfile, loading, error, refetch } = useDashboard();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate("/auth/login" , { replace: true }); };
  const role = user.role || "USER";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAcceptConsent = async (submissionId) => {
    setConsentLoading(p => ({ ...p, [submissionId]: true }));
    try {
      await acceptConsentFromDashboard(submissionId);
      showToast("Consent accepted successfully.");
      refetch();
      return;
      alert("✓ Consent accepted successfully!");
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to accept consent.", "error");
    } finally {
      setConsentLoading(p => ({ ...p, [submissionId]: false }));
    }
  };

  const handleRejectConsent = async (submissionId, remark) => {
    setRejectModal(null);
    setConsentLoading(p => ({ ...p, [submissionId]: true }));
    try {
      await rejectConsentFromDashboard(submissionId, remark);
      showToast("Consent rejected successfully.");
      refetch();
      return;
      alert("✗ Consent rejected successfully!");
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to reject consent.", "error");
    } finally {
      setConsentLoading(p => ({ ...p, [submissionId]: false }));
    }
  };

  const handleOpenRevisionModal = async (submission) => {
    setRevisionModal({ submissionId: submission.id, title: submission.title });
    setRevisionDetail(null);
    setRevisionDetailLoading(true);
    try {
      const detail = await fetchSubmissionById(submission.id);
      setRevisionDetail(detail);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to load revision details.", "error");
      setRevisionModal(null);
    } finally {
      setRevisionDetailLoading(false);
    }
  };

  const handleSubmitRevision = async (payload) => {
    if (!revisionModal?.submissionId) return;

    setRevisionSubmitting(true);
    try {
      await resubmitAuthorRevision(revisionModal.submissionId, payload);
      showToast("Revised manuscript submitted successfully.");
      setRevisionModal(null);
      setRevisionDetail(null);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to submit revised manuscript.", "error");
    } finally {
      setRevisionSubmitting(false);
    }
  };

  const isAuthor   = authorSubmissions.length > 0;
  const isCoAuthor = coAuthorSubmissions.length > 0;
  const category   = isAuthor && isCoAuthor ? "BOTH"
    : isAuthor   ? "AUTHOR"
    : isCoAuthor ? "COAUTHOR"
    : "NORMAL";

  // ── Page title varies by role ──
  const pageTitle = role === "EDITOR"
    ? "Editor Dashboard"
    : role === "ADMIN"
      ? "Admin Dashboard"
      : "My Dashboard";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Topbar
        user={user}
        onLogout={handleLogout}
        onProfileClick={() => setShowProfile(true)}
        onRoleChangeClick={() => setShowRoleChangeModal(true)}
        onAdminToolSelect={(action) => setAdminNavAction({ action, nonce: Date.now() })}
      />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 28px" }}>
        {/* Page heading */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 700, color: "#0f3460", fontSize: "1.4rem", margin: 0 }}>
            {pageTitle}
          </h1>
          <div style={{ fontSize: "0.77rem", color: "#94a3b8", marginTop: 4 }}>
            Journal of Advanced &amp; Integrated Research in Acute Medicine
          </div>
          {/* Role badge */}
          <div style={{ marginTop: 10 }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, padding: "3px 12px", borderRadius: 20,
              background: role === "EDITOR" ? "#ede9fe" : role === "ADMIN" ? "#fef3c7" : "#e8eef6",
              color: role === "EDITOR" ? "#7c3aed" : role === "ADMIN" ? "#b45309" : "#0f3460",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {role === "EDITOR" ? "Editor" : role === "ADMIN" ? "Administrator" : "Researcher"}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            EDITOR ROLE
        ══════════════════════════════════════════════ */}
        {role === "EDITOR" && (
          <>
            <ProfileCard user={fullProfile || user} />
            <div style={{ marginTop: 20 }}>
              <EditorDashboard
                user={user}
                showRoleChangeModal={showRoleChangeModal}
                onCloseRoleChangeModal={() => setShowRoleChangeModal(false)}
              />
            </div>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <ProfileCard user={fullProfile || user} />
            <div style={{ marginTop: 20 }}>
              <AdminDashboard
                user={user}
                showRoleChangeModal={showRoleChangeModal}
                onCloseRoleChangeModal={() => setShowRoleChangeModal(false)}
                adminNavAction={adminNavAction}
              />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════
            TECHNICAL EDITOR / REVIEWER PLACEHOLDERS
        ══════════════════════════════════════════════ */}
        {role === "TECHNICAL_EDITOR" && (
          <>
            <ProfileCard user={fullProfile || user} />
            <div style={{ marginTop: 20 }}>
              <TechnicalEditorDashboard user={user} />
            </div>
          </>
        )}

        {role === "REVIEWER" && (
          <>
            <ProfileCard user={fullProfile || user} />
            <div style={{ marginTop: 20 }}>
              <ReviewerDashboard user={user} />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════
            USER ROLE — Normal / Author / CoAuthor / Both
        ══════════════════════════════════════════════ */}
        {role === "USER" && (
          <>
            {/* Refresh */}
            {!loading && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <button onClick={refetch} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}>
                  <RefreshCw style={{ width: 13, height: 13 }} />Refresh
                </button>
              </div>
            )}

            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} onRetry={refetch} />}

            {!loading && !error && (
              <>
                {/* NORMAL */}
                {category === "NORMAL" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <ProfileCard user={user} />
                    <div style={{ background: "linear-gradient(135deg,#0f3460,#1a4a7a)", borderRadius: 12, padding: "28px 32px", color: "#fff" }}>
                      <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8 }}>Welcome to JAIRAM Manuscript Portal</div>
                      <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, maxWidth: 520, textAlign: "center", margin: "0 auto" }}>You haven't submitted any manuscripts yet. When you submit, your dashboard will display your submissions and their review status here.</div>
                      <button onClick={() => navigate("/submit")} style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, background: "#fff", color: "#0f3460", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                        <Plus style={{ width: 15, height: 15 }} />New Manuscript Submission
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      {[
                        { icon: FileText, label: "Submit Manuscript", desc: "Begin your submission process", color: "#0f3460", path: "/submit" },
                        { icon: BookOpen, label: "Author Guidelines", desc: "Read submission requirements", color: "#0e7490", path: "/authors-guidelines" },
                        { icon: Shield,   label: "Ethics Policy",     desc: "Review our ethics standards",  color: "#7c3aed", path: "/ethics" },
                      ].map(({ icon: Icon, label, desc, color, path }) => (
                        <div key={label} onClick={() => navigate(path)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "12", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                            <Icon style={{ width: 17, height: 17, color }} />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: "0.83rem", color: "#0f172a" }}>{label}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AUTHOR ONLY */}
                {category === "AUTHOR" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <ProfileCard user={user} />
                    <Stats subs={authorSubmissions} />
                    <NewSubmissionBanner onClick={() => navigate("/submit")} />
                    <AuthorTable subs={authorSubmissions} nav={navigate} onRevise={handleOpenRevisionModal} />
                  </div>
                )}

                {/* COAUTHOR ONLY */}
                {category === "COAUTHOR" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <ProfileCard user={user} />
                    <ConsentAlert subs={coAuthorSubmissions} />
                    <CoAuthorTable subs={coAuthorSubmissions} consentLoading={consentLoading} onAccept={handleAcceptConsent} onRejectClick={(id, title) => setRejectModal({ submissionId: id, title })} />
                    <SubmitCTA onClick={() => navigate("/submit")} />
                  </div>
                )}

                {/* BOTH */}
                {category === "BOTH" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <ProfileCard user={user} />
                    <Tabs active={activeTab} tabs={[{ key: "author", label: "As Author", count: authorSubmissions.length }, { key: "coauthor", label: "As Co-Author", count: coAuthorSubmissions.length }]} onChange={setActiveTab} />
                    {activeTab === "author" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <Stats subs={authorSubmissions} />
                        <NewSubmissionBanner onClick={() => navigate("/submit")} />
                        <AuthorTable subs={authorSubmissions} nav={navigate} onRevise={handleOpenRevisionModal} />
                      </div>
                    )}
                    {activeTab === "coauthor" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <ConsentAlert subs={coAuthorSubmissions} />
                        <CoAuthorTable subs={coAuthorSubmissions} consentLoading={consentLoading} onAccept={handleAcceptConsent} onRejectClick={(id, title) => setRejectModal({ submissionId: id, title })} />
                        <SubmitCTA onClick={() => navigate("/submit")} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Profile panel */}
      {showProfile && <ProfilePanel profile={fullProfile || user} onClose={() => setShowProfile(false)} />}

      {/* Co-author rejection modal */}
      {rejectModal && (
        <RejectionModal
          submissionTitle={rejectModal.title}
          onSubmit={remark => handleRejectConsent(rejectModal.submissionId, remark)}
          onSkip={() => setRejectModal(null)}
          isLoading={consentLoading[rejectModal.submissionId] || false}
        />
      )}

      {revisionModal && (
        <RevisionResubmitModal
          submission={revisionDetail || { title: revisionModal.title }}
          detailLoading={revisionDetailLoading}
          submitting={revisionSubmitting}
          onClose={() => {
            if (revisionSubmitting) return;
            setRevisionModal(null);
            setRevisionDetail(null);
          }}
          onSubmit={handleSubmitRevision}
          onNotify={showToast}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UserDashboard;
