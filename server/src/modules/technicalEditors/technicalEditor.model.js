import mongoose, { Schema } from "mongoose";

const technicalEditorSchema = new Schema(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
            index: true,
        },

        cycleId: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            required: true,
        },

        assignedTechnicalEditors: [
            {
                _id: false,
                technicalEditor: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                assignedDate: {
                    type: Date,
                    default: Date.now,
                },
                assignedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                status: {
                    type: String,
                    enum: ["PENDING", "ACCEPT", "REJECT"],
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
            },
        ],

        technicalEditorReview: [
            {
                _id: false,
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },
                email: {
                    type: String,
                    lowercase: true,
                    trim: true,
                },
                recommendation: {
                    type: String,
                    enum: ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"],
                },
                remarks: {
                    type: String,
                    trim: true,
                    maxlength: [10000, "Remarks cannot exceed 10000 characters"],
                },
                revisedManuscript: {
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
    }
);

technicalEditorSchema.index({ submissionId: 1, cycleId: 1 }, { unique: true });

technicalEditorSchema.statics.findBySubmission = function (submissionId) {
    return this.find({ submissionId })
        .populate("assignedTechnicalEditors.technicalEditor", "firstName lastName email")
        .populate("technicalEditorReview.user", "firstName lastName email")
        .sort({ createdAt: 1 });
};

technicalEditorSchema.statics.findByCycle = function (cycleId) {
    return this.findOne({ cycleId })
        .sort({ updatedAt: -1 })
        .populate("assignedTechnicalEditors.technicalEditor", "firstName lastName email")
        .populate("technicalEditorReview.user", "firstName lastName email");
};

technicalEditorSchema.statics.getCurrentCycleDoc = function (submissionId, cycleId) {
    return this.findOne({ submissionId, cycleId }).sort({ updatedAt: -1 });
};

technicalEditorSchema.statics.getCurrentCycleDocLean = function (submissionId, cycleId) {
    return this.findOne({ submissionId, cycleId }).sort({ updatedAt: -1 }).lean();
};

export const TechnicalEditor = mongoose.model("TechnicalEditor", technicalEditorSchema);

console.log("📦 [TECHNICAL-EDITOR-MODEL] TechnicalEditor model created and exported");
