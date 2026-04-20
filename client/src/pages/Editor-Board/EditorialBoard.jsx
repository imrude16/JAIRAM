import React, { useState, useEffect } from "react";
import {
  Award, Users, FileText, Flag, Globe, Briefcase, Code, Building2, Mail, X,
} from "lucide-react";

const SECTIONS = [
  {
    id: "editor-in-chief",
    label: "Editor-in-Chief",
    icon: Award,
    color: "blue",
    members: [
      {
        name: "Dr. Rajiv Ratan Singh Yadav",
        degree: "MBBS, MD(Anesthesiology), PDCC (Neuro Anesthesiology)",
        designation: "Professor",
        department: "Emergency Medicine",
        institution: "Dr. Ram Manohar Lohia Institute of Medical Science, Lucknow, Uttar Pradesh, India",
        email: "drrajiv01@gmail.com",
        expertise: "Emergency Medicine, Neuro-Anesthesiology, Critical Care, Trauma & Airway Management",
      },
    ],
  },
  {
    id: "executive",
    label: "Executive Editor",
    icon: Users,
    color: "indigo",
    members: [
      {
        name: "Dr. Pradeep Kumar Yadav",
        degree: "MBBS, MD (Forensic Medicine and Toxicology)",
        designation: "Assistant Professor",
        department: "Forensic Medicine and Toxicology",
        institution: "Dr. Ram Manohar Lohia Institute of Medical Science, Lucknow, Uttar Pradesh, India",
        email: "dctrprdp@gmail.com",
        expertise: "Forensic Medicine, Clinical & Analytical Toxicology, Medico-legal Autopsy",
      },
    ],
  },
  {
    id: "managing",
    label: "Managing Editor",
    icon: FileText,
    color: "purple",
    members: [
      {
        name: "Mr. Sachin Kumar Tripathi",
        designation: "Scientific Officer, Toxicology",
        department: "Forensic Medicine and Toxicology",
        institution: "King George's Medical University, Lucknow, Uttar Pradesh, India",
        email: "tiwarisachin498@gmail.com",
        expertise: "Analytical Toxicology, Drug & Poison Analysis, Emergency Toxicology, Clinical Toxicology, Instrumental Analysis (GC-MS, LC-MS), Forensic Toxicology.",
      },
    ],
  },
  {
    id: "section-natl",
    label: "National Section Editors",
    icon: Flag,
    color: "pink",
    members: [
      { name: "Dr. Shobhana Yadav", role: "Pediatrics", degree: "MBBS, MD (Pediatrics)", designation: "Consultant Paediatric", institution: "Uttar Pradesh Provincial Medical Service (UPPMS), Lucknow", email: "shobhna1234@gmail.com", expertise: "Pediatrics Medicine, Child Health Care, Neonatal Care, Preventive Pediatrics, Community Child Health" },
      { name: "Dr. Sujeet Rai", role: "Anaesthesiology & Critical Care", degree: "MBBS, MD (Anaesthesiology)", designation: "Professor", department: "Department of Anaesthesiology", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India", email: "drsujeetrai2gmail.com", expertise: "Anaesthesiology, Critical Care Medicine, Perioperative Management, Airway Management" },
      { name: "Dr. Beena Sachan", role: "Community Medicine", degree: "MBBS, MD (Community Medicine)", designation: "Professor", department: "Department of Community Medicine", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India", email: "beenasachankgmu@gmail.com", expertise: "Community Medicine, Public Health, Epidemiology, Preventive and Social Medicine" },
      { name: "Dr. Arpita Singh", role: "Pharmacology", degree: "MBBS, MD, Pharmacology", designation: "Professor and Head", department: "Pharmacology", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P, India", email: "drarpitasingh21@gmail.com", expertise: "Clinical Pharmacology including Pharmacovigilance, Tuberculosis & Respiratory Diseases, Diabetes Mellitus, Anti-Microbial Resistance, Cancer Therapeutics" },
      { name: "Dr. Ajay Kumar Verma", role: "Respiratory Medicine", degree: "MBBS, MD(Respiratory Medicine)", designation: "Professor and Head", department: "Respiratory Medicine", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P, India", email: "drajay21@gmail.com", expertise: "Tuberculosis and other infectious lung diseases, Airway Disorders (Asthma & COPD), Interstitial Lung Diseases, Lung Cancer & Immunology, Pulmonary Rehabilitation & Yoga, Sleep & Metabolic Disorders" },
      { name: "Dr. Durga Prasad Singh", role: "Internal Medicine", degree: "MBBS, MD (Internal Medicine)", designation: "Senior Consultant Physician", institution: "Regency Hospital, Lucknow", email: "dps2704@gamil.com", expertise: "Internal Medicine, Diabetes & Metabolic Disorders, Hypertension, Cardiovascular Risk Management, Geriatric Medicine" },
      { name: "Dr. Sanjay Singh", role: "General Medicine", degree: "MBBS, MD (Internal Medicine)", designation: "Professor, Department of Medicine", department: "Department of Medicine", institution: "F H Medical College, Ethamadpur, Agra", email: "Sanjay.cbi007@gmail.com", expertise: "General Medicine, Infectious Diseases, Non-Communicable Diseases, Clinical Diagnostics, Evidence-Based Internal Medicine" },
      { name: "Dr. Nisha Chaudhary", role: "Microbiology", degree: "MBBS, MD (Microbiology)", designation: "Associate Professor", institution: "Autonomous State Medical College, Firozabad", email: "drnishachahar@gmail.com", expertise: "Clinical Microbiology, Bacteriology, Virology, Mycology, Parasitology, Antimicrobial" },
      { name: "Rupita Kulshrestha", role: "Obstetrics and Gynecology", degree: "MBBS, MD (Obstetrics and Gynecology)", designation: "Assistant Professor", department: "Department of Obstetrics and Gynecology", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India", email: "Rupita.kulshrestha@gmail.com", expertise: "Advanced High-Risk Obstetrics; Maternal–Fetal Medicine; Complex Obstetric & Gynecologic Surgery; Obstetric Emergencies; Evidence-Based Women's Healthcare" },
      { name: "Lt. Col. Dr. Umesh Kumar Singh", role: "Military & Disaster Medicine", degree: "MBBS, MD", designation: "Assistant Professor", institution: "Military Hospital Secunderabad", email: "umesh5998@gmail.com", expertise: "Military Medicine, Emergency Care, Trauma Management, Disaster Medicine, Mass Casualty Management" },
      { name: "Dr. Deepanjali Yadav", role: "Dentistry & Oral Health", degree: "BDS", designation: "Medical Officer, Dental", department: "Department", institution: "Community Health Center, Mallawan Hardoi, Uttar Pradesh, India", email: "deepanjaliyadav.9@gmail.com", expertise: "Community Dentistry, Preventive Oral Health, Public Health Dentistry, Oral Health Promotion, Primary Dental Care" },
      { name: "Mr. Harsh Chauhan", role: "Legal Affairs", degree: "B.B.A, LL.B, LL.M, Masters in Forensic Sciences", institution: "Advocate Hon'ble Allahabad High Court Lucknow Bench", email: "harsh_clc2000@rediffmail.com", expertise: "Criminal Law, Medico-Legal Jurisprudence, Forensic Evidence Evaluation, Trial Advocacy, Cyber & Digital Evidence" },
      { name: "Dr. Sushil Kumar Gupta", role: "Medico-Legal Affairs", degree: "MBBS, MD (Forensic Medicine)", designation: "HOD & Assistant Professor", department: "Department of Forensic Medicine", institution: "Autonomous State Medical College (ASMC), Sultanpur, Uttar Pradesh", email: "gsushilkumar@gmail.com", expertise: "Forensic Medicine, Medico-Legal Autopsy, Clinical Forensic Medicine, Injury Analysis, Death Investigation" },
      { name: "Dr. Aditya Kumar", role: "Environmental & Chemical Sciences", degree: "Ph.D Chemical Sciences", designation: "Assistant Professor", institution: "RSM PG College Bijnor", email: "adityakumarprof18@gmail.com", expertise: "Bioremediation, Environmental Chemistry, Analytical Method Development, Nanomaterials, Green Chemistry Application" },
      { name: "Dr. Sesh Nath", role: "General Surgery", degree: "MBBS, MS (General Surgery)", designation: "Assistant Professor", department: "General Surgery", institution: "Autonomous State Medical College, Amethi, Uttar Pradesh, India", email: "sheshnath200@gmail.com", expertise: "General Surgery, Emergency Surgical Care, Trauma Surgery, Acute Abdomen Management, Surgical Critical Care" },
      { name: "Dr. Pratishtha Sachan", role: "Neuro-otologist", degree: "MBBS, MS (ENT)", designation: "Consultant Neuro-otologist", department: "Neuro-otologist", institution: "Pravigya ENT and vertigo clinic, Sector 16, Indira Nagar, Lucknow, Uttar Pradesh, India", email: "sachan.prati05@gmail.com", expertise: "Vertigo and balance disorders, BPPV, Ménière's disease, vestibular migraine, audiovestibular evaluation, vestibular rehabilitation therapy, tinnitus management, and neuro-otological assessment." },
      { name: "Dr. Vivek Verma", role: "ENT (Otolaryngology)", degree: "MBBS, MS (ENT)", designation: "Consultant ENT", department: "ENT (Otolaryngology)", institution: "Pravigya ENT and vertigo clinic, Sector 16, Indira Nagar, Lucknow, Uttar Pradesh, India", email: "vivekvermajhs@gmail.com", expertise: "Consultant ENT (Otolaryngology) with expertise in diagnosis and management of ear, nose, and throat disorders, including sinus disease, allergic rhinitis, otitis media, hearing loss, voice disorders, and endoscopic ENT procedures." },
      { name: "Dr. Suresh Kumar Upadhyay", role: "Medical & Psychiatric Social Work", degree: "M.S.W, M.Phil., Ph.D", designation: "Assistant Professor", department: "Department Of Social Work School Of Humanities", institution: "Maharishi University Of Information Technology, Lucknow, Uttar Pradesh, India", email: "sureshkumarupadhyay@gmail.com", expertise: "Community Development, Medical Social Work, Child Welfare, Women Empowerment, Disability Rehabilitation, De-addiction Services" },
    ],
  },
  {
    id: "section-intl",
    label: "International Section Editors",
    icon: Globe,
    color: "teal",
    members: [
      { name: "Dr. Jitin Makker", role: "Anatomic Pathology", degree: "MBBS, MD (Anatomic Pathology)", designation: "Assistant Clinical Professor", department: "Director of Informatics, Anatomic Pathology, UCLA", institution: "UCLA Health, California, in Los Angeles", email: "jmakker@mednet.ucla.edu", expertise: "Anatomic Pathology, Laboratory Medicine, Digital Pathology, Medical Informatics, Diagnostic Workflow Optimization" },
      { name: "Dr. Saminda Kumara", role: "Disaster Medicine", degree: "MBBS, PDDiP (Disaster Medicine, Emergency Medicine)", institution: "Sri Lanka Army", designation: "Disaster Medicine physician", email: "dyskumara@gmail.com", expertise: "Disaster Medicine, Emergency Response Planning, Mass Casualty Management, Humanitarian Medicine, Global Health Emergencies" },
      { name: "Dr. Vaidehi Bhardwaj", role: "General Physician", degree: "MBBS", institution: "Caspian International School of Medicine", designation: "General Physician", email: "vaidehibhardwaj40@gmail.com", expertise: "Primary care, acute and chronic disease management, preventive medicine, lifestyle disorders, infectious diseases, and patient counseling." },
    ],
  },
  {
    id: "advisory-intl",
    label: "International Scientific Advisory",
    icon: Globe,
    color: "cyan",
    members: [
      { name: "Dr. Ravindra Singh Thakur", degree: "PhD, Post-Doctoral Fellow", designation: "designation", department: "Public Health", institution: "Public Health College of Public Health, The Ohio State University, Columbus, OH, 43210", email: "ravindrast29@gmail.com", expertise: "Analytical Chemistry, Toxicology, Environmental Science, Food Chemistry, Exposure & Risk Assessment" },
    ],
  },
  {
    id: "advisory-natl",
    label: "National Scientific Advisory",
    icon: Flag,
    color: "green",
    members: [
      { name: "Dr. Biswajeet Thakur", degree: "Ph.D", designation: "Scientist F", department: "Micropalaeontology", institution: "Birbal Sahni Institute of Palaeosciences, Lucknow, India", email: "biswajeet_thakur@bsip.res.in", expertise: "Micropalaeontology, biostratigraphy, palynology, diatoms, paleoenvironment, Quaternary geology" },
      { name: "Dr. Harish Kumar Sagar", degree: "MBBS, MD (Pathology)", designation: "Scientist D (Medical)", department: "In-charge, Dept. Of Pathology, ICMR", institution: "National JALMA Institute for Leprosy and other Mycobacterial Diseases, Agra, India", email: "harish.sagar@icmr.gov.in", expertise: "Pathology, Infectious Diseases, Translational Research, Research Methodology, Biomedical Diagnostics" },
      { name: "Mr. Rohit Kumar Singh", degree: "PhD", designation: "Scientist C", department: "Public Health", institution: "Kalyan Singh Super Speciality Cancer Institute, Lucknow, India", email: "rohitksingh@kgmcindia.edu", expertise: "Epidemiology, Biostatistics, Health Systems Research, Public Health Analytics, Cancer Epidemiology" },
    ],
  },
  {
    id: "executive-panel",
    label: "Executive Advisory Panel",
    icon: Briefcase,
    color: "amber",
    members: [
      { name: "Prof (Dr) L D Mishra", degree: "MD, PhD (Anesthesia), FICA, FNANC", designation: "State Nodal Officer (Emergency & Trauma Services in UP)", department: "Dept of Medical Education, Govt of UP.", institution: "Distinguished Professor (for life) of Anesthesiology at Banaras Hindu University", email: "ldmishra@rediffmail.com", expertise: "Anesthesiology, Emergency Medicine, Trauma Care, Critical Care, Disaster Medicine" },
      { name: "Prof (Dr) Anoop Kumar Verma", degree: "MBBS, MD", designation: "Controller of Examination, KGMU", additionalRole: "Professor and Head", department: "Department of Forensic Medicine and Toxicology", institution: "King George's Medical University, Lucknow, Uttar Pradesh, India", email: "vermakgmc@gmail.com", expertise: "Clinical Toxicology, Forensic Toxicology, Poisoning Management, Medico-legal" },
      { name: "Prof (Dr) Shiv Shanker Tripathi", degree: "MBBS, MD (Anaesthesiology), P.D.C.C. (Critical Care Medicine)", department: "Professor & HOD, Department of Emergency Medicine", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P., India", email: "shiv_shanker2@rediffmail.com", expertise: "Emergency Medicine, Critical Care, Acute Care, Trauma Management" },
      { name: "Prof (Dr) Richa Choudhary", degree: "MBBS, MD", designation: "Professor & HOD", department: "Department of Forensic medicine and toxicology", institution: "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P., India", email: "drricha_c@hotmail.com", expertise: "Forensic Medicine, Medicolegal Autopsy, Injury Analysis" },
      { name: "Prof (Dr) Keya Pandey", degree: "B.A., M.A., Ph.D", designation: "Professor & Head Department of Anthropology, University of Lucknow, Lucknow, UP, India", institution: "Honorary Librarian Tagore Library, University of Lucknow", email: "pandey_k@lkouniv.ac.in", expertise: "Socio-Cultural Anthropology, Ethnomedicine, Applied Anthropology, Human Population Studies" },
    ],
  },
  {
    id: "associate-editors",
    label: "Associate Editors & Review Panel",
    icon: Award,
    color: "emerald",
    members: [
      { name: "Miss Rakhi Rajput", degree: "PhD (Forensic Medicine and Toxicology)", designation: "Subject Expert (Forensic Science)", institution: "University of Lucknow, Lucknow, Uttar Pradesh, India", email: "rakhi.rajput@kgmcindia.edu", expertise: "Forensic Toxicology, DNA Profiling, Forensic Biology, Medico-Legal Research, Evidence-Based Forensic Analysis" },
      { name: "Dr. Prabha Shristha", degree: "BDS, MDS (Conservative Dentistry)", designation: "Resident Doctor", institution: "King George's Medical University, Lucknow, Uttar Pradesh, India", email: "prabha@kgmcindia.edu", expertise: "Vital Pulp Therapy, Root Canal Treatment (RCT), Endodontics, Conservative Dentistry, Advanced Dental Research" },
      { name: "Mrs. Anamika Tiwari", degree: "PhD (Allied Health Sciences)", designation: "Research Scholar", institution: "School of Allied Health Sciences, Sharda University, Uttar Pradesh, India", email: "ANAMIKAT955@gmail.com", expertise: "Fingerprint Analysis, Forensic Anthropology, Questioned Documents, Forensic Identification, Crime Scene Analysis" },
      { name: "Miss Shweta Parashar", degree: "PhD (CSIR-Central Institute of Medicinal and Aromatic Plants)", designation: "Examiner of patents and Design", institution: "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM), India", email: "shwetap.ipo@gov.in", expertise: "Medicinal & Aromatic Plants, Intellectual Property Rights, Patent Examination, Technology Transfer, Innovation Policy" },
      { name: "Miss Shalini Jaiswal", degree: "PhD (Biostatics)", designation: "Statistical Expert (JAIRAM Journal)", institution: "Institute", email: "E-Mail", expertise: "Biostatistics, Advanced Statistical Modeling, Medical Data Analysis, Research Methodology, Clinical Trial Statistics, Epidemiology" },
      { name: "Miss. Shambhawi Sandilya", designation: "PhD Scholar and Teaching Assistant", department: "School of Computer Science and Engineering (CSE)", institution: "KIIT University, Bhubaneswar, Odisha", email: "shambhawi2599@gmail.com", expertise: "Artificial Intelligence and Machine Learning, Multimedia Forensics" },
    ],
  },
  {
    id: "technical",
    label: "Technical Team",
    icon: Code,
    color: "gray",
    isTechnical: true,
    members: [
      { name: "Mr. Krishn Praddhumn", role: "Technical Editor", degree: "Research Associate", institution: "Research Associate CSIR-IITR Lucknow", expertise: "Manuscript formatting, XML (JATS) preparation, reference checking; production workflow coordination." },
      { name: "Dr. Sakshi Singh", role: "Language & Copy Editor", degree: "PhD (Behavioral Science)", institution: "University of Lucknow, Lucknow, India", expertise: "Scientific language editing, academic writing support, preparation of PMC-compliant PDF and XML files" },
      { name: "Mr. Pranay Chaturvedi", role: "Publishing & Administration", institution: "University of Lucknow, India", expertise: "Journal administration, governance coordination, policy implementation" },
      { name: "Ms. Dristi Singh", role: "Ethics & Research Integrity Committee", designation: "PhD Scholar", institution: "National Law University (NLU), Lucknow, India", expertise: "Plagiarism screening, publication ethics oversight, compliance with COPE guidelines, research integrity review" },
      { name: "Ms. Dipti Chaurasia", role: "Ethics & Research Integrity Committee", degree: "Master's in Forensic Science", institution: "University of Lucknow, India", expertise: "Plagiarism screening, publication ethics oversight, compliance with COPE guidelines, research integrity review" },
      { name: "Ms. Gargi Mishra", role: "Research & Editorial Support", expertise: "Research assistance, data handling, manuscript tracking, editorial and peer-review support" },
      { name: "Ms. Sakshi Tripathi", role: "Research & Editorial Support", expertise: "Research assistance, data handling, manuscript tracking, editorial and peer-review support" },
      { name: "Ms. Sakshi Srivastava", role: "Research & Editorial Support", expertise: "Research assistance, data handling, manuscript tracking, editorial and peer-review support" },
      { name: "Ms. Shruti Shukla", role: "Research & Editorial Support", expertise: "Research assistance, data handling, manuscript tracking, editorial and peer-review support" },
      { name: "Ms. Vanshika Srivastava", role: "Research & Editorial Support", expertise: "Research assistance, data handling, manuscript tracking, editorial and peer-review support" },
      { name: "Deovrat Singh", role: "Web & Data Security Administration", degree: "B.Tech (Computer Science with Specialization in Artificial Intelligence & Machine Learning)", expertise: "Website administration, journal hosting, data security, backup and recovery management" },
      { name: "Vatsala Shukla", role: "Web & Data Security Administration", degree: "B.Tech (Computer Science with Specialization in Artificial Intelligence & Machine Learning)", expertise: "Website administration, journal hosting, data security, backup and recovery management" },
    ],
  },
];

const COLOR_STYLES = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: "text-blue-600",    badge: "bg-blue-100 text-blue-700" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  icon: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-700" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: "text-purple-600",  badge: "bg-purple-100 text-purple-700" },
  pink:    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    icon: "text-pink-600",    badge: "bg-pink-100 text-pink-700" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    icon: "text-teal-600",    badge: "bg-teal-100 text-teal-700" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    icon: "text-cyan-600",    badge: "bg-cyan-100 text-cyan-700" },
  green:   { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   icon: "text-green-600",   badge: "bg-green-100 text-green-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: "text-amber-600",   badge: "bg-amber-100 text-amber-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  gray:    { bg: "bg-gray-100",   text: "text-gray-700",    border: "border-gray-200",    icon: "text-gray-600",    badge: "bg-gray-200 text-gray-700" },
};

const EditorialBoard = () => {
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setOpenSection(null); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const activeSection = SECTIONS.find((s) => s.id === openSection);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Editorial Board</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Our editorial board comprises distinguished experts from leading institutions worldwide,
            committed to advancing medical research and maintaining the highest publication standards.
          </p>
        </div>

        {/* Section Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
          {SECTIONS.map((section) => {
            const c = COLOR_STYLES[section.color];
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setOpenSection(section.id)}
                className={`group relative flex flex-col items-start text-left p-6 rounded-xl border ${c.border} bg-white hover:${c.bg} transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                  {section.label}
                </h3>
                <p className="text-xs text-gray-500">
                  {section.members.length} member{section.members.length !== 1 ? "s" : ""}
                </p>
                <span className={`mt-4 text-xs font-medium px-2.5 py-1 rounded-full ${c.badge}`}>
                  View details
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {openSection && activeSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenSection(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            {(() => {
              const c = COLOR_STYLES[activeSection.color];
              const Icon = activeSection.icon;
              return (
                <>
                  <div className={`flex items-center gap-4 px-6 py-5 border-b border-gray-100`}>
                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900">{activeSection.label}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activeSection.members.length} member{activeSection.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setOpenSection(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                    {activeSection.members.map((member, idx) => (
                      <div key={idx} className="px-6 py-6 text-left">
                        <div className="mb-4 space-y-1 text-left">
                          <h4 className="text-base font-semibold text-gray-900 leading-tight">{member.name}</h4>
                          {member.role && (
                            <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${c.badge}`}>
                              {member.role}
                            </span>
                          )}
                          {member.degree && (
                            <p className={`text-sm font-medium mt-1 ${c.text}`}>{member.degree}</p>
                          )}
                          {member.designation && (
                            <p className="text-sm text-gray-600 mt-0.5">{member.designation}</p>
                          )}
                          {member.additionalRole && (
                            <p className="text-sm text-gray-500 italic mt-0.5">{member.additionalRole}</p>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          {(member.department || member.institution) && (
                            <div className="flex items-start gap-3">
                              <Building2 className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                              <div>
                                {member.department && <p className="text-gray-700 font-medium">{member.department}</p>}
                                {member.institution && <p className="text-gray-500">{member.institution}</p>}
                              </div>
                            </div>
                          )}
                          {member.email && member.email !== "E-Mail" && (
                            <div className="flex items-center gap-3 mt-1">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a href={`mailto:${member.email}`} className={`${c.text} hover:underline`}>
                                {member.email}
                              </a>
                            </div>
                          )}
                          {member.expertise && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {member.expertise.split(/[,;]+/).map((tag, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default EditorialBoard;