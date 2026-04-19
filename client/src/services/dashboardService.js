/*
 * dashboardService.js  (updated)
 *
 * All API calls needed by UserDashboard (role USER) and EditorDashboard (role EDITOR).
 * Uses the existing `api` axios instance which automatically
 * attaches the Bearer token from localStorage on every request.
 */

import api from "./api";
import externalApi from "./externalApi";

// ─────────────────────────────────────────────────────────────────────────────
// ── USER DASHBOARD SERVICES ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// FETCH ALL SUBMISSIONS FOR THE LOGGED-IN USER
// Endpoint : GET /api/submissions
// Backend behaviour for role USER:
//   Returns author's own submissions + approved co-author submissions.
//   We split them on the frontend using submission.author._id.
//
export const fetchUserSubmissions = async () => {
  const response = await api.get("/submissions", {
    params: {
      limit: 100,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
  });
  return response.data?.data?.submissions ?? [];
};

// FETCH A SINGLE SUBMISSION (full detail)
// Endpoint: GET /api/submissions/:id
//
export const fetchSubmissionById = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data?.data ?? null;
};

// FETCH A SUBMISSION TIMELINE
// Endpoint: GET /api/submissions/:id/timeline
//
export const fetchSubmissionTimeline = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}/timeline`);
  return response.data?.data?.timeline ?? null;
};

// FETCH CO-AUTHOR CONSENT STATUS (for a specific submission)
// Endpoint: GET /api/submissions/:id/coauthor-consent-status
// Auth    : EDITOR / ADMIN only — NOT called from USER dashboard
//
export const fetchConsentStatus = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}/coauthor-consent-status`);
  return response.data?.data?.consentStatus ?? null;
};

// FETCH FULL USER PROFILE
// Endpoint: GET /api/users/profile
//
export const fetchUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data?.data?.user ?? null;
};

// FETCH MY CONSENT INVITATIONS (all — PENDING, APPROVED, REJECTED)
//
export const fetchMyConsentInvitations = async () => {
  const response = await api.get("/submissions/my-consent-invitations");
  return response.data?.data?.invitations ?? [];
};

