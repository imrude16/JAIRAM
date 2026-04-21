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

const formatDisplayDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const sendContactMessage = async ({ name, email, subject, message }) => {
    try {
        const safeName = name.trim();
        const safeEmail = email.trim().toLowerCase();
        const safeSubject = subject.trim();
        const safeMessage = message.trim();
        const submittedAt = new Date();

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
                `Submitted At: ${formatDisplayDate(submittedAt)}`,
                "",
                "Message:",
                safeMessage,
            ].join("\n"),
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Contact Form Message</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #edf2f7;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(180deg, #edf3fb 0%, #edf2f7 100%);">
                        <tr>
                            <td align="center" style="padding: 34px 16px;">
                                <table role="presentation" style="width: 100%; max-width: 680px; border-collapse: collapse; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 40px rgba(14, 30, 62, 0.12);">
                                    <tr>
                                        <td style="padding: 34px 34px 28px 34px; background: linear-gradient(135deg, #173f77 0%, #1f5aa6 55%, #5e8ed0 100%);">
                                            <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.78); font-weight: 700;">
                                                Contact Form Notification
                                            </div>
                                            <h1 style="margin: 14px 0 10px 0; color: #ffffff; font-size: 30px; line-height: 1.2;">
                                                New Contact Message Received
                                            </h1>
                                            <p style="margin: 0; color: rgba(255,255,255,0.88); font-size: 14px; line-height: 1.6;">
                                                JAIRAM Website Enquiry Alert
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 34px;">
                                            <div style="margin-bottom: 18px;">
                                                <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; border: 1px solid #c8dcff; background: #e9f2ff; color: #1f5fbf; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;">
                                                    New Enquiry
                                                </span>
                                            </div>

                                            <p style="margin: 0 0 18px 0; color: #344054; font-size: 15px; line-height: 1.75;">
                                                A visitor has submitted the contact form. The enquiry details are listed below for follow-up and reply.
                                            </p>

                                            <div style="margin: 24px 0; padding: 20px 22px; border-radius: 14px; border: 1px solid #dbe4ee; background: #f8fafc;">
                                                <h3 style="margin: 0 0 12px 0; color: #162033; font-size: 17px;">Sender Details</h3>
                                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                                    <tr>
                                                        <td style="padding: 10px 0; width: 38%; color: #5b6475; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eef2f7;">Name</td>
                                                        <td style="padding: 10px 0; color: #162033; font-size: 14px; border-bottom: 1px solid #eef2f7;">${escapeHtml(safeName)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; width: 38%; color: #5b6475; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eef2f7;">Email</td>
                                                        <td style="padding: 10px 0; color: #162033; font-size: 14px; border-bottom: 1px solid #eef2f7;">
                                                            <a href="mailto:${escapeHtml(safeEmail)}" style="color: #1f5fbf; text-decoration: none;">${escapeHtml(safeEmail)}</a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; width: 38%; color: #5b6475; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eef2f7;">Subject</td>
                                                        <td style="padding: 10px 0; color: #162033; font-size: 14px; border-bottom: 1px solid #eef2f7;">${escapeHtml(safeSubject)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; width: 38%; color: #5b6475; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Submitted At</td>
                                                        <td style="padding: 10px 0; color: #162033; font-size: 14px;">${escapeHtml(formatDisplayDate(submittedAt))}</td>
                                                    </tr>
                                                </table>
                                            </div>

                                            <div style="margin: 24px 0; padding: 20px 22px; border-radius: 14px; border: 1px solid #c8dcff; background: #eef5ff;">
                                                <h3 style="margin: 0 0 12px 0; color: #162033; font-size: 17px;">Message</h3>
                                                <div style="white-space: pre-wrap; color: #344054; font-size: 14px; line-height: 1.8; background: #ffffff; border: 1px solid #dbe4ee; border-radius: 12px; padding: 16px 18px;">
                                                    ${escapeHtml(safeMessage)}
                                                </div>
                                            </div>

                                            <div style="margin: 26px 0 10px 0; text-align: center;">
                                                <a href="mailto:${escapeHtml(safeEmail)}?subject=${encodeURIComponent(`Re: ${safeSubject}`)}" style="display: inline-block; padding: 14px 26px; border-radius: 10px; background: linear-gradient(135deg, #1f4f96 0%, #14396e 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 0.01em; box-shadow: 0 10px 24px rgba(20, 57, 110, 0.18);">
                                                    Reply to Sender
                                                </a>
                                            </div>

                                            <p style="margin: 24px 0 0 0; color: #4b5565; font-size: 14px; line-height: 1.75;">
                                                This email was generated from the JAIRAM website contact form and delivered to the configured recipient inbox.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 34px 30px 34px; background: #f7f9fc; border-top: 1px solid #e6ecf3;">
                                            <p style="margin: 0 0 8px 0; color: #475467; font-size: 12px; font-weight: 700;">
                                                JAIRAM
                                            </p>
                                            <p style="margin: 0 0 6px 0; color: #667085; font-size: 12px; line-height: 1.6;">
                                                Journal of Advanced & Integrated Research in Acute Medicine
                                            </p>
                                            <p style="margin: 0; color: #98a2b3; font-size: 12px; line-height: 1.6;">
                                                This is an automated contact notification from the JAIRAM platform.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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
