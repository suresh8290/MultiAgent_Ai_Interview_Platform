
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";

import {
  FiArrowLeft,
  FiCheck,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiUploadCloud,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

import { startInterview } from "../../apis/interview.api";
import api from "../../utils/axios";
import { setResume } from "../../redux/resumeSlice";
import { useCoins } from "../../apis/user.api";

function Step1setup({ user, setUser }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { resume } = useSelector((state) => state.resume);

  const [role, setRole] = useState("");
  const [type, setType] = useState("Technical");
  const [useResume, setUseResume] = useState(!!resume);

  const [file, setFile] = useState(null);
  const [isReuploading, setIsReuploading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [startError, setStartError] = useState("");

  // Automatically fill the suggested role from the resume
  useEffect(() => {
    if (useResume && resume?.suggestedRole) {
      setRole(resume.suggestedRole);
    }
  }, [useResume, resume?.suggestedRole]);

  // Normalize API responses
  const getResponseData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
  };

  // Select PDF resume
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setUploadError("");
    setFile(null);

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setUploadError("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setUploadError("File size must not exceed 20 MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  // Upload / Replace resume
  const handleUploadResume = async () => {
    if (!file) {
      setUploadError("Please select a PDF resume first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post(
        "/api/resume/upload",
        formData
      );

      const data = response?.data;

      if (!data?.success || !data?.data) {
        throw new Error(
          data?.message || "Resume upload failed."
        );
      }

      // Store resume in Redux
      dispatch(setResume(data.data));

      // Automatically fill suggested role
      if (data.data.suggestedRole) {
        setRole(data.data.suggestedRole);
      }

      setUseResume(true);
      setIsReuploading(false);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("Resume upload error:", error);

      setUploadError(
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Start interview
// Start interview
const start = async () => {
    if (starting || uploading) return;

    setStartError("");

    if (!role.trim()) {
        setStartError("Please enter your target job role.");
        return;
    }

    if (useResume && !resume) {
        setUploadError("Please upload your resume first.");
        return;
    }

    try {
        setStarting(true);

        // Step 1: Deduct 30 coins
        const coinResponse = await useCoins({
            coins: 30,
            action: "Interview",
        });

        console.log("Coin response:", coinResponse);

        if (!coinResponse || coinResponse.success === false) {
            throw new Error(
                coinResponse?.message || "Failed to deduct coins."
            );
        }

        // Step 2: Update coin balance
        if (typeof coinResponse.interviewCoin === "number") {
            setUser((prev) => ({
                ...prev,
                interviewCoin: coinResponse.interviewCoin,
            }));
        }

        // Step 3: Start interview
        const response = await startInterview({
            type,
            role: role.trim(),
            useResume,
            resume: useResume ? resume : null,
        });

        const data = getResponseData(response);

        console.log("Interview started:", data);

        if (!data?.success || !data?.interviewId) {
            throw new Error(
                data?.message || "Unable to start interview."
            );
        }

        // Step 4: Update user information
        if (data.user && typeof setUser === "function") {
            setUser((prev) => ({
                ...prev,
                ...data.user,
            }));
        }

        // Step 5: Navigate
        navigate(`/interview/${data.interviewId}`);

    } catch (error) {
        console.error("Start interview error:", error);

        setStartError(
            error.response?.data?.message ||
            error.message ||
            "Something went wrong while starting the interview."
        );

    } finally {
        setStarting(false);
    }
};

  // Cancel resume replacement
  const handleCancelReupload = () => {
    setIsReuploading(false);
    setFile(null);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Features
  const features = [
    {
      icon: <FiCheckCircle />,
      title: "Personalized Questions",
      description: "Questions based on your selected job role.",
    },
    {
      icon: <FiFileText />,
      title: "Resume-Based Interview",
      description: "Practice questions related to your resume.",
    },
    {
      icon: <FiCheck />,
      title: "Detailed Performance Report",
      description: "Get feedback and improve your performance.",
    },
    {
      icon: <FiBriefcase />,
      title: "Real Interview Experience",
      description: "Experience a structured interview environment.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#111111] shadow-2xl overflow-hidden"
      >

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%]">

          {/* LEFT SECTION */}
          <div className="p-7 md:p-10 bg-[#171717]">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-12 rounded-lg border border-gray-700 p-2"
            >
              <FiArrowLeft />
              Back to Dashboard
            </button>

            <div className="mb-8">

              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <FiBriefcase className="text-white text-2xl" />
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Welcome back, {user?.name || "Candidate"}!
              </h1>

              <p className="text-gray-400 leading-7">
                Get ready to practice your interview skills with your
                personal AI interviewer. Configure your interview
                preferences and start preparing for your dream job.
              </p>

            </div>

            {/* FEATURES */}
            <div className="space-y-5">

              {features.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">

                  <div className="text-gray-300 text-xl mt-1">
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="p-7 md:p-10">

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Configure Your Interview
              </h2>

              <p className="text-gray-400 text-sm">
                Customize your interview before getting started.
              </p>
            </div>

            {/* JOB ROLE */}
            <div className="mb-7">

              <label className="block text-sm font-medium mb-3">
                Target Job Role
              </label>

              <div className="relative">

                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  disabled={starting}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/50 transition placeholder:text-gray-600"
                />

              </div>

              {useResume && resume?.suggestedRole && (
                <p className="mt-2 text-xs text-green-500">
                  <FiCheckCircle className="inline mr-1" />
                  Suggested role filled from your resume. You can edit it.
                </p>
              )}
            </div>

            {/* INTERVIEW TYPE */}
            <div className="mb-7">

              <label className="block text-sm font-medium mb-3">
                Interview Type
              </label>

              <div className="grid grid-cols-2 gap-4">

                {["Technical", "HR"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={starting}
                    onClick={() => setType(item)}
                    className={`rounded-xl border p-4 transition ${
                      type === item
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 bg-black text-gray-400 hover:border-white/30"
                    }`}
                  >

                    <div className="flex items-center justify-center gap-2">
                      <FiCheckCircle />
                      <span className="font-semibold">{item}</span>
                    </div>

                  </button>
                ))}

              </div>
            </div>

            {/* RESUME SECTION */}
            <div className="mb-8">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="font-semibold">
                    Use My Resume
                  </h3>

                  <p className="text-gray-500 text-xs mt-1">
                    Personalize questions using your resume.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={starting || uploading}
                  onClick={() => {
  setUseResume((prev) => {
    const nextValue = !prev;

    if (!nextValue) {
      // Resume turned OFF: clear suggested role
      setRole("");
      setIsReuploading(false);
      setFile(null);
      setUploadError("");
    } else if (resume?.suggestedRole) {
      // Resume turned ON: restore suggested role
      setRole(resume.suggestedRole);
    }

    return nextValue;
  });
}}
                  className={`w-12 h-6 rounded-full relative transition ${
                    useResume ? "bg-white" : "bg-gray-700"
                  }`}
                  aria-label="Toggle resume usage"
                >

                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      useResume
                        ? "left-7 bg-black"
                        : "left-1 bg-white"
                    }`}
                  />

                </button>

              </div>

              {useResume && resume && !isReuploading ? (

                /* RESUME SELECTED */
                <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-4">

                  <div className="flex items-center gap-3">

                    <FiCheckCircle className="text-green-500 text-xl" />

                    <div className="flex-1 min-w-0">

                      <h4 className="text-green-500 font-semibold">
                        Resume Selected
                      </h4>

                      <p className="text-gray-400 text-sm mt-1 truncate">
                        {resume.fileName || "Your resume is ready."}
                      </p>

                    </div>

                  </div>

                  {resume.suggestedRole && (
                    <p className="text-sm text-gray-400 mt-3">
                      Suggested Role:{" "}
                      <span className="text-white">
                        {resume.suggestedRole}
                      </span>
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsReuploading(true);
                      setFile(null);
                      setUploadError("");
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2 text-sm text-white hover:bg-white/10 transition"
                  >
                    <FiUploadCloud />
                    Reupload Resume
                  </button>

                </div>

              ) : useResume ? (

                /* RESUME UPLOAD / REUPLOAD */
                <div className="border border-dashed border-white/20 bg-black rounded-xl p-5">

                  <div className="text-center">

                    <FiUploadCloud className="text-3xl text-gray-400 mx-auto mb-3" />

                    <h4 className="font-medium mb-1">
                      {isReuploading
                        ? "Replace Your Resume"
                        : "Upload Your Resume"}
                    </h4>

                    <p className="text-gray-500 text-xs mb-4">
                      PDF format only · Maximum size 20 MB
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      id="interview-resume-upload"
                      className="hidden"
                      disabled={uploading}
                      onChange={handleFileChange}
                    />

                    <label
                      htmlFor="interview-resume-upload"
                      className="inline-block cursor-pointer bg-white/10 border border-white/20 text-white rounded-lg px-5 py-2 text-sm hover:bg-white/20 transition"
                    >
                      Choose PDF
                    </label>

                    {file && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-green-500 text-sm">
                        <FiCheckCircle />
                        <span className="truncate max-w-[220px]">
                          {file.name}
                        </span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-red-500 text-sm">
                        <FiAlertCircle />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleUploadResume}
                      disabled={!file || uploading}
                      className="block w-full mt-4 bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-semibold transition"
                    >
                      {uploading
                        ? "Uploading..."
                        : isReuploading
                        ? "Replace Resume"
                        : "Upload Resume"}
                    </button>

                    {isReuploading && (
                      <button
                        type="button"
                        onClick={handleCancelReupload}
                        disabled={uploading}
                        className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
                      >
                        Cancel Reupload
                      </button>
                    )}

                  </div>
                </div>

              ) : (

                /* RESUME DISABLED */
                <div className="border border-white/10 bg-black rounded-xl p-4">
                  <p className="text-sm text-gray-500">
                    Resume-based questions are disabled. You can start
                    a general interview.
                  </p>
                </div>

              )}

            </div>

            {/* START ERROR */}
            {startError && (
              <div className="flex items-center gap-2 mb-4 text-red-500 text-sm">
                <FiAlertCircle />
                <span>{startError}</span>
              </div>
            )}

            {/* START INTERVIEW */}
            <button
              type="button"
              onClick={start}
              disabled={starting || uploading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl py-4 font-semibold transition"
            >

              {starting
                ? "Starting Interview..."
                : "Start Interview"}

              {!starting && <FiArrowRight />}

            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Starting an interview costs 30 coins.
            </p>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Step1setup;