// FETCH CO-AUTHOR CONSENTS FOR A SPECIFIC SUBMISSION (Author only)
// Endpoint: GET /api/submissions/:submissionId/coauthor-consents
// Returns : { total, approved, pending, rejected, aggregatedStatus, consents }
//
export const fetchCoAuthorConsentsForSubmission = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}/coauthor-consents`);
  return response.data?.data ?? {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    aggregatedStatus: "APPROVED",
    consents: [],
  };
};

// ACCEPT CONSENT FROM DASHBOARD
// Endpoint: POST /api/submissions/:submissionId/coauthor-consent-dashboard
// Body    : { decision: "ACCEPT" }
//
export const acceptConsentFromDashboard = async (submissionId) => {
  const response = await api.post(
    `/submissions/${submissionId}/coauthor-consent-dashboard`,
    { decision: "ACCEPT" }
  );
  return response.data?.data?.consentStatus ?? null;
};

// REJECT CONSENT FROM DASHBOARD
// Endpoint: POST /api/submissions/:submissionId/coauthor-consent-dashboard
// Body    : { decision: "REJECT", remark?: string }
//
export const rejectConsentFromDashboard = async (submissionId, remark = null) => {
  const response = await api.post(
    `/submissions/${submissionId}/coauthor-consent-dashboard`,
    {
      decision: "REJECT",
      remark: remark || "",
    }
  );
  return response.data?.data?.consentStatus ?? null;
};

export const resubmitAuthorRevision = async (submissionId, payload) => {
  const response = await api.post(`/submissions/${submissionId}/resubmit-revision`, payload);
  return response.data?.data?.submission ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// ── EDITOR DASHBOARD SERVICES ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// FETCH ALL SUBMISSIONS (Editor sees all non-draft submissions)
// Endpoint : GET /api/submissions
// Backend behaviour for role EDITOR: returns all submissions status !== DRAFT
//
export const fetchAllSubmissionsForEditor = async () => {
  const response = await api.get("/submissions", {
    params: {
      limit: 100,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
  });
  return response.data?.data?.submissions ?? [];
};

// FETCH ASSIGNABLE USERS BY ROLE (for editor assignment modals)
// Endpoints:
//   GET /api/submissions/search/technical-editors
//   GET /api/submissions/search/reviewers
// Returns  : array of user objects { _id, firstName, lastName, email, primarySpecialty }
//
export const fetchUsersByRole = async (role, query = "", limit = 100) => {
  if (role === "TECHNICAL_EDITOR") {
    const response = await api.get("/submissions/search/technical-editors", {
      params: { q: query, limit },
    });
    return response.data?.data?.technicalEditors ?? [];
  }

  if (role === "REVIEWER") {
    const response = await api.get("/submissions/search/reviewers", {
      params: { q: query, limit },
    });
    return response.data?.data?.reviewers ?? [];
  }

  return [];
};

// UPLOAD A FILE USING THE EXISTING SIGNED CLOUDINARY FLOW
export const uploadDashboardFile = async (file, uploadType = "supplementary", onProgress) => {
  const res = await api.post("/submissions/upload-url", {
    fileName: file.name,
    fileType: file.type,
    uploadType,
  });

  const data = res.data.data;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", data.signature);
  formData.append("timestamp", data.timestamp);
  formData.append("api_key", data.apiKey);
  formData.append("public_id", data.publicId);

  const uploadResponse = await externalApi.post(data.uploadUrl, formData, {
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || !onProgress) return;
      onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    },
  });

  return {
    fileName: file.name,
    fileUrl: uploadResponse.data.secure_url,
    fileSize: uploadResponse.data.bytes,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
  };
};

// ASSIGN TECHNICAL EDITOR TO SUBMISSION
// Endpoint : POST /api/submissions/:id/assign-technical-editor
// Body     : { technicalEditorId: string, remarks: string }
// Requires : remarks min 10 chars
//
export const assignTechnicalEditor = async (submissionId, technicalEditorId, remarks, revisedManuscript, attachments = []) => {
  const response = await api.post(
    `/submissions/${submissionId}/assign-technical-editor`,
    { technicalEditorId, remarks, revisedManuscript, attachments }
  );
  return response.data?.data ?? null;
};

// ASSIGN REVIEWERS TO SUBMISSION
// Endpoint : POST /api/submissions/:id/assign-reviewers
// Body     : { reviewerIds: string[], remarks: string }
// Requires : 2–5 reviewerIds, remarks min 10 chars
//
export const assignReviewers = async (submissionId, reviewerIds, remarks, revisedManuscript, attachments = []) => {
  const response = await api.post(
    `/submissions/${submissionId}/assign-reviewers`,
    { reviewerIds, remarks, revisedManuscript, attachments }
  );
  return response.data?.data ?? null;
};

// FETCH MOVE-TO-REVIEW ELIGIBILITY STATUS
// Endpoint : GET /api/submissions/:id/coauthor-consent-status
// Rule     : all co-author consents must be approved
//
export const fetchMoveToReviewConsentStatus = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}/coauthor-consent-status`);
  return response.data?.data?.consentStatus ?? null;
};

// MOVE SUBMISSION TO REVIEW
// Endpoint : POST /api/submissions/:id/move-to-review
//
export const moveSubmissionToReview = async (submissionId) => {
  const response = await api.post(`/submissions/${submissionId}/move-to-review`);
  return response.data?.data ?? null;
};

// MAKE EDITOR DECISION (Accept or Reject)
// Endpoint : POST /api/submissions/:id/editor-decision
// Body     : { decision: "ACCEPT"|"REJECT", decisionStage: string, remarks?: string }
// Decision stages: INITIAL_SCREENING | POST_TECH_EDITOR | POST_REVIEWER | FINAL_DECISION
// Note     : remarks is required for REJECT (min 10 chars), optional for ACCEPT
//
export const makeEditorDecision = async (submissionId, decision, decisionStage, remarks) => {
  const response = await api.post(
    `/submissions/${submissionId}/editor-decision`,
    {
      decision,
      decisionStage,
      ...(remarks ? { remarks } : {}),
    }
  );
  return response.data?.data ?? null;
};

