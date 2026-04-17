import { sendEmail } from "../../infrastructure/email/email.service.js";
import { CONTACT_RECEIVER_EMAIL } from "../../config/env.js";
import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const sendContactMessage = async ({ name, email, subject, message }) => {
    try {
        const safeName = name.trim();
        const safeEmail = email.trim().toLowerCase();
        const safeSubject = subject.trim();
        const safeMessage = message.trim();

        await sendEmail({
            to: CONTACT_RECEIVER_EMAIL,
            subject: `[Contact Form] ${safeSubject}`,
            replyTo: safeEmail,
            text: [
                "New contact form message received.",
                "",
                `Name: ${safeName}`,
                `Email: ${safeEmail}`,
                `Subject: ${safeSubject}`,
                "",
                "Message:",
                safeMessage,
            ].join("\n"),
            html: `
                <h2>New Contact Form Message</h2>
                <p>A visitor submitted the contact form.</p>
                <hr>
                <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
                <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
                <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
                <p><strong>Message:</strong></p>
                <div style="white-space: pre-wrap; border-left: 4px solid #cbd5e1; padding-left: 12px; color: #334155;">
                    ${escapeHtml(safeMessage)}
                </div>
            `,
            // email.service passes through unknown fields to nodemailer mailOptions? No.
        });

        return {
            message: "Message sent successfully",
            contact: {
                name: safeName,
                email: safeEmail,
                subject: safeSubject,
            },
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            "Failed to send contact message",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONTACT_MESSAGE_SEND_FAILED",
            { originalError: error.message }
        );
    }
};

export default {
    sendContactMessage,
};
