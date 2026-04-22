import { FRONTEND_URL } from "../../config/env.js";

const BRAND_NAME = "JAIRAM";
const JOURNAL_NAME = "Journal of Advanced & Integrated Research in Acute Medicine";
const PUBLISHER_NAME = "Nexus Biomedical Research Foundation Trust";
const CURRENT_YEAR = new Date().getFullYear();

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const formatDisplayDate = (value) => {
    if (!value) return "N/A";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const renderList = (items = []) =>
    items
        .map((item) => `<li style="margin: 0 0 10px 0;">${item}</li>`)
        .join("");

const renderRows = (rows = []) =>
    rows
        .filter((row) => row && row.label)
        .map(
            (row) => `
                <tr>
                    <td style="padding: 10px 0; width: 38%; color: #5b6475; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eef2f7;">
                        ${escapeHtml(row.label)}
                    </td>
                    <td style="padding: 10px 0; color: #162033; font-size: 14px; border-bottom: 1px solid #eef2f7;">
                        ${row.value}
                    </td>
                </tr>
            `
        )
        .join("");

const renderBadge = (label, tone = "neutral") => {
    const palette = {
        success: { background: "#e8f8ee", color: "#137a46", border: "#b6e6c9" },
        warning: { background: "#fff5e8", color: "#a25a00", border: "#ffd7a3" },
        danger: { background: "#fdeeee", color: "#b42318", border: "#f6c5c2" },
        info: { background: "#e9f2ff", color: "#1f5fbf", border: "#c8dcff" },
        neutral: { background: "#f3f5f8", color: "#475467", border: "#dce2ea" },
    };

    const selected = palette[tone] || palette.neutral;

    return `
        <span style="
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid ${selected.border};
            background: ${selected.background};
            color: ${selected.color};
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
        ">
            ${escapeHtml(label)}
        </span>
    `;
};

const renderButton = (label, href, tone = "primary") => {
    const palette = {
        primary: "linear-gradient(135deg, #1f4f96 0%, #14396e 100%)",
        success: "linear-gradient(135deg, #17834f 0%, #11653c 100%)",
        danger: "linear-gradient(135deg, #c83f34 0%, #a92c21 100%)",
    };

    return `
        <div style="margin: 26px 0 10px 0; text-align: center;">
            <a
                href="${escapeHtml(href)}"
                style="
                    display: inline-block;
                    padding: 14px 26px;
                    border-radius: 10px;
                    background: ${palette[tone] || palette.primary};
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    box-shadow: 0 10px 24px rgba(20, 57, 110, 0.18);
                "
            >
                ${escapeHtml(label)}
            </a>
        </div>
    `;
};

const renderPanel = ({ title, content, tone = "neutral" }) => {
    const tones = {
        neutral: { border: "#dbe4ee", background: "#f8fafc" },
        info: { border: "#c8dcff", background: "#eef5ff" },
        success: { border: "#b6e6c9", background: "#eefbf3" },
        warning: { border: "#ffd7a3", background: "#fff8ef" },
        danger: { border: "#f6c5c2", background: "#fff4f3" },
    };
    const selected = tones[tone] || tones.neutral;

    return `
        <div style="margin: 24px 0; padding: 20px 22px; border-radius: 14px; border: 1px solid ${selected.border}; background: ${selected.background};">
            <h3 style="margin: 0 0 12px 0; color: #162033; font-size: 17px;">
                ${escapeHtml(title)}
            </h3>
            ${content}
        </div>
    `;
};

const renderEmailLayout = ({
    preheader = "",
    heading,
    eyebrow = BRAND_NAME,
    intro = "",
    badge = "",
    sections = [],
    action = "",
    outro = "",
    footnote = "",
}) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(heading)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #edf2f7;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
            ${escapeHtml(preheader)}
        </div>
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(180deg, #edf3fb 0%, #edf2f7 100%);">
            <tr>
                <td align="center" style="padding: 34px 16px;">
                    <table role="presentation" style="width: 100%; max-width: 680px; border-collapse: collapse; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 40px rgba(14, 30, 62, 0.12);">
                        <tr>
                            <td style="padding: 34px 34px 28px 34px; background: linear-gradient(135deg, #173f77 0%, #1f5aa6 55%, #5e8ed0 100%);">
                                <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.78); font-weight: 700;">
                                    ${escapeHtml(eyebrow)}
                                </div>
                                <h1 style="margin: 14px 0 10px 0; color: #ffffff; font-size: 30px; line-height: 1.2;">
                                    ${escapeHtml(heading)}
                                </h1>
                                <p style="margin: 0; color: rgba(255,255,255,0.88); font-size: 14px; line-height: 1.6;">
                                    ${escapeHtml(JOURNAL_NAME)}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 34px;">
                                ${badge ? `<div style="margin-bottom: 18px;">${badge}</div>` : ""}
                                ${intro ? `<p style="margin: 0 0 18px 0; color: #344054; font-size: 15px; line-height: 1.75;">${intro}</p>` : ""}
                                ${sections.join("")}
                                ${action}
                                ${outro ? `<p style="margin: 24px 0 0 0; color: #4b5565; font-size: 14px; line-height: 1.75;">${outro}</p>` : ""}
                                ${footnote ? `<p style="margin: 18px 0 0 0; color: #667085; font-size: 12px; line-height: 1.7;">${footnote}</p>` : ""}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 24px 34px 30px 34px; background: #f7f9fc; border-top: 1px solid #e6ecf3;">
                                <p style="margin: 0 0 8px 0; color: #475467; font-size: 12px; font-weight: 700;">
                                    ${escapeHtml(BRAND_NAME)}
                                </p>
                                <p style="margin: 0 0 6px 0; color: #667085; font-size: 12px; line-height: 1.6;">
                                    ${escapeHtml(JOURNAL_NAME)}
                                </p>
                                <p style="margin: 0; color: #98a2b3; font-size: 12px; line-height: 1.6;">
                                    © ${CURRENT_YEAR} ${escapeHtml(BRAND_NAME)}. Published by ${escapeHtml(PUBLISHER_NAME)}.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

const renderDualActionButtons = ({
    acceptLabel = "Accept",
    acceptHref,
    rejectLabel = "Reject",
    rejectHref,
}) => `
    <div style="margin: 26px 0 10px 0; text-align: center;">
        <a
            href="${escapeHtml(acceptHref)}"
            style="
                display: inline-block;
                min-width: 150px;
                margin: 0 8px 12px 8px;
                padding: 14px 24px;
                border-radius: 10px;
                background: linear-gradient(135deg, #17834f 0%, #11653c 100%);
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.01em;
                box-shadow: 0 10px 24px rgba(17, 101, 60, 0.16);
            "
        >
            ${escapeHtml(acceptLabel)}
        </a>
        <a
            href="${escapeHtml(rejectHref)}"
            style="
                display: inline-block;
                min-width: 150px;
                margin: 0 8px 12px 8px;
                padding: 14px 24px;
                border-radius: 10px;
                background: linear-gradient(135deg, #c83f34 0%, #a92c21 100%);
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.01em;
                box-shadow: 0 10px 24px rgba(169, 44, 33, 0.16);
            "
        >
            ${escapeHtml(rejectLabel)}
        </a>
    </div>
`;

const authorDecisionTemplate = ({
    authorName,
    submissionId,
    title,
    articleType,
    decision,
    decisionStage,
    remarks,
    decidedAt,
}) => {
    const isAccepted = decision === "ACCEPT";
    const decisionLabel = isAccepted ? "Accepted" : "Rejected";

    return renderEmailLayout({
        preheader: `Your manuscript ${submissionId || ""} has been ${decisionLabel.toLowerCase()} by the editor.`,
        eyebrow: "Editorial Decision Update",
        heading: `Manuscript ${decisionLabel}`,
        badge: renderBadge(decisionLabel, isAccepted ? "success" : "danger"),
        intro: `Dear ${escapeHtml(authorName || "Author")}, an editorial decision has been recorded for your manuscript submission. Please find the summary below.`,
        sections: [
            renderPanel({
                title: "Submission Summary",
                tone: isAccepted ? "success" : "danger",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission ID", value: escapeHtml(submissionId || "N/A") },
                            { label: "Title", value: escapeHtml(title || "N/A") },
                            { label: "Article Type", value: escapeHtml(articleType || "N/A") },
                            { label: "Decision", value: renderBadge(decisionLabel, isAccepted ? "success" : "danger") },
                            { label: "Decision Stage", value: escapeHtml(decisionStage || "N/A") },
                            { label: "Decided At", value: escapeHtml(formatDisplayDate(decidedAt)) },
                        ])}
                    </table>
                `,
            }),
            remarks
                ? renderPanel({
                    title: isAccepted ? "Editor's Note" : "Reason / Remarks",
                    tone: isAccepted ? "info" : "warning",
                    content: `<p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">${escapeHtml(remarks)}</p>`,
                })
                : "",
        ].filter(Boolean),
        outro: isAccepted
            ? "Thank you for submitting your work to JAIRAM. Our team will communicate the next steps if any further action is required."
            : "Thank you for giving JAIRAM the opportunity to review your manuscript. We appreciate your effort and interest in the journal.",
        footnote: "This is an automated editorial update from the JAIRAM Manuscript Portal.",
    });
};

