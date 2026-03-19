/**
 * ════════════════════════════════════════════════════════════════
 * REVIEWER EVALUATION CHECKLIST - Version 1.0.0
 * ════════════════════════════════════════════════════════════════
 *
 * Based on UI screenshots (Step-1 Evaluation Checklist)
 * Matches exact sections, questions, and response types shown in UI
 *
 * TOTAL: 19 items across 4 sections + 1 declaration block
 *
 * RESPONSE TYPES USED:
 * - CHECKBOX        → Must all be checked (boolean, all required)
 * - EXCELLENT_GOOD_FAIR_POOR  → 4-option radio per row
 * - ADEQUATE_NEEDS_INADEQUATE → 3-option radio per row
 * - YES_NO_CONCERN  → 3-option radio per row
 * - SINGLE_SELECT   → Pick exactly one from list (Language section)
 * ════════════════════════════════════════════════════════════════
 */

export const REVIEWER_CHECKLIST_V1_0_0 = {
    version: "1.0.0",
    effectiveFrom: "2026-01-01",
    description: "Official Peer Review Evaluation Checklist",

    sections: [

        // ══════════════════════════════════════════════════════════
        // SECTION 0: REVIEWER DECLARATION
        // All 4 checkboxes must be checked before proceeding
        // These are mandatory confirmation checkboxes — not scored
        // ══════════════════════════════════════════════════════════

        {
            sectionId: "REVIEWER_DECLARATION",
            sectionName: "REVIEWER DECLARATION",
            icon: "shield",
            order: 0,
            isMandatoryDeclaration: true,   // All must be checked to proceed
            responseType: "CHECKBOX",
            questions: [
                {
                    questionId: "RD_001",
                    questionText: "I have no conflict of interest with this manuscript.",
                    required: true,
                    order: 1,
                },
                {
                    questionId: "RD_002",
                    questionText: "I will maintain strict confidentiality throughout the review process.",
                    required: true,
                    order: 2,
                },
                {
                    questionId: "RD_003",
                    questionText: "I possess appropriate subject expertise to evaluate this manuscript.",
                    required: true,
                    order: 3,
                },
                {
                    questionId: "RD_004",
                    questionText: "This review is objective, constructive, and compliant with COPE & ICMJE standards.",
                    required: true,
                    order: 4,
                },
            ],
        },

        // ══════════════════════════════════════════════════════════
        // SECTION 1: SCIENTIFIC MERIT & QUALITY ASSESSMENT
        // Contains 3 subsections with different response scales
        // ══════════════════════════════════════════════════════════

        {
            sectionId: "SCIENTIFIC_MERIT_AND_QUALITY_ASSESSMENT",
            sectionName: "SCIENTIFIC MERIT & QUALITY ASSESSMENT",
            icon: "star",
            order: 1,
            isMandatoryDeclaration: false,

            subsections: [

                // ── Subsection 1: Scope & Originality ──────────────
                {
                    subsectionId: "SCOPE_AND_ORIGINALITY",
                    subsectionName: "Scope & Originality",
                    subsectionNumber: 1,
                    responseType: "EXCELLENT_GOOD_FAIR_POOR",
                    responseOptions: ["EXCELLENT", "GOOD", "FAIR", "POOR"],
                    questions: [
                        {
                            questionId: "SQ_001",
                            questionText: "Relevance to JAIRAM scope",
                            required: true,
                            order: 1,
                        },
                        {
                            questionId: "SQ_002",
                            questionText: "Novelty / Contribution",
                            required: true,
                            order: 2,
                        },
                        {
                            questionId: "SQ_003",
                            questionText: "Scientific significance",
                            required: true,
                            order: 3,
                        },
                    ],
                },

                // ── Subsection 2: Methodological Rigor ─────────────
                {
                    subsectionId: "METHODOLOGICAL_RIGOR",
                    subsectionName: "Methodological Rigor",
                    subsectionNumber: 2,
                    responseType: "ADEQUATE_NEEDS_INADEQUATE",
                    responseOptions: ["ADEQUATE", "NEEDS_REVISION", "INADEQUATE"],
                    questions: [
                        {
                            questionId: "MR_001",
                            questionText: "Clear objectives & background",
                            required: true,
                            order: 1,
                        },
                        {
                            questionId: "MR_002",
                            questionText: "Study design & methodology appropriate",
                            required: true,
                            order: 2,
                        },
                        {
                            questionId: "MR_003",
                            questionText: "Ethical approval / Consent documented",
                            required: true,
                            order: 3,
                        },
                        {
                            questionId: "MR_004",
                            questionText: "Statistical analysis appropriate",
                            required: true,
                            order: 4,
                        },
                    ],
                },

                // ── Subsection 3: Results & Interpretation ──────────
                {
                    subsectionId: "RESULTS_AND_INTERPRETATION",
                    subsectionName: "Results & Interpretation",
                    subsectionNumber: 3,
                    responseType: "ADEQUATE_NEEDS_INADEQUATE",
                    responseOptions: ["ADEQUATE", "NEEDS_REVISION", "INADEQUATE"],
                    questions: [
                        {
                            questionId: "RI_001",
                            questionText: "Data clarity & organization",
                            required: true,
                            order: 1,
                        },
                        {
                            questionId: "RI_002",
                            questionText: "Tables/Figures accurate & relevant",
                            required: true,
                            order: 2,
                        },
                        {
                            questionId: "RI_003",
                            questionText: "Discussion logical & evidence-based",
                            required: true,
                            order: 3,
                        },
                        {
                            questionId: "RI_004",
                            questionText: "Conclusions supported by data",
                            required: true,
                            order: 4,
                        },
                    ],
                },
            ],
        },

        // ══════════════════════════════════════════════════════════
        // SECTION 2: PUBLICATION ETHICS & COMPLIANCE
        // YES / NO / CONCERN per row
        // ══════════════════════════════════════════════════════════

        {
            sectionId: "PUBLICATION_ETHICS_AND_COMPLIANCE",
            sectionName: "PUBLICATION ETHICS & COMPLIANCE",
            icon: "shield",
            order: 2,
            isMandatoryDeclaration: false,
            responseType: "YES_NO_CONCERN",
            responseOptions: ["YES", "NO", "CONCERN"],
            questions: [
                {
                    questionId: "PE_001",
                    questionText: "Data fabrication/manipulation concerns",
                    required: true,
                    order: 1,
                },
                {
                    questionId: "PE_002",
                    questionText: "Proper citation & referencing",
                    required: true,
                    order: 2,
                },
                {
                    questionId: "PE_003",
                    questionText: "COI & Funding disclosure provided",
                    required: true,
                    order: 3,
                },
            ],
        },

        // ══════════════════════════════════════════════════════════
        // SECTION 3: LANGUAGE & PRESENTATION
        // Single select — pick exactly ONE option
        // ══════════════════════════════════════════════════════════

        {
            sectionId: "LANGUAGE_AND_PRESENTATION",
            sectionName: "LANGUAGE & PRESENTATION",
            icon: "message",
            order: 3,
            isMandatoryDeclaration: false,
            responseType: "SINGLE_SELECT",
            questions: [
                {
                    questionId: "LP_001",
                    questionText: "Clear and professional language",
                    required: false,    // Only one of three needs to be selected
                    order: 1,
                },
                {
                    questionId: "LP_002",
                    questionText: "Requires minor language editing",
                    required: false,
                    order: 2,
                },
                {
                    questionId: "LP_003",
                    questionText: "Requires major language revision",
                    required: false,
                    order: 3,
                },
            ],
            // The section itself is required — one option MUST be selected
            sectionRequired: true,
        },
    ],
};

