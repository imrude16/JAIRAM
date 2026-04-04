import { Schema, model } from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * MANUSCRIPT VERSION SCHEMA
 * ════════════════════════════════════════════════════════════════
 * 
 * Tracks different versions of manuscript files across revision cycles
 * Stores file references and remarks from Editor/Technical Editor/Reviewers
 * ════════════════════════════════════════════════════════════════
 */

const manuscriptVersionSchema = new Schema(
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

        cycleId: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            required: [true, "Cycle ID reference is required"],
        },

        // ══════════════════════════════════════════════════════════
        // FILE REFERENCES WITH METADATA
        // ══════════════════════════════════════════════════════════

        fileRefs: [{
            _id: false,
            fileName: {
                type: String,
                trim: true,
            },
            fileUrl: {
                type: String,
                trim: true,
                required: true,
            },
            fileSize: {
                type: Number,
            },
            mimeType: {
                type: String,
                trim: true,
            },
            uploadedAt: {
                type: Date,
            },
        }],

        // ══════════════════════════════════════════════════════════
        // UPLOADER TRACKING
        // ══════════════════════════════════════════════════════════

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader ID is required"],
        },

        uploaderRole: {
            type: String,
            enum: {
                values: ["USER", "EDITOR", "TECHNICAL_EDITOR", "REVIEWER"],
                message: "{VALUE} is not a valid uploader role",
            },
            required: true,
        },

        // ══════════════════════════════════════════════════════════
        // VERSION NUMBER
        // ══════════════════════════════════════════════════════════

        versionNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        currentStage: {
            type: String,
            enum: {
                values: [
                    "INITIAL_SUBMISSION",
                    "EDITOR_TO_TECH_EDITOR",
                    "TECH_EDITOR_TO_EDITOR",
                    "EDITOR_TO_REVIEWER",
                    "REVIEWER_TO_EDITOR",
                    "EDITOR_TO_AUTHOR",
                ],
                message: "{VALUE} is not a valid revision stage",
            },
            default: "INITIAL_SUBMISSION",
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
manuscriptVersionSchema.index({ submissionId: 1, versionNumber: 1 }, { unique: true });
manuscriptVersionSchema.index({ uploadedBy: 1 });
manuscriptVersionSchema.index({ cycleId: 1 });

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════
manuscriptVersionSchema.statics.findBySubmission = async function (submissionId) {
    return this.find({ submissionId })
        .populate("uploadedBy", "firstName lastName email role")
        .populate("cycleId")
        .sort({ versionNumber: 1 });
};

manuscriptVersionSchema.statics.getLatestVersion = async function (submissionId) {
    return this.findOne({ submissionId })
        .sort({ versionNumber: -1 })
        .populate("uploadedBy", "firstName lastName email role")
        .populate("cycleId");
};

const ManuscriptVersion = model("ManuscriptVersion", manuscriptVersionSchema);

console.log("📦 [MANUSCRIPT-VERSION-MODEL] ManuscriptVersion model created and exported");

export { ManuscriptVersion };
