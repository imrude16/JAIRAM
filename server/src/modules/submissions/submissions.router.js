import { Router } from "express";
import { requireAuth } from "../../common/middlewares/requireAuth.js";
import { allowRoles } from "../../common/middlewares/roleBaseMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";
import submissionController from "./submissions.controller.js";
import {
    createSubmissionSchema,
    updateSubmissionSchema,
    submitManuscriptSchema,
    getSubmissionByIdSchema,
    updateStatusSchema,
    updatePaymentStatusSchema,
    assignEditorSchema,
    coAuthorConsentSchema,
    listSubmissionsSchema,
} from "./submissions.validator.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION ROUTES - COMPLETE VERSION
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.router.js
 * Proper route ordering (specific before dynamic)
 * ════════════════════════════════════════════════════════════════
 */

const {
    createSubmission,
    getSubmissionById,
    updateSubmission,
    submitManuscript,
    listSubmissions,
    updateStatus,
    updatePaymentStatus,
    assignEditor,
    processCoAuthorConsent,
    moveToReview,
} = submissionController;

const router = Router();

// ============================================================
// AUTHOR ROUTES (Authenticated Users)
// ============================================================

/**
 * LIST SUBMISSIONS
 * 
 * GET /api/submissions
 * Headers: Authorization: Bearer <token>
 * Query: ?status=DRAFT&page=1&limit=20&sortBy=submittedAt&sortOrder=desc
 * 
 * Auth: Required (any logged-in user)
 * Returns: List of submissions based on user role
 * - USER: Their own submissions
 * - REVIEWER: Assigned submissions
 * - EDITOR: Assigned submissions
 * - ADMIN: All submissions
 */
router.get(
    "/",
    requireAuth,
    validateRequest(listSubmissionsSchema),
    asyncHandler(listSubmissions)
);

/**
 * CREATE SUBMISSION (DRAFT)
 * 
 * POST /api/submissions
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   articleType: "Original Article",
 *   title: "...",
 *   runningTitle: "...",
 *   abstract: "...",
 *   keywords: [...],
 *   manuscriptDetails: {...},
 *   isCorrespondingAuthor: true,
 *   coAuthors: [...],
 *   saveAsDraft: true
 * }
 * 
 * Auth: Required (any logged-in user can create)
 * Returns: Created submission (DRAFT status)
 * Note: Author automatically set from req.user.id
 */
router.post(
    "/",
    requireAuth,
    validateRequest(createSubmissionSchema),
    asyncHandler(createSubmission)
);

/**
 * GET SUBMISSION BY ID
 * 
 * GET /api/submissions/:id
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required
 * Permission: Author, Co-Authors (with consent), Assigned Editor/Reviewers, Admins
 * Returns: Full submission details
 */
router.get(
    "/:id",
    requireAuth,
    validateRequest(getSubmissionByIdSchema),
    asyncHandler(getSubmissionById)
);

/**
 * UPDATE SUBMISSION
 * 
 * PATCH /api/submissions/:id
 * Headers: Authorization: Bearer <token>
 * Body: { 
 *   title?, abstract?, keywords?, coAuthors?, 
 *   coverLetter?, blindManuscriptFile?, figures?, tables?, 
 *   supplementaryFiles?, suggestedReviewers?
 * }
 * 
 * Auth: Required
 * Permission: Author only, and only when status is DRAFT or REVISION_REQUESTED
 * Returns: Updated submission
 * 
 * Use Cases:
 * - Add/edit manuscript details
 * - Upload files (base64 in fileUrl field)
 * - Add co-authors
 * - Suggest reviewers
 */
router.patch(
    "/:id",
    requireAuth,
    validateRequest(updateSubmissionSchema),
    asyncHandler(updateSubmission)
);

/**
 * SUBMIT MANUSCRIPT (Move from DRAFT to SUBMITTED)
 * 
 * POST /api/submissions/:id/submit
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   checklist: {
 *     checklistVersion: "1.0.0",
 *     responses: [...17 questions...],
 *     copeCompliance: true
 *   },
 *   conflictOfInterest: {...},
 *   copyrightAgreement: {...},
 *   pdfPreviewConfirmed: true,
 *   suggestedReviewers: [...]
 * }
 * 
 * Auth: Required
 * Permission: Author only
 * 
 * Validations:
 * - All 17 checklist questions answered
 * - COPE compliance accepted
 * - At least 1 corresponding author designated
 * - Cover letter and blind manuscript uploaded
 * - Minimum 1 reviewer suggested (max 5)
 * 
 * Returns: Submitted manuscript with submission number (JAIRAM-YYYY-NNNN)
 * 
 * Side Effects:
 * - Generates submission number
 * - Sends invitation emails to suggested reviewers
 * - Sends confirmation email to author
 * - Status changes to SUBMITTED
 */
router.post(
    "/:id/submit",
    requireAuth,
    validateRequest(submitManuscriptSchema),
    asyncHandler(submitManuscript)
);

