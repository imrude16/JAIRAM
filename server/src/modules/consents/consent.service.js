import crypto from "crypto";
import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { Consent } from "./consent.model.js";
import { User } from "../users/users.model.js";
import { sendEmail } from "../../infrastructure/email/email.service.js";
import {
    coAuthorConsentTemplate,
    coAuthorRejectionNoticeTemplate,
} from "../../infrastructure/email/email.template.js";

/**
 * CONSENT SERVICE
 */

const createConsent = async (submissionId, coAuthorData) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Creating consent record");

        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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

        if (coAuthorData.user) {
            consentData.coAuthorId = coAuthorData.user;
        } else {
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

const sendConsentEmail = async (submission, coAuthorData, token) => {
    try {
        const email = coAuthorData.email;
        const name = `${coAuthorData.firstName} ${coAuthorData.lastName}`.trim();
        const consentUrl = `${process.env.FRONTEND_URL}/coauthor-consent?token=${token}`;

        await sendEmail({
            to: email,
            subject: `Co-Author Consent Request - ${submission.title}`,
            html: coAuthorConsentTemplate({
                name,
                submissionTitle: submission.title,
                submissionNumber: submission.submissionNumber || "Draft",
                consentUrl,
            }),
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

const processConsentResponse = async (token, decision, remark = null) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Processing consent response");

        const consent = await Consent.findOne({ consentToken: token })
            .select("+consentToken +consentTokenExpires");

        if (!consent) {
            throw new AppError(
                "Consent record not found",
                STATUS_CODES.NOT_FOUND,
                "CONSENT_NOT_FOUND"
            );
        }

        if (!consent.verifyToken(token)) {
            throw new AppError(
                "Invalid or expired consent token",
                STATUS_CODES.BAD_REQUEST,
                "INVALID_TOKEN"
            );
        }

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

const getConsentStatus = async (submissionId) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Getting consent status");

        const consents = await Consent.findBySubmission(submissionId);

        const pending = consents.filter((c) => c.status === "PENDING");
        const approved = consents.filter((c) => c.status === "APPROVED");
        const rejected = consents.filter((c) => c.status === "REJECTED");
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

const notifyAuthorOfRejection = async (submission, consent) => {
    try {
        const author = await User.findById(submission.author);
        if (!author) return;

        const coAuthor = consent.coAuthorId ? await User.findById(consent.coAuthorId) : null;
        const coAuthorName = coAuthor
            ? `${coAuthor.firstName} ${coAuthor.lastName}`
            : `${consent.coAuthorFirstName || ""} ${consent.coAuthorLastName || ""}`.trim() || "Co-Author";
        const coAuthorEmail = coAuthor?.email || consent.coAuthorEmail || "Unknown";

        await sendEmail({
            to: author.email,
            subject: `Co-Author Consent Rejected - ${submission.submissionNumber}`,
            html: coAuthorRejectionNoticeTemplate({
                authorName: `${author.firstName} ${author.lastName}`,
                coAuthorName,
                coAuthorEmail,
                submissionTitle: submission.title,
                submissionNumber: submission.submissionNumber || "Draft",
                remark: consent.remark,
            }),
        });

        console.log("📧 [CONSENT-SERVICE] Rejection notification sent to author");
    } catch (emailError) {
        console.error("❌ [CONSENT-SERVICE] Failed to send rejection notification:", emailError);
    }
};

const linkConsentToUser = async (user) => {
    try {
        console.log("🔵 [CONSENT-SERVICE] Linking consents to registered user");

        const consents = await Consent.find({
            coAuthorEmail: user.email,
            coAuthorId: null,
            status: { $in: ["PENDING", "APPROVED"] },
        });

        if (consents.length === 0) {
            console.log("ℹ️ [CONSENT-SERVICE] No pending consents found");
            return [];
        }

        const linkedConsents = [];

        for (const consent of consents) {
            const emailMatch = consent.coAuthorEmail === user.email;
            const phoneMatch = consent.coAuthorPhoneNumber === user.mobileNumber;

            if (emailMatch && phoneMatch) {
                consent.coAuthorId = user._id;
                consent.coAuthorFirstName = undefined;
                consent.coAuthorLastName = undefined;
                consent.coAuthorPhoneNumber = undefined;

                await consent.save();
                linkedConsents.push(consent);

                console.log(`✅ [CONSENT-SERVICE] Linked consent for submission ${consent.submissionId}`);
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
