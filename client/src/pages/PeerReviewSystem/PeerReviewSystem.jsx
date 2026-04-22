import React, { useState, useRef } from "react";

// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────
const BLUE = {
  bg: "#E6F1FB",
  border: "#85B7EB",
  text: "#0C447C",
  dot: "#378ADD",
};
const GREEN = {
  bg: "#EAF3DE",
  border: "#97C459",
  text: "#27500A",
  dot: "#639922",
};
const AMBER = {
  bg: "#FAEEDA",
  border: "#EF9F27",
  text: "#633806",
  dot: "#BA7517",
};
const RED = {
  bg: "#FCEBEB",
  border: "#F09595",
  text: "#791F1F",
  dot: "#E24B4A",
};
const GRAY = {
  bg: "#F1EFE8",
  border: "#B4B2A9",
  text: "#444441",
  dot: "#888780",
};
const PURPLE = {
  bg: "#EEEDFE",
  border: "#AFA9EC",
  text: "#3C3489",
  dot: "#7F77DD",
};
const TEAL = {
  bg: "#E1F5EE",
  border: "#5DCAA5",
  text: "#085041",
  dot: "#1D9E75",
};

// ─── SHARED PRIMITIVES ───────────────────────────────────────────────────────
const Strong = ({ children }) => (
  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
    {children}
  </span>
);

const Pill = ({ label, scheme }) => (
  <span
    style={{
      display: "inline-block",
      background: scheme.bg,
      color: scheme.text,
      border: `0.5px solid ${scheme.border}`,
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      padding: "2px 10px",
      lineHeight: 1.6,
    }}
  >
    {label}
  </span>
);

const BulletItem = ({ children, sub = false }) => (
  <li
    style={{
      display: "flex",
      gap: 9,
      fontSize: 13,
      color: "var(--color-text-secondary)",
      lineHeight: 1.7,
      marginLeft: sub ? 16 : 0,
      listStyle: "none",
      textAlign: "left",
    }}
  >
    <span
      style={{
        marginTop: 8,
        width: sub ? 4 : 5,
        height: sub ? 4 : 5,
        borderRadius: "50%",
        flexShrink: 0,
        background: sub ? "var(--color-text-tertiary)" : BLUE.dot,
      }}
    />
    <span style={{ flex: 1 }}>{children}</span>
  </li>
);

const BulletList = ({ items, sub = false }) => (
  <ul
    style={{
      padding: 0,
      margin: "8px 0 0",
      display: "flex",
      flexDirection: "column",
      gap: sub ? 5 : 7,
    }}
  >
    {items.map((item, i) => (
      <BulletItem key={i} sub={sub}>
        {item}
      </BulletItem>
    ))}
  </ul>
);

const SubHead = ({ children }) => (
  <p
    style={{
      fontSize: 11,
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--color-text-tertiary)",
      margin: "14px 0 6px",
      textAlign: "left",
    }}
  >
    {children}
  </p>
);

const Callout = ({ children, scheme = GRAY }) => (
  <div
    style={{
      background: scheme.bg,
      border: `0.5px solid ${scheme.border}`,
      borderRadius: 8,
      padding: "11px 14px",
      fontSize: 13,
      color: scheme.text,
      lineHeight: 1.7,
      margin: "10px 0",
      textAlign: "left",
    }}
  >
    {children}
  </div>
);

const Rule = () => (
  <div
    style={{
      height: "0.5px",
      background: "var(--color-border-tertiary)",
      margin: "12px 0",
    }}
  />
);

const ExternalLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#185FA5", fontWeight: 500, textDecoration: "none" }}
    onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
    onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
  >
    {children}
  </a>
);

const Para = ({ children, mt = 0 }) => (
  <p
    style={{
      fontSize: 13,
      color: "var(--color-text-secondary)",
      lineHeight: 1.75,
      margin: `${mt}px 0 8px`,
      textAlign: "left",
    }}
  >
    {children}
  </p>
);

const DecisionTags = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
    <Pill label="Accept" scheme={GREEN} />
    <Pill label="Minor revision" scheme={BLUE} />
    <Pill label="Major revision" scheme={AMBER} />
    <Pill label="Reject" scheme={RED} />
  </div>
);

