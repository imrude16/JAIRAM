import { Router } from "express";

import { requireAuth } from "../../common/middlewares/requireAuth.js";
import { allowRoles } from "../../common/middlewares/roleBaseMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";
import userController from "./users.controller.js";
import {
    registerUserSchema,
    verifyOTPSchema,
    resendOTPSchema,
    loginUserSchema,
    getUserByIdSchema,
    updateUserSchema,
    changePasswordSchema,
    checkEmailSchema,
} from "./users.validator.js";


const {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getCurrentUser,
    getUserById,
    updateUserProfile,
    changePassword,
    checkEmailAvailability,
} = userController;

const router = Router();

/**
 * USER ROUTES
 * 
 * Route Structure:
 * - Public routes    → No authentication required
 * - Protected routes → Authentication required (any logged-in user)
 * - Admin routes     → Admin role required
 * 
 * ROUTE ORDER MATTERS IN EXPRESS:
 * Express matches routes TOP TO BOTTOM and stops at first match.
 * 
 * CRITICAL ORDERING RULE:
 * Specific routes MUST come BEFORE dynamic routes.
 * 
 * WHY:
 * If /:id is defined before /profile, then a request to
 * GET /api/users/profile will match /:id with id="profile"
 * instead of matching /profile route → WRONG BEHAVIOR!
 * 
 * CORRECT ORDER:
 * ✅ /check-email   (specific - defined first)
 * ✅ /profile       (specific - defined before /:id)
 * ✅ /change-password (specific - defined before /:id)
 * ✅ /:id           (dynamic - defined LAST)
 */


// ============================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================

/**
 * CHECK EMAIL AVAILABILITY
 *
 * GET /api/users/check-email?email=example@email.com
 *
 * Purpose  : Check if email is already registered
 * Use Case : Real-time validation during registration form
 * Auth     : None
 */
router.get(
    "/check-email",
    validateRequest(checkEmailSchema),
    asyncHandler(checkEmailAvailability)
);

/**
 * REGISTER USER (Step 1 of 2 - Sends OTP)
 *
 * POST /api/users/register
 * Body: { firstName, lastName, email, password, confirmPassword,
 *         profession, primarySpecialty, institution, department,
 *         phoneCode, mobileNumber, address, termsAccepted }
 *
 * Auth : None
 * Next : Call /verify-otp with received OTP
 */
router.post(
    "/register",
    validateRequest(registerUserSchema),
    asyncHandler(registerUser)
);

/**
 * VERIFY OTP (Step 2 of 2 - Completes Registration)
 *
 * POST /api/users/verify-otp
 * Body: { email, otp }
 *
 * Auth    : None
 * Returns : JWT token + user data on success
 */
router.post(
    "/verify-otp",
    validateRequest(verifyOTPSchema),
    asyncHandler(verifyOTP)
);

/**
 * RESEND OTP
 *
 * POST /api/users/resend-otp
 * Body: { email }
 *
 * Auth    : None
 * Use Case: When OTP expires or not received
 */
router.post(
    "/resend-otp",
    validateRequest(resendOTPSchema),
    asyncHandler(resendOTP)
);

/**
 * LOGIN USER
 *
 * POST /api/users/login
 * Body: { email, password }
 *
 * Auth    : None
 * Returns : JWT token + user data on success
 */
router.post(
    "/login",
    validateRequest(loginUserSchema),
    asyncHandler(loginUser)
);


// ============================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================
// WHY these routes use /profile instead of /me:
//
// BEFORE: GET /api/users/me   PATCH /api/users/me
// AFTER:  GET /api/users/profile  PATCH /api/users/profile
//
// REASON 1 - RESTful Standards:
// REST uses nouns (resources), not pronouns.
// /profile clearly identifies the RESOURCE being accessed.
// /me is a shortcut that works but is not standard REST.
//
// REASON 2 - Clarity:
// /profile immediately tells any developer what resource it is.
// /me requires context to understand what "me" refers to.
//
// REASON 3 - Scalability:
// If you add /api/journals/me or /api/submissions/me later,
// you create inconsistency. /profile is a clear pattern.
//
// REASON 4 - API Documentation:
// Tools like Swagger/Postman group routes by resource name.
// /profile groups cleanly. /me is ambiguous.
//
// IMPORTANT: /profile MUST be defined BEFORE /:id
// Otherwise GET /api/users/profile would match /:id with id="profile"

/**
 * GET CURRENT USER PROFILE
 *
 * GET /api/users/profile
 * Headers: Authorization: Bearer <token>
 *
 * Auth    : Required (any logged-in user)
 * Returns : Current user's profile data
 * Note    : User ID taken from JWT token (req.user.id)
 *           NOT from URL - user can only see their own profile
 */
router.get(
    "/profile",
    requireAuth,
    asyncHandler(getCurrentUser)
);

/**
 * UPDATE CURRENT USER PROFILE
 *
 * PATCH /api/users/profile
 * Headers: Authorization: Bearer <token>
 * Body: { firstName?, lastName?, profession?, primarySpecialty?,
 *         institution?, department?, phoneCode?, mobileNumber?, address? }
 *
 * Auth    : Required (any logged-in user)
 * Returns : Updated user profile
 * Note    : Email, password, role cannot be updated here
 *           User can only update their OWN profile
 *
 * WHY PATCH not PUT:
 * PUT replaces the ENTIRE resource (all fields required)
 * PATCH partially updates (only send fields you want to change)
 * Since users update one field at a time, PATCH is correct.
 */
router.patch(
    "/profile",
    requireAuth,
    validateRequest(updateUserSchema),
    asyncHandler(updateUserProfile)
);

/**
 * CHANGE PASSWORD
 *
 * POST /api/users/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword, confirmNewPassword }
 *
 * Auth : Required (any logged-in user)
 * Note : Requires current password for verification (security)
 *
 * WHY POST not PATCH:
 * Password change is an ACTION not a resource update.
 * It requires verification (current password) before changing.
 * POST better represents this action-oriented operation.
 */
router.post(
    "/change-password",
    requireAuth,
    validateRequest(changePasswordSchema),
    asyncHandler(changePassword)
);


// ============================================================
// ADMIN ROUTES (Admin Role Required)
// ============================================================
// WHY these are defined LAST:
// /:id is a dynamic route - it matches ANYTHING after /users/
// If defined before /profile or /change-password,
// those routes would never be reached!
//
// Example of what would break:
// GET /api/users/profile → would match /:id with id="profile" ❌
// GET /api/users/change-password → would match /:id with id="change-password" ❌
//
// By defining /:id LAST, specific routes are matched first ✅

/**
 * GET ANY USER BY ID (Admin Only)
 *
 * GET /api/users/:id
 * Headers: Authorization: Bearer <token>
 *
 * Auth    : Required + ADMIN role
 * Returns : Any user's full profile
 * Use Case: Admin dashboard - view any user
 */
router.get(
    "/:id",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(getUserByIdSchema),
    asyncHandler(getUserById)
);

/**
 * UPDATE ANY USER (Admin Only)
 *
 * PATCH /api/users/:id
 * Headers: Authorization: Bearer <token>
 * Body: { firstName?, lastName?, role?, status?, ... }
 *
 * Auth    : Required + ADMIN role
 * Returns : Updated user profile
 * Use Case: Admin dashboard - update any user including role/status
 */
router.patch(
    "/:id",
    requireAuth,
    allowRoles(ROLES.ADMIN),
    validateRequest(updateUserSchema),
    asyncHandler(updateUserProfile)
);

export default router;