/**
 * OTP VERIFICATION EMAIL TEMPLATE
 *
 * Sent when user registers or requests OTP resend
 *
 * @param {string} name - User's first name
 * @param {string} otp - 6-digit OTP
 * @returns {string} - HTML email content
 */
const otpTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - JAIRAM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    JAIRAM
                                </h1>
                                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">
                                    Journal of Advanced & Integrated Research in Acute Medicine
                                </p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                                    Hello ${name}! ðŸ‘‹
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    Thank you for registering with JAIRAM. To complete your registration, please verify your email address using the OTP below:
                                </p>

                                <!-- OTP Box -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                        Your Verification Code
                                    </p>
                                    <h1 style="margin: 0; color: #667eea; font-size: 48px; font-weight: bold; letter-spacing: 8px;">
                                        ${otp}
                                    </h1>
                                </div>

                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    <strong>â° This code will expire in 10 minutes.</strong>
                                </p>

                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    If you didn't request this code, please ignore this email or contact our support team if you have concerns.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    Â© 2024 JAIRAM. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Published by: Nexus Biomedical Research Foundation Trust
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

/**
 * WELCOME EMAIL TEMPLATE
 *
 * Sent after successful email verification
 *
 * @param {string} name - User's first name
 * @returns {string} - HTML email content
 */
