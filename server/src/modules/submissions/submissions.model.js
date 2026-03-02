import { Schema, model } from "mongoose";
import crypto from "crypto";
import mongoose from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION SCHEMA - FINAL VERSION WITH CONSENT TRACKING
 * ════════════════════════════════════════════════════════════════
 * 
 * UPDATES:
 * - Author fetched from login email
 * - Co-authors: user ref (null until registration if outside)
 * - isCorresponding flag on author + co-authors  
 * - Updated status flow (DRAFT → SUBMITTED → UNDER_REVIEW → ...)
 * - Added paymentStatus (changed by editor)
 * - Suggested reviewers: same pattern as co-authors
 * - Revision tracking fields added
 * - Suggested reviewer responses tracking
 * - CO-AUTHOR CONSENT TRACKING (Production-grade with audit trail)
 * ════════════════════════════════════════════════════════════════
 */

const submissionSchema = new Schema(
    {
        // ══════════════════════════════════════════════════════════
        // STEP 3: BASIC INFORMATION
        // ══════════════════════════════════════════════════════════

        articleType: {
            type: String,
            enum: {
                values: [
                    "Original Article",
                    "Case Report",
                    "Case Series",
                    "Meta-Analysis",
                    "Review Article / Systematic Review",
                    "Editorial",
                    "Clinical Trial"
                ],
                message: "{VALUE} is not a valid article type",
            },
            required: [true, "Article type is required"],
            index: true,
        },

        title: {
            type: String,
            required: [true, "Article title is required"],
            trim: true,
            minlength: [10, "Title must be at least 10 characters"],
            maxlength: [500, "Title cannot exceed 500 characters"],
            index: true,
        },

        runningTitle: {
            type: String,
            required: [true, "Running title is required"],
            trim: true,
            maxlength: [50, "Running title cannot exceed 50 characters"],
        },

        abstract: {
            type: String,
            required: [true, "Abstract is required"],
            trim: true,
            maxlength: [2500, "Abstract cannot exceed 250 words"],
        },

        manuscriptDetails: {
            wordCount: {
                type: Number,
                required: [true, "Word count is required"],
                min: [0, "Word count cannot be negative"],
            },
            numberOfBlackAndWhiteFigures: {
                type: Number,
                default: 0,
                min: [0, "Number cannot be negative"],
            },
            numberOfColorFigures: {
                type: Number,
                default: 0,
                min: [0, "Number cannot be negative"],
            },
            numberOfTables: {
                type: Number,
                default: 0,
                min: [0, "Number cannot be negative"],
            },
            numberOfPages: {
                type: Number,
                required: [true, "Number of pages is required"],
                min: [1, "Pages must be at least 1"],
            },
        },

        keywords: {
            type: [String],
            required: [true, "At least 3 keywords are required"],
            validate: {
                validator: function (keywords) {
                    return keywords && keywords.length >= 3 && keywords.length <= 6;
                },
                message: "Please provide 3-6 keywords",
            },
        },

        // Conditional Registration Numbers
        iecApproval: {
            hasIEC: { type: Boolean, default: false },
            iecNumber: { type: String, trim: true },
            iecDetails: { type: String, trim: true, maxlength: 1000 },
        },

        prosperoRegistration: {
            hasProspero: { type: Boolean, default: false },
            prosperoNumber: { type: String, trim: true },
            prosperoDetails: { type: String, trim: true, maxlength: 1000 },
        },

        trialRegistration: {
            hasTrial: { type: Boolean, default: false },
            trialNumber: { type: String, trim: true },
            trialDetails: { type: String, trim: true, maxlength: 1000 },
        },

        // ══════════════════════════════════════════════════════════
        // STEP 4: AUTHORSHIP
        // ══════════════════════════════════════════════════════════

        // Main Author (who submits) - fetched from login email
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
            index: true,
        },

        // Is main author the corresponding author? (checkbox ticked)
        isCorrespondingAuthor: {
            type: Boolean,
            default: false,
        },

        // Co-Authors
        coAuthors: [{
            // Reference to User (null if outside co-author until registration)
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            // Manual entry fields (required for outside co-authors)
            title: {
                type: String,
                enum: ["Dr.", "Prof.", "Mr.", "Mrs."],
                required: true,
            },
            firstName: {
                type: String,
                required: true,
                trim: true,
            },
            lastName: {
                type: String,
                required: true,
                trim: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
            phoneNumber: {
                type: String,
                required: true,
                trim: true,
            },
            department: {
                type: String,
                required: true,
                trim: true,
            },
            country: {
                type: String,
                required: true,
                trim: true,
            },
            orcid: {
                type: String,
                trim: true,
                match: [/^\d{4}-\d{4}-\d{4}-\d{4}$/, "Invalid ORCID format"],
            },

            // Author order
            order: {
                type: Number,
                required: true,
                min: 1,
            },

            // Is this co-author the corresponding author?
            isCorresponding: {
                type: Boolean,
                default: false,
            },

            // Consent tracking
            consentStatus: {
                type: String,
                enum: ["PENDING", "ACCEPTED", "REJECTED"],
                default: "PENDING",
            },
            consentDate: Date,
            consentToken: { type: String, select: false },
            consentTokenExpires: { type: Date, select: false },

            // Source tracking
            source: {
                type: String,
                enum: ["DATABASE_SEARCH", "MANUAL_ENTRY"],
                default: "MANUAL_ENTRY",
            },
        }],

        // ══════════════════════════════════════════════════════════
        // SUBMISSION STATUS & WORKFLOW
        // ══════════════════════════════════════════════════════════

        // Submitter Role Type (Manuscript Submission Login)
        submitterRoleType: {
            type: String,
            enum: {
                values: ["Author", "Editor", "Technical Editor", "Reviewer"],
                message: "{VALUE} is not a valid submitter role type",
            },
            required: [true, "Submitter role type is required"],
            index: true,
        },

        // ══════════════════════════════════════════════════════════
        // CO-AUTHOR CONSENT TRACKING (PRODUCTION-GRADE)
        // ══════════════════════════════════════════════════════════

        consentDeadlineStatus: {
            type: String,
            enum: {
                values: [
                    "ACTIVE",           // Waiting for consents (< 7 days)
                    "NOTIFIED",         // Author notified about rejection/no-response
                    "RESOLVED",         // Editor manually approved OR all accepted
                    "AUTO_REJECTED",    // Cron job auto-rejected after 7 days
                ],
                message: "{VALUE} is not a valid consent deadline status",
            },
            default: "ACTIVE",
            index: true,  // CRITICAL for cron job performance!
        },

        // Track which co-authors have consent issues (for audit trail & emails)
        consentIssues: [{
            coAuthorId: {
                type: Schema.Types.ObjectId,
                // NOTE: References submission.coAuthors[X]._id (subdocument ID)
                // This is NOT a ref to User collection
            },
            coAuthorEmail: {
                type: String,
                required: true,
                trim: true,
                // Denormalized from coAuthors array for performance
                // Allows quick access without searching through array
            },
            coAuthorName: {
                type: String,
                required: true,
                trim: true,
                // Denormalized from coAuthors firstName + lastName
                // Used for display in emails and audit logs
            },
            issueType: {
                type: String,
                enum: ["REJECTED", "NO_RESPONSE"],
                required: true,
                // REJECTED = co-author actively clicked "Reject" button
                // NO_RESPONSE = never responded within 7 days
            },
            reportedAt: {
                type: Date,
                required: true,
                default: Date.now,
            },

            // Editor resolution tracking (optional - only if manually resolved)
            resolvedAt: Date,
            resolvedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",  // Editor who manually approved
            },
            resolutionNote: {
                type: String,
                trim: true,
                maxlength: 1000,
                // OPTIONAL: Editor explains why they approved despite rejection
                // Example: "Author confirmed offline discussion resolved concerns"
            },
        }],

        // ══════════════════════════════════════════════════════════
        // REVISION TRACKING FIELDS
        // ══════════════════════════════════════════════════════════

        // Link to original submission (for revisions)
        originalSubmissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            index: true,
        },

        // Is this a revision or a new submission?
        isRevision: {
            type: Boolean,
            default: false,
            index: true,
        },

        // Which revision stage is this? (for tracking workflow)
        revisionStage: {
            type: String,
            enum: {
                values: [
                    "INITIAL_SUBMISSION",       // Author's first submission
                    "EDITOR_TO_TECH_EDITOR",    // Editor → Technical Editor
                    "TECH_EDITOR_TO_EDITOR",    // Technical Editor → Editor
                    "EDITOR_TO_REVIEWER",       // Editor → Reviewer
                    "REVIEWER_TO_EDITOR",       // Reviewer → Editor
                    "EDITOR_TO_AUTHOR",         // Editor → Author (revision request)
                    "AUTHOR_REVISION",          // Author resubmitting after revision request
                ],
                message: "{VALUE} is not a valid revision stage",
            },
            default: "INITIAL_SUBMISSION",
        },

        // Track suggested reviewer responses (this is submission-level, not cycle-level)
        suggestedReviewerResponses: {
            totalSuggested: { type: Number, default: 0 },
            accepted: { type: Number, default: 0 },
            declined: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            majorityMet: { type: Boolean, default: false },
        },

        // ══════════════════════════════════════════════════════════
        // SUBMISSION METADATA
        // ══════════════════════════════════════════════════════════

        submissionNumber: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        // Current active cycle reference
        currentCycleId: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            index: true,
        },

        status: {
            type: String,
            enum: {
                values: [
                    "DRAFT",                      // Submitted but consent not approved from all co-authors
                    "SUBMITTED",                  // Submitted and consent approved
                    "UNDER_REVIEW",               // Editor started working on it
                    "REVISION_REQUESTED",         // Revision requested
                    "PROVISIONALLY_ACCEPTED",     // Payment due
                    "ACCEPTED",                   // Accepted
                    "REJECTED",                   // Rejected
                ],
                message: "{VALUE} is not a valid status",
            },
            default: "DRAFT",
            required: true,
            index: true,
        },

        // ══════════════════════════════════════════════════════════
        // PAYMENT STATUS (Changed by editor)
        // ══════════════════════════════════════════════════════════

        paymentStatus: {
            type: Boolean,
            default: false,
        },

        // ══════════════════════════════════════════════════════════
        // STEP 2: FILES (MVP - BASE64 STORAGE)
        // ══════════════════════════════════════════════════════════

        coverLetter: {
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            mimeType: String,
            uploadedAt: Date,
            isTemporary: { type: Boolean, default: true },
        },

        blindManuscriptFile: {
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            mimeType: String,
            uploadedAt: Date,
            isTemporary: { type: Boolean, default: true },
        },

        figures: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            mimeType: String,
            uploadedAt: Date,
            isTemporary: { type: Boolean, default: true },
        }],

        tables: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            mimeType: String,
            uploadedAt: Date,
            isTemporary: { type: Boolean, default: true },
        }],

        supplementaryFiles: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            mimeType: String,
            description: String,
            uploadedAt: Date,
            isTemporary: { type: Boolean, default: true },
        }],

        // ══════════════════════════════════════════════════════════
        // STEP 1: CHECKLIST
        // ══════════════════════════════════════════════════════════

        checklist: {
            checklistVersion: {
                type: String,
                default: "1.0.0",
            },
            responses: [{
                questionId: { type: String, required: true },
                categoryId: { type: String, required: true },
                response: {
                    type: String,
                    enum: ["YES", "NO", "N/A"],
                    required: true,
                },
            }],
            copeCompliance: { type: Boolean },
            completedAt: Date,
        },

        // ══════════════════════════════════════════════════════════
        // STEP 5: REVIEWER SUGGESTIONS (Same pattern as co-authors)
        // ══════════════════════════════════════════════════════════

        suggestedReviewers: [{
            // Reference to User (null if outside reviewer until registration)
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            // Manual entry fields
            title: {
                type: String,
                enum: ["Dr.", "Prof.", "Mr.", "Mrs."],
                required: true,
            },
            firstName: {
                type: String,
                required: true,
                trim: true,
            },
            lastName: {
                type: String,
                required: true,
                trim: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
            specialization: {
                type: String,
                required: true,
                trim: true,
            },
            institution: {
                type: String,
                required: true,
                trim: true,
            },
            country: {
                type: String,
                required: true,
                trim: true,
            },

            // Source tracking
            source: {
                type: String,
                enum: ["DATABASE_SEARCH", "MANUAL_ENTRY"],
                default: "MANUAL_ENTRY",
            },

            // Invitation tracking
            invitationStatus: {
                type: String,
                enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"],
                default: "PENDING",
            },
            invitationToken: { type: String, select: false },
            invitationTokenExpires: { type: Date, select: false },
            invitationSentAt: Date,
            invitationRespondedAt: Date,

            // Editor approval flag (simple boolean)
            editorApproved: {
                type: Boolean,
                default: false,
            },
        }],

        // ══════════════════════════════════════════════════════════
        // STEP 5: DECLARATIONS
        // ══════════════════════════════════════════════════════════

        conflictOfInterest: {
            hasConflict: { type: Boolean },
            details: { type: String, trim: true, maxlength: 2000 },
        },

        copyrightAgreement: {
            accepted: { type: Boolean },
            acceptedAt: Date,
            ipAddress: String,
        },

        pdfPreviewConfirmed: { type: Boolean, default: false },

        // ══════════════════════════════════════════════════════════
        // ASSIGNMENT TRACKING
        // ══════════════════════════════════════════════════════════

        assignedEditor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        assignedEditorDate: Date,

        assignedTechnicalEditors: [{
            technicalEditor: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            assignedDate: Date,
            status: {
                type: String,
                enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
                default: "PENDING",
            },
        }],

        assignedReviewers: [{
            reviewer: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            assignedDate: Date,
            dueDate: Date,
            status: {
                type: String,
                enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
                default: "PENDING",
            },
            isAnonymous: {
                type: Boolean,
                default: true,
            },
        }],

        // ══════════════════════════════════════════════════════════
        // DATES
        // ══════════════════════════════════════════════════════════

        submittedAt: { type: Date, index: true },
        lastModifiedAt: { type: Date, default: Date.now },
        acceptedAt: Date,
        rejectedAt: Date,

        // ══════════════════════════════════════════════════════════
        // INTERNAL NOTES
        // ══════════════════════════════════════════════════════════

        internalNotes: [{
            note: String,
            addedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            addedAt: {
                type: Date,
                default: Date.now,
            },
            isConfidential: {
                type: Boolean,
                default: true,
            },
        }],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.__v;

                if (ret.coAuthors) {
                    ret.coAuthors.forEach(ca => {
                        delete ca.consentToken;
                        delete ca.consentTokenExpires;
                    });
                }

                if (ret.suggestedReviewers) {
                    ret.suggestedReviewers.forEach(r => {
                        delete r.invitationToken;
                        delete r.invitationTokenExpires;
                    });
                }

                return ret;
            },
        },
    }
);

