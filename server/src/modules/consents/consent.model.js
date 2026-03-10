import { Schema, model } from "mongoose";

/**
 * ════════════════════════════════════════════════════════════════
 * CONSENT SCHEMA
 * ════════════════════════════════════════════════════════════════
 * 
 * Tracks co-author consent responses separately from submissions
 * Provides audit trail for consent management
 * 
 * WORKFLOW:
 * 1. When co-author added → consent record created (PENDING)
 * 2. Co-author clicks link → consent updated (APPROVED/REJECTED)
 * 3. Token verified → consent finalized
 * 4. If REJECTED → remark stored + author notified
 * ════════════════════════════════════════════════════════════════
 */

const consentSchema = new Schema(
    {
        // ══════════════════════════════════════════════════════════
        // REFERENCES
        // ══════════════════════════════════════════════════════════

        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: [true, "Submission ID is required"],
            index: true,
        },

        coAuthorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,  // ✅ null until user registers
            index: true,
        },

        // ══════════════════════════════════════════════════════════
        // TEMPORARY FIELDS (For unregistered co-authors)
        // ══════════════════════════════════════════════════════════

        coAuthorEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        coAuthorFirstName: {
            type: String,
            trim: true,
        },

        coAuthorLastName: {
            type: String,
            trim: true,
        },

        coAuthorPhoneNumber: {
            type: String,
            trim: true,
        },

        // Source tracking
        source: {
            type: String,
            enum: ["DATABASE_SEARCH", "MANUAL_ENTRY"],
            required: true,
        },

        // ══════════════════════════════════════════════════════════
        // CONSENT STATUS
        // ══════════════════════════════════════════════════════════

        status: {
            type: String,
            enum: {
                values: ["PENDING", "APPROVED", "REJECTED"],
                message: "{VALUE} is not a valid consent status",
            },
            default: "PENDING",
            required: true,
            index: true,
        },

        // ══════════════════════════════════════════════════════════
        // TOKEN & EXPIRY
        // ══════════════════════════════════════════════════════════

        consentToken: {
            type: String,
            select: false,
        },

        consentTokenExpires: {
            type: Date,
            select: false,
        },

        // ══════════════════════════════════════════════════════════
        // RESPONSE DETAILS
        // ══════════════════════════════════════════════════════════

        respondedAt: {
            type: Date,
        },

        remark: {
            type: String,
            trim: true,
            maxlength: [1000, "Remark cannot exceed 1000 characters"],
        },

        // ══════════════════════════════════════════════════════════
        // EMAIL TRACKING
        // ══════════════════════════════════════════════════════════

        emailSentAt: {
            type: Date,
        },

        emailResendCount: {
            type: Number,
            default: 0,
        },

        lastEmailSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.__v;
                delete ret.consentToken;
                delete ret.consentTokenExpires;
                return ret;
            },
        },
    }
);

// ══════════════════════════════════════════════════════════════════
// INDEXES
// ══════════════════════════════════════════════════════════════════

// Unique constraint: One consent per submission+coAuthor (DATABASE_SEARCH only)
// Uses partial filter to exclude null coAuthorId values
consentSchema.index(
    { submissionId: 1, coAuthorId: 1 },
    { 
        unique: true,
        partialFilterExpression: { coAuthorId: { $type: "objectId" } }
    }
);

// Unique constraint: One consent per submission+email (all co-authors)
// Prevents duplicate consents for same email in same submission
consentSchema.index(
    { submissionId: 1, coAuthorEmail: 1 },
    { unique: true }
);

// Query optimization indexes
consentSchema.index({ status: 1, submissionId: 1 });
consentSchema.index({ consentTokenExpires: 1 });

// ══════════════════════════════════════════════════════════════════
// INSTANCE METHODS
// ══════════════════════════════════════════════════════════════════

/**
 * Verify consent token
 */
consentSchema.methods.verifyToken = function (token) {
    if (!this.consentToken || !this.consentTokenExpires) {
        return false;
    }

    if (this.consentToken !== token) {
        return false;
    }

    if (this.consentTokenExpires < Date.now()) {
        return false;
    }

    return true;
};

/**
 * Approve consent
 */
consentSchema.methods.approve = function () {
    this.status = "APPROVED";
    this.respondedAt = new Date();
    this.consentToken = undefined;
    this.consentTokenExpires = undefined;
    return this;
};

/**
 * Reject consent with remark
 */
consentSchema.methods.reject = function (remark) {
    this.status = "REJECTED";
    this.respondedAt = new Date();
    this.remark = remark;
    this.consentToken = undefined;
    this.consentTokenExpires = undefined;
    return this;
};

// ══════════════════════════════════════════════════════════════════
// STATIC METHODS
// ══════════════════════════════════════════════════════════════════

/**
 * Find pending consents for a submission
 */
consentSchema.statics.findPendingBySubmission = async function (submissionId) {
    return this.find({
        submissionId,
        status: "PENDING",
    })
        .populate("coAuthorId", "firstName lastName email")
        .sort({ createdAt: -1 });
};

/**
 * Find all consents for a submission
 */
consentSchema.statics.findBySubmission = async function (submissionId) {
    return this.find({ submissionId })
        .populate("coAuthorId", "firstName lastName email")
        .sort({ createdAt: -1 });
};

/**
 * Check if all consents approved for a submission
 */
consentSchema.statics.areAllApproved = async function (submissionId) {
    const pending = await this.countDocuments({
        submissionId,
        status: { $in: ["PENDING", "REJECTED"] },
    });

    return pending === 0;
};

/**
 * Find expired consents
 */
consentSchema.statics.findExpired = async function () {
    return this.find({
        status: "PENDING",
        consentTokenExpires: { $lte: new Date() },
    })
        .populate("submissionId", "title submissionNumber author")
        .populate("coAuthorId", "firstName lastName email");
};

const Consent = model("Consent", consentSchema);

console.log("📦 [CONSENT-MODEL] Consent model created and exported");

export { Consent };