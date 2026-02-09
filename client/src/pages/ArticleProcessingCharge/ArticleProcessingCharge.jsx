import React from "react";

export default function ArticleProcessingCharge() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <h1 className="text-2xl font-bold">Article Processing Charges</h1>
          <p className="mt-1 text-blue-100">Publication fees for open access</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10 lg:p-12 space-y-10">
            {/* Introduction */}
            <section className="border-l-4 border-blue-500 pl-6 bg-blue-50 bg-opacity-40 py-6 pr-6 rounded-r-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-blue-600">●</span>
                Overview
              </h2>
              <p className="text-start text-gray-700 leading-relaxed text-lg">
                The Journal of Integrated and Advanced Research in Acute
                Medicine (JAIRAM) is a peer-reviewed, open-access journal. An
                Article Processing Charge (APC) is payable only after final
                acceptance of the manuscript. No submission fee is charged, and
                APCs do not influence editorial or peer-review decisions.All
                published articles are licensed under CC BY 4.0.
              </p>
            </section>

            {/* APC Structure */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-blue-600">●</span>
                Article Processing Fee (Post-Acceptance)
              </h2>

              <p className="text-start text-gray-700 leading-relaxed text-lg mb-4">
                <h2 className="font-bold mb-1">
                  ● INR 10,000 (≈ USD 120 / EUR 110)
                </h2>{" "}
                Original Research Articles, Case Reports, Case Series, Clinical
                Trials <br />
                <h2 className="mt-5 font-bold">
                  ● ₹6,000 (≈ USD 75 / EUR 65)
                </h2>{" "}
                Review Articles, Systematic Reviews, Meta-Analyses, Editorials
              </p>
              <section className="border-l-4 border-gray-500 pl-6 bg-blue-50 bg-opacity-40 py-6 pr-6 rounded-r-lg">
                <p className="text-start text-gray-700 leading-relaxed text-lg">
                  USD/EUR values are indicative and subject to prevailing
                  exchange rates at the time of payment.
                </p>
              </section>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Waivers and Discounts */}
            <section className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 border border-green-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-green-600">●</span>
                Waivers and Discounts
              </h2>
              <p className="text-start text-gray-700 leading-relaxed text-lg mb-5">
                JAIRAM may grant <strong>full or partial APC waivers</strong> to
                author from{" "}
                <strong>low- and lower-middle-income countries,</strong>{" "}
                early-career researchers or students with limited funding,
                invited contributors, and for manuscript of significant
                scientific or public health importance.
              </p>
              <p className="text-start text-gray-700 leading-relaxed text-lg">
                Waiver requests must be submitted{" "}
                <strong>at the time of manuscript submission</strong> and are
                considered on a <strong>case-by-case basis.</strong> Granting of
                waivers does{" "}
                <strong>not influence editorial peer-review decisions</strong>
              </p>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Payment Process */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-blue-600">●</span>
                Payment Process
              </h2>
              <p className="text-start text-gray-700 leading-relaxed text-lg mb-5">
                Payment details are communicated to the corresponding author
                upon acceptance. JAIRAM follows transparent and ethical
                open-access publishing practices.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
