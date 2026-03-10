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

        cycleNumber: {
            type: Schema.Types.ObjectId,
            ref: "SubmissionCycle",
            required: [true, "Cycle number reference is required"],
        },

        // ══════════════════════════════════════════════════════════
        // FILE REFERENCES
        // ══════════════════════════════════════════════════════════
        
        fileRefs: [{
            type: String,
            trim: true,
            required: true,
        }],

        // ══════════════════════════════════════════════════════════
        // REMARKS (From Editor/Technical Editor/Reviewer)
        // ══════════════════════════════════════════════════════════
        
        remarks: [{
            type: String,
            trim: true,
            maxlength: [2000, "Remark cannot exceed 2000 characters"],
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
manuscriptVersionSchema.index({ cycleNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════

manuscriptVersionSchema.statics.findBySubmission = async function (submissionId) {
    return this.find({ submissionId })
        .populate("uploadedBy", "firstName lastName email role")
        .populate("cycleNumber")
        .sort({ versionNumber: 1 });
};

manuscriptVersionSchema.statics.getLatestVersion = async function (submissionId) {
    return this.findOne({ submissionId })
        .sort({ versionNumber: -1 })
        .populate("uploadedBy", "firstName lastName email role")
        .populate("cycleNumber");
};

const ManuscriptVersion = model("ManuscriptVersion", manuscriptVersionSchema);

console.log("📦 [MANUSCRIPT-VERSION-MODEL] ManuscriptVersion model created and exported");

export { ManuscriptVersion };