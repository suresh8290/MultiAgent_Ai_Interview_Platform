import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../apis/interview.api";

function InterviewReport() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const result = await getInterview(id);

                if (!result?.success || !result.interview) {
                    setError("Unable to load interview report.");
                    return;
                }

                if (result.interview.status !== "completed") {
                    setError("This interview is not completed yet.");
                    return;
                }

                setInterview(result.interview);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load report."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#080d19] text-white">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
                    <p className="text-slate-400">Preparing your interview report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#080d19] p-8 text-center text-white">
                <div>
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => navigate("/interview")}
                        className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white"
                    >
                        Back to Interviews
                    </button>
                </div>
            </div>
        );
    }

    const metrics = [
        ["Correctness", "correctness"],
        ["Clarity", "clarity"],
        ["Relevance", "relevance"],
        ["Communication", "communication"],
        ["Problem Solving", "problemSolving"],
        ["Creativity", "creativity"],
        ["Detail", "detail"],
        ["Efficiency", "efficiency"],
    ];

    const questions = interview.questions || [];
    const score = Math.max(
        0,
        Math.min(100, Number(interview.overallScore) || 0)
    );

    const scoreMood =
        score >= 85
            ? {
                label: "Excellent",
                message: "Outstanding performance. Keep raising the bar.",
                emoji: "😄",
                color: "#34d399",
            }
            : score >= 70
                ? {
                    label: "Good work",
                    message: "A strong attempt with a few areas to sharpen.",
                    emoji: "🙂",
                    color: "#60a5fa",
                }
                : score >= 50
                    ? {
                        label: "Getting there",
                        message: "You have a foundation. Focused practice will help.",
                        emoji: "😐",
                        color: "#fbbf24",
                    }
                    : {
                        label: "Keep practicing",
                        message: "Every interview is progress. Work on the fundamentals next.",
                        emoji: "🙁",
                        color: "#fb7185",
                    };

    const metricValues = metrics.map(([label, key]) => {
        const scores = questions
            .map(q => Number(q.feedback?.[key]))
            .filter(value => Number.isFinite(value));

        const average = scores.length
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        return {
            label,
            key,
            value: Math.max(0, Math.min(100, average)),
        };
    });

    const averageMetric = metricValues.length
        ? metricValues.reduce((sum, item) => sum + item.value, 0) /
          metricValues.length
        : 0;

    // Radar chart coordinates.
    const radarPoints = metricValues.map((item, index) => {
        const angle =
            (Math.PI * 2 * index) / metricValues.length - Math.PI / 2;

        const radius = 78 * (item.value / 100);

        return {
            ...item,
            x: 110 + Math.cos(angle) * radius,
            y: 110 + Math.sin(angle) * radius,
            labelX: 110 + Math.cos(angle) * 99,
            labelY: 110 + Math.sin(angle) * 99,
            angle,
        };
    });

    const radarPolygon = radarPoints
        .map(point => `${point.x},${point.y}`)
        .join(" ");

    const fadeUp = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0 },
    };

    const strongestSkill = metricValues.length
        ? [...metricValues].sort((a, b) => b.value - a.value)[0].label
        : "—";

    const focusArea = metricValues.length
        ? [...metricValues].sort((a, b) => a.value - b.value)[0].label
        : "—";

    return (
        <div className="min-h-screen overflow-hidden bg-[#080d19] px-4 py-8 text-white md:px-8">

            {/* Background effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-600/15 blur-[110px]" />
                <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>

            <motion.main
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.09,
                        },
                    },
                }}
                className="relative mx-auto max-w-6xl"
            >

                {/* HEADER */}
                <motion.header variants={fadeUp} className="mb-8">

                    <button
                        onClick={() => navigate("/interview")}
                        className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Interviews
                    </button>

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                                Your performance overview
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Interview{" "}
                                <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                                    Report
                                </span>
                            </h1>

                            <p className="mt-2 text-slate-400">
                                {interview.role || "Interview"}
                                <span className="px-1 text-slate-600">/</span>
                                {interview.type || "General"} interview
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:self-auto">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                            Interview completed
                        </div>

                    </div>
                </motion.header>

                {/* HERO SCORE */}
                <motion.section
                    variants={fadeUp}
                    className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#151f35] via-[#111a2d] to-[#17132d] p-6 shadow-2xl shadow-black/20 sm:p-8"
                >

                    <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/[0.06]" />
                    <div className="pointer-events-none absolute -right-5 -top-12 h-52 w-52 rounded-full border border-white/[0.06]" />

                    <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">

                        <div className="order-2 md:order-1">

                            <p className="text-sm font-medium text-slate-400">
                                Your overall score
                            </p>

                            <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                                {scoreMood.label}
                            </h2>

                            <p className="mt-3 max-w-xl leading-7 text-slate-300">
                                {interview.summary || scoreMood.message}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">

                                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                                    <p className="text-xs text-slate-400">
                                        Questions answered
                                    </p>
                                    <p className="mt-1 text-xl font-bold">
                                        {questions.length}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                                    <p className="text-xs text-slate-400">
                                        Average skill score
                                    </p>
                                    <p className="mt-1 text-xl font-bold">
                                        {Math.round(averageMetric)}
                                        <span className="text-sm text-slate-400">/100</span>
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                                    <p className="text-xs text-slate-400">
                                        Interview type
                                    </p>
                                    <p className="mt-1 text-xl font-bold capitalize">
                                        {interview.type || "General"}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* CIRCULAR SCORE */}
                        <div className="order-1 flex flex-col items-center justify-center md:order-2">

                            <div className="relative h-52 w-52 sm:h-60 sm:w-60">

                                <svg
                                    viewBox="0 0 220 220"
                                    className="h-full w-full -rotate-90"
                                >
                                    <circle
                                        cx="110"
                                        cy="110"
                                        r="91"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.08)"
                                        strokeWidth="13"
                                    />

                                    <motion.circle
                                        cx="110"
                                        cy="110"
                                        r="91"
                                        fill="none"
                                        stroke={scoreMood.color}
                                        strokeWidth="13"
                                        strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 91}
                                        initial={{
                                            strokeDashoffset: 2 * Math.PI * 91,
                                        }}
                                        animate={{
                                            strokeDashoffset:
                                                2 * Math.PI * 91 * (1 - score / 100),
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            ease: "easeOut",
                                            delay: 0.25,
                                        }}
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">

                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.65 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.5,
                                            type: "spring",
                                            stiffness: 120,
                                        }}
                                        className="text-6xl font-black tracking-tighter"
                                    >
                                        {score}
                                    </motion.span>

                                    <span className="mt-1 text-sm font-medium text-slate-400">
                                        OUT OF 100
                                    </span>

                                </div>
                            </div>

                            {/* FEELING CIRCLE */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                    scale: 0.8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    delay: 0.9,
                                    type: "spring",
                                }}
                                className="mt-3 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 py-2 pl-2 pr-5"
                            >

                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
                                    style={{
                                        backgroundColor: `${scoreMood.color}20`,
                                    }}
                                >
                                    {scoreMood.emoji}
                                </div>

                                <div>
                                    <p className="text-sm font-bold">
                                        {scoreMood.label}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Your interview feeling
                                    </p>
                                </div>

                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* QUICK STATS */}
                <motion.section
                    variants={fadeUp}
                    className="mb-8 grid gap-3 sm:grid-cols-3"
                >
                    {[
                        {
                            label: "Total questions",
                            value: questions.length,
                            icon: "✦",
                            accent: "text-cyan-300",
                        },
                        {
                            label: "Strongest skill",
                            value: strongestSkill,
                            icon: "↗",
                            accent: "text-emerald-300",
                        },
                        {
                            label: "Focus area",
                            value: focusArea,
                            icon: "◎",
                            accent: "text-amber-300",
                        },
                    ].map(item => (
                        <motion.div
                            key={item.label}
                            whileHover={{ y: -4 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                            }}
                            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    {item.label}
                                </p>
                                <span className={`text-xl ${item.accent}`}>
                                    {item.icon}
                                </span>
                            </div>

                            <p className="mt-3 text-2xl font-bold">
                                {item.value}
                            </p>
                        </motion.div>
                    ))}
                </motion.section>

                {/* SKILL ANALYSIS + RADAR */}
                <motion.section
                    variants={fadeUp}
                    className="mb-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
                >

                    {/* PERFORMANCE BARS */}
                    <div className="rounded-[1.75rem] border border-white/10 bg-[#111a2b]/90 p-6">

                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                                Skill intelligence
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                Performance breakdown
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Average scores across your interview answers
                            </p>
                        </div>

                        <div className="space-y-5">

                            {metricValues.map((item, index) => (
                                <div key={item.key}>

                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-slate-200">
                                            {item.label}
                                        </span>

                                        <span className="font-mono text-sm text-slate-400">
                                            {Math.round(item.value)}%
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">

                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{
                                                width: `${item.value}%`,
                                            }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.07,
                                                ease: "easeOut",
                                            }}
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                                        />

                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* RADAR CHART */}
                    <div className="rounded-[1.75rem] border border-white/10 bg-[#111a2b]/90 p-6">

                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
                            Visual analytics
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                            Skill radar
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            A shape of your current strengths
                        </p>

                        <div className="mt-5 flex justify-center">

                            <svg
                                viewBox="0 0 220 220"
                                className="w-full max-w-[310px]"
                                role="img"
                                aria-label="Radar chart showing average interview skill scores"
                            >

                                {[25, 50, 75, 100].map(level => (
                                    <polygon
                                        key={level}
                                        points={metricValues.map((_, index) => {
                                            const angle =
                                                (Math.PI * 2 * index) /
                                                metricValues.length -
                                                Math.PI / 2;

                                            const radius = 78 * level / 100;

                                            return `${
                                                110 + Math.cos(angle) * radius
                                            },${
                                                110 + Math.sin(angle) * radius
                                            }`;
                                        }).join(" ")}
                                        fill="none"
                                        stroke="rgba(148,163,184,0.2)"
                                        strokeWidth="1"
                                    />
                                ))}

                                {radarPoints.map(point => (
                                    <line
                                        key={point.key}
                                        x1="110"
                                        y1="110"
                                        x2={110 + Math.cos(point.angle) * 78}
                                        y2={110 + Math.sin(point.angle) * 78}
                                        stroke="rgba(148,163,184,0.25)"
                                        strokeWidth="1"
                                    />
                                ))}

                                <motion.polygon
                                    points={radarPolygon}
                                    fill="rgba(34,211,238,0.18)"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.3,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.9 }}
                                    style={{
                                        transformOrigin: "110px 110px",
                                    }}
                                />

                                {radarPoints.map(point => (
                                    <circle
                                        key={point.key}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3.5"
                                        fill="#a78bfa"
                                        stroke="#111a2b"
                                        strokeWidth="1.5"
                                    />
                                ))}

                                {radarPoints.map(point => (
                                    <text
                                        key={`${point.key}-label`}
                                        x={point.labelX}
                                        y={point.labelY}
                                        fill="#94a3b8"
                                        fontSize="7"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        {point.label.length > 11
                                            ? point.label.split(" ").map(word => word[0]).join("")
                                            : point.label}
                                    </text>
                                ))}

                            </svg>
                        </div>

                        <p className="text-center text-xs text-slate-500">
                            Abbreviated labels are used to keep the chart readable.
                        </p>
                    </div>
                </motion.section>

                {/* STRENGTHS AND WEAKNESSES */}
                <motion.section
                    variants={fadeUp}
                    className="mb-8 grid gap-5 md:grid-cols-2"
                >

                    {/* STRENGTHS */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-[1.75rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.10] to-[#111a2b] p-6"
                    >

                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-xl text-emerald-300">
                                ↗
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-emerald-300">
                                    Your strengths
                                </h2>
                                <p className="text-xs text-slate-400">
                                    What went well
                                </p>
                            </div>
                        </div>

                        {(interview.strengths || []).length ? (
                            <ul className="space-y-3">
                                {interview.strengths.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.08,
                                        }}
                                        className="flex gap-3 text-sm leading-6 text-slate-200"
                                    >
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400">
                                No strengths listed in this report.
                            </p>
                        )}

                    </motion.div>

                    {/* WEAKNESSES */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-[1.75rem] border border-amber-400/15 bg-gradient-to-br from-amber-500/[0.09] to-[#111a2b] p-6"
                    >

                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-xl text-amber-300">
                                ◎
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-amber-300">
                                    Growth opportunities
                                </h2>
                                <p className="text-xs text-slate-400">
                                    What to work on next
                                </p>
                            </div>
                        </div>

                        {(interview.weaknesses || []).length ? (
                            <ul className="space-y-3">
                                {interview.weaknesses.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.08,
                                        }}
                                        className="flex gap-3 text-sm leading-6 text-slate-200"
                                    >
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400">
                                No improvement areas listed in this report.
                            </p>
                        )}

                    </motion.div>
                </motion.section>

                {/* RECOMMENDATIONS */}
                <motion.section
                    variants={fadeUp}
                    className="mb-8 rounded-[1.75rem] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.10] to-[#111a2b] p-6 sm:p-7"
                >

                    <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/15 text-xl text-violet-300">
                            ✧
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">
                                Your next-step playbook
                            </h2>
                            <p className="text-sm text-slate-400">
                                Recommendations from your interview report
                            </p>
                        </div>
                    </div>

                    {(interview.recommendations || []).length ? (
                        <div className="grid gap-3 sm:grid-cols-2">

                            {interview.recommendations.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.015 }}
                                    className="flex gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-xs font-bold text-violet-200">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <p className="text-sm leading-6 text-slate-200">
                                        {item}
                                    </p>
                                </motion.div>
                            ))}

                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            No recommendations available for this report.
                        </p>
                    )}

                </motion.section>

                {/* QUESTION BY QUESTION ANALYSIS */}
                <motion.section
                    variants={fadeUp}
                    className="mb-8"
                >

                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                            Detailed review
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                            Question-by-question analysis
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Review your responses and the feedback for each question.
                        </p>
                    </div>

                    <div className="space-y-4">

                        {questions.map((q, index) => {
                            const questionScore = Math.max(
                                0,
                                Math.min(100, Number(q.feedback?.score) || 0)
                            );

                            return (
                                <motion.details
                                    key={index}
                                    initial={{
                                        opacity: 0,
                                        y: 14,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        amount: 0.1,
                                    }}
                                    transition={{
                                        delay: Math.min(index * 0.04, 0.3),
                                    }}
                                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111a2b]/90"
                                >

                                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">

                                        <div className="flex min-w-0 flex-1 items-center gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 font-bold text-cyan-300">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="line-clamp-2 font-semibold text-slate-100">
                                                    {q.question || `Question ${index + 1}`}
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {q.difficulty || "Standard"} difficulty
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                                                {questionScore}/100
                                            </span>

                                            <span className="text-slate-500 transition group-open:rotate-180">
                                                ⌄
                                            </span>

                                        </div>

                                    </summary>

                                    <div className="border-t border-white/[0.07] p-5">

                                        <div className="grid gap-4 md:grid-cols-2">

                                            {/* USER ANSWER */}
                                            <div className="rounded-xl bg-black/20 p-4">

                                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Your answer
                                                </p>

                                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                                    {q.userAnswer || "No answer provided."}
                                                </p>

                                            </div>

                                            {/* AI FEEDBACK */}
                                            <div className="rounded-xl bg-black/20 p-4">

                                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    AI feedback
                                                </p>

                                                <p className="text-sm leading-6 text-slate-200">
                                                    {q.feedback?.feedback || "No feedback available."}
                                                </p>

                                            </div>

                                        </div>

                                        {/* IMPROVEMENTS */}
                                        {q.feedback?.improvements?.length > 0 && (
                                            <div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.05] p-4">

                                                <p className="mb-2 text-sm font-semibold text-amber-200">
                                                    Areas to improve
                                                </p>

                                                <ul className="space-y-2">
                                                    {q.feedback.improvements.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2 text-sm text-slate-300"
                                                        >
                                                            <span className="text-amber-300">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>

                                            </div>
                                        )}

                                    </div>
                                </motion.details>
                            );
                        })}

                    </div>
                </motion.section>

                {/* FOOTER */}
                <motion.footer
                    variants={fadeUp}
                    className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row"
                >

                    <p className="text-sm text-slate-500">
                        Keep practicing. Consistency turns feedback into progress.
                    </p>

                    <button
                        onClick={() => navigate("/interview")}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-blue-900/50 sm:w-auto"
                    >
                        Back to Interviews
                        <span className="ml-2">→</span>
                    </button>

                </motion.footer>

            </motion.main>
        </div>
    );
}

export default InterviewReport;