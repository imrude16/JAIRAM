import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Reviewer } from "./reviewer.model.js";
import { Submission } from "../submissions/submissions.model.js";

const getReviewerDocument = async (submissionId) => {
    try {
        console.log("[REVIEWER-SERVICE] getReviewerDocument started");

        const submission = await Submission.findById(submissionId).select("currentCycleId");
        const reviewerDoc = submission?.currentCycleId
            ? await Reviewer.findByCycle(submission.currentCycleId)
            : null;

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        return {
            message: "Reviewer document retrieved successfully",
            reviewer: reviewerDoc,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("[REVIEWER-SERVICE] Error in getReviewerDocument:", error);
        throw new AppError(
            "Failed to retrieve reviewer document",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_REVIEWER_ERROR",
            { originalError: error.message }
        );
    }
};

const getAssignedReviewers = async (submissionId) => {
    try {
        console.log("[REVIEWER-SERVICE] getAssignedReviewers started");

        const submission = await Submission.findById(submissionId).select("currentCycleId");
        const reviewerDoc = submission?.currentCycleId
            ? await Reviewer.findOne({ submissionId, cycleId: submission.currentCycleId })
                .populate("assignedReviewers.reviewer", "firstName lastName email primarySpecialty institution")
            : null;

        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        return {
            message: "Assigned reviewers retrieved successfully",
            assignedReviewers: reviewerDoc.assignedReviewers,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("[REVIEWER-SERVICE] Error in getAssignedReviewers:", error);
        throw new AppError(
            "Failed to retrieve assigned reviewers",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_ASSIGNED_REVIEWERS_ERROR",
            { originalError: error.message }
        );
    }
};

const getReviewerFeedback = async (submissionId) => {
    try {
        console.log("[REVIEWER-SERVICE] getReviewerFeedback started");

        const reviewerDocs = await Reviewer.find({ submissionId })
            .sort({ createdAt: 1 })
            .populate("reviewerFeedback.user", "firstName lastName email");

        if (!reviewerDocs.length) {
            throw new AppError(
                "Reviewer document not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        const reviewerFeedback = reviewerDocs.flatMap((doc) =>
            (doc.reviewerFeedback || []).map((feedback) => ({
                ...(feedback.toObject?.() || feedback),
                cycleId: doc.cycleId,
            }))
        );

        return {
            message: "Reviewer feedback retrieved successfully",
            reviewerFeedback,
            totalFeedback: reviewerFeedback.length,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("[REVIEWER-SERVICE] Error in getReviewerFeedback:", error);
        throw new AppError(
            "Failed to retrieve reviewer feedback",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_REVIEWER_FEEDBACK_ERROR",
            { originalError: error.message }
        );
    }
};

const isAssignedReviewer = async (submissionId, userId) => {
    try {
        console.log("[REVIEWER-SERVICE] isAssignedReviewer check started");

        const submission = await Submission.findById(submissionId).select("currentCycleId");
        const result = submission?.currentCycleId
            ? await Reviewer.isAssignedReviewer(submissionId, submission.currentCycleId, userId)
            : false;

        console.log(`✅ [REVIEWER-SERVICE] isAssignedReviewer: ${result}`);
        return result;
    } catch (error) {
        console.error("❌ [REVIEWER-SERVICE] Error in isAssignedReviewer:", error);
        return false;
    }
};

export default {
    getReviewerDocument,
    getAssignedReviewers,
    getReviewerFeedback,
    isAssignedReviewer,
};