// ─── NUMBERED STEP LIST (for workflow & evaluation) ───────────────────────────
const StepList = ({ items }) => (
  <div>
    {items.map(({ n, scheme = BLUE, title, text }, i) => {
      const isLast = i === items.length - 1;
      return (
        <div key={n} style={{ display: "flex", gap: 12, textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 26,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: scheme.bg,
                color: scheme.text,
                border: `0.5px solid ${scheme.border}`,
                fontSize: 11,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {n}
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  width: "1px",
                  background: "var(--color-border-tertiary)",
                  margin: "3px 0",
                  minHeight: 12,
                }}
              />
            )}
          </div>
          <div
            style={{
              paddingBottom: isLast ? 0 : 14,
              paddingTop: 3,
              flex: 1,
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            <Strong>{title}: </Strong>
            {text}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── NODES ────────────────────────────────────────────────────────────────────
const NODES = [
  {
    id: "peer-review",
    label: "Peer review",
    scheme: BLUE,
    tag: "Overview",
    content: () => (
      <>
        <Para>
          Peer review is the critical evaluation of a scholarly work by
          independent experts in the same field. It is the system used to assess
          the quality, validity, and significance of a manuscript before it is
          published — helping editors determine whether a manuscript is suitable
          for publication.
        </Para>
        <SubHead>How does it work?</SubHead>
        <BulletList
          items={[
            "When a manuscript is submitted, it first undergoes an initial assessment by the editorial team to ensure it meets the journal's submission criteria and scope.",
            "If it meets these requirements, the manuscript is sent for peer review.",
            "The editorial team assigns the manuscript to potential reviewers who are experts in the relevant field.",
            "These reviewers provide detailed feedback, including recommendations for modifications.",
          ]}
        />
        <SubHead>Double-blind peer review</SubHead>
        <Callout scheme={BLUE}>
          <Strong>Anonymity is preserved on both sides.</Strong> The identities
          of both the author and the reviewers are concealed from each other
          throughout the process. This ensures that research is evaluated based
          on its content and merit rather than the reputation or background of
          the authors.
        </Callout>
      </>
    ),
  },
  {
    id: "guidelines",
    label: "Guidelines for reviewers",
    scheme: AMBER,
    tag: "Before you accept",
    content: () => (
      <>
        <Para>
          When you are invited to review a manuscript, please consider the
          following points:
        </Para>
        <BulletList
          items={[
            <span>
              <Strong>Expertise: </Strong>Does the manuscript align with your
              area of expertise? Review the abstract to determine if you are
              competent to provide a thorough assessment. Only accept if you
              have the necessary expertise.
            </span>,
            <span>
              <Strong>Time commitment: </Strong>Reviewing a manuscript is
              time-consuming — typically 4–6 hours for a thorough evaluation.
              Consider whether you can meet the deadline. If unable, inform the
              editor immediately and suggest an alternative reviewer if
              possible.
            </span>,
            <span>
              <Strong>Conflicts of interest: </Strong>Are there personal,
              professional, or financial interests that could influence your
              judgment? A conflict of interest does not necessarily disqualify
              you, but you must disclose it fully to the editor.
            </span>,
          ]}
        />
      </>
    ),
  },
  {
    id: "checklist",
    label: "Peer review checklist",
    scheme: TEAL,
    tag: "Before you submit",
    content: () => (
      <>
        <Para>
          Assess whether the manuscript falls within the scope of the journal
          and offers a novel contribution to the field.
        </Para>
        <BulletList
          items={[
            "Evaluate the scientific quality, including clarity of objectives, appropriateness of methodology, and validity of results.",
            "Determine whether the data are clearly presented, properly analyzed, and logically interpreted.",
            "Confirm that the conclusions are supported by the evidence provided.",
            "Identify any concerns related to ethical standards, including plagiarism, data integrity, and proper citation practices.",
            "Verify that conflicts of interest and funding sources are appropriately disclosed.",
            "Review the manuscript for clarity, coherence, and professional language, noting any areas requiring improvement.",
            "Maintain strict confidentiality and do not share or use the manuscript content outside the review process.",
            "Declare any conflicts of interest before proceeding with the review.",
            "Provide feedback that is objective, constructive, and aligned with COPE and ICMJE guidelines.",
          ]}
        />
      </>
    ),
  },
  {
    id: "evaluation",
    label: "Detailed manuscript evaluation",
    scheme: PURPLE,
    tag: "Section by section",
    content: () => (
      <>
        <Para>
          Evaluate each section of the manuscript against these criteria:
        </Para>
        <StepList
          items={[
            {
              n: 1,
              scheme: PURPLE,
              title: "Manuscript structure",
              text: "Are all key elements present: Abstract, Introduction, Materials and Methods, Results, Discussion, and References?",
            },
            {
              n: 2,
              scheme: PURPLE,
              title: "Title",
              text: "Does it clearly describe the manuscript?",
            },
            {
              n: 3,
              scheme: PURPLE,
              title: "Abstract",
              text: "Does it reflect the content of the manuscript?",
            },
            {
              n: 4,
              scheme: PURPLE,
              title: "Introduction",
              text: "Does it clearly state the problem being investigated and the study's objective? It should summarize relevant research to provide context.",
            },
            {
              n: 5,
              scheme: PURPLE,
              title: "Material and methods",
              text: "Does the author explain how the data was collected with enough detail for the research to be replicated? Is the study design suitable for answering the research question?",
            },
            {
              n: 6,
              scheme: PURPLE,
              title: "Results",
              text: "Are the findings presented clearly and in a logical sequence? Has the appropriate statistical analysis been conducted? This section should be free of interpretation.",
            },
            {
              n: 7,
              scheme: PURPLE,
              title: "Discussion and conclusion",
              text: "Are the claims supported by the results? Do the authors explain how the results relate to previous research? Does the conclusion clarify how the research advances scientific knowledge?",
            },
          ]}
        />
      </>
    ),
  },
  {
    id: "specific-aspects",
    label: "Reviewing specific aspects",
    scheme: GRAY,
    tag: "Language, ethics, refs",
    content: () => (
      <>
        <BulletList
          items={[
            <span>
              <Strong>Language: </Strong>It is not the reviewer's job to
              copyedit a manuscript for language. If a paper is poorly written
              to the extent that it is difficult to understand, bring this to
              the editor's attention. You may suggest a "Minor Revision" for the
              author to address language issues.
            </span>,
            <span>
              <Strong>Previous research: </Strong>Does the article appropriately
              reference the previous research it builds upon? Are there any
              important works that have been omitted? Are the citations
              accurate?
            </span>,
            <span>
              <Strong>Ethical issues:</Strong>
            </span>,
          ]}
        />
        <BulletList
          sub
          items={[
            "Plagiarism: If you suspect that a manuscript is a substantial copy of another work, please notify the editor in detail.",
            "Fraud: If you have serious concerns about the authenticity of the results, discuss them confidentially with the editor.",
            "Other ethical concerns: For medical research, ensure patient confidentiality. Any violation of accepted norms should be reported to the editor.",
          ]}
        />
        <BulletList
          items={[
            <span>
              <Strong>Prioritizing scientific content: </Strong>Focus on
              scientific merit over minor copyediting issues. Reviewers are not
              expected to correct minor spelling or grammatical mistakes — these
              will be addressed during the copyediting phase.
            </span>,
            <span>
              <Strong>Reference formatting: </Strong>Focus on the content and
              accuracy of references rather than specific formatting or style.
              The reference list will be formatted to the journal's style during
              production.
            </span>,
          ]}
        />
      </>
    ),
  },
  {
    id: "conducting",
    label: "Conducting the review",
    scheme: GRAY,
    tag: "Confidentiality",
    content: () => (
      <BulletList
        items={[
          "Your review must be conducted confidentially.",
          "The manuscript you have been asked to review should not be disclosed to any third party.",
          "You should not attempt to contact the author directly.",
          "Please be aware that your recommendations will contribute significantly to the final decision made by the editor.",
        ]}
      />
    ),
  },
  {
    id: "originality",
    label: "Originality and significance",
    scheme: GREEN,
    tag: "Novel contribution",
    content: () => (
      <>
        <BulletList
          items={[
            "Assess whether the work presents a novel contribution to the field.",
            "Evaluate whether the findings are significant enough to merit publication.",
            "Consider whether the research advances the current state of knowledge in a meaningful way.",
            "Determine if the conclusions are supported by the evidence presented.",
            "Is the manuscript sufficiently novel and interesting to warrant publication? Does it add to the body of knowledge?",
          ]}
        />
        <Para mt={12}>
          To determine originality, you may wish to conduct a literature search
          using <Strong>PubMed</Strong>, <Strong>Scopus</Strong>, or the{" "}
          <ExternalLink href="https://www.cochranelibrary.com/">
            Cochrane Library
          </ExternalLink>
          .
        </Para>
      </>
    ),
  },
  {
    id: "ethics",
    label: "Ethical guidelines for peer reviewers",
    scheme: RED,
    tag: "COPE standards",
    content: () => (
      <>
        <BulletList
          items={[
            "Reviewers must maintain confidentiality throughout the review process.",
            "Avoid conflicts of interest that could influence your assessment.",
            "Provide unbiased evaluations based solely on the scientific merit of the work.",
            "Adhere to the journal's ethical standards at all times.",
            "Do not use unpublished information from a reviewed manuscript for personal advantage.",
          ]}
        />
        <Callout scheme={RED}>
          The journal follows the ethical guidelines published by the{" "}
          <ExternalLink href="https://publicationethics.org/">
            Committee on Publication Ethics (COPE)
          </ExternalLink>
          {" — "}
          <ExternalLink href="https://publicationethics.org/guidance/guideline/ethical-guidelines-peer-reviewers">
            Ethical Guidelines for Peer Reviewers
          </ExternalLink>
          . We are committed to ensuring that peer review is fair, unbiased, and
          timely.
        </Callout>
      </>
    ),
  },
  {
    id: "join",
    label: "Join as a reviewer",
    scheme: TEAL,
    tag: "Open invitation",
    content: () => (
      <Para>
        Serving as a reviewer is essential to the publication process and an
        excellent way to contribute to the scientific community. We cordially
        invite you to join our team. You can register via the{" "}
        <Strong>
          JAIRAM (Journal of Advanced &amp; Integrated Research In Acute
          Medicine)
        </Strong>{" "}
        portal. New users must register and verify their email before completing
        their reviewer profile.
      </Para>
    ),
  },
  {
    id: "submit-report",
    label: "Submitting your report",
    scheme: BLUE,
    tag: "Via JAIRAM portal",
    content: () => (
      <>
        <Para>
          Once you have completed your evaluation, please write and submit your
          report through the <Strong>JAIRAM portal</Strong>. The portal will
          have separate fields for "Comments to the Editor" and "Comments to the
          Author."
        </Para>
        <SubHead>Comments to the editor</SubHead>
        <Para>
          Provide a brief summary of the manuscript and your overall assessment.
          This is also where you should raise any confidential concerns (e.g.,
          suspected plagiarism or fraud) — this is not visible to the author.
        </Para>
        <SubHead>Comments to the author</SubHead>
        <Para>
          Your comments should be courteous, constructive, and free of personal
          remarks. Explain and support your judgments so the author can
          understand the basis for your feedback. Clearly indicate any
          deficiencies and suggest how the manuscript could be improved.
        </Para>
        <SubHead>Recommendation</SubHead>
        <Para>
          When making a recommendation, use one of the following categories:
        </Para>
        <DecisionTags />
        <Para mt={10}>
          If you recommend revisions, clearly identify what changes are required
          and indicate whether you would be willing to review the revised
          manuscript.
        </Para>
      </>
    ),
  },
  {
    id: "ai-guidelines",
    label: "AI guidelines",
    scheme: PURPLE,
    tag: "Transparency required",
    content: () => (
      <>
        <BulletList
          items={[
            "Peer reviewers play a crucial role in maintaining the quality and credibility of research.",
            "The use of AI tools in peer review must be approached with transparency and care.",
            "Any use of AI assistance during the review process must be disclosed to the editor.",
            "AI tools must not be used to process or store confidential manuscript content.",
            "JAIRAM follows AI usage guidelines in accordance with COPE, ICMJE, and WAME recommendations.",
          ]}
        />
        <Para mt={12}>
          <ExternalLink href="https://www.icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html">
            Read the full ICMJE AI guidelines →
          </ExternalLink>
          {"  "}
          <ExternalLink href="https://publicationethics.org/guidance/cope-position/authorship-and-ai-tools">
            Read the full COPE AI guidelines →
          </ExternalLink>
          {"  "}
          <ExternalLink href="https://wame.org/page3.php?id=106">
            Read the full WAME AI guidelines →
          </ExternalLink>
        </Para>
      </>
    ),
  },
  {
    id: "process",
    label: "Article peer review process",
    scheme: AMBER,
    tag: "Flowchart",
    content: () => (
      <>
        <Para>
          The flowchart below illustrates the full article peer review process
          from submission to decision.
        </Para>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <img
            src="/assets/peer_review_process.png"
            alt="Article peer review process flowchart"
            style={{
              maxWidth: 520,
              width: "100%",
              height: "auto",
              borderRadius: 8,
            }}
          />
        </div>
      </>
    ),
  },
  {
    id: "workflow",
    label: "The manuscript workflow",
    scheme: GREEN,
    tag: "11 steps",
    content: () => (
      <>
        <Para>
          A step-by-step guide from initial submission to final publication and
          reviewer recognition.
        </Para>
        <StepList
          items={[
            {
              n: 1,
              scheme: GREEN,
              title: "Manuscript submission",
              text: "The corresponding author submits the manuscript via the JAIRAM portal. In rare cases, the journal may grant permission for submission by email.",
            },
            {
              n: 2,
              scheme: GRAY,
              title: "Editorial office scrutiny",
              text: "The editorial office performs an initial technical check to ensure the manuscript's composition and arrangement adhere to the journal's Author Guidelines. Scientific quality is not assessed at this stage.",
            },
            {
              n: 3,
              scheme: GRAY,
              title: "Initial evaluation by the editor",
              text: "The Editor-in-Chief or an Associate Editor evaluates the manuscript for scope, originality, and significance. If suitable, it proceeds to peer review; otherwise it may be desk-rejected or returned for revision.",
            },
            {
              n: 4,
              scheme: BLUE,
              title: "Invitation to reviewers",
              text: "The handling editor sends invitations to potential reviewers with relevant expertise. Invitations continue until the required number is secured — typically two, though this may vary.",
            },
            {
              n: 5,
              scheme: BLUE,
              title: "Reviewer response",
              text: "Potential reviewers evaluate the invitation based on expertise, availability, and conflicts of interest, then accept or decline. When declining, suggesting an alternative reviewer is encouraged.",
            },
            {
              n: 6,
              scheme: BLUE,
              title: "The review is conducted",
              text: "The reviewer reads the manuscript thoroughly to form an assessment. If major flaws are immediately apparent, rejection may be recommended without a full point-by-point review. Otherwise, a detailed report is prepared with a recommendation to Accept, Reject, or Revise.",
            },
            {
              n: 7,
              scheme: AMBER,
              title: "Editor evaluates the reviews",
              text: "The editor considers all reviewer reports before making a final decision. Widely differing reviews may prompt invitation of an additional reviewer.",
            },
            {
              n: 8,
              scheme: AMBER,
              title: "Decision is communicated",
              text: "The editor sends a decision email to the author, including the anonymous reviewer comments.",
            },
            {
              n: 9,
              scheme: AMBER,
              title: "Final outcome and next steps",
              text: "Acceptance → sent to production. Revision → authors revise; original reviewers may re-assess. Rejection → author is informed with clear justification and may receive constructive reviewer comments.",
            },
            {
              n: 10,
              scheme: GRAY,
              title: "Post-acceptance",
              text: "The manuscript enters production — copyediting, typesetting, and proofreading. A galley proof is shared with the corresponding author before the article is scheduled for publication.",
            },
            {
              n: 11,
              scheme: TEAL,
              title: "Recognition for reviewer contributions",
              text: "Reviewers receive a thank you email download a Certificate of Reviewing directly from the JAIRAM portal.",
            },
          ]}
        />
      </>
    ),
  },
];

// ─── TIMELINE NODE ────────────────────────────────────────────────────────────
const TimelineNode = ({ node, index, total, isOpen, onToggle, nodeRef }) => {
  const { label, scheme, tag, content } = node;
  const isLast = index === total - 1;

  return (
    <div ref={nodeRef} style={{ display: "flex", gap: 0, textAlign: "left" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 40,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isOpen ? scheme.dot : scheme.bg,
            border: `0.5px solid ${scheme.border}`,
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s, transform 0.15s",
            transform: isOpen ? "scale(1.08)" : "scale(1)",
            padding: 0,
          }}
          aria-label={`Toggle ${label}`}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: isOpen ? "#fff" : scheme.dot,
              opacity: isOpen ? 0.9 : 1,
              transition: "background 0.2s",
            }}
          />
        </button>
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: "1.5px",
              background: isOpen ? scheme.dot : "var(--color-border-tertiary)",
              minHeight: 24,
              transition: "background 0.3s",
            }}
          />
        )}
      </div>

      <div
        style={{
          flex: 1,
          paddingBottom: isLast ? 0 : 24,
          paddingLeft: 12,
          paddingTop: 4,
        }}
      >
        <div
          onClick={onToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginBottom: isOpen ? 14 : 0,
            userSelect: "none",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isOpen ? scheme.text : "var(--color-text-primary)",
                margin: 0,
                textAlign: "left",
                transition: "color 0.2s",
              }}
            >
              {label}
            </p>
            {!isOpen && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  margin: "2px 0 0",
                  textAlign: "left",
                }}
              >
                {tag}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {!isOpen && <Pill label={tag} scheme={scheme} />}
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-text-tertiary)"
              strokeWidth={2}
              style={{
                transition: "transform 0.22s",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div
            style={{
              background: "var(--color-background-secondary)",
              border: `0.5px solid ${scheme.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            {content()}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function PeerReviewSystem() {
  const [openId, setOpenId] = useState("peer-review");
  const nodeRefs = useRef({});

  const toggle = (id) => {
    const isOpening = openId !== id;
    setOpenId((prev) => (prev === id ? null : id));
    if (isOpening) {
      setTimeout(() => {
        nodeRefs.current[id]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 30);
    }
  };

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 1rem 4rem",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        textAlign: "left",
      }}
    >
      {/* ── Hero ── */}
      <div
        style={{
          padding: "2.5rem 0 2rem",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          marginBottom: "2.5rem",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "#E6F1FB",
            color: "#0C447C",
            border: "0.5px solid #85B7EB",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 12px",
            marginBottom: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          JAIRAM Journal
        </span>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 8,
            lineHeight: 1.25,
          }}
        >
          Peer Review System
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 500,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          Official reviewer guide — covering the review process, ethical
          standards, manuscript workflow, and report submission. Click any
          section to expand.
        </p>
      </div>

      {/* ── Summary stats ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: "2.5rem",
          justifyContent: "center",
        }}
      >
        {[
          { label: "Sections", value: "13", scheme: BLUE },
          { label: "Review type", value: "Double-blind", scheme: PURPLE },
          { label: "First decision", value: "1–7 days", scheme: GREEN },
          { label: "Full review", value: "8–12 weeks", scheme: AMBER },
        ].map(({ label, value, scheme }) => (
          <div
            key={label}
            style={{
              background: scheme.bg,
              border: `0.5px solid ${scheme.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              minWidth: 110,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: scheme.text,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 3px",
                opacity: 0.8,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: scheme.text,
                margin: 0,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div>
        {NODES.map((node, i) => (
          <TimelineNode
            key={node.id}
            node={node}
            index={i}
            total={NODES.length}
            isOpen={openId === node.id}
            onToggle={() => toggle(node.id)}
            nodeRef={(el) => (nodeRefs.current[node.id] = el)}
          />
        ))}
      </div>
    </div>
  );
}
