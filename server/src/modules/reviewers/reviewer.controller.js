import reviewerService from "./reviewer.service.js";
import { sendSuccess } from "../../common/utils/responseHandler.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER CONTROLLER LAYER
 * ════════════════════════════════════════════════════════════════
 *
 * Handles HTTP requests for reviewer operations.
 * Thin layer — extracts params, calls service, sends response.
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// GET REVIEWER DOCUMENT (Full — Editor dashboard)
// ================================================

const getReviewerDocument = async (req, res) => {
    const { submissionId } = req.params;

    const result = await reviewerService.getReviewerDocument(submissionId);

    sendSuccess(
        res,
        result.message,
        { reviewer: result.reviewer },
        null,
        STATUS_CODES.OK
    );
};

// ================================================
// GET ASSIGNED REVIEWERS (Editor — who is assigned)
// ================================================

const getAssignedReviewers = async (req, res) => {
    const { submissionId } = req.params;

    const result = await reviewerService.getAssignedReviewers(submissionId);

    sendSuccess(
        res,
        result.message,
        { assignedReviewers: result.assignedReviewers },
        null,
        STATUS_CODES.OK
    );
};

// ================================================
// GET REVIEWER FEEDBACK (Editor — submitted feedback)
// ================================================

const getReviewerFeedback = async (req, res) => {
    const { submissionId } = req.params;

    const result = await reviewerService.getReviewerFeedback(submissionId);

    sendSuccess(
        res,
        result.message,
        {
            reviewerFeedback: result.reviewerFeedback,
            totalFeedback: result.totalFeedback,
        },
        null,
        STATUS_CODES.OK
    );
};

// ================================================
// UPDATE REVIEWER STATUS
// ================================================

const updateReviewerStatus = async (req, res) => {
    const { submissionId, reviewerId } = req.params;
    const { status } = req.body;

    const result = await reviewerService.updateReviewerStatus(
        submissionId,
        reviewerId,
        status
    );

    sendSuccess(
        res,
        result.message,
        { assignedReviewer: result.assignedReviewer },
        null,
        STATUS_CODES.OK
    );
};

export default {
    getReviewerDocument,
    getAssignedReviewers,
    getReviewerFeedback,
    updateReviewerStatus,
};