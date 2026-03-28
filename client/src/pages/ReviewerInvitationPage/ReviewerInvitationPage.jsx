import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, AlertCircle, Users } from "lucide-react";
import api from "../../services/api";

const ReviewerInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState("loading");
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [decision, setDecision] = useState(null);

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
        params: { token, type: "reviewer-invitation" },
      });
      setSubmissionInfo(data.data.info);
      setPhase("info");
    } catch (err) {
      setPhase("error");
      setResultMessage(
        err.response?.data?.message || "Invalid or expired link. Please contact the editorial office."
      );
    }
  };

  const handleSubmit = async (choice) => {
    setDecision(choice);
    setPhase("submitting");

    try {
      const { data } = await api.post("/submissions/reviewer-invitation-response", {
        token,
        response: choice,
      });
      setResultMessage(data.message || (choice === "ACCEPT" ? "Thank you for accepting." : "You have declined the invitation."));
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
        <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #0e7490, #0891b2)" }}>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-white">Peer Review Invitation</h1>
              <p className="text-xs text-white/70 mt-0.5">Journal of Advanced & Integrated Research in Acute Medicine</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">

          {/* Loading */}
          {phase === "loading" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader className="w-10 h-10 text-[#0e7490] animate-spin" />
              <p className="text-sm text-gray-500">Verifying your link...</p>
            </div>
          )}

          {/* Info + Action */}
          {phase === "info" && submissionInfo && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  You have been suggested as a peer reviewer for the following manuscript. Please indicate whether you accept or decline this invitation.
                </p>
                <div className="bg-[#f7f9fc] border border-[#c8d5e4] rounded-xl px-5 py-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submission Number</p>
                    <p className="text-sm font-bold text-[#0e7490] mt-0.5">{submissionInfo.submissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</p>
                    <p className="text-sm text-gray-800 mt-0.5 leading-relaxed">{submissionInfo.title}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#e0f2fe] border border-[#a0d4e8] rounded-xl px-5 py-4">
                <p className="text-xs text-[#0c4a6e] leading-relaxed">
                  By accepting this invitation, you agree to provide an objective and timely peer review in accordance with JAIRAM's review guidelines and COPE standards.
                </p>
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
                  onClick={() => handleSubmit("DECLINE")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 border-red-400 text-red-500 bg-white hover:bg-red-50 transition"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          )}

          {/* Submitting */}
          {phase === "submitting" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader className="w-10 h-10 text-[#0e7490] animate-spin" />
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
                  {decision === "ACCEPT" ? "Invitation Accepted" : "Invitation Declined"}
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
              <p className="text-xs text-gray-400 mt-2">Please contact the editorial office for assistance.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReviewerInvitationPage;