import React from "react";
import { Award, Target, Users, Globe } from "lucide-react";
import Card from "../../components/common/Card/Card";

const AboutPage = () => {
  const features = [
    {
      icon: Award,
      title: "Excellence in Publishing",
      description:
        "Committed to maintaining the highest standards in medical research publication.",
    },
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To advance medical knowledge and improve patient care through rigorous peer-reviewed research.",
    },
    {
      icon: Users,
      title: "Expert Editorial Board",
      description:
        "Led by internationally recognized experts in various medical specialties.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Publishing research from authors worldwide with impact across continents.",
    },
  ];

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800 leading-relaxed min-h-screen">
      <div className="mx-auto">
        <h1 className="text-4xl text-[#2c5f8d] mb-2 font-bold pb-4">
          About the Journal
        </h1>

        <Card className="mb-12">
          <p className="text-lg text-[#555] leading-loose mb-2 text-start">
            The Journal of Advanced and Integrated Research in Acute Medicine
            (JAIRAM) is an international, peer-reviewed, open-access journal
            committed to the dissemination of high-quality, ethically sound, and
            clinically relevant research across the spectrum of acute and
            integrated healthcare sciences. The journal’s mission is to advance
            evidence-based medical practice, foster interdisciplinary
            collaboration, and promote innovation that improves patient outcomes
            in emergency and acute care settings worldwide.
          </p>
          <p className="text-lg text-[#555] leading-loose mb-2 text-start">
            The journal welcomes original research articles, systematic reviews,
            meta-analyses, case reports, short communications, and
            evidence-based perspectives that demonstrate scientific rigor,
            ethical compliance, and relevance to clinical practice and
            population health.
          </p>
        </Card>

        <h1 className="text-4xl text-[#2c5f8d] mb-2 font-bold pb-4">
          Scope Of the Journal
        </h1>

        <Card className="mb-12">
          <p className="text-lg text-[#555] leading-loose mb-2 text-start">
            The Journal of Advanced and Integrated Research in Acute Medicine
            (JAIRAM) is a peer-reviewed, open-access international journal that
            publishes high-quality research across all divisions of medical,
            health, and biomedical sciences. The journal encompasses, but is not
            limited to, Emergency Medicine, Critical Care, Internal Medicine and
            its subspecialties, Surgery, Anesthesiology, Pediatrics, Obstetrics
            and Gynecology, Dentistry, Pathology, Microbiology, Pharmacology,
            Toxicology, Public Health, Epidemiology, Forensic Medicine,
            Biomedical and Translational Sciences, Allied Health Sciences,
            Environmental and Occupational Health, Disaster Medicine, Health
            Policy, Medical Ethics, and interdisciplinary clinical research.
          </p>
        </Card>

        <h1 className="text-4xl text-[#2c5f8d] mb-2 font-bold pb-4">
          Aim Of the Journal
        </h1>

        <Card className="mb-12">
          <p className="text-lg text-[#555] leading-loose mb-2 text-start">
            The aim of JAIRAM is to publish original, methodologically rigorous,
            and impactful scholarly work that enhances understanding, diagnosis,
            management, and prevention of acute and critical medical conditions.
            The journal encourages clinical, translational, and
            interdisciplinary research that bridges basic sciences, clinical
            medicine, public health, and healthcare policy. JAIRAM is dedicated
            to maintaining transparency, fairness, and timeliness in the
            peer-review process while adhering to internationally accepted
            standards of publication ethics.
          </p>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 my-10">
          {features.map((feature, index) => (
            <Card
              key={index}
              hover
              className="bg-white mb-20 rounded-xl p-8 text-center shadow-lg  border border-gray-200 flex flex-col items-center 
                          hover:-translate-y-3 hover:shadow-2xl hover:border-blue-700 transition-transform duration-300 
                          ease-in-out group-hover:scale-[1.1] group-hover:rotate-[5deg]"
            >
              <div className="w-full h-full mx-auto mb-6 flex text-black items-center justify-center transition-all duration-400 ease-in-out">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl text-[#2c3e50] mb-4 font-bold">
                  {feature.title}
                </h3>
                <p className="text-[#666] leading-relaxed text-sm grow">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
