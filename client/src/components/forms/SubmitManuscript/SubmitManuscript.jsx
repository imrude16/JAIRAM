import React, { useState, useEffect } from "react";
import {
  Upload,
  Send,
  Save,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  User,
  Mail,
  Building,
  BookOpen,
  Tag,
  DollarSign,
  Shield,
  Loader,
  ChevronRight,
  ArrowLeft,
  Phone,
  Globe,
  Briefcase,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileDown,
} from "lucide-react";

const checklistQuestions = [
  "Have you read and verified author instructions?",
  "Is this manuscript seen, reviewed, and approved by all contributing authors?",
  "Is your manuscript compliant with ethical standards?",
  "Do you have any conflicts of interest?",
  "Tables: Are references cited in numerical order and sources mentioned and cited in text?",
  "Figures: Are sources mentioned, legends added, and cited in text?",
  "Does your submission include data from patients or research participants?",
  "If yes, have you obtained appropriate consent?",
  "Is the first or corresponding author a Nexus Biomedical Research Foundation Trust member?",
];

// Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl  p-6 ${className}`}>{children}</div>
);

// Input Component
const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${
          Icon ? "pl-12" : "pl-4"
        } pr-4 py-3 border-2 rounded-lg transition-all duration-200 outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-gray-200 outline-none"
        }`}
      />
    </div>
    {error && (
      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Button Component
const Button = ({ children, icon: Icon, loading, ...props }) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
    outline: "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    success:
      "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
        variants[props.variant || "primary"]
      } ${props.className || ""}`}
    >
      {loading ? (
        <Loader className="w-5 h-5 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// Progress Steps Component
const ProgressSteps = ({ currentStep, steps }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                index < currentStep
                  ? "bg-green-500 text-white scale-110 shadow-lg"
                  : index === currentStep
                    ? "bg-blue-600 text-white scale-110 shadow-lg animate-pulse"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                index === currentStep ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 transition-all duration-500 ${
                index < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// File Upload Component
const FileUpload = ({
  label,
  file,
  onChange,
  accept,
  required,
  description,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="animate-slideUp">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      )}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-50 scale-105"
            : file
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => e.target.files[0] && onChange(e.target.files[0])}
          className="hidden"
          id={`upload-${label}`}
        />

        {file ? (
          <div className="animate-fadeIn">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3 animate-bounce" />
            <p className="text-green-700 font-semibold mb-2">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <label htmlFor={`upload-${label}`}>
              <span className="inline-flex items-center px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-lg cursor-pointer hover:bg-green-50 transition-all">
                <Upload className="w-4 h-4 mr-2" />
                Change File
              </span>
            </label>
          </div>
        ) : (
          <div>
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-bounce" />
            <p className="text-gray-700 font-medium mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label htmlFor={`upload-${label}`}>
              <span className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md">
                <FileText className="w-4 h-4 mr-2" />
                Browse Files
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Submission Successful!
          </h3>
          <p className="text-gray-600 mb-6">
            Your manuscript has been submitted successfully. You will receive a
            confirmation email shortly with your submission ID.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Submission ID:</strong>JAIRAM-2026
              {Math.floor(Math.random() * 10000)}
            </p>
          </div>
          <Button onClick={onClose} variant="primary" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const SubmitManuscript = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [authorCount, setAuthorCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    articleType: "",
    title: "",
    abstract: "",
    keywords: "",
    conflictOfInterest: "",
    funding: "",
  });
  const wordCount = formData.abstract
    ? formData.abstract.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const [checklistAnswers, setChecklistAnswers] = useState(
    checklistQuestions.map(() => ""),
  );

  const [files, setFiles] = useState({
    coverLetter: null,
    blindManuscript: null,
    images: [],
    supplements: null,
  });

  const [authors, setAuthors] = useState([
    {
      id: Date.now(),
      title: "Dr.",
      name: "",
      email: "",
      phone: "",
      country: "",
      department: "",
      affiliation: "",
      isCorresponding: true,
    },
  ]);
  useEffect(() => {
    setAuthorCount(authors.length);
  }, [authors]);
  const generateAuthors = () => {
    const list = Array.from({ length: authorCount }, (_, i) => ({
      id: Date.now() + i,
      title: "Dr.",
      name: "",
      email: "",
      phone: "",
      country: "",
      department: "",
      affiliation: "",
      isCorresponding: i === 0,
    }));
    setAuthors(list);
  };

  const updateAuthor = (index, field, value) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  const handleImagesUpload = (newFiles) => {
    const selected = Array.from(newFiles);
    const combined = [...files.images, ...selected].slice(0, 10);

    setFiles({ ...files, images: combined });
  };
  const handleTablesUpload = (newFiles) => {
    const uploaded = Array.from(newFiles);
    setFiles((prev) => ({
      ...prev,
      tables: [...(prev.tables || []), ...uploaded].slice(0, 8), // Keeps it under 8
    }));
  };
  const setCorrespondingAuthor = (index) => {
    const updated = authors.map((a, i) => ({
      ...a,
      isCorresponding: i === index,
    }));
    setAuthors(updated);
  };

  const deleteAuthor = (id) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((a) => a.id !== id));
    }
  };

  const moveAuthor = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= authors.length) return;
    const updated = [...authors];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setAuthors(updated);
  };
  const addNewAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: Date.now(),
        title: "Dr.",
        name: "",
        email: "",
        phone: "",
        country: "",
        department: "",
        affiliation: "",
        isCorresponding: false,
      },
    ]);
  };

  const steps = [
    "Check-list Section",
    "Basic Info",
    "Author Details",
    "Upload Files",
    "Review & Submit",
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      const allAnswered = checklistAnswers.every((v) => v !== "");
      if (!allAnswered) {
        newErrors.checklist = "Please answer all checklist questions.";
      }
    } else if (step === 1) {
      if (!formData.articleType)
        newErrors.articleType = "Please select article type";
      if (!formData.title) newErrors.title = "Title is required";
      const wordCount = formData.abstract.split(" ").filter((w) => w).length;

      if (wordCount === 0) {
        newErrors.abstract = "Abstract is required";
      } else if (wordCount > 250) {
        newErrors.abstract = "Abstract must not exceed 250 words";
      }
      if (!formData.keywords) newErrors.keywords = "Keywords are required";
    } else if (step === 2) {
      // Validate authors array
      if (!authors || authors.length === 0) {
        newErrors.authors = "At least one author is required";
      } else {
        // Check if at least one author has a name
        const hasAuthorName = authors.some(
          (author) => author.name && author.name.trim() !== "",
        );
        if (!hasAuthorName) {
          newErrors.authors = "At least one author name is required";
        }
        // Check if there's a corresponding author with email
        const correspondingAuthor = authors.find(
          (author) => author.isCorresponding,
        );
        if (!correspondingAuthor) {
          newErrors.correspondingAuthor =
            "Please mark at least one author as corresponding author";
        } else if (
          !correspondingAuthor.email ||
          !/\S+@\S+\.\S+/.test(correspondingAuthor.email)
        ) {
          newErrors.correspondingAuthor =
            "Corresponding author must have a valid email";
        }
      }
    } else if (step === 3) {
      if (!files.blindManuscript)
        newErrors.blindManuscript = "Manuscript file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Functions for Review Section (Step 4) only - to open and download files
  const handleOpenFile = (file) => {
    if (!file) return;

    // Create a blob URL for the file and open it in a new tab
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");

    // Clean up the URL after a delay (when the tab is likely closed)
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleDownloadFile = (file, fileName) => {
    if (!file) return;

    // Create a blob URL for the file
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setShowSuccess(true);

    // Reset form after successful submission
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentStep(0);
      setFormData({
        articleType: "",
        title: "",
        authors: "",
        email: "",
        affiliation: "",
        abstract: "",
        keywords: "",
        conflictOfInterest: "",
        funding: "",
      });

      setFiles({
        blindManuscript: null,
        coverLetter: null,
        images: [],
        supplements: null,
      });
    }, 3000);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData);
    alert("Draft saved successfully!");
  };

  return (
    <div className="py-12 px-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <Send className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Submit Your Manuscript
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of researchers publishing groundbreaking work. Our
            peer review process ensures quality and integrity.
          </p>
        </div>

        <Card className="animate-slideUp">
          <ProgressSteps currentStep={currentStep} steps={steps} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 0: Checklist */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Manuscript Submission Checklist
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Please complete the following submission checklist questions
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="p-3 text-left">Questions</th>
                        <th className="p-3 text-center">Yes</th>
                        <th className="p-3 text-center">No</th>
                        <th className="p-3 text-center">Not Applicable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklistQuestions.map((q, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-gray-700">
                            {q}{" "}
                            <span className="text-red-500 font-bold">*</span>
                          </td>
                          {["Yes", "No", "Not Applicable"].map((option) => (
                            <td key={option} className="text-center">
                              <input
                                type="radio"
                                name={`checklist-${index}`}
                                value={option}
                                checked={checklistAnswers[index] === option}
                                onChange={() => {
                                  const updated = [...checklistAnswers];
                                  updated[index] = option;
                                  setChecklistAnswers(updated);
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {errors.checklist && (
                    <p className="text-sm text-red-600 mt-3 flex items-center animate-fadeIn">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.checklist}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Article Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.articleType}
                    onChange={(e) =>
                      handleInputChange("articleType", e.target.value)
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${
                      errors.articleType
                        ? "border-red-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  >
                    <option value="">Select article type</option>
                    <option value="original">Original Research Article</option>
                    <option value="review">Review Article</option>
                    <option value="case">Case Study/Report</option>
                    <option value="clinical">Clinical Trial</option>
                    <option value="meta">Meta-Analysis</option>
                  </select>
                  {errors.articleType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.articleType}
                    </p>
                  )}
                </div>

                <Input
                  label="Article Title"
                  placeholder="Enter the full title of your manuscript"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  icon={FileText}
                  required
                  error={errors.title}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Abstract (250 words) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Not more than 250 words"
                    value={formData.abstract}
                    onChange={(e) =>
                      handleInputChange("abstract", e.target.value)
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${
                      errors.abstract
                        ? "border-red-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`text-sm font-medium ${
                        wordCount === 0
                          ? "text-gray-400"
                          : wordCount >= 250
                            ? "text-red-600"
                            : wordCount >= 230
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {wordCount} / 250 words
                    </p>

                    {errors.abstract && (
                      <p className="text-sm text-red-600 flex items-center animate-fadeIn">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.abstract}
                      </p>
                    )}
                  </div>
                </div>

                <Input
                  label="Keywords (Not more than 6 keywords)"
                  placeholder="Enter keywords separated by commas"
                  value={formData.keywords}
                  onChange={(e) =>
                    handleInputChange("keywords", e.target.value)
                  }
                  icon={Tag}
                  required
                  error={errors.keywords}
                />
              </div>
            )}

            {/* Step 2: Author Details */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Author Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Add authors. One must be marked as corresponding author.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                    Total Authors: {authors.length}
                  </div>
                </div>

                {/* Authors */}
                <div className="space-y-12">
                  {authors.map((author, index) => (
                    <div
                      key={author.id}
                      className="border border-gray-200 rounded-xl px-6 py-6 space-y-6"
                    >
                      {/* Author header */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                            {index + 1}
                          </div>

                          <span className="text-sm font-medium text-gray-700">
                            Author {index + 1}
                          </span>

                          {author.isCorresponding && (
                            <span className="ml-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                              Corresponding Author
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {/* Reorder buttons */}
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => moveAuthor(index, -1)}
                              disabled={index === 0}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                              title="Move up"
                            >
                              ▲
                            </button>

                            <button
                              type="button"
                              onClick={() => moveAuthor(index, 1)}
                              disabled={index === authors.length - 1}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                              title="Move down"
                            >
                              ▼
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCorrespondingAuthor(index)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Set as corresponding author
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAuthor(author.id)}
                            disabled={authors.length === 1}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div>
                          <label className="text-xs text-gray-500">Title</label>
                          <select
                            value={author.title}
                            onChange={(e) =>
                              updateAuthor(index, "title", e.target.value)
                            }
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          >
                            <option>Dr.</option>
                            <option>Prof.</option>
                            <option>Mr.</option>
                            <option>Ms.</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">
                            Full name
                          </label>
                          <input
                            type="text"
                            value={author.name}
                            onChange={(e) =>
                              updateAuthor(index, "name", e.target.value)
                            }
                            placeholder="Enter full name"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">
                            Email address
                          </label>
                          <input
                            type="email"
                            value={author.email}
                            onChange={(e) =>
                              updateAuthor(index, "email", e.target.value)
                            }
                            placeholder="email@example.com"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">Phone</label>
                          <input
                            type="text"
                            value={author.phone}
                            onChange={(e) =>
                              updateAuthor(index, "phone", e.target.value)
                            }
                            placeholder="Phone number"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">
                            Country
                          </label>
                          <input
                            type="text"
                            value={author.country}
                            onChange={(e) =>
                              updateAuthor(index, "country", e.target.value)
                            }
                            placeholder="Country"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">
                            Department
                          </label>
                          <input
                            type="text"
                            value={author.department}
                            onChange={(e) =>
                              updateAuthor(index, "department", e.target.value)
                            }
                            placeholder="Department"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add author */}
                <button
                  type="button"
                  onClick={addNewAuthor}
                  className="mx-auto block px-6 py-3 border border-dashed rounded-xl text-blue-600 hover:bg-blue-50 transition"
                >
                  + Add Co-Author
                </button>

                {/* Errors */}
                {errors.authors && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.authors}
                  </p>
                )}

                {errors.correspondingAuthor && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.correspondingAuthor}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Upload Files */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Upload className="w-6 h-6 mr-2 text-blue-600" />
                  Upload Files
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Mandatory: All Figures and Tables must be clearly labeled
                  (e.g., Fig 1, Table 1) and numbered sequentially in the order
                  they are cited in the manuscript.
                </p>

                {/* 1. Cover Letter */}
                <FileUpload
                  label="Cover Letter"
                  file={files.coverLetter}
                  onChange={(file) => {
                    if (file && !file.name.match(/\.(doc|docx)$/i)) {
                      alert(
                        "Warning: Only Word files (.doc, .docx) are accepted.",
                      );
                      return;
                    }
                    setFiles({ ...files, coverLetter: file });
                  }}
                  accept=".doc,.docx"
                  description="Upload cover letter (Word only)"
                />

                {/* 2. Blind Manuscript */}
                <FileUpload
                  label="Blind Manuscript File"
                  file={files.blindManuscript}
                  onChange={(file) => {
                    if (file && !file.name.match(/\.(doc|docx)$/i)) {
                      alert(
                        "Warning: Only Word files (.doc, .docx) are accepted.",
                      );
                      return;
                    }
                    setFiles({ ...files, blindManuscript: file });
                    if (errors.blindManuscript)
                      setErrors({ ...errors, blindManuscript: "" });
                  }}
                  accept=".doc,.docx"
                  required
                  description="Upload manuscript (Word only, Max 25MB)"
                />

                {/* 3. Figures */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Figures <span className="text-gray-400">(Max 6)</span>
                    <p className="text-xs text-gray-500 mt-2">
                      Word files only · Max 6 files
                    </p>
                  </label>

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition bg-gray-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImagesUpload(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-blue-500" />
                      <p className="text-gray-700 font-medium">
                        Drag & drop Figures (Word)
                      </p>
                      <label className="cursor-pointer">
                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                          Browse
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            const isInvalid = selected.some(
                              (f) => !f.name.match(/\.(doc|docx)$/i),
                            );
                            if (isInvalid)
                              return alert(
                                "Only Word files allowed for Figures.",
                              );
                            if (files.images.length + selected.length > 6)
                              return alert("Max 6 figures allowed.");
                            handleImagesUpload(e.target.files);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Uploaded: <strong>{files.images.length}</strong> / 6
                  </div>
                </div>

                {/* 4. Tables - FIXED LOGIC */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tables <span className="text-gray-400">(Max 8)</span>
                    <p className="text-xs text-gray-500 mt-2">
                      Word files only · Max 8 files
                    </p>
                  </label>

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition bg-gray-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      // Use your generic handler or a specific one for tables
                      handleTablesUpload(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-blue-500" />
                      <p className="text-gray-700 font-medium">
                        Drag & drop Tables (Word)
                      </p>
                      <label className="cursor-pointer">
                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                          Browse
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            const isInvalid = selected.some(
                              (f) => !f.name.match(/\.(doc|docx)$/i),
                            );
                            if (isInvalid)
                              return alert(
                                "Only Word files allowed for Tables.",
                              );

                            // Check against limit 8
                            if (
                              (files.tables?.length || 0) + selected.length >
                              8
                            ) {
                              return alert("Maximum 8 tables allowed.");
                            }

                            // Ensure your 'handleTablesUpload' function updates 'files.tables' specifically
                            if (typeof handleTablesUpload === "function") {
                              handleTablesUpload(e.target.files);
                            } else {
                              // Fallback: manually update state if a dedicated handler doesn't exist
                              const newTables = [
                                ...(files.tables || []),
                                ...selected,
                              ];
                              setFiles({ ...files, tables: newTables });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Uploaded: <strong>{files.tables?.length || 0}</strong> / 8
                  </div>
                </div>

                {/* 5. Supplementary Files */}
                <FileUpload
                  label="Supplementary Files"
                  file={files.supplements}
                  onChange={(file) => {
                    if (file && !file.name.match(/\.(doc|docx)$/i)) {
                      alert("Warning: Only Word files are accepted.");
                      return;
                    }
                    setFiles({ ...files, supplements: file });
                  }}
                  accept=".doc,.docx"
                  description="Optional datasets (Word only)"
                />

                {/* Info box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    File Guidelines
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • All uploads must be <strong>Word (.doc, .docx)</strong>
                    </li>
                    <li>• Max 6 Figures / Max 8 Tables</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Review & Additional Info */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-blue-600" />
                  Review & Additional Information
                </h2>

                {/* Review Uploaded Documents Section - Only in Step 4 */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Review Uploaded Documents
                  </h3>
                  <div className="space-y-4">
                    {/* Cover Letter Preview */}
                    {files.coverLetter && (
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between">
                        <div
                          className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleOpenFile(files.coverLetter)}
                          title="Click to open/preview document"
                        >
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Cover Letter
                            </p>
                            <p className="text-sm text-gray-500 truncate w-64">
                              {files.coverLetter.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(files.coverLetter.size / 1024 / 1024).toFixed(
                                2,
                              )}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(
                                files.coverLetter,
                                files.coverLetter.name,
                              );
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                            title="Download Document"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles({ ...files, coverLetter: null });
                            }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110"
                            title="Remove Document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Blind Manuscript Preview */}
                    {files.blindManuscript && (
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between">
                        <div
                          className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleOpenFile(files.blindManuscript)}
                          title="Click to open/preview document"
                        >
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Blind Manuscript
                            </p>
                            <p className="text-sm text-gray-500 truncate w-64">
                              {files.blindManuscript.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(
                                files.blindManuscript.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(
                                files.blindManuscript,
                                files.blindManuscript.name,
                              );
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                            title="Download Document"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles({ ...files, blindManuscript: null });
                            }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110"
                            title="Remove Document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Figures Preview */}
                    {files.images && files.images.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Figures Preview
                        </h4>
                        {files.images.map((imageFile, index) => (
                          <div
                            key={`figure-${index}`}
                            className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between"
                          >
                            <div
                              className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleOpenFile(imageFile)}
                              title="Click to open/preview Figure"
                            >
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  Figure {index + 1}
                                </p>
                                <p className="text-sm text-gray-500 truncate w-64">
                                  {imageFile.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(imageFile, imageFile.name);
                                }}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                title="Download Figure"
                              >
                                <FileDown className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = files.images.filter(
                                    (_, i) => i !== index,
                                  );
                                  setFiles({ ...files, images: updated });
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                title="Remove Figure"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Tables Preview */}
                    {files.tables && files.tables.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Tables Preview
                        </h4>
                        {files.tables.map((tableFile, index) => (
                          <div
                            key={`table-${index}`}
                            className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-green-300 transition-all flex items-center justify-between"
                          >
                            <div
                              className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleOpenFile(tableFile)}
                              title="Click to open/preview Table"
                            >
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  Table {index + 1}
                                </p>
                                <p className="text-sm text-gray-500 truncate w-64">
                                  {tableFile.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {(tableFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(tableFile, tableFile.name);
                                }}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                title="Download Table"
                              >
                                <FileDown className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = files.tables.filter(
                                    (_, i) => i !== index,
                                  );
                                  setFiles({ ...files, tables: updated });
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                title="Remove Table"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Supplements Preview */}
                    {files.supplements && (
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between">
                        <div
                          className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleOpenFile(files.supplements)}
                          title="Click to open/preview document"
                        >
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Supplements
                            </p>
                            <p className="text-sm text-gray-500 truncate w-64">
                              {files.supplements.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(files.supplements.size / 1024 / 1024).toFixed(
                                2,
                              )}{" "}
                              MB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(
                                files.supplements,
                                files.supplements.name,
                              );
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                            title="Download Document"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Corrected: Now correctly targeting supplements
                              setFiles({ ...files, supplements: null });
                            }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110"
                            title="Remove Document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* No files message */}
                    {!files.coverLetter &&
                      !files.blindManuscript &&
                      (!files.images || files.images.length === 0) &&
                      !files.supplements && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>
                            No files uploaded yet. Please go back to step 4 to
                            upload files.
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Conflict of Interest Statement
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      rows={4}
                      placeholder="Declare any conflicts of interest or state 'None'"
                      value={formData.conflictOfInterest}
                      onChange={(e) =>
                        handleInputChange("conflictOfInterest", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funding Information
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      rows={4}
                      placeholder="List all funding sources or state 'None'"
                      value={formData.funding}
                      onChange={(e) =>
                        handleInputChange("funding", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded focus:ring-4 focus:ring-blue-100"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I confirm that this manuscript is{" "}
                      <strong>original</strong>, has not been published
                      elsewhere, and is not under consideration by another
                      journal. I agree to the journal's
                      <strong> terms and conditions</strong>, including the peer
                      review process and
                      <strong> publication ethics</strong> guidelines.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  icon={ArrowLeft}
                  className="sm:w-auto"
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={Send}
                    className="flex-1"
                  >
                    {loading ? "Submitting..." : "Submit Manuscript"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-gray-600 mb-2">Need help with your submission?</p>
          <button className="text-blue-600 font-semibold hover:underline">
            View Submission Guidelines
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Additional smooth transitions */
        * {
          transition-property:
            background-color, border-color, color, fill, stroke, opacity,
            box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Focus styles for accessibility */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default SubmitManuscript;
