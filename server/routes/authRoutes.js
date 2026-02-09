import express from "express";
const router = express.Router();

import {
  signUp,
  logIn,
  logout,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

import {
  signupValidation,
  loginValidation,
  validate,
} from "../middleware/validator.js";


router.post("/signUp", signupValidation, validate, signUp);
router.post("/logIn", loginValidation, validate, logIn);
router.post("/logout", protect, logout);

export default router;
