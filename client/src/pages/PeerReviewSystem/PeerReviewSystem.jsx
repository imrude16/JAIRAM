import React, { useState, useEffect, useRef } from "react";

const sections = [
  { id: "peer-review", label: "Peer review" },
  { id: "guidelines", label: "Guidelines" },
  { id: "checklist", label: "Checklist" },
  { id: "evaluation", label: "Evaluation" },
  { id: "specific-aspects", label: "Aspects" },
  { id: "conducting", label: "Conducting" },
  { id: "originality", label: "Originality" },
  { id: "ethics", label: "Ethics" },
  { id: "join", label: "Join" },
  { id: "submit-report", label: "Submit report" },
  { id: "ai-guidelines", label: "AI guidelines" },
  { id: "process", label: "Process" },
  { id: "workflow", label: "Workflow" },
];

const s = {
  page: {
    width: "100%",
    maxWidth: 1100, // 👈 increase width
    margin: "0 auto",
    padding: "0 20px 4rem",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    textAlign: "left",
  },
  hero: {
    padding: "2.5rem 0 2rem",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    marginBottom: "2rem",
    textAlign: "center",
  },
  heroBadge: {
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
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    marginBottom: 8,
    lineHeight: 1.25,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
    lineHeight: 1.7,
    maxWidth: 560,
    margin: "0 auto",
    textAlign: "center",
  },
  tocBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "var(--color-background-primary)",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    padding: "10px 0",
    marginBottom: "2.5rem",
    overflowX: "auto",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },
  tocInner: {
    display: "flex",
    gap: 6,
    minWidth: "max-content",
  },
  tocItem: (active) => ({
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    padding: "4px 12px",
    borderRadius: 20,
    border: "0.5px solid",
    borderColor: active ? "#85B7EB" : "var(--color-border-tertiary)",
    background: active ? "#E6F1FB" : "transparent",
    color: active ? "#0C447C" : "var(--color-text-secondary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    textAlign: "left",
  }),
  section: {
    marginBottom: "3rem",
    scrollMarginTop: 60,
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    marginBottom: "1rem",
    paddingLeft: 12,
    borderLeft: "2.5px solid #378ADD",
    borderRadius: 0,
    textAlign: "left",
  },
  subTitle: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginTop: "1.25rem",
    marginBottom: "0.5rem",
    color: "var(--color-text-tertiary)",
    textAlign: "left",
  },
  rule: {
    height: "0.5px",
    background: "var(--color-border-tertiary)",
    margin: "2rem 0",
  },
  para: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
    lineHeight: 1.75,
    marginBottom: "0.75rem",
    textAlign: "left",
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    textAlign: "left",
  },
  bulletItem: {
    display: "flex",
    gap: 10,
    fontSize: 14,
    color: "var(--color-text-secondary)",
    lineHeight: 1.7,
    textAlign: "left",
  },
  bulletDot: {
    marginTop: 9,
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#378ADD",
    flexShrink: 0,
  },
  subDot: {
    marginTop: 9,
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "var(--color-border-primary, #9ca3af)",
    flexShrink: 0,
  },
  strong: {
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  stepList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  stepRow: {
    display: "flex",
    gap: 14,
    textAlign: "left",
  },
  stepSpine: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 28,
    flexShrink: 0,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#E6F1FB",
    color: "#0C447C",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepConnector: {
    flex: 1,
    width: "1px",
    background: "var(--color-border-tertiary)",
    margin: "4px 0",
    minHeight: 16,
  },
  stepBody: {
    paddingBottom: 20,
    paddingTop: 4,
    flex: 1,
    fontSize: 14,
    color: "var(--color-text-secondary)",
    lineHeight: 1.7,
    textAlign: "left",
  },
  callout: {
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 14,
    color: "var(--color-text-secondary)",
    lineHeight: 1.7,
    marginTop: 12,
    textAlign: "left",
  },
  decisionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    justifyContent: "flex-start",
  },
  link: {
    color: "#185FA5",
    fontWeight: 500,
    textDecoration: "none",
  },
};

const Bullet = ({ children, sub = false }) => (
  <li style={s.bulletItem}>
    <span style={sub ? s.subDot : s.bulletDot} />
    <span style={{ textAlign: "left", flex: 1 }}>{children}</span>
  </li>
);

