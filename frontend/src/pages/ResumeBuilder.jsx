import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    FiArrowLeft,
    FiArrowRight,
    FiEye,
} from "react-icons/fi";

import ResumeForm from "../components/resume/ResumeForm";
import initialData from "../components/resume/initialData";
import ResumePreview from "../components/resume/ResumePreview";
import { useCoins } from "../apis/user.api";

const STORAGE_KEY = "resumeBuilderData";

const loadSavedResume = () => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        return savedData
            ? { ...initialData, ...JSON.parse(savedData) }
            : initialData;
    } catch (error) {
        console.error("Failed to load saved resume:", error);
        return initialData;
    }
};


const steps = [
    { step: 1, title: "Personal Info", subtitle: "Your basic contact details" },
    { step: 2, title: "Professional Summary", subtitle: "Introduce yourself" },
    { step: 3, title: "Skills", subtitle: "Highlight your technical skills" },
    { step: 4, title: "Work Experience", subtitle: "Showcase your experience" },
    { step: 5, title: "Projects", subtitle: "Highlight your projects" },
    { step: 6, title: "Education", subtitle: "Your educational background" },
    { step: 7, title: "Certifications", subtitle: "Show your earned credentials" },
    { step: 8, title: "Achievements", subtitle: "Highlight your accomplishments" },
    { step: 9, title: "Coding Profiles", subtitle: "Show your coding activity" },
    { step: 10, title: "Position of Responsibility", subtitle: "Show leadership and responsibility" },
];


export default function ResumeBuilder() {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();
    const [data, setData] = useState(() => {
        const savedData = loadSavedResume();

        return {
            ...savedData,
            experience: savedData.experience || [],
            projects: savedData.projects || [],
            education: savedData.education || [],
            certifications: savedData.certifications || [],
            achievement: savedData.achievement || [],
            codingProfile: savedData.codingProfile || [],
            responsibility: savedData.responsibility || [],
        };
    });

    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save resume:", error);
        }
    }, [data]);

    const totalSteps = steps.length;

    const activeStep = steps.find(
        (item) => item.step === currentStep
    );

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    const progress = Math.round(
        (currentStep / totalSteps) * 100
    );

    const goPrevious = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const goNext = () => {
        setCurrentStep((prev) =>
            Math.min(totalSteps, prev + 1)
        );
    };

    const openPreview = () => {
        setShowPreview(true);
    };

    return (
        <main className="min-h-screen bg-white text-black  ">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">

  <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8">

    {/* Left: Brand */}
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

    {/* Center: Page Title */}
    <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 sm:flex">

      <h1 className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 lg:text-lg">
        Resume Builder
      </h1>
    </div>

    {/* Mobile title */}
    <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-gray-800 sm:hidden">
      Resume Builder
    </h1>

    {/* Right: Dashboard */}
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
      className="group flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
    >
      <FiArrowLeft
        size={15}
        className="transition-transform group-hover:-translate-x-0.5"
      />

      <span>Dashboard</span>
    </button>

  </div>
</nav>

            {/* Main Form */}
            <section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
                {/* Progress Header */}
                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>
                            Step {currentStep} of {totalSteps}
                        </span>

                        <span>{progress}% complete</span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="h-2 overflow-hidden rounded-full bg-gray-100"
                        role="progressbar"
                        aria-valuemin={1}
                        aria-valuemax={totalSteps}
                        aria-valuenow={currentStep}
                        aria-label="Resume completion progress"
                    >
                        <div
                            className="h-full rounded-full bg-black transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Active Step Title */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {activeStep?.title}
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                {activeStep?.subtitle}
                            </p>
                        </div>

                        <span className="text-sm text-gray-400">
                            {currentStep}/{totalSteps}
                        </span>
                    </div>

                    {/* Step Indicators */}
                    <div className="mt-5 flex items-center justify-center gap-2">
                        {steps.map((item) => (
                            <button
                                key={item.step}
                                type="button"
                                aria-label={`Go to step ${item.step}: ${item.title}`}
                                aria-current={
                                    item.step === currentStep ? "step" : undefined
                                }
                                title={item.title}
                                onClick={() => setCurrentStep(item.step)}
                                className={`h-2 rounded-full transition-all duration-300 ${item.step === currentStep
                                    ? "w-8 bg-black"
                                    : item.step < currentStep
                                        ? "w-2 bg-gray-500"
                                        : "w-2 bg-gray-200 hover:bg-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="rounded-xl border border-black/10 p-4 sm:p-6">
                    <ResumeForm
                        step={currentStep}
                        data={data}
                        setData={setData}
                    />

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
                        <button
                            type="button"
                            onClick={goPrevious}
                            disabled={isFirstStep}
                            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiArrowLeft />
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={openPreview}
                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-100"
                        >
                            <FiEye />
                            Preview
                        </button>

                        {isLastStep ? (
                            <button
                                type="button"
                                onClick={openPreview}
                                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
                            >
                                <FiEye />
                                Preview Resume
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={goNext}
                                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
                            >
                                Next
                                <FiArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Resume Preview */}
            {showPreview && (
                <ResumePreview
                    data={data}
                    onClose={() => setShowPreview(false)}
                    useCoins={useCoins}
                />
            )}


        </main>
    );
}
