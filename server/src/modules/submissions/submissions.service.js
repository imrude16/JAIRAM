import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Submission } from "./submissions.model.js";
import { User } from "../users/users.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import {
    suggestedReviewerInvitationTemplate,
    submissionConfirmationTemplate,
    editorNewSubmissionAlertTemplate,
    submissionApprovedByEditorTemplate,
    technicalReviewAssignmentTemplate,
    manuscriptReviewRequestTemplate,
    authorDecisionTemplate,
} from "../../infrastructure/email/email.template.js";
import { CURRENT_CHECKLIST } from "../../common/constants/checklistQuestions.v1.0.0.js";
import { SubmissionCycle } from "../submissionCycles/submissionCycle.model.js";
import manuscriptVersionService from "../manuscriptVersions/manuscriptVersion.service.js";
import consentService from "../consents/consent.service.js";
import { TechnicalEditor } from "../technicalEditors/technicalEditor.model.js";
import { Reviewer } from "../reviewers/reviewer.model.js";

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

        // ✅ NEW: Always include hidden consent token fields
        query = query.select('+coAuthors.consentToken +coAuthors.consentTokenExpires');

        if (options.populate) {
            query = query
                .populate("author", "firstName lastName email")
                .populate("coAuthors.user", "firstName lastName email")
                .populate("assignedEditor", "firstName lastName email")
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

    // Co-author required
    if (!submission.coAuthors || submission.coAuthors.length === 0) {
        throw new AppError(
            "At least one co-author is required before submitting",
            STATUS_CODES.BAD_REQUEST,
            "CO_AUTHOR_REQUIRED"
        );
    }

    // Corresponding author required
    if (!isMainCorresponding && (!coAuthorCorresponding || coAuthorCorresponding.length === 0)) {
        throw new AppError(
            "Please designate a corresponding author (either yourself or one co-author)",
            STATUS_CODES.BAD_REQUEST,
            "NO_CORRESPONDING_AUTHOR"
        );
    }

    // Only one corresponding author allowed
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

const findTechnicalEditorAssignment = (techEditorDoc, technicalEditorId) => {
    if (!techEditorDoc?.assignedTechnicalEditors?.length) return null;

    return techEditorDoc.assignedTechnicalEditors.find((assignment) => {
        const assignedId = assignment.technicalEditor?._id || assignment.technicalEditor;
        return assignedId?.toString() === technicalEditorId.toString();
    }) || null;
};

const getTechnicalEditorReviewForAssignment = (techEditorDoc, assignment) => {
    const rawReviewEntries = techEditorDoc?.technicalEditorReview;
    const reviewEntries = Array.isArray(rawReviewEntries)
        ? rawReviewEntries
        : rawReviewEntries
            ? [rawReviewEntries]
            : [];
    const assignmentTechnicalEditorId = getIdString(
        assignment?.technicalEditor?._id || assignment?.technicalEditor
    );
    const assignmentEmail = assignment?.technicalEditor?.email?.toLowerCase?.() || null;

    const directMatches = reviewEntries.filter((review) => {
        const reviewUserId = getIdString(review?.user?._id || review?.user);
        const reviewEmail = review?.email?.toLowerCase?.() || null;

        if (assignmentTechnicalEditorId && reviewUserId && assignmentTechnicalEditorId === reviewUserId) {
            return true;
        }

        if (assignmentEmail && reviewEmail && assignmentEmail === reviewEmail) {
            return true;
        }

        return false;
    });

    if (!directMatches.length) return null;

    return directMatches.reduce((latest, current) => {
        const latestTime = new Date(latest?.reviewedAt || 0).getTime();
        const currentTime = new Date(current?.reviewedAt || 0).getTime();
        return currentTime > latestTime ? current : latest;
    });
};

const findReviewerAssignment = (reviewerDoc, reviewerId) => {
    if (!reviewerDoc?.assignedReviewers?.length) return null;

    return reviewerDoc.assignedReviewers.find((assignment) => {
        const assignedId = assignment.reviewer?._id || assignment.reviewer;
        return assignedId?.toString() === reviewerId.toString();
    }) || null;
};

const trackRejectedConsentIssue = (submission, consent) => {
    const coAuthorName = [
        consent.coAuthorFirstName,
        consent.coAuthorLastName,
    ].filter(Boolean).join(" ").trim() || consent.coAuthorEmail;

    const alreadyTracked = submission.consentIssues.some(issue =>
        issue.issueType === "REJECTED" &&
        !issue.resolvedAt &&
        (
            (issue.coAuthorId && consent.coAuthorId && issue.coAuthorId.toString() === consent.coAuthorId.toString()) ||
            issue.coAuthorEmail === consent.coAuthorEmail
        )
    );

    if (!alreadyTracked) {
        submission.consentIssues.push({
            coAuthorId: consent.coAuthorId || undefined,
            coAuthorEmail: consent.coAuthorEmail,
            coAuthorName,
            issueType: "REJECTED",
            reportedAt: new Date(),
        });
    }

    submission.consentDeadlineStatus = "NOTIFIED";
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

const createNextCycle = async (submissionId) => {
    try {
        const latestCycle = await SubmissionCycle.findOne({ submissionId })
            .sort({ cycleNumber: -1 })
            .select("cycleNumber");

        const nextCycleNumber = (latestCycle?.cycleNumber || 0) + 1;

        const cycle = await SubmissionCycle.create({
            submissionId,
            cycleNumber: nextCycleNumber,
            status: "IN_PROGRESS",
        });

        console.log(`🔵 [HELPER] Next cycle ${nextCycleNumber} created for submission ${submissionId}`);
        return cycle;
    } catch (error) {
        console.error("❌ [HELPER] Failed to create next cycle:", error);
        throw new AppError(
            "Failed to create next cycle",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "NEXT_CYCLE_CREATION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GENERATE CLOUDINARY UPLOAD URL (NEW)
// ================================================

const generateUploadUrl = async (userId, payload) => {
    try {
        console.log("🔵 [SERVICE] generateUploadUrl started");

        const { fileName, fileType, uploadType } = payload;

        const { cloudinary } = await import('../../config/cloudinary.js');

        const timestamp = Math.round(Date.now() / 1000);
        const publicId = `submissions/${userId}/${uploadType}_${timestamp}`;

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                public_id: publicId,
                type: 'upload',
                access_mode: 'public',
                resource_type: 'auto',
            },
            process.env.CLOUDINARY_API_SECRET
        );

        console.log("✅ [SERVICE] Upload URL generated");

        return {
            message: "Upload URL generated successfully",
            // CHANGE THIS LINE TOO
            uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto`,
            signature,
            timestamp,
            publicId,
            apiKey: process.env.CLOUDINARY_API_KEY,
            type: 'upload',
            accessMode: 'public',
        };

    } catch (error) {
        console.error("❌ [SERVICE] Error in generateUploadUrl:", error);
        throw new AppError(
            "Failed to generate upload URL",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "UPLOAD_URL_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// SEARCH AUTHORS (NEW)
// ================================================

const searchAuthors = async (searchQuery, excludeEmails = "") => {
    try {
        console.log("🔵 [SERVICE] searchAuthors started");

        const excludeList = excludeEmails.split(",").filter(Boolean);

        const users = await User.find({
            role: "USER",
            email: { $nin: excludeList },
            isEmailVerified: true,
            status: "ACTIVE",
            $or: [
                { firstName: { $regex: searchQuery, $options: "i" } },
                { lastName: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
                { institution: { $regex: searchQuery, $options: "i" } },
            ],
        })
            .select("firstName lastName email department institution address.country orcid phoneCode mobileNumber")
            .limit(10);

        console.log(`✅ [SERVICE] Found ${users.length} authors`);

        return {
            message: "Authors retrieved successfully",
            authors: users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                department: user.department,
                institution: user.institution,
                country: user.address?.country,
                orcid: user.orcid,
                phoneCode: user.phoneCode,
                mobileNumber: user.mobileNumber,
            })),
        };
    } catch (error) {
        console.error("❌ [SERVICE] Error in searchAuthors:", error);
        throw new AppError(
            "Failed to search authors",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SEARCH_AUTHORS_ERROR",
            { originalError: error.message }
        );
    }
};

const searchAssignableUsersByRole = async (role, searchQuery = "", options = {}) => {
    const {
        excludeEmails = "",
        limit = 10,
    } = options;

    const excludeList = excludeEmails
        .split(",")
        .map(email => email.trim())
        .filter(Boolean);

    const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const normalizedQuery = typeof searchQuery === "string" ? searchQuery.trim() : "";

    const filters = {
        role,
        email: { $nin: excludeList },
        isEmailVerified: true,
        status: "ACTIVE",
    };

    if (normalizedQuery) {
        filters.$or = [
            { firstName: { $regex: normalizedQuery, $options: "i" } },
            { lastName: { $regex: normalizedQuery, $options: "i" } },
            { email: { $regex: normalizedQuery, $options: "i" } },
            { primarySpecialty: { $regex: normalizedQuery, $options: "i" } },
            { institution: { $regex: normalizedQuery, $options: "i" } },
        ];
    }

    return User.find(filters)
        .select("firstName lastName email primarySpecialty otherPrimarySpecialty institution address.country")
        .limit(normalizedLimit);
};

// ================================================
// SEARCH REVIEWERS
// ================================================
// NOTE:
// This endpoint remains in use elsewhere in the product
// for assigning actual platform reviewers. It is no longer
// used by the author suggested-reviewer submission flow,
// which is manual-entry only.

const searchReviewers = async (searchQuery = "", excludeEmails = "", limit = 10) => {
    try {
        console.log("🔵 [SERVICE] searchReviewers started");

        const users = await searchAssignableUsersByRole("REVIEWER", searchQuery, {
            excludeEmails,
            limit,
        });

        console.log(`✅ [SERVICE] Found ${users.length} reviewers`);

        return {
            message: "Reviewers retrieved successfully",
            reviewers: users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                primarySpecialty: user.primarySpecialty === "Other"
                    ? user.otherPrimarySpecialty
                    : user.primarySpecialty,
                institution: user.institution,
                country: user.address?.country,
            })),
        };

    } catch (error) {
        console.error("❌ [SERVICE] Error in searchReviewers:", error);
        throw new AppError(
            "Failed to search reviewers",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SEARCH_REVIEWERS_ERROR",
            { originalError: error.message }
        );
    }
};

const searchTechnicalEditors = async (searchQuery = "", limit = 10) => {
    try {
        console.log("🔵 [SERVICE] searchTechnicalEditors started");

        const users = await searchAssignableUsersByRole("TECHNICAL_EDITOR", searchQuery, {
            limit,
        });

        console.log(`✅ [SERVICE] Found ${users.length} technical editors`);

        return {
            message: "Technical editors retrieved successfully",
            technicalEditors: users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                primarySpecialty: user.primarySpecialty === "Other"
                    ? user.otherPrimarySpecialty
                    : user.primarySpecialty,
                institution: user.institution,
                country: user.address?.country,
            })),
        };
    } catch (error) {
        console.error("❌ [SERVICE] Error in searchTechnicalEditors:", error);
        throw new AppError(
            "Failed to search technical editors",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SEARCH_TECHNICAL_EDITORS_ERROR",
            { originalError: error.message }
        );
    }
};

const getTokenInfo = async (token, type) => {
    try {
        console.log("🔵 [SERVICE] getTokenInfo started");

        let submission = null;

        if (type === "consent") {
            const { Consent } = await import("../consents/consent.model.js");
            const consent = await Consent.findOne({ consentToken: token })
                .select("+consentToken +consentTokenExpires");

            if (!consent) {
                throw new AppError("Invalid or expired token", STATUS_CODES.BAD_REQUEST, "INVALID_TOKEN");
            }

            if (consent.consentTokenExpires < new Date()) {
                throw new AppError("This consent link has expired", STATUS_CODES.BAD_REQUEST, "TOKEN_EXPIRED");
            }

            submission = await Submission.findById(consent.submissionId)
                .select("title submissionNumber status");

        } else if (type === "reviewer-invitation") {
            submission = await Submission.findOne({
                "suggestedReviewers.invitationToken": token,
            }).select("title submissionNumber suggestedReviewers");

            if (!submission) {
                throw new AppError("Invalid or expired token", STATUS_CODES.BAD_REQUEST, "INVALID_TOKEN");
            }

            const reviewer = submission.suggestedReviewers.find(
                r => r.invitationToken === token
            );

            if (!reviewer) {
                throw new AppError("Invalid or expired token", STATUS_CODES.BAD_REQUEST, "INVALID_TOKEN");
            }

            if (reviewer.invitationTokenExpires < new Date()) {
                throw new AppError("This invitation link has expired", STATUS_CODES.BAD_REQUEST, "TOKEN_EXPIRED");
            }

            if (reviewer.invitationStatus !== "PENDING") {
                throw new AppError(
                    `You have already ${reviewer.invitationStatus.toLowerCase()} this invitation`,
                    STATUS_CODES.BAD_REQUEST,
                    "ALREADY_RESPONDED"
                );
            }
        }

        return {
            message: "Token info retrieved successfully",
            info: {
                submissionNumber: submission.submissionNumber,
                title: submission.title,
            },
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            "Failed to retrieve token info",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "TOKEN_INFO_ERROR",
            { originalError: error.message }
        );
    }
};

const sendReviewerInvitationEmail = async (submission, reviewer, token) => {
    try {
        const email = reviewer.email;
        const name = `${reviewer.firstName} ${reviewer.lastName}`;

        const acceptUrl = `${process.env.FRONTEND_URL}/reviewer-invitation?token=${token}&action=accept`;
        const rejectUrl = `${process.env.FRONTEND_URL}/reviewer-invitation?token=${token}&action=reject`;

        await sendEmail({
            to: email,
            subject: `Review Invitation - ${submission.submissionNumber}`,
            html: suggestedReviewerInvitationTemplate({
                name,
                submissionTitle: submission.title,
                submissionNumber: submission.submissionNumber,
                articleType: submission.articleType,
                acceptUrl,
                rejectUrl,
            }),
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
        console.log(`🔵 [SERVICE] getSubmissionById: ${submissionId} by user: ${userId} (${userRole})`);

        // ═══════════════════════════════════════════════════════════
        // STEP 1: FETCH USER EMAIL (needed for co-author check)
        // ═══════════════════════════════════════════════════════════

        const user = await User.findById(userId).select("email").lean();
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 2: FETCH SUBMISSION WITH POPULATIONS
        // ═══════════════════════════════════════════════════════════

        const submission = await Submission.findById(submissionId)
            .populate("author", "firstName lastName email")
            .populate("assignedEditor", "firstName lastName email")
            .populate("consentIssues.resolvedBy", "firstName lastName email")
            .select("+coAuthors.consentToken +coAuthors.consentTokenExpires"); // Include hidden fields for permission check

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 3: CHECK VIEW PERMISSION
        // ═══════════════════════════════════════════════════════════

        let isAssignedReviewer = false;
        if (userRole === "REVIEWER") {
            const reviewerDoc = await Reviewer.findOne({
                submissionId: submissionId,
                "assignedReviewers.reviewer": userId,
            });
            const assignment = findReviewerAssignment(reviewerDoc, userId);
            isAssignedReviewer = !!assignment && assignment.status !== "REJECT";
        }

        const permissionCheck = await checkCanViewSubmission(submission, userId, userRole, user.email, isAssignedReviewer);

        if (!permissionCheck.canView) {
            throw new AppError(
                "You do not have permission to view this submission",
                STATUS_CODES.FORBIDDEN,
                "FORBIDDEN"
            );
        }

        console.log(`✅ [SERVICE] Permission granted: ${permissionCheck.viewLevel}`);

        // ═══════════════════════════════════════════════════════════
        // STEP 4: CONVERT TO PLAIN OBJECT AND FILTER
        // ═══════════════════════════════════════════════════════════

        // Convert mongoose document to plain object
        const submissionObj = submission.toObject();

        // Enrich detail response with assignment data from reviewer/technical editor collections.
        if (userRole === "EDITOR" || userRole === "ADMIN") {
            const [technicalEditorDoc, reviewerDoc] = await Promise.all([
                TechnicalEditor.findOne({ submissionId: submission._id, cycleId: submission.currentCycleId })
                    .populate("assignedTechnicalEditors.technicalEditor", "firstName lastName email")
                    .select("assignedTechnicalEditors technicalEditorReview")
                    .lean(),
                Reviewer.findOne({ submissionId: submission._id })
                    .populate("assignedReviewers.reviewer", "firstName lastName email")
                    .select("assignedReviewers reviewerFeedback")
                    .lean(),
            ]);

            submissionObj._assignedTechnicalEditors =
                technicalEditorDoc?.assignedTechnicalEditors?.map((assignment) => ({
                    reviewEntry: getTechnicalEditorReviewForAssignment(technicalEditorDoc, assignment),
                    technicalEditor: assignment.technicalEditor || null,
                    status: assignment.status || "PENDING",
                    assignedDate: assignment.assignedDate || null,
                    respondedAt: assignment.respondedAt || null,
                    rejectionReason: assignment.rejectionReason || null,
                    reviewFiles: null,
                })) || [];

            submissionObj._assignedTechnicalEditors = submissionObj._assignedTechnicalEditors.map((assignment) => ({
                technicalEditor: assignment.technicalEditor,
                status: assignment.status,
                assignedDate: assignment.assignedDate,
                respondedAt: assignment.respondedAt,
                rejectionReason: assignment.rejectionReason,
                reviewFiles:
                    assignment.status === "ACCEPT" && assignment.reviewEntry?.revisedManuscript
                        ? {
                            revisedManuscript: assignment.reviewEntry.revisedManuscript,
                            reviewedAt: assignment.reviewEntry.reviewedAt || null,
                        }
                        : null,
            }));

            submissionObj._assignedReviewers =
                reviewerDoc?.assignedReviewers?.map((assignment) => {
                    const matchedFeedback = getReviewerFeedbackForAssignment(reviewerDoc, assignment);

                    return {
                        reviewer: assignment.reviewer || null,
                        status: assignment.status || "PENDING",
                        assignedDate: assignment.assignedDate || null,
                        respondedAt: assignment.respondedAt || null,
                        rejectionReason: assignment.rejectionReason || null,
                        isAnonymous: assignment.isAnonymous ?? true,
                        reviewFiles: matchedFeedback
                            ? {
                                revisedManuscript: matchedFeedback.revisedManuscript || null,
                                responseToEditorComments: matchedFeedback.responseToEditorComments || null,
                                reviewedAt: matchedFeedback.reviewedAt || null,
                            }
                            : null,
                    };
                }) || [];
        }

        // Enrich co-author response with linked user details while preserving raw ObjectId.
        const coAuthorUserIds = (submissionObj.coAuthors || [])
            .map((coAuthor) => coAuthor.user)
            .filter(Boolean)
            .map((id) => id.toString());

        if (coAuthorUserIds.length > 0) {
            const linkedUsers = await User.find({
                _id: { $in: coAuthorUserIds },
            })
                .select("firstName lastName email")
                .lean();

            const linkedUserMap = new Map(
                linkedUsers.map((linkedUser) => [
                    linkedUser._id.toString(),
                    {
                        _id: linkedUser._id,
                        firstName: linkedUser.firstName,
                        lastName: linkedUser.lastName,
                        email: linkedUser.email,
                    },
                ])
            );

            submissionObj.coAuthors = submissionObj.coAuthors.map((coAuthor) => ({
                ...coAuthor,
                userDetails: coAuthor.user
                    ? linkedUserMap.get(coAuthor.user.toString()) || null
                    : null,
            }));
        }

        if (permissionCheck.viewLevel === "FULL" && submission.currentCycleId) {
            const currentCycle = await SubmissionCycle.findById(submission.currentCycleId)
                .select("editorRemarksForAuthor")
                .lean();

            submissionObj._editorRemarksForAuthor = currentCycle?.editorRemarksForAuthor || null;
        }

        const filteredSubmission = filterSubmissionByViewLevel(
            submissionObj,
            permissionCheck.viewLevel,
            permissionCheck.showTimeline
        );

        console.log("✅ [SERVICE] getSubmissionById completed successfully");

        return filteredSubmission;

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in getSubmissionById:", error);
        throw new AppError(
            "Failed to retrieve submission",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_SUBMISSION_ERROR",
            { originalError: error.message }
        );
    }
};

// ═══════════════════════════════════════════════════════════════════
// ✅ NEW HELPER FUNCTIONS - ADD THESE AFTER getSubmissionById
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if user can view submission and determine access level
 */
const checkCanViewSubmission = async (submission, userId, userRole, userEmail, isAssignedReviewer = false) => {
    // Admin and Editor can view all submissions
    if (userRole === "ADMIN" || userRole === "EDITOR") {
        return { canView: true, viewLevel: "FULL", showTimeline: false };
    }

    // Extract author ID (handle both populated and non-populated)
    const authorId = submission.author?._id || submission.author;

    // Author can view their own submission (full access + timeline)
    if (authorId.toString() === userId.toString()) {
        return { canView: true, viewLevel: "FULL", showTimeline: true };
    }

    // Technical Editor can view if assigned
    if (userRole === "TECHNICAL_EDITOR") {
        const currentCycle = await SubmissionCycle.getCurrentCycle(submission._id);
        if (currentCycle) {
            const techEditorDoc = await TechnicalEditor.getCurrentCycleDoc(
                submission._id,
                currentCycle._id
            );
            const assignment = findTechnicalEditorAssignment(techEditorDoc, userId);
            if (assignment && assignment.status !== "REJECT") {
                return { canView: true, viewLevel: "FULL", showTimeline: false };
            }
        }
    }
    // Reviewer can view if assigned
    // if (userRole === "REVIEWER" && submission.assignedReviewers) {
    //     const isAssigned = submission.assignedReviewers.some(r => {
    //         const reviewerId = r.reviewer?._id || r.reviewer;
    //         return reviewerId.toString() === userId.toString();
    //     });
    //     if (isAssigned) {
    //         return { canView: true, viewLevel: "FULL", showTimeline: false };
    //     }
    // }
    if (userRole === "REVIEWER" && isAssignedReviewer) {
        return { canView: true, viewLevel: "FULL", showTimeline: false };
    }

    // Co-author access
    if (submission.coAuthors && submission.coAuthors.length > 0) {
        const userCoAuthor = submission.coAuthors.find((ca) => {
            const linkedId = ca.user?._id || ca.user;
            const isUserLinked = linkedId && linkedId.toString() === userId.toString();
            const isUserEmail = ca.email && userEmail && ca.email.toLowerCase() === userEmail.toLowerCase();
            return isUserLinked || isUserEmail;
        });

        if (userCoAuthor) {
            const { Consent } = await import("../consents/consent.model.js");

            const consent = await Consent.findOne({
                submissionId: submission._id,
                $or: [
                    ...(userCoAuthor.user ? [{ coAuthorId: userId }] : []),
                    ...(userEmail ? [{ coAuthorEmail: userEmail }] : []),
                ],
            }).select("status");

            const consentStatus = consent?.status || "PENDING";

            if (consentStatus === "REJECTED") {
                return { canView: false, viewLevel: "NONE", showTimeline: false };
            }

            if (consentStatus === "APPROVED" && userCoAuthor.isCorresponding) {
                return { canView: true, viewLevel: "FULL", showTimeline: false };
            }

            return { canView: true, viewLevel: "MINIMAL", showTimeline: false };
        }
    }

    // No access
    return { canView: false, viewLevel: "NONE", showTimeline: false };
};

/**
 * Filter submission data based on view level
 */
const filterSubmissionByViewLevel = (submission, viewLevel, showTimeline) => {
    // MINIMAL VIEW: Only basic info for non-corresponding co-authors
    if (viewLevel === "MINIMAL") {
        return {
            id: submission._id,
            submissionNumber: submission.submissionNumber,
            title: submission.title,
            runningTitle: submission.runningTitle,
            abstract: submission.abstract,
            articleType: submission.articleType,
            author: {
                firstName: submission.author?.firstName,
                lastName: submission.author?.lastName
            },
            status: submission.status,
            submittedAt: submission.submittedAt,
            viewLevel: "MINIMAL",
        };
    }

    // FULL VIEW: Create deep copy properly
    const response = JSON.parse(JSON.stringify(submission));

    // Remove timeline if user is not the author
    if (!showTimeline && response.timeline) {
        delete response.timeline;
    }

    // Always remove sensitive tokens from response
    if (response.coAuthors && Array.isArray(response.coAuthors)) {
        response.coAuthors.forEach(ca => {
            delete ca.consentToken;
            delete ca.consentTokenExpires;
        });
    }

    if (response.suggestedReviewers && Array.isArray(response.suggestedReviewers)) {
        response.suggestedReviewers.forEach(r => {
            delete r.invitationToken;
            delete r.invitationTokenExpires;
        });
    }

    response.viewLevel = "FULL";
    return response;
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

        if (updates.coAuthors && updates.coAuthors.length > 0) {
            updates.coAuthors = updates.coAuthors.map(coAuthor => {
                if (coAuthor.source === "DATABASE_SEARCH") {
                    return {
                        user: coAuthor.user || null,
                        order: coAuthor.order,
                        isCorresponding: coAuthor.isCorresponding,
                        source: "DATABASE_SEARCH",
                    };
                }
                return coAuthor;
            });
        }

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

        // ═══════════════════════════════════════════════════════════
        // STEP 1: SET SUBMISSION FIELDS
        // ═══════════════════════════════════════════════════════════

        submission.checklist = {
            checklistVersion: CURRENT_CHECKLIST.version,
            responses: payload.checklist.responses,
            copeCompliance: payload.checklist.copeCompliance,
            completedAt: new Date(),
        };

        submission.conflictOfInterest = payload.conflictOfInterest;
        submission.copyrightAgreement = payload.copyrightAgreement;
        submission.pdfPreviewConfirmed = payload.pdfPreviewConfirmed;

        // Initialize suggested reviewer responses tracking
        submission.suggestedReviewerResponses = {
            totalSuggested: submission.suggestedReviewers.length,
            accepted: 0,
            declined: 0,
            pending: submission.suggestedReviewers.length,
            majorityMet: false,
        };

        // ═══════════════════════════════════════════════════════════
        // STEP 2: ✅ CREATE CONSENT RECORDS (ALL CO-AUTHORS)
        // ═══════════════════════════════════════════════════════════

        const consentRecords = [];

        if (submission.coAuthors && submission.coAuthors.length > 0) {
            console.log(`🔐 [CONSENT] Creating consent records for ${submission.coAuthors.length} co-author(s)`);

            for (const coAuthor of submission.coAuthors) {
                try {

                    let consentCoAuthorData = {
                        user: coAuthor.user || null,
                        email: coAuthor.email,
                        firstName: coAuthor.firstName,
                        lastName: coAuthor.lastName,
                        phoneNumber: coAuthor.phoneNumber,
                        source: coAuthor.source,
                    };

                    if (coAuthor.source === "DATABASE_SEARCH" && coAuthor.user) {
                        const coAuthorUser = await User.findById(coAuthor.user)
                            .select("firstName lastName email");
                        if (coAuthorUser) {
                            consentCoAuthorData = {
                                ...consentCoAuthorData,
                                email: coAuthorUser.email,
                                firstName: coAuthorUser.firstName,
                                lastName: coAuthorUser.lastName,
                            };
                        }
                    }

                    const { consent, token } = await consentService.createConsent(
                        submission._id,
                        consentCoAuthorData
                    );

                    consentRecords.push({ consent, token, coAuthor, emailData: consentCoAuthorData });

                    console.log(`✅ [CONSENT] Consent created for ${coAuthor.email} (${coAuthor.source})`);
                } catch (consentError) {
                    console.error(`❌ [CONSENT] Failed to create consent for ${coAuthor.email}:`, consentError);
                }
            }

            if (consentRecords.length > 0) {
                submission.consentDeadlineStatus = "ACTIVE";
            }
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 3: GENERATE SUGGESTED REVIEWER INVITATION TOKENS
        // ═══════════════════════════════════════════════════════════

        for (let i = 0; i < submission.suggestedReviewers.length; i++) {
            const token = submission.generateReviewerInvitationToken(i);
            console.log(`📧 [REVIEWER] Invitation token generated for ${submission.suggestedReviewers[i].email}`);
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 4: UPDATE STATUS TO SUBMITTED
        // ═══════════════════════════════════════════════════════════

        // ✅ Only generate submission number if it doesn't already exist
        // if (!submission.submissionNumber) {
        //     submission.submissionNumber = await submission.generateSubmissionNumber();
        // }
        submission.updateStatus("SUBMITTED");

        // ═══════════════════════════════════════════════════════════
        // STEP 5: CREATE INITIAL CYCLE AND VERSION
        // ═══════════════════════════════════════════════════════════

        try {
            const cycle = await createInitialCycle(submission._id);
            submission.currentCycleId = cycle._id;

            const fileRefs = [submission.blindManuscriptFile];
            if (submission.coverLetter) fileRefs.push(submission.coverLetter);
            if (submission.figures) fileRefs.push(...submission.figures);
            if (submission.tables) fileRefs.push(...submission.tables);
            if (submission.supplementaryFiles) fileRefs.push(...submission.supplementaryFiles);

            await manuscriptVersionService.createManuscriptVersion(
                submission._id,
                cycle._id,
                userId,
                "USER",
                fileRefs
            );

            const { Reviewer } = await import("../reviewers/reviewer.model.js");
            await Reviewer.create({
                submissionId: submission._id,
                cycleId: cycle._id,
                assignedReviewers: [],
                reviewerFeedback: [],
            });
            await TechnicalEditor.create({
                submissionId: submission._id,
                cycleId: cycle._id,
                assignedTechnicalEditors: [],
                technicalEditorReview: [],
            });
            console.log("🟢 [SERVICE] Reviewer document created");

            console.log("🟢 [SERVICE] Initial cycle and version created for submitted manuscript");
        } catch (cycleError) {
            console.error("❌ [SERVICE] Failed to create cycle/version:", cycleError);
            // Continue with submission even if cycle creation fails
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 6: SAVE SUBMISSION
        // ═══════════════════════════════════════════════════════════

        await submission.save();

        console.log("✅ [SERVICE] Submission saved with consent tokens");

        // ═══════════════════════════════════════════════════════════
        // STEP 7: ✅ SEND CONSENT EMAILS (ALL CO-AUTHORS) - ASYNC
        // ═══════════════════════════════════════════════════════════

        if (consentRecords.length > 0) {
            console.log(`📧 [CONSENT] Queuing consent emails to ${consentRecords.length} co-author(s)`);

            // Fire-and-forget: send emails in background without awaiting
            setImmediate(async () => {
                for (const { token, coAuthor, emailData } of consentRecords) {
                    try {
                        await consentService.sendConsentEmail(submission, emailData, token);
                        console.log(`✅ [CONSENT] Email sent to ${coAuthor.email}`);
                    } catch (emailError) {
                        console.error(`❌ [CONSENT] Failed to send email:`, emailError.message);
                    }
                }
            });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 8: SEND SUGGESTED REVIEWER INVITATION EMAILS - ASYNC
        // ═══════════════════════════════════════════════════════════

        if (submission.suggestedReviewers && submission.suggestedReviewers.length > 0) {
            // Fire-and-forget: send emails in background without awaiting
            setImmediate(async () => {
                for (const reviewer of submission.suggestedReviewers) {
                    try {
                        const token = reviewer.invitationToken;
                        await sendReviewerInvitationEmail(submission, reviewer, token);
                        console.log(`✅ [REVIEWER] Invitation email sent to ${reviewer.email}`);
                    } catch (emailError) {
                        console.error(`❌ [REVIEWER] Failed to send invitation to ${reviewer.email}:`, emailError.message);
                    }
                }
            });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 9: SEND CONFIRMATION EMAIL TO AUTHOR - ASYNC
        // ═══════════════════════════════════════════════════════════

        const author = await User.findById(userId);
        if (author) {
            // Fire-and-forget: send email in background without awaiting
            setImmediate(async () => {
                try {
                    await sendEmail({
                        to: author.email,
                        subject: `Submission Confirmation - ${submission.submissionNumber}`,
                        html: submissionConfirmationTemplate({
                            authorName: `${author.firstName} ${author.lastName}`,
                            submissionNumber: submission.submissionNumber,
                            title: submission.title,
                            articleType: submission.articleType,
                            coAuthorCount: submission.coAuthors?.length || 0,
                        }),
                    });
                    console.log("✅ [EMAIL] Confirmation email sent to author");
                } catch (emailError) {
                    console.error("❌ [EMAIL] Failed to send confirmation email:", emailError);
                }
            });
        }

        console.log("✅ [SERVICE] submitManuscript completed successfully");

        if (author) {
            setImmediate(async () => {
                try {
                    const editors = await User.find({
                        role: "EDITOR",
                        status: "ACTIVE",
                        isEmailVerified: true,
                    }).select("firstName lastName email");

                    for (const editor of editors) {
                        try {
                            await sendEmail({
                                to: editor.email,
                                subject: `New Submission Received - ${submission.submissionNumber}`,
                                html: editorNewSubmissionAlertTemplate({
                                    editorName: `${editor.firstName} ${editor.lastName}`,
                                    submissionNumber: submission.submissionNumber,
                                    title: submission.title,
                                    articleType: submission.articleType,
                                    authorName: `${author.firstName} ${author.lastName}`,
                                    authorEmail: author.email,
                                    coAuthorCount: submission.coAuthors?.length || 0,
                                    submittedAt: submission.createdAt || new Date(),
                                }),
                            });
                        } catch (emailError) {
                            console.error(`❌ [EMAIL] Failed to send new submission alert to ${editor.email}:`, emailError);
                        }
                    }
                } catch (editorFetchError) {
                    console.error("❌ [EMAIL] Failed to queue editor submission alerts:", editorFetchError);
                }
            });
        }

        return {
            message: "Manuscript submitted successfully",
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in submitManuscript:", error);
        throw new AppError(
            "Failed to submit manuscript",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SUBMIT_MANUSCRIPT_ERROR",
            { originalError: error.message }
        );
    }
};

const resubmitAuthorRevision = async (submissionId, userId, payload) => {
    try {
        console.log("🔵 [SERVICE] resubmitAuthorRevision started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (submission.author.toString() !== userId) {
            throw new AppError("Only the author can resubmit this manuscript", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        if (submission.status !== "REVISION_REQUESTED") {
            throw new AppError(
                "This manuscript is not currently awaiting author revision",
                STATUS_CODES.BAD_REQUEST,
                "REVISION_NOT_REQUESTED"
            );
        }

        if (!payload.coverLetter?.fileUrl) {
            throw new AppError("Cover letter is required", STATUS_CODES.BAD_REQUEST, "COVER_LETTER_REQUIRED");
        }

        if (!payload.blindManuscriptFile?.fileUrl) {
            throw new AppError("Blind manuscript file is required", STATUS_CODES.BAD_REQUEST, "MANUSCRIPT_FILE_REQUIRED");
        }

        submission.coverLetter = payload.coverLetter;
        submission.blindManuscriptFile = payload.blindManuscriptFile;
        submission.figures = payload.figures || [];
        submission.tables = payload.tables || [];
        submission.supplementaryFiles = payload.supplementaryFiles || [];
        submission.isRevision = true;
        submission.revisionStage = "INITIAL_SUBMISSION";
        submission.$locals.isAuthorRevisionResubmit = true;

        submission.updateStatus("SUBMITTED");

        const cycle = await createNextCycle(submission._id);
        submission.currentCycleId = cycle._id;

        const fileRefs = [submission.blindManuscriptFile];
        if (submission.coverLetter) fileRefs.push(submission.coverLetter);
        if (submission.figures?.length > 0) fileRefs.push(...submission.figures);
        if (submission.tables?.length > 0) fileRefs.push(...submission.tables);
        if (submission.supplementaryFiles?.length > 0) fileRefs.push(...submission.supplementaryFiles);

        const version = await manuscriptVersionService.createManuscriptVersion(
            submission._id,
            cycle._id,
            userId,
            "USER",
            fileRefs,
            "INITIAL_SUBMISSION"
        );

        const { Reviewer } = await import("../reviewers/reviewer.model.js");
        await Reviewer.findOneAndUpdate(
            { submissionId: submission._id },
            {
                $set: {
                    cycleId: cycle._id,
                    assignedReviewers: [],
                    reviewerFeedback: [],
                },
            },
            { upsert: true }
        );

        const techEditorResetResult = await TechnicalEditor.updateMany(
            { submissionId: submission._id },
            {
                $set: {
                    cycleId: cycle._id,
                    assignedTechnicalEditors: [],
                    technicalEditorReview: [],
                },
            }
        );

        if (!techEditorResetResult.matchedCount) {
            await TechnicalEditor.create({
                submissionId: submission._id,
                cycleId: cycle._id,
                assignedTechnicalEditors: [],
                technicalEditorReview: [],
            });
        }

        await submission.save();

        console.log("✅ [SERVICE] resubmitAuthorRevision completed successfully");

        return {
            message: "Revised manuscript submitted successfully",
            submission,
            cycle,
            version,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in resubmitAuthorRevision:", error);
        throw new AppError(
            "Failed to resubmit revised manuscript",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "AUTHOR_REVISION_RESUBMIT_ERROR",
            { originalError: error.message }
        );
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
            const currentUser = await User.findById(userId).select("email");
            const currentEmail = currentUser?.email || null;

            query.$or = [
                { author: userId },
                {
                    coAuthors: {
                        $elemMatch: {
                            $or: [
                                { user: userId },
                                ...(currentEmail ? [{ email: currentEmail }] : []),
                            ],
                        },
                    },
                },
            ];
        } else if (userRole === "REVIEWER") {
            const reviewerDocs = await Reviewer.find({
                assignedReviewers: {
                    $elemMatch: {
                        reviewer: userId,
                        status: { $in: ["PENDING", "ACCEPT"] },
                    },
                },
            }).select("submissionId");
            const submissionIds = reviewerDocs.map(r => r.submissionId);
            query._id = { $in: submissionIds };
            query.status = { $ne: "DRAFT" };
        } else if (userRole === "TECHNICAL_EDITOR") {
            const techEditorDocs = await TechnicalEditor.find({
                assignedTechnicalEditors: {
                    $elemMatch: {
                        technicalEditor: userId,
                        status: { $in: ["PENDING", "ACCEPT"] },
                    },
                },
            })
                .sort({ updatedAt: 1 })
                .select("submissionId");

            const submissionIds = [...new Set(techEditorDocs.map(doc => doc.submissionId?.toString()))];

            query._id = { $in: submissionIds };
            query.status = { $ne: "DRAFT" };
        } else if (userRole === "EDITOR" || userRole === "ADMIN") {
            query.status = { $ne: "DRAFT" };
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
                .limit(limit)
                .lean(),
            Submission.countDocuments(query),
        ]);

        // ── EDITOR role: enrich with assignment info from TechnicalEditor + Reviewer collections ──
        if (userRole === "EDITOR" || userRole === "ADMIN") {
            const submissionIds = submissions.map(s => s._id);

            const { Reviewer } = await import("../reviewers/reviewer.model.js");

            const [techEditorDocs, reviewerDocs] = await Promise.all([
                TechnicalEditor.find({ submissionId: { $in: submissionIds } })
                    .sort({ updatedAt: 1 })
                    .populate("assignedTechnicalEditors.technicalEditor", "firstName lastName")
                    .select("submissionId assignedTechnicalEditors")
                    .lean(),
                Reviewer.find({ submissionId: { $in: submissionIds } })
                    .populate("assignedReviewers.reviewer", "firstName lastName")
                    .select("submissionId assignedReviewers")
                    .lean(),
            ]);

            // Build maps: submissionId → doc
            const teMap = {};
            for (const doc of techEditorDocs) {
                teMap[doc.submissionId?.toString()] = doc;
            }
            const rvMap = {};
            for (const doc of reviewerDocs) {
                rvMap[doc.submissionId?.toString()] = doc;
            }

            // Merge into each submission
            for (const sub of submissions) {
                const key = sub._id?.toString();
                sub._assignedTechEditor = teMap[key] ?? null;
                sub._assignedReviewers = rvMap[key] ?? null;
            }
        }

        if (userRole === "USER") {
            const currentUser = await User.findById(userId).select("email").lean();
            const currentEmail = currentUser?.email?.toLowerCase() || null;

            for (const sub of submissions) {
                const myCoAuthorEntry = sub.coAuthors?.find((ca) => {
                    const linkedId = ca.user?._id || ca.user;
                    const linkedMatch = linkedId && linkedId.toString() === userId.toString();
                    const emailMatch = ca.email && currentEmail && ca.email.toLowerCase() === currentEmail;
                    return linkedMatch || emailMatch;
                }) || null;

                sub._myCoAuthorEntry = myCoAuthorEntry
                    ? {
                        isCorresponding: !!myCoAuthorEntry.isCorresponding,
                        order: myCoAuthorEntry.order ?? null,
                    }
                    : null;
            }
        }

        // ── TECHNICAL_EDITOR role: enrich with assignment status + editor remarks ──
        if (userRole === "TECHNICAL_EDITOR") {
            const submissionIds = submissions.map(s => s._id);
            const currentUser = await User.findById(userId).select("email").lean();
            const currentEmail = currentUser?.email?.toLowerCase() || null;

            const techEditorDocs = await TechnicalEditor.find({
                submissionId: { $in: submissionIds },
            })
                .sort({ updatedAt: 1 })
                .select("submissionId assignedTechnicalEditors technicalEditorReview")
                .lean();

            const teMap = {};
            for (const doc of techEditorDocs) {
                teMap[doc.submissionId?.toString()] = doc;
            }

            for (const sub of submissions) {
                const key = sub._id?.toString();
                const techEditorDoc = teMap[key] ?? null;
                const assignment = findTechnicalEditorAssignment(techEditorDoc, userId);
                const matchingReview = getTechnicalEditorReviewForAssignment(techEditorDoc, assignment);
                const isCurrentTechnicalEditorReview = !!matchingReview?.reviewedAt;

                sub._technicalEditorAssignmentStatus = assignment?.status || "PENDING";
                sub._technicalEditorRespondedAt = assignment?.respondedAt || null;
                sub._technicalEditorRejectionReason = assignment?.rejectionReason || null;
                sub._technicalEditorReviewSubmitted = isCurrentTechnicalEditorReview;
                sub._editorRemarksForTechEditor = sub.currentCycleId?.editorRemarksForTechEditor || null;
            }
        }

        // ── REVIEWER role: enrich with assignment status + editor remarks ──
        if (userRole === "REVIEWER") {
            const submissionIds = submissions.map(s => s._id);
            const currentUser = await User.findById(userId).select("email").lean();
            const currentEmail = currentUser?.email?.toLowerCase() || null;

            const reviewerDocs = await Reviewer.find({
                submissionId: { $in: submissionIds },
            })
                .select("submissionId assignedReviewers reviewerFeedback")
                .lean();

            const reviewerMap = {};
            for (const doc of reviewerDocs) {
                reviewerMap[doc.submissionId?.toString()] = doc;
            }

            for (const sub of submissions) {
                const key = sub._id?.toString();
                const reviewerDoc = reviewerMap[key] ?? null;
                const assignment = findReviewerAssignment(reviewerDoc, userId);

                sub._reviewerAssignmentStatus = assignment?.status || "PENDING";
                sub._reviewerRespondedAt = assignment?.respondedAt || null;
                sub._reviewerRejectionReason = assignment?.rejectionReason || null;
                sub._reviewerReviewSubmitted = !!(reviewerDoc?.reviewerFeedback || []).some((feedback) => {
                    const feedbackUserId = feedback.user?._id || feedback.user;
                    const feedbackEmail = feedback.email?.toLowerCase?.() || null;
                    return (
                        feedbackUserId?.toString() === userId.toString() ||
                        (currentEmail && feedbackEmail && currentEmail === feedbackEmail)
                    );
                });
                sub._editorRemarksForReviewer = sub.currentCycleId?.editorRemarksForReviewers || null;
            }
        }

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

const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return value._id.toString();
    if (typeof value.toString === "function") return value.toString();
    return null;
};

const getCycleWindow = (cycles, index) => {
    const cycle = cycles[index];
    const nextCycle = cycles[index + 1] || null;

    return {
        start: cycle?.createdAt ? new Date(cycle.createdAt) : null,
        end: nextCycle?.createdAt ? new Date(nextCycle.createdAt) : null,
    };
};

const isWithinCycleWindow = (dateValue, start, end) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    if (start && date < start) return false;
    if (end && date >= end) return false;

    return true;
};

const pickClosestByDate = (items, targetDate, dateKey) => {
    if (!items?.length) return null;
    if (!targetDate) return items[0];

    const targetTime = new Date(targetDate).getTime();
    if (Number.isNaN(targetTime)) return items[0];

    return items.reduce((best, item) => {
        const bestTime = new Date(best?.[dateKey] || 0).getTime();
        const itemTime = new Date(item?.[dateKey] || 0).getTime();

        return Math.abs(itemTime - targetTime) < Math.abs(bestTime - targetTime) ? item : best;
    });
};

const getReviewerFeedbackForAssignment = (reviewerDoc, assignment) => {
    const feedbackEntries = reviewerDoc?.reviewerFeedback || [];
    const assignmentReviewerId = getIdString(assignment?.reviewer?._id || assignment?.reviewer);
    const assignmentEmail = assignment?.reviewer?.email?.toLowerCase?.() || null;

    const directMatches = feedbackEntries.filter((feedback) => {
        const feedbackUserId = getIdString(feedback?.user?._id || feedback?.user);
        const feedbackEmail = feedback?.email?.toLowerCase?.() || null;

        if (assignmentReviewerId && feedbackUserId && assignmentReviewerId === feedbackUserId) {
            return true;
        }

        if (assignmentEmail && feedbackEmail && assignmentEmail === feedbackEmail) {
            return true;
        }

        return false;
    });

    if (!directMatches.length) return null;

    return directMatches.reduce((latest, current) => {
        const latestTime = new Date(latest?.reviewedAt || 0).getTime();
        const currentTime = new Date(current?.reviewedAt || 0).getTime();
        return currentTime > latestTime ? current : latest;
    });
};

const buildTimelineRemark = ({ version, cycle, cycleIndex, cycles, techDocsByCycleId, reviewerDoc }) => {
    switch (version.currentStage) {
        case "INITIAL_SUBMISSION":
            return null;

        case "EDITOR_TO_TECH_EDITOR":
            return cycle?.editorRemarksForTechEditor || null;

        case "TECH_EDITOR_TO_EDITOR": {
            const techDoc = techDocsByCycleId.get(getIdString(cycle?._id));
            const rawReviews = techDoc?.technicalEditorReview;
            const reviews = Array.isArray(rawReviews)
                ? rawReviews
                : rawReviews
                    ? [rawReviews]
                    : [];
            if (!reviews.length) return null;

            const versionUploaderId = getIdString(version.uploadedBy);
            const versionUploaderEmail =
                typeof version.uploadedBy === "object" ? version.uploadedBy?.email || null : null;

            const directMatches = reviews.filter((review) => {
                const reviewUserId = getIdString(review?.user);
                const reviewEmail = review?.email || null;

                if (versionUploaderId && reviewUserId && versionUploaderId === reviewUserId) {
                    return true;
                }

                if (
                    versionUploaderEmail &&
                    reviewEmail &&
                    versionUploaderEmail.toLowerCase() === reviewEmail.toLowerCase()
                ) {
                    return true;
                }

                return false;
            });

            const matchingReview = directMatches.length
                ? directMatches.reduce((latest, current) => {
                    const latestTime = new Date(latest?.reviewedAt || 0).getTime();
                    const currentTime = new Date(current?.reviewedAt || 0).getTime();
                    return currentTime > latestTime ? current : latest;
                })
                : null;

            if (!matchingReview) return null;

            return {
                recommendation: matchingReview.recommendation || null,
                remarks: matchingReview.remarks || null,
                revisedManuscript: matchingReview.revisedManuscript || null,
                reviewedAt: matchingReview.reviewedAt || null,
            };
        }

        case "EDITOR_TO_REVIEWER":
            return cycle?.editorRemarksForReviewers || null;

        case "EDITOR_TO_AUTHOR":
            return cycle?.editorRemarksForAuthor || null;

        case "REVIEWER_TO_EDITOR": {
            const { start, end } = getCycleWindow(cycles, cycleIndex);

            const versionUploaderId = getIdString(version.uploadedBy);
            const versionUploaderEmail =
                typeof version.uploadedBy === "object" ? version.uploadedBy?.email || null : null;

            const feedbackInCycle = (reviewerDoc?.reviewerFeedback || []).filter((feedback) =>
                isWithinCycleWindow(feedback.reviewedAt, start, end)
            );

            const directMatches = feedbackInCycle.filter((feedback) => {
                const feedbackUserId = getIdString(feedback.user);
                const feedbackEmail = feedback.email || null;

                if (versionUploaderId && feedbackUserId && versionUploaderId === feedbackUserId) {
                    return true;
                }

                if (
                    versionUploaderEmail &&
                    feedbackEmail &&
                    versionUploaderEmail.toLowerCase() === feedbackEmail.toLowerCase()
                ) {
                    return true;
                }

                return false;
            });

            const matchedFeedback = pickClosestByDate(
                directMatches.length > 0 ? directMatches : feedbackInCycle,
                version.createdAt,
                "reviewedAt"
            );

            if (!matchedFeedback) return null;

            return {
                recommendation: matchedFeedback.recommendation || null,
                remarks: matchedFeedback.remarks || null,
                reviewerChecklist: matchedFeedback.reviewerChecklist || null,
                revisedManuscript: matchedFeedback.revisedManuscript || null,
                responseToEditorComments: matchedFeedback.responseToEditorComments || null,
                reviewedAt: matchedFeedback.reviewedAt || null,
            };
        }

        default:
            return null;
    }
};

const getSubmissionTimeline = async (submissionId, userId, userRole) => {
    try {
        console.log("🔵 [SERVICE] getSubmissionTimeline started");

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const isPrivilegedUser = userRole === "ADMIN" || userRole === "EDITOR";
        const isAuthor = submission.isUserAuthor(userId);

        if (!isPrivilegedUser && !isAuthor) {
            throw new AppError(
                "You don't have permission to view this submission timeline",
                STATUS_CODES.FORBIDDEN,
                "FORBIDDEN"
            );
        }


        const cycles = await SubmissionCycle.findBySubmission(submissionId);
        const versions = await manuscriptVersionService.getVersionsBySubmission(submissionId);
        const techDocs = await TechnicalEditor.find({ submissionId }).lean();
        const reviewerDoc = await Reviewer.findOne({ submissionId })
            .populate("reviewerFeedback.user", "firstName lastName email role")
            .lean();

        const techDocsByCycleId = new Map(
            techDocs.map((doc) => [getIdString(doc.cycleId), doc])
        );

        const cyclesById = new Map(
            cycles.map((cycle) => [getIdString(cycle._id), cycle])
        );

        const enrichedVersions = versions.map((versionDoc) => {
            const version = versionDoc.toObject();
            const cycleId = getIdString(version.cycleId);
            const cycle = cyclesById.get(cycleId) || null;
            const cycleIndex = cycles.findIndex((c) => getIdString(c._id) === cycleId);

            return {
                ...version,
                cycleId,
                timelineRemark: buildTimelineRemark({
                    version,
                    cycle,
                    cycleIndex,
                    cycles,
                    techDocsByCycleId,
                    reviewerDoc,
                }),
            };
        });

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
                versions: enrichedVersions,
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

const processCoAuthorConsent = async (token, decision, remark = null) => {
    try {
        console.log("🔵 [SERVICE] processCoAuthorConsent started");

        // Process consent
        const consent = await consentService.processConsentResponse(token, decision, remark);

        const submission = await findSubmissionById(consent.submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // If rejected, track issue + notify author
        if (consent.status === "REJECTED") {
            trackRejectedConsentIssue(submission, consent);

            if (submission.status === "SUBMITTED") {
                submission.status = "DRAFT";
            }

            await submission.save();
            await consentService.notifyAuthorOfRejection(submission, consent);
        }

        // If approved, check if all approved
        if (consent.status === "APPROVED") {
            const { Consent } = await import("../consents/consent.model.js");
            const allApproved = await Consent.areAllApproved(consent.submissionId);

            if (allApproved) {
                submission.consentDeadlineStatus = "RESOLVED";

                if (submission.status === "DRAFT") {
                    submission.status = "SUBMITTED";
                }

                await submission.save();
                console.log(`✅ [SERVICE] All consents approved - submission marked RESOLVED`);
            }
        }

        return {
            message: `Consent ${decision === "ACCEPT" ? "accepted" : "rejected"} successfully`,
            needsRegistration: !consent.coAuthorId, // ✅ Tell frontend if registration needed
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in processCoAuthorConsent:", error);
        throw new AppError(
            "Failed to process consent",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// PROCESS CO-AUTHOR CONSENT FROM DASHBOARD
// ================================================

const processCoAuthorConsentFromDashboard = async (submissionId, userId, userEmail, decision, remark = null) => {
    try {
        console.log("🔵 [SERVICE] processCoAuthorConsentFromDashboard started");

        const { Consent } = await import("../consents/consent.model.js");

        // Match registered co-authors by userId, with email fallback for manual-entry flows.
        const consent = await Consent.findOne({
            submissionId,
            $or: [
                { coAuthorId: userId },
                ...(userEmail ? [{ coAuthorEmail: userEmail }] : []),
            ],
        }).select("+consentToken +consentTokenExpires");

        if (!consent) {
            throw new AppError(
                "Consent record not found for this submission",
                STATUS_CODES.NOT_FOUND,
                "CONSENT_NOT_FOUND"
            );
        }

        // Check if token is expired
        if (!consent.consentToken || !consent.consentTokenExpires || consent.consentTokenExpires < Date.now()) {
            return {
                message: "Consent token has expired",
                consentStatus: {
                    status: "EXPIRED",
                    message: "This consent link has expired. Please request a new one from the author.",
                },
            };
        }

        // Process the decision
        if (decision === "ACCEPT") {
            consent.approve();
        } else if (decision === "REJECT") {
            consent.reject(remark || "");
        }

        await consent.save();

        // Check if all consents approved
        if (consent.status === "APPROVED") {
            const allApproved = await Consent.areAllApproved(submissionId);

            const submission = await findSubmissionById(submissionId);
            if (submission && allApproved) {
                submission.consentDeadlineStatus = "RESOLVED";

                if (submission.status === "DRAFT") {
                    submission.status = "SUBMITTED";
                }

                await submission.save();
                console.log(`✅ [SERVICE] All consents approved - submission marked RESOLVED`);
            }
        }

        // Notify author if rejected
        if (consent.status === "REJECTED") {
            const submission = await findSubmissionById(submissionId);
            if (submission) {
                trackRejectedConsentIssue(submission, consent);

                if (submission.status === "SUBMITTED") {
                    submission.status = "DRAFT";
                }

                await submission.save();
                await consentService.notifyAuthorOfRejection(submission, consent);
            }
        }

        return {
            message: `Consent ${decision === "ACCEPT" ? "accepted" : "rejected"} successfully`,
            consentStatus: {
                status: consent.status,
                respondedAt: consent.respondedAt,
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in processCoAuthorConsentFromDashboard:", error);
        throw new AppError(
            "Failed to process consent",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_PROCESS_ERROR",
            { originalError: error.message }
        );
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

        const consentResult = await checkCoAuthorConsentStatus(submissionId);
        const check = submission.canMoveToReview(consentResult.consentStatus);

        if (!check.canMove) {
            throw new AppError(
                check.reason,
                STATUS_CODES.BAD_REQUEST,
                "COAUTHOR_CONSENT_REQUIRED",
                {
                    total: check.total,
                    approved: check.approved,
                    pending: check.pending,
                    rejected: check.rejected,
                }
            );
        }

        submission.updateStatus("UNDER_REVIEW");

        submission.internalNotes.push({
            note: `Moved to peer review after all ${check.total} co-author consent(s) were approved`,
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

// ⬇️⬇️⬇️ REPLACE FROM HERE

const updateSuggestedReviewerEditorApproval = async (submissionId, reviewerIndex, editorApproved, editorId, editorRole) => {
    try {
        console.log("🔵 [SERVICE] updateSuggestedReviewerEditorApproval started");

        if (editorRole !== "ADMIN" && editorRole !== "EDITOR") {
            throw new AppError("Only editors can approve suggested reviewers", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        if (editorApproved !== true) {
            throw new AppError(
                "Suggested reviewer approval can only be set to true",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_SUGGESTED_REVIEWER_APPROVAL_ACTION"
            );
        }

        const submission = await findSubmissionById(submissionId);

        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        if (!submission.suggestedReviewers || !submission.suggestedReviewers[reviewerIndex]) {
            throw new AppError(
                "Suggested reviewer not found at the provided index",
                STATUS_CODES.NOT_FOUND,
                "SUGGESTED_REVIEWER_NOT_FOUND",
                { reviewerIndex }
            );
        }

        const reviewer = submission.suggestedReviewers[reviewerIndex];

        if (reviewer.editorApproved === true) {
            throw new AppError(
                "Suggested reviewer has already been approved by editor",
                STATUS_CODES.BAD_REQUEST,
                "SUGGESTED_REVIEWER_ALREADY_APPROVED",
                { reviewerIndex }
            );
        }

        reviewer.editorApproved = editorApproved;

        submission.markModified("suggestedReviewers");
        submission.internalNotes.push({
            note: `Suggested reviewer ${reviewer.email || `${reviewer.firstName || ""} ${reviewer.lastName || ""}`.trim() || reviewerIndex} marked as editor approved`,
            addedBy: editorId,
            isConfidential: true,
        });

        await submission.save();

        console.log("✅ [SERVICE] updateSuggestedReviewerEditorApproval completed successfully");

        return {
            message: "Suggested reviewer approved successfully",
            reviewer: submission.suggestedReviewers[reviewerIndex],
            submission,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in updateSuggestedReviewerEditorApproval:", error);
        throw new AppError(
            "Failed to update suggested reviewer approval",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SUGGESTED_REVIEWER_APPROVAL_ERROR",
            { originalError: error.message }
        );
    }
};

const submitRevision = async (userId, payload) => {
    try {
        console.log("🔵 [SERVICE] submitRevision started");

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Validate submitterRoleType (isRevision = true)
        validateSubmitterRoleType(user, payload.submitterRoleType, true);

        // ═══════════════════════════════════════════════════════════
        // STEP 1: FIND ORIGINAL SUBMISSION
        // ═══════════════════════════════════════════════════════════

        const submission = await Submission.findById(payload.originalSubmissionId);
        if (!submission) {
            throw new AppError(
                "Original submission not found",
                STATUS_CODES.NOT_FOUND,
                "ORIGINAL_SUBMISSION_NOT_FOUND"
            );
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 2: GET CURRENT CYCLE
        // ═══════════════════════════════════════════════════════════

        const currentCycle = await SubmissionCycle.findById(submission.currentCycleId);
        if (!currentCycle) {
            throw new AppError(
                "No active cycle found for this submission",
                STATUS_CODES.BAD_REQUEST,
                "NO_ACTIVE_CYCLE"
            );
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 3: VERIFY USER HAS PERMISSION FOR THIS STAGE
        // ═══════════════════════════════════════════════════════════

        if (payload.submitterRoleType === "Editor") {
            if (!submission.assignedEditor ||
                submission.assignedEditor.toString() !== userId) {
                throw new AppError(
                    "You are not the assigned editor for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_EDITOR"
                );
            }
        }
        else if (payload.submitterRoleType === "Technical Editor") {
            const techEditorDoc = await TechnicalEditor.getCurrentCycleDoc(
                submission._id,
                currentCycle._id
            );
            const assignment = findTechnicalEditorAssignment(techEditorDoc, userId);
            if (!assignment) {
                throw new AppError(
                    "You are not assigned as technical editor for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_TECH_EDITOR"
                );
            }

            if (assignment.status !== "ACCEPT") {
                throw new AppError(
                    "You must accept the assignment before submitting technical editor feedback",
                    STATUS_CODES.FORBIDDEN,
                    "TECH_EDITOR_ASSIGNMENT_NOT_ACCEPTED"
                );
            }
        }
        else if (payload.submitterRoleType === "Reviewer") {
            const reviewerDoc = await Reviewer.findOne({
                submissionId: submission._id,
            });
            const assignment = findReviewerAssignment(reviewerDoc, userId);
            if (!assignment) {
                throw new AppError(
                    "You are not assigned as reviewer for this submission",
                    STATUS_CODES.FORBIDDEN,
                    "NOT_ASSIGNED_REVIEWER"
                );
            }
            if (assignment.status !== "ACCEPT") {
                throw new AppError(
                    "You must accept the assignment before submitting reviewer feedback",
                    STATUS_CODES.FORBIDDEN,
                    "REVIEWER_ASSIGNMENT_NOT_ACCEPTED"
                );
            }
        }

        // // ═══════════════════════════════════════════════════════════
        // // STEP 3: GET CURRENT CYCLE
        // // ═══════════════════════════════════════════════════════════

        // const currentCycle = await SubmissionCycle.findById(submission.currentCycleId);
        // if (!currentCycle) {
        //     throw new AppError(
        //         "No active cycle found for this submission",
        //         STATUS_CODES.BAD_REQUEST,
        //         "NO_ACTIVE_CYCLE"
        //     );
        // }

        // ═══════════════════════════════════════════════════════════
        // STEP 4: ENFORCE SINGLE SUBMISSION RULES
        // ═══════════════════════════════════════════════════════════
        if (payload.revisionStage === "TECH_EDITOR_TO_EDITOR") {
            const techEditorDoc = await TechnicalEditor.getCurrentCycleDocLean(
                submission._id,
                currentCycle._id
            );
            const rawTechnicalEditorReviews = techEditorDoc?.technicalEditorReview;
            const technicalEditorReviews = Array.isArray(rawTechnicalEditorReviews)
                ? rawTechnicalEditorReviews
                : rawTechnicalEditorReviews
                    ? [rawTechnicalEditorReviews]
                    : [];
            const existingReview = technicalEditorReviews.find((review) => {
                const reviewUserId = review?.user?.toString?.() || review?.user || null;
                const reviewEmail = review?.email?.toLowerCase?.() || null;
                return (
                    reviewUserId?.toString() === userId.toString() ||
                    (user.email && reviewEmail && user.email.toLowerCase() === reviewEmail)
                );
            }) || null;
            const hasRealTechnicalEditorSubmission = !!existingReview;

            if (hasRealTechnicalEditorSubmission) {
                throw new AppError(
                    "Technical Editor has already submitted review for this cycle (only 1 chance allowed)",
                    STATUS_CODES.FORBIDDEN,
                    "TECH_EDITOR_ALREADY_SUBMITTED"
                );
            }
        }

        if (payload.revisionStage === "REVIEWER_TO_EDITOR") {
            const { Reviewer } = await import("../reviewers/reviewer.model.js");
            const reviewerDoc = await Reviewer.findOne({ submissionId: submission._id });
            const alreadySubmitted = reviewerDoc?.reviewerFeedback.some(
                f => f.email === user.email || (f.user && f.user.toString() === userId)
            );
            if (alreadySubmitted) {
                throw new AppError(
                    "You have already submitted your review for this cycle (only 1 chance allowed)",
                    STATUS_CODES.FORBIDDEN,
                    "REVIEWER_ALREADY_SUBMITTED"
                );
            }
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 5: BUILD FILE REFS
        // ═══════════════════════════════════════════════════════════

        const fileRefs = [];
        if (payload.revisedManuscript) {
            fileRefs.push(payload.revisedManuscript);
        }
        if (payload.responseToEditorComments) {
            fileRefs.push(payload.responseToEditorComments);
        }
        if (payload.attachments && payload.attachments.length > 0) {
            fileRefs.push(...payload.attachments);
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 6: CREATE MANUSCRIPT VERSION
        // ═══════════════════════════════════════════════════════════

        const version = await manuscriptVersionService.createManuscriptVersion(
            submission._id,
            currentCycle._id,
            userId,
            user.role,
            fileRefs,
            payload.revisionStage,
        );

        // ═══════════════════════════════════════════════════════════
        // STEP 7: UPDATE CYCLE BASED ON REVISION STAGE
        // ═══════════════════════════════════════════════════════════

        const attachmentObjects = payload.attachments
            ? payload.attachments.map(a => ({
                fileName: a.fileName,
                fileUrl: a.fileUrl,
                fileSize: a.fileSize,
                mimeType: a.mimeType,
                uploadedAt: a.uploadedAt,
            }))
            : [];


        switch (payload.revisionStage) {

            case "EDITOR_TO_TECH_EDITOR":
                currentCycle.editorRemarksForTechEditor = {
                    remarks: payload.remarks,
                    attachments: attachmentObjects,
                    sentAt: new Date(),
                };
                break;

            case "TECH_EDITOR_TO_EDITOR": {
                const techEditorDoc = await TechnicalEditor.getCurrentCycleDoc(
                    submission._id,
                    currentCycle._id
                );
                if (!techEditorDoc) {
                    throw new AppError(
                        "Technical Editor record not found for this cycle",
                        STATUS_CODES.NOT_FOUND,
                        "TECH_EDITOR_DOC_NOT_FOUND"
                    );
                }

                const techEditorUser = await User.findById(userId);

                if (!Array.isArray(techEditorDoc.technicalEditorReview)) {
                    techEditorDoc.technicalEditorReview = techEditorDoc.technicalEditorReview
                        ? [techEditorDoc.technicalEditorReview]
                        : [];
                }

                techEditorDoc.technicalEditorReview.push({
                    user: userId,
                    email: techEditorUser?.email,
                    recommendation: payload.recommendation,
                    remarks: payload.remarks,
                    revisedManuscript: payload.revisedManuscript || null,
                    reviewedAt: new Date(),
                });

                await techEditorDoc.save();
                break;
            }

            case "EDITOR_TO_REVIEWER":
                currentCycle.editorRemarksForReviewers = {
                    remarks: payload.remarks,
                    attachments: attachmentObjects,
                    sentAt: new Date(),
                };
                break;

            case "REVIEWER_TO_EDITOR":
                const reviewerDoc = await Reviewer.findOne({ submissionId: submission._id });
                if (!reviewerDoc) {
                    throw new AppError("Reviewer document not found", STATUS_CODES.NOT_FOUND, "REVIEWER_DOC_NOT_FOUND");
                }
                reviewerDoc.reviewerFeedback.push({
                    user: userId,
                    email: user.email,
                    recommendation: payload.recommendation,
                    remarks: payload.remarks,
                    confidentialToEditor: payload.confidentialToEditor,
                    reviewerChecklist: payload.reviewerChecklist,
                    revisedManuscript: payload.revisedManuscript || null,
                    responseToEditorComments: payload.responseToEditorComments || null,
                    reviewedAt: new Date(),
                });
                await reviewerDoc.save();
                break;

            case "EDITOR_TO_AUTHOR":
                currentCycle.editorRemarksForAuthor = {
                    remarks: payload.remarks,
                    attachments: attachmentObjects,
                    sentAt: new Date(),
                };
                break;

            default:
                throw new AppError(
                    "Invalid revision stage",
                    STATUS_CODES.BAD_REQUEST,
                    "INVALID_REVISION_STAGE"
                );
        }

        await currentCycle.save();
        submission.revisionStage = payload.revisionStage;
        await submission.save({ validateBeforeSave: false });

        // ═══════════════════════════════════════════════════════════
        // STEP 8: UPDATE SUBMISSION STATUS IF EDITOR_TO_AUTHOR
        // ═══════════════════════════════════════════════════════════

        if (payload.revisionStage === "EDITOR_TO_AUTHOR") {
            submission.status = "REVISION_REQUESTED";
            currentCycle.status = "REVISION_REQUESTED";

            await currentCycle.save();
            await submission.save({ validateBeforeSave: false });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 9: BUILD AND RETURN RESPONSE
        // ═══════════════════════════════════════════════════════════

        console.log("✅ [SERVICE] submitRevision completed successfully");

        return {
            message: "Revision submitted successfully",
            revision: {
                submissionId: submission._id,
                submissionNumber: submission.submissionNumber,
                revisionStage: payload.revisionStage,
                cycle: currentCycle,
                version,
                submissionStatus: submission.status,
            },
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

// ⬆️⬆️⬆️ REPLACE TO HERE

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

        if (decision === "REJECT") {
            currentCycle.status = "COMPLETED";
            submission.status = "REJECTED";
            submission.rejectedAt = new Date();
        } else if (decision === "ACCEPT") {
            currentCycle.status = "COMPLETED";
            submission.status = "ACCEPTED";
            submission.acceptedAt = new Date();
        }

        await currentCycle.save();
        await submission.save();
        Submission.findById(submission._id)
            .populate("author", "firstName lastName email")
            .lean()
            .then((populatedSubmission) => {
                const authorEmail = populatedSubmission?.author?.email;
                if (!authorEmail) return null;

                return sendEmail({
                    to: authorEmail,
                    subject: `JAIRAM | Manuscript ${decision === "ACCEPT" ? "Accepted" : "Rejected"} - ${submission.submissionId}`,
                    html: authorDecisionTemplate({
                        authorName: `${populatedSubmission.author?.firstName || ""} ${populatedSubmission.author?.lastName || ""}`.trim() || "Author",
                        submissionId: submission.submissionId,
                        title: submission.manuscriptDetails?.title || submission.title,
                        articleType: submission.manuscriptDetails?.articleType || submission.articleType,
                        decision,
                        decisionStage,
                        remarks,
                        decidedAt: decision === "ACCEPT" ? submission.acceptedAt : submission.rejectedAt,
                    }),
                });
            })
            .catch((mailError) => {
                console.error(`? [EMAIL] Failed to send ${decision} notification email to author:`, mailError);
            });


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

// const makeTechnicalEditorDecision = async (submissionId, techEditorId, recommendation, remarks, attachments) => {
//     try {
//         console.log("🔵 [SERVICE] makeTechnicalEditorDecision started");

//         const submission = await findSubmissionById(submissionId);
//         if (!submission) {
//             throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
//         }

//         // Verify user is Technical Editor
//         const techEditor = await User.findById(techEditorId);
//         if (!techEditor || techEditor.role !== "TECHNICAL_EDITOR") {
//             throw new AppError(
//                 "Only technical editors can make decisions",
//                 STATUS_CODES.FORBIDDEN,
//                 "NOT_TECHNICAL_EDITOR"
//             );
//         }

//         // Verify tech editor is assigned to this submission
//         const isAssigned = submission.assignedTechnicalEditors.some(
//             te => te.technicalEditor.toString() === techEditorId
//         );
//         if (!isAssigned) {
//             throw new AppError(
//                 "You are not assigned as technical editor for this submission",
//                 STATUS_CODES.FORBIDDEN,
//                 "NOT_ASSIGNED_TECH_EDITOR"
//             );
//         }

//         // Check if tech editor has already decided (only 1 chance)
//         const existingDecision = await SubmissionCycle.findOne({
//             submissionId: submission._id,
//             "technicalEditorReview.recommendation": { $exists: true }
//         });

//         if (existingDecision) {
//             throw new AppError(
//                 "Technical Editor has already made a decision (only 1 chance allowed)",
//                 STATUS_CODES.FORBIDDEN,
//                 "TECH_EDITOR_ALREADY_DECIDED",
//                 { previousRecommendation: existingDecision.technicalEditorReview.recommendation }
//             );
//         }

//         // Get or create current cycle
//         let currentCycle = await SubmissionCycle.getCurrentCycle(submission._id);

//         if (!currentCycle) {
//             currentCycle = await SubmissionCycle.create({
//                 submissionId: submission._id,
//                 cycleNumber: 1,
//                 status: "IN_PROGRESS",
//             });
//         }

//         // Record decision in SubmissionCycle
//         currentCycle.technicalEditorReview = {
//             reviewedBy: techEditorId,
//             recommendation: recommendation,
//             remarks: remarks,
//             attachmentRefs: attachments ? attachments.map(a => a.fileUrl) : [],
//             reviewedAt: new Date(),
//         };

//         await currentCycle.save();

//         // // If REJECT, end the process immediately
//         // if (decision === "REJECT") {
//         //     submission.status = "REJECTED";
//         //     submission.rejectedAt = new Date();
//         //     await submission.save();
//         // }

//         console.log("✅ [SERVICE] makeTechnicalEditorDecision completed successfully");

//         return {
//             message: `Technical Editor recommendation submitted: ${recommendation}`,
//             submission,
//             note: "Technical Editor has used their only recommendation chance",
//         };

//     } catch (error) {
//         if (error instanceof AppError) throw error;
//         console.error("❌ [SERVICE] Unexpected error in makeTechnicalEditorDecision:", error);
//         throw new AppError(
//             "Failed to make decision",
//             STATUS_CODES.INTERNAL_SERVER_ERROR,
//             "TECH_EDITOR_DECISION_ERROR",
//             { originalError: error.message }
//         );
//     }
// };

// ================================================
// CHECK CO-AUTHOR CONSENT STATUS
// ================================================

const checkCoAuthorConsentStatus = async (submissionId) => {
    try {
        console.log("🔵 [SERVICE] checkCoAuthorConsentStatus started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const { Consent } = await import("../consents/consent.model.js");

        const consents = await Consent.findBySubmission(submissionId);

        if (!consents || consents.length === 0) {
            return {
                message: "Co-author consent records are not available for this submission",
                consentStatus: {
                    allAccepted: false,
                    canProceed: false,
                    message: "Co-author consent records are not available for this submission",
                    total: submission.coAuthors?.length ?? 0,
                    approved: 0,
                    pending: submission.coAuthors?.length ?? 0,
                    rejected: 0,
                    pendingList: (submission.coAuthors || []).map((coAuthor) => ({
                        email: coAuthor.email,
                        name: `${coAuthor.firstName || ""} ${coAuthor.lastName || ""}`.trim(),
                    })),
                    rejectedList: [],
                },
            };
        }

        const pending = consents.filter(c => c.status === "PENDING");
        const rejected = consents.filter(c => c.status === "REJECTED");
        const approved = consents.filter(c => c.status === "APPROVED");
        const allAccepted = pending.length === 0 && rejected.length === 0;
        const message = allAccepted
            ? "All co-authors have accepted consent"
            : `${pending.length} pending, ${rejected.length} rejected`;

        return {
            message,
            consentStatus: {
                allAccepted,
                canProceed: allAccepted,
                message,
                total: consents.length,
                approved: approved.length,
                pending: pending.length,
                rejected: rejected.length,
                pendingList: pending.map(c => ({
                    email: c.coAuthorEmail,
                    name: `${c.coAuthorFirstName || ""} ${c.coAuthorLastName || ""}`.trim(),
                })),
                rejectedList: rejected.map(c => ({
                    email: c.coAuthorEmail,
                    remark: c.remark,
                })),
            },
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

const reviewerInvitationResponse = async (token, response) => {
    try {
        console.log("🔵 [SERVICE] reviewerInvitationResponse started");

        const submission = await Submission.findOne({
            "suggestedReviewers.invitationToken": token,
        }).select("+suggestedReviewers.invitationToken +suggestedReviewers.invitationTokenExpires");

        if (!submission) {
            throw new AppError(
                "Invalid or expired invitation token",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_TOKEN"
            );
        }

        const reviewerIndex = submission.suggestedReviewers.findIndex(
            r => r.invitationToken === token
        );

        if (reviewerIndex === -1) {
            throw new AppError(
                "Invalid or expired invitation token",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_TOKEN"
            );
        }

        const reviewer = submission.suggestedReviewers[reviewerIndex];

        // Check token expiry
        if (reviewer.invitationTokenExpires < new Date()) {
            throw new AppError(
                "This invitation link has expired",
                STATUS_CODES.BAD_REQUEST,
                "TOKEN_EXPIRED"
            );
        }

        // Check already responded
        if (reviewer.invitationStatus !== "PENDING") {
            throw new AppError(
                `You have already ${reviewer.invitationStatus.toLowerCase()} this invitation`,
                STATUS_CODES.BAD_REQUEST,
                "ALREADY_RESPONDED"
            );
        }

        // Update invitation status
        submission.suggestedReviewers[reviewerIndex].invitationStatus =
            response === "ACCEPT" ? "ACCEPTED" : "DECLINED";

        // Update response counts
        if (response === "ACCEPT") {
            submission.suggestedReviewerResponses.accepted += 1;
        } else {
            submission.suggestedReviewerResponses.declined += 1;
        }
        submission.suggestedReviewerResponses.pending -= 1;

        // Check majority
        const { accepted, totalSuggested } = submission.suggestedReviewerResponses;
        const required = Math.ceil(totalSuggested / 2);
        if (accepted >= required) {
            submission.suggestedReviewerResponses.majorityMet = true;
        }

        // Clear token after use
        submission.suggestedReviewers[reviewerIndex].invitationToken = undefined;
        submission.suggestedReviewers[reviewerIndex].invitationTokenExpires = undefined;

        await submission.save({ validateBeforeSave: false });

        console.log("✅ [SERVICE] reviewerInvitationResponse completed");

        return {
            message: response === "ACCEPT"
                ? "Thank you for accepting the review invitation"
                : "You have declined the review invitation",
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in reviewerInvitationResponse:", error);
        throw new AppError(
            "Failed to process invitation response",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "INVITATION_RESPONSE_ERROR",
            { originalError: error.message }
        );
    }
};

// ════════════════════════════════════════════════════════════════
// NEW FUNCTIONS FOR CONSENT MANAGEMENT (CRON + EDITOR OVERRIDE)
// ════════════════════════════════════════════════════════════════

// ================================================
// AUTO-REJECT SUBMISSIONS WITH EXPIRED CONSENT DEADLINES + 48HR REMINDERS (ENHANCED CRON JOB)
// ================================================

const autoRejectExpiredConsents = async () => {
    try {
        console.log("🔵 [CRON] Starting consent deadline checks...");

        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // ═══════════════════════════════════════════════════════════
        // CHECK 1: Send 48-hour reminders (ACTIVE → REMINDED)
        // ═══════════════════════════════════════════════════════════

        const reminderSubmissions = await Submission.find({
            consentDeadlineStatus: "ACTIVE",
            "coAuthors": {
                $elemMatch: {
                    consentStatus: "PENDING",
                    consentTokenExpires: { $lte: now, $gte: sevenDaysAgo }
                }
            },
            createdAt: { $lte: fortyEightHoursAgo }
        }).populate("author", "firstName lastName email");

        console.log(`⚠️ [CRON] Found ${reminderSubmissions.length} submissions needing 48hr reminder`);

        for (const submission of reminderSubmissions) {
            const pendingCoAuthors = submission.coAuthors.filter(ca =>
                ca.consentStatus === "PENDING"
            );

            if (pendingCoAuthors.length > 0) {
                // Change status to REMINDED
                submission.consentDeadlineStatus = "REMINDED";

                // Add internal note
                submission.internalNotes.push({
                    note: `48-hour reminder: ${pendingCoAuthors.length} co-author(s) have not responded. Author notified.`,
                    addedBy: submission.author,
                    isConfidential: true,
                    addedAt: new Date(),
                });

                await submission.save();

                // Send reminder email to author
                const author = submission.author;
                try {
                    await sendEmail({
                        to: author.email,
                        subject: `⏰ Reminder: Co-Author Consent Pending - ${submission.submissionNumber}`,
                        html: `
                            <h2>Co-Author Consent Reminder</h2>
                            <p>Dear ${author.firstName} ${author.lastName},</p>
                            <p>This is a reminder that <strong>${pendingCoAuthors.length} co-author(s)</strong> have not yet responded to your manuscript consent request:</p>
                            <p><strong>Submission Number:</strong> ${submission.submissionNumber || "Draft"}</p>
                            <p><strong>Title:</strong> ${submission.title}</p>
                            <hr>
                            
                            <p><strong>⏳ Pending Co-Authors (${pendingCoAuthors.length}):</strong></p>
                            <ul>
                                ${pendingCoAuthors.map(ca => `
                                    <li><strong>${ca.firstName} ${ca.lastName}</strong> (${ca.email})
                                        <br><small>Invited: ${ca.consentTokenExpires ? new Date(ca.consentTokenExpires.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}</small>
                                    </li>
                                `).join('')}
                            </ul>
                            
                            <hr>
                            <p>⚠️ <strong>Important:</strong> You have <strong>5 days remaining</strong> for all co-authors to respond. If they do not respond within 7 days total, your submission will be automatically rejected.</p>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Contact the pending co-author(s) to ensure they received the consent email</li>
                                <li>Ask them to check their spam/junk folder</li>
                                <li>Provide any clarification they may need</li>
                            </ol>
                            
                            <p><em>This is an automated reminder. You will receive only ONE reminder per submission.</em></p>
                        `,
                    });
                    console.log(`📧 [CRON] 48hr reminder sent to ${author.email}`);
                } catch (emailError) {
                    console.error("❌ Failed to send 48hr reminder:", emailError);
                }
            }
        }

        // ═══════════════════════════════════════════════════════════
        // CHECK 2: Auto-reject expired consents (REMINDED → AUTO_REJECTED)
        // ═══════════════════════════════════════════════════════════

        const expiredSubmissions = await Submission.find({
            consentDeadlineStatus: { $in: ["ACTIVE", "REMINDED", "NOTIFIED"] },
            "coAuthors": {
                $elemMatch: {
                    consentStatus: { $in: ["PENDING", "REJECTED"] },
                    consentTokenExpires: { $lte: sevenDaysAgo }
                }
            }
        }).populate("author", "firstName lastName email");

        console.log(`⚠️ [CRON] Found ${expiredSubmissions.length} submissions with expired consent deadlines`);

        const rejectedSubmissions = [];

        for (const submission of expiredSubmissions) {
            const expiredCoAuthors = submission.coAuthors.filter(ca =>
                (ca.consentStatus === "PENDING" || ca.consentStatus === "REJECTED") &&
                ca.consentTokenExpires <= sevenDaysAgo
            );

            if (expiredCoAuthors.length > 0) {
                // Track NO_RESPONSE issues for pending co-authors
                for (const coAuthor of expiredCoAuthors) {
                    if (coAuthor.consentStatus === "PENDING") {
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
                    note: `Submission auto-rejected: Consent deadline expired (7 days). ${noteDetails.join("; ")}`,
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

        console.log(`✅ [CRON] Processed ${reminderSubmissions.length} reminders and ${rejectedSubmissions.length} rejections`);

        return {
            reminders: reminderSubmissions.length,
            rejections: rejectedSubmissions.length,
            rejectedSubmissions,
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
                    html: submissionApprovedByEditorTemplate({
                        authorName: `${author.firstName} ${author.lastName}`,
                        submissionNumber: submission.submissionNumber,
                        title: submission.title,
                        editorName: `${editor.firstName} ${editor.lastName}`,
                        resolvedCount,
                        issueDetails,
                        resolutionNote,
                    }),
                    /*
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
                    */
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

// ════════════════════════════════════════════════════════════════
// EDITOR ASSIGNMENT SERVICE FUNCTIONS (NEW)
// ════════════════════════════════════════════════════════════════

// ================================================
// ASSIGN TECHNICAL EDITOR
// ================================================

const assignTechnicalEditor = async (submissionId, editorId, technicalEditorIds, remarks, revisedManuscript, attachments) => {
    try {
        console.log("🔵 [SERVICE] assignTechnicalEditor started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // Verify editor is assigned
        const editor = await User.findById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError(
                "Only editors can assign technical editors",
                STATUS_CODES.FORBIDDEN,
                "NOT_EDITOR"
            );
        }

        const uniqueTechnicalEditorIds = [...new Set(technicalEditorIds.map((id) => id.toString()))];
        if (uniqueTechnicalEditorIds.length !== technicalEditorIds.length) {
            throw new AppError(
                "Duplicate technical editor IDs found",
                STATUS_CODES.BAD_REQUEST,
                "DUPLICATE_TECHNICAL_EDITORS"
            );
        }

        const technicalEditors = await User.find({
            _id: { $in: uniqueTechnicalEditorIds },
            role: "TECHNICAL_EDITOR",
        });

        if (technicalEditors.length !== uniqueTechnicalEditorIds.length) {
            throw new AppError(
                "One or more technical editor IDs are invalid or users are not technical editors",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_TECHNICAL_EDITOR_IDS"
            );
        }

        // Add internal note
        const technicalEditorNames = technicalEditors
            .map((technicalEditor) => `${technicalEditor.firstName} ${technicalEditor.lastName}`.trim())
            .join(", ");
        submission.internalNotes.push({
            note: `Technical Editor(s) assigned: ${technicalEditorNames}. Remarks: ${remarks}`,
            addedBy: editorId,
            isConfidential: true,
        });

        // Update current cycle with remarks and attachments
        const currentCycle = await SubmissionCycle.findById(submission.currentCycleId);
        let technicalEditorDoc = await TechnicalEditor.findOne({ submissionId: submission._id })
            .sort({ updatedAt: -1 });
        if (!technicalEditorDoc) {
            technicalEditorDoc = await TechnicalEditor.create({
                submissionId: submission._id,
                cycleId: currentCycle._id,
                assignedTechnicalEditors: [],
                technicalEditorReview: [],
            });
        }

        technicalEditorDoc.cycleId = currentCycle._id;

        const alreadyAssignedIds = uniqueTechnicalEditorIds.filter((technicalEditorId) =>
            technicalEditorDoc.assignedTechnicalEditors.some(
                (assignment) => getIdString(assignment.technicalEditor) === technicalEditorId
            )
        );

        if (alreadyAssignedIds.length > 0) {
            throw new AppError(
                "One or more selected technical editors are already assigned to this submission",
                STATUS_CODES.BAD_REQUEST,
                "TECHNICAL_EDITORS_ALREADY_ASSIGNED",
                { technicalEditorIds: alreadyAssignedIds }
            );
        }

        technicalEditorDoc.assignedTechnicalEditors.push(...uniqueTechnicalEditorIds.map((technicalEditorId) => ({
            technicalEditor: technicalEditorId,
            assignedDate: new Date(),
            assignedBy: editorId,
            status: "PENDING",
        })));
        await technicalEditorDoc.save();

        currentCycle.editorRemarksForTechEditor = {
            remarks,
            revisedManuscript,
            attachments: attachments || [],
            sentAt: new Date(),
        };

        const fileRefs = [];
        if (revisedManuscript) {
            fileRefs.push(revisedManuscript);
        }
        if (attachments && attachments.length > 0) {
            fileRefs.push(...attachments);
        }

        const version = await manuscriptVersionService.createManuscriptVersion(
            submission._id,
            currentCycle._id,
            editorId,
            "EDITOR",
            fileRefs,
            "EDITOR_TO_TECH_EDITOR"
        );

        await currentCycle.save();

        await submission.save();

        // Send notification emails without blocking the API response.
        for (const technicalEditor of technicalEditors) {
            void sendEmail({
                to: technicalEditor.email,
                subject: `Technical Review Assignment - ${submission.submissionNumber}`,
                html: technicalReviewAssignmentTemplate({
                    name: `${technicalEditor.firstName} ${technicalEditor.lastName}`,
                    submissionNumber: submission.submissionNumber,
                    title: submission.title,
                    articleType: submission.articleType,
                    remarks,
                    revisedManuscriptName: revisedManuscript?.fileName || "Provided",
                    attachmentCount: attachments?.length || 0,
                }),
                /*
                    <h2>Technical Review Assignment</h2>
                    <p>Dear ${technicalEditor.firstName} ${technicalEditor.lastName},</p>
                    <p>You have been assigned to review the technical aspects of a manuscript:</p>
                    <p><strong>Submission ID:</strong> ${submission.submissionNumber}</p>
                    <p><strong>Title:</strong> ${submission.title}</p>
                    <p><strong>Article Type:</strong> ${submission.articleType}</p>
                    <hr>
                    <p><strong>Editor's Remarks:</strong></p>
                    <p>${remarks}</p>
                    <p><strong>Revised Manuscript:</strong> ${revisedManuscript?.fileName || "Provided"}</p>
                    ${attachments && attachments.length > 0 ? `
                        <p><strong>Attachments:</strong> ${attachments.length} file(s)</p>
                    ` : ''}
                    <p>Please log in to the platform to review the manuscript and submit your decision.</p>
                */
            })
                .then(() => {
                    console.log(`📧 Technical editor notification sent to ${technicalEditor.email}`);
                })
                .catch((emailError) => {
                    console.error("❌ Failed to send technical editor notification:", emailError);
                });
        }

        console.log("✅ [SERVICE] assignTechnicalEditor completed successfully");

        return {
            message: `${technicalEditors.length} technical editor(s) assigned successfully`,
            submission,
            currentCycle,
            version,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in assignTechnicalEditor:", error);
        throw new AppError(
            "Failed to assign technical editor",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "ASSIGN_TECHNICAL_EDITOR_ERROR",
            { originalError: error.message }
        );
    }
};

const respondToTechnicalEditorAssignment = async (submissionId, technicalEditorId, decision, rejectionReason) => {
    try {
        console.log("🔵 [SERVICE] respondToTechnicalEditorAssignment started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const technicalEditor = await User.findById(technicalEditorId);
        if (!technicalEditor || technicalEditor.role !== "TECHNICAL_EDITOR") {
            throw new AppError(
                "Only technical editors can respond to assignment",
                STATUS_CODES.FORBIDDEN,
                "NOT_TECHNICAL_EDITOR"
            );
        }

        const currentCycle = await SubmissionCycle.getCurrentCycle(submission._id);
        if (!currentCycle) {
            throw new AppError(
                "Active submission cycle not found",
                STATUS_CODES.NOT_FOUND,
                "CYCLE_NOT_FOUND"
            );
        }

        const techEditorDoc = await TechnicalEditor.getCurrentCycleDoc(submission._id, currentCycle._id);
        if (!techEditorDoc) {
            throw new AppError(
                "Technical editor assignment record not found",
                STATUS_CODES.NOT_FOUND,
                "TECH_EDITOR_DOC_NOT_FOUND"
            );
        }

        const assignment = findTechnicalEditorAssignment(techEditorDoc, technicalEditorId);
        if (!assignment) {
            throw new AppError(
                "You are not assigned as technical editor for this submission",
                STATUS_CODES.FORBIDDEN,
                "NOT_ASSIGNED_TECH_EDITOR"
            );
        }

        if (assignment.status !== "PENDING") {
            throw new AppError(
                `Assignment has already been responded to with status ${assignment.status}`,
                STATUS_CODES.BAD_REQUEST,
                "TECH_EDITOR_ASSIGNMENT_ALREADY_RESPONDED"
            );
        }

        assignment.status = decision;
        assignment.respondedAt = new Date();
        assignment.rejectionReason = decision === "REJECT" ? rejectionReason.trim() : null;

        await techEditorDoc.save();

        return {
            message: `Technical editor assignment ${decision === "ACCEPT" ? "accepted" : "rejected"} successfully`,
            assignmentStatus: assignment.status,
            respondedAt: assignment.respondedAt,
            rejectionReason: assignment.rejectionReason,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in respondToTechnicalEditorAssignment:", error);
        throw new AppError(
            "Failed to respond to technical editor assignment",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "TECH_EDITOR_ASSIGNMENT_RESPONSE_ERROR",
            { originalError: error.message }
        );
    }
};

const respondToReviewerAssignment = async (submissionId, reviewerId, decision, rejectionReason) => {
    try {
        console.log("🔵 [SERVICE] respondToReviewerAssignment started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        const reviewerUser = await User.findById(reviewerId);
        if (!reviewerUser || reviewerUser.role !== "REVIEWER") {
            throw new AppError(
                "Only reviewers can respond to assignment",
                STATUS_CODES.FORBIDDEN,
                "NOT_REVIEWER"
            );
        }

        const reviewerDoc = await Reviewer.findOne({ submissionId: submission._id });
        if (!reviewerDoc) {
            throw new AppError(
                "Reviewer assignment record not found",
                STATUS_CODES.NOT_FOUND,
                "REVIEWER_DOC_NOT_FOUND"
            );
        }

        const assignment = findReviewerAssignment(reviewerDoc, reviewerId);
        if (!assignment) {
            throw new AppError(
                "You are not assigned as reviewer for this submission",
                STATUS_CODES.FORBIDDEN,
                "NOT_ASSIGNED_REVIEWER"
            );
        }

        if (assignment.status !== "PENDING") {
            throw new AppError(
                `Assignment has already been responded to with status ${assignment.status}`,
                STATUS_CODES.BAD_REQUEST,
                "REVIEWER_ASSIGNMENT_ALREADY_RESPONDED"
            );
        }

        assignment.status = decision;
        assignment.respondedAt = new Date();
        assignment.rejectionReason = decision === "REJECT" ? rejectionReason.trim() : null;

        await reviewerDoc.save();

        return {
            message: `Reviewer assignment ${decision === "ACCEPT" ? "accepted" : "rejected"} successfully`,
            assignmentStatus: assignment.status,
            respondedAt: assignment.respondedAt,
            rejectionReason: assignment.rejectionReason,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in respondToReviewerAssignment:", error);
        throw new AppError(
            "Failed to respond to reviewer assignment",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "REVIEWER_ASSIGNMENT_RESPONSE_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// ASSIGN REVIEWERS
// ================================================

const assignReviewers = async (submissionId, editorId, reviewerIds, remarks, revisedManuscript, attachments) => {
    try {
        console.log("🔵 [SERVICE] assignReviewers started");

        const submission = await findSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // Verify editor
        const editor = await User.findById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError(
                "Only editors can assign reviewers",
                STATUS_CODES.FORBIDDEN,
                "NOT_EDITOR"
            );
        }

        // Verify all reviewers exist and have correct role
        const reviewers = await User.find({
            _id: { $in: reviewerIds },
            role: "REVIEWER"
        });

        if (reviewers.length !== reviewerIds.length) {
            throw new AppError(
                "One or more reviewer IDs are invalid or users are not reviewers",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_REVIEWER_IDS"
            );
        }

        // Check for duplicates
        const uniqueReviewerIds = [...new Set(reviewerIds)];
        if (uniqueReviewerIds.length !== reviewerIds.length) {
            throw new AppError(
                "Duplicate reviewer IDs found",
                STATUS_CODES.BAD_REQUEST,
                "DUPLICATE_REVIEWERS"
            );
        }

        // Add to assignedReviewers (skip if already assigned)
        // for (const reviewerId of reviewerIds) {
        //     const alreadyAssigned = submission.assignedReviewers.some(
        //         r => r.reviewer.toString() === reviewerId
        //     );

        //     if (!alreadyAssigned) {
        //         submission.assignedReviewers.push({
        //             reviewer: reviewerId,
        //             assignedDate: new Date(),
        //             dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        //             status: "PENDING",
        //             isAnonymous: true,
        //         });
        //     }
        // }
        // Update Reviewer document with assigned reviewers
        const { Reviewer } = await import("../reviewers/reviewer.model.js");
        const reviewerDoc = await Reviewer.findOne({ submissionId: submission._id });
        if (reviewerDoc) {
            for (const reviewerId of reviewerIds) {
                const alreadyAssigned = reviewerDoc.assignedReviewers.some(
                    r => r.reviewer.toString() === reviewerId
                );
                if (!alreadyAssigned) {
                    reviewerDoc.assignedReviewers.push({
                        reviewer: reviewerId,
                        assignedDate: new Date(),
                        status: "PENDING",
                        isAnonymous: true,
                    });
                }
            }
            await reviewerDoc.save();
        }

        // Add internal note
        submission.internalNotes.push({
            note: `${reviewers.length} reviewer(s) assigned. Remarks: ${remarks}`,
            addedBy: editorId,
            isConfidential: true,
        });

        // Update current cycle
        const currentCycle = await SubmissionCycle.findById(submission.currentCycleId);
        let version = null;

        if (currentCycle) {
            currentCycle.editorRemarksForReviewers = {
                remarks,
                revisedManuscript,
                attachments: attachments || [],
                sentAt: new Date(),
            };

            const fileRefs = [];
            if (revisedManuscript) {
                fileRefs.push(revisedManuscript);
            }
            if (attachments && attachments.length > 0) {
                fileRefs.push(...attachments);
            }

            version = await manuscriptVersionService.createManuscriptVersion(
                submission._id,
                currentCycle._id,
                editorId,
                "EDITOR",
                fileRefs,
                "EDITOR_TO_REVIEWER"
            );

            await currentCycle.save();
        }

        await submission.save();

        // Send notification emails to all reviewers without blocking the API response.
        for (const reviewer of reviewers) {
            void sendEmail({
                to: reviewer.email,
                subject: `Manuscript Review Request - ${submission.submissionNumber}`,
                html: manuscriptReviewRequestTemplate({
                    name: `${reviewer.firstName} ${reviewer.lastName}`,
                    submissionNumber: submission.submissionNumber,
                    title: submission.title,
                    articleType: submission.articleType,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    remarks,
                    revisedManuscriptName: revisedManuscript?.fileName || "Provided",
                    attachmentCount: attachments?.length || 0,
                }),
                /*
                    <h2>Manuscript Review Request</h2>
                    <p>Dear ${reviewer.firstName} ${reviewer.lastName},</p>
                    <p>You have been invited to review a manuscript:</p>
                    <p><strong>Submission ID:</strong> ${submission.submissionNumber}</p>
                    <p><strong>Title:</strong> ${submission.title}</p>
                    <p><strong>Article Type:</strong> ${submission.articleType}</p>
                    <p><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    <hr>
                    <p><strong>Editor's Remarks:</strong></p>
                    <p>${remarks}</p>
                    <p><strong>Revised Manuscript:</strong> ${revisedManuscript?.fileName || "Provided"}</p>
                    ${attachments && attachments.length > 0 ? `
                        <p><strong>Attachments:</strong> ${attachments.length} file(s)</p>
                    ` : ''}
                    <p>Please log in to the platform to review the manuscript and submit your feedback.</p>
                */
            })
                .then(() => {
                    console.log(`📧 Reviewer notification sent to ${reviewer.email}`);
                })
                .catch((emailError) => {
                    console.error("❌ Failed to send reviewer notification:", emailError);
                });
        }

        console.log("✅ [SERVICE] assignReviewers completed successfully");

        return {
            message: `${reviewers.length} reviewer(s) assigned successfully`,
            submission,
            version,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in assignReviewers:", error);
        throw new AppError(
            "Failed to assign reviewers",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "ASSIGN_REVIEWERS_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// SAVE DRAFT (NEW - PHASE 3)
// ================================================

const saveDraft = async (userId, payload) => {
    try {
        console.log("🔵 [SERVICE] saveDraft started");

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Check if draft already exists
        const existingDraft = await Submission.findOne({
            author: userId,
            status: "DRAFT",
        }).sort({ createdAt: -1 }); // Get most recent draft

        let submission;

        if (existingDraft) {
            // Update existing draft
            Object.keys(payload).forEach(key => {
                if (payload[key] !== undefined) {
                    existingDraft[key] = payload[key];
                }
            });
            existingDraft.lastModifiedAt = new Date();

            // ✅ BYPASS VALIDATION for draft updates
            submission = await existingDraft.save({ validateBeforeSave: false });
            console.log("🟢 [SERVICE] Draft updated:", submission._id);
        } else {
            // ✅ BYPASS VALIDATION for draft creation
            // Set minimal required fields to satisfy Mongoose
            const draftData = {
                ...payload,
                author: userId,
                status: "DRAFT",
                submitterRoleType: "Author", // Default for drafts
            };

            submission = new Submission(draftData);
            await submission.save({ validateBeforeSave: false });
            console.log("🟢 [SERVICE] Draft created:", submission._id);
        }

        await submission.populate("author", "firstName lastName email");

        return {
            message: "Draft saved successfully",
            submission,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in saveDraft:", error);
        throw new AppError(
            "Failed to save draft",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SAVE_DRAFT_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET LATEST DRAFT (NEW - PHASE 3)
// ================================================

const getLatestDraft = async (userId) => {
    try {
        console.log("🔵 [SERVICE] getLatestDraft started");

        const draft = await Submission.findOne({
            author: userId,
            status: "DRAFT",
        })
            .sort({ lastModifiedAt: -1 })
            .populate("author", "firstName lastName email");

        if (!draft) {
            return {
                message: "No draft found",
                draft: null,
            };
        }

        console.log("✅ [SERVICE] Draft found:", draft._id);

        return {
            message: "Draft retrieved successfully",
            draft,
        };

    } catch (error) {
        console.error("❌ [SERVICE] Error in getLatestDraft:", error);
        throw new AppError(
            "Failed to retrieve draft",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_DRAFT_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// DELETE DRAFT (NEW - PHASE 3)
// ================================================

const deleteDraft = async (userId, draftId) => {
    try {
        console.log("🔵 [SERVICE] deleteDraft started");

        const draft = await Submission.findOne({
            _id: draftId,
            author: userId,
            status: "DRAFT",
        });

        if (!draft) {
            throw new AppError(
                "Draft not found or already submitted",
                STATUS_CODES.NOT_FOUND,
                "DRAFT_NOT_FOUND"
            );
        }

        await draft.deleteOne();

        console.log("✅ [SERVICE] Draft deleted:", draftId);

        return {
            message: "Draft deleted successfully",
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Error in deleteDraft:", error);
        throw new AppError(
            "Failed to delete draft",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "DELETE_DRAFT_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET MY PENDING CONSENT INVITATIONS
// ================================================
// Called by USER dashboard to show pending consent requests.
// Queries Consent collection directly by email.
// ENHANCED: Includes token validity info for dashboard integration

const getMyConsentInvitations = async (userId) => {
    try {
        const user = await User.findById(userId).select("email");
        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");

        const { Consent } = await import("../consents/consent.model.js");

        const consents = await Consent.find({
            $or: [
                { coAuthorId: userId },
                { coAuthorEmail: user.email },
            ],
        }).select("submissionId status respondedAt coAuthorEmail coAuthorId consentTokenExpires").lean();

        // Populate submission info
        const submissionIds = consents.map(c => c.submissionId);
        const submissions = await Submission.find(
            { _id: { $in: submissionIds } },
            { title: 1, submissionNumber: 1, articleType: 1, author: 1 }
        ).populate("author", "firstName lastName").lean();

        const subMap = Object.fromEntries(submissions.map(s => [s._id.toString(), s]));

        const result = consents.map(c => {
            // Check token validity
            const isTokenValid = c.status === "PENDING" &&
                c.consentTokenExpires &&
                c.consentTokenExpires > new Date();

            return {
                consentId: c._id,
                submissionId: c.submissionId,
                status: c.status,                          // PENDING / APPROVED / REJECTED
                tokenValid: isTokenValid,                  // NEW: For dashboard button states
                submissionNumber: subMap[c.submissionId?.toString()]?.submissionNumber ?? "—",
                title: subMap[c.submissionId?.toString()]?.title ?? "—",
                articleType: subMap[c.submissionId?.toString()]?.articleType ?? "—",
                mainAuthor: (() => {
                    const a = subMap[c.submissionId?.toString()]?.author;
                    return a ? `${a.firstName} ${a.lastName}`.trim() : "—";
                })(),
                respondedAt: c.respondedAt ?? null,
            };
        });

        return { message: "Consent invitations retrieved", invitations: result };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Failed to get consent invitations", STATUS_CODES.INTERNAL_SERVER_ERROR, "CONSENT_INVITATIONS_ERROR", { originalError: error.message });
    }
};

const getCoAuthorConsentsForSubmission = async (submissionId, userId) => {
    try {
        // Find submission
        const submission = await Submission.findById(submissionId).select("_id author title");
        if (!submission) {
            throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND, "SUBMISSION_NOT_FOUND");
        }

        // Permission check: only author can view consent status of their submission's co-authors
        if (submission.author.toString() !== userId) {
            throw new AppError(
                "Unauthorized: You can only view consent status for your own submissions",
                STATUS_CODES.FORBIDDEN,
                "UNAUTHORIZED_CONSENT_ACCESS"
            );
        }

        // Fetch all consents for this submission
        const { Consent } = await import("../consents/consent.model.js");
        const consents = await Consent.find({ submissionId }).select("coAuthorEmail status respondedAt").lean();

        // Aggregate counts
        const counts = {
            approved: consents.filter(c => c.status === "APPROVED").length,
            pending: consents.filter(c => c.status === "PENDING").length,
            rejected: consents.filter(c => c.status === "REJECTED").length,
        };

        const total = consents.length;

        // Determine aggregated status
        // No consent records means co-author consent is not required / not started,
        // not that "all co-authors approved".
        let aggregatedStatus = "NOT_REQUIRED";
        if (total > 0) {
            if (counts.rejected > 0) {
                aggregatedStatus = "REJECTED";
            } else if (counts.pending > 0) {
                aggregatedStatus = "PENDING";
            } else {
                aggregatedStatus = "APPROVED";
            }
        }

        return {
            message: "Co-author consents retrieved successfully",
            submissionId: submissionId.toString(),
            submissionTitle: submission.title,
            total,
            approved: counts.approved,
            pending: counts.pending,
            rejected: counts.rejected,
            aggregatedStatus,
            consents: consents.map(c => ({
                coAuthorEmail: c.coAuthorEmail,
                status: c.status,
                respondedAt: c.respondedAt ?? null,
            })),
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            "Failed to get co-author consents",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "COAUTHOR_CONSENTS_ERROR",
            { originalError: error.message }
        );
    }
};

export default {
    createSubmission,
    getSubmissionById,
    updateSubmission,
    submitManuscript,
    resubmitAuthorRevision,
    listSubmissions,
    updateStatus,
    updatePaymentStatus,
    assignEditor,
    processCoAuthorConsent,
    processCoAuthorConsentFromDashboard,
    moveToReview,
    updateSuggestedReviewerEditorApproval,
    getSubmissionTimeline,
    submitRevision,
    makeEditorDecision,
    checkCoAuthorConsentStatus,
    checkReviewerMajorityStatus,
    getTokenInfo,
    reviewerInvitationResponse,
    autoRejectExpiredConsents,
    editorApproveConsentOverride,
    assignTechnicalEditor,
    respondToTechnicalEditorAssignment,
    respondToReviewerAssignment,
    assignReviewers,
    generateUploadUrl,
    searchAuthors,
    searchReviewers,
    searchTechnicalEditors,
    saveDraft,
    getLatestDraft,
    deleteDraft,
    getMyConsentInvitations,
    getCoAuthorConsentsForSubmission,
};
