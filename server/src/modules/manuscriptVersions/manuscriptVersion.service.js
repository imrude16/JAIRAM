import { AppError } from "../../common/errors/AppError.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";
import { ManuscriptVersion } from "./manuscriptVersion.model.js";

/**
 * ════════════════════════════════════════════════════════════════
 * MANUSCRIPT VERSION SERVICE
 * ════════════════════════════════════════════════════════════════
 */

// ================================================
// CREATE MANUSCRIPT VERSION
// ================================================

const createManuscriptVersion = async (submissionId, cycleId, uploadedBy, uploaderRole, fileRefs) => {
    try {
        const versionCount = await ManuscriptVersion.countDocuments({ submissionId });

        const version = await ManuscriptVersion.create({
            submissionId,
            cycleNumber: cycleId,
            fileRefs,
            uploadedBy,
            uploaderRole,
            versionNumber: versionCount + 1,
        });

        console.log(`🔵 [VERSION-SERVICE] Manuscript version ${versionCount + 1} created`);
        return version;
    } catch (error) {
        console.error("❌ [VERSION-SERVICE] Failed to create manuscript version:", error);
        throw new AppError(
            "Failed to create manuscript version",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "VERSION_CREATION_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET VERSIONS BY SUBMISSION
// ================================================

const getVersionsBySubmission = async (submissionId) => {
    try {
        const versions = await ManuscriptVersion.findBySubmission(submissionId);
        
        console.log(`🔵 [VERSION-SERVICE] Retrieved ${versions.length} versions`);
        return versions;
    } catch (error) {
        console.error("❌ [VERSION-SERVICE] Failed to retrieve versions:", error);
        throw new AppError(
            "Failed to retrieve manuscript versions",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_VERSIONS_ERROR",
            { originalError: error.message }
        );
    }
};

// ================================================
// GET LATEST VERSION
// ================================================

const getLatestVersion = async (submissionId) => {
    try {
        const version = await ManuscriptVersion.getLatestVersion(submissionId);
        
        console.log(`🔵 [VERSION-SERVICE] Retrieved latest version`);
        return version;
    } catch (error) {
        console.error("❌ [VERSION-SERVICE] Failed to retrieve latest version:", error);
        throw new AppError(
            "Failed to retrieve latest version",
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "GET_LATEST_VERSION_ERROR",
            { originalError: error.message }
        );
    }
};

export default {
    createManuscriptVersion,
    getVersionsBySubmission,
    getLatestVersion,
};