import Joi from "joi";

/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER VALIDATION SCHEMAS
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// REUSABLE FIELD DEFINITIONS
// ================================================

const submissionIdParam = Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
        "string.hex": "Invalid submission ID format",
        "string.length": "Invalid submission ID format",
        "any.required": "Submission ID is required",
    });

const reviewerIdParam = Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
        "string.hex": "Invalid reviewer ID format",
        "string.length": "Invalid reviewer ID format",
        "any.required": "Reviewer ID is required",
    });

// ================================================
// GET REVIEWER DOCUMENT SCHEMA
// ================================================

export const getReviewerDocumentSchema = {
    params: Joi.object({
        submissionId: submissionIdParam,
    }),
};

// ================================================
// GET ASSIGNED REVIEWERS SCHEMA
// ================================================

export const getAssignedReviewersSchema = {
    params: Joi.object({
        submissionId: submissionIdParam,
    }),
};

// ================================================
// GET REVIEWER FEEDBACK SCHEMA
// ================================================

export const getReviewerFeedbackSchema = {
    params: Joi.object({
        submissionId: submissionIdParam,
    }),
};

// ================================================
// UPDATE REVIEWER STATUS SCHEMA
// ================================================

export const updateReviewerStatusSchema = {
    params: Joi.object({
        submissionId: submissionIdParam,
        reviewerId: reviewerIdParam,
    }),

    body: Joi.object({
        status: Joi.string()
            .valid("PENDING", "IN_PROGRESS", "COMPLETED")
            .required()
            .messages({
                "any.only": "Status must be one of: PENDING, IN_PROGRESS, COMPLETED",
                "any.required": "Status is required",
            }),
    }),
};