import { Router } from "express";
import { requireAuth } from "../../common/middlewares/requireAuth.js";
import { allowRoles } from "../../common/middlewares/roleBaseMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";
import adminController from "./admin.controller.js";
import {
    createRoleChangeRequestSchema,
    reviewRoleChangeRequestSchema,
    getRoleChangeRequestsSchema,
    searchRoleChangeUsersSchema,
    getMyRoleChangeRequestsSchema,
    updateUserRoleSchema,
    updateUserProfileSchema,
    getUserByIdSchema,
    listUsersSchema,
    updateUserStatusSchema,
} from "./admin.validator.js";

/**
 * ════════════════════════════════════════════════════════════════
 * ADMIN ROUTES
 * ════════════════════════════════════════════════════════════════
 * 
 * Access Control:
 * - EDITOR: Can create role change requests
 * - ADMIN: Can approve/reject requests, manage users directly
 * ════════════════════════════════════════════════════════════════
 */

const {
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
} = adminController;

const router = Router();

// ============================================================
// ROLE CHANGE REQUEST ROUTES (EDITOR → ADMIN WORKFLOW)
// ============================================================

/**
 * CREATE ROLE CHANGE REQUEST (EDITOR)
 * 
 * POST /api/admin/role-change-requests
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   userId: "...",
 *   requestedRole: "REVIEWER",
 *   reason: "Expert in cardiology with 10+ years experience"
 * }
 * 
 * Auth: Required + EDITOR role
 * Purpose: Editor requests Admin to change a user's role
 * Flow:
 *   1. Editor identifies user who should have elevated role
 *   2. Editor submits request with justification
 *   3. Request goes to PENDING status
 *   4. Admin reviews and approves/rejects
 */
router.post(
    "/role-change-requests",
    requireAuth,
    allowRoles(ROLES.EDITOR),
    validateRequest(createRoleChangeRequestSchema),
    asyncHandler(createRoleChangeRequest)
);

/**
 * SEARCH USERS FOR ROLE CHANGE REQUEST (EDITOR)
 * 
 * GET /api/admin/role-change-request-users
 * Headers: Authorization: Bearer <token>
 * Query: ?search=john&page=1&limit=10
 * 
 * Auth: Required + EDITOR role
 * Purpose: Editor searches users by name/email before creating role change request
 * Returns: Limited user details for selection in UI
 */
router.get(
    "/role-change-request-users",
    requireAuth,
    allowRoles(ROLES.EDITOR),
    validateRequest(searchRoleChangeUsersSchema),
    asyncHandler(searchRoleChangeUsers)
);

/**
 * GET MY ROLE CHANGE REQUESTS (EDITOR)
 * 
 * GET /api/admin/my-role-change-requests
 * Headers: Authorization: Bearer <token>
 * Query: ?status=PENDING&page=1&limit=10
 * 
 * Auth: Required + EDITOR role
 * Purpose: Editor views history/status of role change requests submitted by them
 * Returns: List of their requests with pagination
 */
router.get(
    "/my-role-change-requests",
    requireAuth,
    allowRoles(ROLES.EDITOR),
    validateRequest(getMyRoleChangeRequestsSchema),
    asyncHandler(getMyRoleChangeRequests)
);

/**
 * GET ROLE CHANGE REQUESTS (ADMIN)
 * 
 * GET /api/admin/role-change-requests
 * Headers: Authorization: Bearer <token>
 * Query: ?status=PENDING&page=1&limit=20
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin views pending/all role change requests
 * Returns: List of requests with pagination
 */
router.get(
    "/role-change-requests",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(getRoleChangeRequestsSchema),
    asyncHandler(getRoleChangeRequests)
);

/**
 * REVIEW ROLE CHANGE REQUEST (ADMIN)
 * 
 * PATCH /api/admin/role-change-requests/:requestId
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   decision: "APPROVE" | "REJECT",
 *   adminComments: "Approved based on credentials"
 * }
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin approves or rejects role change request
 * Side Effects:
 *   - If APPROVE: User's role is updated in database
 *   - Notification email sent to user
 *   - Request status changed to APPROVED/REJECTED
 */
router.patch(
    "/role-change-requests/:requestId",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(reviewRoleChangeRequestSchema),
    asyncHandler(reviewRoleChangeRequest)
);

// ============================================================
// DIRECT USER MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================================

/**
 * LIST ALL USERS (ADMIN)
 * 
 * GET /api/admin/users
 * Headers: Authorization: Bearer <token>
 * Query: ?role=USER&status=ACTIVE&page=1&limit=20&search=john
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin views all users with filters
 * Returns: Paginated list of users
 */
router.get(
    "/users",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(listUsersSchema),
    asyncHandler(listUsers)
);

/**
 * GET USER BY ID (ADMIN)
 * 
 * GET /api/admin/users/:userId
 * Headers: Authorization: Bearer <token>
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin views any user's full profile
 * Returns: Complete user details
 */
router.get(
    "/users/:userId",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(getUserByIdSchema),
    asyncHandler(getUserById)
);

/**
 * UPDATE USER ROLE DIRECTLY (ADMIN)
 * 
 * PATCH /api/admin/users/:userId/role
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   role: "TECHNICAL_EDITOR",
 *   reason: "Promoted to handle technical reviews"
 * }
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin directly changes user's role (bypasses request workflow)
 * Use Case: Urgent role changes, demotions, corrections
 * Side Effects:
 *   - User's role updated in database
 *   - Notification email sent to user
 */
router.patch(
    "/users/:userId/role",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(updateUserRoleSchema),
    asyncHandler(updateUserRole)
);

/**
 * UPDATE USER PROFILE (ADMIN)
 * 
 * PATCH /api/admin/users/:userId/profile
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   firstName?: "...",
 *   lastName?: "...",
 *   institution?: "...",
 *   phoneCode?: "+1",
 *   mobileNumber?: "1234567890",
 *   address?: {...}
 * }
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin updates any user's profile information
 * Use Case: User requests profile update via Editor → Admin
 * Restrictions:
 *   - Cannot update: email, password, role (use dedicated endpoints)
 *   - Can update: name, profession, contact, address, etc.
 */
router.patch(
    "/users/:userId/profile",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(updateUserProfileSchema),
    asyncHandler(updateUserProfile)
);

/**
 * UPDATE USER STATUS (ADMIN)
 * 
 * PATCH /api/admin/users/:userId/status
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
 *   reason: "Account suspended for policy violation"
 * }
 * 
 * Auth: Required + ADMIN role
 * Purpose: Admin activates, deactivates, or suspends user accounts
 * Use Cases:
 *   - SUSPENDED: User violated terms, pending investigation
 *   - INACTIVE: User requested account deactivation
 *   - ACTIVE: Reactivate suspended/inactive account
 * 
 * Side Effects:
 *   - User cannot login if status is not ACTIVE
 *   - Notification email sent to user
 */
router.patch(
    "/users/:userId/status",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(updateUserStatusSchema),
    asyncHandler(updateUserStatus)
);

export default router;
