import adminService from "./admin.service.js";
import { sendSuccess } from "../../common/utils/responseHandler.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

/**
 * ════════════════════════════════════════════════════════════════
 * ADMIN CONTROLLER LAYER
 * ════════════════════════════════════════════════════════════════
 * Handles HTTP requests for admin operations
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// ROLE CHANGE REQUEST WORKFLOWS
// ================================================

const createRoleChangeRequest = async (req, res) => {
    const result = await adminService.createRoleChangeRequest(req.user.id, req.body);

    sendSuccess(
        res,
        result.message,
        { request: result.request },
        null,
        STATUS_CODES.CREATED
    );
};

const searchRoleChangeUsers = async (req, res) => {
    const result = await adminService.searchRoleChangeUsers(req.user.id, req.query);

    sendSuccess(
        res,
        result.message,
        {
            users: result.users,
            pagination: result.pagination,
        },
        null,
        STATUS_CODES.OK
    );
};

const getMyRoleChangeRequests = async (req, res) => {
    const result = await adminService.getMyRoleChangeRequests(req.user.id, req.query);

    sendSuccess(
        res,
        result.message,
        {
            requests: result.requests,
            pagination: result.pagination,
        },
        null,
        STATUS_CODES.OK
    );
};

const reviewRoleChangeRequest = async (req, res) => {
    const { requestId } = req.params;
    const { decision, adminComments } = req.body;

    const result = await adminService.reviewRoleChangeRequest(
        req.user.id,
        requestId,
        decision,
        adminComments
    );

    sendSuccess(
        res,
        result.message,
        { request: result.request },
        null,
        STATUS_CODES.OK
    );
};

const getRoleChangeRequests = async (req, res) => {
    const result = await adminService.getRoleChangeRequests(req.query);

    sendSuccess(
        res,
        result.message,
        {
            requests: result.requests,
            pagination: result.pagination,
        },
        null,
        STATUS_CODES.OK
    );
};

// ================================================
// USER MANAGEMENT
// ================================================

const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role, reason } = req.body;

    const result = await adminService.updateUserRole(req.user.id, userId, role, reason);

    sendSuccess(
        res,
        result.message,
        {
            user: result.user,
            changes: result.changes,
        },
        null,
        STATUS_CODES.OK
    );
};

const updateUserProfile = async (req, res) => {
    const { userId } = req.params;

    const result = await adminService.updateUserProfile(req.user.id, userId, req.body);

    sendSuccess(
        res,
        result.message,
        { user: result.user },
        null,
        STATUS_CODES.OK
    );
};

const getUserById = async (req, res) => {
    const { userId } = req.params;

    const result = await adminService.getUserById(userId);

    sendSuccess(
        res,
        result.message,
        { user: result.user },
        null,
        STATUS_CODES.OK
    );
};

const listUsers = async (req, res) => {
    const result = await adminService.listUsers(req.query);

    sendSuccess(
        res,
        result.message,
        {
            users: result.users,
            pagination: result.pagination,
        },
        null,
        STATUS_CODES.OK
    );
};

const updateUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { status, reason } = req.body;

    const result = await adminService.updateUserStatus(req.user.id, userId, status, reason);

    sendSuccess(
        res,
        result.message,
        {
            user: result.user,
            changes: result.changes,
        },
        null,
        STATUS_CODES.OK
    );
};

export default {
    createRoleChangeRequest,
    searchRoleChangeUsers,
    getMyRoleChangeRequests,
    reviewRoleChangeRequest,
    getRoleChangeRequests,
    updateUserRole,
    updateUserProfile,
    getUserById,
    listUsers,
    updateUserStatus,
};
