
import React, { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { FiUser } from "react-icons/fi";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import {
  FiUploadCloud,
  FiFileText,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { getResume } from '../apis/resume.api'
import { setResume } from "../redux/resumeSlice";
import { useCoins } from "../apis/user.api";

const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "Not provided";
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(" · ");
    }

    return String(value);
  };

const Navbar = ({ label }) => {
     const navigate = useNavigate();


    return (   
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button 
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-black">
            M
          </span>

          <span className="text-left">
            <span className="block text-sm font-bold text-white">
              Multi.AI
            </span>
            <span className="hidden text-xs text-white/40 sm:block">
              AI-powered career tools
            </span>
          </span>
        </button>

        
          <span className="hidden font-bold px-3 py-2 text-l text-white sm:block">
            {label}
          </span>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
          >
            <FiArrowLeft />
            Dashboard
          </button>
        </div>
      
    </motion.nav>
  );

}



function Scorer({ user , setUser}) {
 

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const {resume} = useSelector((state) => state.resume)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setFile(null);
      setError("File size must not exceed 20 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {

        const coinResponse = await useCoins({coins:20, action:"resume-scorer"})
        setUser((prev)=>({
            ...prev, interviewCoin:coinResponse?.interviewCoin,
        }))

      const formData = new FormData();
      formData.append("resume", file);

      // Adjust this path to match your API gateway configuration.
      const response = await api.post("/api/resume/upload",formData );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Resume analysis failed."
        );
      }
     
      dispatch(setResume(response?.data?.data))
      console.log("Resume analysis:", response.data.data);
    } catch (err) {
      console.log(err);
      alert("Resume upload failed")
        
    

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload and analyze resume. Please try again."
      );
    } 
    finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    dispatch(setResume(null));
    setError("");
    
    const input = document.getElementById("resume-file");
    if (input) input.value = "";
  };

  const getList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value];
    return [];
  };

  

  const ScoreRing = ({ score }) => {
  const safeScore = Math.max(0, Math.min(100, score));
  const color =
    safeScore >= 75
      ? "#22c55e"
      : safeScore >= 50
      ? "#f59e0b"
      : "#ef4444";

  const data = [{ value: safeScore }];

  return (
    <div className="relative flex h-[130px] w-[130px] items-center justify-center">
      <RadialBarChart
        width={130}
        height={130}
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={45}
        outerRadius={51}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          tick={false}
        />
        <RadialBar
          dataKey="value"
          cornerRadius={8}
          fill={color}
          background={{ fill: "rgba(255,255,255,0.10)" }}
        />
      </RadialBarChart>

      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">
          {safeScore}
        </span>
        <span className="text-xs text-white/40">/100</span>
      </div>
    </div>
  );
};