export const CURRENT_REVIEWER_CHECKLIST = REVIEWER_CHECKLIST_V1_0_0;

// ════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Get all questions from all sections (flat list)
 * Handles both top-level questions and subsection questions
 */
export const getAllReviewerChecklistQuestions = (checklist = CURRENT_REVIEWER_CHECKLIST) => {
    const questions = [];

    for (const section of checklist.sections) {
        if (section.questions) {
            // Direct questions (REVIEWER_DECLARATION, PUBLICATION_ETHICS, LANGUAGE)
            for (const q of section.questions) {
                questions.push({
                    ...q,
                    sectionId: section.sectionId,
                    sectionName: section.sectionName,
                    responseType: section.responseType,
                    responseOptions: section.responseOptions || null,
                });
            }
        }

        if (section.subsections) {
            // Nested questions (SCIENTIFIC_MERIT subsections)
            for (const sub of section.subsections) {
                for (const q of sub.questions) {
                    questions.push({
                        ...q,
                        sectionId: section.sectionId,
                        sectionName: section.sectionName,
                        subsectionId: sub.subsectionId,
                        subsectionName: sub.subsectionName,
                        responseType: sub.responseType,
                        responseOptions: sub.responseOptions,
                    });
                }
            }
        }
    }

    return questions;
};

/**
 * Validate checklist responses before submission
 * Checks:
 * 1. All declaration checkboxes checked
 * 2. All scored questions answered
 * 3. Language section has exactly one selection
 */
export const validateReviewerChecklistResponses = (responses, checklist = CURRENT_REVIEWER_CHECKLIST) => {
    const allQuestions = getAllReviewerChecklistQuestions(checklist);
    const errors = [];

    // Check declaration checkboxes — all must be true
    const declarationQuestions = allQuestions.filter(
        q => q.sectionId === "REVIEWER_DECLARATION"
    );
    for (const q of declarationQuestions) {
        const response = responses.find(r => r.questionId === q.questionId);
        if (!response || response.response !== true) {
            errors.push({
                questionId: q.questionId,
                error: "All declaration checkboxes must be checked",
            });
        }
    }

    // Check scored questions — all must have a valid response
    const scoredQuestions = allQuestions.filter(
        q => q.sectionId !== "REVIEWER_DECLARATION" &&
             q.sectionId !== "LANGUAGE_AND_PRESENTATION" &&
             q.required
    );
    for (const q of scoredQuestions) {
        const response = responses.find(r => r.questionId === q.questionId);
        if (!response || !response.response) {
            errors.push({
                questionId: q.questionId,
                error: `Response required for: ${q.questionText}`,
            });
        }
    }

    // Check language section — exactly one must be selected
    const languageResponses = responses.filter(
        r => ["LP_001", "LP_002", "LP_003"].includes(r.questionId) && r.response === true
    );
    if (languageResponses.length !== 1) {
        errors.push({
            sectionId: "LANGUAGE_AND_PRESENTATION",
            error: "Please select exactly one language & presentation option",
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Get completion progress for UI progress bar
 * Total scoreable items = 19 (matches UI "0 / 19")
 */
export const getReviewerChecklistProgress = (responses, checklist = CURRENT_REVIEWER_CHECKLIST) => {
    const allQuestions = getAllReviewerChecklistQuestions(checklist);

    // 4 declarations + 11 scored + 3 ethics + 1 language selection = 19
    const total = allQuestions.length;

    const answered = allQuestions.filter(q => {
        const response = responses.find(r => r.questionId === q.questionId);
        return response && response.response !== undefined && response.response !== null && response.response !== "";
    }).length;

    return {
        total,
        answered,
        percentage: Math.round((answered / total) * 100),
    };
};