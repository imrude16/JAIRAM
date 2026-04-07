import Joi from "joi";

/**
 * ════════════════════════════════════════════════════════════════
 * ADMIN VALIDATION SCHEMAS
 * ════════════════════════════════════════════════════════════════
 * 
 * Validates admin operations:
 * - Role assignment
 * - User management
 * - Role change requests (Editor → Admin workflow)
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// REUSABLE FIELD DEFINITIONS
// ================================================

const objectIdField = (fieldName = "ID") => Joi.string()
    .hex()
    .length(24)
    .required()
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

const roleField = Joi.string()
    .valid("USER", "EDITOR", "TECHNICAL_EDITOR", "REVIEWER", "ADMIN")
    .required()
    .messages({
        "any.only": "Role must be one of: USER, EDITOR, TECHNICAL_EDITOR, REVIEWER, ADMIN",
        "any.required": "Role is required",
    });

// ================================================
// CREATE ROLE CHANGE REQUEST (EDITOR → ADMIN)
// ================================================

export const createRoleChangeRequestSchema = {
    body: Joi.object({
        userId: objectIdField("User ID"),

        requestedRole: roleField,

        reason: Joi.string()
            .trim()
            .min(10)
            .max(1000)
            .required()
            .messages({
                "string.min": "Reason must be at least 10 characters",
                "string.max": "Reason cannot exceed 1000 characters",
                "any.required": "Reason for role change is required",
            }),
    }),
};

// ================================================
// REVIEW ROLE CHANGE REQUEST (ADMIN)
// ================================================

export const reviewRoleChangeRequestSchema = {
    params: Joi.object({
        requestId: objectIdField("Request ID"),
    }),

    body: Joi.object({
        decision: Joi.string()
            .valid("APPROVE", "REJECT")
            .required()
            .messages({
                "any.only": "Decision must be either APPROVE or REJECT",
                "any.required": "Decision is required",
            }),

        adminComments: Joi.string()
            .trim()
            .max(1000)
            .optional()
            .allow("")
            .messages({
                "string.max": "Comments cannot exceed 1000 characters",
            }),
    }),
};

// ================================================
// GET ROLE CHANGE REQUESTS (FILTERS)
// ================================================

export const getRoleChangeRequestsSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid("PENDING", "APPROVED", "REJECTED")
            .optional()
            .messages({
                "any.only": "Status must be one of: PENDING, APPROVED, REJECTED",
            }),

        userId: Joi.string()
            .hex()
            .length(24)
            .optional()
            .messages({
                "string.hex": "Invalid user ID format",
                "string.length": "Invalid user ID format",
            }),

        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    }),
};

// ================================================
// SEARCH USERS FOR ROLE CHANGE REQUEST (EDITOR)
// ================================================

export const searchRoleChangeUsersSchema = {
    query: Joi.object({
        search: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                "string.min": "Search must be at least 2 characters",
                "string.max": "Search cannot exceed 100 characters",
                "any.required": "Search term is required",
            }),

        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(20).default(10).optional(),
    }),
};

// ================================================
// GET MY ROLE CHANGE REQUESTS (EDITOR)
// ================================================

export const getMyRoleChangeRequestsSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid("PENDING", "APPROVED", "REJECTED")
            .optional()
            .messages({
                "any.only": "Status must be one of: PENDING, APPROVED, REJECTED",
            }),

        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(20).default(10).optional(),
    }),
};

// ================================================
// UPDATE USER ROLE (DIRECT - ADMIN ONLY)
// ================================================

export const updateUserRoleSchema = {
    params: Joi.object({
        userId: objectIdField("User ID"),
    }),

    body: Joi.object({
        role: roleField,

        reason: Joi.string()
            .trim()
            .min(10)
            .max(500)
            .optional()
            .allow("")
            .messages({
                "string.min": "Reason must be at least 10 characters",
                "string.max": "Reason cannot exceed 500 characters",
            }),
    }),
};

// ================================================
// UPDATE USER PROFILE (ADMIN UPDATING ANY USER)
// ================================================

export const updateUserProfileSchema = {
    params: Joi.object({
        userId: objectIdField("User ID"),
    }),

    body: Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(50)
            .trim()
            .optional()
            .messages({
                "string.min": "First name must be at least 2 characters",
                "string.max": "First name cannot exceed 50 characters",
            }),

        lastName: Joi.string()
            .min(2)
            .max(50)
            .trim()
            .optional()
            .messages({
                "string.min": "Last name must be at least 2 characters",
                "string.max": "Last name cannot exceed 50 characters",
            }),

        profession: Joi.string()
            .valid(
                "Physician (MD)",
                "Physician (DO)",
                "Physician Resident / Fellow",
                "Student, Medical School",
                "Administrator",
                "PA",
                "Nurse Practitioner",
                "Nursing Advance Practice",
                "Nursing, RN",
                "Nursing, LPN",
                "Allied Health Professional",
                "Other"
            )
            .optional(),

        otherProfession: Joi.string().trim().max(100).optional().allow(""),

        primarySpecialty: Joi.string()
            .valid(
                "Addiction Medicine", "Allergy & Immunology",
                "Anesthesiology/Pain Medicine", "Behavioral Health/Psychology",
                "Cardiology", "Critical Care", "Dermatology",
                "Emergency Medicine", "Endocrinology", "Epidemiology",
                "Gastroenterology", "General Medicine", "Genetics", "Geriatric",
                "Hematology", "Infectious Disease", "Nephrology",
                "Neurology", "Neurosurgery", "Nursing (General)",
                "Nutrition", "Obstetrics & Gynecology", "Oncology",
                "Ophthalmology/Optometry", "Orthopaedics", "Pathology",
                "Pediatrics", "Pharmacology", "Physical Medicine & Rehabilitation",
                "Psychiatry w/Addiction", "Public Health", "Pulmonary",
                "Radiology", "Rheumatology", "Surgery (General)",
                "Trauma", "Urology", "Other"
            )
            .optional(),

        otherPrimarySpecialty: Joi.string().trim().max(100).optional().allow(""),

        institution: Joi.string().trim().min(2).max(200).optional(),

        department: Joi.string().trim().max(100).optional().allow(""),

        orcid: Joi.string()
            .pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
            .optional()
            .allow("")
            .messages({
                "string.pattern.base": "ORCID must be in format 0000-0000-0000-0000",
            }),

        phoneCode: Joi.string()
            .pattern(/^\+[1-9]\d{0,3}$/)
            .optional()
            .messages({
                "string.pattern.base": "Phone code must be in format +XX or +XXX",
            }),

        mobileNumber: Joi.string()
            .pattern(/^[0-9]{7,15}$/)
            .optional()
            .messages({
                "string.pattern.base": "Mobile number must be between 7 and 15 digits",
            }),

        address: Joi.object({
            street: Joi.string().trim().max(100).optional(),
            city: Joi.string().trim().max(100).optional(),
            state: Joi.string().trim().max(100).optional(),
            country: Joi.string().trim().max(100).optional(),
            postalCode: Joi.string()
                .trim()
                .pattern(/^[a-zA-Z0-9\s-]{3,10}$/)
                .optional()
                .messages({
                    "string.pattern.base": "Please provide a valid postal code",
                }),
        }).optional(),

        status: Joi.string()
            .valid("ACTIVE", "INACTIVE", "SUSPENDED")
            .optional()
            .messages({
                "any.only": "Status must be one of: ACTIVE, INACTIVE, SUSPENDED",
            }),
    })
        .min(1)
        .messages({
            "object.min": "At least one field must be provided for update",
        }),
};

// ================================================
// GET USER BY ID
// ================================================

export const getUserByIdSchema = {
    params: Joi.object({
        userId: objectIdField("User ID"),
    }),
};

// ================================================
// LIST ALL USERS (WITH FILTERS)
// ================================================

export const listUsersSchema = {
    query: Joi.object({
        role: Joi.string()
            .valid("USER", "EDITOR", "TECHNICAL_EDITOR", "REVIEWER", "ADMIN")
            .optional(),

        status: Joi.string()
            .valid("ACTIVE", "INACTIVE", "SUSPENDED")
            .optional(),

        isEmailVerified: Joi.boolean().optional(),

        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(100).default(20).optional(),
        sortBy: Joi.string()
            .valid("createdAt", "firstName", "lastName", "email", "role")
            .default("createdAt")
            .optional(),
        sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
        search: Joi.string().trim().min(2).max(100).optional(),
    }),
};

// ================================================
// UPDATE USER STATUS (SUSPEND/ACTIVATE)
// ================================================

export const updateUserStatusSchema = {
    params: Joi.object({
        userId: objectIdField("User ID"),
    }),

    body: Joi.object({
        status: Joi.string()
            .valid("ACTIVE", "INACTIVE", "SUSPENDED")
            .required()
            .messages({
                "any.only": "Status must be one of: ACTIVE, INACTIVE, SUSPENDED",
                "any.required": "Status is required",
            }),

        reason: Joi.string()
            .trim()
            .min(10)
            .max(500)
            .optional()
            .allow("")
            .messages({
                "string.min": "Reason must be at least 10 characters",
                "string.max": "Reason cannot exceed 500 characters",
            }),
    }),
};
