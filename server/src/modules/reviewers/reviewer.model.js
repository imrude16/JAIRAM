import { Schema, model } from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER SCHEMA
 * ════════════════════════════════════════════════════════════════
 *
 * ONE document per Submission (created at SUBMIT time)
 *
 * RESPONSIBILITIES:
 * - Tracks assignedReviewers (moved from Submission schema)
 * - Tracks reviewerFeedback (moved from SubmissionCycle schema)
 *
 * WHY SEPARATE COLLECTION:
 * - Submission schema is immutable after SUBMITTED status
 * - assignedReviewers can change across cycles (editor may swap reviewers)
 * - reviewerFeedback accumulates over time
 * - Keeping them here allows mutation without touching Submission
 *
 * LIFECYCLE:
 * - Created at: submitManuscript() — same time as initial SubmissionCycle
 * - assignedReviewers: populated by assignReviewers() / moveToReview()
 * - reviewerFeedback: populated by submitRevision() REVIEWER_TO_EDITOR stage
 * - cycleId: always points to the CURRENT active cycle
 *
 * REVIEWER FEEDBACK FLOW (matches UI Step 1 + Step 2):
 *
 * Step 1 — Evaluation Checklist (19 items):
 *   reviewerChecklist.responses[] — structured responses per questionId
 *
 * Step 2 — Comments & Submission:
 *   commentsForAuthor    → "Comments for Author" textarea (visible to author)
 *   confidentialToEditor → "Confidential Letter for Editor" (editor only)
 *   recommendation       → Accept / Minor Revision / Major Revision / Reject
 *   revisedManuscript    → Word doc — reviewed manuscript with tracked changes
 *   responseToEditorComments → Word doc — point-by-point response to editor
 * ════════════════════════════════════════════════════════════════
 */

