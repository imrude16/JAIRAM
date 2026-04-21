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

const Callout = ({ children, scheme = BLUE }) => (
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

// ─── ARTICLE TYPES TABLE ──────────────────────────────────────────────────────
const ArticleTypesTable = () => {
  const types = [
    {
      type: "Original Research Article",
      words: "2000–4500",
      abstract: "Structured 150–250 words",
      refs: "15–70",
      figures: "Up to 8",
      tables: "Up to 8",
    },
    {
      type: "Review Article",
      words: "2500–6000",
      abstract: "150–250 words",
      refs: "15–100",
      figures: "Up to 8",
      tables: "Up to 8",
    },
    {
      type: "Meta-analysis / Systematic Review",
      words: "2500–6500",
      abstract: "Structured 150–250 words",
      refs: "15–100",
      figures: "Up to 8",
      tables: "Up to 8",
    },
    {
      type: "Case Report / Case Series",
      words: "1000–2500",
      abstract: "Unstructured ≤150 words",
      refs: "8–25",
      figures: "Up to 15",
      tables: "Up to 8",
    },
    {
      type: "Letter to Editor",
      words: "300–800",
      abstract: "None",
      refs: "3–8",
      figures: "Max 2",
      tables: "Max 2",
    },
    {
      type: "Short Communication / Commentary",
      words: "600–1500",
      abstract: "—",
      refs: "5–15",
      figures: "Max 2",
      tables: "Max 2",
    },
    {
      type: "Editorial / Guest Editorial",
      words: "400–1200",
      abstract: "None",
      refs: "Up to 10",
      figures: "Max 1",
      tables: "Max 1",
    },
  ];
  const th = {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "6px 8px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    textAlign: "left",
  };
  const td = {
    fontSize: 12,
    color: "var(--color-text-secondary)",
    padding: "7px 8px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    verticalAlign: "top",
    lineHeight: 1.5,
  };
  return (
    <div style={{ overflowX: "auto", marginTop: 10 }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr>
            <th style={th}>Article type</th>
            <th style={th}>Word limit</th>
            <th style={th}>Abstract</th>
            <th style={th}>References</th>
            <th style={th}>Figures</th>
            <th style={th}>Tables</th>
          </tr>
        </thead>
        <tbody>
          {types.map((r, i) => (
            <tr
              key={i}
              style={{
                background:
                  i % 2 === 0
                    ? "transparent"
                    : "var(--color-background-secondary)",
              }}
            >
              <td
                style={{
                  ...td,
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {r.type}
              </td>
              <td style={td}>{r.words}</td>
              <td style={td}>{r.abstract}</td>
              <td style={td}>{r.refs}</td>
              <td style={td}>{r.figures}</td>
              <td style={td}>{r.tables}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── NODES ────────────────────────────────────────────────────────────────────
const NODES = [
  {
    id: "overview",
    label: "Overview",
    scheme: BLUE,
    tag: "JAIRAM Portal",
    content: () => (
      <>
        <Para>
          All submitted manuscripts are managed by the{" "}
          <Strong>
            Journal Of Advanced & Research in Acute Medicine(JAIRAM)
          </Strong>{" "}
          — a smooth and rigorous double-blind peer-review manuscript handling
          and editorial process. On this single platform, all authors,
          reviewers, editors, and the editorial office work together.
        </Para>
      </>
    ),
  },
  {
    id: "checklist",
    label: "Submission checklist",
    scheme: TEAL,
    tag: "Before you submit",
    content: () => (
      <>
        <Para>
          A manuscript submission checklist is essential for finalizing an
          article before sending it to the journal for review.
        </Para>
        <BulletList
          items={[
            "One of the authors should be designated as the Corresponding author, providing their contact details.",
            "The author must check the Aims and Scope of the journal.",
            "The manuscript will be prepared using the MS Word template.",
            <span>
              An author must adhere to various guidelines such as{" "}
              <Strong>Authorship Criteria</Strong>,{" "}
              <Strong>Research and Publication Ethics</Strong> as per COPE and
              ICMJE Criteria, Manuscript Preparation, Copyright Format,
              Illustrations, Data, Reference Format, etc.
            </span>,
            "The author must approve the content of the submitted manuscript.",
            "All necessary files must have been uploaded with Keywords, figures, and tables (including title, description, and footnotes).",
            "The manuscript should have been spell- and grammar-checked.",
            "The author must have obtained permission for any copyrighted material.",
            "For any manuscript involving studies with human participants, it is the author's responsibility to confirm that ethical approval has been obtained from the relevant committee (e.g., Institutional Review Board, Research Ethics Board).",
          ]}
        />
      </>
    ),
  },
  {
    id: "submission",
    label: "Manuscript submission guidelines",
    scheme: GREEN,
    tag: "Online at JAIRAM Portal",
    content: () => (
      <>
        <SubHead>Submission process</SubHead>
        <Para>
          Manuscripts must be submitted online at the JAIRAM Portal. The
          submitting author is responsible for the manuscript during submission
          and peer review, ensuring all eligible co-authors are listed, have
          acknowledged authorship criteria, and have approved the submitted
          version. First-time users must register on the portal and complete
          email verification. Existing users can log in using their credentials,
          or via Google or ORCID ID.
        </Para>
        <Para>
          Upon successful registration, authors should log in and submit their
          manuscript. The submission process requires the author to provide
          details regarding funding information, ensuring compliance with all
          funder stipulations.
        </Para>

        <SubHead>Manuscript preparation</SubHead>
        <BulletList
          items={[
            <span>
              <Strong>Title Page Information:</Strong> Manuscripts must be
              prepared following the Manuscript Title, Running Title, Author
              list, Affiliations, Abstract, Word limits, No. of Figures and
              Tables, and Keywords.
            </span>,
            <span>
              <Strong>Author Ethical Responsibilities:</Strong> The author
              should provide Supplementary Materials, Acknowledgements, Author
              Contributions, Conflicts of Interest, Source of Funding, Data
              Availability Statement, and Citations.
            </span>,
            <span>
              <Strong>Presentation and Format:</Strong> Spacing, Margins, Page
              Numbering, Word limit, etc.
            </span>,
          ]}
        />

        <SubHead>Cover letter</SubHead>
        <Para>
          Manuscripts submitted for publication must be accompanied by a concise
          cover letter that includes:
        </Para>
        <BulletList
          items={[
            "Journal name",
            "Manuscript Title",
            "Type of Manuscript",
            "Author's full names (First name, Middle Name, and Last Name)",
            "Complete Affiliations (in sequence)",
            "Contact no and email ID",
            "ORCID ID / Researcher's profile",
            "Author should disclose the use of AI in the manuscript as per ICMJE criteria.",
            "Disclosure of any conflicts of interest or funding sources.",
          ]}
        />

        <SubHead>Title page information</SubHead>
        <BulletList
          items={[
            "The title should be concise, specific, relevant, and informative, containing primary keywords, formulae, and abbreviations.",
            "Running title or short title should not be more than 40–50 characters.",
            "Authors' first and last names must be provided. Standard format used for PubMed/MEDLINE for affiliations, including city, pin/zip code, state, and country.",
            "The corresponding author must have their name, address, contact number, and email address clearly stated.",
            <span>
              Keywords: Include between 3 and 6 keywords for indexing. Use{" "}
              <ExternalLink href="https://www.ncbi.nlm.nih.gov/mesh/">
                MeSH
              </ExternalLink>{" "}
              to select appropriate keywords.
            </span>,
            "Word Count: Provide the electronic word count of the manuscript.",
            "Tables and Figures: State the number of tables and figures included.",
            "Conflict of Interest Statement: Declare any potential conflicts of interest.",
            "Financial Support Statement: List any financial support received.",
            "Authors Contributions: Describe each author's role as per ICMJE Criteria.",
            "Confirmation that informed patient consent was obtained for publication of case details.",
          ]}
        />
      </>
    ),
  },
  {
    id: "article-types",
    label: "Article types",
    scheme: PURPLE,
    tag: "7 categories",
    content: () => (
      <>
        <SubHead>Original research article</SubHead>
        <Para>
          Structured abstract (150–250 words) with subheadings:{" "}
          <Strong>Background</Strong> (study purpose, procedures, findings,
          conclusions), <Strong>Methods</Strong> (main methods, ethical
          approval, CTRI registration if applicable), <Strong>Results</Strong>{" "}
          (findings in logical sequence), and <Strong>Conclusion</Strong>{" "}
          (interpretations with study goal). Structure: Introduction → Materials
          and Methods → Results → Discussion → Conclusions → References.
        </Para>

        <SubHead>Review article</SubHead>
        <Para>
          Written by experts who have done substantial research on the subject.
          Should address a focused topic, interpret and integrate findings, and
          not simply restate literature. Structure: Abstract, Keywords,
          Introduction, Discussion, Conclusion, References.
        </Para>
        <BulletList
          items={[
            <span>
              <Strong>Systematic Review:</Strong> Evidence-based method
              answering specific questions by synthesizing all available
              research. Must comply with PRISMA.
            </span>,
            <span>
              <Strong>Meta-Analysis:</Strong> Statistical method combining
              results from various studies. Must adhere to PRISMA guidelines.
            </span>,
          ]}
        />

        <SubHead>Case report / Case series</SubHead>
        <Para>
          Novel, interesting, or rare case reports/series. Should describe
          diagnostic or therapeutic challenges with learning points for readers.
          Structure: Unstructured Abstract (≤150 words), Introduction, Case
          Presentation/Series, Discussion, Conclusion, References.
        </Para>

        <SubHead>Letter to editor</SubHead>
        <Para>
          Focused on news or an article published in a journal within the past
          year. No abstract. Max 300–800 words.
        </Para>

        <SubHead>Short communication / Commentary / Editorial</SubHead>
        <Para>
          Short communication: 600–1500 words. Editorial/Guest Editorial:
          400–1200 words, no abstract.
        </Para>

        <Rule />
        <SubHead>Article types at a glance</SubHead>
        <ArticleTypesTable />
      </>
    ),
  },
  {
    id: "formatting",
    label: "Manuscript formatting",
    scheme: GRAY,
    tag: "MS Word only",
    content: () => (
      <>
        <BulletList
          items={[
            "Manuscripts should be submitted in MS-Word only; no PDF or other format is allowed.",
            "Use normal font (12-point, Times New Roman) for text.",
            "Use double-spaces for all text, including abstract, table, reference, footnotes, and figure legends.",
            "Use italics for emphasis.",
            "Page margins 1 inch from all sides.",
            "Page numbers at the bottom.",
            "Reference according to the journal instructions, punctuation marks checked.",
            "Submit without track changes.",
            "Use the table function to create a table in Word, not Spreadsheet/Excel.",
            "Save your file in Docx format (MS Word 2007 or higher).",
            "All scientific names should be written in italics.",
            "Use the International System of Units (SI). Provide SI equivalents for any other units mentioned.",
          ]}
        />

        <SubHead>Figures, tables and artworks</SubHead>
        <BulletList
          items={[
            "Files must be provided during submission in a single zip/WinRAR archive at 300 DPI or higher. Accepted formats: TIFF, JPEG, EPS, PNG.",
            "Authors are encouraged to prepare tables and figures in colour (RGB at 8-bit).",
            "All figures, tables, and artworks must have a caption or heading.",
            "Tables and Figures/Graphs are always cited in the text in consecutive numerical order.",
            "Identify any previously published material by giving the source as a reference at the end of the table caption.",
            "The author should check figures for duplications and ensure clarity and accuracy.",
          ]}
        />
      </>
    ),
  },
  {
    id: "ethics",
    label: "Author ethical responsibilities",
    scheme: RED,
    tag: "COPE & ICMJE",
    content: () => (
      <>
        <BulletList
          items={[
            <span>
              <Strong>Conflicts of Interest:</Strong> Disclose any financial or
              conflicting interests affecting the study's outcome at the time of
              submission. If no conflicts exist, state "I declare no conflicts
              of interest."
            </span>,
            <span>
              <Strong>Funding and Acknowledgments:</Strong> Include grants,
              funds, and support in a separate section on the title page.
              Mention the use of AI tools in a separate section at the end of
              the article.
            </span>,
            <span>
              <Strong>Author Contributions:</Strong> Include a statement of
              responsibility per ICMJE Authorship Criteria. Authorship must be
              limited to those who have contributed substantially to the work.
            </span>,
            <span>
              <Strong>Data Availability Statement:</Strong> Provide details of
              where data supporting reported results can be found, including
              links to publicly archived datasets.
            </span>,
            <span>
              <Strong>Ethical Approval:</Strong> Required if applicable.
              Manuscripts involving human participants must confirm approval
              from the relevant IRB or Ethics Board.
            </span>,
            <span>
              <Strong>Informed Consent:</Strong> Required for case reports and
              human studies.
            </span>,
            <span>
              <Strong>Clinical Trial Registry:</Strong> Required only for
              clinical trial manuscripts. CTRI No. must be mentioned at the end
              of the abstract if applicable.
            </span>,
            <span>
              <Strong>Supplementary Materials:</Strong> Authors may submit
              supporting datasets, additional tables/figures, or multimedia
              files to be published online only.
            </span>,
          ]}
        />
        <Callout scheme={RED}>
          Referencing AI-generated material as the primary source is not
          acceptable.
        </Callout>
      </>
    ),
  },
  {
    id: "references",
    label: "References guide",
    scheme: AMBER,
    tag: "Vancouver style",
    content: () => (
      <>
        <Para>
          The journal follows the{" "}
          <ExternalLink href="https://www.nlm.nih.gov/bsd/uniform_requirements.html">
            NLM style guide
          </ExternalLink>{" "}
          and ICMJE guidelines, generally preferring{" "}
          <Strong>Vancouver referencing style</Strong> — a standardized citation
          format widely used in biomedical and scientific publications.
          References must be numbered consecutively in the order they are first
          cited in the text. Citation numbers should be inserted as superscripts
          or in parentheses after the relevant statement, e.g. Kumar et al.
          <sup>16</sup> or Kumar et al.[16].
        </Para>

        <Para>
          The reference list should appear at the end of the manuscript and
          include only sources cited in the text. Journal titles must be
          abbreviated according to{" "}
          <ExternalLink href="https://www.nlm.nih.gov/tsd/serials/lji.html">
            Index Medicus
          </ExternalLink>{" "}
          standards. Authors are responsible for ensuring the accuracy and
          completeness of all references.
        </Para>

        <SubHead>General formatting rules</SubHead>
        <BulletList
          items={[
            "Use Arabic numerals (1, 2, 3…) for citations.",
            "List up to 6 authors; if more, write the first 6 followed by et al.",
            <span>
              Use standard journal abbreviations as per{" "}
              <ExternalLink href="https://www.nlm.nih.gov/tsd/serials/lji.html">
                Index Medicus
              </ExternalLink>
              .
            </span>,
            "Follow punctuation and spacing strictly as per Vancouver norms.",
          ]}
        />

        <SubHead>1. Journal article</SubHead>
        <Callout scheme={GRAY}>
          <span style={{ fontStyle: "italic", opacity: 0.85 }}>
            Sharma R, Gupta A, Singh P, Verma N, Kumar S, Yadav R, et al.
            Evaluation of toxicological findings in medicolegal autopsies.
            Indian J Forensic Med Toxicol. 2023;17(2):45–52.
          </span>
        </Callout>

        <SubHead>2. Book</SubHead>
        <Callout scheme={GRAY}>
          <span style={{ fontStyle: "italic", opacity: 0.85 }}>
            Reddy KSN, Murty OP. The Essentials of Forensic Medicine and
            Toxicology. 34th ed. New Delhi: Jaypee Brothers Medical Publishers;
            2017.
          </span>
        </Callout>

        <SubHead>3. Book chapter</SubHead>
        <Callout scheme={GRAY}>
          <span style={{ fontStyle: "italic", opacity: 0.85 }}>
            Pillay VV. Modern toxicology. In: Pillay VV, editor. Textbook of
            Forensic Medicine and Toxicology. 18th ed. Hyderabad: Paras Medical
            Publisher; 2019. p. 120–135.
          </span>
        </Callout>

        <SubHead>4. Website</SubHead>
        <Callout scheme={GRAY}>
          <span style={{ fontStyle: "italic", opacity: 0.85 }}>
            World Health Organization. Suicide worldwide in 2021 [Internet].
            Geneva: WHO; 2022 [cited 2026 Apr 20]. Available from:{" "}
            <ExternalLink href="https://www.who.int">
              https://www.who.int
            </ExternalLink>
          </span>
        </Callout>

        <SubHead>5. Thesis / Dissertation</SubHead>
        <Callout scheme={GRAY}>
          <span style={{ fontStyle: "italic", opacity: 0.85 }}>
            Tripathi SK. Postmortem electrolyte changes for estimation of time
            since death [dissertation]. Lucknow: King George's Medical
            University; 2024.
          </span>
        </Callout>

        <SubHead>In-text citation examples</SubHead>
        <Callout scheme={AMBER}>
          Electrolyte imbalance plays a significant role in postmortem interval
          estimation.<sup>1</sup>
          <br />
          Previous studies have demonstrated similar findings.<sup>2,3</sup>
        </Callout>

        <BulletList
          items={[
            "Always use the standard abbreviation of the journal's name according to the ISSN list of titles.",
            "Authors are responsible for the accuracy and validation of all references.",
            "The abstract is not allowed to cite any sources.",
            "Citations in supplementary files are permitted if they also appear in the main text and reference list.",
          ]}
        />
      </>
    ),
  },
  {
    id: "clinical-trials",
    label: "Clinical trial registry",
    scheme: TEAL,
    tag: "ICMJE / CONSORT",
    content: () => (
      <>
        <Para>
          Clinical trials should be prospectively registered in a public domain
          database. The clinical trial registration number must be mentioned in
          all papers reporting results. Authors are asked to provide the{" "}
          <Strong>name of the trial register</Strong> and the{" "}
          <Strong>clinical trial registration number</Strong> in the manuscript.
          If not registered or registered retrospectively, the reason must be
          provided at the time of — or before — the patient's first enrolment as
          a condition of consideration for publication.
        </Para>

        <SubHead>ICMJE Guidelines</SubHead>
        <Para>
          The journal follows the{" "}
          <ExternalLink href="https://www.icmje.org/recommendations/browse/publishing-and-editorial-issues/clinical-trial-registration.html">
            International Committee of Medical Journal Editors (ICMJE)
          </ExternalLink>{" "}
          guidelines. Authors are highly encouraged to pre-register clinical
          trials with an international clinical trial register and cite a
          reference to the registration in the methodology section. Suitable
          databases include:
        </Para>
        <BulletList
          items={[
            <span>
              <ExternalLink href="http://ctri.nic.in/Clinicaltrials/login.php">
                CTRI — Clinical Trials Registry India
              </ExternalLink>{" "}
              (ctri.nic.in)
            </span>,
            <span>
              Other databases listed by the{" "}
              <ExternalLink href="https://www.who.int/clinical-trials-registry-platform">
                WHO International Clinical Trials Registry Platform
              </ExternalLink>
              .
            </span>,
          ]}
        />

        <Callout scheme={TEAL}>
          The journal reserves the right to reject a paper without trial
          registration for further peer review.
        </Callout>

        <SubHead>CONSORT requirements</SubHead>
        <Para>
          Reports of randomized clinical trials should present information on
          all major studies — including the protocol and assignment of
          interventions — based on the{" "}
          <ExternalLink href="https://www.consort-spirit.org/">
            CONSORT statement
          </ExternalLink>
          . A suitable database must be included and requires a complete
          consolidation of standard reporting trials as per the CONSORT minimum
          guidelines for publication.
        </Para>
        <Para>
          Clinical trial abstracts should include items that the{" "}
          <ExternalLink href="https://www.consort-spirit.org/">
            CONSORT
          </ExternalLink>{" "}
          has identified as essential. Funding sources should be listed
          separately after the abstract to facilitate proper display and
          indexing for search retrieval.
        </Para>

        <SubHead>Specific study designs and reporting guidelines</SubHead>
        <Para>
          The journal requires a complete{" "}
          <ExternalLink href="https://www.consort-spirit.org/extensions">CONSORT 2010 Checklist</ExternalLink> key document and{" "}
          <ExternalLink href="https://www.consort-spirit.org/extensions">CONSORT 2010 flow diagram</ExternalLink> as a condition of
          submission when reporting the results of a randomized clinical trial.
          Templates for these reporting guidelines are available on the CONSORT
          website.
        </Para>
        <BulletList
          items={[
            <span>
              Authors are referred to the{" "}
              <ExternalLink href="https://www.equator-network.org/">
                EQUATOR network
              </ExternalLink>{" "}
              for further information on available reporting guidelines for
              health research.
            </span>,
            <span>
              Authors are encouraged to follow the{" "}
              <ExternalLink href="https://www.equator-network.org/reporting-guidelines/sager-guidelines/">
                SAGER guidelines
              </ExternalLink>{" "}
              ("Sex and Gender Equity in Research") and are recommended to apply
              them where relevant.
            </span>,
            "Authors should describe in the background section whether sex and gender differences may be expected.",
            "If sex and gender analysis were not conducted, the rationale should be provided in the discussion section.",
            "The journal suggests that authors follow the full guidelines of SAGER.",
          ]}
        />

        <SubHead>Good clinical practices (GCP)</SubHead>
        <Para>
          Good Clinical Practice (GCP) is a global ethical and scientific
          quality standard for the planning, execution, monitoring, auditing,
          documentation, analysis, and reporting of clinical trials. It
          additionally safeguards trial subjects' anonymity, integrity, and
          rights.
        </Para>
        <Para>
          The <Strong>ICH-GCP</Strong> is a unified standard that safeguards the
          rights, safety, and well-being of human participants, reduces human
          exposure to investigational products, enhances data quality,
          accelerates the marketing of new drugs, and lowers costs for sponsors
          and the public. Adhering to this standard offers public assurance that
          the rights, safety, and welfare of trial participants are safeguarded
          and aligned with the principles of the{" "}
          <Strong>Declaration of Helsinki</Strong>, ensuring the reliability of
          clinical trial data.
        </Para>
      </>
    ),
  },
  {
    id: "publication-ethics",
    label: "Publication ethics & plagiarism",
    scheme: RED,
    tag: "iThenticate checked",
    content: () => (
      <>
        <Para>
          The journal considers plagiarism a serious breach of{" "}
          <ExternalLink href="https://publicationethics.org/">
            publication ethics
          </ExternalLink>
          . Plagiarism is defined as the act of presenting another's work,
          ideas, or words as one's own without proper attribution. The journal
          strictly prohibits self-plagiarism 
          software is provided to editors and reviewers.
        </Para>
        <BulletList
          items={[
            "Self-plagiarism: reusing one's own work without proper citation is considered plagiarism.",
            "Using another's production without credit is prohibited.",
            "Presenting a new idea derived from an existing source without attribution is prohibited.",
          ]}
        />
      </>
    ),
  },
  {
    id: "reviewer-suggestions",
    label: "Reviewer suggestions",
    scheme: GREEN,
    tag: "Two suggested",
    content: () => (
      <>
        <Para>
          Once the manuscript has been submitted, you are requested to suggest
          any <Strong>two potential reviewers</Strong> with appropriate
          expertise. The editors will not necessarily approach these referees.
        </Para>
        <BulletList
          items={[
            "The suggested reviewer should be from a different institution from the authors.",
            "The author may identify appropriate Editorial Board members of the journal as potential reviewers.",
            "You may suggest reviewers among the authors whom you frequently cite in your paper.",
          ]}
        />
      </>
    ),
  },
  {
    id: "language",
    label: "English language corrections",
    scheme: GRAY,
    tag: "Professional editing",
    content: () => (
      <Para>
        The submitted manuscript must be grammatically correct. If guidance is
        required with English writing, it is recommended to have the manuscript
        professionally edited prior to submission via{" "}
        <Strong>Innovative Author Services</Strong>. All accepted manuscripts
        undergo language editing.
      </Para>
    ),
  },
  {
    id: "authorship",
    label: "Authorship",
    scheme: PURPLE,
    tag: "ICMJE criteria",
    content: () => (
      <>
        <Para>
          The journal and publisher assume all authors agreed with the{" "}
          <ExternalLink href="https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html">
            ICMJE guidelines
          </ExternalLink>
          , which state that all authors gave explicit consent to the manuscript
          submission. Those who contributed to the work but did not qualify for
          authorship should be listed in the acknowledgements.
        </Para>
        <BulletList
          items={[
            "Any updates on the author list must be approved by all authors, including any who have been removed.",
            "The publisher reserves the right to request confirmation that all authors meet the authorship conditions.",
          ]}
        />

        <SubHead>Author appeals</SubHead>
        <Para>
          The author has the right to send an appeal to the editorial office by
          email. The appeal must provide a detailed justification, including all
          point-by-point responses to the reviewer's and/or Editor's comments.{" "}
          <Strong>
            A rejection decision at this stage is final and cannot be reversed.
          </Strong>
        </Para>

        <SubHead>Print copy</SubHead>
        <Para>
          The corresponding author will receive one print copy of the issue.
          Additional copies can be ordered from the editorial office at an
          individual price per issue.
        </Para>
      </>
    ),
  },
  {
    id: "editorial-process",
    label: "Editorial process and peer review",
    scheme: BLUE,
    tag: "1–7 days first decision",
    content: () => (
      <>
        <SubHead>Primary scrutiny</SubHead>
        <Para>
          The Editorial office reviews manuscripts submitted via the portal to
          ensure they are properly prepared and adhere to the journal's
          editorial policies. Non-suitable manuscripts are rejected before peer
          review. Those not properly prepared are returned for revision.
        </Para>

        <SubHead>Peer review</SubHead>
        <Para>
          Once primary scrutiny is completed, at least{" "}
          <Strong>two independent experts</Strong> are assigned for peer review.
          Reviewers should not have published with any of the co-authors during
          the past three years, and should not currently work or collaborate
          with any of the co-authors' institutions. All communications are
          managed via the Pre-Publication Portal.
        </Para>

        <SubHead>Peer review duration</SubHead>
        {[
          {
            n: 1,
            scheme: GREEN,
            title: "First decision",
            text: "Within 1–7 days of submission.",
          },
          {
            n: 2,
            scheme: AMBER,
            title: "Peer review",
            text: "Generally takes 8–12 weeks.",
          },
          {
            n: 3,
            scheme: TEAL,
            title: "Publication",
            text: "As per publication schedule after acceptance. May vary based on article type, availability of reviewers, and editorial staff communications.",
          },
        ].map(({ n, scheme, title, text }, i, arr) => {
          const isLast = i === arr.length - 1;
          return (
            <div
              key={n}
              style={{ display: "flex", gap: 12, textAlign: "left" }}
            >
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

        <SubHead>Author support</SubHead>
        <Para>
          For queries after acceptance, visit the journal homepage or check the
          author FAQ for assistance with the submission portal.
        </Para>
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
export default function AuthorGuidelines() {
  const [openId, setOpenId] = useState("overview");
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
          Author Guidelines
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
          Complete instructions for manuscript preparation, submission, and
          publication — Click any section to expand.
        </p>
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
