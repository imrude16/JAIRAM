import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      lowercase: true,
      trim: true,
      match: [
       /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // Professional Information
    title: {
      type: String,
      enum: ["Dr.", "Prof.", "Mr.", "Ms.", "Mrs.", "Other"],
      default: "Dr.",
    },
    // degree: {
    //   type: String,
    //   trim: true,
    //   maxlength: [100, "Degree cannot be more than 100 characters"],
    // },

    profession: {
      type: String,
      enum: [
        "Physician (MD)",
        "Physician (DO)",
        "Physician Resident / Fellow",
        "Student, Medical School",
        "Administrator",
      
        "PA",
        "Nurse Practitioner",
        "Nursing Advance Practice",
        "Nursing, RN",
        "Nursing, LPN",
        "Allied Health Professional",
        "Other",
      ],
      default: "Other",
    },
    speciality: {
      type: String,
      trim: true,
    },
     department: {
      type: String,
      trim: true,
      required: [true, "Please provide department"],
    },
    institution: {
      type: String,
      trim: true,
      required: [true, "Please provide institution"],
    },
    orcid: {
      type: String,
      trim: true,
    },

    // Address Information
    address: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      required: [true, "Please provide country"],
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },

    // Contact Information
    phoneCode: {
      type: String,
      trim: true,
      required: [true, "Please provide phone code"],
    },
    mobile: {
      type: String,
      trim: true,
      required: [true, "Please provide mobile number"],
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Additional Info
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },

    // Tokens for verification and password reset
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpire: Date,

    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: Date,

    passwordChangedAt: Date,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type : Date,
    }

  },
);


// Explicit Indexing - Enforce unique email at database level
userSchema.index({ email: 1 }, { unique: true });

// Common filtering indexes (scalability)
userSchema.index({ profession: 1 });
userSchema.index({ isActive: 1 });

// Optional compound index (useful for admin queries)
// userSchema.index({ role: 1, isActive: 1 });


// Hash Password before saving
userSchema.pre("save", async function () {
  // If password is not modified, skip hashing
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Also keep matchPassword for backward compatibility if needed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.getVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate password reset token 
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default model("User", userSchema);