const welcomeTemplate = (name) =>
    renderEmailLayout({
        preheader: "Your JAIRAM account is now verified and ready to use.",
        heading: "Welcome to JAIRAM",
        badge: renderBadge("Account Verified", "success"),
        intro: `Hello ${escapeHtml(name)}, your email has been verified successfully. Your account is now active and ready for manuscript submission, review participation, and collaboration workflows on the platform.`,
        sections: [
            renderPanel({
                title: "You can start with",
                tone: "info",
                content: `
                    <ul style="margin: 0; padding-left: 18px; color: #344054; font-size: 14px; line-height: 1.8;">
                        ${renderList([
                            "Submitting a new manuscript and tracking it from your dashboard",
                            "Reviewing co-author consent activity and submission updates",
                            "Managing your profile and collaboration details",
                            "Exploring published work and future editorial interactions",
                        ])}
                    </ul>
                `,
            }),
        ],
        action: renderButton("Open JAIRAM", `${FRONTEND_URL}/dashboard`),
        outro: "If you need any help along the way, you can simply reply to future support communications or reach out through the contact page.",
        footnote: "This welcome message confirms your successful registration and email verification.",
    });

/**
 * PASSWORD RESET EMAIL TEMPLATE (OTP-BASED)
 *
 * Sent when user requests password reset
 *
 * @param {string} name - User's first name
 * @param {string} otp - 6-digit OTP
 * @returns {string} - HTML email content
 */
const passwordResetTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - JAIRAM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    Password Reset Request
                                </h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                                    Hello ${name},
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    We received a request to reset your password. Use the OTP below to reset your password:
                                </p>

                                <!-- OTP Box -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                        Your Password Reset OTP
                                    </p>
                                    <h1 style="margin: 0; color: #667eea; font-size: 48px; font-weight: bold; letter-spacing: 8px;">
                                        ${otp}
                                    </h1>
                                </div>

                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    <strong>â° This OTP will expire in 10 minutes.</strong>
                                </p>

                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                                </p>

                                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; color: #856404; font-size: 13px;">
                                        <strong>Security Tip:</strong> Never share your OTP or password with anyone.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    Â© 2024 JAIRAM. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Published by: Nexus Biomedical Research Foundation Trust
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const coAuthorConsentTemplate = ({
    name,
    submissionTitle,
    submissionNumber,
    acceptUrl,
    rejectUrl,
}) =>
    renderEmailLayout({
        preheader: `Consent requested for submission ${submissionNumber || "Draft"}.`,
        heading: "Co-Author Consent Request",
        badge: renderBadge("Action Required", "warning"),
        intro: `Dear ${escapeHtml(name)}, you have been added as a co-author on a manuscript submitted to JAIRAM. Please review the submission details below and confirm your consent.`,
        sections: [
            renderPanel({
                title: "Submission Summary",
                tone: "info",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber || "Draft") },
                            { label: "Title", value: escapeHtml(submissionTitle) },
                            { label: "Response Window", value: "Please respond within 7 days of this email." },
                        ])}
                    </table>
                `,
            }),
        ],
        action: renderDualActionButtons({
            acceptLabel: "Accept",
            acceptHref: acceptUrl,
            rejectLabel: "Reject",
            rejectHref: rejectUrl,
        }),
        outro: "If you were not expecting this request, you may safely ignore the email. The consent link expires automatically after the response window closes.",
        footnote: "This email was generated as part of the manuscript co-author consent workflow.",
    });

const suggestedReviewerInvitationTemplate = ({
    name,
    submissionTitle,
    submissionNumber,
    articleType,
    acceptUrl,
    rejectUrl,
}) =>
    renderEmailLayout({
        preheader: `You have been invited to respond to a review invitation for submission ${submissionNumber}.`,
        heading: "Reviewer Invitation",
        badge: renderBadge("Response Requested", "info"),
        intro: `Dear ${escapeHtml(name)}, you have been suggested as a potential reviewer for a manuscript submitted to JAIRAM. Please review the invitation details and let us know whether you are willing to participate.`,
        sections: [
            renderPanel({
                title: "Invitation Details",
                tone: "info",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(submissionTitle) },
                            { label: "Article Type", value: escapeHtml(articleType) },
                            { label: "Invitation Validity", value: "The response link remains active for 7 days." },
                        ])}
                    </table>
                `,
            }),
        ],
        action: renderDualActionButtons({
            acceptLabel: "Accept",
            acceptHref: acceptUrl,
            rejectLabel: "Reject",
            rejectHref: rejectUrl,
        }),
        outro: "Your response helps us move the manuscript forward without unnecessary delay. Thank you for your time and consideration.",
        footnote: "This invitation email is part of the suggested reviewer workflow for a manuscript submission.",
    });

const submissionConfirmationTemplate = ({
    authorName,
    submissionNumber,
    title,
    articleType,
    coAuthorCount = 0,
}) =>
    renderEmailLayout({
        preheader: `Submission ${submissionNumber} has been received successfully.`,
        heading: "Submission Confirmed",
        badge: renderBadge("Received", "success"),
        intro: `Dear ${escapeHtml(authorName)}, your manuscript has been submitted successfully to JAIRAM. A record has been created in the system and the editorial workflow can now proceed.`,
        sections: [
            renderPanel({
                title: "Submission Details",
                tone: "success",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Article Type", value: escapeHtml(articleType) },
                            { label: "Co-Authors", value: `${coAuthorCount}` },
                        ])}
                    </table>
                `,
            }),
            coAuthorCount > 0
                ? renderPanel({
                    title: "Co-Author Consent",
                    tone: "warning",
                    content: `
                        <p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">
                            Consent emails have been issued to all listed co-authors. They must respond before the submission can progress smoothly through the next workflow stages.
                        </p>
                    `,
                })
                : "",
        ],
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`),
        outro: "You can monitor the submission from your dashboard at any time.",
    });

