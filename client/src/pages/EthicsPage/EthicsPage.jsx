import React from "react";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Lock,
  Eye,
  BookOpen,
} from "lucide-react";

const EthicsPage = () => {
  const policies = [
    {
      icon: FileText,
      title: "Ethical Responsibilities of Authors",
      content:
        "Authors must ensure that submitted manuscripts are original, unpublished, and not under consideration elsewhere. All data must be presented honestly, without fabrication, falsification, or inappropriate manipulation. Proper acknowledgment of sources and contributors is mandatory, and authorship must comply with ICMJE guidelines.",
    },
    {
      icon: Lock,
      title: "Research Ethics",
      content:
        "Research involving human participants must comply with the Declaration of Helsinki, with prior approval from an Institutional Ethics Committee (IEC/IRB) and documented informed consent. Animal studies must follow recognized animal welfare guidelines and obtain appropriate ethical approval.",
    },
    {
      icon: Eye,
      title: "Plagiarism and Misconduct",
      content:
        "JAIRAM enforces a strict anti-plagiarism policy. All manuscripts are screened using plagiarism detection software. A similarity index of less than 15% (excluding references) is acceptable. Plagiarism, duplicate publication, data manipulation, or other forms of misconduct will result in rejection or retraction.",
    },
    {
      icon: AlertTriangle,
      title: "Conflict of Interest and Funding",
      content:
        "Authors must disclose any financial or non-financial conflicts of interest and clearly state funding sources. If none exist, authors must declare that there is no conflict of interest.",
    },
    {
      icon: Users,
      title: "Peer Review and Editorial Ethics",
      content:
        "JAIRAM follows a double-blind peer review process. Reviewers and editors are required to maintain confidentiality, objectivity, and transparency. Editorial decisions are based solely on scientific merit and relevance.",
    },
    {
      icon: CheckCircle,
      title: "Retractions and Corrections",
      content:
        "JAIRAM follows COPE guidelines for handling corrections, retractions, and expressions of concern to maintain the integrity of the scholarly record.",
    },
    {
      icon: BookOpen,
      title: "Open Access Policy",
      content:
        "JAIRAM is an open-access journal. All published articles are distributed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), with copyright retained by the authors.",
    },
    {
      icon: Shield,
      title: "Commitment",
      content:
        "JAIRAM is dedicated to promoting ethical research practices, responsible authorship, and integrity in academic publishing in the field of acute and emergency medicine.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ethics & Policies
            </h2>
          </div>
          <p className="text-gray-600">
            JAIRAM Medical Journal upholds the highest standards of publication
            ethics and integrity in all aspects of scholarly publishing.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 sm:p-12">
          {/* Policies List */}
          <div className="space-y-10">
            {policies.map((policy, index) => {
              const Icon = policy.icon;
              return (
                <div
                  key={index}
                  className="border-b border-slate-200 last:border-0 pb-8 last:pb-0"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-start text-2xl font-semibold text-slate-900 mt-1">
                      {policy.title}
                    </h2>
                  </div>
                  <p className="text-start text-slate-700 leading-relaxed pl-14">
                    {policy.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="text-start mt-12 pt-8 border-t-2 border-blue-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Commitment to Excellence
            </h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Journal of Advanced & Integrated Research in Acute Medicine
              (JAIRAM) is committed to maintaining the highest standards of
              ethical conduct, academic integrity, and transparency in scholarly
              publishing. The journal follows internationally accepted ethical
              guidelines to ensure credibility and trust in published research.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EthicsPage;