// ============================================================
// CO-AUTHOR ROUTES
// ============================================================

/**
 * CO-AUTHOR CONSENT
 * 
 * POST /api/submissions/:id/coauthor-consent/:coAuthorId
 * Body: { consent: "ACCEPT" | "REJECT", token }
 * 
 * Auth: None (uses token-based authentication)
 * Purpose: Allow co-authors to accept/reject invitation
 * Token expires: 7 days
 * Returns: Success message
 * 
 * Flow:
 * 1. Author adds co-author (manual or from database)
 * 2. System sends email with consent link + token
 * 3. Co-author clicks link, lands on consent page
 * 4. Frontend calls this endpoint with token
 * 5. If ACCEPT + co-author not in database → prompt registration
 * 6. After registration, system links user.id to submission
 */
router.post(
    "/:id/coauthor-consent/:coAuthorId",
    validateRequest(coAuthorConsentSchema),
    asyncHandler(processCoAuthorConsent)
);

// ============================================================
// EDITOR/ADMIN ROUTES
// ============================================================

/**
 * UPDATE SUBMISSION STATUS
 * 
 * POST /api/submissions/:id/status
 * Headers: Authorization: Bearer <token>
 * Body: { status, comments? }
 * 
 * Auth: Required + EDITOR or ADMIN role
 * Returns: Updated submission
 * 
 * Valid status transitions enforced by model:
 * DRAFT → SUBMITTED
 * SUBMITTED → UNDER_REVIEW
 * UNDER_REVIEW → REVISION_REQUESTED | PROVISIONALLY_ACCEPTED | REJECTED
 * REVISION_REQUESTED → SUBMITTED
 * PROVISIONALLY_ACCEPTED → ACCEPTED (after payment)
 * 
 * Side Effects:
 * - Adds internal note with comment
 * - Updates status history
 */
router.post(
    "/:id/status",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(updateStatusSchema),
    asyncHandler(updateStatus)
);

/**
 * UPDATE PAYMENT STATUS
 * 
 * PUT /api/submissions/:id/payment-status
 * Headers: Authorization: Bearer <token>
 * Body: { paymentStatus: true | false, note?: "Payment via wire transfer..." }
 * 
 * Auth: Required + EDITOR or ADMIN role
 * Returns: Updated submission
 * 
 * Use Case:
 * 1. Submission reaches PROVISIONALLY_ACCEPTED
 * 2. Author pays via email/QR (external to system)
 * 3. Editor verifies payment receipt
 * 4. Editor updates paymentStatus to true via this endpoint
 * 5. Editor can then move status to ACCEPTED
 * 
 * Side Effects:
 * - Adds internal note: "Payment status updated to PAID: [note]"
 * - Updates paymentStatus boolean field
 */
router.put(
    "/:id/payment-status",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(updatePaymentStatusSchema),
    asyncHandler(updatePaymentStatus)
);

/**
 * ASSIGN EDITOR TO SUBMISSION
 * 
 * POST /api/submissions/:id/assign-editor
 * Headers: Authorization: Bearer <token>
 * Body: { editorId }
 * 
 * Auth: Required + ADMIN role
 * Returns: Updated submission
 * 
 * Validation:
 * - Checks if editorId is valid user
 * - Checks if user has EDITOR or ADMIN role
 * 
 * Side Effects:
 * - Sets assignedEditor field
 * - Adds internal note
 * - Sends notification email to editor
 */
router.post(
    "/:id/assign-editor",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(assignEditorSchema),
    asyncHandler(assignEditor)
);

/**
 * MOVE TO PEER REVIEW (Requires Minimum 2 Approved Reviewers)
 * 
 * POST /api/submissions/:id/move-to-review
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required + EDITOR or ADMIN role
 * 
 * Validation:
 * - Minimum 2 reviewers must have:
 *   1. Accepted invitation (invitationStatus = "ACCEPTED")
 *   2. Been approved by editor (editorApproved = true)
 * 
 * Returns:
 * - Success (200): Updated submission with assignedReviewers array
 * - Error (400): If < 2 reviewers meet both conditions
 *   Example: "Minimum 2 approved reviewers required. Current: 1, Required: 2"
 * 
 * Process:
 * 1. Checks submission.canMoveToReview()
 * 2. Moves approved reviewers to assignedReviewers array
 * 3. Updates status to UNDER_REVIEW
 * 4. Adds internal note with reviewer count
 * 
 * Use Case:
 * 1. Author suggests 3-5 reviewers
 * 2. System sends invitation emails
 * 3. Reviewers accept/decline invitations
 * 4. Editor reviews accepted reviewers' credentials
 * 5. Editor approves 2+ reviewers (sets editorApproved = true)
 * 6. Editor calls this endpoint to move to review
 */
router.post(
    "/:id/move-to-review",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(getSubmissionByIdSchema),
    asyncHandler(moveToReview)
);

export default router;