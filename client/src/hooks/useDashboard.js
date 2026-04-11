import { useState, useEffect, useCallback } from "react";
import { fetchUserSubmissions, fetchUserProfile, fetchMyConsentInvitations, fetchCoAuthorConsentsForSubmission } from "../services/dashboardService";
import useAuthStore from "../store/authStore";

const deriveConsentStatus = (submission) => {
    // No co-authors — consent not applicable
    if (!submission.coAuthors || submission.coAuthors.length === 0) return "APPROVED";
    // DRAFT with co-authors but not yet submitted — consent emails not sent yet
    if (submission.status === "DRAFT") return "PENDING";
    switch (submission.consentDeadlineStatus) {
        case "RESOLVED": return "APPROVED";
        case "ACTIVE":
        case "REMINDED": return "PENDING";
        case "NOTIFIED":
        case "AUTO_REJECTED": return "REJECTED";
        default: return "PENDING";
    }
};

const normaliseForAuthorTable = (sub, consentData = {}) => ({
    id: sub._id,
    submissionNumber: sub.submissionNumber ?? null,
    title: sub.title ?? "Untitled",
    articleType: sub.articleType ?? "—",
    status: sub.status ?? "DRAFT",
    coAuthorConsentStatus: consentData.aggregatedStatus || deriveConsentStatus(sub),
    paymentStatus: sub.paymentStatus ?? false,
    submittedAt: sub.submittedAt ?? null,
    _raw: sub,
});

const normaliseForCoAuthorTable = (sub, userId, userEmail, consentMap = {}) => {
    const myEntry =
        sub._myCoAuthorEntry ||
        sub.coAuthors?.find((ca) => {
            const linkedId = ca.user?._id || ca.user;
            const linkedMatch = linkedId && linkedId.toString() === userId;
            const emailMatch =
                ca.email &&
                userEmail &&
                ca.email.toLowerCase() === userEmail.toLowerCase();
            return linkedMatch || emailMatch;
        });

    const consent = consentMap[sub._id?.toString()] ?? {};
    const rawStatus = consent.status ?? "PENDING";
    const consentStatus =
        rawStatus === "APPROVED" ? "APPROVED"
            : rawStatus === "REJECTED" ? "REJECTED"
                : "PENDING";

    const canView = consentStatus !== "REJECTED";
    const canViewFull = !!myEntry?.isCorresponding && consentStatus === "APPROVED";
    const canRespond = consentStatus === "PENDING";

    return {
        id: sub._id,
        submissionNumber: sub.submissionNumber ?? "—",
        title: sub.title ?? "Untitled",
        articleType: sub.articleType ?? "—",
        mainAuthor: sub.author
            ? `${sub.author.firstName ?? ""} ${sub.author.lastName ?? ""}`.trim()
            : "—",
        status: sub.status ?? "SUBMITTED",
        consentStatus,
        tokenValid: consent.tokenValid ?? false,
        isCorrespondingCoAuthor: !!myEntry?.isCorresponding,
        canView,
        canViewFull,
        canRespond,
        _raw: sub,
    };
};

const useDashboard = () => {
    const { user } = useAuthStore();

    const [authorSubmissions, setAuthorSubmissions] = useState([]);
    const [coAuthorSubmissions, setCoAuthorSubmissions] = useState([]);
    const [pendingConsents, setPendingConsents] = useState([]); // future use
    const [fullProfile, setFullProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);

        try {
            // Fetch submissions and full profile in parallel
            const [allSubmissions, profile, myConsents] = await Promise.all([
                fetchUserSubmissions(),
                fetchUserProfile(),
                fetchMyConsentInvitations(),
            ]);

            setFullProfile(profile);

            // Build a map: submissionId → consent object { status, tokenValid }
            const myConsentMap = {};
            for (const c of myConsents) {
                myConsentMap[c.submissionId?.toString()] = {
                    status: c.status,           // PENDING/APPROVED/REJECTED
                    tokenValid: c.tokenValid,   // true if token not expired, false otherwise
                };
            }

            const myId = user.id;
            const authorRows = [];
            const coAuthorRows = [];

            // First, identify author submissions to fetch consent data for them
            const authorSubmissions = allSubmissions.filter(sub => {
                const authorId = sub.author?._id?.toString() ?? sub.author?.toString() ?? null;
                return authorId === myId;
            });

            // Fetch consent data for all author submissions in parallel
            const consentDataMap = {};
            if (authorSubmissions.length > 0) {
                const consentPromises = authorSubmissions.map(sub =>
                    fetchCoAuthorConsentsForSubmission(sub._id)
                        .then(data => {
                            consentDataMap[sub._id?.toString()] = data;
                        })
                        .catch(err => {
                            console.warn(`Failed to fetch consent data for submission ${sub._id}:`, err);
                            consentDataMap[sub._id?.toString()] = { aggregatedStatus: "APPROVED" };
                        })
                );
                await Promise.all(consentPromises);
            }

            // Now process all submissions
            for (const sub of allSubmissions) {
                const authorId =
                    sub.author?._id?.toString()
                    ?? sub.author?.toString()
                    ?? null;

                if (authorId === myId) {
                    const consentData = consentDataMap[sub._id?.toString()] || {};
                    authorRows.push(normaliseForAuthorTable(sub, consentData));
                } else {
                    coAuthorRows.push(normaliseForCoAuthorTable(sub, myId, user.email, myConsentMap));
                }
            }

            setAuthorSubmissions(authorRows);
            setCoAuthorSubmissions(coAuthorRows);
        } catch (err) {
            console.error("[useDashboard] fetch failed:", err);
            const message =
                err.response?.data?.message
                ?? err.message
                ?? "Failed to load your submissions. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [user?.email, user?.id]);

    useEffect(() => { load(); }, [load]);

    return {
        authorSubmissions,
        coAuthorSubmissions,
        pendingConsents,
        fullProfile,       // ← full user object from /api/users/profile
        loading,
        error,
        refetch: load,
    };
};

export default useDashboard;
