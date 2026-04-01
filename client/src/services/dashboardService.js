/*
 * All API calls needed by the User Dashboard.
 * Uses the existing `api` axios instance which automatically
 * attaches the Bearer token from localStorage on every request.
*/

import api from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// FETCH ALL SUBMISSIONS FOR THE LOGGED-IN USER
// ─────────────────────────────────────────────────────────────────────────────
//
// Endpoint : GET /api/submissions
// Auth     : Required (Bearer token)
// Backend behaviour for role USER:
//   Returns author's own submissions + approved co-author submissions in one
//   array. We split them on the frontend using submission.author._id.
//
// Response shape (submissions.service.js → listSubmissions):
// {
//   success: true,
//   message: "...",
//   data: {
//     submissions: [
//       {
//         _id, submissionNumber, title, articleType, status,
//         paymentStatus, submittedAt, lastModifiedAt,
//         author: { _id, firstName, lastName, email },
//         assignedEditor: { _id, firstName, lastName },
//         currentCycleId: { ... },
//         coAuthors: [{ user, email, firstName, lastName, isCorresponding, source, order }],
//         suggestedReviewers: [...],
//         consentDeadlineStatus,   ← we use this for consent display
//         isCorrespondingAuthor,
//         revisionStage,
//         ...
//       }
//     ],
//     pagination: { page, limit, total, pages }
//   }
// }

export const fetchUserSubmissions = async () => {
    const response = await api.get("/submissions", {
        params: {
            limit: 100,          // get all — dashboard shows everything
            sortBy: "submittedAt",
            sortOrder: "desc",
        },
    });

    // Backend wraps in { success, message, data: { submissions, pagination } }
    return response.data?.data?.submissions ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH A SINGLE SUBMISSION (full detail)
// ─────────────────────────────────────────────────────────────────────────────
//
// Used when the user clicks "View" on a submission row.
// Endpoint: GET /api/submissions/:id
//
export const fetchSubmissionById = async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data?.data ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH CO-AUTHOR CONSENT STATUS (for a specific submission)
// ─────────────────────────────────────────────────────────────────────────────
//
// Used only when the editor-level consent detail is needed.
// For the dashboard table we derive consent status from
// submission.consentDeadlineStatus instead (no extra network call).
//
// Endpoint: GET /api/submissions/:id/coauthor-consent-status
// Auth    : EDITOR / ADMIN only — NOT called from USER dashboard
//
export const fetchConsentStatus = async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}/coauthor-consent-status`);
    return response.data?.data?.consentStatus ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH FULL USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────
// Endpoint: GET /api/users/profile
// Returns full user document (institution, specialty, address etc.)
// authStore.user only has minimal JWT fields — this gives us the rest.

export const fetchUserProfile = async () => {
    const response = await api.get("/users/profile");
    return response.data?.data?.user ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH MY CONSENT INVITATIONS (all — PENDING, APPROVED, REJECTED)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchMyConsentInvitations = async () => {
    const response = await api.get("/submissions/my-consent-invitations");
    return response.data?.data?.invitations ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH CO-AUTHOR CONSENTS FOR A SPECIFIC SUBMISSION (Author only)
// ─────────────────────────────────────────────────────────────────────────────
// Fetches all consent records for a specific submission (for the author).
// Endpoint: GET /api/submissions/:submissionId/coauthor-consents
// Auth    : Required (author of the submission)
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

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPT CONSENT FROM DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
// Allow co-authors to accept consent directly from the dashboard.
// Endpoint: POST /api/submissions/:submissionId/coauthor-consent-dashboard
// Auth    : Required (authenticated co-author)
// Body    : { decision: "ACCEPT" }
// Returns : { consentStatus: { status: "APPROVED", respondedAt } }
//
export const acceptConsentFromDashboard = async (submissionId) => {
    const response = await api.post(
        `/submissions/${submissionId}/coauthor-consent-dashboard`,
        { decision: "ACCEPT" }
    );
    return response.data?.data?.consentStatus ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT CONSENT FROM DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
// Allow co-authors to reject consent directly from the dashboard.
// Endpoint: POST /api/submissions/:submissionId/coauthor-consent-dashboard
// Auth    : Required (authenticated co-author)
// Body    : { decision: "REJECT", remark?: string }
// Returns : { consentStatus: { status: "REJECTED", respondedAt } }
//
export const rejectConsentFromDashboard = async (submissionId, remark = null) => {
    const response = await api.post(
        `/submissions/${submissionId}/coauthor-consent-dashboard`,
        { 
            decision: "REJECT",
            remark: remark || ""
        }
    );
    return response.data?.data?.consentStatus ?? null;
};