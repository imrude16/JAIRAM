import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { User } from "./users.model.js";
import { generateToken } from "../../common/utils/jwtToken.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import { otpTemplate, passwordResetTemplate } from "../../infrastructure/email/email.template.js";

// ================================================
// PRIVATE HELPER FUNCTIONS
// ================================================

const findUserByEmail = async (email, options = {}) => {
    try {
        let query = User.findOne({ email });
        if (options.withOTP) query = query.select("+emailVerificationOTP +emailVerificationOTPExpires");
        if (options.withPassword) query = query.select("+password");
        const user = await query;

        console.log(`🔵 [HELPER] findUserByEmail: ${user ? "found" : "not found"}`); // debugger

        return user;
    } catch (dbError) {
        console.error("❌ [HELPER] findUserByEmail failed:", dbError);
        throw new AppError("Database error while finding user", STATUS_CODES.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", { originalError: dbError.message });
    }
};

const findUserById = async (userId, options = {}) => {
    try {
        let query = User.findById(userId);
        if (options.withPassword) query = query.select("+password");
        const user = await query;

        console.log(`🔵 [HELPER] findUserById: ${user ? "found" : "not found"}`); // debugger

        return user;
    } catch (dbError) {
        console.error("❌ [HELPER] findUserById failed:", dbError); // debugger
        if (dbError.name === "CastError") throw new AppError("Invalid user ID format", STATUS_CODES.BAD_REQUEST, "INVALID_USER_ID");
        throw new AppError("Database error while finding user", STATUS_CODES.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", { originalError: dbError.message });
    }
};

const generateAndSaveOTP = async (user) => {
    try {
        const otp = user.generateOTP();
        await user.save();

        console.log(`🔵 [HELPER] generateAndSaveOTP: OTP generated`); // debugger

        return otp;
    } catch (dbError) {
        console.error("❌ [HELPER] generateAndSaveOTP failed:", dbError);
        throw new AppError("Failed to generate verification code", STATUS_CODES.INTERNAL_SERVER_ERROR, "OTP_GENERATION_ERROR", { originalError: dbError.message });
    }
};

const sendOTPEmail = async (email, firstName, otp) => {
    try {
        await sendEmail({ to: email, subject: "JAIRAM - Email Verification OTP", html: otpTemplate(firstName, otp) });

        console.log(`🔵 [HELPER] sendOTPEmail: Email sent to ${email}`); // debugger

    } catch (emailError) {
        console.error("❌ [HELPER] sendOTPEmail failed:", emailError);
        throw new AppError("Failed to send verification email. Please try again.", STATUS_CODES.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED", { originalError: emailError.message });
    }
};

const createAuthToken = (user) => {
    try {
        const token = generateToken(user);

        console.log(`🔵 [HELPER] createAuthToken: Token generated`); // debugger

        return token;
    } catch (tokenError) {
        console.error("❌ [HELPER] createAuthToken failed:", tokenError);
        throw new AppError("Failed to generate authentication token", STATUS_CODES.INTERNAL_SERVER_ERROR, "TOKEN_GENERATION_ERROR", { originalError: tokenError.message });
    }
};

const formatUserResponse = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profession: user.profession,
    isEmailVerified: user.isEmailVerified,
});


// ================================================
// REGISTRATION FLOW (2-STEP PROCESS)
// ================================================

/* --> registerUser flow:
1. Check if email exists
2. If verified → error
3. If exists but not verified → resend OTP
4. If new → create user
5. Generate OTP
6. Send OTP email
7. Return response
*/
const registerUser = async (payload) => {
    try {

        console.log("🔵 [SERVICE] registerUser started"); // debugger

        const existingUser = await findUserByEmail(payload.email);

        if (existingUser) {
            if (existingUser.isEmailVerified) {
                throw new AppError("An account with this email already exists. Please login.", STATUS_CODES.CONFLICT, "USER_ALREADY_EXISTS");
            }

            console.log("🔵 [SERVICE] Resending OTP to existing unverified user"); // debugger

            const otp = await generateAndSaveOTP(existingUser);
            await sendOTPEmail(existingUser.email, existingUser.firstName, otp);

            return { message: "OTP resent successfully. Please check your email.", email: existingUser.email };
        }

        let user;
        try {
            user = await User.create({ ...payload, isEmailVerified: false });

            console.log("🟢 [SERVICE] User created:", user._id); // debugger

        } catch (dbError) {
            console.error("❌ [SERVICE] Database error during user creation:", dbError);
            if (dbError.code === 11000) throw new AppError("An account with this email already exists", STATUS_CODES.CONFLICT, "DUPLICATE_EMAIL");
            throw new AppError("Failed to create user account", STATUS_CODES.INTERNAL_SERVER_ERROR, "USER_CREATION_ERROR", { originalError: dbError.message });
        }

        let otp;
        try {
            otp = await generateAndSaveOTP(user);
        } catch (otpError) {
            console.error("❌ [SERVICE] OTP generation failed, cleaning up user");
            try { await User.findByIdAndDelete(user._id); } catch (e) { console.error("❌ Cleanup failed:", e); }
            throw otpError;
        }

        try {
            await sendOTPEmail(user.email, user.firstName, otp);
        } catch (emailError) {
            console.error("❌ [SERVICE] Email failed, cleaning up user");
            try { await User.findByIdAndDelete(user._id); } catch (e) { console.error("❌ Cleanup failed:", e); }
            throw emailError;
        }

        console.log("✅ [SERVICE] Registration completed successfully"); // debugger

        return { message: "Registration successful! OTP sent to your email.", email: user.email };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in registerUser:", error);
        throw new AppError("An unexpected error occurred during registration", STATUS_CODES.INTERNAL_SERVER_ERROR, "REGISTRATION_ERROR", { originalError: error.message });
    }
};

/* --> verifyOTP flow:
1. Find user (with OTP fields)
2. Check exists
3. Check already verified
4. Verify OTP
5. Update verification status
6. Clear OTP fields
7. Generate JWT token
8. Return token + formatted user
*/
const verifyOTP = async (email, otp) => {
    try {

        console.log("🔵 [SERVICE] verifyOTP started"); // debugger

        const user = await findUserByEmail(email, { withOTP: true });

        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        if (user.isEmailVerified) throw new AppError("Email already verified. Please login.", STATUS_CODES.BAD_REQUEST, "EMAIL_ALREADY_VERIFIED");

        let isValidOTP;
        try {
            isValidOTP = user.verifyOTP(otp);

            console.log("🔵 [SERVICE] OTP verification result:", isValidOTP); // debugger

        } catch (verifyError) {
            console.error("❌ [SERVICE] Error during OTP verification:", verifyError);
            throw new AppError("Error verifying OTP", STATUS_CODES.INTERNAL_SERVER_ERROR, "OTP_VERIFICATION_ERROR", { originalError: verifyError.message });
        }

        if (!isValidOTP) throw new AppError("Invalid or expired OTP", STATUS_CODES.BAD_REQUEST, "INVALID_OTP");

        try {
            user.isEmailVerified = true;
            user.emailVerificationOTP = undefined;
            user.emailVerificationOTPExpires = undefined;
            await user.save();

            console.log("🔵 [SERVICE] User verified and saved"); // debugger

            // ═══════════════════════════════════════════════════════════
            // LINK PENDING CONSENTS AFTER REGISTRATION
            // ═══════════════════════════════════════════════════════════

            try {
                const consentService = (await import("../consents/consent.service.js")).default;
                const { Submission } = await import("../submissions/submissions.model.js");

                // Link consents to user
                const linkedConsents = await consentService.linkConsentToUser(user);

                if (linkedConsents.length > 0) {
                    console.log(`✅ [REGISTRATION] Linked ${linkedConsents.length} consent(s)`);

                    // Link co-author references in submissions
                    for (const consent of linkedConsents) {
                        const submission = await Submission.findById(consent.submissionId);
                        if (!submission) continue;

                        let updated = false;

                        for (const coAuthor of submission.coAuthors) {
                            if (coAuthor.email === user.email && !coAuthor.user) {
                                // Link user
                                coAuthor.user = user._id;

                                // Clear temporary fields (keep only essential)
                                coAuthor.firstName = undefined;
                                coAuthor.lastName = undefined;
                                coAuthor.email = undefined;
                                coAuthor.phoneNumber = undefined;
                                coAuthor.title = undefined;
                                coAuthor.department = undefined;
                                coAuthor.country = undefined;
                                coAuthor.orcid = undefined;

                                updated = true;
                                console.log(`✅ [REGISTRATION] Linked co-author & cleaned temp fields for submission ${submission.submissionNumber || submission._id}`);
                            }
                        }

                        if (updated) {
                            await submission.save({ validateBeforeSave: false });
                        }
                    }
                }

                const reviewerSubmissions = await Submission.find({
                    suggestedReviewers: {
                        $elemMatch: {
                            email: user.email,
                            user: null,
                        },
                    },
                });

                for (const submission of reviewerSubmissions) {
                    let updated = false;

                    for (const reviewer of submission.suggestedReviewers || []) {
                        if (reviewer.email === user.email && !reviewer.user) {
                            reviewer.user = user._id;
                            updated = true;
                        }
                    }

                    if (updated) {
                        await submission.save({ validateBeforeSave: false });
                        console.log(`✅ [REGISTRATION] Linked suggested reviewer for submission ${submission.submissionNumber || submission._id}`);
                    }
                }
            } catch (linkError) {
                console.error("❌ [REGISTRATION] Failed to link consents:", linkError);
                // Don't fail registration
            }


        } catch (dbError) {
            console.error("❌ [SERVICE] Database error during user update:", dbError);
            throw new AppError("Failed to verify email", STATUS_CODES.INTERNAL_SERVER_ERROR, "EMAIL_VERIFICATION_ERROR", { originalError: dbError.message });
        }

        const token = createAuthToken(user);

        console.log("✅ [SERVICE] OTP verification completed successfully"); // debugger

        return { message: "Email verified successfully", token, user: formatUserResponse(user) };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in verifyOTP:", error);
        throw new AppError("An unexpected error occurred during OTP verification", STATUS_CODES.INTERNAL_SERVER_ERROR, "OTP_VERIFICATION_ERROR", { originalError: error.message });
    }
};

/* --> resendOTP flow:
1. Find user
2. Check not verified
3. Generate OTP
4. Send email
*/
const resendOTP = async (email) => {
    try {

        console.log("🔵 [SERVICE] resendOTP started"); // debugger

        const user = await findUserByEmail(email);

        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        if (user.isEmailVerified) throw new AppError("Email already verified. Please login.", STATUS_CODES.BAD_REQUEST, "EMAIL_ALREADY_VERIFIED");

        const otp = await generateAndSaveOTP(user);
        await sendOTPEmail(user.email, user.firstName, otp);

        console.log("✅ [SERVICE] Resend OTP completed successfully"); // debugger

        return { message: "OTP resent successfully. Please check your email.", email: user.email };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in resendOTP:", error);
        throw new AppError("An unexpected error occurred while resending OTP", STATUS_CODES.INTERNAL_SERVER_ERROR, "RESEND_OTP_ERROR", { originalError: error.message });
    }
};

/* --> loginUser flow:
1. Find user (with password)
2. Check exists
3. Compare password
4. Check verified
5. Check active
6. Generate token
7. Return formatted user
*/
const loginUser = async (email, password) => {
    try {

        console.log("🔵 [SERVICE] loginUser started"); // debugger

        const user = await findUserByEmail(email, { withPassword: true });

        if (!user) throw new AppError("Invalid email or password", STATUS_CODES.UNAUTHORIZED, "INVALID_CREDENTIALS");

        let isPasswordValid;
        try {
            isPasswordValid = await user.comparePassword(password);

            console.log("🔵 [SERVICE] Password verification completed"); // debugger

        } catch (compareError) {
            console.error("❌ [SERVICE] Error during password comparison:", compareError);
            throw new AppError("Error verifying password", STATUS_CODES.INTERNAL_SERVER_ERROR, "PASSWORD_VERIFICATION_ERROR", { originalError: compareError.message });
        }

        if (!isPasswordValid) throw new AppError("Invalid email or password", STATUS_CODES.UNAUTHORIZED, "INVALID_CREDENTIALS");
        if (!user.isEmailVerified) throw new AppError("Please verify your email before logging in", STATUS_CODES.FORBIDDEN, "EMAIL_NOT_VERIFIED", { email: user.email });
        if (user.status !== "ACTIVE") throw new AppError("Your account has been suspended. Please contact support.", STATUS_CODES.FORBIDDEN, "ACCOUNT_SUSPENDED");

        const token = createAuthToken(user);

        console.log("✅ [SERVICE] Login completed successfully"); // debugger

        return { message: "Login successful", token, user: formatUserResponse(user) };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in loginUser:", error);
        throw new AppError("An unexpected error occurred during login", STATUS_CODES.INTERNAL_SERVER_ERROR, "LOGIN_ERROR", { originalError: error.message });
    }
};

/* --> getUserById flow:
1. Find user (by ID)
2. Check if exists - if not found, return 404 error else return user
*/
const getUserById = async (userId) => {
    try {
        console.log("🔵 [SERVICE] getUserById started"); // debugger

        const user = await findUserById(userId);

        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");

        console.log("✅ [SERVICE] getUserById completed successfully"); // debugger

        return { message: "User retrieved successfully", user };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in getUserById:", error);
        throw new AppError("An unexpected error occurred while retrieving user", STATUS_CODES.INTERNAL_SERVER_ERROR, "GET_USER_ERROR", { originalError: error.message });
    }
};

/* --> updateUserProfile flow:
1. Find user (by ID)
2. Check if exists or not ( throw 404 error if not found )
3. Prevent updates to sensitive fields
4. Update allowed fields
5. Save user
6. Return updated user
*/
const updateUserProfile = async (userId, updates) => {
    try {
        console.log("🔵 [SERVICE] updateUserProfile started"); // debugger

        // Prevent updating sensitive fields
        const sensitiveFields = ["email", "password", "role", "isEmailVerified", "status", "termsAccepted"];
        sensitiveFields.forEach(field => delete updates[field]);

        let user;
        try {
            user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });

            console.log("🔵 [SERVICE] User update completed"); // debugger

        } catch (dbError) {
            console.error("❌ [SERVICE] Database error during user update:", dbError);
            if (dbError.name === "CastError") throw new AppError("Invalid user ID format", STATUS_CODES.BAD_REQUEST, "INVALID_USER_ID");
            if (dbError.name === "ValidationError") throw new AppError("Invalid update data provided", STATUS_CODES.BAD_REQUEST, "VALIDATION_ERROR", { errors: dbError.errors });
            throw new AppError("Database error while updating user", STATUS_CODES.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", { originalError: dbError.message });
        }

        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");

        console.log("✅ [SERVICE] updateUserProfile completed successfully"); // debugger

        return { message: "Profile updated successfully", user };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in updateUserProfile:", error);
        throw new AppError("An unexpected error occurred while updating profile", STATUS_CODES.INTERNAL_SERVER_ERROR, "UPDATE_PROFILE_ERROR", { originalError: error.message });
    }
};

