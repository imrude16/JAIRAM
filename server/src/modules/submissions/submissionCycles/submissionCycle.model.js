import { Schema, model } from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION CYCLE SCHEMA - UPDATED WITH DECISION TRACKING
 * ════════════════════════════════════════════════════════════════
 * 
 * Tracks each revision cycle of a manuscript submission
 * Stores editor decisions, technical editor reviews, and reviewer feedback
 * 
 * CHANGES:
 * - Enhanced editorDecision with decisionNumber and decisionStage
 * - Added technicalEditorReview for Technical Editor decisions
 * - Added reviewerFeedback array for multiple reviewer comments
 * ════════════════════════════════════════════════════════════════
 */

const submissionCycleSchema = new Schema(
    {
        // ══════════════════════════════════════════════════════════
        // CORE REFERENCES
        // ══════════════════════════════════════════════════════════

        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: [true, "Submission ID is required"],
            index: true,
        },

        cycleNumber: {
            type: Number,
            required: [true, "Cycle number is required"],
            min: [1, "Cycle number must be at least 1"],
            default: 1,
        },

        // ══════════════════════════════════════════════════════════
        // MANUSCRIPT VERSION REFERENCE
        // ══════════════════════════════════════════════════════════

        manuscriptVersionId: {
            type: Schema.Types.ObjectId,
            ref: "ManuscriptVersion",
            index: true,
        },

        // ══════════════════════════════════════════════════════════
        // ASSIGNED PERSONNEL
        // ══════════════════════════════════════════════════════════

        technicalEditorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        reviewersId: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],

        // ══════════════════════════════════════════════════════════════
        // EDITOR REMARKS TO TECHNICAL EDITOR/REVIEWERS (NEW)
        // ══════════════════════════════════════════════════════════════

        editorRemarksForTechEditor: {
            remarks: {
                type: String,
                trim: true,
                maxlength: 2000,
            },
            attachments: [{
                fileName: String,
                fileUrl: String,
            }],
            sentAt: Date,
        },

        editorRemarksForReviewers: {
            remarks: {
                type: String,
                trim: true,
                maxlength: 2000,
            },
            attachments: [{
                fileName: String,
                fileUrl: String,
            }],
            sentAt: Date,
        },

        // ══════════════════════════════════════════════════════════
        // EDITOR DECISION (ENHANCED)
        // ══════════════════════════════════════════════════════════

        editorDecision: {
            type: {
                type: String,
                enum: {
                    values: ["REVISION", "ACCEPT", "REJECT"],
                    message: "{VALUE} is not a valid decision type",
                },
            },
            reason: {
                type: String,
                trim: true,
                maxlength: 2000,
            },
            decidedAt: Date,

            // NEW: Track which decision number this is (1st, 2nd, 3rd, 4th)
            decisionNumber: {
                type: Number,
                min: 1,
                max: 4,  // Editor gets max 4 chances
            },

            // NEW: Which stage was this decision made at?
            decisionStage: {
                type: String,
                enum: [
                    "INITIAL_SCREENING",
                    "POST_TECH_EDITOR",
                    "POST_REVIEWER",
                    "FINAL_DECISION",
                ],
            },
        },

        // ══════════════════════════════════════════════════════════
        // TECHNICAL EDITOR REVIEW (NEW)
        // ══════════════════════════════════════════════════════════

        technicalEditorReview: {
            reviewedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            decision: {
                type: String,
                enum: ["ACCEPT", "REJECT"],
            },
            remarks: {
                type: String,
                trim: true,
                maxlength: 5000,
            },
            attachmentRefs: [{
                type: String,
                trim: true,
            }],
            reviewedAt: Date,
        },

        // ══════════════════════════════════════════════════════════
        // REVIEWER FEEDBACK (NEW)
        // ══════════════════════════════════════════════════════════

        reviewerFeedback: [{
            reviewer: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            remarks: {
                type: String,
                trim: true,
                maxlength: 5000,
            },
            attachmentRefs: [{
                type: String,
                trim: true,
            }],
            reviewedAt: Date,
        }],

        // ══════════════════════════════════════════════════════════
        // STATUS TRACKING
        // ══════════════════════════════════════════════════════════

        status: {
            type: String,
            enum: {
                values: [
                    "IN_PROGRESS",
                    "COMPLETED",
                    "REVISION_REQUESTED",
                ],
                message: "{VALUE} is not a valid status",
            },
            default: "IN_PROGRESS",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ══════════════════════════════════════════════════════════════════
// INDEXES
// ══════════════════════════════════════════════════════════════════
submissionCycleSchema.index({ submissionId: 1, cycleNumber: 1 }, { unique: true });
submissionCycleSchema.index({ technicalEditorId: 1 });
submissionCycleSchema.index({ reviewersId: 1 });

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════

submissionCycleSchema.statics.findBySubmission = async function (submissionId) {
    return this.find({ submissionId })
        .populate("technicalEditorId", "firstName lastName email")
        .populate("reviewersId", "firstName lastName email")
        .populate("technicalEditorReview.reviewedBy", "firstName lastName email")
        .populate("reviewerFeedback.reviewer", "firstName lastName email")
        .populate("manuscriptVersionId")
        .sort({ cycleNumber: 1 });
};

submissionCycleSchema.statics.getCurrentCycle = async function (submissionId) {
    return this.findOne({ submissionId })
        .sort({ cycleNumber: -1 })
        .populate("technicalEditorId", "firstName lastName email")
        .populate("reviewersId", "firstName lastName email")
        .populate("technicalEditorReview.reviewedBy", "firstName lastName email")
        .populate("reviewerFeedback.reviewer", "firstName lastName email")
        .populate("manuscriptVersionId");
};

const SubmissionCycle = model("SubmissionCycle", submissionCycleSchema);

console.log("📦 [SUBMISSION-CYCLE-MODEL] SubmissionCycle model created and exported");

export { SubmissionCycle };