const reviewerSchema = new Schema(
    {
        // ══════════════════════════════════════════════════════════
        // CORE REFERENCES
        // ══════════════════════════════════════════════════════════

        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: [true, "Submission ID is required"],
            unique: true,       // One Reviewer document per Submission
            index: true,
        },

        cycleId: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            required: [true, "Cycle ID is required"],
            // NOTE: Updates to point to latest active cycle
            // as manuscript progresses through multiple review rounds
        },

        // ══════════════════════════════════════════════════════════
        // ASSIGNED REVIEWERS
        // (Moved from Submission schema)
        //
        // suggestedReviewers = Author proposed (immutable after SUBMIT)
        // assignedReviewers  = Editor approved + assigned (mutable)
        // ══════════════════════════════════════════════════════════

        assignedReviewers: [
            {
                _id: false,

                reviewer: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                assignedDate: {
                    type: Date,
                    default: Date.now,
                },

                status: {
                    type: String,
                    enum: {
                        values: ["PENDING", "ACCEPT", "REJECT"],
                        message: "{VALUE} is not a valid reviewer status",
                    },
                    default: "PENDING",
                },

                respondedAt: {
                    type: Date,
                    default: null,
                },

                rejectionReason: {
                    type: String,
                    trim: true,
                    maxlength: [1000, "Rejection reason cannot exceed 1000 characters"],
                    default: null,
                },

                isAnonymous: {
                    type: Boolean,
                    default: true,
                },
            },
        ],

        // ══════════════════════════════════════════════════════════
        // REVIEWER FEEDBACK
        // (Moved from SubmissionCycle schema)
        //
        // One entry per reviewer per cycle.
        // Populated when reviewer submits via:
        // submitRevision() → revisionStage: "REVIEWER_TO_EDITOR"
        //
        // user: ObjectId from submission.suggestedReviewers[].user
        //       null if MANUAL_ENTRY reviewer never registered
        // email: always present as fallback identifier
        // ══════════════════════════════════════════════════════════

        reviewerFeedback: [
            {
                _id: false,

                // ── REVIEWER IDENTITY ─────────────────────────────

                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },

                email: {
                    type: String,
                    required: [true, "Reviewer email is required for feedback"],
                    lowercase: true,
                    trim: true,
                },

                // ── STEP 1: REVIEWER CHECKLIST ────────────────────
                //
                // Structured responses from UI Step 1 (19 items total)
                // Mirrors REVIEWER_CHECKLIST_V1_0_0 structure
                //
                // response value type depends on sectionId:
                //   REVIEWER_DECLARATION          → Boolean (true = checked)
                //   SCOPE_AND_ORIGINALITY         → "EXCELLENT"|"GOOD"|"FAIR"|"POOR"
                //   METHODOLOGICAL_RIGOR          → "ADEQUATE"|"NEEDS_REVISION"|"INADEQUATE"
                //   RESULTS_AND_INTERPRETATION    → "ADEQUATE"|"NEEDS_REVISION"|"INADEQUATE"
                //   PUBLICATION_ETHICS_COMPLIANCE → "YES"|"NO"|"CONCERN"
                //   LANGUAGE_AND_PRESENTATION     → Boolean (true = selected, only one is true)
                //
                reviewerChecklist: {
                    checklistVersion: {
                        type: String,
                        default: "1.0.0",
                    },
                    responses: [
                        {
                            _id: false,
                            questionId: {
                                type: String,
                                required: true,
                                // RD_001..004, SQ_001..003, MR_001..004,
                                // RI_001..004, PE_001..003, LP_001..003
                            },
                            sectionId: {
                                type: String,
                                required: true,
                            },
                            // Mixed: Boolean for checkboxes, String for radio options
                            response: {
                                type: Schema.Types.Mixed,
                                required: true,
                            },
                        },
                    ],
                    completedAt: Date,
                },

                // ── STEP 2: COMMENTS & SUBMISSION ─────────────────

                // "Comments for Author" textarea
                // Constructive feedback visible to the author after review
                remarks: {
                    type: String,
                    trim: true,
                    maxlength: [10000, "Remarks for author cannot exceed 10000 characters"],
                },

                // "Confidential Letter for Editor" textarea
                // Private observations/concerns — NEVER shown to author
                // Only the Editor can see this
                confidentialToEditor: {
                    type: String,
                    trim: true,
                    maxlength: [10000, "Confidential letter cannot exceed 10000 characters"],
                },

                // ── RECOMMENDATION ────────────────────────────────
                // Overall recommendation from reviewer
                recommendation: {
                    type: String,
                    enum: {
                        values: ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"],
                        message: "{VALUE} is not a valid recommendation",
                    },
                    required: [true, "Recommendation is required"],
                },

                // ── FILE UPLOADS ──────────────────────────────────

                // "Revised Manuscript" — Word doc
                // The manuscript file with reviewer's tracked changes/annotations
                // This is the Editor's sent manuscript, returned with reviewer comments
                revisedManuscript: {
                    fileName: String,
                    fileUrl: String,
                    fileSize: Number,
                    mimeType: String,
                    uploadedAt: Date,
                },

                // "Response to Editor's Comments" — Word doc
                // Separate document: reviewer's point-by-point response
                // to comments the Editor left inside the manuscript file
                responseToEditorComments: {
                    fileName: String,
                    fileUrl: String,
                    fileSize: Number,
                    mimeType: String,
                    uploadedAt: Date,
                },

                // ── TIMESTAMP ─────────────────────────────────────
                reviewedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
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

// For permission checks — "is this user an assigned reviewer?"
reviewerSchema.index({ submissionId: 1, "assignedReviewers.reviewer": 1 });

// For listSubmissions REVIEWER role — find all submissions assigned to a reviewer
reviewerSchema.index({ "assignedReviewers.reviewer": 1 });

// For cycleId lookups
reviewerSchema.index({ cycleId: 1 });

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════

/**
 * Find reviewer document by submissionId
 * Most common query — used everywhere
 */
reviewerSchema.statics.findBySubmission = async function (submissionId) {
    return this.findOne({ submissionId })
        .populate("assignedReviewers.reviewer", "firstName lastName email")
        .populate("reviewerFeedback.user", "firstName lastName email");
};

/**
 * Find all submissionIds where a user is an assigned reviewer
 * Used in listSubmissions() for REVIEWER role
 */
reviewerSchema.statics.findSubmissionIdsByReviewer = async function (userId) {
    const docs = await this.find(
        { "assignedReviewers.reviewer": userId },
        { submissionId: 1 }
    ).lean();

    return docs.map((d) => d.submissionId);
};

/**
 * Check if a user is an assigned reviewer for a submission
 * Used in permission checks (Option B — isAssignedReviewer)
 */
reviewerSchema.statics.isAssignedReviewer = async function (submissionId, userId) {
    const doc = await this.findOne({
        submissionId,
        "assignedReviewers.reviewer": userId,
    });
    return !!doc;
};

const Reviewer = model("Reviewer", reviewerSchema);

console.log("📦 [REVIEWER-MODEL] Reviewer model created and exported");

export { Reviewer };