// ══════════════════════════════════════════════════════════════════
// INDEXES
// ══════════════════════════════════════════════════════════════════
submissionSchema.index({ author: 1, status: 1 });
submissionSchema.index({ assignedEditor: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ articleType: 1, status: 1 });
submissionSchema.index({ title: "text", abstract: "text", keywords: "text" });

// ══════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════

submissionSchema.pre("save", async function (next) {
    try {
        // 🔒 HARD LOCK AFTER SUBMISSION (production-grade)
        if (!this.isNew && this.status !== "DRAFT") {

            const modifiedFields = this.modifiedPaths();
            const isStatusChange = this.isModified("status");

            // 🟢 Allowed during DRAFT → SUBMITTED transition
            const submissionTransitionFields = [
                "checklist",
                "conflictOfInterest",
                "copyrightAgreement",
                "pdfPreviewConfirmed",
                "suggestedReviewers",
                "suggestedReviewerResponses",
                "consentDeadlineStatus",   // NEW
                "consentIssues",            // NEW
                "status",
                "submittedAt",
                "currentCycleId",
                "lastModifiedAt",
                "updatedAt"
            ];

            // 🟡 Allowed AFTER submission (editorial stage only)
            const postSubmissionAllowedFields = [
                "paymentStatus",
                "internalNotes",
                "assignedEditor",
                "assignedEditorDate",
                "assignedReviewers",
                "assignedTechnicalEditors",
                "acceptedAt",
                "rejectedAt",
                "consentDeadlineStatus",    // NEW
                "consentIssues",             // NEW
                "status",
                "lastModifiedAt",
                "updatedAt",
                "currentCycleId",
                "revisionStage",
            ];

            const allowedFields = isStatusChange
                ? submissionTransitionFields
                : postSubmissionAllowedFields;

            const illegalModification = modifiedFields.find(field =>
                !allowedFields.some(allowed => field.startsWith(allowed))
            );

            if (illegalModification) {
                throw new Error(
                    `Modification of field '${illegalModification}' is not allowed after submission`
                );
            }
        }

        // Generate submission number when moving from DRAFT to SUBMITTED
        if (this.isModified("status") && this.status === "SUBMITTED" && !this.submissionNumber) {
            const year = new Date().getFullYear();
            const count = await this.constructor.countDocuments({
                submissionNumber: { $regex: `^JAIRAM-${year}-` }
            });

            this.submissionNumber = `JAIRAM-${year}-${String(count + 1).padStart(4, '0')}`;
            this.submittedAt = new Date();
        }

        this.lastModifiedAt = new Date();

        if (this.coAuthors && this.coAuthors.length > 0) {
            this.coAuthors.sort((a, b) => a.order - b.order);
        }

        // Validate only ONE corresponding author
        const isMainCorresponding = this.isCorrespondingAuthor;
        const correspondingCoAuthors = this.coAuthors.filter(ca => ca.isCorresponding);

        if (isMainCorresponding && correspondingCoAuthors.length > 0) {
            throw new Error("Only one corresponding author allowed (either main author OR one co-author)");
        }

        if (correspondingCoAuthors.length > 1) {
            throw new Error("Only one co-author can be corresponding author");
        }

        // Validate isRevision requires originalSubmissionId
        if (this.isRevision && !this.originalSubmissionId) {
            throw new Error("originalSubmissionId is required for revisions");
        }

        // Validate submitterRoleType
        if (this.isNew && this.submitterRoleType) {
            if (!["Author", "Editor", "Technical Editor", "Reviewer"].includes(this.submitterRoleType)) {
                throw new Error("Invalid submitter role type");
            }
        }

    } catch (error) {
        throw new Error(error);
    }
});

