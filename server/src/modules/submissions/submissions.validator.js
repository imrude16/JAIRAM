import Joi from "joi";
import { validateChecklistResponses, CURRENT_CHECKLIST } from "../../common/constants/checklistQuestions.v1.0.0.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION VALIDATION SCHEMAS - COMPLETE VERSION
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.validator.js
 * Validates all UI fields from screenshots
 * Integrates with checklist validation
 * + NEW SCHEMAS FOR REVISIONS AND DECISIONS
 * + NEW SCHEMA FOR CONSENT MANAGEMENT
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// REUSABLE FIELD DEFINITIONS
// ================================================

const objectIdField = (fieldName = "ID") => Joi.string()
    .hex()
    .length(24)
    .messages({
        "string.hex": `Invalid ${fieldName} format`,
        "string.length": `Invalid ${fieldName} format`,
        "any.required": `${fieldName} is required`,
    });

const emailField = Joi.string()
    .email({ tlds: { allow: true } })
    .lowercase()
    .trim()
    .max(254)
    .required()
    .messages({
        "string.email": "Please provide a valid email address",
        "string.max": "Email address is too long",
        "any.required": "Email is required",
    });

const nameField = (fieldName) => Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .messages({
        "string.min": `${fieldName} must be at least 2 characters`,
        "string.max": `${fieldName} cannot exceed 50 characters`,
        "string.pattern.base": `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
        "any.required": `${fieldName} is required`,
    });

const orcidField = Joi.string()
    .pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
    .optional()
    .allow("")
    .messages({
        "string.pattern.base": "ORCID must be in format 0000-0000-0000-0000",
    });

// ================================================
// FILE OBJECT SCHEMA
// ================================================

const fileSchema = Joi.object({
    fileName: Joi.string().trim().max(255).required(),
    fileUrl: Joi.string().required(), // Base64 or URL
    fileSize: Joi.number().integer().positive().max(25 * 1024 * 1024).required()
        .messages({
            "number.max": "File size cannot exceed 25MB",
        }),
    mimeType: Joi.string().required(),
    uploadedAt: Joi.date().optional(),
    isTemporary: Joi.boolean().default(true),
    description: Joi.string().trim().max(500).optional().allow(""),
});

// ================================================
// CREATE SUBMISSION (DRAFT) SCHEMA
// ================================================

export const createSubmissionSchema = {
    body: Joi.object({
        // Submitter Role Type (Manuscript Submission Login)
        submitterRoleType: Joi.string()
            .valid("Author", "Editor", "Technical Editor", "Reviewer")
            .required()
            .messages({
                "any.only": "Submitter role type must be one of: Author, Editor, Technical Editor, Reviewer",
                "any.required": "Submitter role type is required",
            }),

        // Article Type
        articleType: Joi.string()
            .valid(
                "Original Article",
                "Case Report",
                "Case Series",
                "Meta-Analysis",
                "Review Article / Systematic Review",
                "Editorial",
                "Clinical Trial"
            )
            .required()
            .messages({
                "any.only": "Please select a valid article type",
                "any.required": "Article type is required",
            }),

        // Title
        title: Joi.string()
            .trim()
            .min(10)
            .max(500)
            .required()
            .messages({
                "string.min": "Title must be at least 10 characters",
                "string.max": "Title cannot exceed 500 characters",
                "any.required": "Article title is required",
            }),

        // Running Title
        runningTitle: Joi.string()
            .trim()
            .max(50)
            .required()
            .messages({
                "string.max": "Running title cannot exceed 50 characters",
                "any.required": "Running title is required",
            }),

        // Abstract
        abstract: Joi.string()
            .trim()
            .min(100)
            .max(2500)
            .required()
            .messages({
                "string.min": "Abstract must be at least 100 characters",
                "string.max": "Abstract cannot exceed 250 words (approximately 2500 characters)",
                "any.required": "Abstract is required",
            }),

        // Keywords
        keywords: Joi.array()
            .items(Joi.string().trim().min(2).max(50))
            .min(3)
            .max(6)
            .required()
            .messages({
                "array.min": "Please provide at least 3 keywords",
                "array.max": "Please provide no more than 6 keywords",
                "any.required": "Keywords are required",
            }),

        // Manuscript Details
        manuscriptDetails: Joi.object({
            wordCount: Joi.number().integer().min(0).required()
                .messages({
                    "any.required": "Word count is required",
                }),
            numberOfBlackAndWhiteFigures: Joi.number().integer().min(0).default(0),
            numberOfColorFigures: Joi.number().integer().min(0).default(0),
            numberOfTables: Joi.number().integer().min(0).default(0),
            numberOfPages: Joi.number().integer().min(1).required()
                .messages({
                    "any.required": "Number of pages is required",
                }),
        }).required(),

        // Conditional Registration Numbers
        iecApproval: Joi.when("articleType", {
            is: Joi.valid("Original Article", "Case Report", "Case Series", "Editorial"),
            then: Joi.object({
                hasIEC: Joi.boolean().required(),
                iecDetails: Joi.when("hasIEC", {
                    is: true,
                    then: Joi.string().trim().max(1000).required(),
                    otherwise: Joi.optional().allow(""),
                }),
            }),
            otherwise: Joi.optional(),
        }),

        prosperoRegistration: Joi.when("articleType", {
            is: Joi.valid("Meta-Analysis", "Review Article / Systematic Review"),
            then: Joi.object({
                hasProspero: Joi.boolean().required(),
                prosperoDetails: Joi.when("hasProspero", {
                    is: true,
                    then: Joi.string().trim().max(1000).required(),
                    otherwise: Joi.optional().allow(""),
                }),
            }),
            otherwise: Joi.optional(),
        }),

        trialRegistration: Joi.when("articleType", {
            is: "Clinical Trial",
            then: Joi.object({
                hasTrial: Joi.boolean().required(),
                trialDetails: Joi.when("hasTrial", {
                    is: true,
                    then: Joi.string().trim().max(1000).required(),
                    otherwise: Joi.optional().allow(""),
                }),
            }),
            otherwise: Joi.optional(),
        }),
        // Corresponding Author Flag
        isCorrespondingAuthor: Joi.boolean().default(false),

        // Co-Authors (optional at draft stage)
        coAuthors: Joi.array()
            .items(Joi.object({
                user: objectIdField("User ID").optional().allow(null),
                title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").required(),
                firstName: nameField("First name"),
                lastName: nameField("Last name"),
                email: emailField,
                phoneNumber: Joi.string().trim().required(),
                department: Joi.string().trim().required(),
                country: Joi.string().trim().required(),
                orcid: orcidField,
                order: Joi.number().integer().min(1).required(),
                isCorresponding: Joi.boolean().default(false),
                source: Joi.string().valid("DATABASE_SEARCH", "MANUAL_ENTRY").default("MANUAL_ENTRY"),
            }))
            .optional(),

        // Save as draft
        saveAsDraft: Joi.boolean().default(true),
    }),
};

// ================================================
// UPDATE SUBMISSION SCHEMA
// ================================================

export const updateSubmissionSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        submitterRoleType: Joi.string()
            .valid("Author", "Editor", "Technical Editor", "Reviewer")
            .optional()
            .messages({
                "any.only": "Submitter role type must be one of: Author, Editor, Technical Editor, Reviewer",
            }),

        articleType: Joi.string()
            .valid(
                "Original Article",
                "Case Report",
                "Case Series",
                "Meta-Analysis",
                "Review Article / Systematic Review",
                "Editorial",
                "Clinical Trial"
            )
            .optional(),

        title: Joi.string().trim().min(10).max(500).optional(),
        runningTitle: Joi.string().trim().max(50).optional(),
        abstract: Joi.string().trim().min(100).max(2500).optional(),
        keywords: Joi.array().items(Joi.string().trim()).min(3).max(6).optional(),

        manuscriptDetails: Joi.object({
            wordCount: Joi.number().integer().min(0).optional(),
            numberOfBlackAndWhiteFigures: Joi.number().integer().min(0).optional(),
            numberOfColorFigures: Joi.number().integer().min(0).optional(),
            numberOfTables: Joi.number().integer().min(0).optional(),
            numberOfPages: Joi.number().integer().min(1).optional(),
        }).optional(),

        iecApproval: Joi.object({
            hasIEC: Joi.boolean().optional(),
            iecDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        prosperoRegistration: Joi.object({
            hasProspero: Joi.boolean().optional(),
            prosperoDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        trialRegistration: Joi.object({
            hasTrial: Joi.boolean().optional(),
            trialDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        isCorrespondingAuthor: Joi.boolean().optional(),

        coAuthors: Joi.array()
            .items(Joi.object({
                user: objectIdField("User ID").optional().allow(null),
                title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").optional().allow(""),
                firstName: Joi.string().optional().allow(""),
                lastName: Joi.string().optional().allow(""),
                email: Joi.string().email().optional().allow(""),
                phoneNumber: Joi.string().trim().optional().allow(""),
                department: Joi.string().trim().optional().allow(""),
                country: Joi.string().trim().optional().allow(""),
                orcid: orcidField,
                order: Joi.number().integer().min(1).optional(),
                isCorresponding: Joi.boolean().optional(),
                source: Joi.string().valid("DATABASE_SEARCH", "MANUAL_ENTRY").optional(),
            }))
            .optional(),


        // File uploads
        coverLetter: fileSchema.optional(),
        blindManuscriptFile: fileSchema.optional(),
        figures: Joi.array().items(fileSchema).max(3).optional()
            .messages({
                "array.max": "Maximum 3 figure uploads allowed",
            }),
        tables: Joi.array().items(fileSchema).max(6).optional()
            .messages({
                "array.max": "Maximum 6 table uploads allowed",
            }),
        supplementaryFiles: Joi.array().items(fileSchema).optional(),

        // Suggested Reviewers
        suggestedReviewers: Joi.array()
            .items(Joi.object({
                user: objectIdField("User ID").optional().allow(null),
                title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").required(),
                firstName: nameField("First name"),
                lastName: nameField("Last name"),
                email: emailField,
                specialization: Joi.string().trim().required(),
                institution: Joi.string().trim().required(),
                country: Joi.string().trim().required(),
            }))
            .min(2)
            .max(5)
            .optional(),
    })
        .min(1)
        .messages({
            "object.min": "At least one field must be provided for update",
        }),
};

// ================================================
// SUBMIT MANUSCRIPT SCHEMA
// ================================================

export const submitManuscriptSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        // Checklist
        checklist: Joi.object({
            checklistVersion: Joi.string().default("1.0.0"),
            responses: Joi.array()
                .items(Joi.object({
                    questionId: Joi.string().required(),
                    categoryId: Joi.string().required(),
                    response: Joi.string().valid("YES", "NO", "N/A").required(),
                }))
                .min(17)
                .required()
                .custom((value, helpers) => {
                    const copeCompliance = helpers.state.ancestors[0].copeCompliance;
                    const result = validateChecklistResponses(value, copeCompliance);

                    if (!result.isValid) {
                        return helpers.error('any.invalid', { message: result.error });
                    }
                    return value;
                })
                .messages({
                    "array.min": "All 17 checklist questions must be answered",
                }),
            copeCompliance: Joi.boolean().valid(true).required()
                .messages({
                    "any.only": "COPE compliance certification is required",
                }),
        }).required(),

        // Conflict of Interest
        conflictOfInterest: Joi.object({
            hasConflict: Joi.boolean().required(),
            details: Joi.when("hasConflict", {
                is: true,
                then: Joi.string().trim().min(10).max(2000).required(),
                otherwise: Joi.optional().allow(""),
            }),
        }).required(),

        // Copyright Agreement
        copyrightAgreement: Joi.object({
            accepted: Joi.boolean().valid(true).required()
                .messages({
                    "any.only": "Copyright agreement must be accepted",
                }),
            acceptedAt: Joi.date().required(),
            ipAddress: Joi.string().optional(),
        }).required(),

        // PDF Preview Confirmed
        pdfPreviewConfirmed: Joi.boolean().valid(true).required()
            .messages({
                "any.only": "Please confirm you have reviewed the PDF preview",
            }),

        // // Suggested Reviewers
        // suggestedReviewers: Joi.array()
        //     .items(Joi.object({
        //         user: objectIdField("User ID").optional().allow(null),
        //         title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").required(),
        //         firstName: nameField("First name"),
        //         lastName: nameField("Last name"),
        //         email: emailField,
        //         specialization: Joi.string().trim().required(),
        //         institution: Joi.string().trim().required(),
        //         country: Joi.string().trim().required(),
        //         source: Joi.string().valid("DATABASE_SEARCH", "MANUAL_ENTRY").default("MANUAL_ENTRY"),
        //     }))
        //     .min(1)
        //     .max(5)
        //     .required()
        //     .messages({
        //         "array.min": "At least 1 reviewer suggestion is required",
        //         "array.max": "Maximum 5 reviewer suggestions allowed",
        //     }),
    }),
};

export const resubmitAuthorRevisionSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        coverLetter: fileSchema.required().messages({
            "any.required": "Cover letter is required",
        }),
        blindManuscriptFile: fileSchema.required().messages({
            "any.required": "Blind manuscript file is required",
        }),
        figures: Joi.array().items(fileSchema).max(3).optional()
            .messages({
                "array.max": "Maximum 3 figure uploads allowed",
            }),
        tables: Joi.array().items(fileSchema).max(6).optional()
            .messages({
                "array.max": "Maximum 6 table uploads allowed",
            }),
        supplementaryFiles: Joi.array().items(fileSchema).optional(),
    }),
};

// ================================================
// GET SUBMISSION BY ID SCHEMA
// ================================================

export const getSubmissionByIdSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),
};

// ================================================
// UPDATE STATUS SCHEMA
// ================================================

export const updateStatusSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        status: Joi.string()
            .valid(
                "DRAFT",
                "SUBMITTED",
                "UNDER_REVIEW",
                "REVISION_REQUESTED",
                "PROVISIONALLY_ACCEPTED",
                "ACCEPTED",
                "REJECTED"
            )
            .required()
            .messages({
                "any.only": "Invalid status value",
                "any.required": "Status is required",
            }),

        comments: Joi.string().trim().max(5000).optional().allow(""),
    }),
};

// ================================================
// UPDATE PAYMENT STATUS SCHEMA
// ================================================

export const updatePaymentStatusSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        paymentStatus: Joi.boolean().required()
            .messages({
                "any.required": "Payment status is required",
            }),
        note: Joi.string().trim().max(1000).optional().allow(""),
    }),
};

// ================================================
// ASSIGN EDITOR SCHEMA
// ================================================

export const assignEditorSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        editorId: objectIdField("Editor ID").required(),
    }),
};

// ================================================
// CO-AUTHOR CONSENT SCHEMA
// ================================================

export const coAuthorConsentSchema = {
    body: Joi.object({
        consent: Joi.string().valid("ACCEPT", "REJECT").required()
            .messages({
                "any.only": "Consent must be either ACCEPT or REJECT",
            }),
        token: Joi.string().required()
            .messages({
                "any.required": "Consent token is required",
            }),
        remark: Joi.when("consent", {
            is: "REJECT",
            then: Joi.string().trim().min(10).max(1000).required()
                .messages({
                    "any.required": "Please provide a reason for rejection",
                    "string.min": "Reason must be at least 10 characters",
                }),
            otherwise: Joi.optional().allow(""),
        }),
    }),
};

// ================================================
// LIST SUBMISSIONS SCHEMA
// ================================================

export const listSubmissionsSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid(
                "DRAFT",
                "SUBMITTED",
                "UNDER_REVIEW",
                "REVISION_REQUESTED",
                "PROVISIONALLY_ACCEPTED",
                "ACCEPTED",
                "REJECTED"
            )
            .optional(),

        articleType: Joi.string()
            .valid(
                "Original Article",
                "Case Report",
                "Case Series",
                "Meta-Analysis",
                "Review Article / Systematic Review",
                "Editorial",
                "Clinical Trial"
            )
            .optional(),

        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(100).default(20).optional(),
        sortBy: Joi.string().valid("submittedAt", "lastModifiedAt", "title", "status").default("submittedAt").optional(),
        sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
        search: Joi.string().trim().min(2).max(100).optional(),
    }),
};

// ════════════════════════════════════════════════════════════════
// NEW SCHEMAS FOR REVISIONS AND DECISIONS
// ════════════════════════════════════════════════════════════════

// ================================================
// SUBMIT REVISION SCHEMA (Editor/Tech Editor/Reviewer)
// ================================================

export const submitRevisionSchema = {
    body: Joi.object({
        // Original submission being revised
        originalSubmissionId: objectIdField("Original Submission ID").required(),

        // Who is submitting this revision?
        submitterRoleType: Joi.string()
            .valid("Editor", "Technical Editor", "Reviewer")
            .required()
            .messages({
                "any.only": "Only Editor, Technical Editor, or Reviewer can submit revisions",
                "any.required": "Submitter role type is required",
            }),

        // Which stage of revision?
        revisionStage: Joi.string()
            .valid(
                "EDITOR_TO_TECH_EDITOR",
                "TECH_EDITOR_TO_EDITOR",
                "EDITOR_TO_REVIEWER",
                "REVIEWER_TO_EDITOR",
                "EDITOR_TO_AUTHOR"
            )
            .required(),

        // Remarks (required for all revision stages)
        remarks: Joi.string()
            .trim()
            .min(10)
            .max(5000)
            .required()
            .messages({
                "string.min": "Remarks must be at least 10 characters",
                "string.max": "Remarks cannot exceed 5000 characters",
                "any.required": "Remarks are required",
            }),

        recommendation: Joi.when("revisionStage", {
            is: "EDITOR_TO_AUTHOR",
            then: Joi.string()
                .valid("ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT")
                .optional(),
            otherwise: Joi.string()
                .valid("ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT")
                .required()
                .messages({
                    "any.only": "Recommendation must be one of: ACCEPT, MINOR_REVISION, MAJOR_REVISION, REJECT",
                    "any.required": "Recommendation is required",
                }),
        }),

        // Reviewer Checklist (required for REVIEWER_TO_EDITOR)
        reviewerChecklist: Joi.object({
            checklistVersion: Joi.string().default("1.0.0"),
            responses: Joi.array().items(
                Joi.object({
                    questionId: Joi.string().required(),
                    sectionId: Joi.string().required(),
                    response: Joi.alternatives()
                        .try(Joi.boolean(), Joi.string())
                        .required(),
                })
            ).min(1).required(),
            completedAt: Joi.date().optional(),
        }).when("revisionStage", {
            is: "REVIEWER_TO_EDITOR",
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

        confidentialToEditor: Joi.when("revisionStage", {
            is: "REVIEWER_TO_EDITOR",
            then: Joi.string()
                .trim()
                .min(10)
                .max(10000)
                .required()
                .messages({
                    "string.min": "Confidential Letter for Editor must be at least 10 characters",
                    "string.max": "Confidential Letter for Editor cannot exceed 10000 characters",
                    "any.required": "Confidential Letter for Editor is required",
                }),
            otherwise: Joi.string()
                .trim()
                .max(10000)
                .optional()
                .allow(""),
        }),

        revisedManuscript: Joi.when("revisionStage", {
            is: "EDITOR_TO_AUTHOR",
            then: fileSchema.optional(),
            otherwise: fileSchema.required().messages({
                "any.required": "Revised manuscript is required",
            }),
        }),
        
        responseToEditorComments: Joi.when("revisionStage", {
            is: "REVIEWER_TO_EDITOR",
            then: fileSchema.required().messages({
                "any.required": "Response to Editor's Comments file is required",
            }),
            otherwise: fileSchema.optional(),
        }),
        attachments: Joi.array().items(fileSchema).max(10).optional(),
    }),
};

// ================================================
// EDITOR DECISION SCHEMA (Accept/Reject)
// ================================================

export const editorDecisionSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        decision: Joi.string()
            .valid("ACCEPT", "REJECT")
            .required()
            .messages({
                "any.only": "Decision must be either ACCEPT or REJECT",
                "any.required": "Decision is required",
            }),

        decisionStage: Joi.string()
            .valid(
                "INITIAL_SCREENING",
                "POST_TECH_EDITOR",
                "POST_REVIEWER",
                "FINAL_DECISION"
            )
            .required()
            .messages({
                "any.only": "Invalid decision stage",
                "any.required": "Decision stage is required",
            }),

        remarks: Joi.string()
            .trim()
            .min(10)
            .max(5000)
            .optional()
            .allow(""),

        attachments: Joi.array().items(fileSchema).max(5).optional(),
    }),
};

// ================================================
// TECHNICAL EDITOR DECISION SCHEMA
// ================================================

// export const technicalEditorDecisionSchema = {
//     params: Joi.object({
//         id: objectIdField("Submission ID").required(),
//     }),

//     body: Joi.object({
//         recommendation: Joi.string()
//             .valid("ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT")
//             .required()
//             .messages({
//                 "any.only": "Recommendation must be one of: ACCEPT, MINOR_REVISION, MAJOR_REVISION, REJECT",
//                 "any.required": "Recommendation is required",
//             }),

//         remarks: Joi.string()
//             .trim()
//             .min(10)
//             .max(5000)
//             .required()
//             .messages({
//                 "string.min": "Remarks must be at least 10 characters",
//                 "any.required": "Remarks are required for your decision",
//             }),

//         attachments: Joi.array().items(fileSchema).max(5).optional(),
//     }),
// };

// ================================================
// CO-AUTHOR CONSENT CHECK SCHEMA
// ================================================

export const checkCoAuthorConsentSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),
};

// ================================================
// REVIEWER MAJORITY CHECK SCHEMA
// ================================================

export const checkReviewerMajoritySchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),
};

// ════════════════════════════════════════════════════════════════
// NEW SCHEMAS FOR CONSENT MANAGEMENT
// ════════════════════════════════════════════════════════════════

// ================================================
// EDITOR APPROVE CONSENT OVERRIDE SCHEMA
// ================================================

export const editorApproveSuggestedReviewerSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
        reviewerIndex: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                "number.base": "Reviewer index must be a number",
                "number.integer": "Reviewer index must be an integer",
                "number.min": "Reviewer index cannot be negative",
                "any.required": "Reviewer index is required",
            }),
    }),

    body: Joi.object({
        editorApproved: Joi.boolean()
            .required()
            .messages({
                "any.required": "Editor approval value is required",
            }),
    }),
};

export const editorApproveConsentOverrideSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        resolutionNote: Joi.string()
            .trim()
            .min(10)
            .max(1000)
            .required()
            .messages({
                "string.min": "Resolution note must be at least 10 characters",
                "string.max": "Resolution note cannot exceed 1000 characters",
                "any.required": "Please provide a reason for overriding consent issues",
            }),
    }),
};

// ════════════════════════════════════════════════════════════════
// EDITOR ASSIGNMENT SCHEMAS (NEW)
// ════════════════════════════════════════════════════════════════

// ================================================
// ASSIGN TECHNICAL EDITOR SCHEMA
// ================================================

export const assignTechnicalEditorSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        technicalEditorId: objectIdField("Technical Editor ID").required(),

        remarks: Joi.string()
            .trim()
            .min(10)
            .max(2000)
            .required()
            .messages({
                "string.min": "Remarks must be at least 10 characters",
                "string.max": "Remarks cannot exceed 2000 characters",
                "any.required": "Remarks for technical editor are required",
            }),

        revisedManuscript: fileSchema.required().messages({
            "any.required": "Revised manuscript is required",
        }),

        attachments: Joi.array().items(fileSchema).max(5).optional(),
    }),
};

// ================================================
// ASSIGN REVIEWERS SCHEMA
// ================================================

export const assignReviewersSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        reviewerIds: Joi.array()
            .items(objectIdField("Reviewer ID"))
            .min(2)
            .max(5)
            .required()
            .messages({
                "array.min": "Minimum 2 reviewers required",
                "array.max": "Maximum 5 reviewers allowed",
                "any.required": "Reviewer IDs are required",
            }),

        remarks: Joi.string()
            .trim()
            .min(10)
            .max(2000)
            .required()
            .messages({
                "string.min": "Remarks must be at least 10 characters",
                "string.max": "Remarks cannot exceed 2000 characters",
                "any.required": "Remarks for reviewers are required",
            }),

        revisedManuscript: fileSchema.required().messages({
            "any.required": "Revised manuscript is required",
        }),

        attachments: Joi.array().items(fileSchema).max(5).optional(),
    }),
};

// ================================================
// GENERATE UPLOAD URL SCHEMA
// ================================================

export const generateUploadUrlSchema = {
    body: Joi.object({
        fileName: Joi.string()
            .trim()
            .max(255)
            .required()
            .messages({
                "string.max": "File name cannot exceed 255 characters",
                "any.required": "File name is required",
            }),

        fileType: Joi.string()
            .required()
            .messages({
                "any.required": "File type is required",
            }),

        uploadType: Joi.string()
            .valid(
                "coverLetter",
                "blindManuscript",
                "figure",
                "table",
                "supplementary"
            )
            .required()
            .messages({
                "any.only": "Upload type must be one of: coverLetter, blindManuscript, figure, table, supplementary",
                "any.required": "Upload type is required",
            }),
    }),
};

// ================================================
// SEARCH AUTHORS SCHEMA
// ================================================

export const searchAuthorsSchema = {
    query: Joi.object({
        q: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                "string.min": "Search query must be at least 2 characters",
                "string.max": "Search query cannot exceed 100 characters",
                "any.required": "Search query is required",
            }),

        exclude: Joi.string()
            .optional()
            .allow("")
            .messages({
                "string.base": "Exclude must be a comma-separated list of emails",
            }),
    }),
};

// ================================================
// SEARCH REVIEWERS SCHEMA
// ================================================

export const searchReviewersSchema = {
    query: Joi.object({
        q: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .optional()
            .allow("")
            .messages({
                "string.min": "Search query must be at least 2 characters",
                "string.max": "Search query cannot exceed 100 characters",
            }),

        exclude: Joi.string()
            .optional()
            .allow("")
            .messages({
                "string.base": "Exclude must be a comma-separated list of emails",
            }),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .optional()
            .messages({
                "number.base": "Limit must be a number",
                "number.integer": "Limit must be an integer",
                "number.min": "Limit must be at least 1",
                "number.max": "Limit cannot exceed 100",
            }),
    }),
};

// ================================================
// TECHNICAL EDITOR ASSIGNMENT RESPONSE SCHEMA
// ================================================

export const technicalEditorAssignmentResponseSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        decision: Joi.string()
            .valid("ACCEPT", "REJECT")
            .required()
            .messages({
                "any.only": "Decision must be either ACCEPT or REJECT",
                "any.required": "Decision is required",
            }),

        rejectionReason: Joi.when("decision", {
            is: "REJECT",
            then: Joi.string()
                .trim()
                .min(10)
                .max(1000)
                .required()
                .messages({
                    "string.min": "Rejection reason must be at least 10 characters",
                    "string.max": "Rejection reason cannot exceed 1000 characters",
                    "any.required": "Rejection reason is required when rejecting assignment",
                }),
            otherwise: Joi.string()
                .trim()
                .allow("", null)
                .optional(),
        }),
    }),
};

export const reviewerAssignmentResponseSchema = {
    params: Joi.object({
        id: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        decision: Joi.string()
            .valid("ACCEPT", "REJECT")
            .required()
            .messages({
                "any.only": "Decision must be either ACCEPT or REJECT",
                "any.required": "Decision is required",
            }),

        rejectionReason: Joi.when("decision", {
            is: "REJECT",
            then: Joi.string()
                .trim()
                .min(10)
                .max(1000)
                .required()
                .messages({
                    "string.min": "Rejection reason must be at least 10 characters",
                    "string.max": "Rejection reason cannot exceed 1000 characters",
                    "any.required": "Rejection reason is required when rejecting assignment",
                }),
            otherwise: Joi.string()
                .trim()
                .allow("", null)
                .optional(),
        }),
    }),
};

// ================================================
// SEARCH TECHNICAL EDITORS SCHEMA
// ================================================

export const searchTechnicalEditorsSchema = {
    query: Joi.object({
        q: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .optional()
            .allow("")
            .messages({
                "string.min": "Search query must be at least 2 characters",
                "string.max": "Search query cannot exceed 100 characters",
            }),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .optional()
            .messages({
                "number.base": "Limit must be a number",
                "number.integer": "Limit must be an integer",
                "number.min": "Limit must be at least 1",
                "number.max": "Limit cannot exceed 100",
            }),
    }),
};

export const tokenInfoSchema = {
    query: Joi.object({
        token: Joi.string().required(),
        type: Joi.string().valid("consent", "reviewer-invitation").required(),
    }),
};

export const reviewerInvitationResponseSchema = {
    body: Joi.object({
        token: Joi.string().required().messages({
            "any.required": "Token is required",
        }),
        response: Joi.string()
            .valid("ACCEPT", "DECLINE")
            .required()
            .messages({
                "any.only": "Response must be ACCEPT or DECLINE",
                "any.required": "Response is required",
            }),
    }),
};

// ================================================
// SAVE DRAFT SCHEMA
// ================================================

export const saveDraftSchema = {
    body: Joi.object({
        articleType: Joi.string()
            .valid(
                "Original Article",
                "Case Report",
                "Case Series",
                "Meta-Analysis",
                "Review Article / Systematic Review",
                "Editorial",
                "Clinical Trial"
            )
            .optional(),

        title: Joi.string().trim().min(10).max(500).optional(),
        runningTitle: Joi.string().trim().max(50).optional(),
        abstract: Joi.string().trim().max(2500).optional(),
        keywords: Joi.array().items(Joi.string().trim()).max(6).optional(),

        manuscriptDetails: Joi.object({
            wordCount: Joi.number().integer().min(0).optional(),
            numberOfBlackAndWhiteFigures: Joi.number().integer().min(0).optional(),
            numberOfColorFigures: Joi.number().integer().min(0).optional(),
            numberOfTables: Joi.number().integer().min(0).optional(),
            numberOfPages: Joi.number().integer().min(1).optional(),
        }).optional(),

        iecApproval: Joi.object({
            hasIEC: Joi.boolean().optional(),
            iecDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        prosperoRegistration: Joi.object({
            hasProspero: Joi.boolean().optional(),
            prosperoDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        trialRegistration: Joi.object({
            hasTrial: Joi.boolean().optional(),
            trialDetails: Joi.string().trim().max(1000).optional().allow(""),
        }).optional(),

        isCorrespondingAuthor: Joi.boolean().optional(),

        coAuthors: Joi.array()
            .items(Joi.object({
                user: Joi.string().hex().length(24).optional().allow(null),
                title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").optional().allow(""),
                firstName: Joi.string().optional().allow(""),
                lastName: Joi.string().optional().allow(""),
                email: Joi.string().email().optional().allow(""),
                phoneNumber: Joi.string().optional().allow(""),
                department: Joi.string().optional().allow(""),
                country: Joi.string().optional().allow(""),
                orcid: Joi.string().optional().allow(""),
                order: Joi.number().integer().optional(),
                isCorresponding: Joi.boolean().optional(),
                source: Joi.string()
                    .valid("DATABASE_SEARCH", "MANUAL_ENTRY")
                    .optional()
                    .messages({
                        "any.only": "Co-author source must be either DATABASE_SEARCH or MANUAL_ENTRY",
                    }),
            }))
            .optional(),

        suggestedReviewers: Joi.array()
            .items(Joi.object({
                user: Joi.string().hex().length(24).optional().allow(null),
                title: Joi.string().valid("Dr.", "Prof.", "Mr.", "Mrs.").optional(),
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                email: Joi.string().email().optional(),
                specialization: Joi.string().optional().allow(""),
                institution: Joi.string().optional().allow(""),
                country: Joi.string().optional().allow(""),
            }))
            .optional(),

        conflictOfInterest: Joi.object({
            hasConflict: Joi.boolean().optional(),
            details: Joi.string().trim().max(2000).optional().allow(""),
        }).optional(),

        coverLetter: Joi.object({
            fileName: Joi.string().optional(),
            fileUrl: Joi.string().optional(),
            fileSize: Joi.number().optional(),
            mimeType: Joi.string().optional(),
        }).optional(),

        blindManuscriptFile: Joi.object({
            fileName: Joi.string().optional(),
            fileUrl: Joi.string().optional(),
            fileSize: Joi.number().optional(),
            mimeType: Joi.string().optional(),
        }).optional(),

        figures: Joi.array().items(Joi.object({
            fileName: Joi.string().optional(),
            fileUrl: Joi.string().optional(),
            fileSize: Joi.number().optional(),
            mimeType: Joi.string().optional(),
        })).optional(),

        tables: Joi.array().items(Joi.object({
            fileName: Joi.string().optional(),
            fileUrl: Joi.string().optional(),
            fileSize: Joi.number().optional(),
            mimeType: Joi.string().optional(),
        })).optional(),

        supplementaryFiles: Joi.array().items(Joi.object({
            fileName: Joi.string().optional(),
            fileUrl: Joi.string().optional(),
            fileSize: Joi.number().optional(),
            mimeType: Joi.string().optional(),
        })).optional(),
    })
        .min(1)
        .messages({
            "object.min": "At least one field must be provided to save draft",
        }),
};

// ================================================
// DELETE DRAFT SCHEMA
// ================================================

export const deleteDraftSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
            .messages({
                "string.hex": "Invalid draft ID format",
                "string.length": "Invalid draft ID format",
                "any.required": "Draft ID is required",
            }),
    }),
};

// ================================================
// CO-AUTHOR CONSENT FROM DASHBOARD SCHEMA
// ================================================

export const coAuthorConsentFromDashboardSchema = {
    params: Joi.object({
        submissionId: objectIdField("Submission ID").required(),
    }),

    body: Joi.object({
        decision: Joi.string().valid("ACCEPT", "REJECT").required()
            .messages({
                "any.only": "Decision must be either ACCEPT or REJECT",
                "any.required": "Decision is required",
            }),
        remark: Joi.when("decision", {
            is: "REJECT",
            then: Joi.string().trim().max(1000).optional().allow(""),
            otherwise: Joi.optional().allow(""),
        }),
    }),
};
