import dotenv from "dotenv";
dotenv.config();

// List of required environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET_KEY"];

// Validate required variables
requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

// Server Configuration
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || "development";

// Database Configuration
export const MONGO_URI = process.env.MONGO_URI;

// JWT Configuration
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Email Configuration
export const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;

// Frontend URL (for email links)
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";