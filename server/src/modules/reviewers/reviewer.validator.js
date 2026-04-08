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
