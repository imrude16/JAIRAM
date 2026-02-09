import React from "react";
import { ShieldCheck, Building2, Gavel } from "lucide-react";
import Card from "../../components/common/Card/Card";

const SectionBlock = ({ title, icon: Icon, children, color }) => (
  <Card className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-[#2c5f8d]">{title}</h3>
    </div>
    <div className="border-l-4 border-blue-200 pl-4">{children}</div>
  </Card>
);

const PoweredTrustPage = () => {
  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800 leading-relaxed min-h-screen">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <h1 className="text-4xl text-[#2c5f8d] mb-6 font-bold border-b pb-3">
          Ownership & Management
        </h1>

        {/* Intro */}
        <Card className="mb-12 bg-blue-50 border border-blue-100">
          <p className="text-lg text-gray-700 leading-loose">
            Transparency in ownership, governance, and editorial independence is
            fundamental to maintaining the integrity and credibility of the
            Journal of Advanced & Integrated Research in Acute Medicine
            (JAIRAM).
          </p>
        </Card>

        {/* Owner / Publisher */}
        <SectionBlock
          title="Owner / Publisher"
          icon={ShieldCheck}
          color="bg-blue-600"
        >
          <p className="text-lg text-gray-700 leading-loose">
            The Journal of Advanced & Integrated Research in Acute Medicine
            (JAIRAM) is owned and published by{" "}
            <strong>Nexus Biomedical Research Foundation Trust</strong>, a
            non-profit academic trust.
          </p>
        </SectionBlock>

        {/* Legal Status */}
        <SectionBlock
          title="Legal Status & Registration"
          icon={Building2}
          color="bg-green-600"
        >
          <p className="text-lg text-gray-700 leading-loose">
            Nexus Biomedical Research Foundation Trust is registered under the
            Indian Trusts Act, 1882, in 2025 (Registration No.{" "}
            <strong>202501041059811</strong>), with jurisdiction in
            <strong> Lucknow, Uttar Pradesh, India</strong>.
          </p>
        </SectionBlock>

        {/* Governance */}
        <SectionBlock
          title="Governance & Editorial Independence"
          icon={Gavel}
          color="bg-purple-600"
        >
          <p className="text-lg text-gray-700 leading-loose">
            The Trust provides administrative and financial oversight only. All
            editorial decisions, peer review, and publication processes are
            carried out independently by the Editorial Board in accordance with
            the journal’s Ethics & Publishing Policy and international standards
            including <strong>COPE, ICMJE, and WAME</strong>.
          </p>
        </SectionBlock>
      </div>
    </main>
  );
};

export default PoweredTrustPage;