const Tag = ({ text, color = "green" }) => {
  const styles = {
    green: "border-green-400/20 bg-green-400/10 text-green-300",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    purple: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${
        styles[color] || styles.green
      }`}
    >
      {displayValue(text)}
    </span>
  );
};


  const Section = ({ title, icon: Icon, children }) => (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
        <Icon className="text-white/70" />
        {title}
      </h3>
      {children}
    </section>
  );

  const ListSection = ({ title, icon: Icon, items, emptyText }) => (
    <Section title={title} icon={Icon}>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-2 text-sm leading-relaxed text-white/70"
            >
              <span className="mt-1 text-white/40">•</span>
              <span>{displayValue(item)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/40">{emptyText}</p>
      )}
    </Section>
  );

  

  if (resume) {
  const score = Number(
    resume.score ?? resume.resumeScore ?? NaN
  );

  const validScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, score))
    : null;

  const scoreColor =
    validScore === null
      ? "purple"
      : validScore >= 75
      ? "green"
      : validScore >= 50
      ? "yellow"
      : "red";

  const scoreLabel =
    validScore === null
      ? "Not available"
      : validScore >= 75
      ? "Strong"
      : validScore >= 50
      ? "Average"
      : "Needs Work";

  const strengths = getList(resume.strengths);
  const weaknesses = getList(resume.weaknesses);
  const missingSkills = getList(resume.missingSkills);
  const recommendations = getList(resume.recommendations);

  const Card = ({ children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] sm:p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </motion.div>
  );

  const DetailList = ({
    title,
    items,
    color,
    icon: Icon,
    emptyText,
  }) => (
    <Card delay={0.7}>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          size={17}
          className={
            color === "green"
              ? "text-green-400"
              : color === "yellow"
              ? "text-yellow-400"
              : color === "red"
              ? "text-red-400"
              : "text-purple-400"
          }
        />
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>
        <span className="ml-auto rounded-full bg-white/5 px-2 py-1 text-xs text-white/40">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Tag
              key={`${title}-${index}`}
              text={item}
              color={color}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">{emptyText}</p>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar label="Resume Analysis" />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Resume Intelligence
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Resume Analysis
            </h1>

            <p className="mt-2 text-sm text-white/45">
              {file?.name || "Resume analysis report"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 px-4 py-3 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/5"
          >
            <FiRefreshCw />
            Upload another
          </button>
        </div>

        {/* Score and candidate information */}
        <div className="mb-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card delay={0.05}>
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="shrink-0">
                {validScore !== null ? (
                  <ScoreRing score={validScore} />
                ) : (
                  <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full border border-white/10 text-sm text-white/40">
                    No score
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="mb-2 text-xs text-white/40">
                  Resume Score
                </p>

                <h2 className="text-xl font-bold">
                  {scoreLabel}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  {validScore === null
                    ? "The API did not return a valid resume score."
                    : validScore >= 75
                    ? "Your resume demonstrates a strong profile. Review the recommendations to improve it further."
                    : validScore >= 50
                    ? "Your resume has a reasonable foundation. Focus on the improvement areas below."
                    : "Your resume needs improvement. Start with the missing skills and recommendations below."}
                </p>

                <div className="mt-4">
                  <Tag
                    text={`Score: ${validScore ?? "N/A"}/100`}
                    color={scoreColor}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card delay={0.15}>
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
              Candidate Profile
            </p>

            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
                <FiUser size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold">
                  {displayValue(resume.name)}
                </h2>
                <p className="mt-1 break-all text-sm text-white/45">
                  {displayValue(resume.email)}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="mb-2 text-xs text-white/40">
                Suggested Role
              </p>

              <p className="text-sm font-semibold text-purple-300">
                {displayValue(resume.suggestedRole)}
              </p>

              <p className="mt-3 text-xs text-white/40">
                Phone: {displayValue(resume.phone)}
              </p>
            </div>
          </Card>
        </div>

        {/* Professional summary */}
        <div className="mb-5">
          <Card delay={0.3}>
            <div className="mb-3 flex items-center gap-2">
              <FiFileText className="text-purple-400" />
              <h3 className="text-sm font-semibold">
                Professional Summary
              </h3>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">
              {displayValue(resume.summary)}
            </p>
          </Card>
        </div>

        {/* Strengths and weaknesses */}
        <div className="mb-5 grid gap-5 md:grid-cols-2">
          <DetailList
            title="Strengths"
            items={strengths}
            color="green"
            icon={FiTrendingUp}
            emptyText="Not provided"
          />

          <DetailList
            title="Weaknesses"
            items={weaknesses}
            color="yellow"
            icon={FiAlertCircle}
            emptyText="Not provided"
          />
        </div>

        {/* Missing skills */}
        <div className="mb-5">
          <DetailList
            title="Missing Skills"
            items={missingSkills}
            color="red"
            icon={FiTarget}
            emptyText="Not provided"
          />
        </div>

        {/* Recommendations */}
        <div className="mb-5">
          <DetailList
            title="Recommendations"
            items={recommendations}
            color="purple"
            icon={FiTrendingUp}
            emptyText="Not provided"
          />
        </div>

        {/* Additional resume information */}
        <div className="grid gap-5 md:grid-cols-2">
          <DetailList
            title="Education"
            items={getList(resume.education)}
            color="purple"
            icon={FiBookOpen}
            emptyText="Not provided"
          />

          <DetailList
            title="Experience"
            items={getList(resume.experience)}
            color="green"
            icon={FiBriefcase}
            emptyText="Not provided"
          />

          <DetailList
            title="Projects"
            items={getList(resume.projects)}
            color="yellow"
            icon={FiCode}
            emptyText="Not provided"
          />

          <Card delay={0.9}>
            <div className="mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-purple-400" />
              <h3 className="text-sm font-semibold">
                Analysis Status
              </h3>
            </div>

            <p className="text-sm leading-6 text-white/50">
              Resume analysis completed. Review your score,
              strengths, weaknesses, missing skills, and
              recommendations to identify areas for improvement.
            </p>
          </Card>
        </div>

        {/* Extracted resume text */}
        {resume.extractedText && (
          <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <summary className="cursor-pointer text-sm font-semibold text-white/80">
              View extracted resume text
            </summary>

            <p className="mt-4 whitespace-pre-wrap break-words text-xs leading-6 text-white/45">
              {resume.extractedText}
            </p>
          </details>
        )}
      </main>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar label="Resume Scorer" />

      <main className="flex min-h-screen items-center justify-center px-4 pb-12 pt-28 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />

          <div className="relative">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Step 1 of 2 
            </p>

            <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 rounded-full bg-white" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Upload your resume
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/45">
              We'll analyze your profile and provide actionable feedback to
              help you prepare for your next opportunity.
            </p>

            <div className="mt-7">
              <label
                htmlFor="resume-file"
                className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                  file
                    ? "border-white/40 bg-white/[0.06]"
                    : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/[0.03]"
                }`}
              >
                <div>{!file ? <FiUploadCloud
                  size={38}
                  className={`mb-4 ${
                    file ? "text-white" : "text-white/35"
                  }`}
                /> : "Choosed "}
                </div>

                <span className="max-w-full break-all text-sm font-semibold text-white/90">
                  {file ? file.name : "Click to upload your resume"}
                </span>

                <span className="mt-2 text-xs text-white/40">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB selected ` 
                    : "Choose a PDF file from your device"}
                </span>

                <span className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  {!file ? "Browse files" : "reupload" } 
                </span>

                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={loading}
                  onChange={handleFileChange}
                />
              </label>

              <div className="mt-3 flex items-center justify-between text-[10px] text-white/35">
                <span>PDF only</span>
                <span>Maximum size: 20 MB</span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
              >
                <FiAlertCircle className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.button
              type="button"
              onClick={uploadResume}
              disabled={!file || loading}
              whileHover={{ scale: file && !loading ? 1.02 : 1 }}
              whileTap={{ scale: file && !loading ? 0.98 : 1 }}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black shadow-[0_4px_18px_rgba(255,255,255,0.08)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                  Analyzing resume...
                </>
              ) : (
                <>
                  <FiFileText />
                  Analyze Resume
                </>
              )}
            </motion.button>

            <p className="mt-4 text-center text-[10px] leading-5 text-white/35">
              Your resume is processed by the resume service. Only upload
              documents you have permission to share.
            </p>

            {user?.name && (
              <p className="mt-3 text-center text-xs text-white/40">
                Signed in as {user.name}
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Scorer;
