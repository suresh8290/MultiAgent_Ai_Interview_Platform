
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiClock,
    FiChevronDown,
    FiCheck,
    FiFileText,
    FiZap,
    FiSend,
    FiX,
    FiMap,
} from "react-icons/fi";

import api from "../utils/axios";
import { useCoins } from "../apis/user.api";
import { useSelector } from "react-redux";
import RoadmapResult from "../components/roadmap/RoadmapResult";

const PACKAGE_OPTIONS = [
    "10 LPA",
    "15 LPA",
    "20 LPA",
    "30 LPA",
    "40 LPA",
];

function Roadmap({ user, setUser }) {
    const navigate = useNavigate();

    const [historyOpen, setHistoryOpen] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [role, setRole] = useState("");
    const [targetPackage, setTargetPackage] = useState(PACKAGE_OPTIONS[2]);
    const [packageOpen, setPackageOpen] = useState(false);
    const [useResume, setUseResume] = useState(false);

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");

    const { resume } = useSelector((state) => state.resume);

    // Fetch all roadmaps
    const getAllRoadmap = async () => {
        setHistoryLoading(true);

        try {
            const response = await api.get("/api/roadmap/all");

            setHistory(response.data.data || []);

        } catch (error) {
            console.error("Get all roadmaps error:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Fetch history when component mounts
    useEffect(() => {
        getAllRoadmap();
    }, []);

    // Fetch individual roadmap by ID
    const getRoadmapById = async (id) => {
        try {
            const response = await api.get(`/api/roadmap/${id}`);

            setRoadmap(response.data.data);

            console.log("Roadmap by ID:", response.data);

        } catch (error) {
            console.error(
                "Get roadmap by ID error:",
                error.response?.data || error
            );
        }
    };

    // Generate roadmap
    const handleGenerate = async () => {
        if (!role.trim() || loading) return;

        setLoading(true);
        setError("");

        try {
            // Deduct coins
            try {
                const coinResponse = await useCoins({
                    coins: 20,
                    action: "Roadmap-builder",
                });

                setUser((prev) => ({
                    ...prev,
                    interviewCoin: coinResponse?.interviewCoin,
                }));

            } catch (error) {
                console.error(
                    "Coin deduction error:",
                    error.response?.data || error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to use coins"
                );

                return;
            }

            // Generate roadmap
            const response = await api.post(
                "/api/roadmap/generate",
                {
                    role: role.trim(),
                    targetPackage,
                    useResume,
                    resume: useResume ? resume : null,
                }
            );

            setRoadmap(response.data.data);

            // Refresh history after generating new roadmap
            await getAllRoadmap();

        } catch (err) {
            console.error(
                "Roadmap generation error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Something went wrong."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col">

            {/* Navbar */}
<nav className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">

    <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8">

        {/* Brand */}
        <div
            onClick={() => navigate("/dashboard")}
            className="group flex shrink-0 cursor-pointer items-center gap-2"
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                M
            </div>

            <span className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                Multi.AI
            </span>
        </div>

        {/* Page title - Desktop only */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 sm:flex">
            <h1 className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 lg:text-lg">
                AI Roadmap Builder
            </h1>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">

            {/* History */}
            <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 sm:text-sm"
            >
                <FiClock size={15} />
                <span className="hidden sm:inline">History</span>
            </button>

            {/* Dashboard */}
            <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="group flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 sm:gap-2 sm:px-4 sm:text-sm"
            >
                <FiArrowLeft
                    size={15}
                    className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Dashboard</span>
            </button>

        </div>
    </div>
</nav>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-28 sm:pb-32 pt-8 sm:pt-10">

                <div className="max-w-5xl mx-auto px-3 sm:px-5">

                    <AnimatePresence mode="wait">

                        {!roadmap ? (

                            <motion.div
                                key="generator"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-2 sm:px-4"
                            >

                                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-5 shadow-lg shadow-black/10">
                                    <FiMap className="text-white" size={25} />
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                    AI Roadmap Generator
                                </h3>

                                <p className="text-black/45 text-sm max-w-xs sm:max-w-md mt-2">
                                    Generate a personalised roadmap for your dream job.
                                </p>

                                <p className="text-black/35 text-xs sm:text-sm max-w-xs sm:max-w-md mt-1">
                                    Choose a role and let AI build a complete learning path.
                                </p>

                                {error && (
                                    <p className="mt-4 text-xs text-red-500 max-w-xs sm:max-w-md">
                                        {error}
                                    </p>
                                )}

                                {/* Suggested roles */}
                                <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm">

                                    {[
                                        "Frontend Dev",
                                        "Backend Eng",
                                        "ML Engineer",
                                    ].map((r) => (

                                        <motion.button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative overflow-hidden text-xs py-2.5 px-2 sm:px-3 rounded-xl border transition-all shadow-sm ${
                                                role === r
                                                    ? "bg-black text-white border-black"
                                                    : "bg-black/90 border-white/10 text-white/55 hover:text-white hover:border-white/25"
                                            }`}
                                        >
                                            <span className="relative">{r}</span>
                                        </motion.button>

                                    ))}

                                </div>

                            </motion.div>

                        ) : (

                            <RoadmapResult
                                roadmap={roadmap}
                                onClear={() => setRoadmap(null)}
                            />

                        )}

                    </AnimatePresence>

                </div>
            </main>

            {/* Bottom generator input */}
            {!roadmap && (
                <div className="fixed bottom-0 left-0 right-0 z-30 pb-3 sm:pb-4 pt-3 px-3 sm:px-4 bg-gradient-to-t from-white via-white/95 to-transparent">

                    <div className="max-w-3xl mx-auto">

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative overflow-visible flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#000000]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                        >

                            <input
                                type="text"
                                placeholder="Backend Developer"
                                onChange={(e) => setRole(e.target.value)}
                                value={role}
                                className="relative flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-white/30 outline-none px-2 py-1.5"
                            />

                            {/* Package selector */}
                            <div className="relative">

                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setPackageOpen(!packageOpen)}
                                    className="relative flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all whitespace-nowrap"
                                >
                                    {targetPackage}

                                    <FiChevronDown
                                        size={12}
                                        className={`transition-transform ${
                                            packageOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </motion.button>

                                <AnimatePresence>
                                    {packageOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full right-0 mb-4 w-28 rounded-xl overflow-hidden border border-white/10 bg-[#111111] shadow-[0_8px_28px_rgba(0,0,0,0.25)] z-50 p-1"
                                        >
                                            {PACKAGE_OPTIONS.map((pkg) => (
                                                <button
                                                    key={pkg}
                                                    type="button"
                                                    onClick={() => {
                                                        setTargetPackage(pkg);
                                                        setPackageOpen(false);
                                                    }}
                                                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                                                        targetPackage === pkg
                                                            ? "bg-white/10 text-white"
                                                            : "text-white/55 hover:bg-white/5 hover:text-white/90"
                                                    }`}
                                                >
                                                    {pkg}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>

                            {/* Resume toggle */}
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setUseResume(!useResume)}
                                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all ${
                                    useResume
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-white/5 text-white/65"
                                }`}
                            >
                                {useResume ? (
                                    <>
                                        <FiCheck size={13} />
                                        Added
                                    </>
                                ) : (
                                    <>
                                        <FiFileText size={13} />
                                        Resume
                                    </>
                                )}
                            </motion.button>

                            {/* Generate button */}
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleGenerate}
                                disabled={loading || !role.trim()}
                                className="relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs text-black bg-white hover:bg-white/90 shadow-[0_2px_10px_rgba(255,255,255,0.15)] transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: "linear",
                                            }}
                                        >
                                            <FiZap size={13} />
                                        </motion.span>
                                        <span className="hidden sm:inline">
                                            Generating...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={13} />
                                        <span className="hidden sm:inline">
                                            Generate
                                        </span>
                                    </>
                                )}
                            </motion.button>

                        </motion.div>
                    </div>
                </div>
            )}

           {/* History sidebar */}
<AnimatePresence>
    {historyOpen && (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setHistoryOpen(false)}
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 32,
                }}
                className="
                    fixed right-0 top-0 z-[70]
                    h-dvh
                    flex flex-col
                    w-[300px] sm:w-[340px]
                    max-w-[85vw]
                    bg-white
                    border-l border-black/10
                    shadow-2xl
                    overflow-hidden
                "
            >

                {/* Sidebar header */}
                <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-black/10 bg-white/95 backdrop-blur-xl">

                    <span className="text-sm font-semibold text-black">
                        Previous Roadmaps
                    </span>

                    <button
                        type="button"
                        onClick={() => setHistoryOpen(false)}
                        className="text-black/35 hover:text-black transition-colors"
                    >
                        <FiX size={16} />
                    </button>

                </div>

                {/* Scrollable History List */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3">

                    <div className="flex flex-col gap-2">

                        {historyLoading ? (

                            <p className="text-xs text-black/35 text-center py-6">
                                Loading...
                            </p>

                        ) : history.length === 0 ? (

                            <p className="text-xs text-black/35 text-center py-6">
                                No roadmaps yet.
                            </p>

                        ) : (

                            history.map((h) => (

                                <button
                                    key={h._id}
                                    type="button"
                                    onClick={() => {
                                        getRoadmapById(h._id);
                                        setHistoryOpen(false);
                                    }}
                                    className="
                                        shrink-0 w-full
                                        text-left p-4
                                        rounded-xl
                                        border border-white/10
                                        bg-black/90
                                        hover:bg-black
                                        transition-all
                                    "
                                >

                                    <h3 className="text-sm font-semibold text-white truncate">
                                        {h.title || h.role}
                                    </h3>

                                    <div className="flex items-center justify-between gap-2 mt-3">

                                        <span className="text-xs text-violet-400 font-medium">
                                            {h.targetPackage}
                                        </span>

                                        <span className="text-xs text-violet-400 font-medium">
                                            {h.duration}
                                        </span>

                                    </div>

                                    <p className="text-[10px] text-white/30 mt-2">
                                        {h.createdAt
                                            ? new Date(h.createdAt).toLocaleDateString()
                                            : ""}
                                    </p>

                                </button>

                            ))

                        )}

                    </div>

                </div>

            </motion.aside>
        </>
    )}
</AnimatePresence>

        </div>
    );
}

export default Roadmap;
