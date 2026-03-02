import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Submission } from "./submissions.model.js";
import { User } from "../users/users.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import { CURRENT_CHECKLIST } from "../../common/constants/checklistQuestions.v1.0.0.js";
import { SubmissionCycle } from "./submissionCycles/submissionCycle.model.js";
import { ManuscriptVersion } from "./manuscriptVersions/manuscriptVersion.model.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION SERVICE LAYER - COMPLETE VERSION WITH CONSENT TRACKING
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.service.js
 * Handles all business logic for submissions
 * + NEW: Revision submission logic
 * + NEW: Editor/Tech Editor decision tracking
 * + NEW: Co-author consent and reviewer majority checks
 * + NEW: Auto-reject expired consents (cron job)
 * + NEW: Editor manual consent override
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

const validateSubmitterRoleType = (user, submitterRoleType, isRevision = false) => {
    const roleMapping = {
        "Author": "USER",
        "Editor": "EDITOR",
        "Technical Editor": "TECHNICAL_EDITOR",
        "Reviewer": "REVIEWER",
    };

    const expectedRole = roleMapping[submitterRoleType];

    if (!expectedRole) {
        throw new AppError(
            "Invalid submitter role type",
            STATUS_CODES.BAD_REQUEST,
            "INVALID_ROLE_TYPE"
        );
    }

    if (submitterRoleType === "Author") {
        if (user.role !== "USER") {
            throw new AppError(
                "Only users with USER role can submit manuscripts as Author",
                STATUS_CODES.FORBIDDEN,
                "INVALID_AUTHOR_ROLE",
                { userRole: user.role, attemptedRoleType: submitterRoleType }
            );
        }

        if (isRevision) {
            throw new AppError(
                "Authors cannot submit revisions using this endpoint. Please use the submission update endpoint.",
                STATUS_CODES.FORBIDDEN,
                "AUTHOR_CANNOT_SUBMIT_REVISION"
            );
        }
    }

    if (["Editor", "Technical Editor", "Reviewer"].includes(submitterRoleType)) {
        if (user.role !== expectedRole) {
            throw new AppError(
                `You cannot submit as ${submitterRoleType}. Your account role is ${user.role}.`,
                STATUS_CODES.FORBIDDEN,
                "ROLE_MISMATCH",
                { userRole: user.role, attemptedRoleType: submitterRoleType }
            );
        }

        if (!isRevision) {
            throw new AppError(
                `${submitterRoleType}s can only submit revisions, not new manuscripts`,
                STATUS_CODES.FORBIDDEN,
                "REVISION_ONLY_ROLE",
                { userRole: user.role, roleType: submitterRoleType }
            );
        }
    }
};

const createInitialCycle = async (submissionId) => {
    try {
        const cycle = await SubmissionCycle.findOneAndUpdate(
            { submissionId, cycleNumber: 1 },
            {
                $setOnInsert: {
                    submissionId,
                    cycleNumber: 1,
                    status: "IN_PROGRESS",
                }
            },
            {
                new: true,
                upsert: true,
            }
        );

        console.log(`🔵 [HELPER] Initial cycle ensured for submission ${submissionId}`);
        return cycle;

    } catch (error) {
        console.error("❌ [HELPER] Failed to create initial cycle:", error);
        throw new AppError(
            "Failed to create submission cycle",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CYCLE_CREATION_ERROR"
        );
    }
};

