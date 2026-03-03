/**
 * ════════════════════════════════════════════════════════════════
 * AUTHOR DECLARATION CHECKLIST - Version 1.0.0
 * ════════════════════════════════════════════════════════════════
 * 
 * Based on UI screenshots (Step-1A to Step-1C)
 * Matches exact categories and questions shown in submission form
 * 
 * TOTAL: 17 questions + 1 COPE checkbox
 * ════════════════════════════════════════════════════════════════
 */

export const CHECKLIST_V1_0_0 = {
    version: "1.0.0",
    effectiveFrom: "2026-01-01",
    description: "Manuscript Submission Declaration Checklist",
    
    categories: [
        {
            categoryId: "ORIGINALITY_AND_AUTHORSHIP",
            categoryName: "ORIGINALITY & AUTHORSHIP",
            icon: "clipboard",
            color: "#E8F5E9",
            order: 1,
            questions: [
                {
                    questionId: "OA_001",
                    questionNumber: 1,
                    questionText: "The manuscript is original, unpublished, and not under review elsewhere.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 1,
                },
                {
                    questionId: "OA_002",
                    questionNumber: 2,
                    questionText: "The work does not involve plagiarism, data fabrication, falsification, or redundant publication.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 2,
                },
                {
                    questionId: "OA_003",
                    questionNumber: 3,
                    questionText: "All authors meet ICMJE authorship criteria.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 3,
                },
                {
                    questionId: "OA_004",
                    questionNumber: 4,
                    questionText: "All authors have reviewed and approved the final version of the manuscript.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 4,
                },
                {
                    questionId: "OA_005",
                    questionNumber: 5,
                    questionText: "The sequence of authorship has been mutually agreed upon by all authors.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 5,
                },
            ],
        },
        
        {
            categoryId: "ETHICAL_APPROVAL_AND_HUMAN_RESEARCH_COMPLIANCE",
            categoryName: "ETHICAL APPROVAL & HUMAN RESEARCH COMPLIANCE",
            icon: "shield",
            color: "#E3F2FD",
            order: 2,
            questions: [
                {
                    questionId: "EA_001",
                    questionNumber: 6,
                    questionText: "Institutional Ethics Committee (IEC)/IRB approval was obtained prior to study initiation.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 1,
                },
                {
                    questionId: "EA_002",
                    questionNumber: 7,
                    questionText: "The Ethics Approval Number is clearly mentioned in the manuscript.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 2,
                },
                {
                    questionId: "EA_003",
                    questionNumber: 8,
                    questionText: "The study was conducted in accordance with the Declaration of Helsinki (latest revision).",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 3,
                },
                {
                    questionId: "EA_004",
                    questionNumber: 9,
                    questionText: "Written informed consent was obtained from all participants.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 4,
                },
                {
                    questionId: "EA_005",
                    questionNumber: 10,
                    questionText: "Written consent for publication of identifiable data/images was obtained (where applicable).",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 5,
                },
                {
                    questionId: "EA_006",
                    questionNumber: 11,
                    questionText: "The study complies with CPCSEA / ARRIVE / relevant international animal guidelines.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 6,
                },
                {
                    questionId: "EA_007",
                    questionNumber: 12,
                    questionText: "Confidentiality, anonymity, and data protection standards were strictly maintained.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 7,
                },
            ],
        },
        
        {
            categoryId: "TRANSPARENCY_AND_REPORTING_STANDARDS",
            categoryName: "TRANSPARENCY & REPORTING STANDARDS",
            icon: "chart",
            color: "#F3E5F5",
            order: 3,
            questions: [
                {
                    questionId: "TR_001",
                    questionNumber: 13,
                    questionText: "Conflict of Interest statement is clearly disclosed.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 1,
                },
                {
                    questionId: "TR_002",
                    questionNumber: 14,
                    questionText: "Funding sources and financial disclosures are declared.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 2,
                },
                {
                    questionId: "TR_003",
                    questionNumber: 15,
                    questionText: "Data Availability Statement is included.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 3,
                },
                {
                    questionId: "TR_004",
                    questionNumber: 16,
                    questionText: "Statistical analysis methods are appropriately described.",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 4,
                },
                {
                    questionId: "TR_005",
                    questionNumber: 17,
                    questionText: "The manuscript adheres to JAIRAM formatting and reporting guidelines (CONSORT/STROBE/PRISMA where applicable).",
                    required: true,
                    responseType: "YES_NO_NA",
                    order: 5,
                },
            ],
        },
        
        {
            categoryId: "COPE_PUBLICATION_ETHICS_COMPLIANCE_CERTIFICATION",
            categoryName: "COPE PUBLICATION ETHICS COMPLIANCE CERTIFICATION",
            icon: "check-circle",
            color: "#FFF9C4",
            order: 4,
            description: "Separate certification checkbox shown at end of checklist",
            isSeparateCertification: true,
            questions: [
                {
                    questionId: "COPE_001",
                    questionNumber: null,
                    questionText: "I confirm full compliance with COPE standards.",
                    required: true,
                    responseType: "CHECKBOX",
                    order: 1,
                    helpText: "Committee on Publication Ethics (COPE) provides guidance on publication ethics.",
                },
            ],
        },
    ],
};

