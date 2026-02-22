import { transporter } from "./email.client.js";
import { AppError } from "../../common/errors/AppError.js";
import{ STATUS_CODES } from "../../common/constants/statusCodes.js";

/**
 * EMAIL SERVICE
 * 
 * Handles sending emails using Nodemailer
 * 
 * Configuration required in .env:
 * - EMAIL_HOST (e.g., smtp.gmail.com)
 * - EMAIL_PORT (e.g., 587)
 * - EMAIL_USER (your email address)
 * - EMAIL_PASS (app password for Gmail)
 * - EMAIL_FROM (sender email address)
 */

const sendEmail = async ({
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments,
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: Array.isArray(to) ? to.join(",") : to,
            subject,
            text,
            html,
            cc,
            bcc,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully:", info.messageId);       // debugger

        return info;
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw new AppError(
            "Failed to send email",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "EMAIL_SEND_FAILED",
            { error: error.message }
        );
    }
};

export {
    sendEmail,
};