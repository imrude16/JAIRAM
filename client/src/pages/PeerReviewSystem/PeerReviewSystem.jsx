import React from "react";
import { FileCheck, Users, Clock, Shield } from "lucide-react";

export default function PeerReviewSystem() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <h1 className="text-2xl font-bold">Peer Review System</h1>
          <p className="mt-1 text-blue-100">
            Ensuring Excellence in Medical Research Publication
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction Section */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Overview of Our Peer Review Process
          </h2>
          <p className="text-start text-gray-700 leading-relaxed mb-4">
            Our medical journal employs a rigorous double-blind peer review
            system to ensure the highest standards of scientific integrity and
            quality in all published research. This process is fundamental to
            maintaining the credibility and reliability of medical literature,
            protecting both researchers and readers from flawed or biased
            research findings.
          </p>
        </section>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-center text-xl font-semibold text-gray-900">
                Double-Blind Review
              </h3>
            </div>
            <p className="text-start text-gray-700 leading-relaxed">
              The Journal of Advanced & Integrated Research in Acute Medicine
              (JAIRAM) follows a rigorous double-blind peer review process to
              ensure the quality, integrity, and scientific validity of
              published articles.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-center text-xl font-semibold text-gray-900">
                Expert Reviewers
              </h3>
            </div>
            <p className="text-start text-gray-700 leading-relaxed">
              All submitted manuscripts undergo an initial editorial screening
              for scope, formatting, ethical compliance, and plagiarism
              (similarity index less than 15%, excluding references). Suitable
              manuscripts are then reviewed by at least two independent expert
              reviewers, with both author and reviewer identities kept
              confidential.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-center text-xl font-semibold text-gray-900">
                Timely Process
              </h3>
            </div>
            <p className="text-start text-gray-700 leading-relaxed">
              We are committed to efficient manuscript handling while
              maintaining thorough evaluation standards. Authors receive regular
              updates on their submission status, and we work diligently to
              minimize delays in the review process without compromising
              quality.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FileCheck className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-center text-xl font-semibold text-gray-900">
                Comprehensive Evaluation
              </h3>
            </div>
            <p className="text-start text-gray-700 leading-relaxed">
              Reviewers evaluate manuscripts for originality, methodology,
              ethical standards, clarity, and relevance to acute medicine. Based
              on reviewer recommendations, authors may be asked to revise their
              manuscripts. The final publication decision is made by the
              Editor-in-Chief or Handling Editor.
            </p>
          </div>
        </div>

        {/* Commitment Section */}
        <section className="bg-blue-50 rounded-lg p-6 md:p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment to Quality
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JAIRAM is committed to a fair, transparent, and timely review
            process, adhering to COPE and ICMJE guidelines to maintain the
            highest standards of academic publishing.
          </p>
        </section>
      </main>
    </div>
  );
}
