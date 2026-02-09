import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Award,
  BookOpen,
  Mail,
  Flag,
  Briefcase,
  MapPin,
  Building2,
  FileText,
  Shield,
  Code,
  ChevronDown,
  ChevronUp,
  Globe,
  Home,
} from "lucide-react";

const EditorialBoard = () => {
  const [activeSection, setActiveSection] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        activeDropdown
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const editorInChief = {
    name: "Dr. Rajiv Ratan Singh Yadav",
    degree: "MBBS, MD(Anesthesiology), PDCC (Neuro Anesthesiology)",
    designation: "Professor",
    department: "Emergency Medicine",
    institution:
      "Dr. Ram Manohar Lohia Institute of Medical Science, Lucknow, Uttar Pradesh, India",
    email: "drrajiv01@gmail.com",
    expertise:
      "Emergency Medicine, Neuro-Anesthesiology, Critical Care, Trauma & Airway Management",
  };

  const executiveEditor = {
    name: "Dr. Pradeep Kumar Yadav",
    degree: "MBBS, MD (Forensic Medicine and Toxicology)",
    designation: "Assistant Professor",
    department: "Forensic Medicine and Toxicology",
    institution:
      "Dr. Ram Manohar Lohia Institute of Medical Science, Lucknow, Uttar Pradesh, India",
    email: "dctrprdp@gmail.com",
    expertise:
      "Forensic Medicine, Clinical & Analytical Toxicology, Medico-legal Autopsy",
  };

  const managingEditor = {
    name: "Mr. Sachin Kumar Tripathi",
    designation: "Scientific Officer, Toxicology",
    department: "Forensic Medicine and Toxicology",
    institution:
      "King George's Medical University, Lucknow, Uttar Pradesh, India",
    email: "tiwarisachin498@gmail.com",
    expertise:
      "Analytical Toxicology, Drug & Poison Analysis, Emergency Toxicology, Clinical Toxicology, Instrumental Analysis (GC-MS, LC-MS), Forensic Toxicology.",
  };

  const sectionEditorsNational = [
    {
      name: "Dr. Shobhana Yadav",
      role: "Pediatrics",
      degree: "MBBS, MD (Pediatrics)",
      designation: "Consultant Paediatric",
      institution: "Uttar Pradesh Provincial Medical Service (UPPMS), Lucknow",
      email: "shobhna1234@gmail.com",
      expertise:
        "Pediatrics Medicine, Child Health Care, Neonatal Care, Preventive Pediatrics, Community Child Health",
    },
    {
      name: "Dr. Sujeet Rai",
      role: "Anaesthesiology & Critical Care",
      degree: "MBBS, MD (Anaesthesiology)",
      designation: "Professor",
      department: "Department of Anaesthesiology",
      institution:
        "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India",
      email: "drsujeetrai2gmail.com",
      expertise:
        "Anaesthesiology, Critical Care Medicine, Perioperative Management, Airway Management",
    },
    {
      name: "Dr. Beena Sachan",
      role: "Community Medicine",
      degree: "MBBS, MD (Community Medicine)",
      designation: "Professor",
      department: "Department of Community Medicine",
      institution:
        "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India",
      email: "beenasachankgmu@gmail.com",
      expertise:
        "Community Medicine, Public Health, Epidemiology, Preventive and Social Medicine",
    },
    {
      name: "Dr. Durga Prasad Singh",
      role: "Internal Medicine",
      degree: "MBBS, MD (Internal Medicine)",
      designation: "Senior Consultant Physician",
      institution: "Regency Hospital, Lucknow",
      email: "dps2704@gamil.com",
      expertise:
        "Internal Medicine, Diabetes & Metabolic Disorders, Hypertension, Cardiovascular Risk Management, Geriatric Medicine",
    },
    {
      name: "Dr. Sanjay Singh",
      role: "General Medicine",
      degree: "MBBS, MD (Internal Medicine)",
      designation: "Professor, Department of Medicine",
      department: "Department of Medicine",
      institution: "F H Medical College, Ethamadpur, Agra",
      email: "Sanjay.cbi007@gmail.com",
      expertise:
        "General Medicine, Infectious Diseases, Non-Communicable Diseases, Clinical Diagnostics, Evidence-Based Internal Medicine",
    },
    {
      name: "Dr. Nisha Chaudhary",
      role: "Microbiology",
      degree: "MBBS, MD (Microbiology)",
      designation: "Associate Professor",
      institution: "Autonomous State Medical College, Firozabad",
      email: "drnishachahar@gmail.com",
      expertise:
        "Clinical Microbiology, Bacteriology, Virology, Mycology, Parasitology, Antimicrobial",
    },
    {
      name: "Rupita Kulshrestha",
      role: "Obstetrics and Gynecology",
      degree: "MBBS, MD (Obstetrics and Gynecology)",
      designation: "Assistant Professor",
      department: "Department of Obstetrics and Gynecology",
      institution:
        "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, India",
      email: "Rupita.kulshrestha@gmail.com",
      expertise:
        "Advanced High-Risk Obstetrics; Maternal–Fetal Medicine; Complex Obstetric & Gynecologic Surgery; Obstetric Emergencies; Evidence-Based Women’s Healthcare",
    },
    {
      name: "Lt. Col. Dr. Umesh Kumar Singh",
      role: "Military & Disaster Medicine",
      degree: "MBBS, MD",
      designation: "Assistant Professor",
      institution: "Military Hospital Secunderabad ",
      email: "umesh5998@gmail.com",
      expertise:
        "Military Medicine, Emergency Care, Trauma Management, Disaster Medicine, Mass Casualty Management",
    },
    {
      name: "Dr. Deepanjali Yadav",
      role: "Dentistry & Oral Health",
      degree: "BDS",
      designation: "Medical Officer, Dental",
      department: "Department",
      institution:
        "Community Health Center, Mallawan Hardoi, Uttar Pradesh, India",
      email: "deepanjaliyadav.9@gmail.com",
      expertise:
        "Community Dentistry, Preventive Oral Health, Public Health Dentistry, Oral Health Promotion, Primary Dental Care",
    },
    {
      name: "Mr. Harsh Chauhan",
      role: "Legal Affairs",
      degree: "B.B.A, LL.B, LL.M,Masters in Forensic Sciences",
      designation: "",
      institution: "Advocate Hon’ble Allahabad High Court Lucknow Bench",
      email: "harsh_clc2000@rediffmail.com",
      expertise:
        "Criminal Law, Medico-Legal Jurisprudence, Forensic Evidence Evaluation, Trial Advocacy, Cyber & Digital Evidence",
    },
    {
      name: "Dr. Sushil Kumar Gupta",
      role: "Medico-Legal Affairs",
      degree: "MBBS, MD (Forensic Medicine)",
      designation: "HOD & Assistant Professor",
      department: "Department of Forensic Medicine",
      institution:
        "Autonomous State Medical College (ASMC), Sultanpur, Uttar Pradesh",
      email: "gsushilkumar@gmail.com",
      expertise:
        "Forensic Medicine, Medico-Legal Autopsy, Clinical Forensic Medicine, Injury Analysis, Death Investigation",
    },
    {
      name: "Dr. Aditya Kumar",
      role: "Environmental & Chemical Sciences",
      degree: "Ph.D Chemical Sciences",
      designation: "Assistant Professor",
      institution: "RSM PG College Bijnor",
      email: "adityakumarprof18@gmail.com",
      expertise:
        "Bioremediation, Environmental Chemistry, Analytical Method Development, Nanomaterials, Green Chemistry Application",
    },
    {
      name: "Dr. Sesh Nath",
      role: "General Surgery",
      degree: "MBBS, MS (General Surgery)",
      designation: "Assistant Professor",
      department: "General Surgery",
      institution:
        "Autonomous State Medical College, Amethi, Uttar Pradesh, India",
      email: "sheshnath200@gmail.com",
      expertise:
        "General Surgery, Emergency Surgical Care, Trauma Surgery, Acute Abdomen Management, Surgical Critical Care",
    },
    {
      name: "Dr.Pratishtha Sachan",
      role: "Neuro-otologist",
      degree: "MBBS, MS (ENT)",
      designation: " Consultant Neuro-otologist",
      department: "Neuro-otologist",
      institution:
        " Pravigya ENT and vertigo clinic, Sector 16, Indira Nagar, Lucknow, Uttar Pradesh, India",
      email: "sachan.prati05@gmail.com",
      expertise:
        "Vertigo and balance disorders, BPPV, Ménière’s disease, vestibular migraine, audiovestibular evaluation, vestibular rehabilitation therapy, tinnitus management, and neuro-otological assessment.",
    },
    {
      name: "Dr.Vivek Verma",
      role: "ENT (Otolaryngology)",
      degree: "MBBS, MS (ENT)",
      designation: "Consultant ENT",
      department: "ENT (Otolaryngology)",
      institution:
        "  Pravigya ENT and vertigo clinic, Sector 16, Indira Nagar, Lucknow, Uttar Pradesh, India",
      email: "vivekvermajhs@gmail.com",
      expertise:
        "Consultant ENT (Otolaryngology) with expertise in diagnosis and management of ear, nose, and throat disorders, including sinus disease, allergic rhinitis, otitis media, hearing loss, voice disorders, and endoscopic ENT procedures.",
    },
    {
      name: "Dr. Suresh Kumar Upadhyay",
      role: "Medical & Psychiatric Social Work",
      degree: "M.S.W, M.Phil., Ph.D",
      designation: "Assistant Professor",
      department: "Department Of Social Work School Of Humanities ",
      institution:
        "Maharishi University Of Information Technology, Lucknow, Uttar Pradesh, India",
      email: "sureshkumarupadhyay@gmail.com",
      expertise:
        "Community Development,Medical Social Work,Child Welfare,Women Empowerment,Disability Rehabilitation,De-addiction Services",
    },
  ];

  const sectionEditorsInternational = [
    {
      name: "Dr. Jitin Makker",
      role: "Anatomic Pathology",
      degree: "MBBS, MD (Anatomic Pathology)",
      designation: "Assistant Clinical Professor",
      department: "Director of Informatics, Anatomic Pathology, UCLA",
      institution: "UCLA Health, California, in Los Angeles",
      email: "jmakker@mednet.ucla.edu",
      expertise:
        "Anatomic Pathology, Laboratory Medicine, Digital Pathology, Medical Informatics, Diagnostic Workflow Optimization",
    },
    {
      name: "Dr. Saminda Kumara",
      role: "Disaster Medicine",
      degree: "MBBS, PDDiP (Disaster Medicine, Emergency Medicine)",
      institution: "Sri Lanka Army",
      designation: "Disaster Medicine physician",
      email: "dyskumara@gmail.com",
      expertise:
        "Disaster Medicine, Emergency Response Planning, Mass Casualty Management, Humanitarian Medicine, Global Health Emergencies",
    },
    {
      name: "Dr. Vaidehi Bhardwaj",
      role: "General Physician",
      degree: "MBBS",
      institution: "Caspian International School of Medicine",
      designation: "General Physician",
      email: "vaidehibhardwaj40@gmail.com",
      expertise:
        "Primary care, acute and chronic disease management, preventive medicine, lifestyle disorders, infectious diseases, and patient counseling.",
    },
  ];

  const scientificAdvisoryInternational = [
    {
      name: "Dr. Ravindra Singh Thakur",
      degree: "PhD, Post-Doctoral Fellow",
      designation: "designation",
      department: "Public Health",
      institution:
        "Public HealthCollege of Public Health, The Ohio State University, Columbus, OH, 43210",
      email: "ravindrast29@gmail.com",
      expertise:
        "Analytical Chemistry, Toxicology, Environmental Science, Food Chemistry, Exposure & Risk Assessment",
    },
  ];

  const scientificAdvisoryNational = [
    {
      name: "Dr. Harish Kumar Sagar",
      degree: "MBBS, MD (Pathology)",
      designation: "Scientist D (Medical)",
      department: "In-charge, Dept. Of Pathology, ICMR",
      institution:
        "National JALMA Institute for Leprosy and other Mycobacterial Diseases, Agra, India",
      email: "harish.sagar@icmr.gov.in",
      expertise:
        "Pathology, Infectious Diseases, Translational Research, Research Methodology, Biomedical Diagnostics",
    },
    {
      name: "Mr. Rohit Kumar Singh",
      degree: "Phd",
      designation: "Scientist C",
      department: "Public Health",
      institution:
        "Kalyan Singh Super Speciality Cancer Institute, Lucknow, India",
      email: "rohitksingh@kgmcindia.edu",
      expertise:
        "Epidemiology, Biostatistics, Health Systems Research, Public Health Analytics, Cancer Epidemiology",
    },
  ];

  const executivePanel = [
    {
      name: "Prof (Dr) L D Mishra",
      degree: "MD, PhD (Anesthesia), FICA, FNANC",
      designation: "State Nodal Officer (Emergency & Trauma Services in UP)",
      department: "Dept of Medical Education, Govt of UP.",
      institution:
        "Distinguished Professor (for life) of Anesthesiology at Banaras Hindu University",
      email: "ldmishra@rediffmail.com",
      expertise:
        "Anesthesiology, Emergency Medicine, Trauma Care, Critical Care, Disaster Medicine",
    },
    {
      name: "Prof (Dr) Anoop Kumar Verma",
      degree: " MBBS,MD",
      designation: "Controller of Examination,KGMU",
      additionalRole: "Professor and Head",
      department: "Department of Forensic Medicine and Toxicology",
      institution:
        "King George's Medical University,Lucknow,Uttar Pradesh,India",
      email: "vermakgmc@gmail.com",
      expertise:
        "Clinical Toxicology, Forensic Toxicology, Poisoning Management, Medico-legal",
    },
    {
      name: "Prof (Dr) Shiv Shanker Tripathi",
      degree: "MBBS, MD (Anaesthesiology), P.D.C.C. (Critical Care Medicine)",
      department: "Professor & HOD, Department of Emergency Medicine",
      institution:
        "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P., India",
      email: "shiv_shanker2@rediffmail.com",
      expertise:
        "Emergency Medicine, Critical Care, Acute Care, Trauma Management",
    },
    {
      name: "Prof (Dr) Richa Choudhary",
      degree: "MBBS, MD",
      designation: "Professor & HOD",
      department: "Department of Forensic medicine and toxicology ",
      institution:
        "Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow, U.P., India",
      email: "drricha_c@hotmail.com",
      expertise: "Forensic Medicine, Medicolegal Autopsy, Injury Analysis",
    },
    {
      name: "Prof (Dr) Keya Pandey",
      degree: "B.A., M.A., Ph.D",
      designation:
        "Professor & Head Department of Anthropology, University of Lucknow, Lucknow, UP, India",
      institution: "Honorary Librarian Tagore Library, University of Lucknow",
      email: "pandey_k@lkouniv.ac.in",
      expertise:
        "Socio-Cultural Anthropology,Ethnomedicine, Applied Anthropology, Human Population Studies",
    },
  ];

  const associateEditorsReviewPanel = [
    {
      name: "Miss Rakhi Rajput",
      degree: "PhD (Forensic Medicine and Toxicology)",
      designation: "Subject Expert (Forensic Science)",
      institution: "University of Lucknow, Lucknow, Uttar Pradesh, India",
      email: "rakhi.rajput@kgmcindia.edu",
      expertise:
        "Forensic Toxicology, DNA Profiling, Forensic Biology, Medico-Legal Research, Evidence-Based Forensic Analysis",
    },
    {
      name: "Dr. Prabha Shristha",
      degree: "BDS, MDS (Conservative Dentistry)",
      designation: "Resident Doctor",
      institution:
        "King George's Medical University, Lucknow, Uttar Pradesh, India",
      email: "prabha@kgmcindia.edu",
      expertise:
        "Vital Pulp Therapy, Root Canal Treatment (RCT), Endodontics, Conservative Dentistry, Advanced Dental Research",
    },
    {
      name: "Mrs. Anamika Tiwari",
      degree: "PhD (Allied Health Sciences)",
      designation: "Research Scholar",
      institution:
        "School of Allied Health Sciences, Sharda University, Uttar Pradesh, India",
      email: "ANAMIKAT955@gmail.com",
      expertise:
        "Fingerprint Analysis, Forensic Anthropology, Questioned Documents, Forensic Identification, Crime Scene Analysis",
    },
    {
      name: "Miss Shweta Parashar",
      degree: "PhD (CSIR-Central Institute of Medicinal and Aromatic Plants)",
      designation: "Examiner of patents and Design",
      institution:
        "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM), India",
      email: "shwetap.ipo@gov.in",
      expertise:
        "Medicinal & Aromatic Plants, Intellectual Property Rights, Patent Examination, Technology Transfer, Innovation Policy",
    },
    {
      name: "Miss Shalini Jaiswal",
      degree: "Phd (Biostatics)",
      designation: "Statistical Expert (JAIRAM Journal)",
      institution: "Institute",
      email: "E-Mail",
      expertise:
        "Biostatistics, Advanced Statistical Modeling, Medical Data Analysis, Research Methodology, Clinical Trial Statistics, Epidemiology",
    },
    {
      name: "Miss. Shambhawi Sandilya",
      designation: "PhD Scholar and Teaching Assistant",
      department: "School of Computer Science and Engineering (CSE)",
      institution: "KIIT University, Bhubaneswar, Odisha",
      email: "shambhawi2599@gmail.com",
      expertise:
        "Artificial Intelligence and Machine Learning, Multimedia Forensics",
    },
  ];

  const technicalTeam = [
    {
      role: "Technical Editor",
      members: [
        {
          name: "Mr. Krishn Praddhumn",
          degree: "Research Associate",
          institution: "Research Associate CSIR-IITR Lucknow",
        },
      ],
      experties:
        "Manuscript formatting, XML (JATS) preparation, reference checking; production workflow coordination.",
    },
    {
      role: "Language & Copy Editor",
      members: [
        {
          name: "Dr. Sakshi Singh",
          degree: "PhD (Behavioral Science)",
          institution: "University of Lucknow, Lucknow, India",
        },
      ],
      experties:
        "Scientific language editing, academic writing support, preparation of PMC-compliant PDF and XML files",
    },
    {
      role: "Publishing & Administration",
      members: [
        {
          name: "Mr. Pranay Chaturvedi",
          institution: "University of Lucknow, India",
        },
      ],
      experties:
        "Journal administration, governance coordination, policy implementation",
    },
    {
      role: "Ethics & Research Integrity Committee",
      members: [
        {
          name: "Ms. Dristi Singh",
          designation: "PhD Scholar",
          institution: "National Law University (NLU), Lucknow, India",
        },
        {
          name: "Ms. Dipti Chaurasia",
          degree: "Master's in Forensic Science",
          institution: "University of Lucknow, India",
        },
      ],
      experties:
        "Plagiarism screening, publication ethics oversight, compliance with COPE guidelines, research integrity review",
    },

    {
      role: "Research & Editorial Support",
      members: [
        {
          name: "Ms. Gargi Mishra",
        },
        {
          name: "Ms. Sakshi Tripathi",
        },
        {
          name: "Ms. Sakshi Srivastava",
        },
        {
          name: "Ms. Shruti Shukla",
        },
        {
          name: "Ms. Vanshika Srivastava",
        },
      ],
      experties:
        "Research assistance, data handling, manuscript tracking, editorial and peer-review support",
    },
    {
      role: "Web & Data Security Administration",
      members: [
        {
          name: "Arpit Kumar Tiwari",
          degree: "B.Tech (Computer Science & Engineering)",
        },
        {
          name: "Vatsala Shukla",
          degree:
            "B.Tech (Computer Science with Specialization in Artificial Intelligence & Machine Learning)",
        },
        {
          name: "Deovrat Singh",
          degree:
            "B.Tech (Computer Science with Specialization in Artificial Intelligence & Machine Learning)",
        },
      ],
      experties:
        "Website administration, journal hosting, data security, backup and recovery management",
    },
  ];

  const sections = [
    { id: "editor-in-chief", label: "Editor-in-Chief" },
    { id: "executive", label: "Executive Editor" },
    { id: "managing", label: "Managing Editor" },
    {
      id: "section-editors",
      label: "Section Editors",
      hasDropdown: true,
      dropdownItems: [
        {
          id: "section-natl",
          label: "National Section Editors",
          icon: Flag,
          description: "Experts from leading national institutions",
        },
        {
          id: "section-intl",
          label: "International Section Editors",
          icon: Globe,
          description: "Global experts and thought leaders",
        },
      ],
    },
    {
      id: "advisory-committee",
      label: "Advisory Committee",
      hasDropdown: true,
      dropdownItems: [
        {
          id: "advisory-natl",
          label: "National Scientific Advisory",
          icon: Flag,
          description: "National experts and local leaders",
          color: "green",
        },
        {
          id: "advisory-intl",
          label: "International Scientific Advisory",
          icon: Globe,
          description: "Global experts and thought leaders",
          color: "blue",
        },
        {
          id: "executive-panel",
          label: "Executive Advisory Panel",
          icon: Briefcase,
          description: "Senior leadership and strategic decision-makers",
          color: "amber",
        },
      ],
    },
    { id: "associate-editors", label: "Associate Editors" },
    { id: "technical", label: "Technical Team" },
  ];

  const DropdownButton = ({ item, isActive, onClick }) => {
    const Icon = item.icon;
    const colorClasses = {
      green: "text-green-500 group-hover:text-green-600",
      blue: "text-blue-500 group-hover:text-blue-600",
      amber: "text-amber-500 group-hover:text-amber-600",
    };

    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start transition-colors duration-150 group px-4 py-3 hover:bg-stone-50 ${
          isActive
            ? "bg-blue-50 border-blue-300 shadow-sm"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            colorClasses[item.color] ||
            "text-gray-500 group-hover:text-gray-600"
          } mr-3 mt-0.5 transition-colors`}
        />
        <div className="text-start">
          <div className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">
            {item.label}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {item.description}
          </div>
        </div>
      </button>
    );
  };

  const MemberCard = ({ member, colorScheme = "blue" }) => (
    <div className="p-6 text-start hover:bg-gray-50 transition-all duration-300 border-b border-gray-200 last:border-b-0">
      <div className="mb-3">
        <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
        <p className={`text-${colorScheme}-600 font-semibold text-sm mt-1`}>
          {member.degree}
        </p>
        {member.designation && (
          <p className="text-gray-700 font-medium text-sm mt-1">
            {member.designation}
          </p>
        )}
        {member.additionalRole && (
          <p className="text-gray-600 text-sm mt-0.5 italic">
            {member.additionalRole}
          </p>
        )}
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        {member.institution && (
          <div className="flex items-start gap-2">
            <Building2
              className={`w-4 h-4 text-${colorScheme}-600 mt-0.5 shrink-0`}
            />
            <div>
              <p className="font-medium">{member.department}</p>
              <p className="text-gray-600">{member.institution}</p>
            </div>
          </div>
        )}
        {member.email && (
          <div className="flex items-center gap-2">
            <Mail className={`w-4 h-4 text-${colorScheme}-600 shrink-0`} />
            <a
              href={`mailto:${member.email}`}
              className={`text-${colorScheme}-600 hover:underline`}
            >
              {member.email}
            </a>
          </div>
        )}

        {member.expertise && (
          <div className="flex items-start gap-2">
            <Award
              className={`w-4 h-4 text-${colorScheme}-600 mt-0.5 shrink-0`}
            />
            <p className="text-start text-gray-600 italic">
              {member.expertise}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const isDropdownActive = (section) => {
    if (!section.hasDropdown) return false;
    return section.dropdownItems.some((item) => item.id === activeSection);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 top-0 z-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto relative">
            {sections.map((section) => (
              <div key={section.id} className="relative">
                {section.hasDropdown ? (
                  <button
                    onClick={() => {
                      setActiveDropdown(
                        activeDropdown === section.id ? null : section.id,
                      );
                    }}
                    className={`px-4 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-300 text-sm flex items-center gap-1 ${
                      activeDropdown === section.id || isDropdownActive(section)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {section.label}
                    {activeDropdown === section.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      setActiveDropdown(null);
                    }}
                    className={`px-4 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-300 text-sm ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {section.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dropdown menu */}
        {activeDropdown && (
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-160 top-full mt-1 w-70 bg-white rounded-b-lg shadow-xl border border-stone-200 overflow-hidden animate-fade-in"
          >
            {sections
              .find((s) => s.id === activeDropdown)
              ?.dropdownItems.map((item) => (
                <DropdownButton
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setActiveDropdown(null);
                  }}
                />
              ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Editorial Board
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our editorial board comprises distinguished experts from leading
            institutions worldwide, committed to advancing medical research and
            maintaining the highest publication standards.
          </p>
        </div>

        {/* Editor-in-Chief */}
        {(activeSection === "all" || activeSection === "editor-in-chief") && (
          <section className="mb-8 w-lg mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6" />
                Editor-in-Chief
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-blue-600 rounded-b-lg shadow-lg">
              <MemberCard member={editorInChief} colorScheme="blue" />
            </div>
          </section>
        )}

        {/* Executive Editor */}
        {(activeSection === "all" || activeSection === "executive") && (
          <section className="mb-8 w-lg mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Executive Editor
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-indigo-600 rounded-b-lg shadow-lg">
              <MemberCard member={executiveEditor} colorScheme="indigo" />
            </div>
          </section>
        )}

        {/* Managing Editor */}
        {(activeSection === "all" || activeSection === "managing") && (
          <section className="mb-8 w-lg mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Managing Editor
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-purple-600 rounded-b-lg shadow-lg">
              <MemberCard member={managingEditor} colorScheme="purple" />
            </div>
          </section>
        )}

        {/* Section Editors - National */}
        {activeSection === "section-natl" && (
          <section className="mb-8 w-full animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {sectionEditorsNational.map((editor, index) => (
                <div
                  key={index}
                  className="flex flex-col h-full"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Header section for each editor */}
                  <div className="bg-linear-to-r from-pink-600 to-pink-700 text-white rounded-t-lg px-4 py-3 shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2 truncate">
                      <Flag className="w-5 h-5 shrink-0" />
                      <span className="truncate">{editor.role}</span>
                    </h3>
                  </div>

                  {/* Card content */}
                  <div className="bg-white border-l-4 border-r-4 border-b-4 border-pink-600 rounded-b-lg shadow-lg flex-1">
                    <MemberCard member={editor} colorScheme="pink" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Editors - International */}
        {activeSection === "section-intl" && (
          <section className="mb-8 w-full animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {sectionEditorsInternational.map((editor, index) => (
                <div
                  key={index}
                  className="flex flex-col h-full"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Header section for each editor */}
                  <div className="bg-linear-to-r from-pink-600 to-pink-700 text-white rounded-t-lg px-4 py-3 shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2 truncate">
                      <Globe className="w-5 h-5 shrink-0" />
                      <span className="truncate">{editor.role}</span>
                    </h3>
                  </div>

                  {/* Card content */}
                  <div className="bg-white border-l-4 border-r-4 border-b-4 border-pink-600 rounded-b-lg shadow-lg flex-1">
                    <MemberCard member={editor} colorScheme="pink" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scientific Advisory Committee - International */}
        {(activeSection === "all" || activeSection === "advisory-intl") && (
          <section className="mb-8 w-xl mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-teal-600 to-teal-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
                <Globe className="w-6 h-6" />
                International Scientific Committee
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-teal-600 rounded-b-lg shadow-lg">
              {scientificAdvisoryInternational.map((member, index) => (
                <div
                  key={index}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <MemberCard member={member} colorScheme="teal" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scientific Advisory Committee - National */}
        {(activeSection === "all" || activeSection === "advisory-natl") && (
          <section className="mb-8 w-xl mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl gap-2 font-bold flex items-center whitespace-nowrap">
                <Flag className="w-6 h-6" />
                National Scientific Committee
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-cyan-600 rounded-b-lg shadow-lg">
              {scientificAdvisoryNational.map((member, index) => (
                <div
                  key={index}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <MemberCard member={member} colorScheme="cyan" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Executive Advisory Panel */}
        {(activeSection === "all" || activeSection === "executive-panel") && (
          <section className="mb-8 w-xl mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl gap-2 font-bold flex items-center whitespace-nowrap">
                <Briefcase className="w-6 h-6" />
                Excutive Advisory Panel
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-cyan-600 rounded-b-lg shadow-lg">
              {executivePanel.map((member, index) => (
                <div
                  key={index}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <MemberCard member={member} colorScheme="cyan" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Associate Editors & Review Panel */}
        {(activeSection === "all" || activeSection === "associate-editors") && (
          <section className="mb-8 w-lg mx-auto my-auto animate-fade-in">
            <div className="bg-linear-to-r from-green-600 to-green-700 text-white rounded-t-lg px-6 py-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6" />
                Associate Editors & Review Panel
              </h3>
            </div>
            <div className="bg-white border-l-4 border-r-4 border-b-4 border-green-600 rounded-b-lg shadow-lg">
              {associateEditorsReviewPanel.map((member, index) => (
                <div
                  key={index}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <MemberCard member={member} colorScheme="green" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical & Publishing Team */}
        {activeSection === "technical" && (
          <section className="mb-8 w-full animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {technicalTeam.map((team, index) => (
                <div
                  key={index}
                  className="flex flex-col h-full"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="bg-linear-to-r from-gray-700 to-gray-800 text-white rounded-t-lg px-4 py-3 shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2 truncate">
                      <Code className="w-5 h-5 shrink-0" />
                      <span className="truncate">{team.role}</span>
                    </h3>
                  </div>

                  <div className="bg-white border-l-4 border-r-4 border-b-4 border-gray-700 rounded-b-lg shadow-lg flex-1">
                    {team.members?.map((member, memberIndex) => (
                      <div key={memberIndex}>
                        <MemberCard member={member} colorScheme="gray" />
                      </div>
                    ))}
                    {team.experties && (
                      <div className="px-6 pb-6 pt-2  border-gray-200">
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-start text-gray-600 italic">
                            {team.experties}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditorialBoard;
