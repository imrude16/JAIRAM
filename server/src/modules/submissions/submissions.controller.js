import submissionService from "./submissions.service.js";
import { sendSuccess } from "../../common/utils/responseHandler.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

/**
 * ════════════════════════════════════════════════════════════════
 * SUBMISSION CONTROLLER LAYER - COMPLETE VERSION
 * ════════════════════════════════════════════════════════════════
 * 
 * Follows same pattern as users.controller.js
 * Handles HTTP requests and responses
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
    
    const result = await submissionService.getSubmissionById(
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
    const { id, coAuthorId } = req.params;
    const { consent, token } = req.body;
    
    const result = await submissionService.processCoAuthorConsent(
        id,
        coAuthorId,
        consent,
        token
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