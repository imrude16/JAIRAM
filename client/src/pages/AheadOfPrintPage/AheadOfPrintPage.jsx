import React from "react";
import { Clock, AlertCircle, BookOpen } from "lucide-react";
import Card from "../../components/common/Card/Card";

const AheadOfPrintPage = () => {
  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800 leading-relaxed min-h-screen">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2c5f8d] mb-4">
            Published Ahead-of-Print
          </h1>
          <p className="text-lg text-gray-600">
            Discover our latest research that has been accepted for publication and is available ahead of the formal issue release.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-12">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="mb-6 p-4 bg-blue-100 rounded-full">
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Our Ahead-of-Print section is being prepared and will be available shortly.
            </p>
            <p className="text-base text-gray-500">
              Check back soon to view the latest published research articles.
            </p>
          </div>
        </Card>

        {/* Information Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  What is Ahead-of-Print?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ahead-of-Print articles are peer-reviewed, accepted manuscripts that have been published online before appearing in a formal journal issue. They are fully citable with DOIs.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Stay Updated
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Subscribe to our newsletter to receive notifications about the latest Ahead-of-Print articles as soon as they are published.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        
      </div>
    </main>
  );
};

export default AheadOfPrintPage;
