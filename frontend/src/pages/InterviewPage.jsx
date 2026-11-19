
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import femaleVideoSrc from "../assets/female-ai.mp4";
import maleVideoSrc from "../assets/male-ai.mp4"
import { getInterview } from "../apis/interview.api";
import StepTwoInterview from "../components/interview/Step2interview";

function InterviewPage({ user, onSubmitAnswer }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchInterview = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getInterview(id);

        // Supports either an Axios response or an already-unwrapped response.
        const data =
          response?.data?.interview ??
          response?.interview ??
          response?.data ??
          response;

        if (!isMounted) return;

        if (!data || !data._id) {
          setError("Interview not found.");
          return;
        }

        // Redirect if the interview is already completed.
        if (data.status === "completed") {
          navigate(`/interview/${id}/report`, {
            replace: true,
          });
          return;
        }

        // Validate that questions are available.
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
          setError("No interview questions found.");
          return;
        }

        setInterview(data);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load interview. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchInterview();
    } else {
      setError("Invalid interview ID.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your interview...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Unable to load interview
          </h2>

          <p className="text-gray-500 mb-5">{error}</p>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <StepTwoInterview
      interviewData={interview}
      user={user}
      maleVideoSrc={maleVideoSrc}
      femaleVideoSrc={femaleVideoSrc}
    />
  ); 
}

export default InterviewPage;