export const CURRENT_CHECKLIST = CHECKLIST_V1_0_0;

export const getAllChecklistQuestions = (checklist = CURRENT_CHECKLIST) => {
    return checklist.categories.flatMap(category =>
        category.questions.map(question => ({
            ...question,
            categoryId: category.categoryId,
            categoryName: category.categoryName,
        }))
    );
};

export const getChecklistByCategory = (checklist = CURRENT_CHECKLIST) => {
    return checklist.categories.filter(cat => !cat.isSeparateCertification);
};

export const getCOPECertification = (checklist = CURRENT_CHECKLIST) => {
    return checklist.categories.find(cat => cat.isSeparateCertification);
};

export const validateChecklistResponses = (responses, copeCompliance, checklist = CURRENT_CHECKLIST) => {
    const allQuestions = getAllChecklistQuestions(checklist);
    const requiredQuestions = allQuestions.filter(q => 
        q.required && q.responseType !== "CHECKBOX"
    );
    
    const missingQuestions = requiredQuestions.filter(q => {
        const response = responses.find(r => r.questionId === q.questionId);
        return !response || !response.response;
    });
    
    if (missingQuestions.length > 0) {
        return {
            isValid: false,
            missingQuestions: missingQuestions.map(q => ({
                questionId: q.questionId,
                questionText: q.questionText,
            })),
            error: "Please answer all required checklist questions",
        };
    }
    
    if (!copeCompliance) {
        return {
            isValid: false,
            missingQuestions: [],
            error: "COPE compliance certification is required",
        };
    }
    
    return {
        isValid: true,
        missingQuestions: [],
    };
};

export const getCompletionStatus = (responses, checklist = CURRENT_CHECKLIST) => {
    return checklist.categories.map(category => {
        const categoryQuestions = category.questions;
        const answeredQuestions = categoryQuestions.filter(q => {
            const response = responses.find(r => r.questionId === q.questionId);
            return response && response.response;
        });
        
        return {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            total: categoryQuestions.length,
            answered: answeredQuestions.length,
            isComplete: answeredQuestions.length === categoryQuestions.length,
        };
    });
};

export const getChecklistProgress = (responses, checklist = CURRENT_CHECKLIST) => {
    const allQuestions = getAllChecklistQuestions(checklist).filter(
        q => q.responseType !== "CHECKBOX"
    );
    
    const answeredQuestions = allQuestions.filter(q => {
        const response = responses.find(r => r.questionId === q.questionId);
        return response && response.response;
    });
    
    return {
        total: allQuestions.length,
        answered: answeredQuestions.length,
        percentage: Math.round((answeredQuestions.length / allQuestions.length) * 100),
    };
};