const editorNewSubmissionAlertTemplate = ({
    editorName,
    submissionNumber,
    title,
    articleType,
    authorName,
    authorEmail,
    coAuthorCount = 0,
    submittedAt,
}) =>
    renderEmailLayout({
        preheader: `A new manuscript submission ${submissionNumber} has arrived on JAIRAM.`,
        heading: "New Submission Received",
        badge: renderBadge("Editorial Alert", "info"),
        intro: `Dear ${escapeHtml(editorName)}, a new manuscript has been submitted on JAIRAM and is now available for editorial awareness and subsequent workflow handling.`,
        sections: [
            renderPanel({
                title: "Submission Snapshot",
                tone: "info",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Article Type", value: escapeHtml(articleType) },
                            { label: "Main Author", value: `${escapeHtml(authorName)}<br><span style="color:#667085;">${escapeHtml(authorEmail)}</span>` },
                            { label: "Co-Authors", value: `${coAuthorCount}` },
                            { label: "Submitted At", value: escapeHtml(formatDisplayDate(submittedAt)) },
                        ])}
                    </table>
                `,
            }),
        ],
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`),
        outro: "This alert is sent to all editors so the incoming submission queue remains visible across the editorial team.",
    });

const technicalReviewAssignmentTemplate = ({
    name,
    submissionNumber,
    title,
    articleType,
    remarks,
    revisedManuscriptName,
    attachmentCount = 0,
}) =>
    renderEmailLayout({
        preheader: `You have been assigned as technical editor for submission ${submissionNumber}.`,
        heading: "Technical Review Assignment",
        badge: renderBadge("Assignment", "info"),
        intro: `Dear ${escapeHtml(name)}, you have been assigned to review the technical aspects of a manuscript on JAIRAM.`,
        sections: [
            renderPanel({
                title: "Assignment Details",
                tone: "info",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Article Type", value: escapeHtml(articleType) },
                            { label: "Revised Manuscript", value: escapeHtml(revisedManuscriptName || "Provided in assignment package") },
                            { label: "Attachments", value: `${attachmentCount}` },
                        ])}
                    </table>
                `,
            }),
            renderPanel({
                title: "Editor's Remarks",
                tone: "neutral",
                content: `<p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">${escapeHtml(remarks || "No remarks provided.")}</p>`,
            }),
        ],
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`, "primary"),
        outro: "Please review the assigned files on the platform and submit your technical decision from your dashboard.",
    });

const manuscriptReviewRequestTemplate = ({
    name,
    submissionNumber,
    title,
    articleType,
    dueDate,
    remarks,
    revisedManuscriptName,
    attachmentCount = 0,
}) =>
    renderEmailLayout({
        preheader: `You have been assigned to review submission ${submissionNumber}.`,
        heading: "Manuscript Review Request",
        badge: renderBadge("Review Assignment", "info"),
        intro: `Dear ${escapeHtml(name)}, you have been invited to review a manuscript on JAIRAM. Please review the assignment details and submit your review through the platform.`,
        sections: [
            renderPanel({
                title: "Review Details",
                tone: "info",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Article Type", value: escapeHtml(articleType) },
                            { label: "Due Date", value: escapeHtml(formatDisplayDate(dueDate)) },
                            { label: "Revised Manuscript", value: escapeHtml(revisedManuscriptName || "Provided in assignment package") },
                            { label: "Attachments", value: `${attachmentCount}` },
                        ])}
                    </table>
                `,
            }),
            renderPanel({
                title: "Editor's Remarks",
                tone: "neutral",
                content: `<p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">${escapeHtml(remarks || "No remarks provided.")}</p>`,
            }),
        ],
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`, "primary"),
        outro: "Thank you for supporting the review process. Your timely feedback helps maintain an efficient editorial workflow.",
    });

const accountStatusUpdateTemplate = ({
    name,
    newStatus,
    reason,
}) =>
    renderEmailLayout({
        preheader: `Your JAIRAM account status has been updated to ${newStatus}.`,
        heading: "Account Status Updated",
        badge: renderBadge(newStatus, newStatus === "ACTIVE" ? "success" : "warning"),
        intro: `Dear ${escapeHtml(name)}, your account status on JAIRAM has been updated.`,
        sections: [
            renderPanel({
                title: "Status Update",
                tone: newStatus === "ACTIVE" ? "success" : "warning",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "New Status", value: escapeHtml(newStatus) },
                            { label: "Reason", value: escapeHtml(reason || "No additional comment was provided.") },
                        ])}
                    </table>
                `,
            }),
        ],
        outro: "If you believe this update was made in error or need clarification, please contact the journal support team.",
    });

