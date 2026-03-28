import crypto from "crypto";
import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Consent } from "./consent.model.js";
import { User } from "../users/users.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";

/**
 * ════════════════════════════════════════════════════════════════
 * CONSENT SERVICE
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// CREATE CONSENT RECORD
// ================================================

const createConsent = async (submissionId, coAuthorData) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Creating consent record");

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Handle both DATABASE_SEARCH and MANUAL_ENTRY
        const consentData = {
            submissionId,
            status: "PENDING",
            consentToken: token,
            consentTokenExpires: tokenExpires,
            emailSentAt: new Date(),
            lastEmailSentAt: new Date(),
            emailResendCount: 0,
            coAuthorEmail: coAuthorData.email,
        };

        // If DATABASE_SEARCH (user exists)
        if (coAuthorData.user) {
            consentData.coAuthorId = coAuthorData.user;
        } else {
            // MANUAL_ENTRY - store temporary verification fields
            consentData.coAuthorFirstName = coAuthorData.firstName;
            consentData.coAuthorLastName = coAuthorData.lastName;
            consentData.coAuthorPhoneNumber = coAuthorData.phoneNumber;
        }

        const consent = await Consent.create(consentData);

        console.log(`✅ [CONSENT-SERVICE] Consent record created (${coAuthorData.source})`);

        return { consent, token };
    } catch (error) {
        console.error("❌ [CONSENT-SERVICE] Failed to create consent:", error);
        throw new AppError(
            "Failed to create consent record",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_CREATION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// SEND CONSENT EMAIL
// ================================================

const sendConsentEmail = async (submission, coAuthorData, token) => {
    try {
        const email = coAuthorData.email;
        const name = `${coAuthorData.firstName} ${coAuthorData.lastName}`;
        
       const consentUrl = `${process.env.FRONTEND_URL}/coauthor-consent?token=${token}`;

        const emailHtml = `
            <h2>Co-Author Consent Request</h2>
            <p>Dear ${name},</p>
            <p>You have been added as a co-author on the manuscript titled:</p>
            <p><strong>${submission.title}</strong></p>
            <p>Submission Number: ${submission.submissionNumber || "Draft"}</p>
            <p>Please review and provide your consent by clicking the link below:</p>
            <p><a href="${consentUrl}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Provide Consent</a></p>
            <p>This link will expire in 7 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: `Co-Author Consent Request - ${submission.title}`,
            html: emailHtml,
        });

        console.log(`✅ [CONSENT-SERVICE] Email sent to ${email}`);
    } catch (emailError) {
        console.error("❌ [CONSENT-SERVICE] Failed to send email:", emailError);
        throw new AppError(
            "Failed to send consent email",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_EMAIL_ERROR",
            { originalError: emailError.message }
        );
    }
};

// ================================================
// PROCESS CONSENT RESPONSE
// ================================================

const processConsentResponse = async (token, decision, remark = null) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Processing consent response");

        // Find consent by token
        const consent = await Consent.findOne({ consentToken: token })
            .select("+consentToken +consentTokenExpires");

        if (!consent) {
            throw new AppError(
                "Consent record not found",
                STATUS_CODES.NOT_FOUND,
                "CONSENT_NOT_FOUND"
            );
        }

        // Verify token
        if (!consent.verifyToken(token)) {
            throw new AppError(
                "Invalid or expired consent token",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_TOKEN"
            );
        }

        // Update consent based on decision
        if (decision === "ACCEPT") {
            consent.approve();
        } else if (decision === "REJECT") {
            consent.reject(remark);
        }

        await consent.save();

        console.log(`✅ [CONSENT-SERVICE] Consent ${consent.status}`);

        return consent;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("❌ [CONSENT-SERVICE] Failed to process consent:", error);
        throw new AppError(
            "Failed to process consent response",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_PROCESS_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET CONSENT STATUS FOR SUBMISSION
// ================================================

const getConsentStatus = async (submissionId) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Getting consent status");

        const consents = await Consent.findBySubmission(submissionId);

        const pending = consents.filter(c => c.status === "PENDING");
        const approved = consents.filter(c => c.status === "APPROVED");
        const rejected = consents.filter(c => c.status === "REJECTED");

        const allApproved = await Consent.areAllApproved(submissionId);

        console.log("✅ [CONSENT-SERVICE] Consent status retrieved");

        return {
            total: consents.length,
            pending: pending.length,
            approved: approved.length,
            rejected: rejected.length,
            allApproved,
            consents,
        };
    } catch (error) {
        console.error("❌ [CONSENT-SERVICE] Failed to get consent status:", error);
        throw new AppError(
            "Failed to retrieve consent status",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_STATUS_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// NOTIFY AUTHOR OF REJECTION
// ================================================

const notifyAuthorOfRejection = async (submission, consent) => {
    try {
        const author = await User.findById(submission.author);
        if (!author) return;

        const coAuthor = await User.findById(consent.coAuthorId);
        if (!coAuthor) return;

        await sendEmail({
            to: author.email,
            subject: `⚠️ Co-Author Consent Rejected - ${submission.submissionNumber}`,
            html: `
                <h2>Co-Author Consent Rejected</h2>
                <p>Dear ${author.firstName} ${author.lastName},</p>
                <p>Co-author <strong>${coAuthor.firstName} ${coAuthor.lastName}</strong> (${coAuthor.email}) has <strong>rejected</strong> consent for your manuscript:</p>
                <p><strong>Title:</strong> ${submission.title}</p>
                <p><strong>Submission Number:</strong> ${submission.submissionNumber || "Draft"}</p>
                <hr>
                ${consent.remark ? `
                <p><strong>Remark from Co-Author:</strong></p>
                <blockquote style="border-left: 4px solid #dc3545; padding-left: 15px; color: #555;">
                    ${consent.remark}
                </blockquote>
                ` : ''}
                <hr>
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Contact the co-author to understand their concerns</li>
                    <li>Resolve the issue offline</li>
                    <li>If resolved, inform the Editor who can manually approve</li>
                </ol>
                <p>⚠️ Your submission status will remain <strong>DRAFT</strong> until this is resolved.</p>
            `,
        });

        console.log(`📧 [CONSENT-SERVICE] Rejection notification sent to author`);
    } catch (emailError) {
        console.error("❌ [CONSENT-SERVICE] Failed to send rejection notification:", emailError);
    }
};

// ================================================
// LINK CONSENT TO USER AFTER REGISTRATION
// ================================================

const linkConsentToUser = async (user) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Linking consents to registered user");

        // Find pending consents with this email
        const consents = await Consent.find({
            coAuthorEmail: user.email,
            coAuthorId: null,
            status: "PENDING",
        });

        if (consents.length === 0) {
            console.log("ℹ️ [CONSENT-SERVICE] No pending consents found");
            return [];
        }

        const linkedConsents = [];

        for (const consent of consents) {
            // ✅ CROSS-VERIFICATION (4 fields)
            const emailMatch = consent.coAuthorEmail === user.email;
            const phoneMatch = consent.coAuthorPhoneNumber === user.mobileNumber;

            if (emailMatch && phoneMatch) {
                // Link user ObjectId
                consent.coAuthorId = user._id;

                // Clear temporary fields
                consent.coAuthorFirstName = undefined;
                consent.coAuthorLastName = undefined;
                consent.coAuthorPhoneNumber = undefined;

                await consent.save();

                linkedConsents.push(consent);

                console.log(`✅ [CONSENT-SERVICE] Linked consent for submission ${consent.submissionId}`);
            } else {
                console.log(`⚠️ [CONSENT-SERVICE] Cross-verification failed for consent ${consent._id}`);
                console.log(`   Email: ${emailMatch}, Phone: ${phoneMatch}, First: ${firstNameMatch}, Last: ${lastNameMatch}`);
            }
        }

        return linkedConsents;
    } catch (error) {
        console.error("❌ [CONSENT-SERVICE] Failed to link consents:", error);
        throw new AppError(
            "Failed to link consents to user",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "CONSENT_LINK_ERROR",
            { originalError: error.message }
        );
    }
};

export default {
    createConsent,
    sendConsentEmail,
    processConsentResponse,
    getConsentStatus,
    notifyAuthorOfRejection,
    linkConsentToUser,
};