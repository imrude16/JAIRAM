import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { User } from "../users/users.model.js";
import { RoleChangeRequest } from "./roleChangeRequest.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";

/**
 * ════════════════════════════════════════════════════════════════
 * ADMIN SERVICE LAYER
 * ════════════════════════════════════════════════════════════════
 * 
 * Handles admin operations:
 * - Role change requests (Editor → Admin workflow)
 * - Direct role assignment (Admin only)
 * - User management (CRUD operations)
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// PRIVATE HELPER FUNCTIONS
// ================================================

const findUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(`🔵 [ADMIN-HELPER] findUserById: ${user ? "found" : "not found"}`);
        return user;
    } catch (dbError) {
        console.error("❌ [ADMIN-HELPER] findUserById failed:", dbError);
        if (dbError.name === "CastError") {
            throw new AppError("Invalid user ID format", STATUS_CODES.BAD_REQUEST, "INVALID_USER_ID");
        }
        throw new AppError("Database error while finding user", STATUS_CODES.INTERNAL_SERVER_ERROR, "DATABASE_ERROR");
    }
};

const sendRoleChangeNotificationEmail = async (user, newRole, adminName) => {
    try {
        await sendEmail({
            to: user.email,
            subject: `JAIRAM - Role Updated to ${newRole}`,
            html: `
                <h2>Your Role Has Been Updated</h2>
                <p>Dear ${user.firstName} ${user.lastName},</p>
                <p>Your role on the JAIRAM platform has been updated.</p>
                <p><strong>New Role:</strong> ${newRole}</p>
                <p><strong>Updated by:</strong> ${adminName}</p>
                <p>You can now access features associated with this role.</p>
                <p>If you have any questions, please contact our support team.</p>
            `,
        });
        console.log(`🔵 [ADMIN-HELPER] Role change notification sent to ${user.email}`);
    } catch (emailError) {
        console.error("❌ [ADMIN-HELPER] Failed to send role change notification:", emailError);
    }
};

// ================================================
// CREATE ROLE CHANGE REQUEST (EDITOR → ADMIN)
// ================================================

const createRoleChangeRequest = async (editorId, payload) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] createRoleChangeRequest started");

        const user = await findUserById(payload.userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        const editor = await findUserById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError("Only editors can create role change requests", STATUS_CODES.FORBIDDEN, "FORBIDDEN");
        }

        // Check for existing pending request
        const existingRequest = await RoleChangeRequest.findOne({
            userId: payload.userId,
            status: "PENDING",
        });

        if (existingRequest) {
            throw new AppError(
                "A pending role change request already exists for this user",
                STATUS_CODES.CONFLICT,
                "DUPLICATE_REQUEST"
            );
        }

        // Create request
        const request = await RoleChangeRequest.create({
            userId: payload.userId,
            currentRole: user.role,
            requestedRole: payload.requestedRole,
            requestedBy: editorId,
            reason: payload.reason,
            status: "PENDING",
        });

        await request.populate([
            { path: "userId", select: "firstName lastName email role" },
            { path: "requestedBy", select: "firstName lastName email" },
        ]);

        console.log("✅ [ADMIN-SERVICE] Role change request created successfully");

        return {
            message: "Role change request submitted successfully. Admin will review it shortly.",
            request,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in createRoleChangeRequest:", error);
        throw new AppError(
            "Failed to create role change request",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CREATE_REQUEST_ERROR"
        );
    }
};

const searchRoleChangeUsers = async (editorId, filters = {}) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] searchRoleChangeUsers started");

        const editor = await findUserById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError(
                "Only editors can search users for role change requests",
                STATUS_CODES.FORBIDDEN,
                "FORBIDDEN"
            );
        }

        const { search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
            status: "ACTIVE",
        };

        const [users, total] = await Promise.all([
            User.find(query)
                .select("firstName lastName email role status")
                .sort({ firstName: 1, lastName: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        console.log("✅ [ADMIN-SERVICE] searchRoleChangeUsers completed successfully");

        return {
            message: "Users retrieved successfully",
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in searchRoleChangeUsers:", error);
        throw new AppError(
            "Failed to search users for role change request",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "SEARCH_ROLE_CHANGE_USERS_ERROR"
        );
    }
};

const getMyRoleChangeRequests = async (editorId, filters = {}) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] getMyRoleChangeRequests started");

        const editor = await findUserById(editorId);
        if (!editor || editor.role !== "EDITOR") {
            throw new AppError(
                "Only editors can view their role change requests",
                STATUS_CODES.FORBIDDEN,
                "FORBIDDEN"
            );
        }

        const { status, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const query = { requestedBy: editorId };
        if (status) query.status = status;

        const [requests, total] = await Promise.all([
            RoleChangeRequest.find(query)
                .populate("userId", "firstName lastName email role")
                .populate("requestedBy", "firstName lastName email")
                .populate("reviewedBy", "firstName lastName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            RoleChangeRequest.countDocuments(query),
        ]);

        console.log("✅ [ADMIN-SERVICE] getMyRoleChangeRequests completed successfully");

        return {
            message: "Your role change requests retrieved successfully",
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in getMyRoleChangeRequests:", error);
        throw new AppError(
            "Failed to retrieve your role change requests",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_MY_ROLE_CHANGE_REQUESTS_ERROR"
        );
    }
};

// ================================================
// REVIEW ROLE CHANGE REQUEST (ADMIN)
// ================================================

const reviewRoleChangeRequest = async (adminId, requestId, decision, adminComments) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] reviewRoleChangeRequest started");

        const request = await RoleChangeRequest.findById(requestId).populate("userId");

        if (!request) {
            throw new AppError("Role change request not found", STATUS_CODES.NOT_FOUND, "REQUEST_NOT_FOUND");
        }

        if (request.status !== "PENDING") {
            throw new AppError(
                `This request has already been ${request.status.toLowerCase()}`,
                STATUS_CODES.BAD_REQUEST,
                "REQUEST_ALREADY_REVIEWED"
            );
        }

        const admin = await findUserById(adminId);

        // Update request status
        request.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.adminComments = adminComments;

        await request.save();

        // If approved, update user's role
        if (decision === "APPROVE") {
            const user = await findUserById(request.userId._id);
            user.role = request.requestedRole;
            await user.save();

            // Send notification email
            await sendRoleChangeNotificationEmail(
                user,
                request.requestedRole,
                `${admin.firstName} ${admin.lastName}`
            );

            console.log(`🟢 [ADMIN-SERVICE] User role updated to ${request.requestedRole}`);
        }

        await request.populate([
            { path: "userId", select: "firstName lastName email role" },
            { path: "requestedBy", select: "firstName lastName email" },
            { path: "reviewedBy", select: "firstName lastName email" },
        ]);

        console.log("✅ [ADMIN-SERVICE] Role change request reviewed successfully");

        return {
            message: decision === "APPROVE"
                ? "Role change request approved and user role updated successfully"
                : "Role change request rejected",
            request,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in reviewRoleChangeRequest:", error);
        throw new AppError(
            "Failed to review role change request",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "REVIEW_REQUEST_ERROR"
        );
    }
};

// ================================================
// GET ROLE CHANGE REQUESTS
// ================================================

const getRoleChangeRequests = async (filters = {}) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] getRoleChangeRequests started");

        const { status, userId, page = 1, limit = 20 } = filters;

        let query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            RoleChangeRequest.find(query)
                .populate("userId", "firstName lastName email role")
                .populate("requestedBy", "firstName lastName email")
                .populate("reviewedBy", "firstName lastName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            RoleChangeRequest.countDocuments(query),
        ]);

        console.log("✅ [ADMIN-SERVICE] Role change requests retrieved successfully");

        return {
            message: "Role change requests retrieved successfully",
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("❌ [ADMIN-SERVICE] Unexpected error in getRoleChangeRequests:", error);
        throw new AppError(
            "Failed to retrieve role change requests",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_REQUESTS_ERROR"
        );
    }
};

// ================================================
// UPDATE USER ROLE (DIRECT - ADMIN ONLY)
// ================================================

const updateUserRole = async (adminId, userId, newRole, reason) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] updateUserRole started");

        const user = await findUserById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        const admin = await findUserById(adminId);

        const oldRole = user.role;
        user.role = newRole;
        await user.save();

        // Send notification email
        await sendRoleChangeNotificationEmail(
            user,
            newRole,
            `${admin.firstName} ${admin.lastName}`
        );

        console.log(`🟢 [ADMIN-SERVICE] User role updated from ${oldRole} to ${newRole}`);

        return {
            message: "User role updated successfully",
            user,
            changes: {
                oldRole,
                newRole,
                updatedBy: adminId,
                reason: reason || "Direct admin update",
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in updateUserRole:", error);
        throw new AppError(
            "Failed to update user role",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "UPDATE_ROLE_ERROR"
        );
    }
};

// ================================================
// UPDATE USER PROFILE (ADMIN UPDATING ANY USER)
// ================================================

const updateUserProfile = async (adminId, userId, updates) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] updateUserProfile started");

        const user = await findUserById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Prevent updating sensitive fields directly
        delete updates.email;
        delete updates.password;
        delete updates.isEmailVerified;
        delete updates.role; // Use updateUserRole for role changes

        Object.keys(updates).forEach(key => {
            user[key] = updates[key];
        });

        await user.save();

        console.log("✅ [ADMIN-SERVICE] User profile updated successfully");

        return {
            message: "User profile updated successfully",
            user,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in updateUserProfile:", error);
        throw new AppError(
            "Failed to update user profile",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "UPDATE_PROFILE_ERROR"
        );
    }
};

// ================================================
// GET USER BY ID
// ================================================

const getUserById = async (userId) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] getUserById started");

        const user = await findUserById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        console.log("✅ [ADMIN-SERVICE] User retrieved successfully");

        return {
            message: "User retrieved successfully",
            user,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in getUserById:", error);
        throw new AppError(
            "Failed to retrieve user",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_USER_ERROR"
        );
    }
};

// ================================================
// LIST ALL USERS (WITH FILTERS)
// ================================================

const listUsers = async (filters = {}) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] listUsers started");

        const {
            role,
            status,
            isEmailVerified,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc",
            search,
        } = filters;

        let query = {};

        if (role) query.role = role;
        if (status) query.status = status;
        if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified;

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { institution: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [users, total] = await Promise.all([
            User.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        console.log("✅ [ADMIN-SERVICE] Users retrieved successfully");

        return {
            message: "Users retrieved successfully",
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("❌ [ADMIN-SERVICE] Unexpected error in listUsers:", error);
        throw new AppError(
            "Failed to retrieve users",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "LIST_USERS_ERROR"
        );
    }
};

// ================================================
// UPDATE USER STATUS (SUSPEND/ACTIVATE)
// ================================================

const updateUserStatus = async (adminId, userId, newStatus, reason) => {
    try {
        console.log("🔵 [ADMIN-SERVICE] updateUserStatus started");

        const user = await findUserById(userId);
        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        const oldStatus = user.status;
        user.status = newStatus;
        await user.save();

        // Send notification email
        try {
            await sendEmail({
                to: user.email,
                subject: `JAIRAM - Account Status Updated`,
                html: `
                    <h2>Account Status Update</h2>
                    <p>Dear ${user.firstName} ${user.lastName},</p>
                    <p>Your account status has been updated.</p>
                    <p><strong>New Status:</strong> ${newStatus}</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
                    <p>If you have any questions, please contact support.</p>
                `,
            });
        } catch (emailError) {
            console.error("❌ Failed to send status change notification:", emailError);
        }

        console.log(`🟢 [ADMIN-SERVICE] User status updated from ${oldStatus} to ${newStatus}`);

        return {
            message: "User status updated successfully",
            user,
            changes: {
                oldStatus,
                newStatus,
                updatedBy: adminId,
                reason: reason || "Admin update",
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [ADMIN-SERVICE] Unexpected error in updateUserStatus:", error);
        throw new AppError(
            "Failed to update user status",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "UPDATE_STATUS_ERROR"
        );
    }
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
