import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Users,
  Lock,
  Globe,
  DollarSign,
} from "lucide-react";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      question: "Is JAIRAM a peer-reviewed journal?",
      answer: "Yes. JAIRAM follows a double-blind peer review process.",
      category: "review",
      icon: Users,
    },
    {
      question: "Is JAIRAM an open-access journal?",
      answer: "Yes. JAIRAM is a fully open-access international journal.",
      category: "access",
      icon: Globe,
    },
    {
      question: "What types of articles does JAIRAM publish?",
      answer:
        "Original research, reviews, case reports, short communications, clinical images, letters, and editorials.",
      category: "content",
      icon: FileText,
    },
    {
      question: "What is the scope of the journal?",
      answer:
        "Emergency medicine, acute care, critical care, trauma, toxicology, internal medicine, and integrated biomedical sciences.",
      category: "content",
      icon: FileText,
    },
    {
      question: "What language should manuscripts be written in?",
      answer:
        "English (UK or US), with consistent usage throughout the manuscript.",
      category: "submission",
      icon: FileText,
    },
    {
      question: "Does JAIRAM require ethical approval?",
      answer:
        "Yes. Ethical committee approval and informed consent are mandatory where applicable.",
      category: "ethics",
      icon: Lock,
    },
    {
      question: "What referencing style is used?",
      answer: "JAIRAM follows the Vancouver referencing style.",
      category: "submission",
      icon: FileText,
    },
    {
      question: "What is the plagiarism limit?",
      answer:
        "The acceptable similarity index is below 15%, excluding references.",
      category: "ethics",
      icon: Lock,
    },
    {
      question: "Are there submission or publication charges?",
      answer:
        "There are no submission charges. Article Processing Charges (APC), if applicable, are communicated after acceptance.",
      category: "fees",
      icon: DollarSign,
    },
    {
      question: "How can authors submit their manuscripts?",
      answer:
        "Manuscripts can be submitted through the online submission system or via the official journal email address.",
      category: "submission",
      icon: FileText,
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categoryColors = {
    review: "bg-blue-50 border-blue-200",
    access: "bg-green-50 border-green-200",
    content: "bg-purple-50 border-purple-200",
    submission: "bg-orange-50 border-orange-200",
    ethics: "bg-red-50 border-red-200",
    fees: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      -{/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">Find answers to common questions</p>
        </div>
        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "shadow-lg" : "shadow-sm hover:shadow-md"
                } ${categoryColors[faq.category]} bg-white`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-6 h-6 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-start px-6 pb-4 pt-2">
                    <div className="pl-9 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-600">
            If you need further assistance, please contact our editorial team
            through the journal's official email address or visit our contact
            page.
          </p>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
