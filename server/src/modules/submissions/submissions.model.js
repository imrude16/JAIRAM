import { Schema, model } from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION SCHEMA - FINAL UPDATED VERSION
 * ════════════════════════════════════════════════════════════════
 * 
 * UPDATES BASED ON CLARIFICATIONS:
 * - Author fetched from login email
 * - Co-authors: user ref (null until registration if outside)
 * - isCorresponding flag on author + co-authors  
 * - Updated status flow (DRAFT → SUBMITTED → UNDER_REVIEW → ...)
 * - Added paymentStatus (changed by editor)
 * - Suggested reviewers: same pattern as co-authors
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

        submissionNumber: {
            type: String,
            unique: true,
            sparse: true,
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
            copeCompliance: { type: Boolean },   //EDIT
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
            hasConflict: { type: Boolean },      //EDIT
            details: { type: String, trim: true, maxlength: 2000 },
        },

        copyrightAgreement: {
            accepted: { type: Boolean },   //EDIT
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
        // 🔒 HARD LOCK AFTER SUBMISSION (except status transition itself)
        if (!this.isNew && this.status !== "DRAFT") {

            const modifiedFields = this.modifiedPaths();

            const isStatusChange = this.isModified("status");

            const allowedFields = isStatusChange
                ? [
                    "status",
                    "acceptedAt",
                    "rejectedAt",
                    "submittedAt",
                    "lastModifiedAt"
                ]
                : [
                    "paymentStatus",
                    "internalNotes",
                    "assignedEditor",
                    "assignedEditorDate",
                    "assignedReviewers",
                    "assignedTechnicalEditors",
                    "lastModifiedAt"
                ];

            const illegalModification = modifiedFields.find(
                field => !allowedFields.some(allowed => field.startsWith(allowed))
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

    } catch (error) {
        next(error);
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
    const crypto = require('crypto');
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
    const crypto = require('crypto');
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