import { Router } from "express";
import { requireAuth } from "../../common/middlewares/requireAuth.js";
import { allowRoles } from "../../common/middlewares/roleBaseMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import reviewerController from "./reviewer.controller.js";
import {
    getReviewerDocumentSchema,
    getAssignedReviewersSchema,
    getReviewerFeedbackSchema,
} from "./reviewer.validator.js";

/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER ROUTES
 * ════════════════════════════════════════════════════════════════
 *
 * Base path: /api/reviewers
 *
 * ACCESS CONTROL:
 * - EDITOR / ADMIN → can view reviewer documents, feedback, assigned list
 * - REVIEWER → can view their own assigned submissions (via listSubmissions)
 *   Reviewer feedback submission goes through /api/submissions/revisions
 *   (kept unified so Editor sees everything in one place)
 *
 * WHAT IS NOT HERE:
 * - Reviewer feedback submission → POST /api/submissions/revisions
 *   (submitterRoleType: "Reviewer", revisionStage: "REVIEWER_TO_EDITOR")
 * - Reviewer assignment response → POST /api/submissions/:id/reviewer-assignment-response
 * - Assigning reviewers → POST /api/submissions/:id/assign-reviewers
 * - Moving to review → POST /api/submissions/:id/move-to-review
 *
 * These stay in submissions router intentionally — unified editorial workflow.
 * ════════════════════════════════════════════════════════════════
 */

const {
    getReviewerDocument,
    getAssignedReviewers,
    getReviewerFeedback,
} = reviewerController;

const router = Router();

/**
 * GET FULL REVIEWER DOCUMENT
 * GET /api/reviewers/:submissionId
 * Auth: EDITOR | ADMIN
 */
router.get(
    "/:submissionId",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(getReviewerDocumentSchema),
    asyncHandler(getReviewerDocument)
);

/**
 * GET ASSIGNED REVIEWERS ONLY
 * GET /api/reviewers/:submissionId/assigned
 * Auth: EDITOR | ADMIN
 */
router.get(
    "/:submissionId/assigned",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(getAssignedReviewersSchema),
    asyncHandler(getAssignedReviewers)
);

/**
 * GET REVIEWER FEEDBACK ONLY
 * GET /api/reviewers/:submissionId/feedback
 * Auth: EDITOR | ADMIN
 */
router.get(
    "/:submissionId/feedback",
    requireAuth,
    allowRoles(ROLES.EDITOR, ROLES.ADMIN),
    validateRequest(getReviewerFeedbackSchema),
    asyncHandler(getReviewerFeedback)
);

export default router;
