
import React, { useState } from "react";
import { motion } from "motion/react";
import { FaBahai, FaArrowRight  } from "react-icons/fa";
import {
    FiFileText,
    FiMic,
    FiBarChart2,
    FiMap,
    FiArrowUpRight,
    FiCheck,
    FiZap,
    FiShield,
    FiTarget,
} from "react-icons/fi";
import { GiArtificialHive } from "react-icons/gi";

import LoginModel from "../components/LoginModel";
import dashboard from "../assets/multiAi.png";

function Home({ setUser }) {
    const [showLogin, setShowLogin] = useState(false);

    const agents = [
        {
            icon: <FiFileText />,
            title: "Resume Agent",
            subtitle: "Build your first impression",
            desc: "Create ATS-friendly resumes, improve your profile strength, and showcase your skills to recruiters.",
            number: "01",
            color: "from-violet-500/20 to-purple-500/5",
            iconColor: "text-violet-300",
            glow: "group-hover:shadow-violet-500/10",
        },
        {
            icon: <FiMic />,
            title: "Interview Agent",
            subtitle: "Practice like a professional",
            desc: "Experience realistic HR, technical, and coding interviews with intelligent AI simulations.",
            number: "02",
            color: "from-blue-500/20 to-cyan-500/5",
            iconColor: "text-blue-300",
            glow: "group-hover:shadow-blue-500/10",
        },
        {
            icon: <FiBarChart2 />,
            title: "Feedback Agent",
            subtitle: "Know where you stand",
            desc: "Analyze your answers, discover weaknesses, and receive detailed performance reports.",
            number: "03",
            color: "from-emerald-500/20 to-green-500/5",
            iconColor: "text-emerald-300",
            glow: "group-hover:shadow-emerald-500/10",
        },
        {
            icon: <FiMap />,
            title: "Roadmap Agent",
            subtitle: "Turn goals into action",
            desc: "Get personalized learning roadmaps and actionable recommendations based on your performance.",
            number: "04",
            color: "from-orange-500/20 to-amber-500/5",
            iconColor: "text-orange-300",
            glow: "group-hover:shadow-orange-500/10",
        },
    ];

    const benefits = [
        {
            icon: <FiZap />,
            title: "AI-powered intelligence",
            desc: "Multiple specialized AI agents working together to make your preparation smarter."
        },
        {
            icon: <FiTarget />,
            title: "Personalized preparation",
            desc: "A learning experience that adapts to your career goals and performance."
        },
        {
            icon: <FiShield />,
            title: "One unified platform",
            desc: "Everything you need for interview preparation in one organized workspace."
        }
    ];

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#08090D] text-white font-sans overflow-x-hidden selection:bg-violet-500/30">

            {/* BACKGROUND EFFECTS */}

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/[0.09] rounded-full blur-[150px]" />
                <div className="absolute top-[800px] -left-60 w-[500px] h-[500px] bg-blue-600/[0.06] rounded-full blur-[140px]" />
                <div className="absolute top-[1500px] -right-60 w-[500px] h-[500px] bg-purple-600/[0.05] rounded-full blur-[140px]" />
            </div>


            {/* NAVBAR */}

            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#08090D]/80 backdrop-blur-2xl"
            >
                <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">

                    {/* LOGO */}

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <FaBahai size={19} className="text-white" />
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight">
                                Multi<span className="text-violet-400">Ai</span>
                            </h1>
                            <p className="text-[9px] text-white/35 tracking-[2px] uppercase font-semibold">
                                Intelligent Career Platform
                            </p>
                        </div>
                    </div>


                    {/* NAV LINKS */}

                    <div className="hidden md:flex items-center gap-9 text-sm text-white/55 font-medium">
                        <a href="#home" className="hover:text-white transition-colors">
                            Home
                        </a>

                        <a href="#agents" className="hover:text-white transition-colors">
                            AI Agents
                        </a>

                        <a href="#features" className="hover:text-white transition-colors">
                            Features
                        </a>

                        <a href="#about" className="hover:text-white transition-colors">
                            About
                        </a>
                    </div>


                    {/* LOGIN BUTTON */}

                    <motion.button
                        onClick={() => setShowLogin(true)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-100 transition-colors shadow-lg shadow-white/5"
                    >
                        Login
                        <FaArrowRight  size={12} />
                    </motion.button>

                </div>
            </motion.nav>


            {/* HERO SECTION */}

            <section
                id="home"
                className="relative pt-36 sm:pt-44 pb-24 px-5"
            >

                <div className="max-w-7xl mx-auto">

                    <div className="max-w-4xl mx-auto text-center">

                        {/* BADGE */}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] text-violet-300 text-xs sm:text-sm font-medium mb-8"
                        >
                            <FiZap  className="text-violet-400" />

                            <span>Introducing Multi-Agent AI Technology</span>

                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </motion.div>


                        {/* HEADING */}

                        <motion.h1
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-[42px] sm:text-6xl md:text-7xl lg:text-[82px] leading-[1.08] font-black tracking-[-0.055em]"
                        >
                            Your Next Interview.

                            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400">
                                Your Best Performance.
                            </span>
                        </motion.h1>


                        {/* DESCRIPTION */}

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="max-w-2xl mx-auto mt-7 text-white/45 text-sm sm:text-base md:text-lg leading-8"
                        >
                            Meet your personal AI career team. Build powerful resumes,
                            practice real-world interviews, analyze your performance,
                            and follow personalized roadmaps to achieve your dream job.
                        </motion.p>


                        {/* BUTTONS */}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10"
                        >

                            <motion.button
                                onClick={() => setShowLogin(true)}
                                whileHover={{
                                    scale: 1.04,
                                    boxShadow: "0 0 45px rgba(139,92,246,0.35)"
                                }}
                                whileTap={{ scale: 0.96 }}
                                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-violet-600/20 transition-all"
                            >
                                Get Started For Free

                                <FiArrowUpRight
                                    size={18}
                                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                />
                            </motion.button>

                            <a
                                href="#agents"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/75 font-semibold text-sm transition-all"
                            >
                                Explore AI Agents
                                <FiArrowUpRight size={16} />
                            </a>

                        </motion.div>


                        {/* TRUST LINE */}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/35"
                        >
                            <span className="flex items-center gap-2">
                                <FiCheck className="text-emerald-400" />
                                AI-powered preparation
                            </span>

                            <span className="flex items-center gap-2">
                                <FiCheck className="text-emerald-400" />
                                Personalized feedback
                            </span>

                            <span className="flex items-center gap-2">
                                <FiCheck className="text-emerald-400" />
                                One unified platform
                            </span>
                        </motion.div>

                    </div>


                    {/* DASHBOARD PREVIEW */}

                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.4,
                            ease: "easeOut"
                        }}
                        className="relative max-w-5xl mx-auto mt-20"
                    >

                        {/* GLOW */}

                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-blue-500/10 to-purple-600/20 blur-[70px] opacity-70" />

                        <div className="relative rounded-2xl border border-white/10 bg-[#11131B] p-2 sm:p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]">

                            {/* TOP BAR */}

                            <div className="flex items-center justify-between px-3 py-3 sm:px-5 border-b border-white/[0.07] mb-3">

                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>

                                <span className="text-[10px] sm:text-xs text-white/35 font-medium tracking-wide">
                                    MULTIAI · YOUR CAREER WORKSPACE
                                </span>

                                <div className="w-12" />

                            </div>

                            <img
                                src={dashboard}
                                alt="MultiAi AI interview preparation dashboard"
                                className="w-full h-auto rounded-xl block"
                            />

                        </div>

                        {/* FLOATING LABEL */}

                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="hidden md:flex absolute -right-8 top-20 items-center gap-3 p-4 rounded-2xl border border-white/10 bg-[#171923]/95 backdrop-blur-xl shadow-2xl"
                        >
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300">
                                <FiZap  size={20} />
                            </div>

                            <div>
                                <p className="text-xs text-white/40">Powered by</p>
                                <p className="text-sm font-bold">Multiple AI Agents</p>
                            </div>
                        </motion.div>

                    </motion.div>

                </div>

            </section>


            {/* AI AGENTS SECTION */}

            <section
                id="agents"
                className="relative py-24 px-5 border-t border-white/[0.05]"
            >

                <div className="max-w-7xl mx-auto">

                    {/* SECTION HEADING */}

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] text-violet-300 text-xs font-semibold mb-6">
                            <GiArtificialHive size={15} />
                            YOUR PERSONAL AI TEAM
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Four Agents.
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400 mt-2">
                                One Career Goal.
                            </span>
                        </h2>

                        <p className="text-white/40 text-sm sm:text-base leading-7 mt-5 max-w-2xl mx-auto">
                            Every stage of your interview journey deserves a specialist.
                            Our intelligent AI agents work together to help you prepare,
                            improve, and succeed.
                        </p>

                    </motion.div>


                    {/* AGENT CARDS */}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        {agents.map((agent, i) => (

                            <motion.div
                                key={agent.number}
                                initial={{ opacity: 0, y: 35 }}
                                onClick={() => setShowLogin(true)}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.6,
                                    delay: i * 0.12
                                }}
                                whileHover={{ y: -10 }}
                                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131B] p-6 transition-all duration-500 hover:border-white/20 hover:shadow-2xl ${agent.glow}`}
                            >

                                {/* CARD GRADIENT */}

                                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-white/[0.04] blur-3xl group-hover:bg-white/[0.08] transition-all" />


                                <div className="relative z-10">

                                    {/* NUMBER */}

                                    <div className="flex items-center justify-between mb-10">

                                        <span className="text-xs text-white/25 font-bold tracking-[3px]">
                                            AGENT {agent.number}
                                        </span>

                                        <FiArrowUpRight className="text-white/25 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={19} />

                                    </div>


                                    {/* ICON */}

                                    <div className={`w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.06] flex items-center justify-center text-2xl ${agent.iconColor} shadow-lg mb-7 group-hover:scale-110 transition-transform duration-300`}>
                                        {agent.icon}
                                    </div>


                                    {/* TEXT */}

                                    <p className="text-[10px] uppercase tracking-[1.5px] font-bold text-white/35 mb-2">
                                        {agent.subtitle}
                                    </p>

                                    <h3 className="text-xl font-bold tracking-tight mb-3">
                                        {agent.title}
                                    </h3>

                                    <p className="text-white/40 text-sm leading-7">
                                        {agent.desc}
                                    </p>

                                    <div className="mt-7 pt-5 border-t border-white/[0.08] flex items-center justify-between">

                                        <span className="text-xs text-white/35">
                                            Intelligent AI Agent
                                        </span>

                                        <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-violet-400" : i === 1 ? "bg-blue-400" : i === 2 ? "bg-emerald-400" : "bg-orange-400"} shadow-[0_0_10px_currentColor]`} />

                                    </div>

                                </div>

                            </motion.div>

                        ))}

                    </div>

                </div>

            </section>


            {/* FEATURES SECTION */}

            <section
                id="features"
                className="relative py-24 px-5 border-t border-white/[0.05]"
            >

                <div className="max-w-7xl mx-auto">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT CONTENT */}

                        <motion.div
                            initial={{ opacity: 0, x: -35 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] text-blue-300 text-xs font-semibold mb-7">
                                <FiZap />
                                BUILT FOR YOUR SUCCESS
                            </div>

                            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                                More than an
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mt-2">
                                    Interview Platform.
                                </span>
                            </h2>

                            <p className="mt-6 text-white/40 text-sm sm:text-base leading-8 max-w-xl">
                                Interview preparation should not be limited to answering
                                questions. MultiAi brings intelligence, personalized
                                guidance, and continuous improvement together in one place.
                            </p>

                            <motion.button
                                onClick={() => setShowLogin(true)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="mt-9 flex items-center gap-3 bg-white text-black rounded-xl px-6 py-3.5 font-bold text-sm hover:bg-violet-100 transition-colors"
                            >
                                Start Your Journey
                                <FiArrowUpRight size={18} />
                            </motion.button>

                        </motion.div>


                        {/* RIGHT FEATURE CARDS */}

                        <div className="space-y-4">

                            {benefits.map((benefit, i) => (

                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, x: 35 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.15
                                    }}
                                    className="group flex items-start gap-5 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-violet-400/20 transition-all duration-300"
                                >

                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-400/10 flex items-center justify-center text-violet-300 text-xl group-hover:scale-110 transition-transform">
                                        {benefit.icon}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-base mb-2">
                                            {benefit.title}
                                        </h3>

                                        <p className="text-sm text-white/40 leading-7">
                                            {benefit.desc}
                                        </p>
                                    </div>

                                </motion.div>

                            ))}

                        </div>

                    </div>

                </div>

            </section>


            {/* CTA SECTION */}

            <section
                id="about"
                className="relative px-5 py-20"
            >

                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#19142B] via-[#111426] to-[#101725] px-6 sm:px-12 py-16 text-center"
                >

                    {/* DECORATIVE GLOW */}

                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-500/20 blur-[100px]" />

                    <div className="relative z-10">

                        <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center text-violet-300 text-2xl mb-7">
                            <FaBahai />
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Your Dream Job Starts
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400 mt-2">
                                With Better Preparation.
                            </span>
                        </h2>

                        <p className="text-white/45 max-w-xl mx-auto mt-6 text-sm sm:text-base leading-7">
                            Stop preparing randomly. Start preparing intelligently
                            with your own team of AI-powered career assistants.
                        </p>

                        <motion.button
                            onClick={() => setShowLogin(true)}
                            whileHover={{
                                scale: 1.06,
                                boxShadow: "0 0 40px rgba(139,92,246,0.35)"
                            }}
                            whileTap={{ scale: 0.96 }}
                            className="mt-9 inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-violet-100 transition-colors"
                        >
                            Get Started For Free
                            <FaArrowRight  />
                        </motion.button>

                    </div>

                </motion.div>

            </section>


            {/* FOOTER */}

            <footer className="relative border-t border-white/[0.07] bg-[#07080B] px-5">

                <div className="max-w-7xl mx-auto py-10">

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-7">

                        {/* LOGO */}

                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <GiArtificialHive size={19} />
                            </div>

                            <div>
                                <h3 className="font-extrabold tracking-tight text-lg">
                                    Multi<span className="text-violet-400">Ai</span>
                                </h3>

                                <p className="text-[10px] text-white/35 tracking-wider">
                                    INTELLIGENCE MEETS AMBITION
                                </p>
                            </div>

                        </div>


                        {/* FOOTER LINKS */}

                        <div className="flex items-center flex-wrap justify-center gap-6 text-xs text-white/40">

                            <a href="#home" className="hover:text-white transition-colors">
                                Home
                            </a>

                            <a href="#agents" className="hover:text-white transition-colors">
                                AI Agents
                            </a>

                            <a href="#features" className="hover:text-white transition-colors">
                                Features
                            </a>

                            <button
                                onClick={() => setShowLogin(true)}
                                className="hover:text-white transition-colors"
                            >
                                Login
                            </button>

                        </div>

                    </div>


                    <div className="mt-9 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">

                        <p className="text-xs text-white/30">
                            © {new Date().getFullYear()} MultiAi. All rights reserved.
                        </p>

                        <p className="text-xs text-white/30">
                            Built with intelligence. Designed for ambition.
                        </p>

                    </div>

                </div>

            </footer>


            {/* LOGIN MODAL */}

            {showLogin && (
                <LoginModel
                    onclose={() => setShowLogin(false)}
                    setUser={setUser}
                />
            )}

        </div>
    );
}

export default Home;
