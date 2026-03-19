import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Reviewer } from "./reviewer.model.js";

/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER SERVICE LAYER
 * ════════════════════════════════════════════════════════════════
 *
 * Handles all business logic for the Reviewer collection.
 *
 * WHAT THIS SERVICE DOES:
 * - Get reviewer document for a submission (for Editor dashboard)
 * - Get assigned reviewers for a submission
 * - Check if a user is an assigned reviewer (permission check)
 *
 * WHAT THIS SERVICE DOES NOT DO:
 * - Create reviewer document → done in submissions.service.js at submitManuscript()
 * - Assign reviewers → done in submissions.service.js at assignReviewers()
 * - Submit reviewer feedback → done in submissions.service.js at submitRevision()
 *   (kept in submissions.service.js so Editor can access it via unified endpoint)
 *
 * FLOW PRESERVED:
 * - suggestedReviewers stays in Submission schema (immutable after SUBMIT)
 * - assignedReviewers lives in Reviewer schema (mutable — editor can change)
 * - reviewerFeedback lives in Reviewer schema (accumulated as reviewers submit)
 * - Reviewer document created at submitManuscript() time — same as coAuthor consents
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// GET REVIEWER DOCUMENT BY SUBMISSION
// ================================================

/**
 * Get the full reviewer document for a submission
 * Used by Editor dashboard to see all assigned reviewers + feedback
 */
const getReviewerDocument = async (submissionId) => {
    try {
        console.log("🔵 [REVIEWER-SERVICE] getReviewerDocument started");

        const reviewerDoc = await Reviewer.findBySubmission(submissionId);

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        console.log("✅ [REVIEWER-SERVICE] getReviewerDocument completed");

        return {
            message: "Reviewer document retrieved successfully",
            reviewer: reviewerDoc,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [REVIEWER-SERVICE] Error in getReviewerDocument:", error);
        throw new AppError(
            "Failed to retrieve reviewer document",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_REVIEWER_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET ASSIGNED REVIEWERS FOR A SUBMISSION
// ================================================

/**
 * Get only the assignedReviewers array (not full document)
 * Used by Editor to see who is currently assigned
 */
const getAssignedReviewers = async (submissionId) => {
    try {
        console.log("🔵 [REVIEWER-SERVICE] getAssignedReviewers started");

        const reviewerDoc = await Reviewer.findOne({ submissionId })
            .populate("assignedReviewers.reviewer", "firstName lastName email primarySpecialty institution");

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        console.log(`✅ [REVIEWER-SERVICE] Found ${reviewerDoc.assignedReviewers.length} assigned reviewers`);

        return {
            message: "Assigned reviewers retrieved successfully",
            assignedReviewers: reviewerDoc.assignedReviewers,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [REVIEWER-SERVICE] Error in getAssignedReviewers:", error);
        throw new AppError(
            "Failed to retrieve assigned reviewers",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_ASSIGNED_REVIEWERS_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET REVIEWER FEEDBACK FOR A SUBMISSION
// ================================================

/**
 * Get only the reviewerFeedback array
 * Used by Editor to see all submitted feedback
 */
const getReviewerFeedback = async (submissionId) => {
    try {
        console.log("🔵 [REVIEWER-SERVICE] getReviewerFeedback started");

        const reviewerDoc = await Reviewer.findOne({ submissionId })
            .populate("reviewerFeedback.user", "firstName lastName email");

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        console.log(`✅ [REVIEWER-SERVICE] Found ${reviewerDoc.reviewerFeedback.length} feedback entries`);

        return {
            message: "Reviewer feedback retrieved successfully",
            reviewerFeedback: reviewerDoc.reviewerFeedback,
            totalFeedback: reviewerDoc.reviewerFeedback.length,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [REVIEWER-SERVICE] Error in getReviewerFeedback:", error);
        throw new AppError(
            "Failed to retrieve reviewer feedback",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_REVIEWER_FEEDBACK_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// CHECK IF USER IS ASSIGNED REVIEWER
// ================================================

/**
 * Permission check — is this user an assigned reviewer for this submission?
 * Used in service layer (Option B — passed as isAssignedReviewer boolean)
 * Also available as standalone for other checks
 */
const isAssignedReviewer = async (submissionId, userId) => {
    try {
        console.log("🔵 [REVIEWER-SERVICE] isAssignedReviewer check started");

        const result = await Reviewer.isAssignedReviewer(submissionId, userId);

        console.log(`✅ [REVIEWER-SERVICE] isAssignedReviewer: ${result}`);

        return result;

    } catch (error) {
        console.error("❌ [REVIEWER-SERVICE] Error in isAssignedReviewer:", error);
        return false; // Safe default — deny access on error
    }
};

// ================================================
// UPDATE REVIEWER STATUS
// ================================================

/**
 * Update status of a specific assigned reviewer
 * e.g., PENDING → IN_PROGRESS → COMPLETED
 */
const updateReviewerStatus = async (submissionId, reviewerId, newStatus) => {
    try {
        const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
        if (!validStatuses.includes(newStatus)) {
            throw new AppError(
                `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
                STATUS_CODES.BAD_REQUEST,
                "INVALID_STATUS"
            );
        }

        const reviewerDoc = await Reviewer.findOne({ submissionId });

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        const assignedReviewer = reviewerDoc.assignedReviewers.find(
            r => r.reviewer.toString() === reviewerId.toString()
        );

        if (!assignedReviewer) {
            throw new AppError(
                "This reviewer is not assigned to this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_NOT_ASSIGNED"
            );
        }

        assignedReviewer.status = newStatus;
        await reviewerDoc.save();

        console.log(`✅ [REVIEWER-SERVICE] Reviewer status updated to ${newStatus}`);

        return {
            message: `Reviewer status updated to ${newStatus}`,
            assignedReviewer,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [REVIEWER-SERVICE] Error in updateReviewerStatus:", error);
        throw new AppError(
            "Failed to update reviewer status",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "UPDATE_REVIEWER_STATUS_ERROR",
            { originalError: error.message }
        );
    }
};

export default {
    getReviewerDocument,
    getAssignedReviewers,
    getReviewerFeedback,
    isAssignedReviewer,
    updateReviewerStatus,
};