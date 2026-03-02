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
    // NEW IMPORTS (Revisions & Decisions):
    submitRevisionSchema,
    editorDecisionSchema,
    technicalEditorDecisionSchema,
    checkCoAuthorConsentSchema,
    checkReviewerMajoritySchema,
    // NEW IMPORTS (Consent Management):
    editorApproveConsentOverrideSchema,
} from "./submissions.validator.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION ROUTES - COMPLETE VERSION WITH CONSENT TRACKING
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.router.js
 * Proper route ordering (specific before dynamic)
 * + NEW: Routes for revisions and decisions
 * + NEW: Routes for consent management (cron + editor override)
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
    getSubmissionTimeline,
    // NEW DESTRUCTURING (Revisions & Decisions):
    submitRevision,
    makeEditorDecision,
    makeTechnicalEditorDecision,
    checkCoAuthorConsent,
    checkReviewerMajority,
    // NEW DESTRUCTURING (Consent Management):
    autoRejectExpiredConsents,
    editorApproveConsentOverride,
} = submissionController;

const router = Router();

// ════════════════════════════════════════════════════════════════
// CONSENT MANAGEMENT ROUTES (MUST BE BEFORE DYNAMIC :id ROUTES)
// ════════════════════════════════════════════════════════════════

/**
 * AUTO-REJECT EXPIRED CONSENTS (CRON JOB ENDPOINT)
 * 
 * POST /api/submissions/cron/auto-reject-expired-consents
 * Headers: X-Cron-Secret: <secret_from_env>
 * 
 * Auth: None (protected by cron secret in production)
 * 
 * Runs daily at midnight to check for expired consent deadlines
 * Only processes submissions with consentDeadlineStatus = "ACTIVE"
 * Sends ONE email per submission when auto-rejecting
 * 
 * Performance: Uses indexed query on consentDeadlineStatus
 * 
 * Process:
 * 1. Finds submissions with ACTIVE consent status
 * 2. Checks if any co-author tokens expired (7 days)
 * 3. Adds NO_RESPONSE issues for pending co-authors
 * 4. Changes status to REJECTED
 * 5. Sends detailed email to author with all issues
 * 
 * Example Response:
 * {
 *   "processed": 3,
 *   "submissions": ["JAIRAM-2026-0001", "JAIRAM-2026-0045", ...]
 * }
 */
router.post(
    "/cron/auto-reject-expired-consents",
    asyncHandler(autoRejectExpiredConsents)
);

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
 * - USER: Their own submissions + submissions where they're accepted co-authors
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
 *   submitterRoleType: "Author",
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
 * Note: Only submitterRoleType "Author" allowed for new submissions
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
 * 
 * NEW BEHAVIOR (Rejection):
 * 1. If co-author REJECTS:
 *    - consentDeadlineStatus changes from ACTIVE → NOTIFIED
 *    - Issue tracked in consentIssues array (issueType: "REJECTED")
 *    - Submission status changes to DRAFT
 *    - Author receives ONE email notification with details
 *    - 7-day countdown starts for resolution
 * 2. If not resolved within 7 days:
 *    - Cron job auto-rejects submission
 *    - Author receives final notification email
 */
router.post(
    "/:id/coauthor-consent/:coAuthorId",
    validateRequest(coAuthorConsentSchema),
    asyncHandler(processCoAuthorConsent)
);

/**
 * GET SUBMISSION TIMELINE (Cycles & Versions)
 * 
 * GET /api/submissions/:id/timeline
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required
 * Permission: Author, Co-Authors (accepted), Assigned Editor/Reviewers, Admins
 * Returns: Complete timeline with all cycles and manuscript versions
 * 
 * Use Case:
 * - Author views submission progress
 * - Co-author views revision history
 * - Editor views complete review cycle history
 * - Reviewer sees previous versions and comments
 */