/* --> changePassword flow:
1. Find user (with password)
2. Verify current password
3. Assign new password
4. Save → pre-save hook hashes it
*/
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        console.log("🔵 [SERVICE] changePassword started"); // debugger

        const user = await findUserById(userId, { withPassword: true });

        if (!user) throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");

        let isPasswordValid;
        try {
            isPasswordValid = await user.comparePassword(currentPassword);

            console.log("🔵 [SERVICE] Current password verification completed"); // debugger

        } catch (compareError) {
            console.error("❌ [SERVICE] Error during password comparison:", compareError);
            throw new AppError("Error verifying current password", STATUS_CODES.INTERNAL_SERVER_ERROR, "PASSWORD_VERIFICATION_ERROR", { originalError: compareError.message });
        }

        if (!isPasswordValid) throw new AppError("Current password is incorrect", STATUS_CODES.UNAUTHORIZED, "INVALID_PASSWORD");

        try {
            user.password = newPassword;
            await user.save();

            console.log("🔵 [SERVICE] Password updated and saved"); // debugger

        } catch (dbError) {
            console.error("❌ [SERVICE] Database error during password update:", dbError);
            throw new AppError("Failed to update password", STATUS_CODES.INTERNAL_SERVER_ERROR, "PASSWORD_UPDATE_ERROR", { originalError: dbError.message });
        }

        console.log("✅ [SERVICE] changePassword completed successfully"); // debugger

        return { message: "Password changed successfully" };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in changePassword:", error);
        throw new AppError("An unexpected error occurred while changing password", STATUS_CODES.INTERNAL_SERVER_ERROR, "CHANGE_PASSWORD_ERROR", { originalError: error.message });
    }
};

