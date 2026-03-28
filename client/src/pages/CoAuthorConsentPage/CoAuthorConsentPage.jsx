import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, AlertCircle, FileText } from "lucide-react";
import api from "../../services/api";

const CoAuthorConsentPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState("loading"); // loading | info | submitting | success | error
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [decision, setDecision] = useState(null); // "ACCEPT" | "REJECT"

  useEffect(() => {
    if (!token) {
      setPhase("error");
      setResultMessage("No token found in URL. Please use the link from your email.");
      return;
    }
    fetchInfo();
  }, [token]);

  const fetchInfo = async () => {
    try {
      const { data } = await api.get("/submissions/token-info", {
        params: { token, type: "consent" },
      });
      setSubmissionInfo(data.data.info);
      setPhase("info");
    } catch (err) {
      setPhase("error");
      setResultMessage(
        err.response?.data?.message || "Invalid or expired link. Please contact the submitting author."
      );
    }
  };

  const handleSubmit = async (choice) => {
    if (choice === "REJECT" && remark.trim().length < 10) {
      setRemarkError("Please provide a reason for rejection (minimum 10 characters).");
      return;
    }
    setRemarkError("");
    setDecision(choice);
    setPhase("submitting");

    try {
      const { data } = await api.post("/submissions/coauthor-consent", {
        consent: choice,
        token,
        remark: choice === "REJECT" ? remark : undefined,
      });
      setResultMessage(data.message || (choice === "ACCEPT" ? "Consent accepted successfully." : "Consent rejected."));
      setPhase("success");
    } catch (err) {
      setPhase("error");
      setResultMessage(
        err.response?.data?.message || "Something went wrong. Please try again or contact support."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #eef4fb 0%, #f7f9fc 45%, #e8f6fb 100%)" }}>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#c8d5e4] overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #0f3460, #1a4a7a)" }}>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-white">Co-Author Consent</h1>
              <p className="text-xs text-white/70 mt-0.5">Journal of Advanced & Integrated Research in Acute Medicine</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">

          {/* Loading */}
          {phase === "loading" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader className="w-10 h-10 text-[#0f3460] animate-spin" />
              <p className="text-sm text-gray-500">Verifying your link...</p>
            </div>
          )}

          {/* Info + Action */}
          {phase === "info" && submissionInfo && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  You have been listed as a co-author on the following manuscript. Please review and provide your consent.
                </p>
                <div className="bg-[#f7f9fc] border border-[#c8d5e4] rounded-xl px-5 py-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submission Number</p>
                    <p className="text-sm font-bold text-[#0f3460] mt-0.5">{submissionInfo.submissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</p>
                    <p className="text-sm text-gray-800 mt-0.5 leading-relaxed">{submissionInfo.title}</p>
                  </div>
                </div>
              </div>

              {/* Reject remark */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Reason for Rejection <span className="text-gray-400 font-normal">(required only if rejecting)</span>
                </label>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => { setRemark(e.target.value); setRemarkError(""); }}
                  placeholder="If you are declining, please briefly explain why..."
                  className="w-full px-4 py-3 border-2 border-[#c8d5e4] rounded-xl outline-none text-sm focus:border-[#0f3460] focus:ring-4 focus:ring-[#e8eef6] transition-all resize-none"
                />
                {remarkError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {remarkError}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSubmit("ACCEPT")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 shadow-md"
                  style={{ background: "linear-gradient(135deg, #0e7490, #0891b2)" }}
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => handleSubmit("REJECT")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 border-red-400 text-red-500 bg-white hover:bg-red-50 transition"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Submitting */}
          {phase === "submitting" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader className="w-10 h-10 text-[#0f3460] animate-spin" />
              <p className="text-sm text-gray-500">Submitting your response...</p>
            </div>
          )}

          {/* Success */}
          {phase === "success" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              {decision === "ACCEPT" ? (
                <CheckCircle className="w-14 h-14 text-[#0e7490]" />
              ) : (
                <XCircle className="w-14 h-14 text-red-400" />
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {decision === "ACCEPT" ? "Consent Accepted" : "Consent Rejected"}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">{resultMessage}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">You may close this window.</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <AlertCircle className="w-14 h-14 text-red-400" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Something Went Wrong</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{resultMessage}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Please contact the submitting author or editorial support.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CoAuthorConsentPage;