import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

/**
 * USER SCHEMA
 * 
 * This schema defines the structure of user documents in MongoDB.
 * It includes fields for authentication, profile, and OTP verification.
 * 
 * ERROR HANDLING:
 * - All async operations in methods wrapped in try-catch
 * - Errors logged and re-thrown for upper layers to handle
 */

const userSchema = new Schema(
    {
        // ========== BASIC INFORMATION ==========
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        // ========== PROFESSIONAL INFORMATION ==========
        profession: {
            type: String,
            enum: {
                values: ["DOCTOR", "RESEARCHER", "STUDENT", "OTHER"],
                message: "{VALUE} is not a valid profession",
            },
            required: [true, "Profession is required"],
        },
        primarySpecialty: {
            type: String,
            required: [true, "Primary specialty is required"],
            trim: true,
        },
        institution: {
            type: String,
            required: [true, "Institution is required"],
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },

        // ========== CONTACT & ADDRESS ==========
        phoneCode: {
            type: String,
            required: [true, "Phone code is required"],
        },
        mobileNumber: {
            type: String,
            required: [true, "Mobile number is required"],
        },
        address: {
            street: {
                type: String,
                required: [true, "Street is required"],
                trim: true
            },
            city: {
                type: String,
                required: [true, "City is required"],
                trim: true
            },
            state: {
                type: String,
                required: [true, "State is required"],
                trim: true
            },
            country: {
                type: String,
                required: [true, "Country is required"],
                trim: true,
            },
            postalCode: {
                type: String,
                required: [true, "Postal code is required"],
                trim: true
            },
        },

        // ========== ROLE & STATUS ==========
        role: {
            type: String,
            enum: {
                values: ["USER", "ADMIN", "EDITOR", "TECHNICAL_EDITOR", "REVIEWER"],
                message: "{VALUE} is not a valid role",
            },
            default: "USER",
        },

        // ========== EMAIL VERIFICATION ==========
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationOTP: {
            type: String,
            select: false,
        },
        emailVerificationOTPExpires: {
            type: Date,
            select: false,
        },

        // ========== TERMS & CONDITIONS ACCEPTANCE ==========
        termsAccepted: {
            type: Boolean,
            default: false,
        },

        // ========== ACCOUNT STATUS ==========
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            /*
            transform(doc, ret) lets you modify the plain object (ret) that will be sent to the client when converting a Mongoose document to JSON.
            It runs automatically during res.json().

            ✔ Control over API response shape
            ✔ Security layer
            ✔ Ability to hide internal fields
            ✔ Ability to modify structure
            */
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.emailVerificationOTP;
                delete ret.emailVerificationOTPExpires;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// ========== VIRTUAL PROPERTIES ==========
// Virtual property to get full name of the user by using firstName and lastName
// When fullName is accessed, the getter function concatenates firstName and lastName with a space in between and returns the full name as a single string.
// This allows us to easily retrieve the user's full name without storing it as a separate field in the database.
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// ========== MIDDLEWARE (HOOKS) ==========
/**
 * PRE-SAVE MIDDLEWARE
 * Hashes password before saving to database
 * 
 * ERROR HANDLING:
 * - Wraps bcrypt hashing in try-catch
 * - Logs errors for debugging
 * - Throws error to prevent saving with unhashed password
 */
// "Hey Mongoose, before saving a document, run this function."
userSchema.pre("save", async function () {
    try {

        console.log("🔶 [PRE-SAVE] Hook started");         // debugger

        if (!this.isModified("password")) {
            console.log("🔶 [PRE-SAVE] Password not modified, skipping hash");
            return;
        }
        /*
        Function definition → does NOT decide`this`
        Function invocation → decides`this`
        Mongoose controls invocation → binds `this` to document

        // CASE 1:
        function test() {
            console.log(this);
        }
        test();
        Output: global object(or undefined in strict mode)

        // CASE 2.0:
        const obj = { name: "Akash" };

        function test() {
            console.log(this.name);
        }

        test.call(obj);
        Output: "Akash" (Mongoose does similar binding to the document)

        // CASE 2.1:
        userSchema.pre("save", async function () {
            console.log(this); // This will log the user document being saved
        });
        Output: Mongoose binds `this` to the document being saved, so it logs the user document
        */
        console.log("🔶 [PRE-SAVE] Hashing password...");         // debugger

        try {
            this.password = await bcrypt.hash(this.password, 10);

            console.log("✅ [PRE-SAVE] Password hashed successfully");          // debugger

        } catch (hashError) {
            console.error("❌ [PRE-SAVE] Error hashing password:", hashError);
            throw new Error(`Password hashing failed: ${hashError.message}`);
        }

    } catch (error) {
        console.error("❌ [PRE-SAVE] Pre-save hook failed:", error);
        throw error;
    }
});

// ========== INSTANCE METHODS ==========
/**
 * COMPARE PASSWORD METHOD
 * 
 * ERROR HANDLING:
 * - Wraps bcrypt.compare in try-catch
 * - Logs errors for debugging
 * - Returns false on error (secure default)
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {

        console.log("🔐 [COMPARE-PASSWORD] Comparing passwords");         // debugger

        try {
            const isMatch = await bcrypt.compare(candidatePassword, this.password);

            console.log("🔐 [COMPARE-PASSWORD] Result:", isMatch);          // debugger

            return isMatch;
        } catch (compareError) {
            console.error("❌ [COMPARE-PASSWORD] Error comparing passwords:", compareError);
            throw new Error(`Password comparison failed: ${compareError.message}`);
        }

    } catch (error) {
        console.error("❌ [COMPARE-PASSWORD] comparePassword method failed:", error);
        throw error;
    }
};

/**
 * GENERATE OTP METHOD
 * 
 * ERROR HANDLING:
 * - Validates OTP generation
 * - Logs errors for debugging
 * - Throws error if OTP generation fails
 */
userSchema.methods.generateOTP = function () {
    try {

        console.log("🔢 [GENERATE-OTP] Generating OTP");         // debugger

        // Generate random 6-digit number
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            throw new Error("Invalid OTP format generated");
        }

        // Store OTP
        this.emailVerificationOTP = otp;

        // OTP expires in 10 minutes
        this.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

        console.log("🔢 [GENERATE-OTP] OTP generated:", otp);            // debugger
        console.log("🔢 [GENERATE-OTP] Expires at:", this.emailVerificationOTPExpires);        // debugger

        return otp;

    } catch (error) {
        console.error("❌ [GENERATE-OTP] generateOTP method failed:", error);
        throw new Error(`OTP generation failed: ${error.message}`);
    }
};

/**
 * VERIFY OTP METHOD
 * 
 * ERROR HANDLING:
 * - Validates inputs
 * - Checks for null/undefined values
 * - Logs detailed verification steps
 * - Throws error if verification process fails
 */
userSchema.methods.verifyOTP = function (otp) {
    try {

        console.log("✔️ [VERIFY-OTP] Verifying OTP");         // debugger
        console.log("✔️ [VERIFY-OTP] Provided OTP:", otp);            // debugger
        console.log("✔️ [VERIFY-OTP] Stored OTP:", this.emailVerificationOTP);         // debugger
        console.log("✔️ [VERIFY-OTP] Expiry time:", this.emailVerificationOTPExpires);             // debugger
        console.log("✔️ [VERIFY-OTP] Current time:", new Date());            // debugger

        // Validate inputs
        if (!otp) {
            console.log("✔️ [VERIFY-OTP] No OTP provided");      // debugger
            return false;
        }

        if (!this.emailVerificationOTP) {
            console.log("✔️ [VERIFY-OTP] No OTP stored for this user");         // debugger
            return false;
        }

        if (!this.emailVerificationOTPExpires) {
            console.log("✔️ [VERIFY-OTP] No OTP expiry time stored");         // debugger
            return false;
        }

        // Check if OTP matches
        const isValid = this.emailVerificationOTP === otp;
        console.log("✔️ [VERIFY-OTP] Is valid:", isValid);          // debugger

        // Check if not expired
        const notExpired = this.emailVerificationOTPExpires > Date.now();
        console.log("✔️ [VERIFY-OTP] Not expired:", notExpired);            // debugger

        const result = isValid && notExpired;
        console.log("✔️ [VERIFY-OTP] Final result:", result);            // debugger

        return result;

    } catch (error) {
        console.error("❌ [VERIFY-OTP] verifyOTP method failed:", error);
        throw new Error(`OTP verification failed: ${error.message}`);
    }
};

// ========== STATIC METHODS ==========

/**
 * FIND BY EMAIL (STATIC METHOD)
 * 
 * ERROR HANDLING:
 * - Wraps database query in try-catch
 * - Logs errors for debugging
 * - Re-throws error for service layer to handle
 */
userSchema.statics.findByEmail = async function (email) {
    try {

        console.log("🔍 [FIND-BY-EMAIL] Searching for:", email);         // debugger

        if (!email) {
            throw new Error("Email parameter is required");
        }

        const user = await this.findOne({ email }).select("+password");
        // Note: We need to select the password field explicitly because it's set to select: false in the schema
        // This allows us to perform password comparison in the service layer when needed
        console.log("🔍 [FIND-BY-EMAIL] User found:", user ? "YES" : "NO");          // debugger

        return user;

    } catch (error) {
        console.error("❌ [FIND-BY-EMAIL] findByEmail method failed:", error);
        throw error;
    }
};

const User = model("User", userSchema);

console.log("📦 [USER-MODEL] User model created and exported");

export { User };

/*
1️⃣ USER INPUT (Frontend)
--------------------------------
User fills:
- currentPassword
- newPassword
- confirmPassword

These exist only in frontend form.


2️⃣ HTTP REQUEST SENT
--------------------------------
Frontend sends:

{
  "currentPassword": "old123",
  "newPassword": "new456",
  "confirmPassword": "new456"
}

Now values exist inside:
req.body


3️⃣ CONTROLLER LAYER
--------------------------------
Extracts values:

const { currentPassword, newPassword, confirmPassword } = req.body;

These are temporary variables.


4️⃣ VALIDATION STEP
--------------------------------
Check:
- newPassword === confirmPassword ?

If false → return error.
confirmPassword is used ONLY here.


5️⃣ FETCH USER FROM DATABASE
--------------------------------
const user = await User.findById(userId).select("+password");

Password is explicitly selected
because schema has select: false.


6️⃣ VERIFY CURRENT PASSWORD
--------------------------------
const isValid = await user.comparePassword(currentPassword);

If false → return error.
Ensures old password matches.


7️⃣ UPDATE PASSWORD FIELD
--------------------------------
user.password = newPassword;

Only THIS schema field is updated.


8️⃣ PRE-SAVE HOOK RUNS
--------------------------------
Before saving:
- Detects password modified
- Hashes new password
- Replaces plain text with hash


9️⃣ DATABASE UPDATE
--------------------------------
MongoDB stores:
password → new hashed value

Temporary fields:
- currentPassword ❌
- confirmPassword ❌

They never enter database.
*/