const BulletList = ({ items, sub = false }) => (
  <ul style={{ ...s.bulletList, marginLeft: sub ? 18 : 0 }}>
    {items.map((item, i) => (
      <Bullet key={i} sub={sub}>
        {item}
      </Bullet>
    ))}
  </ul>
);

const Strong = ({ children }) => <span style={s.strong}>{children}</span>;

const Rule = () => <div style={s.rule} />;

const SubHeading = ({ children }) => <p style={s.subTitle}>{children}</p>;

const Callout = ({ children }) => <div style={s.callout}>{children}</div>;

const ExternalLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={s.link}>
    {children}
  </a>
);

const DecisionTag = ({ label, bg, color, border }) => (
  <span
    style={{
      background: bg,
      color,
      border: `0.5px solid ${border}`,
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      padding: "4px 14px",
    }}
  >
    {label}
  </span>
);

const StepItem = ({ number, title, children, last = false }) => (
  <li style={s.stepRow}>
    <div style={s.stepSpine}>
      <div style={s.stepNum}>{number}</div>
      {!last && <div style={s.stepConnector} />}
    </div>
    <div style={s.stepBody}>
      <Strong>{title}: </Strong>
      {children}
    </div>
  </li>
);

export default function PeerReviewSystem() {
  const [activeSection, setActiveSection] = useState("peer-review");
  const tocRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <span style={s.heroBadge}>JAIRAM Journal</span>
        <h1 style={s.heroTitle}>Peer Review System</h1>
        <p style={s.heroSub}>
          Official reviewer guide — covering the review process, ethical
          standards, manuscript workflow, and report submission.
        </p>
      </div>

      {/* Sticky TOC */}
      <div style={s.tocBar} ref={tocRef}>
        <div style={s.tocInner}>
          {sections.map(({ id, label }) => (
            <button
              key={id}
              style={s.tocItem(activeSection === id)}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 1 ── */}
      <section id="peer-review" style={s.section}>
        <h2 style={s.sectionTitle}>Peer review</h2>
        <p style={s.para}>
          Peer review is the critical evaluation of a scholarly work by
          independent experts in the same field. It is the system used to assess
          the quality, validity, and significance of a manuscript before it is
          published — helping editors determine whether a manuscript is suitable
          for publication.
        </p>

        <SubHeading>How does it work?</SubHeading>
        <BulletList
          items={[
            "When a manuscript is submitted, it first undergoes an initial assessment by the editorial team to ensure it meets the journal's submission criteria and scope.",
            "If it meets these requirements, the manuscript is sent for peer review.",
            "The editorial team assigns the manuscript to potential reviewers who are experts in the relevant field.",
            "These reviewers provide detailed feedback, including recommendations for modifications.",
          ]}
        />

        <SubHeading>Double-blind peer review</SubHeading>
        <Callout>
          <Strong>Anonymity is preserved on both sides.</Strong> The identities
          of both the author and the reviewers are concealed from each other
          throughout the process. This ensures that research is evaluated based
          on its content and merit rather than the reputation or background of
          the authors.
        </Callout>
      </section>

      <Rule />

      {/* ── Section 2 ── */}
      <section id="guidelines" style={s.section}>
        <h2 style={s.sectionTitle}>Guidelines for reviewers</h2>
        <p style={s.para}>
          When you are invited to review a manuscript, please consider the
          following points:
        </p>
        <ul style={s.bulletList}>
          <Bullet>
            <Strong>Expertise: </Strong>Does the manuscript align with your area
            of expertise? Review the abstract to determine if you are competent
            to provide a thorough assessment. Only accept if you have the
            necessary expertise.
          </Bullet>
          <Bullet>
            <Strong>Time commitment: </Strong>Reviewing a manuscript is
            time-consuming — typically 4–6 hours for a thorough evaluation.
            Consider whether you can meet the deadline. If unable, inform the
            editor immediately and suggest an alternative reviewer if possible.
          </Bullet>
          <Bullet>
            <Strong>Conflicts of interest: </Strong>Are there personal,
            professional, or financial interests that could influence your
            judgment? A conflict of interest does not necessarily disqualify
            you, but you must disclose it fully to the editor.
          </Bullet>
        </ul>
      </section>

      <Rule />

      {/* ── Section 3 ── */}
      {/* ── Section 3 ── */}
      <section id="checklist" style={s.section}>
        <h2 style={s.sectionTitle}>Peer review checklist</h2>
        <p style={s.para}>
          Assess whether the manuscript falls within the scope of the journal
          and offers a novel contribution to the field.
        </p>
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
      </section>

      <Rule />

      {/* ── Section 4 ── */}
      <section id="evaluation" style={s.section}>
        <h2 style={s.sectionTitle}>Detailed manuscript evaluation</h2>
        <ul style={s.stepList}>
          {[
            {
              n: 1,
              title: "Manuscript structure",
              text: "Are all key elements present: Abstract, Introduction, Materials and Methods, Results, Discussion, and References?",
            },
            {
              n: 2,
              title: "Title",
              text: "Does it clearly describe the manuscript?",
            },
            {
              n: 3,
              title: "Abstract",
              text: "Does it reflect the content of the manuscript?",
            },
            {
              n: 4,
              title: "Introduction",
              text: "Does it clearly state the problem being investigated and the study's objective? It should summarize relevant research to provide context.",
            },
            {
              n: 5,
              title: "Material and methods",
              text: "Does the author explain how the data was collected with enough detail for the research to be replicated? Is the study design suitable for answering the research question?",
            },
            {
              n: 6,
              title: "Results",
              text: "Are the findings presented clearly and in a logical sequence? Has the appropriate statistical analysis been conducted? This section should be free of interpretation.",
            },
            {
              n: 7,
              title: "Discussion and conclusion",
              text: "Are the claims supported by the results? Do the authors explain how the results relate to previous research? Does the conclusion clarify how the research advances scientific knowledge?",
              last: true,
            },
          ].map(({ n, title, text, last }) => (
            <StepItem key={n} number={n} title={title} last={last}>
              {text}
            </StepItem>
          ))}
        </ul>
      </section>

      <Rule />

      {/* ── Section 5 ── */}
      <section id="specific-aspects" style={s.section}>
        <h2 style={s.sectionTitle}>Reviewing specific aspects</h2>
        <ul style={s.bulletList}>
          <Bullet>
            <Strong>Language: </Strong>It is not the reviewer's job to copyedit
            a manuscript for language. If a paper is poorly written to the
            extent that it is difficult to understand, bring this to the
            editor's attention. You may suggest a "Minor Revision" for the
            author to address language issues.
          </Bullet>
          <Bullet>
            <Strong>Previous research: </Strong>Does the article appropriately
            reference the previous research it builds upon? Are there any
            important works that have been omitted? Are the citations accurate?
          </Bullet>
          <li style={s.bulletItem}>
            <span style={s.bulletDot} />
            <span style={{ textAlign: "left", flex: 1 }}>
              <Strong>Ethical issues:</Strong>
              <BulletList
                sub
                items={[
                  "Plagiarism: If you suspect that a manuscript is a substantial copy of another work, please notify the editor in detail.",
                  "Fraud: If you have serious concerns about the authenticity of the results, discuss them confidentially with the editor.",
                  "Other ethical concerns: For medical research, ensure patient confidentiality. Any violation of accepted norms should be reported to the editor.",
                ]}
              />
            </span>
          </li>
          <Bullet>
            <Strong>Prioritizing scientific content: </Strong>Focus on
            scientific merit over minor copyediting issues. Reviewers are not
            expected to correct minor spelling or grammatical mistakes — these
            will be addressed during the copyediting phase.
          </Bullet>
          <Bullet>
            <Strong>Reference formatting: </Strong>Focus on the content and
            accuracy of references rather than specific formatting or style. The
            reference list will be formatted to the journal's style during
            production.
          </Bullet>
        </ul>
      </section>

      <Rule />

      {/* ── Section 6 ── */}
      <section id="conducting" style={s.section}>
        <h2 style={s.sectionTitle}>Conducting the review</h2>
        <BulletList
          items={[
            "Your review must be conducted confidentially.",
            "The manuscript you have been asked to review should not be disclosed to any third party.",
            "You should not attempt to contact the author directly.",
            "Please be aware that your recommendations will contribute significantly to the final decision made by the editor.",
          ]}
        />
      </section>

      <Rule />

      {/* ── Section 7 ── */}
      <section id="originality" style={s.section}>
        <h2 style={s.sectionTitle}>Originality and significance</h2>
        <BulletList
          items={[
            "Assess whether the work presents a novel contribution to the field.",
            "Evaluate whether the findings are significant enough to merit publication.",
            "Consider whether the research advances the current state of knowledge in a meaningful way.",
            "Determine if the conclusions are supported by the evidence presented.",
            "Is the manuscript sufficiently novel and interesting to warrant publication? Does it add to the body of knowledge?",
          ]}
        />
        <p style={{ ...s.para, marginTop: 14 }}>
          To determine originality, you may wish to conduct a literature search
          using <Strong>PubMed</Strong>, <Strong>Scopus</Strong>, or the{" "}
          <ExternalLink href="https://www.cochranelibrary.com/">
            Cochrane Library
          </ExternalLink>
          .
        </p>
      </section>

      <Rule />

      {/* ── Section 8 ── */}
      <section id="ethics" style={s.section}>
        <h2 style={s.sectionTitle}>Ethical guidelines for peer reviewers</h2>
        <BulletList
          items={[
            "Reviewers must maintain confidentiality throughout the review process.",
            "Avoid conflicts of interest that could influence your assessment.",
            "Provide unbiased evaluations based solely on the scientific merit of the work.",
            "Adhere to the journal's ethical standards at all times.",
            "Do not use unpublished information from a reviewed manuscript for personal advantage.",
          ]}
        />
        <Callout>
          The journal follows the ethical guidelines published by the{" "}
          <ExternalLink href="https://publicationethics.org/">
            Committee on Publication Ethics (COPE)
          </ExternalLink>{" "}
          —{" "}
          <ExternalLink href="https://publicationethics.org/guidance/guideline/ethical-guidelines-peer-reviewers">
            Ethical Guidelines for Peer Reviewers
          </ExternalLink>
          . We are committed to ensuring that peer review is fair, unbiased, and
          timely. The decision to accept or reject a manuscript is based on the
          manuscript's importance, originality, and clarity.
        </Callout>
      </section>

      <Rule />

      {/* ── Section 9 ── */}
      <section id="join" style={s.section}>
        <h2 style={s.sectionTitle}>Join as a reviewer</h2>
        <p style={s.para}>
          Serving as a reviewer is essential to the publication process and an
          excellent way to contribute to the scientific community. We cordially
          invite you to join our team of reviewers. You can register via the{" "}
          <Strong>
            JAIRAM (Journal of Advanced &amp; Integrated Research In Acute
            Medicine)
          </Strong>{" "}
          portal. New users must register and verify their email before
          completing their reviewer profile.
        </p>
      </section>

      <Rule />

      {/* ── Section 10 ── */}
      <section id="submit-report" style={s.section}>
        <h2 style={s.sectionTitle}>Submitting your report</h2>
        <p style={s.para}>
          Once you have completed your evaluation, please write and submit your
          report through the <Strong>JAIRAM portal</Strong>.
        </p>

        <SubHeading>Report for the editor and author</SubHeading>
        <ul style={s.bulletList}>
          <Bullet>
            <Strong>For the editor: </Strong>Provide a brief summary of the
            manuscript and your overall assessment. This is also where you
            should raise any confidential concerns (e.g., suspected plagiarism
            or fraud).
          </Bullet>
          <Bullet>
            <Strong>For the author: </Strong>Your comments should be courteous,
            constructive, and free of personal remarks. Explain and support your
            judgments so the author can understand the basis for your feedback.
            Clearly indicate any deficiencies and suggest how the manuscript
            could be improved.
          </Bullet>
        </ul>

        <SubHeading>Recommendation</SubHeading>
        <p style={s.para}>
          When making a recommendation, use one of the following categories:
        </p>
        <div style={s.decisionRow}>
          <DecisionTag
            label="Accept"
            bg="#EAF3DE"
            color="#27500A"
            border="#97C459"
          />
          <DecisionTag
            label="Minor revision"
            bg="#E6F1FB"
            color="#0C447C"
            border="#85B7EB"
          />
          <DecisionTag
            label="Major revision"
            bg="#FAEEDA"
            color="#633806"
            border="#EF9F27"
          />
          <DecisionTag
            label="Reject"
            bg="#FCEBEB"
            color="#791F1F"
            border="#F09595"
          />
        </div>
        <p style={{ ...s.para, marginTop: 14 }}>
          If you recommend revisions, clearly identify what changes are required
          and indicate whether you would be willing to review the revised
          manuscript.
        </p>
      </section>

      <Rule />

      {/* ── Section 11 ── */}
      <section id="ai-guidelines" style={s.section}>
        <h2 style={s.sectionTitle}>Artificial intelligence (AI) guidelines</h2>
        <BulletList
          items={[
            "Peer reviewers play a crucial role in maintaining the quality and credibility of research.",
            "The use of AI tools in peer review must be approached with transparency and care.",
            "Any use of AI assistance during the review process must be disclosed to the editor.",
            "AI tools must not be used to process or store confidential manuscript content.",
          ]}
        />
        <p style={{ ...s.para, marginTop: 14 }}>
          <ExternalLink href="https://ipinnovative.com/guidelines/author/artificial-intelligence-ai-guidelines">
            Read the full AI guidelines →
          </ExternalLink>
        </p>
      </section>

      <Rule />

      <Rule />

      {/* ── Section 11b: Process ── */}
      <section id="process" style={s.section}>
        <h2 style={s.sectionTitle}>Article peer review process</h2>

       <div style={{ marginTop: 16, textAlign: "center" }}>
  <img
    src="/assets/peer_review_process.png"
    alt="Article peer review process flowchart"
    style={{ maxWidth: 520, width: "100%", height: "auto", borderRadius: 8 }}
  />
</div>

      </section>

      {/* ── Section 12 ── */}
      <section id="workflow" style={s.section}>
        <h2 style={s.sectionTitle}>The manuscript workflow</h2>
        <p style={s.para}>
          A step-by-step guide from initial submission to final publication.
        </p>
        <ul style={s.stepList}>
          {[
            {
              n: 1,
              title: "Manuscript submission",
              text: "The corresponding author submits the manuscript via the JAIRAM portal. In rare cases, the journal may grant permission for submission by email.",
            },
            {
              n: 2,
              title: "Editorial office scrutiny",
              text: "The editorial office performs an initial technical check to ensure the manuscript's composition and arrangement adhere to the journal's Author Guidelines. Scientific quality is not assessed at this stage.",
            },
            {
              n: 3,
              title: "Initial evaluation by the editor",
              text: "The Editor-in-Chief or an Associate Editor evaluates the manuscript for scope, originality, and significance. If suitable, it proceeds to peer review; otherwise it may be desk-rejected or returned for revision.",
            },
            {
              n: 4,
              title: "Invitation to reviewers",
              text: "The handling editor sends invitations to potential reviewers with relevant expertise. Invitations continue until the required number is secured — typically two, though this may vary.",
            },
            {
              n: 5,
              title: "Reviewer response",
              text: "Potential reviewers evaluate the invitation based on expertise, availability, and conflicts of interest, then accept or decline. When declining, suggesting an alternative reviewer is encouraged.",
            },
            {
              n: 6,
              title: "The review is conducted",
              text: "The reviewer reads the manuscript thoroughly to form an assessment. If major flaws are immediately apparent, rejection may be recommended without a full point-by-point review. Otherwise, a detailed report is prepared with a recommendation to Accept, Reject, or Revise.",
            },
            {
              n: 7,
              title: "Editor evaluates the reviews",
              text: "The editor considers all reviewer reports before making a final decision. Widely differing reviews may prompt invitation of an additional reviewer.",
            },
            {
              n: 8,
              title: "Decision is communicated",
              text: "The editor sends a decision email to the author, including the anonymous reviewer comments.",
            },
            {
              n: 9,
              title: "Final outcome and next steps",
              text: "Acceptance → sent to production. Revision → authors revise; original reviewers may re-assess. Rejection → author is informed with clear justification and may receive constructive reviewer comments.",
            },
            {
              n: 10,
              title: "Post-acceptance",
              text: "The manuscript enters production — copyediting, typesetting, and proofreading. A galley proof is shared with the corresponding author before the article is scheduled for publication.",
            },
            {
              n: 11,
              title: "Recognition for reviewer contributions",
              text: "Reviewers receive a thank you email. Forward it to reviews@webofscience.com for Web of Science recognition, or download a Certificate of Reviewing directly from the JAIRAM portal.",
              last: true,
            },
          ].map(({ n, title, text, last }) => (
            <StepItem key={n} number={n} title={title} last={last}>
              {text}
            </StepItem>
          ))}
        </ul>
      </section>
    </div>
  );
}