/* --> checkEmailAvailability flow:
1. Find user by email
2. If user exists and is verified → return not available (email already registered)
3. If user exists but not verified → return not available (email registered but not verified)
4. If user does not exist → return available
*/
const checkEmailAvailability = async (email) => {
    try {

        console.log("🔵 [SERVICE] checkEmailAvailability started"); // debugger

        const user = await findUserByEmail(email);

        if (user && user.isEmailVerified) {

            console.log("🔵 [SERVICE] Email found and verified"); // debugger

            return { available: false, message: "Email is not available. This email is already registered. Please login." };
        }

        if (user && !user.isEmailVerified) {

            console.log("🔵 [SERVICE] Email found but not verified"); // debugger

            return { available: false, message: "Email is not available. This email is registered but not verified. Please complete verification." };
        }

        console.log("✅ [SERVICE] checkEmailAvailability - email available"); // debugger

        return { available: true, message: "Email is available for registration." };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in checkEmailAvailability:", error);
        throw new AppError("An unexpected error occurred while checking email", STATUS_CODES.INTERNAL_SERVER_ERROR, "CHECK_EMAIL_ERROR", { originalError: error.message });
    }
};

/* --> forgotPassword flow:
1. Find user by email
2. Check if exists
3. Check if verified
4. Generate OTP
5. Save OTP
6. Send email
*/
const forgotPassword = async (email) => {
    try {
        console.log("🔵 [SERVICE] forgotPassword started"); // debugger

        const user = await findUserByEmail(email);

        if (!user) {
            throw new AppError("No account found with this email address", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        if (!user.isEmailVerified) {
            throw new AppError("Please verify your email before resetting password", STATUS_CODES.FORBIDDEN, "EMAIL_NOT_VERIFIED");
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        try {
            await user.save();
            console.log("🔵 [SERVICE] Password reset OTP saved"); // debugger
        } catch (dbError) {
            console.error("❌ [SERVICE] Failed to save password reset OTP:", dbError);
            throw new AppError("Failed to process password reset request", STATUS_CODES.INTERNAL_SERVER_ERROR, "OTP_SAVE_ERROR");
        }

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: "JAIRAM - Password Reset OTP",
                html: passwordResetTemplate(user.firstName, otp),
            });
            console.log("🔵 [SERVICE] Password reset email sent"); // debugger
        } catch (emailError) {
            console.error("❌ [SERVICE] Failed to send password reset email:", emailError);
            // Don't throw error - OTP is saved, user can try again
        }

        console.log("✅ [SERVICE] forgotPassword completed successfully"); // debugger

        return {
            message: "Password reset OTP sent to your email. Please check your inbox.",
            email: user.email,
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in forgotPassword:", error);
        throw new AppError("An unexpected error occurred during password reset request", STATUS_CODES.INTERNAL_SERVER_ERROR, "FORGOT_PASSWORD_ERROR", { originalError: error.message });
    }
};

/* --> resetPassword flow:
1. Find user by email (with password reset OTP)
2. Check if exists
3. Verify OTP and expiry
4. Update password
5. Clear OTP fields
6. Generate new JWT token
*/
const resetPassword = async (email, otp, newPassword) => {
    try {
        console.log("🔵 [SERVICE] resetPassword started"); // debugger

        // Find user with password reset OTP fields
        const user = await User.findOne({ email })
            .select("+passwordResetOTP +passwordResetOTPExpires +password");

        if (!user) {
            throw new AppError("User not found", STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND");
        }

        // Verify OTP
        if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
            throw new AppError("No password reset request found. Please request a new OTP.", STATUS_CODES.BAD_REQUEST, "NO_RESET_REQUEST");
        }

        if (user.passwordResetOTP !== otp) {
            throw new AppError("Invalid OTP", STATUS_CODES.BAD_REQUEST, "INVALID_OTP");
        }

        if (user.passwordResetOTPExpires < Date.now()) {
            throw new AppError("OTP has expired. Please request a new one.", STATUS_CODES.BAD_REQUEST, "EXPIRED_OTP");
        }

        // Update password
        user.password = newPassword;
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;

        try {
            await user.save();
            console.log("🔵 [SERVICE] Password updated successfully"); // debugger
        } catch (dbError) {
            console.error("❌ [SERVICE] Failed to update password:", dbError);
            throw new AppError("Failed to reset password", STATUS_CODES.INTERNAL_SERVER_ERROR, "PASSWORD_UPDATE_ERROR");
        }

        // Generate new token
        const token = createAuthToken(user);

        console.log("✅ [SERVICE] resetPassword completed successfully"); // debugger

        return {
            message: "Password reset successfully. You can now login with your new password.",
            token,
            user: formatUserResponse(user),
        };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [SERVICE] Unexpected error in resetPassword:", error);
        throw new AppError("An unexpected error occurred during password reset", STATUS_CODES.INTERNAL_SERVER_ERROR, "RESET_PASSWORD_ERROR", { originalError: error.message });
    }
};

export default {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getUserById,
    updateUserProfile,
    changePassword,
    checkEmailAvailability,
    forgotPassword,
    resetPassword,
};