const roleUpdatedTemplate = ({
    name,
    newRole,
    adminName,
}) =>
    renderEmailLayout({
        preheader: `Your JAIRAM role has been updated to ${newRole}.`,
        heading: "Role Updated",
        badge: renderBadge(newRole, "success"),
        intro: `Dear ${escapeHtml(name)}, your role on JAIRAM has been updated successfully.`,
        sections: [
            renderPanel({
                title: "Role Update Details",
                tone: "success",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "New Role", value: escapeHtml(newRole) },
                            { label: "Updated By", value: escapeHtml(adminName) },
                        ])}
                    </table>
                `,
            }),
        ],
        outro: "You can now access the features and workflow permissions associated with this updated role.",
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`),
    });

const submissionApprovedByEditorTemplate = ({
    authorName,
    submissionNumber,
    title,
    editorName,
    resolvedCount,
    issueDetails,
    resolutionNote,
}) =>
    renderEmailLayout({
        preheader: `Submission ${submissionNumber} has been approved by the editor.`,
        heading: "Submission Approved by Editor",
        badge: renderBadge("Approved", "success"),
        intro: `Dear ${escapeHtml(authorName)}, your manuscript has been manually approved by the editor and can now continue in the review workflow.`,
        sections: [
            renderPanel({
                title: "Approval Details",
                tone: "success",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Approved By", value: escapeHtml(editorName) },
                            { label: "Issues Resolved", value: `${resolvedCount}` },
                            { label: "Affected Co-Authors", value: escapeHtml(issueDetails || "No issue details recorded.") },
                        ])}
                    </table>
                `,
            }),
            renderPanel({
                title: "Editor's Resolution Note",
                tone: "info",
                content: `<p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">${escapeHtml(resolutionNote)}</p>`,
            }),
        ],
        outro: "You may continue monitoring the submission from your dashboard as it proceeds to the next editorial stage.",
        action: renderButton("Open Dashboard", `${FRONTEND_URL}/dashboard`),
    });

