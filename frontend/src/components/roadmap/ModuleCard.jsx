
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
    FiClock,
    FiChevronDown,
    FiChevronUp,
    FiYoutube,
    FiBookOpen,
} from "react-icons/fi";

function ModuleCard({ module, index }) {

    const [open, setOpen] = useState(false);

    const difficultyColors = {
        Easy: {
            text: "text-emerald-400",
            bg: "bg-emerald-500/10",
            dot: "bg-emerald-400",
            style: "#34d399",
        },

        Medium: {
            text: "text-violet-400",
            bg: "bg-violet-500/10",
            dot: "bg-violet-400",
            style: "#a78bfa",
        },

        Hard: {
            text: "text-red-400",
            bg: "bg-red-500/10",
            dot: "bg-red-400",
            style: "#f87171",
        },
    };

    const difficulty =
        difficultyColors[module.difficulty] ||
        difficultyColors.Medium;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
                duration: 0.35,
                delay: index * 0.06,
            }}
            whileHover={{ y: -2 }}
            onClick={() => setOpen(!open)}
            className="relative overflow-hidden bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl cursor-pointer shadow-[0_4px_18px_rgba(0,0,0,0.08)] hover:border-white/20 transition-colors"
        >

            {/* Glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />

            <div className="relative">

                {/* Card heading */}
                <div className="flex items-center gap-3 p-3 sm:p-4">

                    {/* Module number */}
                    <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold bg-white/[0.05] border border-white/10"
                        style={{ color: difficulty.style }}
                    >
                        {index + 1}
                    </div>

                    {/* Module title */}
                    <div className="flex-1 min-w-0">

                        <p className="text-sm font-semibold text-white truncate">
                            {module.title}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">

                            <FiClock
                                size={10}
                                className="text-white/30"
                            />

                            <span className="text-[10px] text-white/35">
                                {module.duration}
                            </span>

                        </div>

                    </div>

                    {/* Difficulty */}
                    <div className="flex items-center gap-2 shrink-0">

                        <span
                            className={`hidden sm:block text-[10px] font-semibold px-2 py-1 rounded-md ${difficulty.bg} ${difficulty.text}`}
                        >
                            {module.difficulty}
                        </span>

                        <span
                            className="sm:hidden text-[9px] font-semibold"
                            style={{ color: difficulty.style }}
                        >
                            {module.difficulty}
                        </span>

                        {open ? (
                            <FiChevronUp
                                size={15}
                                className="text-white/30"
                            />
                        ) : (
                            <FiChevronDown
                                size={15}
                                className="text-white/30"
                            />
                        )}

                    </div>

                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>

                    {open && (

                        <motion.div
                            initial={{
                                height: 0,
                                opacity: 0,
                            }}
                            animate={{
                                height: "auto",
                                opacity: 1,
                            }}
                            exit={{
                                height: 0,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.22,
                            }}
                            className="overflow-hidden"
                        >

                            <div className="relative px-4 pb-4 pt-3 border-t border-white/[0.08]">

                                {/* Description */}
                                <p className="text-xs text-white/45 mt-1 mb-4 leading-relaxed">
                                    {module.description}
                                </p>

                                {/* Resource buttons */}
                                <div className="flex flex-wrap gap-2">

                                    {module.youtube ? (

                                        <a
                                            href={module.youtube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-lg border border-red-500/25 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                        >
                                            <FiYoutube size={12} />
                                            Watch Tutorial
                                        </a>

                                    ) : (

                                        <span className="text-[10px] px-3 py-2 rounded-lg border border-white/10 text-white/30">
                                            Video unavailable
                                        </span>

                                    )}

                                    {module.article ? (

                                        <a
                                            href={module.article}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-lg border border-white/10 text-white/55 hover:bg-white/10 hover:text-white/80 transition-colors"
                                        >
                                            <FiBookOpen size={12} />
                                            Read Article
                                        </a>

                                    ) : (

                                        <span className="text-[10px] px-3 py-2 rounded-lg border border-white/10 text-white/30">
                                            Article unavailable
                                        </span>

                                    )}

                                </div>

                            </div>

                        </motion.div>

                    )}

                </AnimatePresence>

            </div>

        </motion.div>
    );
}

export default ModuleCard;
