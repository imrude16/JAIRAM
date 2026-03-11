import { connect } from "mongoose";

import { MONGO_URI } from "../../config/env.js";
import { syncModelIndexes } from "../../config/index-sync.js";
import { Submission } from "../../modules/submissions/submissions.model.js";
import { User } from "../../modules/users/users.model.js";
import { Consent } from "../../modules/consents/consent.model.js";
import { ManuscriptVersion } from "../../modules/manuscriptVersions/manuscriptVersion.model.js";
import { SubmissionCycle } from "../../modules/submissionCycles/submissionCycle.model.js";

const connectDB = async () => {
    try {
        await connect(MONGO_URI);
        console.log("✅ MongoDB Connected");

        // ═══════════════════════════════════════════════════════════
        // SYNC INDEXES ACROSS ALL MODELS
        // ═══════════════════════════════════════════════════════════
        console.log("🔄 [INDEX-SYNC] Starting index synchronization...");

        await syncModelIndexes(Submission, "Submission");
        await syncModelIndexes(User, "User");
        await syncModelIndexes(Consent, "Consent");
        await syncModelIndexes(ManuscriptVersion, "ManuscriptVersion");
        await syncModelIndexes(SubmissionCycle, "SubmissionCycle");

        console.log("✅ [INDEX-SYNC] All indexes synced");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
};

export { connectDB };