router.get(
    "/:id/timeline",
    requireAuth,
    validateRequest(getSubmissionByIdSchema),
    asyncHandler(getSubmissionTimeline)
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

/**
 * EDITOR MANUAL APPROVAL (Override Consent Issues)
 * 
 * POST /api/submissions/:id/editor-approve-consent
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   resolutionNote: "Author contacted co-author offline, issue resolved"
 * }
 * 
 * Auth: Required + EDITOR role
 * 
 * Use Case:
 * - Co-author rejected or didn't respond
 * - Author resolved issue offline (phone call, email)
 * - Editor manually approves to allow submission to proceed
 * - Changes consentDeadlineStatus from NOTIFIED → RESOLVED
 * - Moves submission from DRAFT → SUBMITTED
 * 
 * Validation:
 * - resolutionNote required (min 10 characters)
 * - Submission must have consent issues (consentDeadlineStatus != "RESOLVED")
 * - Cannot override if already AUTO_REJECTED
 * 
 * Process:
 * 1. Marks all unresolved issues as resolved
 * 2. Records editor ID and resolution note in each issue
 * 3. Updates consentDeadlineStatus to RESOLVED
 * 4. Moves submission from DRAFT to SUBMITTED
 * 5. Adds internal note with audit trail
 * 6. Sends approval email to author
 * 
 * Audit Trail:
 * - Who approved (resolvedBy: editor ObjectId)
 * - When approved (resolvedAt: Date)
 * - Why approved (resolutionNote: String)
 * 
 * Example Body:
 * {
 *   "resolutionNote": "Author provided email correspondence showing Carol agreed to be co-author. Concerns about methodology were addressed via phone call on 2026-03-03."
 * }
 */
router.post(
    "/:id/editor-approve-consent",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(editorApproveConsentOverrideSchema),
    asyncHandler(editorApproveConsentOverride)
);

// ════════════════════════════════════════════════════════════════
// NEW ROUTES FOR REVISIONS & DECISIONS
// ════════════════════════════════════════════════════════════════

/**
 * SUBMIT REVISION (Editor/Tech Editor/Reviewer)
 * 
 * POST /api/submissions/revisions
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   originalSubmissionId: "...",
 *   submitterRoleType: "Editor" | "Technical Editor" | "Reviewer",
 *   revisionStage: "EDITOR_TO_TECH_EDITOR" | "TECH_EDITOR_TO_EDITOR" | ...,
 *   remarks: "...",
 *   revisedManuscript?: {...},
 *   attachments?: [...]
 * }
 * 
 * Auth: Required + EDITOR/TECHNICAL_EDITOR/REVIEWER role
 * Purpose: Submit revised manuscript with remarks
 * 
 * Workflow:
 * - Editor → Technical Editor: revisionStage = "EDITOR_TO_TECH_EDITOR"
 * - Technical Editor → Editor: revisionStage = "TECH_EDITOR_TO_EDITOR"
 * - Editor → Reviewer: revisionStage = "EDITOR_TO_REVIEWER"
 * - Reviewer → Editor: revisionStage = "REVIEWER_TO_EDITOR"
 * - Editor → Author: revisionStage = "EDITOR_TO_AUTHOR"
 * 
 * Validation:
 * - User must be assigned to the original submission
 * - submitterRoleType must match user's role
 * - Creates new SubmissionCycle and ManuscriptVersion
 */
router.post(
    "/revisions",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.TECHNICAL_EDITOR, ROLES.REVIEWER),
    validateRequest(submitRevisionSchema),
    asyncHandler(submitRevision)
);

