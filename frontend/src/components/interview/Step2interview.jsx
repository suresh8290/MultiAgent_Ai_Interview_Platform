import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiCode,
  FiSend, FiClock, FiCheckCircle, FiVolume2, FiVolumeX
} from "react-icons/fi";
import { submitAnswer } from "../../apis/interview.api";

function Step2interview({ interviewData, user, maleVideoSrc, femaleVideoSrc }) {
  const navigate = useNavigate();

  const interviewId = interviewData?.interviewId || interviewData?._id;
  const questions = interviewData?.questions || [];

  const [question, setQuestion] = useState(
    questions[interviewData?.currentQuestion || 0] ||
    interviewData?.question || null
  );
  const [currentIndex, setCurrentIndex] = useState(interviewData?.currentQuestion || 0);
  const [totalQuestions] = useState(interviewData?.totalQuestions || questions.length);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timerLeft, setTimerLeft] = useState(question?.timer || 60);
  const [timerActive, setTimerActive] = useState(true);

  // Dictation is OFF initially.
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [introSpoken, setIntroSpoken] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  const answerRef = useRef("");
  const micOnRef = useRef(false);
  const mutedRef = useRef(false);
  const aiPlayingRef = useRef(false);
  const timerActiveRef = useRef(true);
  const recognitionActiveRef = useRef(false);
  const recognitionPausedRef = useRef(true);
  const submittingRef = useRef(false);
  const autoSubmitRef = useRef(false);
  const lastSpokenRef = useRef("");

  const questionText =
    typeof question === "string" ? question : question?.question || "";

  const difficulty = question?.difficulty || "Easy";
  const videoSource = voiceGender === "female" ? femaleVideoSrc : maleVideoSrc;

  const updateAnswer = (value) => {
    answerRef.current = value;
    setAnswer(value);
  };

  // Load available browser voices.
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const voice = voices.find(v => v.lang?.startsWith("en")) || voices[0];
      setSelectedVoice(voice);

      const name = voice.name.toLowerCase();
      if (/female|woman|zira|samantha|aria|jenny/.test(name)) {
        setVoiceGender("female");
      } else if (/male|man|david|guy/.test(name)) {
        setVoiceGender("male");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Speech recognition controls.
  const startListening = useCallback(() => {
    if (
      !recognitionRef.current ||
      recognitionActiveRef.current ||
      recognitionPausedRef.current ||
      !micOnRef.current ||
      aiPlayingRef.current ||
      !timerActiveRef.current ||
      submittingRef.current
    ) return;

    try {
      recognitionRef.current.start();
    } catch {
      // Recognition may already be starting.
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionPausedRef.current = true;

    try {
      recognitionRef.current?.abort();
    } catch {}

    recognitionActiveRef.current = false;
    setListening(false);
    setInterimTranscript("");
  }, []);

  const resumeListening = useCallback(() => {
    recognitionPausedRef.current = false;

    if (micOnRef.current && timerActiveRef.current && !submittingRef.current) {
      startListening();
    }
  }, [startListening]);

  // Initialize speech recognition.
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      setListening(false);

      if (
        micOnRef.current &&
        timerActiveRef.current &&
        !aiPlayingRef.current &&
        !recognitionPausedRef.current &&
        !submittingRef.current
      ) {
        setTimeout(startListening, 300);
      }
    };

    recognition.onresult = (event) => {
      if (
        aiPlayingRef.current ||
        recognitionPausedRef.current ||
        submittingRef.current ||
        !micOnRef.current
      ) return;

      let finalText = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalText.trim()) {
        updateAnswer(
          `${answerRef.current} ${finalText.trim()}`.trim()
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition:", event.error);
      setListening(false);
      recognitionActiveRef.current = false;

      if (["not-allowed", "service-not-allowed"].includes(event.error)) {
        micOnRef.current = false;
        setMicOn(false);
        recognitionPausedRef.current = true;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionPausedRef.current = true;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [startListening]);

  // AI speech.
  const speak = useCallback((text, resumeMic = true) => {
    if (!text) return Promise.resolve();

    setSubtitle(text);
    lastSpokenRef.current = text;

    aiPlayingRef.current = true;
    setIsAIPlaying(true);
    stopListening();

    if (mutedRef.current || !window.speechSynthesis) {
      aiPlayingRef.current = false;
      setIsAIPlaying(false);
      if (resumeMic) resumeListening();
      return Promise.resolve();
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 0.95;
    utterance.pitch = 1;

    return new Promise(resolve => {
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        aiPlayingRef.current = false;
        setIsAIPlaying(false);

        if (resumeMic) resumeListening();
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, stopListening, resumeListening]);

  // Mute / unmute interviewer.
  const toggleSpeaker = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setSpeakerMuted(next);

    if (next) {
      window.speechSynthesis?.cancel();
      aiPlayingRef.current = false;
      setIsAIPlaying(false);
      resumeListening();
    } else if (lastSpokenRef.current) {
      speak(lastSpokenRef.current);
    }
  };

  // AI video animation.
  useEffect(() => {
    const video = aiVideoRef.current;
    if (!video) return;

    if (isAIPlaying && !speakerMuted) video.play().catch(() => {});
    else video.pause();
  }, [isAIPlaying, speakerMuted, videoSource]);

  // Speak introduction and question.
  useEffect(() => {
    if (!questionText) return;

    let cancelled = false;

    const run = async () => {
      window.speechSynthesis?.cancel();
      await new Promise(resolve => setTimeout(resolve, 500));
      if (cancelled) return;

      if (!introSpoken) {
        await speak(
          `Welcome ${user?.name || "Candidate"}. Let's begin your interview.`,
          false
        );
        if (cancelled) return;
        setIntroSpoken(true);
      }

      await speak(questionText);
      if (!cancelled) resumeListening();
    };

    run();

    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
      aiPlayingRef.current = false;
      setIsAIPlaying(false);
    };
  }, [questionText, currentIndex, introSpoken, speak, resumeListening, user?.name]);

  // Reset question state. Dictation remains OFF for every question.
  useEffect(() => {
    setTimerLeft(question?.timer || 60);
    setTimerActive(true);
    timerActiveRef.current = true;
    autoSubmitRef.current = false;
    submittingRef.current = false;

    updateAnswer("");
    setFeedback(null);
    setMicOn(false);
    micOnRef.current = false;
    recognitionPausedRef.current = true;
    setInterimTranscript("");
  }, [question, currentIndex]);

  // Timer.
  useEffect(() => {
    if (!timerActive || loading) return;

    timerRef.current = setInterval(() => {
      setTimerLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerActive, loading]);

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  // Submit text answer and code together through the existing answer field.
  const handleSubmit = async (finalAnswer = null) => {
    const textAnswer =
      finalAnswer !== null ? finalAnswer.trim() : answerRef.current.trim();

    const codeAnswer = code.trim();

    if (
      (!textAnswer && !codeAnswer) ||
      submittingRef.current ||
      !interviewId
    ) return;

    // Keep the existing API/database schema unchanged.
    const combinedAnswer = [
      textAnswer ? `ANSWER:\n${textAnswer}` : "",
      codeAnswer ? `CODE (${codeLanguage}):\n${codeAnswer}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    submittingRef.current = true;
    setLoading(true);
    setTimerActive(false);
    timerActiveRef.current = false;
    micOnRef.current = false;
    setMicOn(false);

    stopListening();
    window.speechSynthesis?.cancel();
    aiPlayingRef.current = false;
    setIsAIPlaying(false);

    try {
      const result = await submitAnswer({
        interviewId,
        answer: combinedAnswer,
      });

      if (!result?.success) {
        throw new Error(result?.message || "Submission failed.");
      }

      if (result.completed) {
        setFeedback(result.feedback || null);
        setLoading(false);

        await speak(
          "Great job! Your interview is completed. Preparing your report."
        );

        navigate(`/interview/${interviewId}/report`, { replace: true });
        return;
      }

      setFeedback(result.feedback || null);
      setCurrentIndex(result.currentIndex ?? currentIndex + 1);

      if (result.question) setQuestion(result.question);

      setCode("");
      updateAnswer("");
      setTimerLeft(result.question?.timer || 60);

      setTimerActive(true);
      timerActiveRef.current = true;

      // Dictation stays off for the next question too.
      micOnRef.current = false;
      setMicOn(false);
      recognitionPausedRef.current = true;

      if (result.feedback?.feedback) {
        await speak(result.feedback.feedback, false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to submit answer."
      );

      // Preserve answer and permit retry after timeout.
      autoSubmitRef.current = true;
      setTimerActive(false);
      timerActiveRef.current = false;
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // Automatic submission.
  useEffect(() => {
    if (
      timerLeft !== 0 ||
      !timerActive ||
      loading ||
      autoSubmitRef.current ||
      submittingRef.current
    ) return;

    autoSubmitRef.current = true;

    const finalAnswer = answerRef.current.trim() ||
      "No answer provided. Time over.";

    stopListening();
    handleSubmit(finalAnswer);
  }, [timerLeft, timerActive, loading, stopListening]);

  // Microphone toggle.
  const toggleMic = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported. Use Google Chrome.");
      return;
    }

    if (loading || timerLeft === 0) return;

    const next = !micOn;
    micOnRef.current = next;
    setMicOn(next);

    if (next) {
      recognitionPausedRef.current = false;
      if (!aiPlayingRef.current) startListening();
    } else {
      stopListening();
    }
  };

  // Camera toggle.
  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      if (userVideoRef.current) userVideoRef.current.srcObject = null;

      setCameraOn(false);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access requires HTTPS or localhost.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOn(true);
    } catch (error) {
      console.error(error);
      alert(error.message || "Camera permission denied or unavailable.");
    }
  };

  // Attach webcam stream AFTER the video element has rendered.
  useEffect(() => {
    const video = userVideoRef.current;
    const stream = streamRef.current;

    if (cameraOn && video && stream) {
      video.srcObject = stream;
      video.play().catch(error => {
        console.error("Camera preview error:", error);
      });
    }

    return () => {
      if (video) video.srcObject = null;
    };
  }, [cameraOn]);

  // Cleanup.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();

      try {
        recognitionRef.current?.abort();
      } catch {}

      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  if (!interviewData || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-bold text-slate-800">
            Interview question not available
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = totalQuestions > 0
    ? ((currentIndex + 1) / totalQuestions) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%]">

          {/* LEFT PANEL */}
          <div className="space-y-5 border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              {videoSource ? (
                <video
                  ref={aiVideoRef}
                  src={videoSource}
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white">
                  AI Interviewer
                </div>
              )}

              <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                AI Interviewer
              </span>

              {isAIPlaying && !speakerMuted && (
                <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
                  Speaking...
                </span>
              )}
            </div>

            <div className="rounded-xl bg-slate-900 p-3 text-sm text-white">
              <div className="flex items-start justify-between gap-3">
                <p className="min-h-10 flex-1">{subtitle || "AI Interviewer"}</p>
                <button
                  onClick={toggleSpeaker}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs"
                >
                  {speakerMuted ? <FiVolumeX /> : <FiVolume2 />}
                  {speakerMuted ? "Muted" : "Sound On"}
                </button>
              </div>
            </div>

            {/* USER CAMERA */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
              {cameraOn ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full scale-x-[-1] object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-white">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <p>{user?.name || "Candidate"}</p>
                  <p className="mt-1 text-xs text-slate-400">Camera is off</p>
                </div>
              )}
              <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                You
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleCamera}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-3 text-sm"
              >
                {cameraOn ? <FiVideo /> : <FiVideoOff />}
                Camera
              </button>

              <button
                onClick={() => setCodeOpen(!codeOpen)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-3 text-sm"
              >
                <FiCode /> Code
              </button>
            </div>

            <div className="text-center text-xs text-slate-500">
              {isAIPlaying
                ? "Interviewer is speaking"
                : listening
                  ? "Listening to your answer..."
                  : micOn
                    ? "Microphone ready"
                    : "Voice input is off"}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Interview</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {interviewData.role || "Interview"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <FiClock />
                <span className={`font-mono font-bold ${
                  timerLeft <= 15 ? "text-red-600" : "text-slate-800"
                }`}>
                  {formatTime(timerLeft)}
                </span>
              </div>
            </div>

            {/* PROGRESS */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">Interview Progress</span>
                <span className="text-slate-500">
                  {currentIndex + 1} / {totalQuestions}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* QUESTION */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Question {currentIndex + 1}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {difficulty}
                </span>
              </div>
              <h2 className="text-lg font-semibold leading-relaxed text-slate-900">
                {questionText}
              </h2>
            </div>

            {/* ANSWER */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Your Answer</h3>
                <span className="text-xs text-slate-400">
                  {answer.length} characters
                </span>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleMic}
                  disabled={loading || timerLeft === 0 || !speechSupported}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                    micOn
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {micOn ? <FiMicOff /> : <FiMic />}
                  {micOn ? "Stop Dictation" : "Start Voice Input"}
                </button>

                <span className="text-xs text-slate-500">
                  {listening
                    ? "Listening..."
                    : speechSupported
                      ? "Speak to enter your answer"
                      : "Speech recognition unavailable"}
                </span>
              </div>

              <textarea
                value={answer}
                onChange={e => updateAnswer(e.target.value)}
                disabled={loading || timerLeft === 0}
                rows={7}
                placeholder="Type your answer or use the microphone..."
                className="w-full resize-y rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              {interimTranscript && (
                <div className="mt-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  Recognizing: {interimTranscript}
                </div>
              )}

              <button
                onClick={() => handleSubmit()}
                disabled={loading || (!answer.trim() && !code.trim())}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Evaluating Answer..."
                  : <>{timerLeft === 0 ? "Retry / Submit Answer" : "Submit Answer"} <FiSend /></>}
              </button>
            </div>

            {/* CODE EDITOR */}
            {codeOpen && (
              <div className="overflow-hidden rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between bg-slate-900 p-3">
                  <span className="text-sm font-semibold text-white">Code Editor</span>
                  <select
                    value={codeLanguage}
                    onChange={e => setCodeLanguage(e.target.value)}
                    className="rounded-lg bg-slate-700 p-2 text-xs text-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={10}
                  disabled={loading}
                  spellCheck={false}
                  className="w-full bg-slate-950 p-4 font-mono text-sm text-green-300 outline-none"
                  placeholder="// Write your code here"
                />
              </div>
            )}

            {/* FEEDBACK */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-5"
              >
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  <h3 className="font-bold text-green-800">AI Feedback</h3>
                </div>

                {feedback.score !== undefined && (
                  <p className="font-bold text-green-700">
                    Score: {feedback.score}
                  </p>
                )}

                <p className="text-sm leading-relaxed text-slate-700">
                  {feedback.feedback}
                </p>

                {feedback.improvement && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Improvement</h4>
                    <p className="text-sm text-slate-600">{feedback.improvement}</p>
                  </div>
                )}

                {feedback.problemSolving && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Problem Solving</h4>
                    <p className="text-sm text-slate-600">{feedback.problemSolving}</p>
                  </div>
                )}

                {feedback.relevance && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Relevance</h4>
                    <p className="text-sm text-slate-600">{feedback.relevance}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Step2interview;