// ══════════════════════════════════════════════════════════════════
// INSTANCE METHODS
// ══════════════════════════════════════════════════════════════════

submissionSchema.methods.canView = function (userId) {
    if (this.author.toString() === userId.toString()) return true;

    if (this.coAuthors.some(ca =>
        ca.user && ca.user.toString() === userId.toString() &&
        ca.consentStatus === "ACCEPTED"
    )) return true;

    if (this.assignedEditor && this.assignedEditor.toString() === userId.toString()) return true;

    if (this.assignedReviewers.some(r => r.reviewer.toString() === userId.toString())) return true;
    if (this.assignedTechnicalEditors.some(r => r.technicalEditor.toString() === userId.toString())) return true;

    return false;
};

submissionSchema.methods.canEdit = function (userId) {
    if (this.author.toString() !== userId.toString()) return false;
    const editableStatuses = ["DRAFT", "REVISION_REQUESTED"];
    return editableStatuses.includes(this.status);
};

submissionSchema.methods.generateCoAuthorConsentToken = function (coAuthorIndex) {
    const token = crypto.randomBytes(32).toString('hex');

    this.coAuthors[coAuthorIndex].consentToken = token;
    this.coAuthors[coAuthorIndex].consentTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return token;
};

submissionSchema.methods.verifyCoAuthorConsentToken = function (coAuthorIndex, token) {
    const coAuthor = this.coAuthors[coAuthorIndex];

    if (!coAuthor || !coAuthor.consentToken || !coAuthor.consentTokenExpires) {
        return false;
    }

    if (coAuthor.consentToken !== token) {
        return false;
    }

    if (coAuthor.consentTokenExpires < Date.now()) {
        return false;
    }

    return true;
};