const coAuthorConsentReminderTemplate = ({
    authorName,
    pendingCount,
    submissionNumber,
    title,
    pendingCoAuthors = [],
}) =>
    renderEmailLayout({
        preheader: `There are still pending co-author consent responses for submission ${submissionNumber}.`,
        heading: "Co-Author Consent Reminder",
        badge: renderBadge("Reminder", "warning"),
        intro: `Dear ${escapeHtml(authorName)}, ${pendingCount} co-author consent response(s) are still pending for your manuscript submission.`,
        sections: [
            renderPanel({
                title: "Submission Summary",
                tone: "warning",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber || "Draft") },
                            { label: "Title", value: escapeHtml(title) },
                            { label: "Pending Responses", value: `${pendingCount}` },
                        ])}
                    </table>
                `,
            }),
            renderPanel({
                title: "Pending Co-Authors",
                tone: "neutral",
                content: `
                    <ul style="margin: 0; padding-left: 18px; color: #344054; font-size: 14px; line-height: 1.8;">
                        ${renderList(
                            pendingCoAuthors.map(
                                (coAuthor) =>
                                    `<strong>${escapeHtml(`${coAuthor.firstName || ""} ${coAuthor.lastName || ""}`.trim() || coAuthor.email || "Co-Author")}</strong> (${escapeHtml(coAuthor.email || "No email")})<br><span style="color:#667085;">Invited: ${escapeHtml(formatDisplayDate(coAuthor.invitedAt))}</span>`
                            )
                        )}
                    </ul>
                `,
            }),
        ],
        outro: "Please follow up with the pending co-authors. If they do not respond within the consent window, the submission may be affected by the deadline policy.",
    });

const consentDeadlineExpiredTemplate = ({
    authorName,
    submissionNumber,
    title,
    rejectedIssues = [],
    noResponseIssues = [],
}) =>
    renderEmailLayout({
        preheader: `Submission ${submissionNumber} was rejected because the consent deadline expired.`,
        heading: "Submission Rejected",
        badge: renderBadge("Deadline Expired", "danger"),
        intro: `Dear ${escapeHtml(authorName)}, your manuscript submission has been automatically rejected because the co-author consent deadline expired before all required responses were completed.`,
        sections: [
            renderPanel({
                title: "Submission Details",
                tone: "danger",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber) },
                            { label: "Title", value: escapeHtml(title) },
                        ])}
                    </table>
                `,
            }),
            rejectedIssues.length > 0
                ? renderPanel({
                    title: "Rejected Consent Responses",
                    tone: "danger",
                    content: `
                        <ul style="margin: 0; padding-left: 18px; color: #344054; font-size: 14px; line-height: 1.8;">
                            ${renderList(
                                rejectedIssues.map(
                                    (issue) =>
                                        `<strong>${escapeHtml(issue.coAuthorName)}</strong> (${escapeHtml(issue.coAuthorEmail)})<br><span style="color:#667085;">Rejected on ${escapeHtml(formatDisplayDate(issue.reportedAt))}</span>`
                                )
                            )}
                        </ul>
                    `,
                })
                : "",
            noResponseIssues.length > 0
                ? renderPanel({
                    title: "No Response Cases",
                    tone: "warning",
                    content: `
                        <ul style="margin: 0; padding-left: 18px; color: #344054; font-size: 14px; line-height: 1.8;">
                            ${renderList(
                                noResponseIssues.map(
                                    (issue) =>
                                        `<strong>${escapeHtml(issue.coAuthorName)}</strong> (${escapeHtml(issue.coAuthorEmail)})<br><span style="color:#667085;">Deadline reached on ${escapeHtml(formatDisplayDate(issue.reportedAt))}</span>`
                                )
                            )}
                        </ul>
                    `,
                })
                : "",
        ],
        outro: "You may resolve the underlying consent issues and submit a new manuscript if appropriate. Please contact the journal if you need clarification on the recorded outcome.",
    });

const coAuthorRejectionNoticeTemplate = ({
    authorName,
    coAuthorName,
    coAuthorEmail,
    submissionTitle,
    submissionNumber,
    remark,
}) =>
    renderEmailLayout({
        preheader: `A co-author rejected consent for submission ${submissionNumber || "Draft"}.`,
        heading: "Co-Author Consent Rejected",
        badge: renderBadge("Attention Needed", "danger"),
        intro: `Dear ${escapeHtml(authorName)}, a co-author has rejected consent for your manuscript submission. The submission cannot proceed until the issue is resolved.`,
        sections: [
            renderPanel({
                title: "Rejected Consent Details",
                tone: "danger",
                content: `
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${renderRows([
                            { label: "Submission Number", value: escapeHtml(submissionNumber || "Draft") },
                            { label: "Title", value: escapeHtml(submissionTitle) },
                            { label: "Co-Author", value: `${escapeHtml(coAuthorName)}<br><span style="color:#667085;">${escapeHtml(coAuthorEmail)}</span>` },
                        ])}
                    </table>
                `,
            }),
            remark
                ? renderPanel({
                    title: "Co-Author Remark",
                    tone: "warning",
                    content: `<p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">${escapeHtml(remark)}</p>`,
                })
                : "",
        ],
        outro: "Please contact the co-author directly to resolve the concern. Once resolved, the editor may review the situation and decide on the next step.",
    });