// UPDATE PAYMENT STATUS
// Endpoint : PUT /api/submissions/:id/payment-status
// Body     : { paymentStatus: boolean, note?: string }
//
export const updatePaymentStatus = async (submissionId, paymentStatus, note) => {
  const response = await api.put(
    `/submissions/${submissionId}/payment-status`,
    {
      paymentStatus,
      ...(note ? { note } : {}),
    }
  );
  return response.data?.data ?? null;
};

// FETCH TECHNICAL EDITOR SUBMISSIONS
// Endpoint: GET /api/submissions
export const fetchTechnicalEditorSubmissions = async () => {
  const response = await api.get("/submissions", {
    params: {
      limit: 100,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
  });

  return response.data?.data?.submissions ?? [];
};

// RESPOND TO TECHNICAL EDITOR ASSIGNMENT
// Endpoint: POST /api/submissions/:id/technical-editor-assignment-response
export const respondToTechnicalEditorAssignment = async (submissionId, decision, rejectionReason = "") => {
  const response = await api.post(`/submissions/${submissionId}/technical-editor-assignment-response`, {
    decision,
    ...(decision === "REJECT" ? { rejectionReason } : {}),
  });

  return response.data?.data ?? null;
};

// SUBMIT TECHNICAL EDITOR REVIEW
// Endpoint: POST /api/submissions/revisions
export const submitTechnicalEditorReview = async ({
  submissionId,
  recommendation,
  remarks,
  revisedManuscript,
}) => {
  const response = await api.post("/submissions/revisions", {
    originalSubmissionId: submissionId,
    submitterRoleType: "Technical Editor",
    revisionStage: "TECH_EDITOR_TO_EDITOR",
    recommendation,
    remarks,
    revisedManuscript,
    attachments: [],
  });

  return response.data?.data ?? null;
};

// FETCH REVIEWER SUBMISSIONS
// Endpoint: GET /api/submissions
export const fetchReviewerSubmissions = async () => {
  const response = await api.get("/submissions", {
    params: {
      limit: 100,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
  });

  return response.data?.data?.submissions ?? [];
};

// RESPOND TO REVIEWER ASSIGNMENT
// Endpoint: POST /api/submissions/:id/reviewer-assignment-response
export const respondToReviewerAssignment = async (submissionId, decision, rejectionReason = "") => {
  const response = await api.post(`/submissions/${submissionId}/reviewer-assignment-response`, {
    decision,
    ...(decision === "REJECT" ? { rejectionReason } : {}),
  });

  return response.data?.data ?? null;
};

// SUBMIT REVIEWER REVIEW
// Endpoint: POST /api/submissions/revisions
export const submitReviewerReview = async ({
  submissionId,
  reviewerChecklist,
  remarks,
  confidentialToEditor,
  recommendation,
  revisedManuscript,
  responseToEditorComments,
}) => {
  const response = await api.post("/submissions/revisions", {
    originalSubmissionId: submissionId,
    submitterRoleType: "Reviewer",
    revisionStage: "REVIEWER_TO_EDITOR",
    reviewerChecklist,
    remarks,
    confidentialToEditor,
    recommendation,
    revisedManuscript,
    responseToEditorComments,
    attachments: [],
  });

  return response.data?.data ?? null;
};

// SEARCH USERS FOR ROLE CHANGE REQUEST (EDITOR)
// Endpoint: GET /api/admin/role-change-request-users?search=john&page=1&limit=10
export const searchUsersForRoleChange = async (search, page = 1, limit = 10) => {
  const response = await api.get("/admin/role-change-request-users", {
    params: { search, page, limit },
  });

  return {
    users: response.data?.data?.users ?? [],
    pagination: response.data?.data?.pagination ?? null,
  };
};

// CREATE ROLE CHANGE REQUEST (EDITOR)
// Endpoint: POST /api/admin/role-change-requests
// Body: { userId, requestedRole, reason }
export const createRoleChangeRequest = async ({ userId, requestedRole, reason }) => {
  const response = await api.post("/admin/role-change-requests", {
    userId,
    requestedRole,
    reason,
  });

  return response.data?.data?.request ?? null;
};

// FETCH MY ROLE CHANGE REQUESTS (EDITOR)
// Endpoint: GET /api/admin/my-role-change-requests?status=PENDING&page=1&limit=10
export const fetchMyRoleChangeRequests = async (status = "", page = 1, limit = 10) => {
  const response = await api.get("/admin/my-role-change-requests", {
    params: {
      ...(status ? { status } : {}),
      page,
      limit,
    },
  });

  return {
    requests: response.data?.data?.requests ?? [],
    pagination: response.data?.data?.pagination ?? null,
  };
};

// FETCH ALL SUBMISSIONS (ADMIN sees all non-draft submissions)
// Endpoint : GET /api/submissions
export const fetchAllSubmissionsForAdmin = async () => {
  const response = await api.get("/submissions", {
    params: {
      limit: 100,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
  });

  return response.data?.data?.submissions ?? [];
};

// FETCH ROLE CHANGE REQUESTS (ADMIN)
// Endpoint: GET /api/admin/role-change-requests
export const fetchAdminRoleChangeRequests = async (status = "", page = 1, limit = 20) => {
  const response = await api.get("/admin/role-change-requests", {
    params: {
      ...(status ? { status } : {}),
      page,
      limit,
    },
  });

  return {
    requests: response.data?.data?.requests ?? [],
    pagination: response.data?.data?.pagination ?? null,
  };
};

// REVIEW ROLE CHANGE REQUEST (ADMIN)
// Endpoint: PATCH /api/admin/role-change-requests/:requestId
export const reviewAdminRoleChangeRequest = async (requestId, decision, adminComments = "") => {
  const response = await api.patch(`/admin/role-change-requests/${requestId}`, {
    decision,
    adminComments,
  });

  return response.data?.data?.request ?? null;
};

// SEARCH / LIST USERS (ADMIN)
// Endpoint: GET /api/admin/users
export const searchAdminUsers = async ({
  search = "",
  status = "",
  role = "",
  page = 1,
  limit = 20,
} = {}) => {
  const response = await api.get("/admin/users", {
    params: {
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      page,
      limit,
    },
  });

  return {
    users: response.data?.data?.users ?? [],
    pagination: response.data?.data?.pagination ?? null,
  };
};

// FETCH SINGLE USER (ADMIN)
// Endpoint: GET /api/admin/users/:userId
export const fetchAdminUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data?.data?.user ?? null;
};

// UPDATE USER PROFILE (ADMIN)
// Endpoint: PATCH /api/admin/users/:userId/profile
export const updateAdminUserProfile = async (userId, updates) => {
  const response = await api.patch(`/admin/users/${userId}/profile`, updates);
  return response.data?.data?.user ?? null;
};

// UPDATE USER STATUS (ADMIN)
// Endpoint: PATCH /api/admin/users/:userId/status
export const updateAdminUserStatus = async (userId, status, reason = "") => {
  const response = await api.patch(`/admin/users/${userId}/status`, {
    status,
    reason,
  });

  return {
    user: response.data?.data?.user ?? null,
    changes: response.data?.data?.changes ?? null,
  };
};

// ASSIGN EDITOR TO SUBMISSION (ADMIN)
// Endpoint: POST /api/submissions/:id/assign-editor
export const assignEditorToSubmission = async (submissionId, editorId) => {
  const response = await api.post(`/submissions/${submissionId}/assign-editor`, {
    editorId,
  });

  return response.data?.data?.submission ?? null;
};
