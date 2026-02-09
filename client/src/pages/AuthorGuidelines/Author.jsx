import React from "react";
import {
  FileText,
  AlertCircle,
  BookOpen,
  Users,
  Shield,
  Search,
  Copyright,
  Upload,
} from "lucide-react";

// Data Configuration
const GUIDELINES_DATA = [
  {
    id: 1,
    title: "Types of Manuscripts Accepted",
    icon: FileText,
    content: {
      types: [
        {
          name: "Original Research Articles",
          words: "3000 - 4000 words",
        },
        {
          name: "Review Articles / Systematic Reviews",
          words: "4000 - 6000 words",
        },
        {
          name: "Short Communications",
          words: "2000 words",
        },
        {
          name: "Case Reports / Case Series",
          words: "1500 - 2000 words",
        },
        {
          name: "Clinical Images",
          words: "500 words",
        },
        {
          name: "Letters to the Editor",
          words: "500 words",
        },
        {
          name: "Editorials / Invited Articles",
          words: "As assigned",
        },
      ],
    },
  },
  {
    id: 2,
    title: "Manuscript Preparation",
    icon: BookOpen,
    content: {
      sections: [
        {
          name: "Language",
          desc: "English (UK/US – consistent)",
        },
        {
          name: "Font",
          desc: "Times New Roman, Size 12",
        },
        {
          name: "Line Spacing",
          desc: "Double-spaced",
        },
        {
          name: "Margins",
          desc: "2.5 cm",
        },
        {
          name: "File Format",
          desc: "MS Word (.doc/.docx)",
        },
      ],
    },
  },
  {
    id: 3,
    title: "Structure of Manuscripts",
    icon: BookOpen,
    content: {
      sections: [
        {
          name: "Title Page",
          desc: "Title, Authors, Affiliations, Corresponding Author details, ORCID ID, running title, Word count, Figures/Tables count",
        },
        {
          name: "Abstract",
          desc: "Structured (Original Articles) or Unstructured, 250 words, 3–6 Keywords (MeSH preferred)",
        },
      ],
    },
  },
  {
    id: 4,
    title: "Main Text",
    icon: FileText,
    content: {
      sections: [
        {
          name: "Original Research Articles",
          desc: "Introduction, Materials and Methods, Results, Discussion, Conclusion",
        },
        {
          name: "Case Reports",
          desc: "Introduction, Case Description, Discussion, Conclusion",
        },
      ],
    },
  },
  {
    id: 5,
    title: "Tables and Figures",
    icon: FileText,
    content:
      "Sequential numbering, 300 dpi resolution, separate legends, patient identity concealed",
  },
  {
    id: 6,
    title: "References",
    icon: BookOpen,
    content: "Vancouver Style, numbered consecutively, DOI wherever available",
  },
  {
    id: 7,
    title: "Ethical Considerations",
    icon: Shield,
    content:
      "Ethical approval mandatory, informed consent required, animal study compliance",
  },
  {
    id: 8,
    title: "Plagiarism Policy",
    icon: Search,
    content: "Similarity index <15%, excluding references",
  },
  {
    id: 9,
    title: "Conflict of Interest & Funding",
    icon: AlertCircle,
    content: "All conflicts and funding sources must be declared",
  },
  {
    id: 10,
    title: "Peer Review Process",
    icon: Users,
    content: "Double-blind peer review, minimum two reviewers",
  },
  {
    id: 11,
    title: "Open Access & Copyright",
    icon: Copyright,
    content:
      "Authors retain copyright and all accepted articles are published underthe Creative Commons Attribution 4.0 International License (CC BY 4.0).",
  },
  {
    id: 12,
    title: "Submission Process",
    icon: Upload,
    content:
      "Online system or official journal email, covering letter mandatory",
  },
];

const renderContent = (section) => {
  const { content } = section;

  switch (section.id) {
    case 1:
      return (
        <div>
          <p className="mb-4 text-gray-700">{content.intro}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm">
                    Manuscript Type
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-sm">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.types.map((type, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {type.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {type.words}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-3">
          {content.sections.map((sec, idx) => (
            <div
              key={idx}
              className="text-start pb-3 border-b border-gray-200 last:border-0"
            >
              <li className="font-semibold text-gray-800 mb-1">{sec.name}</li>
              <span className="text-sm text-gray-700">{sec.desc}</span>
            </div>
          ))}
        </div>
      );

    case 3:
      return (
        <div className="space-y-3">
          {content.sections.map((sec, idx) => (
            <div
              key={idx}
              className="text-start pb-3 border-b border-gray-200 last:border-0"
            >
              <li className="font-semibold text-gray-800 mb-1">{sec.name}</li>
              <p className="text-sm text-gray-700">{sec.desc}</p>
            </div>
          ))}
        </div>
      );

    case 4:
      return (
        <div className="space-y-3">
          {content.sections.map((sec, idx) => (
            <div
              key={idx}
              className="text-start pb-3 border-b border-gray-200 last:border-0"
            >
              <li className="font-semibold text-gray-800 mb-1">{sec.name}</li>
              <p className="text-sm text-gray-700">{sec.desc}</p>
            </div>
          ))}
        </div>
      );

    case 5:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 6:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 7:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 8:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 9:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 10:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 11:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    case 12:
      return (
        <div className="space-y-4">
          <p className="text-start text-gray-700">{content}</p>
        </div>
      );

    default:
      return null;
  }
};

export default function Author() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <h1 className="text-2xl font-bold">
            Author Guidelines & Submission Instructions
          </h1>
          <p className="mt-1 text-blue-100">
            The journal accepts the following types of manuscripts with specific
            requirements:
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {GUIDELINES_DATA.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start mb-4">
                  <Icon className="w-7 h-7 mr-3 shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-800 pt-1">
                    {section.title}
                  </h2>
                </div>
                <div className="ml-14">{renderContent(section)}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