submissionSchema.methods.generateReviewerInvitationToken = function (reviewerIndex) {
    const token = crypto.randomBytes(32).toString('hex');

    this.suggestedReviewers[reviewerIndex].invitationToken = token;
    this.suggestedReviewers[reviewerIndex].invitationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.suggestedReviewers[reviewerIndex].invitationSentAt = new Date();

    return token;
};

submissionSchema.methods.updateStatus = function (newStatus) {

    const validTransitions = {
        "DRAFT": ["SUBMITTED"],
        "SUBMITTED": ["UNDER_REVIEW"],
        "UNDER_REVIEW": ["REVISION_REQUESTED", "PROVISIONALLY_ACCEPTED", "REJECTED"],
        "REVISION_REQUESTED": ["SUBMITTED"],
        "PROVISIONALLY_ACCEPTED": ["ACCEPTED"],
        "ACCEPTED": [],
        "REJECTED": [],
    };

    const allowedTransitions = validTransitions[this.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    // 🔐 STRICT LEGAL ENFORCEMENT
    if (newStatus === "SUBMITTED") {

        // Checklist must exist
        if (!this.checklist) {
            throw new Error("Checklist is required before submission");
        }

        if (!this.checklist.copeCompliance) {
            throw new Error("COPE compliance certification is required");
        }

        if (!this.checklist.responses || this.checklist.responses.length === 0) {
            throw new Error("Checklist responses are required");
        }

        // Conflict of Interest must be declared (true OR false allowed)
        if (this.conflictOfInterest?.hasConflict === undefined) {
            throw new Error("Conflict of Interest declaration is required");
        }

        // Copyright must be accepted
        if (!this.copyrightAgreement?.accepted) {
            throw new Error("Copyright agreement must be accepted");
        }

        if (!this.copyrightAgreement?.acceptedAt) {
            throw new Error("Copyright acceptance timestamp missing");
        }

        // PDF confirmation required
        if (!this.pdfPreviewConfirmed) {
            throw new Error("PDF preview confirmation is required");
        }
    }

    this.status = newStatus;

    const dateFieldMap = {
        "SUBMITTED": "submittedAt",
        "ACCEPTED": "acceptedAt",
        "REJECTED": "rejectedAt",
    };

    if (dateFieldMap[newStatus]) {
        this[dateFieldMap[newStatus]] = new Date();
    }

    return this;
};

// Check if can move to review (minimum 2 approved)
submissionSchema.methods.canMoveToReview = function () {
    const approvedReviewers = this.suggestedReviewers.filter(r =>
        r.invitationStatus === "ACCEPTED" &&
        r.editorApproved === true
    );

    if (approvedReviewers.length < 2) {
        return {
            canMove: false,
            reason: "Minimum 2 approved reviewers required",
            current: approvedReviewers.length,
            required: 2
        };
    }

    return { canMove: true, approvedReviewers };
};

// Permission checks for viewing/editing based on role and relationship to submission
submissionSchema.methods.isUserAuthor = function (userId) {
    return this.author.toString() === userId.toString();
};

submissionSchema.methods.isUserCoAuthor = function (userId) {
    return this.coAuthors.some(ca =>
        ca.user &&
        ca.user.toString() === userId.toString() &&
        ca.consentStatus === "ACCEPTED"
    );
};

submissionSchema.methods.canUserView = function (userId, userRole) {
    // Admin and Editor can view all
    if (userRole === "ADMIN" || userRole === "EDITOR") return true;

    // Author can view
    if (this.isUserAuthor(userId)) return true;

    // Accepted co-authors can view
    if (this.isUserCoAuthor(userId)) return true;

    // Assigned reviewers/technical editors can view
    if (this.assignedReviewers.some(r => r.reviewer.toString() === userId)) return true;
    if (this.assignedTechnicalEditors.some(r => r.technicalEditor.toString() === userId)) return true;

    return false;
};

// ══════════════════════════════════════════════════════════════════
// NEW METHODS FOR DECISION TRACKING (Query-based from SubmissionCycle)
// ══════════════════════════════════════════════════════════════════

// Check Editor decision count across ALL cycles
submissionSchema.methods.getEditorDecisionCount = async function () {
    const SubmissionCycle = mongoose.model("SubmissionCycle");

    const cycles = await SubmissionCycle.find({
        submissionId: this._id,
        "editorDecision.type": { $in: ["ACCEPT", "REJECT"] }
    });

    return {
        totalDecisions: cycles.length,
        decisionsRemaining: 4 - cycles.length,
        canDecide: cycles.length < 4,
    };
};

// Check if Technical Editor has decided
submissionSchema.methods.hasTechnicalEditorDecided = async function () {
    const SubmissionCycle = mongoose.model("SubmissionCycle");

    const cycle = await SubmissionCycle.findOne({
        submissionId: this._id,
        "technicalEditorReview.decision": { $exists: true }
    });

    return {
        hasDecided: !!cycle,
        decision: cycle?.technicalEditorReview?.decision,
        cycleNumber: cycle?.cycleNumber,
    };
};

// Get complete decision history
submissionSchema.methods.getDecisionHistory = async function () {
    const SubmissionCycle = mongoose.model("SubmissionCycle");

    const cycles = await SubmissionCycle.find({ submissionId: this._id })
        .sort({ cycleNumber: 1 })
        .populate("technicalEditorReview.reviewedBy", "firstName lastName")
        .populate("reviewerFeedback.reviewer", "firstName lastName");

    return cycles.map(cycle => ({
        cycleNumber: cycle.cycleNumber,
        editorDecision: cycle.editorDecision,
        technicalEditorReview: cycle.technicalEditorReview,
        reviewerFeedback: cycle.reviewerFeedback,
        status: cycle.status,
    }));
};

// Check co-author consent status
submissionSchema.methods.checkCoAuthorConsent = function () {
    if (!this.coAuthors || this.coAuthors.length === 0) {
        return { allAccepted: true, canProceed: true, message: "No co-authors to approve" };
    }

    const rejected = this.coAuthors.filter(ca => ca.consentStatus === "REJECTED");
    const pending = this.coAuthors.filter(ca => ca.consentStatus === "PENDING");
    const accepted = this.coAuthors.filter(ca => ca.consentStatus === "ACCEPTED");

    if (rejected.length > 0) {
        return {
            allAccepted: false,
            canProceed: false,
            message: `${rejected.length} co-author(s) rejected consent. Submission cannot proceed.`,
            rejected: rejected.map(ca => ({ name: `${ca.firstName} ${ca.lastName}`, email: ca.email })),
        };
    }

    if (pending.length > 0) {
        return {
            allAccepted: false,
            canProceed: false,
            message: `Waiting for ${pending.length} co-author(s) to respond.`,
            pending: pending.map(ca => ({ name: `${ca.firstName} ${ca.lastName}`, email: ca.email })),
        };
    }

    return {
        allAccepted: true,
        canProceed: true,
        message: "All co-authors have accepted consent",
    };
};

// Check suggested reviewer majority
submissionSchema.methods.checkReviewerMajority = function () {
    const total = this.suggestedReviewerResponses.totalSuggested;
    const accepted = this.suggestedReviewerResponses.accepted;
    const declined = this.suggestedReviewerResponses.declined;
    const pending = this.suggestedReviewerResponses.pending;

    if (total === 0) {
        return {
            majorityMet: false,
            message: "No reviewers suggested",
        };
    }

    // Majority rule: More than 50% must accept
    const requiredAcceptances = Math.ceil(total / 2);

    if (accepted >= requiredAcceptances) {
        return {
            majorityMet: true,
            message: `Majority achieved: ${accepted}/${total} reviewers accepted`,
            accepted,
            total,
        };
    }

    // Check if majority is still possible
    const maxPossibleAcceptances = accepted + pending;

    if (maxPossibleAcceptances < requiredAcceptances) {
        return {
            majorityMet: false,
            cannotReachMajority: true,
            message: `Cannot reach majority: Only ${maxPossibleAcceptances}/${total} can accept, need ${requiredAcceptances}`,
        };
    }

    return {
        majorityMet: false,
        message: `Waiting for more responses: ${accepted}/${total} accepted, need ${requiredAcceptances}`,
        accepted,
        total,
        pending,
    };
};

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════

submissionSchema.statics.findByAuthor = async function (authorId, options = {}) {
    const query = { author: authorId };

    if (!options.includeDrafts) {
        query.status = { $ne: "DRAFT" };
    }

    return this.find(query)
        .populate("author", "firstName lastName email")
        .populate("assignedEditor", "firstName lastName email")
        .sort({ submittedAt: -1 });
};

const Submission = model("Submission", submissionSchema);

console.log("📦 [SUBMISSION-MODEL] Submission model created and exported");

export { Submission };