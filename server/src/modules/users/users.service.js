import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { User } from "./users.model.js";
import { generateToken } from "../../common/utils/jwtToken.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import { otpTemplate } from "../../infrastructure/email/email.template.js";

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

export default {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getUserById,
    updateUserProfile,
    changePassword,
    checkEmailAvailability,
};