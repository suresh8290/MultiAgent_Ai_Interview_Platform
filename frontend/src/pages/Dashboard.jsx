
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiCode,
  FiMessageSquare,
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiArrowUpRight,
  FiTarget,
  FiRefreshCw,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { getAllInterviews } from "../apis/interview.api";

/* --------------------------------------------------
   SKILL DIMENSIONS
-------------------------------------------------- */

const SKILL_DIMENSIONS = [
  { key: "correctness", label: "Correctness" },
  { key: "clarity", label: "Clarity" },
  { key: "relevance", label: "Relevance" },
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "creativity", label: "Creativity" },
  { key: "detail", label: "Detail" },
  { key: "efficiency", label: "Efficiency" },
];

/* --------------------------------------------------
   RADAR CHART
-------------------------------------------------- */

const RadarChart = ({ title, subtitle, metrics, color, icon }) => {
  const center = 160;
  const radius = 105;
  const angleStep = (Math.PI * 2) / metrics.length;

  const getPoint = (value, index, customRadius = radius) => {
    const angle = -Math.PI / 2 + index * angleStep;

    const normalizedValue = Math.max(
      0,
      Math.min(Number(value) || 0, 100)
    );

    const distance = (normalizedValue / 100) * customRadius;

    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const polygonPoints = metrics
    .map((metric, index) => {
      const point = getPoint(metric.value, index);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const gridLevels = [25, 50, 75, 100];

  const hasData = metrics.some(
    (metric) => metric.hasData && metric.value > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              {title}
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            color,
            backgroundColor: `${color}12`,
          }}
        >
          8 Skills
        </span>
      </div>

      {/* RADAR GRAPH */}
      <div className="mt-5 flex justify-center">
        <svg
          viewBox="0 0 320 320"
          className="w-full max-w-[360px] overflow-visible"
        >
          {/* RADAR GRID */}
          {gridLevels.map((level) => {
            const points = metrics
              .map((_, index) => {
                const point = getPoint(level, index);
                return `${point.x},${point.y}`;
              })
              .join(" ");

            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          {/* AXIS LINES */}
          {metrics.map((metric, index) => {
            const point = getPoint(100, index);

            return (
              <line
                key={metric.key}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          {/* SKILL PERFORMANCE AREA */}
          {hasData && (
            <polygon
              points={polygonPoints}
              fill={color}
              fillOpacity="0.22"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* DATA POINTS */}
          {metrics.map((metric, index) => {
            if (!metric.hasData) return null;

            const point = getPoint(metric.value, index);

            return (
              <g key={metric.key}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill={color}
                  opacity="0.15"
                />

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* SKILL LABELS */}
          {metrics.map((metric, index) => {
            const point = getPoint(128, index);

            return (
              <text
                key={metric.key}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6B7280"
                fontSize="9"
                fontWeight="600"
              >
                {metric.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* NO DATA */}
      {!hasData && (
        <p className="text-center text-xs text-gray-400">
          Complete an interview to see your skill performance.
        </p>
      )}

      {/* SKILL VALUES */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-xl bg-gray-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500">
                {metric.label}
              </p>

              <p className="text-sm font-bold text-gray-900">
                {metric.display}
              </p>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${metric.hasData ? metric.value : 0}%`,
                }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* --------------------------------------------------
   DASHBOARD
-------------------------------------------------- */

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --------------------------------------------------
     FETCH DATA
  -------------------------------------------------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllInterviews();

      if (res?.success) {
        setData(res);
      } else {
        setError("Unable to load dashboard data.");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* --------------------------------------------------
     LOGOUT
  -------------------------------------------------- */

  const handleLogout = async () => {
    try {
      const res = await api.get("/api/auth/logout");

      if (res.data.success) {
        setUser(null);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* --------------------------------------------------
     MAIN STATISTICS
  -------------------------------------------------- */

  const stats = data?.stats || {};
  const interviews = data?.interviews || [];

  const totalInterviews = stats.totalInterviews ?? 0;
  const totalQuestions = stats.totalQuestions ?? 0;
  const completedInterviews = stats.completedInterviews ?? 0;
  const averageScore = Number(stats.averageScore ?? 0);

  const technicalCount = data?.technicalCount ?? 0;
  const hrCount = data?.hrCount ?? 0;

  const completionRate = totalInterviews
    ? Math.round(
      (completedInterviews / totalInterviews) * 100
    )
    : 0;

  /* --------------------------------------------------
     CATEGORY SKILL ANALYTICS
  -------------------------------------------------- */

  const categoryData = useMemo(() => {
    const technical = interviews.filter((item) => {
      const type = String(
        item.type || item.interviewType || ""
      ).toLowerCase();

      return type.includes("technical");
    });

    const hr = interviews.filter((item) => {
      const type = String(
        item.type || item.interviewType || ""
      ).toLowerCase();

      return (
        type === "hr" ||
        type.includes("human resource")
      );
    });

    const getCategoryStats = (items) => {
      const completed = items.filter(
        (item) =>
          item.completed === true ||
          item.status === "completed"
      );

      const scores = completed
        .map((item) =>
          Number(item.overallScore ?? item.score)
        )
        .filter(
          (score) =>
            Number.isFinite(score) && score >= 0
        );

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) /
          scores.length
          : 0;

      /*
        Get feedback from every question
        in completed interviews.
      */

      const feedbacks = completed.flatMap((interview) =>
        (Array.isArray(interview.questions)
          ? interview.questions
          : []
        )
          .map((question) => question.feedback)
          .filter(
            (feedback) =>
              feedback && typeof feedback === "object"
          )
      );

      /*
        Calculate average score for each skill.
      */

      const skillMetrics = SKILL_DIMENSIONS.map((skill) => {
        const values = feedbacks
          .map((feedback) => {
            const value = feedback[skill.key];

            if (
              value === null ||
              value === undefined ||
              value === ""
            ) {
              return null;
            }

            const numericValue = Number(value);

            return Number.isFinite(numericValue)
              ? numericValue
              : null;
          })
          .filter(
            (value) =>
              value !== null && value >= 0
          );

        const averageValue =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) /
            values.length
            : 0;

        return {
          key: skill.key,
          label: skill.label,
          value: Math.min(100, Math.max(0, averageValue)),
          hasData: values.length > 0,
          responseCount: values.length,
        };
      });

      return {
        count: items.length,
        completed: completed.length,
        averageScore,
        completionRate: items.length
          ? (completed.length / items.length) * 100
          : 0,
        skillMetrics,
      };
    };

    return {
      technical: getCategoryStats(technical),
      hr: getCategoryStats(hr),
    };
  }, [interviews]);

  /* --------------------------------------------------
     RADAR METRICS
  -------------------------------------------------- */

  const createRadarMetrics = (category) => {
    return category.skillMetrics.map((skill) => ({
      key: skill.key,
      label: skill.label,
      value: skill.value,
      hasData: skill.hasData,
      display: skill.hasData
        ? `${Math.round(skill.value)}%`
        : "N/A",
    }));
  };

  /* --------------------------------------------------
     SCORE MESSAGE
  -------------------------------------------------- */

  const scoreColor =
    averageScore >= 80
      ? "#10B981"
      : averageScore >= 60
        ? "#6366F1"
        : "#F59E0B";

  const scoreMessage =
    averageScore >= 90
      ? "Outstanding!"
      : averageScore >= 80
        ? "Excellent work!"
        : averageScore >= 60
          ? "Good progress!"
          : averageScore > 0
            ? "Keep improving!"
            : "Start practicing!";

  /* --------------------------------------------------
     STAT CARDS
  -------------------------------------------------- */

  const statCards = [
    {
      title: "Total Interviews",
      value: totalInterviews,
      icon: FiActivity,
      color: "blue",
      description: "All practice sessions",
    },
    {
      title: "Questions Solved",
      value: totalQuestions,
      icon: FiMessageSquare,
      color: "violet",
      description: "Questions attempted",
    },
    {
      title: "Completed",
      value: completedInterviews,
      icon: FiCheckCircle,
      color: "emerald",
      description: "Successfully finished",
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      icon: FiAward,
      color: "amber",
      description: "Overall performance",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  /* --------------------------------------------------
     DATE FORMAT
  -------------------------------------------------- */

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* --------------------------------------------------
     INTERVIEW STATUS
  -------------------------------------------------- */

  const getStatus = (item) => {
    return (
      item.completed === true ||
      item.status === "completed"
    )
      ? "Completed"
      : "In Progress";
  };

  const getInterviewId = (item) => item._id || item.id;

  const handleOpenReport = (item) => {
    const interviewId = getInterviewId(item);

    if (!interviewId) return;

    if (getStatus(item) === "Completed") {
      navigate(`/interview/${interviewId}/report`);
    } else {
      navigate("/interview");
    }
  };

  /* --------------------------------------------------
     LOADING SKELETON
  -------------------------------------------------- */

  const Skeleton = () => (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
      <div className="h-10 w-10 rounded-xl bg-gray-100" />
      <div className="mt-5 h-4 w-28 rounded bg-gray-100" />
      <div className="mt-3 h-8 w-20 rounded bg-gray-100" />
      <div className="mt-3 h-3 w-36 rounded bg-gray-100" />
    </div>
  );

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-gray-900">
      {/* SIDEBAR */}
      <Sidebar
        user={user}
        onNewInterview={() => navigate("/interview")}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className={`min-h-screen px-4 pb-10 pt-20 transition-all duration-300 sm:px-6 md:pt-8 lg:px-8 ${sidebarOpen
            ? "md:ml-[260px]"
            : "md:ml-[72px]"
          }`}
      >
        <div className="mx-auto max-w-[1500px]">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <FiActivity />
                YOUR WORKSPACE
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {user?.name?.split(" ")[0] || "User"}!
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Track your progress and become interview-ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={() => navigate("/interview")}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-600"
              >
                <FiPlus size={18} />
                New Interview
              </button>
            </div>
          </motion.div>

          {/* ERROR */}
          {error && !loading && (
            <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-600">{error}</p>

              <button
                onClick={fetchData}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!error && (
            <>
              {/* STATISTICS */}
              <section className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} />
                  ))
                  : statCards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{ y: -2 }}
                        className="flex min-w-0 flex-col rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${colorStyles[card.color]}`}
                          >
                            <Icon size={15} />
                          </div>

                          <p className="min-w-0 truncate text-xs font-medium text-gray-500">
                            {card.title}
                          </p>
                        </div>

                        <h2 className="mt-2 truncate text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                          {card.value}
                        </h2>

                        <p className="mt-0.5 truncate text-[10px] leading-tight text-gray-400">
                          {card.description}
                        </p>
                      </motion.div>
                    );
                  })}
              </section>

              {/* OVERALL PERFORMANCE */}
              <section className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171B35] to-[#343B70] p-6 text-white shadow-xl sm:p-8"
                >
                  <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

                  <div className="relative z-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
                        <FiTrendingUp />
                        PERFORMANCE OVERVIEW
                      </div>

                      <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                        Your interview performance
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-indigo-100/70">
                        Every interview is an opportunity to improve.
                        Keep practicing to build confidence and sharpen
                        your skills.
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                          <p className="text-xs text-indigo-200">
                            Completion rate
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {completionRate}%
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                          <p className="text-xs text-indigo-200">
                            Completed sessions
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {completedInterviews}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CIRCULAR SCORE */}
                    <div className="flex shrink-0 flex-col items-center justify-center">
                      <div className="relative flex h-48 w-48 items-center justify-center">
                        <svg
                          viewBox="0 0 200 200"
                          className="absolute inset-0 h-full w-full -rotate-90"
                        >
                          <circle
                            cx="100"
                            cy="100"
                            r="82"
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="12"
                            fill="none"
                          />

                          <motion.circle
                            cx="100"
                            cy="100"
                            r="82"
                            stroke={scoreColor}
                            strokeWidth="12"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 82}
                            initial={{
                              strokeDashoffset: 2 * Math.PI * 82,
                            }}
                            animate={{
                              strokeDashoffset:
                                2 *
                                Math.PI *
                                82 *
                                (1 -
                                  Math.min(
                                    Math.max(averageScore, 0),
                                    100
                                  ) /
                                  100),
                            }}
                            transition={{
                              duration: 1.4,
                              ease: "easeOut",
                            }}
                          />
                        </svg>

                        <div className="text-center">
                          <p className="text-5xl font-bold">
                            {averageScore}
                          </p>

                          <p className="mt-1 text-xs text-indigo-200">
                            Average score
                          </p>
                        </div>
                      </div>

                      <div className="mt-1 text-center">
                        <p className="text-3xl">
                          {averageScore >= 80
                            ? "🏆"
                            : averageScore >= 60
                              ? "😊"
                              : averageScore > 0
                                ? "💪"
                                : "🚀"}
                        </p>

                        <p className="mt-1 font-semibold">
                          {scoreMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* SKILL ANALYTICS */}
              <section className="mt-10">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                    <FiTarget />
                    SKILL ANALYTICS
                  </div>

                  <h2 className="mt-2 text-2xl font-bold">
                    Interview Skill Analysis
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Compare your eight skill dimensions across Technical
                    and HR interviews.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <RadarChart
                    title="Technical Interview"
                    subtitle="Technical skill performance"
                    icon={<FiCode size={21} />}
                    color="#6366F1"
                    metrics={createRadarMetrics(categoryData.technical)}
                  />

                  <RadarChart
                    title="HR Interview"
                    subtitle="Communication and interpersonal skills"
                    icon={<FiUsers size={21} />}
                    color="#0D9488"
                    metrics={createRadarMetrics(categoryData.hr)}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-400">
                  Skill scores are averages of the available feedback
                  values from completed interviews. Missing values are
                  displayed as N/A.
                </p>
              </section>

              {/* CATEGORY SUMMARY */}
              <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FiCode size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold">Technical</h3>
                        <p className="text-xs text-gray-400">
                          Technical sessions
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl font-bold">
                      {technicalCount}
                    </span>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${totalInterviews
                            ? Math.min(
                              (technicalCount / totalInterviews) * 100,
                              100
                            )
                            : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        <FiUsers size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold">HR</h3>
                        <p className="text-xs text-gray-400">
                          HR sessions
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl font-bold">
                      {hrCount}
                    </span>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all"
                      style={{
                        width: `${totalInterviews
                            ? Math.min(
                              (hrCount / totalInterviews) * 100,
                              100
                            )
                            : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* QUICK ACTION */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                    <FiTarget size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Ready for your next challenge?
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Practice another interview and track your improvement.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/interview")}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Start practicing
                  <FiArrowUpRight />
                </button>
              </motion.section>

              {/* RECENT INTERVIEWS */}
              <section className="mt-10">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-xl font-bold">
                      Recent Interviews
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Review your previous practice sessions.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    {interviews.length} sessions
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {interviews.length === 0 ? (
                    <div className="flex flex-col items-center px-5 py-14 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <FiCalendar size={28} />
                      </div>

                      <h3 className="mt-5 font-bold">
                        No interviews yet
                      </h3>

                      <p className="mt-2 max-w-sm text-sm text-gray-500">
                        Your interview history will appear here once you
                        complete your first session.
                      </p>

                      <button
                        onClick={() => navigate("/interview")}
                        className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-600"
                      >
                        Start your first interview
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[750px] text-left">
                        <thead className="bg-gray-50/80">
                          <tr className="text-xs uppercase tracking-wider text-gray-400">
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Score</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {interviews.map((item, index) => {
                            const status = getStatus(item);
                            const completed = status === "Completed";
                            const score =
                              item.overallScore ?? item.score;

                            return (
                              <motion.tr
                                key={item._id || item.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="border-t border-gray-100 transition hover:bg-gray-50/80"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                                      {(
                                        item.role ||
                                        item.targetRole ||
                                        "I"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div>
                                      <p className="font-semibold text-gray-800">
                                        {item.role ||
                                          item.targetRole ||
                                          "Interview"}
                                      </p>

                                      <p className="mt-1 text-xs text-gray-400">
                                        Practice session
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5">
                                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold capitalize text-gray-600">
                                    {item.type ||
                                      item.interviewType ||
                                      "N/A"}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-sm text-gray-500">
                                  {formatDate(item.createdAt)}
                                </td>

                                <td className="px-6 py-5">
                                  <span className="font-bold text-gray-800">
                                    {score ?? 0}
                                  </span>

                                  <span className="text-xs text-gray-400">
                                    {" "}/ 100
                                  </span>
                                </td>

                                <td className="px-6 py-5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${completed
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                      }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${completed
                                          ? "bg-emerald-500"
                                          : "bg-amber-500"
                                        }`}
                                    />

                                    {status}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-right">
                                  <button
                                    onClick={() => handleOpenReport(item)}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                  >
                                    {completed
                                      ? "View report"
                                      : "Start a New"}

                                    <FiArrowUpRight />
                                  </button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* FOOTER */}
              <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400 sm:flex-row">
                <p>Keep learning. Keep improving. Keep growing.</p>
                <p>AI Interview Platform</p>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
