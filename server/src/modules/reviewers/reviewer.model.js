import { Schema, model } from "mongoose";

const reviewerSchema = new Schema(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: [true, "Submission ID is required"],
            index: true,
        },

        cycleId: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            required: [true, "Cycle ID is required"],
        },

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

        reviewerFeedback: [
            {
                _id: false,

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
                            },
                            sectionId: {
                                type: String,
                                required: true,
                            },
                            response: {
                                type: Schema.Types.Mixed,
                                required: true,
                            },
                        },
                    ],
                    completedAt: Date,
                },

                remarks: {
                    type: String,
                    trim: true,
                    maxlength: [10000, "Remarks for author cannot exceed 10000 characters"],
                },

                confidentialToEditor: {
                    type: String,
                    trim: true,
                    maxlength: [10000, "Confidential letter cannot exceed 10000 characters"],
                },

                recommendation: {
                    type: String,
                    enum: {
                        values: ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"],
                        message: "{VALUE} is not a valid recommendation",
                    },
                    required: [true, "Recommendation is required"],
                },

                revisedManuscript: {
                    fileName: String,
                    fileUrl: String,
                    fileSize: Number,
                    mimeType: String,
                    uploadedAt: Date,
                },

                responseToEditorComments: {
                    fileName: String,
                    fileUrl: String,
                    fileSize: Number,
                    mimeType: String,
                    uploadedAt: Date,
                },

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

reviewerSchema.index({ submissionId: 1, cycleId: 1 }, { unique: true });
reviewerSchema.index({ submissionId: 1, cycleId: 1, "assignedReviewers.reviewer": 1 });
reviewerSchema.index({ "assignedReviewers.reviewer": 1 });
reviewerSchema.index({ cycleId: 1 });

reviewerSchema.statics.findBySubmission = function (submissionId) {
    return this.find({ submissionId })
        .sort({ createdAt: 1 })
        .populate("assignedReviewers.reviewer", "firstName lastName email")
        .populate("reviewerFeedback.user", "firstName lastName email");
};

reviewerSchema.statics.findByCycle = function (cycleId) {
    return this.findOne({ cycleId })
        .sort({ updatedAt: -1 })
        .populate("assignedReviewers.reviewer", "firstName lastName email")
        .populate("reviewerFeedback.user", "firstName lastName email");
};

reviewerSchema.statics.getCurrentCycleDoc = function (submissionId, cycleId) {
    return this.findOne({ submissionId, cycleId }).sort({ updatedAt: -1 });
};

reviewerSchema.statics.getCurrentCycleDocLean = function (submissionId, cycleId) {
    return this.findOne({ submissionId, cycleId }).sort({ updatedAt: -1 }).lean();
};

reviewerSchema.statics.findSubmissionIdsByReviewer = async function (userId) {
    const docs = await this.find(
        { "assignedReviewers.reviewer": userId },
        { submissionId: 1 }
    ).lean();

    return docs.map((doc) => doc.submissionId);
};

reviewerSchema.statics.isAssignedReviewer = async function (submissionId, cycleId, userId) {
    const doc = await this.findOne({
        submissionId,
        cycleId,
        "assignedReviewers.reviewer": userId,
    });

    return !!doc;
};

const Reviewer = model("Reviewer", reviewerSchema);

console.log("📦 [REVIEWER-MODEL] Reviewer model created and exported");

export { Reviewer };