const modernOtpTemplate = (name, otp) =>
    renderEmailLayout({
        preheader: "Use this verification code to complete your JAIRAM registration.",
        heading: "Email Verification",
        badge: renderBadge("Verification Required", "info"),
        intro: `Hello ${escapeHtml(name)}, thank you for registering with JAIRAM. Please use the verification code below to complete your email verification.`,
        sections: [
            renderPanel({
                title: "Your Verification Code",
                tone: "info",
                content: `
                    <div style="text-align: center; padding: 16px 0 8px 0;">
                        <div style="display: inline-block; padding: 18px 26px; border-radius: 14px; border: 2px dashed #1f5aa6; background: #ffffff;">
                            <div style="color: #1f4f96; font-size: 42px; line-height: 1; font-weight: 800; letter-spacing: 8px;">
                                ${escapeHtml(otp)}
                            </div>
                        </div>
                    </div>
                    <p style="margin: 18px 0 0 0; color: #344054; font-size: 14px; line-height: 1.7; text-align: center;">
                        This code will expire in <strong>10 minutes</strong>.
                    </p>
                `,
            }),
        ],
        outro: "If you did not request this verification code, you can safely ignore this email.",
        footnote: "For your security, never share this code with anyone.",
    });

const modernPasswordResetTemplate = (name, otp) =>
    renderEmailLayout({
        preheader: "Use this password reset code to continue resetting your JAIRAM password.",
        heading: "Password Reset Request",
        badge: renderBadge("Security Check", "warning"),
        intro: `Hello ${escapeHtml(name)}, we received a request to reset your JAIRAM password. Use the OTP below to continue with the password reset process.`,
        sections: [
            renderPanel({
                title: "Your Password Reset OTP",
                tone: "warning",
                content: `
                    <div style="text-align: center; padding: 16px 0 8px 0;">
                        <div style="display: inline-block; padding: 18px 26px; border-radius: 14px; border: 2px dashed #d28a1f; background: #ffffff;">
                            <div style="color: #a25a00; font-size: 42px; line-height: 1; font-weight: 800; letter-spacing: 8px;">
                                ${escapeHtml(otp)}
                            </div>
                        </div>
                    </div>
                    <p style="margin: 18px 0 0 0; color: #344054; font-size: 14px; line-height: 1.7; text-align: center;">
                        This OTP will expire in <strong>10 minutes</strong>.
                    </p>
                `,
            }),
            renderPanel({
                title: "Security Reminder",
                tone: "danger",
                content: `
                    <p style="margin: 0; color: #344054; font-size: 14px; line-height: 1.75;">
                        Never share this OTP with anyone. JAIRAM will never ask you to disclose your verification code or password by email.
                    </p>
                `,
            }),
        ],
        outro: "If you did not request a password reset, you can ignore this email. Your password will remain unchanged.",
        footnote: "This is an automated security email generated for your JAIRAM account.",
    });

export {
    modernOtpTemplate as otpTemplate,
    welcomeTemplate,
    modernPasswordResetTemplate as passwordResetTemplate,
    authorDecisionTemplate,
    coAuthorConsentTemplate,
    coAuthorRejectionNoticeTemplate,
    suggestedReviewerInvitationTemplate,
    submissionConfirmationTemplate,
    editorNewSubmissionAlertTemplate,
    technicalReviewAssignmentTemplate,
    manuscriptReviewRequestTemplate,
    accountStatusUpdateTemplate,
    roleUpdatedTemplate,
    submissionApprovedByEditorTemplate,
    coAuthorConsentReminderTemplate,
    consentDeadlineExpiredTemplate,
};
