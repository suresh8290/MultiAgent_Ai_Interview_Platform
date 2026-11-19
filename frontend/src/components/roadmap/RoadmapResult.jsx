
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
    FiX,
    FiTarget,
    FiClock,
    FiCheckCircle,
    FiMap,
} from "react-icons/fi";

import ModuleCard from "./ModuleCard";

function RoadmapResult({ roadmap, onClear }) {

    const stats = [
        {
            label: "Difficulty",
            value: roadmap.level,
            icon: FiTarget,
        },
        {
            label: "Duration",
            value: roadmap.duration,
            icon: FiClock,
        },
        {
            label: "Modules",
            value: roadmap.modules?.length || 0,
            icon: FiCheckCircle,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >

            {/* Main result container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-5 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            >

                {/* Glass effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />

                <div className="relative">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">

                        <div className="min-w-0">

                            <p className="text-[10px] text-white/35 font-semibold tracking-widest uppercase mb-1">
                                Your Roadmap
                            </p>

                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white break-words">
                                {roadmap.title}
                            </h2>

                            <p className="text-xs text-white/45 mt-2">
                                Target Package:{" "}
                                <span className="text-violet-400 font-medium">
                                    {roadmap.targetPackage}
                                </span>
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={onClear}
                            className="shrink-0 text-white/30 hover:text-white/80 transition-colors mt-1"
                            title="Close roadmap"
                        >
                            <FiX size={19} />
                        </button>

                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                        {stats.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-xl p-3 bg-white/[0.05] border border-white/[0.08]"
                                >

                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon
                                            size={11}
                                            className="text-white/30"
                                        />

                                        <span className="text-[10px] text-white/30">
                                            {item.label}
                                        </span>
                                    </div>

                                    <p className="text-sm font-semibold text-white">
                                        {item.value}
                                    </p>

                                </div>
                            );
                        })}

                    </div>

                </div>
            </motion.div>

            {/* Learning modules */}
            <div className="mb-4">

                <p className="text-[10px] text-black/40 font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiMap size={12} />
                    Learning Modules
                </p>

                <div className="flex flex-col gap-2">

                    <AnimatePresence>
                        {(roadmap.modules || []).map((module, index) => (

                            <ModuleCard
                                key={`${module.title}-${index}`}
                                module={module}
                                index={index}
                            />

                        ))}
                    </AnimatePresence>

                </div>

                {(!roadmap.modules || roadmap.modules.length === 0) && (
                    <p className="text-center text-xs text-black/40 py-8">
                        No learning modules available.
                    </p>
                )}

            </div>

        </motion.div>
    );
}

export default RoadmapResult;
