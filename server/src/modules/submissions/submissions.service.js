import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Submission } from "./submissions.model.js";
import { User } from "../users/users.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import { CURRENT_CHECKLIST } from "../../common/constants/checklistQuestions.v1.0.0.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION SERVICE LAYER - COMPLETE VERSION
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.service.js
 * Handles all business logic for submissions
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// PRIVATE HELPER FUNCTIONS
// ================================================

const findSubmissionById = async (submissionId, options = {}) => {
    try {
        let query = Submission.findById(submissionId);
        
        if (options.populate) {
            query = query
                .populate("author", "firstName lastName email")
                .populate("coAuthors.user", "firstName lastName email")
                .populate("assignedEditor", "firstName lastName email")
                .populate("assignedReviewers.reviewer", "firstName lastName email")
                .populate("assignedTechnicalEditors.technicalEditor", "firstName lastName email");
        }
        
        const submission = await query;
        
        console.log(`🔵 [HELPER] findSubmissionById: ${submission ? "found" : "not found"}`);
        
        return submission;
    } catch (dbError) {
        console.error("❌ [HELPER] findSubmissionById failed:", dbError);
        if (dbError.name === "CastError") {
            throw new AppError("Invalid submission ID format", STATUS_CODES.BAD_REQUEST, "INVALID_SUBMISSION_ID");
        }
        throw new AppError("Database error while finding submission", STATUS_CODES.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", { originalError: dbError.message });
    }
};

const validateUserPermission = (submission, userId, action = "view") => {
    if (action === "view") {
        if (!submission.canView(userId)) {
            throw new AppError("You don't have permission to view this submission", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }
    } else if (action === "edit") {
        if (!submission.canEdit(userId)) {
            throw new AppError("You don't have permission to edit this submission", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }
    }
};

const validateCorrespondingAuthor = (submission) => {
    const isMainCorresponding = submission.isCorrespondingAuthor;
    const coAuthorCorresponding = submission.coAuthors?.filter(ca => ca.isCorresponding);
    
    if (!isMainCorresponding && (!coAuthorCorresponding || coAuthorCorresponding.length === 0)) {
        throw new AppError(
            "Please designate a corresponding author (either yourself or one co-author)",
            STATUS_CODES.BAD_REQUEST,
            "NO_CORRESPONDING_AUTHOR"
        );
    }
    
    if (coAuthorCorresponding && coAuthorCorresponding.length > 1) {
        throw new AppError(
            "Only one corresponding author is allowed",
            STATUS_CODES.BAD_REQUEST,
            "MULTIPLE_CORRESPONDING_AUTHORS"
        );
    }
};

const sendCoAuthorConsentEmail = async (submission, coAuthor, token) => {
    try {
        const email = coAuthor.email;
        const name = `${coAuthor.firstName} ${coAuthor.lastName}`;

        const consentUrl = `${process.env.FRONTEND_URL}/submissions/${submission._id}/coauthor-consent/${coAuthor._id}?token=${token}`;
        
        const emailHtml = `
            <h2>Co-Author Consent Request</h2>
            <p>Dear ${name},</p>
            <p>You have been added as a co-author on the manuscript titled:</p>
            <p><strong>${submission.title}</strong></p>
            <p>Submission Number: ${submission.submissionNumber || "Draft"}</p>
            <p>Please review and provide your consent by clicking the link below:</p>
            <p><a href="${consentUrl}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Provide Consent</a></p>
            <p>This link will expire in 7 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: `Co-Author Consent Request - ${submission.title}`,
            html: emailHtml,
        });

        console.log(`🔵 [HELPER] Consent email sent to ${email}`);
    } catch (emailError) {
        console.error("❌ [HELPER] Failed to send consent email:", emailError);
    }
};

const sendReviewerInvitationEmail = async (submission, reviewer, token) => {
    try {
        const email = reviewer.email;
        const name = `${reviewer.firstName} ${reviewer.lastName}`;

        const invitationUrl = `${process.env.FRONTEND_URL}/submissions/${submission._id}/reviewer-invitation/${reviewer._id}?token=${token}`;
        
        const emailHtml = `
            <h2>Manuscript Review Invitation</h2>
            <p>Dear ${name},</p>
            <p>You have been suggested as a reviewer for the manuscript:</p>
            <p><strong>${submission.title}</strong></p>
            <p>Submission Number: ${submission.submissionNumber}</p>
            <p>Article Type: ${submission.articleType}</p>
            <p>Please respond to this invitation by clicking the link below:</p>
            <p><a href="${invitationUrl}" style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Respond to Invitation</a></p>
            <p>This link will expire in 7 days.</p>
        `;

        await sendEmail({
            to: email,
            subject: `Review Invitation - ${submission.submissionNumber}`,
            html: emailHtml,
        });

        console.log(`🔵 [HELPER] Invitation email sent to ${email}`);
    } catch (emailError) {
        console.error("❌ [HELPER] Failed to send invitation email:", emailError);
    }
};

// ================================================
// CREATE SUBMISSION
// ================================================

const createSubmission = async (authorId, payload) => {
    try {
        console.log("🔵 [SERVICE] createSubmission started");

        const author = await User.findById(authorId);
        if (!author) {
            throw new AppError("Author not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        const submission = await Submission.create({
            ...payload,
            author: authorId,
            status: payload.saveAsDraft ? "DRAFT" : "SUBMITTED",
        });

        console.log("🟢 [SERVICE] Submission created:", submission._id);

        await submission.populate("author", "firstName lastName email");

        console.log("✅ [SERVICE] createSubmission completed successfully");

        return {
            message: payload.saveAsDraft ? "Draft saved successfully" : "Submission created successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in createSubmission:", error);
        throw new AppError("Failed to create submission", STATUS_CODES.INTERNAL_SERVER_ERROR, "SUBMISSION_CREATION_ERROR", { originalError: error.message });
    }
};

// ================================================
// GET SUBMISSION BY ID
// ================================================

const getSubmissionById = async (submissionId, userId, userRole) => {
    try {
        console.log("🔵 [SERVICE] getSubmissionById started");

        const submission = await findSubmissionById(submissionId, { populate: true });

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            validateUserPermission(submission, userId, "view");
        }

        console.log("✅ [SERVICE] getSubmissionById completed successfully");

        return {
            message: "Submission retrieved successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in getSubmissionById:", error);
        throw new AppError("Failed to retrieve submission", STATUS_CODES.INTERNAL_SERVER_ERROR, "GET_SUBMISSION_ERROR", { originalError: error.message });
    }
};

// ================================================
// UPDATE SUBMISSION
// ================================================

const updateSubmission = async (submissionId, userId, updates) => {
    try {
        console.log("🔵 [SERVICE] updateSubmission started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        validateUserPermission(submission, userId, "edit");

        const sensitiveFields = ["submissionNumber", "status", "assignedEditor", "assignedReviewers", "assignedTechnicalEditors", "paymentStatus"];
        sensitiveFields.forEach(field => delete updates[field]);

        Object.keys(updates).forEach(key => {
            submission[key] = updates[key];
        });

        await submission.save();
        await submission.populate("author", "firstName lastName email");

        console.log("✅ [SERVICE] updateSubmission completed successfully");

        return {
            message: "Submission updated successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in updateSubmission:", error);
        throw new AppError("Failed to update submission", STATUS_CODES.INTERNAL_SERVER_ERROR, "UPDATE_SUBMISSION_ERROR", { originalError: error.message });
    }
};

// ================================================
// SUBMIT MANUSCRIPT
// ================================================

const submitManuscript = async (submissionId, userId, payload) => {
    try {
        console.log("🔵 [SERVICE] submitManuscript started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (submission.author.toString() !== userId) {
            throw new AppError("Only the author can submit the manuscript", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        if (submission.status !== "DRAFT") {
            throw new AppError("This manuscript has already been submitted", STATUS_CODES.BAD_REQUEST, "ALREADY_SUBMITTED");
        }

        validateCorrespondingAuthor(submission);

        if (!submission.coverLetter || !submission.coverLetter.fileUrl) {
            throw new AppError("Cover letter is required", STATUS_CODES.BAD_REQUEST, "COVER_LETTER_REQUIRED");
        }

        if (!submission.blindManuscriptFile || !submission.blindManuscriptFile.fileUrl) {
            throw new AppError("Blind manuscript file is required", STATUS_CODES.BAD_REQUEST, "MANUSCRIPT_FILE_REQUIRED");
        }

        submission.checklist = {
            checklistVersion: CURRENT_CHECKLIST.version,
            responses: payload.checklist.responses,
            copeCompliance: payload.checklist.copeCompliance,
            completedAt: new Date(),
        };

        submission.conflictOfInterest = payload.conflictOfInterest;
        submission.copyrightAgreement = payload.copyrightAgreement;
        submission.pdfPreviewConfirmed = payload.pdfPreviewConfirmed;
        submission.suggestedReviewers = payload.suggestedReviewers;

        for (let i = 0; i < submission.suggestedReviewers.length; i++) {
            const token = submission.generateReviewerInvitationToken(i);
            await sendReviewerInvitationEmail(submission, submission.suggestedReviewers[i], token);
        }

        submission.updateStatus("SUBMITTED");

        await submission.save();

        const author = await User.findById(userId);
        if (author) {
            try {
                await sendEmail({
                    to: author.email,
                    subject: `Submission Confirmation - ${submission.submissionNumber}`,
                    html: `
                        <h2>Manuscript Submission Confirmation</h2>
                        <p>Dear ${author.firstName} ${author.lastName},</p>
                        <p>Your manuscript has been successfully submitted:</p>
                        <p><strong>Submission Number:</strong> ${submission.submissionNumber}</p>
                        <p><strong>Title:</strong> ${submission.title}</p>
                        <p><strong>Article Type:</strong> ${submission.articleType}</p>
                        <p>We will review your submission and contact you soon.</p>
                    `,
                });
            } catch (emailError) {
                console.error("❌ Failed to send confirmation email:", emailError);
            }
        }

        console.log("✅ [SERVICE] submitManuscript completed successfully");

        return {
            message: "Manuscript submitted successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in submitManuscript:", error);
        throw new AppError("Failed to submit manuscript", STATUS_CODES.INTERNAL_SERVER_ERROR, "SUBMIT_MANUSCRIPT_ERROR", { originalError: error.message });
    }
};

// ================================================
// LIST SUBMISSIONS
// ================================================

const listSubmissions = async (userId, userRole, filters = {}) => {
    try {
        console.log("🔵 [SERVICE] listSubmissions started");

        const { status, articleType, page = 1, limit = 20, sortBy = "submittedAt", sortOrder = "desc", search } = filters;

        let query = {};

        if (userRole === "USER") {
            query.author = userId;
        } else if (userRole === "REVIEWER") {
            query["assignedReviewers.reviewer"] = userId;
        } else if (userRole === "TECHNICAL_EDITOR") {
            query["assignedTechnicalEditors.technicalEditor"] = userId;
        } else if (userRole === "EDITOR") {
            query.assignedEditor = userId;
        }

        if (status) query.status = status;
        if (articleType) query.articleType = articleType;

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [submissions, total] = await Promise.all([
            Submission.find(query)
                .populate("author", "firstName lastName email")
                .populate("assignedEditor", "firstName lastName")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Submission.countDocuments(query),
        ]);

        console.log("✅ [SERVICE] listSubmissions completed successfully");

        return {
            message: "Submissions retrieved successfully",
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in listSubmissions:", error);
        throw new AppError("Failed to retrieve submissions", STATUS_CODES.INTERNAL_SERVER_ERROR, "LIST_SUBMISSIONS_ERROR", { originalError: error.message });
    }
};

// ================================================
// UPDATE STATUS
// ================================================

const updateStatus = async (submissionId, userId, userRole, newStatus, comments) => {
    try {
        console.log("🔵 [SERVICE] updateStatus started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            throw new AppError("Only editors and admins can update submission status", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        submission.updateStatus(newStatus);

        if (comments) {
            submission.internalNotes.push({
                note: `Status updated to ${newStatus}: ${comments}`,
                addedBy: userId,
                isConfidential: true,
            });
        }

        await submission.save();

        console.log("✅ [SERVICE] updateStatus completed successfully");

        return {
            message: "Status updated successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in updateStatus:", error);
        throw new AppError("Failed to update status", STATUS_CODES.INTERNAL_SERVER_ERROR, "UPDATE_STATUS_ERROR", { originalError: error.message });
    }
};

// ================================================
// UPDATE PAYMENT STATUS
// ================================================

const updatePaymentStatus = async (submissionId, userId, paymentStatus, note) => {
    try {
        console.log("🔵 [SERVICE] updatePaymentStatus started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        submission.paymentStatus = paymentStatus;

        submission.internalNotes.push({
            note: `Payment status updated to ${paymentStatus ? "PAID" : "UNPAID"}${note ? `: ${note}` : ""}`,
            addedBy: userId,
            isConfidential: true,
        });

        await submission.save();

        console.log("✅ [SERVICE] updatePaymentStatus completed successfully");

        return {
            message: "Payment status updated successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in updatePaymentStatus:", error);
        throw new AppError("Failed to update payment status", STATUS_CODES.INTERNAL_SERVER_ERROR, "UPDATE_PAYMENT_ERROR", { originalError: error.message });
    }
};

// ================================================
// ASSIGN EDITOR
// ================================================

const assignEditor = async (submissionId, editorId, assignedByUserId) => {
    try {
        console.log("🔵 [SERVICE] assignEditor started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const editor = await User.findById(editorId);
        if (!editor) {
            throw new AppError("Editor not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        if (editor.role !== "EDITOR" && editor.role !== "ADMIN") {
            throw new AppError("User is not an editor", STATUS_CODES.BAD_REQUEST, "INVALID_EDITOR");
        }

        submission.assignedEditor = editorId;
        submission.assignedEditorDate = new Date();

        submission.internalNotes.push({
            note: `Editor assigned: ${editor.firstName} ${editor.lastName}`,
            addedBy: assignedByUserId,
            isConfidential: true,
        });

        await submission.save();

        console.log("✅ [SERVICE] assignEditor completed successfully");

        return {
            message: "Editor assigned successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in assignEditor:", error);
        throw new AppError("Failed to assign editor", STATUS_CODES.INTERNAL_SERVER_ERROR, "ASSIGN_EDITOR_ERROR", { originalError: error.message });
    }
};

// ================================================
// CO-AUTHOR CONSENT
// ================================================

const processCoAuthorConsent = async (submissionId, coAuthorId, consent, token) => {
    try {
        console.log("🔵 [SERVICE] processCoAuthorConsent started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const coAuthorIndex = submission.coAuthors.findIndex(
            ca => ca._id.toString() === coAuthorId
        );

        if (coAuthorIndex === -1) {
            throw new AppError("Co-author not found in this submission", STATUS_CODES.NOT_FOUND, "COAUTHOR_NOT_FOUND");
        }

        const isValidToken = submission.verifyCoAuthorConsentToken(coAuthorIndex, token);

        if (!isValidToken) {
            throw new AppError("Invalid or expired consent token", STATUS_CODES.BAD_REQUEST, "INVALID_TOKEN");
        }

        submission.coAuthors[coAuthorIndex].consentStatus = consent === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        submission.coAuthors[coAuthorIndex].consentDate = new Date();
        submission.coAuthors[coAuthorIndex].consentToken = undefined;
        submission.coAuthors[coAuthorIndex].consentTokenExpires = undefined;

        await submission.save();

        console.log("✅ [SERVICE] processCoAuthorConsent completed successfully");

        return {
            message: `Consent ${consent === "ACCEPT" ? "accepted" : "rejected"} successfully`,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in processCoAuthorConsent:", error);
        throw new AppError("Failed to process consent", STATUS_CODES.INTERNAL_SERVER_ERROR, "CONSENT_ERROR", { originalError: error.message });
    }
};

// ================================================
// MOVE TO REVIEW
// ================================================

const moveToReview = async (submissionId, userId, userRole) => {
    try {
        console.log("🔵 [SERVICE] moveToReview started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            throw new AppError("Only editors can move submissions to peer review", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        const check = submission.canMoveToReview();
        
        if (!check.canMove) {
            throw new AppError(
                check.reason, 
                STATUS_CODES.BAD_REQUEST, 
                "INSUFFICIENT_REVIEWERS",
                { current: check.current, required: check.required }
            );
        }

        submission.assignedReviewers = check.approvedReviewers.map(r => ({
            reviewer: r.user,
            assignedDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "PENDING",
            isAnonymous: true
        }));

        submission.updateStatus("UNDER_REVIEW");

        submission.internalNotes.push({
            note: `Moved to peer review with ${check.approvedReviewers.length} approved reviewers`,
            addedBy: userId,
            isConfidential: true,
        });

        await submission.save();

        console.log("✅ [SERVICE] moveToReview completed successfully");

        return {
            message: "Submission moved to peer review successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in moveToReview:", error);
        throw new AppError("Failed to move to peer review", STATUS_CODES.INTERNAL_SERVER_ERROR, "MOVE_TO_REVIEW_ERROR", { originalError: error.message });
    }
};

export default {
    createSubmission,
    getSubmissionById,
    updateSubmission,
    submitManuscript,
    listSubmissions,
    updateStatus,
    updatePaymentStatus,
    assignEditor,
    processCoAuthorConsent,
    moveToReview,
};