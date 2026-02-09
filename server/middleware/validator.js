import { body, validationResult } from "express-validator";
import User from "../models/userModel.js";

const signupValidation = [
  // Required fields
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[A-Za-z .'\-]+$/)
    .withMessage("First name can contain only letters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .matches(/^[A-Za-z .'\-]+$/),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("Email already in use");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)

    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("institution").trim().notEmpty().withMessage("Institution is required"),

  body("country").trim().notEmpty().withMessage("Country is required"),

  body("phoneCode").trim().notEmpty().withMessage("Phone code is required"),

  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9][0-9]{9}$/)
    .withMessage("Mobile number must be 10 digits"),

  // Optional fields
  body("profession")
    .optional()
    .trim()
    .isIn([
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
    ])
    .withMessage("Please select a valid profession"),

  body("speciality")
    .optional()
    .trim()
    .isIn([
      "Addiction Medicine",
      "Allergy & Immunology",
      "Alternative/Chinese Medicine",
      "Anesthesiology/Pain Medicine",
      "Behavioral Health/Psychology",
      "Biomedicine",
      "Cardiology",
      "Critical Care",
      "Dermatology",
      "Education",
      "Emergency Medicine",
      "Endocrinology",
      "Epidemiology",
      "Gastroenterology",
      "General Medicine",
      "Genetics",
      "Geriatric",
      "Health Technology",
      "Healthcare Management",
      "Healthcare Quality",
      "Hematology",
      "Hospital Administration",
      "Infectious Disease",
      "Leadership",
      "Nephrology",
      "Neurology",
      "Neurosurgery",
      "Nursing (General)",
      "Nursing (Speciality)",
      "Nursing Management",
      "Nursing Management and Administration",
      "Nursing—Advanced Practice",
      "Nutrition",
      "Obstetrics & Gynecology",
      "Oncology",
      "Ophthalmology/Optometry",
      "Orthopaedics",
      "Otolaryngology",
      "Pathology",
      "Pediatrics",
      "Pharmacology",
      "Physical Medicine & Rehabilitation",
      "Physical Therapy",
      "Plastic Surgery",
      "Psychiatry w/Addiction",
      "Public Health",
      "Pulmonary",
      "Radiology",
      "Rheumatology",
      "Speech Language & Hearing",
      "Sports Medicine",
      "Surgery (General)",
      "Surgery (Speciality)",
      "Transplantation",
      "Trauma",
      "Urology",
    ])
    .trim(),

  body("orcid").optional().trim(),
  body("address").optional().trim(),
  body("state").optional().trim(),
  body("city").optional().trim(),
  body("postalCode").optional().trim(),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export { signupValidation, loginValidation, validate };
