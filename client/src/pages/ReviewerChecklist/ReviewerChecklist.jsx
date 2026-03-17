import React, { useState } from "react";


// ─── Reusable Components ────────────────────────────────────────────────────

// Radio group component for rating criteria
const RatingRadioGroup = ({ criteria, value, onChange, options }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="p-4 text-sm text-gray-700 font-medium text-left">
      {criteria}
    </td>
    {options.map((option) => (
      <td key={option} className="p-4 text-center">
        <input
          type="radio"
          name={`rating-${criteria}`}
          value={option}
          checked={value === option}
          onChange={() => onChange(option)}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
      </td>
    ))}
  </tr>
);

// Checkbox component for declarations
const CheckboxItem = ({ label, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer shrink-0"
    />
    <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
  </label>
);

// Section card wrapper
const SectionCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
  >
    <div className="bg-linear-to-r from-gray-700 to-gray-800 px-6 py-4 text-left">
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Subsection header
const SubsectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
    <span className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
      {number}
    </span>
    <h3 className="text-base font-semibold text-gray-800 text-left">{title}</h3>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const PeerReviewChecklist = () => {
  // ── Section I: Reviewer Declaration ──
  const [declaration, setDeclaration] = useState({
    noConflict: false,
    confidentiality: false,
    expertise: false,
    compliance: false,
  });

  // ── Section II: Scientific Merit & Quality Assessment ──
  const [scopeRatings, setScopeRatings] = useState({
    relevance: "",
    novelty: "",
    significance: "",
  });

  const [methodologyRatings, setMethodologyRatings] = useState({
    objectives: "",
    studyDesign: "",
    ethicalApproval: "",
    statisticalAnalysis: "",
  });

  const [resultsRatings, setResultsRatings] = useState({
    dataClarity: "",
    tablesAccurate: "",
    discussionLogical: "",
    conclusionsSupported: "",
  });

  // ── Section III: Publication Ethics & Compliance ──
  const [ethicsCompliance, setEthicsCompliance] = useState({
    dataFabrication: "",
    citation: "",
    coiFunding: "",
  });

  // ── Section IV: Language & Presentation ──
  const [language, setLanguage] = useState({
    clearProfessional: false,
    minorEditing: false,
    majorRevision: false,
  });

  // ── Section V: Reviewer Recommendation ──
  const [recommendation, setRecommendation] = useState("");

  // ── Section VI: Reviewer Comments ──
  const [comments, setComments] = useState({
    authorComments: "",
    editorComments: "",
  });

  // ── Progress tracking ──
  const totalFields =
    Object.keys(declaration).length +
    Object.keys(scopeRatings).length +
    Object.keys(methodologyRatings).length +
    Object.keys(resultsRatings).length +
    Object.keys(ethicsCompliance).length +
    3; // language options

  const completedFields =
    Object.values(declaration).filter(Boolean).length +
    Object.values(scopeRatings).filter(Boolean).length +
    Object.values(methodologyRatings).filter(Boolean).length +
    Object.values(resultsRatings).filter(Boolean).length +
    Object.values(ethicsCompliance).filter(Boolean).length +
    Object.values(language).filter(Boolean).length;

  const progress = (completedFields / totalFields) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-1">
              JAIRAM
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Official Peer Review Evaluation Checklist
            </h1>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
              Completion
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
              {completedFields} / {totalFields}
            </span>
          </div>
        </div>

        {/* ── SECTION I: Reviewer Declaration ────────────────────────────── */}
        <SectionCard title="I. Reviewer Declaration">
          <p className="text-sm text-gray-600 mb-4 text-left">
            Please confirm:
          </p>
          <div className="space-y-2">
            <CheckboxItem
              label="I have no conflict of interest."
              checked={declaration.noConflict}
              onChange={(val) =>
                setDeclaration({ ...declaration, noConflict: val })
              }
            />
            <CheckboxItem
              label="I will maintain strict confidentiality."
              checked={declaration.confidentiality}
              onChange={(val) =>
                setDeclaration({ ...declaration, confidentiality: val })
              }
            />
            <CheckboxItem
              label="I possess appropriate subject expertise."
              checked={declaration.expertise}
              onChange={(val) =>
                setDeclaration({ ...declaration, expertise: val })
              }
            />
            <CheckboxItem
              label="This review is objective, constructive, and compliant with COPE & ICMJE standards."
              checked={declaration.compliance}
              onChange={(val) =>
                setDeclaration({ ...declaration, compliance: val })
              }
            />
          </div>
        </SectionCard>

        {/* ── SECTION II: Scientific Merit & Quality Assessment ─────────── */}
        <SectionCard title="II. Scientific Merit & Quality Assessment">
          {/* 1. Scope & Originality */}
          <SubsectionHeader number="1" title="Scope & Originality" />
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Criteria
                  </th>
                  {["Excellent", "Good", "Fair", "Poor"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRadioGroup
                  criteria="Relevance to JAIRAM scope"
                  value={scopeRatings.relevance}
                  onChange={(val) =>
                    setScopeRatings({ ...scopeRatings, relevance: val })
                  }
                  options={["Excellent", "Good", "Fair", "Poor"]}
                />
                <RatingRadioGroup
                  criteria="Novelty / Contribution"
                  value={scopeRatings.novelty}
                  onChange={(val) =>
                    setScopeRatings({ ...scopeRatings, novelty: val })
                  }
                  options={["Excellent", "Good", "Fair", "Poor"]}
                />
                <RatingRadioGroup
                  criteria="Scientific significance"
                  value={scopeRatings.significance}
                  onChange={(val) =>
                    setScopeRatings({ ...scopeRatings, significance: val })
                  }
                  options={["Excellent", "Good", "Fair", "Poor"]}
                />
              </tbody>
            </table>
          </div>

          {/* 2. Methodological Rigor */}
          <SubsectionHeader number="2" title="Methodological Rigor" />
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Criteria
                  </th>
                  {["Adequate", "Needs Revision", "Inadequate"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRadioGroup
                  criteria="Clear objectives & background"
                  value={methodologyRatings.objectives}
                  onChange={(val) =>
                    setMethodologyRatings({
                      ...methodologyRatings,
                      objectives: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Study design & methodology appropriate"
                  value={methodologyRatings.studyDesign}
                  onChange={(val) =>
                    setMethodologyRatings({
                      ...methodologyRatings,
                      studyDesign: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Ethical approval / Consent documented"
                  value={methodologyRatings.ethicalApproval}
                  onChange={(val) =>
                    setMethodologyRatings({
                      ...methodologyRatings,
                      ethicalApproval: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Statistical analysis appropriate"
                  value={methodologyRatings.statisticalAnalysis}
                  onChange={(val) =>
                    setMethodologyRatings({
                      ...methodologyRatings,
                      statisticalAnalysis: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
              </tbody>
            </table>
          </div>

          {/* 3. Results & Interpretation */}
          <SubsectionHeader number="3" title="Results & Interpretation" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Criteria
                  </th>
                  {["Adequate", "Needs Revision", "Inadequate"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRadioGroup
                  criteria="Data clarity & organization"
                  value={resultsRatings.dataClarity}
                  onChange={(val) =>
                    setResultsRatings({ ...resultsRatings, dataClarity: val })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Tables/Figures accurate & relevant"
                  value={resultsRatings.tablesAccurate}
                  onChange={(val) =>
                    setResultsRatings({
                      ...resultsRatings,
                      tablesAccurate: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Discussion logical & evidence-based"
                  value={resultsRatings.discussionLogical}
                  onChange={(val) =>
                    setResultsRatings({
                      ...resultsRatings,
                      discussionLogical: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
                <RatingRadioGroup
                  criteria="Conclusions supported by data"
                  value={resultsRatings.conclusionsSupported}
                  onChange={(val) =>
                    setResultsRatings({
                      ...resultsRatings,
                      conclusionsSupported: val,
                    })
                  }
                  options={["Adequate", "Needs Revision", "Inadequate"]}
                />
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── SECTION III: Publication Ethics & Compliance ──────────────── */}
        <SectionCard title="III. Publication Ethics & Compliance">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  {["Yes", "No", "Concern"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRadioGroup
                  criteria="Data fabrication/manipulation concerns"
                  value={ethicsCompliance.dataFabrication}
                  onChange={(val) =>
                    setEthicsCompliance({
                      ...ethicsCompliance,
                      dataFabrication: val,
                    })
                  }
                  options={["Yes", "No", "Concern"]}
                />
                <RatingRadioGroup
                  criteria="Proper citation & referencing"
                  value={ethicsCompliance.citation}
                  onChange={(val) =>
                    setEthicsCompliance({ ...ethicsCompliance, citation: val })
                  }
                  options={["Yes", "No", "Concern"]}
                />
                <RatingRadioGroup
                  criteria="COI & Funding disclosure provided"
                  value={ethicsCompliance.coiFunding}
                  onChange={(val) =>
                    setEthicsCompliance({
                      ...ethicsCompliance,
                      coiFunding: val,
                    })
                  }
                  options={["Yes", "No", "Concern"]}
                />
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── SECTION IV: Language & Presentation ───────────────────────── */}
        <SectionCard title="IV. Language & Presentation">
          <div className="space-y-2">
            <CheckboxItem
              label="Clear and professional language"
              checked={language.clearProfessional}
              onChange={(val) =>
                setLanguage({ ...language, clearProfessional: val })
              }
            />
            <CheckboxItem
              label="Requires minor language editing"
              checked={language.minorEditing}
              onChange={(val) =>
                setLanguage({ ...language, minorEditing: val })
              }
            />
            <CheckboxItem
              label="Requires major language revision"
              checked={language.majorRevision}
              onChange={(val) =>
                setLanguage({ ...language, majorRevision: val })
              }
            />
          </div>
        </SectionCard>

        {/* ── SECTION VI: Reviewer Comments ───────────────────────── */}
        <SectionCard title="V. Reviewer Comments">
          <div className="space-y-6">
            {/* Comments for Author */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                Comments for Author
              </label>

              <textarea
                rows="5"
                value={comments.authorComments}
                onChange={(e) =>
                  setComments({ ...comments, authorComments: e.target.value })
                }
                placeholder="Provide constructive feedback for the author..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Comments for Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                Confidential Letter for Editor
              </label>

              <textarea
                rows="5"
                value={comments.editorComments}
                onChange={(e) =>
                  setComments({ ...comments, editorComments: e.target.value })
                }
                placeholder="Private comments visible only to the editor..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION V: Reviewer Recommendation ───────────────────────── */}
        <SectionCard title="VI. Reviewer Recommendation">
          <div className="space-y-3">
            {["Accept", "Minor Revision", "Major Revision", "Reject"].map(
              (option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={option}
                    checked={recommendation === option}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ),
            )}
          </div>
        </SectionCard>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pb-8">
         
          <button
            type="submit"
            disabled={progress < 100}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};
export default PeerReviewChecklist;