const createManuscriptVersion = async (submissionId, cycleId, uploadedBy, uploaderRole, fileRefs) => {
    try {
        const versionCount = await ManuscriptVersion.countDocuments({ submissionId });

        const version = await ManuscriptVersion.create({
            submissionId,
            cycleNumber: cycleId,
            fileRefs,
            uploadedBy,
            uploaderRole,
            versionNumber: versionCount + 1,
        });

        console.log(`🔵 [HELPER] Manuscript version ${versionCount + 1} created`);
        return version;
    } catch (error) {
        console.error("❌ [HELPER] Failed to create manuscript version:", error);
        throw new AppError(
            "Failed to create manuscript version",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "VERSION_CREATION_ERROR"
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
// CREATE SUBMISSION (NEW MANUSCRIPTS ONLY)
// ================================================

const createSubmission = async (authorId, payload) => {
    try {
        console.log("🔵 [SERVICE] createSubmission started");

        const author = await User.findById(authorId);
        if (!author) {
            throw new AppError("Author not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Validate submitterRoleType matches user's actual role
        // isRevision = false (this is for NEW submissions only)
        validateSubmitterRoleType(author, payload.submitterRoleType, false);

        // Only users with role "USER" can create NEW submissions
        if (payload.submitterRoleType !== "Author") {
            throw new AppError(
                "Only Authors can create new submissions. Other roles can only submit revisions.",
                STATUS_CODES.FORBIDDEN,
                "NEW_SUBMISSION_AUTHOR_ONLY"
            );
        }

        // Create submission
        const submission = await Submission.create({
            ...payload,
            author: authorId,
            status: payload.saveAsDraft ? "DRAFT" : "SUBMITTED",
            isRevision: false,  // NEW: This is not a revision
            revisionStage: "INITIAL_SUBMISSION",  // NEW
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

        // NEW: Initialize suggested reviewer responses tracking
        submission.suggestedReviewerResponses = {
            totalSuggested: payload.suggestedReviewers.length,
            accepted: 0,
            declined: 0,
            pending: payload.suggestedReviewers.length,
            majorityMet: false,
        };

        for (let i = 0; i < submission.suggestedReviewers.length; i++) {
            const token = submission.generateReviewerInvitationToken(i);
            await sendReviewerInvitationEmail(submission, submission.suggestedReviewers[i], token);
        }

        submission.updateStatus("SUBMITTED");

        // Create initial cycle and version
        try {
            const cycle = await createInitialCycle(submission._id);
            submission.currentCycleId = cycle._id;

            const fileRefs = [submission.blindManuscriptFile.fileUrl];
            if (submission.coverLetter) fileRefs.push(submission.coverLetter.fileUrl);
            if (submission.figures) fileRefs.push(...submission.figures.map(f => f.fileUrl));
            if (submission.tables) fileRefs.push(...submission.tables.map(f => f.fileUrl));
            if (submission.supplementaryFiles) fileRefs.push(...submission.supplementaryFiles.map(f => f.fileUrl));

            await createManuscriptVersion(
                submission._id,
                cycle._id,
                userId,
                "USER",
                fileRefs
            );

            console.log("🟢 [SERVICE] Initial cycle and version created for submitted manuscript");
        } catch (cycleError) {
            console.error("❌ [SERVICE] Failed to create cycle/version:", cycleError);
            // Continue with submission even if cycle creation fails
        }

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

        // Role-based filtering with Author vs Co-author differentiation
        if (userRole === "USER") {
            query.$or = [
                { author: userId },
                {
                    "coAuthors.user": userId,
                    "coAuthors.consentStatus": "ACCEPTED"
                }
            ];
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
                .populate("currentCycleId")
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
// GET SUBMISSION TIMELINE (Cycles)
// ================================================

const getSubmissionTimeline = async (submissionId, userId, userRole) => {
    try {
        console.log("🔵 [SERVICE] getSubmissionTimeline started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            if (!submission.canUserView(userId, userRole)) {
                throw new AppError(
                    "You don't have permission to view this submission timeline",
                    STATUS_CODES.FORBIDDEN,
                    "FORBIDDEN"
                );
            }
        }

        const cycles = await SubmissionCycle.findBySubmission(submissionId);
        const versions = await ManuscriptVersion.findBySubmission(submissionId);

        console.log("✅ [SERVICE] getSubmissionTimeline completed successfully");

        return {
            message: "Submission timeline retrieved successfully",
            timeline: {
                submission: {
                    id: submission._id,
                    submissionNumber: submission.submissionNumber,
                    title: submission.title,
                    status: submission.status,
                },
                cycles,
                versions,
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in getSubmissionTimeline:", error);
        throw new AppError(
            "Failed to retrieve submission timeline",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "TIMELINE_ERROR",
            { originalError: error.message }
        );
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
// CO-AUTHOR CONSENT (UPDATED WITH REJECTION TRACKING)
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

        // NEW: Handle rejection with tracking and single notification
        if (consent === "REJECT") {
            const coAuthor = submission.coAuthors[coAuthorIndex];

            // Only notify if not already notified
            if (submission.consentDeadlineStatus === "ACTIVE") {
                submission.consentDeadlineStatus = "NOTIFIED";

                // Track this rejection in consentIssues
                submission.consentIssues.push({
                    coAuthorId: coAuthor._id,
                    coAuthorEmail: coAuthor.email,
                    coAuthorName: `${coAuthor.firstName} ${coAuthor.lastName}`,
                    issueType: "REJECTED",
                    reportedAt: new Date(),
                });

                // Move to DRAFT if was SUBMITTED
                if (submission.status === "SUBMITTED") {
                    submission.status = "DRAFT";
                }

                console.log(`⚠️ [SERVICE] Co-author ${coAuthor.email} REJECTED consent`);

                // Send notification email to author (ONCE)
                const author = await User.findById(submission.author);
                if (author) {
                    try {
                        const rejectedCoAuthors = submission.coAuthors.filter(ca => ca.consentStatus === "REJECTED");
                        const pendingCoAuthors = submission.coAuthors.filter(ca => ca.consentStatus === "PENDING");

                        await sendEmail({
                            to: author.email,
                            subject: `⚠️ Co-Author Consent Issue - ${submission.submissionNumber || "Draft"}`,
                            html: `
                        <h2>Co-Author Consent Issue</h2>
                        <p>Dear ${author.firstName} ${author.lastName},</p>
                        <p>Co-author <strong>${coAuthor.firstName} ${coAuthor.lastName}</strong> (${coAuthor.email}) has <strong>rejected</strong> consent for your manuscript:</p>
                        <p><strong>Title:</strong> ${submission.title}</p>
                        <p><strong>Submission Number:</strong> ${submission.submissionNumber || "Draft"}</p>
                        <hr>
                        <p><strong>⏳ You have 7 days to resolve this issue:</strong></p>
                        <p>Consent Token Expires: <strong>${coAuthor.consentTokenExpires ? coAuthor.consentTokenExpires.toLocaleDateString() : "N/A"}</strong></p>
                        
                        <p><strong>Current Status:</strong></p>
                        <ul>
                            <li><strong>❌ Rejected (${rejectedCoAuthors.length}):</strong>
                                <ul>
                                    ${rejectedCoAuthors.map(ca => `<li>${ca.firstName} ${ca.lastName} (${ca.email})</li>`).join('')}
                                </ul>
                            </li>
                            <li><strong>⏰ Pending (${pendingCoAuthors.length}):</strong>
                                <ul>
                                    ${pendingCoAuthors.map(ca => `<li>${ca.firstName} ${ca.lastName} (${ca.email})</li>`).join('')}
                                </ul>
                            </li>
                        </ul>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Contact the co-author(s) to understand their concerns</li>
                            <li>If resolved offline, inform the Editor who can manually approve</li>
                            <li>If not resolved within 7 days, your submission will be automatically rejected</li>
                        </ol>
                        
                        <p>⚠️ Your submission is now in <strong>DRAFT</strong> status until this is resolved.</p>
                        <p><em>You will receive only ONE notification per issue. No further emails will be sent unless the deadline expires.</em></p>
                    `,
                        });
                        console.log(`📧 [SERVICE] Rejection notification sent to author (ONCE)`);
                    } catch (emailError) {
                        console.error("❌ Failed to send rejection notification:", emailError);
                    }
                }
            }

        } else {
            // Check if all co-authors have now accepted
            const allAccepted = submission.coAuthors.every(ca => ca.consentStatus === "ACCEPTED");

            if (allAccepted) {
                submission.consentDeadlineStatus = "RESOLVED";

                // Move back to SUBMITTED if it was moved to DRAFT
                if (submission.status === "DRAFT") {
                    submission.status = "SUBMITTED";
                }

                console.log(`✅ [SERVICE] All co-authors accepted - submission can proceed`);
            }
        }

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

// ════════════════════════════════════════════════════════════════
// NEW FUNCTIONS FOR REVISIONS AND DECISIONS
// ════════════════════════════════════════════════════════════════

// ================================================
// SUBMIT REVISION (Editor/Tech Editor/Reviewer)
// ================================================

const submitRevision = async (userId, payload) => {
    try {
        console.log("🔵 [SERVICE] submitRevision started");

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Validate submitterRoleType (isRevision = true)
        validateSubmitterRoleType(user, payload.submitterRoleType, true);

        // Find original submission
        const originalSubmission = await Submission.findById(payload.originalSubmissionId);
        if (!originalSubmission) {
            throw new AppError(
                "Original submission not found",
                STATUS_CODES.NOT_FOUND,
                "ORIGINAL_SUBMISSION_NOT_FOUND"
            );
        }

        // Verify user has permission to submit revision
        if (payload.submitterRoleType === "Editor") {
            if (!originalSubmission.assignedEditor ||
                originalSubmission.assignedEditor.toString() !== userId) {
                throw new AppError(
                    "You are not the assigned editor for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_EDITOR"
                );
            }
        } else if (payload.submitterRoleType === "Technical Editor") {
            const isAssigned = originalSubmission.assignedTechnicalEditors.some(
                te => te.technicalEditor.toString() === userId
            );
            if (!isAssigned) {
                throw new AppError(
                    "You are not assigned as technical editor for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_TECH_EDITOR"
                );
            }
        } else if (payload.submitterRoleType === "Reviewer") {
            const isAssigned = originalSubmission.assignedReviewers.some(
                r => r.reviewer.toString() === userId
            );
            if (!isAssigned) {
                throw new AppError(
                    "You are not assigned as reviewer for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_REVIEWER"
                );
            }
        }

        // Create revision submission
        const revision = await Submission.create({
            originalSubmissionId: payload.originalSubmissionId,
            submitterRoleType: payload.submitterRoleType,
            isRevision: true,
            revisionStage: payload.revisionStage,

            // Copy core fields from original
            articleType: originalSubmission.articleType,
            title: originalSubmission.title,
            author: originalSubmission.author,

            // Revision-specific data
            blindManuscriptFile: payload.revisedManuscript,
            supplementaryFiles: payload.attachments || [],

            // Add remarks as internal note
            internalNotes: [{
                note: payload.remarks,
                addedBy: userId,
                addedAt: new Date(),
                isConfidential: false,
            }],

            status: "SUBMITTED",
            submittedAt: new Date(),
        });

        // Create new cycle and version for this revision
        try {
            const currentCycleNumber = await SubmissionCycle.countDocuments({
                submissionId: payload.originalSubmissionId
            });

            const cycle = await SubmissionCycle.create({
                submissionId: payload.originalSubmissionId,
                cycleNumber: currentCycleNumber + 1,
                status: "IN_PROGRESS",
            });

            revision.currentCycleId = cycle._id;

            // Create manuscript version
            const fileRefs = [];
            if (payload.revisedManuscript) fileRefs.push(payload.revisedManuscript.fileUrl);
            if (payload.attachments) fileRefs.push(...payload.attachments.map(a => a.fileUrl));

            await createManuscriptVersion(
                payload.originalSubmissionId,
                cycle._id,
                userId,
                user.role,
                fileRefs
            );

            await revision.save();

        } catch (cycleError) {
            console.error("❌ [SERVICE] Failed to create cycle/version:", cycleError);
        }

        await revision.populate("author", "firstName lastName email");

        console.log("✅ [SERVICE] submitRevision completed successfully");

        return {
            message: "Revision submitted successfully",
            revision,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in submitRevision:", error);
        throw new AppError(
            "Failed to submit revision",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SUBMIT_REVISION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// EDITOR DECISION (Accept/Reject)
// ================================================

const makeEditorDecision = async (submissionId, editorId, decision, decisionStage, remarks, attachments) => {
    try {
        console.log("🔵 [SERVICE] makeEditorDecision started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // Verify user is Editor
        const editor = await User.findById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError(
                "Only editors can make decisions",
                STATUS_CODES.FORBIDDEN,
                "NOT_EDITOR"
            );
        }

        // Verify editor is assigned to this submission
        if (!submission.assignedEditor ||
            submission.assignedEditor.toString() !== editorId) {
            throw new AppError(
                "You are not the assigned editor for this submission",
                STATUS_CODES.FORBIDDEN,
                "NOT_ASSIGNED_EDITOR"
            );
        }

        // Check if editor can still make decisions (max 4)
        const editorDecisions = await SubmissionCycle.countDocuments({
            submissionId: submission._id,
            "editorDecision.type": { $in: ["ACCEPT", "REJECT"] }
        });

        if (editorDecisions >= 4) {
            throw new AppError(
                "Editor has exhausted all 4 decision opportunities",
                STATUS_CODES.FORBIDDEN,
                "EDITOR_DECISION_LIMIT_REACHED",
                { decisionsUsed: editorDecisions }
            );
        }

        // Get or create current cycle
        let currentCycle = await SubmissionCycle.getCurrentCycle(submission._id);

        if (!currentCycle) {
            currentCycle = await SubmissionCycle.create({
                submissionId: submission._id,
                cycleNumber: editorDecisions + 1,
                status: "IN_PROGRESS",
            });
        }

        // Record decision in SubmissionCycle
        currentCycle.editorDecision = {
            type: decision,
            reason: remarks,
            decidedAt: new Date(),
            decisionNumber: editorDecisions + 1,
            decisionStage: decisionStage,
        };

        await currentCycle.save();

        // Update submission status
        if (decision === "REJECT") {
            submission.status = "REJECTED";
            submission.rejectedAt = new Date();
        } else if (decision === "ACCEPT") {
            submission.status = "ACCEPTED";
            submission.acceptedAt = new Date();
        }

        await submission.save();

        console.log("✅ [SERVICE] makeEditorDecision completed successfully");

        return {
            message: `Submission ${decision === "ACCEPT" ? "accepted" : "rejected"} successfully`,
            submission,
            decisionsRemaining: 4 - (editorDecisions + 1),
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in makeEditorDecision:", error);
        throw new AppError(
            "Failed to make decision",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "EDITOR_DECISION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// TECHNICAL EDITOR DECISION
// ================================================

const makeTechnicalEditorDecision = async (submissionId, techEditorId, decision, remarks, attachments) => {
    try {
        console.log("🔵 [SERVICE] makeTechnicalEditorDecision started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // Verify user is Technical Editor
        const techEditor = await User.findById(techEditorId);
        if (!techEditor || techEditor.role !== "TECHNICAL_EDITOR") {
            throw new AppError(
                "Only technical editors can make decisions",
                STATUS_CODES.FORBIDDEN,
                "NOT_TECHNICAL_EDITOR"
            );
        }

        // Verify tech editor is assigned to this submission
        const isAssigned = submission.assignedTechnicalEditors.some(
            te => te.technicalEditor.toString() === techEditorId
        );
        if (!isAssigned) {
            throw new AppError(
                "You are not assigned as technical editor for this submission",
                STATUS_CODES.FORBIDDEN,
                "NOT_ASSIGNED_TECH_EDITOR"
            );
        }

        // Check if tech editor has already decided (only 1 chance)
        const existingDecision = await SubmissionCycle.findOne({
            submissionId: submission._id,
            "technicalEditorReview.decision": { $exists: true }
        });

        if (existingDecision) {
            throw new AppError(
                "Technical Editor has already made a decision (only 1 chance allowed)",
                STATUS_CODES.FORBIDDEN,
                "TECH_EDITOR_ALREADY_DECIDED",
                { previousDecision: existingDecision.technicalEditorReview.decision }
            );
        }

        // Get or create current cycle
        let currentCycle = await SubmissionCycle.getCurrentCycle(submission._id);

        if (!currentCycle) {
            currentCycle = await SubmissionCycle.create({
                submissionId: submission._id,
                cycleNumber: 1,
                status: "IN_PROGRESS",
            });
        }

        // Record decision in SubmissionCycle
        currentCycle.technicalEditorReview = {
            reviewedBy: techEditorId,
            decision: decision,
            remarks: remarks,
            attachmentRefs: attachments ? attachments.map(a => a.fileUrl) : [],
            reviewedAt: new Date(),
        };

        await currentCycle.save();

        // If REJECT, end the process immediately
        if (decision === "REJECT") {
            submission.status = "REJECTED";
            submission.rejectedAt = new Date();
            await submission.save();
        }

        console.log("✅ [SERVICE] makeTechnicalEditorDecision completed successfully");

        return {
            message: `Submission ${decision === "ACCEPT" ? "accepted" : "rejected"} by Technical Editor`,
            submission,
            note: "Technical Editor has used their only decision chance",
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in makeTechnicalEditorDecision:", error);
        throw new AppError(
            "Failed to make decision",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "TECH_EDITOR_DECISION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// CHECK CO-AUTHOR CONSENT STATUS
// ================================================

const checkCoAuthorConsentStatus = async (submissionId) => {
    try {
        console.log("🔵 [SERVICE] checkCoAuthorConsentStatus started");

        const submission = await findSubmissionById(submissionId, { populate: true });
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const consentStatus = submission.checkCoAuthorConsent();

        console.log("✅ [SERVICE] checkCoAuthorConsentStatus completed successfully");

        return {
            message: consentStatus.message,
            consentStatus,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in checkCoAuthorConsentStatus:", error);
        throw new AppError(
            "Failed to check consent status",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_CHECK_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// CHECK REVIEWER MAJORITY
// ================================================

const checkReviewerMajorityStatus = async (submissionId) => {
    try {
        console.log("🔵 [SERVICE] checkReviewerMajorityStatus started");

        const submission = await findSubmissionById(submissionId, { populate: true });
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const majorityStatus = submission.checkReviewerMajority();

        console.log("✅ [SERVICE] checkReviewerMajorityStatus completed successfully");

        return {
            message: majorityStatus.message,
            majorityStatus,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in checkReviewerMajorityStatus:", error);
        throw new AppError(
            "Failed to check reviewer majority",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "MAJORITY_CHECK_ERROR",
            { originalError: error.message }
        );
    }
};

// ════════════════════════════════════════════════════════════════
// NEW FUNCTIONS FOR CONSENT MANAGEMENT (CRON + EDITOR OVERRIDE)
// ════════════════════════════════════════════════════════════════

// ================================================
// AUTO-REJECT SUBMISSIONS WITH EXPIRED CONSENT DEADLINES (EFFICIENT CRON JOB)
// ================================================

const autoRejectExpiredConsents = async () => {
    try {
        console.log("🔵 [CRON] Checking for expired consent deadlines...");
        
        const now = new Date();
        
        // EFFICIENT QUERY: Only check submissions with ACTIVE consent deadlines
        // Uses index on consentDeadlineStatus for fast lookup
        const expiredSubmissions = await Submission.find({
            consentDeadlineStatus: "ACTIVE",  // ← Only active deadlines!
            "coAuthors": {
                $elemMatch: {
                    consentStatus: { $in: ["PENDING", "REJECTED"] },
                    consentTokenExpires: { $lte: now }
                }
            }
        }).populate("author", "firstName lastName email");
        
        if (expiredSubmissions.length === 0) {
            console.log("✅ [CRON] No expired consent deadlines found");
            return { processed: 0 };
        }
        
        console.log(`⚠️ [CRON] Found ${expiredSubmissions.length} submissions with expired consent deadlines`);
        
        const rejectedSubmissions = [];
        
        for (const submission of expiredSubmissions) {
            // Find co-authors with expired tokens
            const expiredCoAuthors = submission.coAuthors.filter(ca => 
                (ca.consentStatus === "PENDING" || ca.consentStatus === "REJECTED") &&
                ca.consentTokenExpires <= now
            );
            
            if (expiredCoAuthors.length > 0) {
                // Track NO_RESPONSE issues for pending co-authors
                for (const coAuthor of expiredCoAuthors) {
                    if (coAuthor.consentStatus === "PENDING") {
                        // Only add if not already tracked
                        const alreadyTracked = submission.consentIssues.some(
                            issue => issue.coAuthorId && issue.coAuthorId.equals(coAuthor._id)
                        );
                        
                        if (!alreadyTracked) {
                            submission.consentIssues.push({
                                coAuthorId: coAuthor._id,
                                coAuthorEmail: coAuthor.email,
                                coAuthorName: `${coAuthor.firstName} ${coAuthor.lastName}`,
                                issueType: "NO_RESPONSE",
                                reportedAt: new Date(),
                            });
                        }
                    }
                }
                
                // Update submission status
                submission.status = "REJECTED";
                submission.rejectedAt = new Date();
                submission.consentDeadlineStatus = "AUTO_REJECTED";
                
                // Build detailed lists for email
                const rejectedIssues = submission.consentIssues.filter(i => i.issueType === "REJECTED");
                const noResponseIssues = submission.consentIssues.filter(i => i.issueType === "NO_RESPONSE");
                
                // Add internal note
                const noteDetails = [];
                if (rejectedIssues.length > 0) {
                    noteDetails.push(`Rejected: ${rejectedIssues.map(i => i.coAuthorName).join(", ")}`);
                }
                if (noResponseIssues.length > 0) {
                    noteDetails.push(`No Response: ${noResponseIssues.map(i => i.coAuthorName).join(", ")}`);
                }
                
                submission.internalNotes.push({
                    note: `Submission auto-rejected: Consent deadline expired. ${noteDetails.join("; ")}`,
                    addedBy: submission.author,
                    isConfidential: true,
                    addedAt: new Date(),
                });
                
                await submission.save();
                
                // Send detailed rejection email to author
                const author = submission.author;
                try {
                    await sendEmail({
                        to: author.email,
                        subject: `❌ Submission Rejected - Consent Deadline Expired - ${submission.submissionNumber}`,
                        html: `
                            <h2>Submission Rejected - Consent Deadline Expired</h2>
                            <p>Dear ${author.firstName} ${author.lastName},</p>
                            <p>Your manuscript submission has been <strong>automatically rejected</strong> because the 7-day consent deadline has expired.</p>
                            <p><strong>Submission Number:</strong> ${submission.submissionNumber}</p>
                            <p><strong>Title:</strong> ${submission.title}</p>
                            <hr>
                            
                            <h3>Co-Author Consent Issues:</h3>
                            
                            ${rejectedIssues.length > 0 ? `
                                <p><strong>❌ Rejected Consent (${rejectedIssues.length}):</strong></p>
                                <ul>
                                    ${rejectedIssues.map(issue => `
                                        <li><strong>${issue.coAuthorName}</strong> (${issue.coAuthorEmail})
                                            <br><small>Rejected on: ${issue.reportedAt.toLocaleDateString()}</small>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                            
                            ${noResponseIssues.length > 0 ? `
                                <p><strong>⏰ No Response (${noResponseIssues.length}):</strong></p>
                                <ul>
                                    ${noResponseIssues.map(issue => `
                                        <li><strong>${issue.coAuthorName}</strong> (${issue.coAuthorEmail})
                                            <br><small>Failed to respond before: ${issue.reportedAt.toLocaleDateString()}</small>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                            
                            <hr>
                            <h3>Next Steps:</h3>
                            <ul>
                                <li>Contact the Editor if you believe this was a mistake</li>
                                <li>Resolve consent issues with your co-authors before resubmitting</li>
                                <li>You may submit a new manuscript once all co-author consents are secured</li>
                            </ul>
                            
                            <p><em>This is an automated email. The system will not send further notifications about this submission.</em></p>
                        `,
                    });
                    console.log(`📧 [CRON] Auto-rejection email sent to ${author.email}`);
                } catch (emailError) {
                    console.error("❌ Failed to send auto-rejection email:", emailError);
                }
                
                rejectedSubmissions.push(submission.submissionNumber);
                console.log(`❌ [CRON] Submission ${submission.submissionNumber} auto-rejected`);
            }
        }
        
        console.log(`✅ [CRON] Processed ${rejectedSubmissions.length} expired submissions`);
        
        return {
            processed: rejectedSubmissions.length,
            submissions: rejectedSubmissions,
        };
        
    } catch (error) {
        console.error("❌ [CRON] Error in autoRejectExpiredConsents:", error);
        throw new AppError(
            "Failed to process expired consents",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "EXPIRED_CONSENT_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// EDITOR MANUALLY APPROVE SUBMISSION DESPITE CONSENT ISSUES
// ================================================

const editorApproveConsentOverride = async (submissionId, editorId, resolutionNote) => {
    try {
        console.log("🔵 [SERVICE] editorApproveConsentOverride started");
        
        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }
        
        // Verify user is Editor
        const editor = await User.findById(editorId);
        if (!editor || (editor.role !== "EDITOR" && editor.role !== "ADMIN")) {
            throw new AppError(
                "Only editors can override consent issues",
                STATUS_CODES.FORBIDDEN,
                "NOT_EDITOR"
            );
        }
        
        // Check if submission has consent issues
        if (submission.consentDeadlineStatus === "RESOLVED") {
            throw new AppError(
                "Submission has no consent issues to override",
                STATUS_CODES.BAD_REQUEST,
                "NO_CONSENT_ISSUES"
            );
        }
        
        if (submission.consentDeadlineStatus === "AUTO_REJECTED") {
            throw new AppError(
                "Submission has already been auto-rejected. Cannot override.",
                STATUS_CODES.BAD_REQUEST,
                "ALREADY_REJECTED"
            );
        }
        
        // Validate resolution note (required for manual approval)
        if (!resolutionNote || resolutionNote.trim().length < 10) {
            throw new AppError(
                "Please provide at least a brief explanation for manual approval (minimum 10 characters)",
                STATUS_CODES.BAD_REQUEST,
                "RESOLUTION_NOTE_TOO_SHORT"
            );
        }
        
        // Mark all unresolved issues as resolved by this editor
        const resolvedCount = submission.consentIssues.filter(issue => !issue.resolvedAt).length;
        
        for (const issue of submission.consentIssues) {
            if (!issue.resolvedAt) {
                issue.resolvedAt = new Date();
                issue.resolvedBy = editorId;
                issue.resolutionNote = resolutionNote;
            }
        }
        
        // Update consent status
        submission.consentDeadlineStatus = "RESOLVED";
        
        // Move from DRAFT to SUBMITTED
        if (submission.status === "DRAFT") {
            submission.status = "SUBMITTED";
        }
        
        // Add internal note with audit trail
        submission.internalNotes.push({
            note: `Editor ${editor.firstName} ${editor.lastName} manually approved submission despite ${resolvedCount} consent issue(s). Reason: ${resolutionNote}`,
            addedBy: editorId,
            isConfidential: true,
            addedAt: new Date(),
        });
        
        await submission.save();
        
        // Notify author
        const author = await User.findById(submission.author);
        if (author) {
            try {
                const issueDetails = submission.consentIssues
                    .filter(i => i.resolvedBy && i.resolvedBy.equals(editorId))
                    .map(i => `${i.coAuthorName} (${i.issueType})`)
                    .join(", ");
                
                await sendEmail({
                    to: author.email,
                    subject: `✅ Submission Approved by Editor - ${submission.submissionNumber}`,
                    html: `
                        <h2>Submission Manually Approved by Editor</h2>
                        <p>Dear ${author.firstName} ${author.lastName},</p>
                        <p>Your manuscript has been <strong>manually approved</strong> by the Editor and can now proceed with the review process.</p>
                        
                        <p><strong>Submission Number:</strong> ${submission.submissionNumber}</p>
                        <p><strong>Title:</strong> ${submission.title}</p>
                        
                        <hr>
                        
                        <h3>Approval Details:</h3>
                        <p><strong>Approved by:</strong> ${editor.firstName} ${editor.lastName}</p>
                        <p><strong>Issues Resolved:</strong> ${resolvedCount}</p>
                        <p><strong>Co-authors with issues:</strong> ${issueDetails}</p>
                        
                        <p><strong>Editor's Note:</strong></p>
                        <blockquote style="border-left: 4px solid #28a745; padding-left: 15px; color: #555;">
                            ${resolutionNote}
                        </blockquote>
                        
                        <hr>
                        
                        <p>✅ Your submission status has been changed from <strong>DRAFT</strong> to <strong>SUBMITTED</strong>.</p>
                        <p>The review process will now continue normally.</p>
                    `,
                });
                console.log(`📧 [SERVICE] Approval notification sent to ${author.email}`);
            } catch (emailError) {
                console.error("❌ Failed to send approval email:", emailError);
            }
        }
        
        console.log("✅ [SERVICE] editorApproveConsentOverride completed successfully");
        
        return {
            message: "Submission approved successfully",
            submission,
            resolvedCount,
        };
        
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in editorApproveConsentOverride:", error);
        throw new AppError(
            "Failed to approve submission",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_OVERRIDE_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// EXPORTS
// ================================================

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
    getSubmissionTimeline,
    // NEW EXPORTS (Revisions & Decisions):
    submitRevision,
    makeEditorDecision,
    makeTechnicalEditorDecision,
    checkCoAuthorConsentStatus,
    checkReviewerMajorityStatus,
    // NEW EXPORTS (Consent Management):
    autoRejectExpiredConsents,
    editorApproveConsentOverride,
};