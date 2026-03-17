import submissionService from "./submissions.service.js";
import { sendSuccess } from "../../common/utils/responseHandler.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION CONTROLLER LAYER - COMPLETE VERSION WITH CONSENT TRACKING
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.controller.js
 * Handles HTTP requests and responses
 * + NEW: Controllers for revisions and decisions
 * + NEW: Controllers for consent management (cron + editor override)
 * ════════════════════════════════════════════════════════════════
 */

const createSubmission = async (req, res) => {
    const result = await submissionService.createSubmission(req.user.id, req.body);

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.CREATED
    );
};

const getSubmissionById = async (req, res) => {
    const { id } = req.params;

    const submission = await submissionService.getSubmissionById(
        id,
        req.user.id,
        req.user.role
    );

    sendSuccess(
        res,
        "Submission retrieved successfully",
        submission,  // ✅ CORRECT - service returns the submission directly
        null,
        STATUS_CODES.OK
    );
};

const updateSubmission = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.updateSubmission(
        id,
        req.user.id,
        req.body
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const submitManuscript = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.submitManuscript(
        id,
        req.user.id,
        req.body
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const listSubmissions = async (req, res) => {
    const result = await submissionService.listSubmissions(
        req.user.id,
        req.user.role,
        req.query
    );

    sendSuccess(
        res,
        result.message,
        {
            submissions: result.submissions,
            pagination: result.pagination,
        },
        null,
        STATUS_CODES.OK
    );
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, comments } = req.body;

    const result = await submissionService.updateStatus(
        id,
        req.user.id,
        req.user.role,
        status,
        comments
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;

    const result = await submissionService.updatePaymentStatus(
        id,
        req.user.id,
        paymentStatus,
        note
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const assignEditor = async (req, res) => {
    const { id } = req.params;
    const { editorId } = req.body;

    const result = await submissionService.assignEditor(
        id,
        editorId,
        req.user.id
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const processCoAuthorConsent = async (req, res) => {
    const { consent, token, remark } = req.body;

    const result = await submissionService.processCoAuthorConsent(
        token,
        consent,
        remark
    );

    sendSuccess(
        res,
        result.message,
        null,
        null,
        STATUS_CODES.OK
    );
};

const moveToReview = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.moveToReview(
        id,
        req.user.id,
        req.user.role
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const getSubmissionTimeline = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.getSubmissionTimeline(
        id,
        req.user.id,
        req.user.role
    );

    sendSuccess(
        res,
        result.message,
        { timeline: result.timeline },
        null,
        STATUS_CODES.OK
    );
};

// ════════════════════════════════════════════════════════════════
// NEW CONTROLLERS FOR REVISIONS AND DECISIONS
// ════════════════════════════════════════════════════════════════

const submitRevision = async (req, res) => {
    const result = await submissionService.submitRevision(req.user.id, req.body);

    sendSuccess(
        res,
        result.message,
        { revision: result.revision },
        null,
        STATUS_CODES.CREATED
    );
};

const makeEditorDecision = async (req, res) => {
    const { id } = req.params;
    const { decision, decisionStage, remarks, attachments } = req.body;

    const result = await submissionService.makeEditorDecision(
        id,
        req.user.id,
        decision,
        decisionStage,
        remarks,
        attachments
    );

    sendSuccess(
        res,
        result.message,
        {
            submission: result.submission,
            decisionsRemaining: result.decisionsRemaining
        },
        null,
        STATUS_CODES.OK
    );
};

const makeTechnicalEditorDecision = async (req, res) => {
    const { id } = req.params;
    const { recommendation, remarks, attachments } = req.body;

    const result = await submissionService.makeTechnicalEditorDecision(
        id,
        req.user.id,
        recommendation,
        remarks,
        attachments
    );

    sendSuccess(
        res,
        result.message,
        {
            submission: result.submission,
            note: result.note
        },
        null,
        STATUS_CODES.OK
    );
};

const checkCoAuthorConsent = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.checkCoAuthorConsentStatus(id);

    sendSuccess(
        res,
        result.message,
        { consentStatus: result.consentStatus },
        null,
        STATUS_CODES.OK
    );
};

const checkReviewerMajority = async (req, res) => {
    const { id } = req.params;

    const result = await submissionService.checkReviewerMajorityStatus(id);

    sendSuccess(
        res,
        result.message,
        { majorityStatus: result.majorityStatus },
        null,
        STATUS_CODES.OK
    );
};

// ════════════════════════════════════════════════════════════════
// NEW CONTROLLERS FOR CONSENT MANAGEMENT
// ════════════════════════════════════════════════════════════════

const autoRejectExpiredConsents = async (req, res) => {
    const result = await submissionService.autoRejectExpiredConsents();

    sendSuccess(
        res,
        "Expired consents processed successfully",
        {
            processed: result.processed,
            submissions: result.submissions
        },
        null,
        STATUS_CODES.OK
    );
};

const editorApproveConsentOverride = async (req, res) => {
    const { id } = req.params;
    const { resolutionNote } = req.body;

    const result = await submissionService.editorApproveConsentOverride(
        id,
        req.user.id,
        resolutionNote
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

// ════════════════════════════════════════════════════════════════
// EDITOR ASSIGNMENT CONTROLLERS (NEW)
// ════════════════════════════════════════════════════════════════

const assignTechnicalEditor = async (req, res) => {
    const { id } = req.params;
    const { technicalEditorId, remarks, attachments } = req.body;

    const result = await submissionService.assignTechnicalEditor(
        id,
        req.user.id,
        technicalEditorId,
        remarks,
        attachments
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const assignReviewers = async (req, res) => {
    const { id } = req.params;
    const { reviewerIds, remarks, attachments } = req.body;

    const result = await submissionService.assignReviewers(
        id,
        req.user.id,
        reviewerIds,
        remarks,
        attachments
    );

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const generateUploadUrl = async (req, res) => {
    const result = await submissionService.generateUploadUrl(req.user.id, req.body);

    sendSuccess(
        res,
        result.message,
        {
            uploadUrl: result.uploadUrl,
            signature: result.signature,
            timestamp: result.timestamp,
            publicId: result.publicId,
            apiKey: result.apiKey,
        },
        null,
        STATUS_CODES.OK
    );
};

const searchAuthors = async (req, res) => {
    const { q, exclude } = req.query;

    const result = await submissionService.searchAuthors(q, exclude || "");

    sendSuccess(
        res,
        result.message,
        { authors: result.authors },
        null,
        STATUS_CODES.OK
    );
};

const searchReviewers = async (req, res) => {
    const { q, exclude } = req.query;

    const result = await submissionService.searchReviewers(q, exclude || "");

    sendSuccess(
        res,
        result.message,
        { reviewers: result.reviewers },
        null,
        STATUS_CODES.OK
    );
};

const saveDraft = async (req, res) => {
    const result = await submissionService.saveDraft(req.user.id, req.body);

    sendSuccess(
        res,
        result.message,
        { submission: result.submission },
        null,
        STATUS_CODES.OK
    );
};

const getLatestDraft = async (req, res) => {
    const result = await submissionService.getLatestDraft(req.user.id);

    sendSuccess(
        res,
        result.message,
        { draft: result.draft },
        null,
        STATUS_CODES.OK
    );
};

const deleteDraft = async (req, res) => {
    const { id } = req.params;
    const result = await submissionService.deleteDraft(req.user.id, id);

    sendSuccess(
        res,
        result.message,
        null,
        null,
        STATUS_CODES.OK
    );
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
    getSubmissionTimeline,
    // NEW EXPORTS (Revisions & Decisions):
    submitRevision,
    makeEditorDecision,
    makeTechnicalEditorDecision,
    checkCoAuthorConsent,
    checkReviewerMajority,
    // NEW EXPORTS (Consent Management):
    autoRejectExpiredConsents,
    editorApproveConsentOverride,
    assignTechnicalEditor,
    assignReviewers,
    generateUploadUrl,
    searchAuthors,
    searchReviewers,
    saveDraft,
    getLatestDraft,
    deleteDraft,
};