/**
 * EDITOR DECISION (Accept/Reject)
 * 
 * POST /api/submissions/:id/editor-decision
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   decision: "ACCEPT" | "REJECT",
 *   decisionStage: "INITIAL_SCREENING" | "POST_TECH_EDITOR" | "POST_REVIEWER" | "FINAL_DECISION",
 *   remarks?: "...",
 *   attachments?: [...]
 * }
 * 
 * Auth: Required + EDITOR role
 * Limit: Editor can make max 4 decisions per submission
 * 
 * Decision Stages:
 * 1. INITIAL_SCREENING - Editor's first review after submission
 * 2. POST_TECH_EDITOR - After receiving Technical Editor's review
 * 3. POST_REVIEWER - After receiving Reviewer feedback
 * 4. FINAL_DECISION - Final accept/reject after all revisions
 * 
 * Returns:
 * - Success: { submission, decisionsRemaining: 3 }
 * - Error (403): If editor has exhausted 4 chances
 * 
 * Side Effects:
 * - Records decision in SubmissionCycle (not in Submission schema)
 * - If REJECT: Updates submission.status to "REJECTED"
 * - If ACCEPT: Updates submission.status to "ACCEPTED"
 */
router.post(
    "/:id/editor-decision",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(editorDecisionSchema),
    asyncHandler(makeEditorDecision)
);

/**
 * TECHNICAL EDITOR DECISION (Accept/Reject)
 * 
 * POST /api/submissions/:id/tech-editor-decision
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   decision: "ACCEPT" | "REJECT",
 *   remarks: "...",
 *   attachments?: [...]
 * }
 * 
 * Auth: Required + TECHNICAL_EDITOR role
 * Limit: Technical Editor can make ONLY 1 decision (permanent)
 * 
 * Returns:
 * - Success: { submission, note: "Technical Editor has used their only decision chance" }
 * - Error (403): If technical editor has already decided
 * 
 * Side Effects:
 * - Records decision in SubmissionCycle.technicalEditorReview
 * - If REJECT: Submission.status = "REJECTED" (process ends immediately)
 * - If ACCEPT: Process continues to next stage
 * 
 * Important: Unlike Editor who gets 4 chances, Tech Editor gets ONLY 1
 */
router.post(
    "/:id/tech-editor-decision",
    requireAuth,
    allowRoles(ROLES.TECHNICAL_EDITOR, ROLES.ADMIN),
    validateRequest(technicalEditorDecisionSchema),
    asyncHandler(makeTechnicalEditorDecision)
);

/**
 * CHECK CO-AUTHOR CONSENT STATUS
 * 
 * GET /api/submissions/:id/coauthor-consent-status
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required + EDITOR/ADMIN role
 * Returns: Consent status for all co-authors
 * 
 * Response:
 * {
 *   allAccepted: true/false,
 *   canProceed: true/false,
 *   message: "...",
 *   rejected?: [...], // If any rejected
 *   pending?: [...]   // If any pending
 * }
 * 
 * Use Case:
 * - Editor checks if all co-authors accepted before proceeding
 * - If ANY co-author rejects → submission CANNOT proceed
 * - All must accept for submission to continue
 */
router.get(
    "/:id/coauthor-consent-status",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(checkCoAuthorConsentSchema),
    asyncHandler(checkCoAuthorConsent)
);

/**
 * CHECK REVIEWER MAJORITY STATUS
 * 
 * GET /api/submissions/:id/reviewer-majority-status
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required + EDITOR/ADMIN role
 * Returns: Reviewer response count and majority status
 * 
 * Response:
 * {
 *   majorityMet: true/false,
 *   message: "Majority achieved: 3/4 reviewers accepted",
 *   accepted: 3,
 *   total: 4,
 *   pending?: 1
 * }
 * 
 * Majority Rule:
 * - More than 50% must accept (e.g., 3/4, 2/3)
 * - If 4 suggested: Need 3 to accept
 * - If 3 suggested: Need 2 to accept
 * 
 * Use Case:
 * - Editor checks if majority of suggested reviewers accepted
 * - Process can proceed with majority, not all reviewers needed
 * - Unlike co-authors (ALL must accept), reviewers follow majority rule
 */
router.get(
    "/:id/reviewer-majority-status",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(checkReviewerMajoritySchema),
    asyncHandler(checkReviewerMajority)
);

export default router;