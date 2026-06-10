import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Bell,
  Check,
  ShieldCheck
} from "lucide-react";
import { OnboardingData } from "../types";
import { 
  EQUIPMENTS_LIST,
  SOVEREIGN_ASCENSION_GOALS,
  ACADEMIC_DISCIPLINE_LIST,
  ACADEMIC_SESSIONS_GOALS,
  CAREER_TARGET_ROLES,
  CAREER_PREPARATION_ACTIVITIES,
  BODYBUILDING_SPLITS,
  DIET_METABOLIC_GOALS
} from "../data";

// @ts-ignore
import startupBg from "../assets/images/startup_background_1780493337816.png";

import { MonarchLogo } from "./MonarchLogo";

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onStartGate?: () => void;
  initialStep?: number;
}

export default function Onboarding({ onComplete, onStartGate, initialStep = 0 }: OnboardingProps) {
  const [step, setStep] = useState<number>(initialStep); 
  const [showSystemPopup, setShowSystemPopup] = useState<boolean>(false);
  const [declineWarning, setDeclineWarning] = useState<boolean>(false);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  // Form states matching original properties
  const [gender, setGender] = useState<string>("Male");
  const [focusGoal, setFocusGoal] = useState<string>("bodybuilding");
  const [referredBy, setReferredBy] = useState<string>("system_portal");
  const [motivation, setMotivation] = useState<string>("limitless_growth");
  const [focusArea, setFocusArea] = useState<string>("overall_conditioning");
  const [archetype, setArchetype] = useState<string>("sovereign_leader");
  
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const [activityLevel, setActivityLevel] = useState<string>("light active");

  // Custom scrolling/incremement selectors
  const [age, setAge] = useState<number>(24);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [isMetricHeight, setIsMetricHeight] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<number>(178);

  const [weight, setWeight] = useState<number>(160); // Standard imperial
  const [isMetricWeight, setIsMetricWeight] = useState<boolean>(false);
  const [weightKg, setWeightKg] = useState<number>(72);

  const [targetWeight, setTargetWeight] = useState<number>(175);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(80);

  const [healthIssues, setHealthIssues] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["barbell", "dumbbells"]);
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(4);
  const [workoutDays, setWorkoutDays] = useState<string[]>(["Mon", "Wed", "Fri", "Sat"]);
  const [workoutReminder, setWorkoutReminder] = useState<boolean>(true);

  // Advanced customized profile fields
  const [academicSubject, setAcademicSubject] = useState<string>("comp_sci");
  const [academicSessionsGoal, setAcademicSessionsGoal] = useState<number>(4);
  const [careerTargetRole, setCareerTargetRole] = useState<string>("software_eng");
  const [careerPrepActivity, setCareerPrepActivity] = useState<string>("leetcode");
  const [bodybuildingSplit, setBodybuildingSplit] = useState<string>("push_pull_legs");
  const [fitnessDietGoal, setFitnessDietGoal] = useState<string>("recomp");

  // Conversions height ft/in to cm
  useEffect(() => {
    if (!isMetricHeight) {
      const cm = Math.round((heightFeet * 12 + heightInches) * 2.54);
      setHeightCm(cm);
    }
  }, [heightFeet, heightInches, isMetricHeight]);

  // CM changes height to ft/in
  useEffect(() => {
    if (isMetricHeight) {
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inc = Math.round(totalInches % 12);
      setHeightFeet(ft || 1);
      setHeightInches(inc === 12 ? 0 : inc);
    }
  }, [heightCm, isMetricHeight]);

  // Conversions LBS to KG and back
  useEffect(() => {
    if (isMetricWeight) {
      setWeightKg(Math.round(weight / 2.20462));
      setTargetWeightKg(Math.round(targetWeight / 2.20462));
    } else {
      setWeight(Math.round(weightKg * 2.20462));
      setTargetWeight(Math.round(targetWeightKg * 2.20462));
    }
  }, [isMetricWeight]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const startOnboarding = () => {
    setShowSystemPopup(true);
  };

  const acceptCall = () => {
    setShowSystemPopup(false);
    if (onStartGate) {
      onStartGate();
    } else {
      setStep(1);
    }
  };

  const declineCall = () => {
    setDeclineWarning(true);
  };

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const selectNoneEquipment = () => {
    setSelectedEquipment([]);
  };

  const toggleWorkoutDay = (day: string) => {
    setWorkoutDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const finishJourney = () => {
    const finalData: OnboardingData = {
      gender,
      focusGoal,
      referredBy,
      motivation,
      focusArea,
      archetype,
      fitnessLevel,
      activityLevel,
      age,
      heightFeet,
      heightInches,
      isMetricHeight,
      weight: isMetricWeight ? weightKg : weight,
      isMetricWeight,
      targetWeight: isMetricWeight ? targetWeightKg : targetWeight,
      healthIssues: healthIssues.trim(),
      equipment: selectedEquipment,
      workoutFrequency,
      workoutDays,
      workoutReminder,
      
      academicSubject,
      academicSessionsGoal,
      careerTargetRole,
      careerPrepActivity,
      fitnessDietGoal,
      bodybuildingSplit,
    };
    onComplete(finalData);
  };

  const showAdvancedParticles = useMemo(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
      return !isMobile && !isLowEnd;
    }
    return true;
  }, []);

  return (
    <div id="onboarding_container" className="min-h-[100dvh] bg-slate-950 text-white flex flex-col justify-between p-4 relative overflow-y-auto overflow-x-hidden font-sans select-none pb-safe">
      {/* Background artwork with a tiny blur to add textured atmosphere */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none select-none blur-[1px] transition-all duration-1000 bg-cover bg-center"
        style={{
          backgroundImage: `url(${startupBg})`,
        }}
      />
      {/* Floating Detailed Particles Overlay */}
      {showAdvancedParticles && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Layer 1: Tiny ambient dust */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute rounded-full bg-cyan-100"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              filter: `blur(${Math.random() * 1}px)`,
            }}
            animate={{
              y: [0, -Math.random() * 150 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, Math.random() * 0.4 + 0.1, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
        {/* Layer 2: Glowing cores */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`core-${i}`}
            className={`absolute rounded-full ${i % 2 === 0 ? "bg-cyan-400" : "bg-purple-500"}`}
            style={{
              width: Math.random() * 3 + 2 + "px",
              height: Math.random() * 3 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(34, 211, 238, 0.8)" : "rgba(168, 85, 247, 0.8)"}`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, Math.random() * 0.6 + 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 8,
            }}
          />
        ))}
      </div>
      )}
      
      {/* Absolute Dark Cyber Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,rgba(9,9,11,0.6)_80%)] pointer-events-none z-0" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-900/10 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* MAIN CONTENT AREA */}
      <main role="main" className="flex-1 flex flex-col items-center justify-center py-4 w-full max-w-2xl mx-auto z-10 min-h-0">
        <AnimatePresence mode="wait">
          {/* STEP 0: Cover Screen */}
          {step === 0 && (
            <motion.div
              key="cover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center flex flex-col items-center max-w-lg px-4"
            >
              <motion.div 
                className="mb-6 sm:mb-10 relative flex items-center justify-center p-6 sm:p-10 bg-slate-900 border-2 border-cyan-400/30 rounded-full shadow-2xl"
                id="gate_icon_container"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur opacity-40 animate-pulse" />
                <MonarchLogo size={160} />
              </motion.div>

              <h1 id="cover_title" className="text-4xl sm:text-6xl font-extrabold tracking-widest text-slate-100 uppercase mb-4">
                <span className="sr-only">Monarch</span>
                <span aria-hidden="true">ʍօռǟʀƈɦ</span>
              </h1>
              <p className="text-cyan-400 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase mb-8 shadow-cyan-500/50 drop-shadow-md">
                Physical Ascension Protocol &middot; Gate Challenge
              </p>

              <div id="flavor_quote" className="bg-slate-950/80 border border-slate-900 p-5 rounded-xl mb-8 sm:mb-12 text-sm sm:text-base text-slate-400 font-mono leading-relaxed max-w-sm shadow-inner">
                &ldquo;Do you desire to break your limits? The System offers a path. Break away from your battered E-Rank shell and ascend as the Sovereign ruler of your own flesh.&rdquo;
              </div>

              <motion.button
                id="btn_get_started"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold tracking-widest uppercase px-14 py-5 rounded-full shadow-2xl shadow-cyan-500/40 text-sm sm:text-base cursor-pointer border border-cyan-300/20 transition-all"
                onClick={startOnboarding}
              >
                Enter the Gate
              </motion.button>

              <button
                id="btn_direct_signin"
                className="block mt-8 text-[11px] sm:text-xs text-slate-500 hover:text-cyan-400 font-mono tracking-widest uppercase transition-colors underline underline-offset-4 cursor-pointer"
                onClick={() => {
                  if (onStartGate) onStartGate();
                }}
              >
                Already have a Hunter License? Access Auth Console
              </button>
            </motion.div>
          )}

          {/* STEP 1: CONSOLIDATED ANATOMICAL SCAN */}
          {step === 1 && (
            <motion.div
              key="anatomy_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase">ANATOMICAL SCAN & CHRONO REGISTRY</h2>
              <p className="text-slate-400 text-sm mb-6 font-mono">The System constructs metabolic curves based on your anatomy parameters.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-6">
                {/* Gender & Age Card */}
                <div className="bg-slate-900/95 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">CHARACTER AVATAR</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["Male", "Female", "Other"].map((gen) => (
                        <button
                          key={gen}
                          type="button"
                          className={`py-2 text-xs font-bold font-mono uppercase rounded-lg border transition cursor-pointer text-center ${
                            gender === gen 
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                              : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                          onClick={() => setGender(gen)}
                        >
                          {gen}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">CHRONO INDEX (AGE)</h3>
                    <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border border-slate-900 rounded-lg">
                      <button 
                        type="button"
                        className="text-cyan-400 font-extrabold text-lg px-2 hover:text-white"
                        onClick={() => setAge(prev => Math.max(12, prev - 1))}
                      >-</button>
                      <span className="font-mono text-cyan-300 font-extrabold text-lg">{age} <span className="text-[10px] text-slate-500">YRS</span></span>
                      <button 
                        type="button"
                        className="text-cyan-400 font-extrabold text-lg px-2 hover:text-white"
                        onClick={() => setAge(prev => Math.min(99, prev + 1))}
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Height & Weight Card */}
                <div className="bg-slate-900/95 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider">HEIGHT REACH</h3>
                      <button
                        type="button"
                        className="text-[10px] font-mono text-slate-500 hover:text-cyan-300 uppercase underline"
                        onClick={() => setIsMetricHeight(!isMetricHeight)}
                      >
                        {isMetricHeight ? "Metric (cm)" : "Imperial (ft/in)"}
                      </button>
                    </div>
                    
                    {!isMetricHeight ? (
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 border border-slate-900 rounded-lg">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-mono text-slate-500">FT:</span>
                          <div className="flex items-center gap-2">
                            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightFeet(prev => Math.max(3, prev - 1))}>-</button>
                            <span className="font-mono text-cyan-300 font-bold">{heightFeet}</span>
                            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightFeet(prev => Math.min(9, prev + 1))}>+</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-2 border-l border-slate-800">
                          <span className="text-[10px] font-mono text-slate-500">IN:</span>
                          <div className="flex items-center gap-2">
                            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightInches(prev => Math.max(0, prev - 1))}>-</button>
                            <span className="font-mono text-cyan-300 font-bold">{heightInches}</span>
                            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightInches(prev => Math.min(11, prev + 1))}>+</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border border-slate-900 rounded-lg">
                        <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightCm(prev => Math.max(90, prev - 1))}>-</button>
                        <span className="font-mono text-cyan-300 font-bold">{heightCm} cm</span>
                        <button type="button" className="text-slate-400 hover:text-white" onClick={() => setHeightCm(prev => Math.min(270, prev + 1))}>+</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider">GRAVITATIONAL MASS</h3>
                      <button
                        type="button"
                        className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 uppercase underline"
                        onClick={() => setIsMetricWeight(!isMetricWeight)}
                      >
                        {isMetricWeight ? "METRIC (KG)" : "IMPERIAL (LBS)"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950 p-2 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">CURRENT</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button type="button" className="text-slate-500 hover:text-white text-xs font-extrabold" onClick={() => {
                            if (isMetricWeight) setWeightKg(prev => Math.max(30, prev - 1));
                            else setWeight(prev => Math.max(60, prev - 2));
                          }}>-</button>
                          <span className="font-mono text-indigo-300 font-bold text-sm">
                            {isMetricWeight ? weightKg : weight}
                          </span>
                          <button type="button" className="text-slate-500 hover:text-white text-xs font-extrabold" onClick={() => {
                            if (isMetricWeight) setWeightKg(prev => Math.min(250, prev + 1));
                            else setWeight(prev => Math.min(500, prev + 2));
                          }}>+</button>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">TARGET</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button type="button" className="text-slate-500 hover:text-white text-xs font-extrabold" onClick={() => {
                            if (isMetricWeight) setTargetWeightKg(prev => Math.max(30, prev - 1));
                            else setTargetWeight(prev => Math.max(60, prev - 2));
                          }}>-</button>
                          <span className="font-mono text-cyan-300 font-bold text-sm">
                            {isMetricWeight ? targetWeightKg : targetWeight}
                          </span>
                          <button type="button" className="text-slate-500 hover:text-white text-xs font-extrabold" onClick={() => {
                            if (isMetricWeight) setTargetWeightKg(prev => Math.min(250, prev + 1));
                            else setTargetWeight(prev => Math.min(500, prev + 2));
                          }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="btn_anatomy_lock"
                className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-12 py-3.5 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                onClick={handleNext}
              >
                LOCK METRICS & START SCAN
              </button>
            </motion.div>
          )}

          {/* STEP 2: CONSOLIDATED OBJECTIVE & CAREER PATH */}
          {step === 2 && (
            <motion.div
              key="path_calibration_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-1 uppercase">OBJECTIVES & COGNITIVE PATHS</h2>
              <p className="text-slate-400 text-xs mb-5 font-mono">Calibrate your primary ascension quest and professional specializations.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-6">
                
                {/* Column 1: Sovereign Ascension & Study */}
                <div className="space-y-4">
                  {/* Focus Goal Selection */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">PRIMARY QUEST</h3>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400/50 rounded-lg text-xs font-mono text-cyan-300 outline-none cursor-pointer"
                      value={focusGoal}
                      onChange={(e) => setFocusGoal(e.target.value)}
                    >
                      {SOVEREIGN_ASCENSION_GOALS.map((goal) => (
                        <option key={goal.id} value={goal.id}>{goal.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-tight">
                      {SOVEREIGN_ASCENSION_GOALS.find(g => g.id === focusGoal)?.desc || "Sovereign quest focus alignment."}
                    </p>
                  </div>

                  {/* Cognitive Domain Selection */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">INTELLECTUAL FIELD</h3>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400/50 rounded-lg text-xs font-mono text-cyan-300 outline-none cursor-pointer"
                      value={academicSubject}
                      onChange={(e) => setAcademicSubject(e.target.value)}
                    >
                      {ACADEMIC_DISCIPLINE_LIST.map((subj) => (
                        <option key={subj.id} value={subj.id}>{subj.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-tight">
                      {ACADEMIC_DISCIPLINE_LIST.find(s => s.id === academicSubject)?.desc || "Cognitive focus area."}
                    </p>
                  </div>

                  {/* Pomodoro Sessions Goal */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">DAILY POMODORO STUDY TARGET</h3>
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {[2, 4, 6, 8].map((sessionsCount) => (
                        <button
                          key={sessionsCount}
                          type="button"
                          className={`py-1.5 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                            academicSessionsGoal === sessionsCount 
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-750"
                          }`}
                          onClick={() => setAcademicSessionsGoal(sessionsCount)}
                        >
                          {sessionsCount} SESS.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Career Guild Specializations */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Target Career Roles */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-indigo-400 tracking-wider mb-2">TARGET ROLE GUILD</h3>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400/50 rounded-lg text-xs font-mono text-indigo-300 outline-none cursor-pointer"
                      value={careerTargetRole}
                      onChange={(e) => setCareerTargetRole(e.target.value)}
                    >
                      {CAREER_TARGET_ROLES.map((role) => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-tight">
                      {CAREER_TARGET_ROLES.find(r => r.id === careerTargetRole)?.desc || "Professional path selection."}
                    </p>
                  </div>

                  {/* Daily Prep Directive */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-mono uppercase text-indigo-400 tracking-wider mb-2">DAILY PREP DIRECTIVE</h3>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {CAREER_PREPARATION_ACTIVITIES.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            className={`w-full p-2 rounded-lg border text-left transition cursor-pointer ${
                              careerPrepActivity === act.id 
                                ? "bg-indigo-500/10 border-indigo-400 text-indigo-300" 
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750"
                            }`}
                            onClick={() => setCareerPrepActivity(act.id)}
                          >
                            <div className="text-[10px] font-bold leading-none">{act.label}</div>
                            <div className="text-[8px] text-slate-500 font-mono mt-0.5 leading-none">{act.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <button
                type="button"
                className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-12 py-3.5 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                onClick={handleNext}
              >
                LOCK ATTRIBUTES & CAREERS
              </button>
            </motion.div>
          )}

          {/* STEP 3: CONSOLIDATED PERFORMANCE PROFILE */}
          {step === 3 && (
            <motion.div
              key="performance_calibration_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-1 uppercase">PHYSICAL & WARRIOR CAPACITY</h2>
              <p className="text-slate-400 text-xs mb-5 font-mono">Calibrate muscle regimens, diet template parameters, and power status ratings.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-6">
                
                {/* Left Column: Muscle Splits & Calorie templates */}
                <div className="space-y-4">
                  {/* Daily Muscle Split */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">DAILY MUSCLE SPLIT</h3>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400/50 rounded-lg text-xs font-mono text-cyan-300 outline-none cursor-pointer"
                      value={bodybuildingSplit}
                      onChange={(e) => setBodybuildingSplit(e.target.value)}
                    >
                      {BODYBUILDING_SPLITS.map((split) => (
                        <option key={split.id} value={split.id}>{split.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-tight">
                      {BODYBUILDING_SPLITS.find(b => b.id === bodybuildingSplit)?.desc || "Target bodybuilding split allocation."}
                    </p>
                  </div>

                  {/* Metabolic Diet Goal */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-indigo-400 tracking-wider mb-2">METABOLIC DIET TEMPLATE</h3>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-400/50 rounded-lg text-xs font-mono text-indigo-300 outline-none cursor-pointer"
                      value={fitnessDietGoal}
                      onChange={(e) => setFitnessDietGoal(e.target.value)}
                    >
                      {DIET_METABOLIC_GOALS.map((diet) => (
                        <option key={diet.id} value={diet.id}>{diet.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-tight">
                      {DIET_METABOLIC_GOALS.find(d => d.id === fitnessDietGoal)?.desc || "Daily nutritional threshold configuration."}
                    </p>
                  </div>
                </div>

                {/* Right Column: Experience Ranks & Activity levels */}
                <div className="space-y-4">
                  {/* Experiential Status Rank */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">INITIAL WARRIOR RANK</h3>
                    <div className="grid grid-cols-3 gap-1.5 font-mono">
                      {[
                        { id: "beginner", label: "E-RANK", detail: "Beginner" },
                        { id: "intermediate", label: "C-RANK", detail: "Mid-Tier" },
                        { id: "advanced", label: "S-RANK", detail: "Leader" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`py-2 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                            fitnessLevel === item.id 
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-750"
                          }`}
                          onClick={() => setFitnessLevel(item.id)}
                        >
                          <div>{item.label}</div>
                          <div className="text-[8px] text-slate-600 font-sans mt-0.5">{item.detail}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Scan Rating */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-indigo-400 tracking-wider mb-2">DAILY METABOLIC ACTIVITY SCAN</h3>
                    <div className="grid grid-cols-2 gap-1.5 font-mono">
                      {[
                        { id: "sedentary", label: "SEDENTARY" },
                        { id: "light active", label: "LIGHT" },
                        { id: "moderately active", label: "MODERATE" },
                        { id: "very active", label: "INTENSE" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`py-1.5 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                            activityLevel === item.id 
                              ? "bg-indigo-500/10 border-indigo-400 text-indigo-300" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750"
                          }`}
                          onClick={() => setActivityLevel(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <button
                type="button"
                className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-12 py-3.5 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                onClick={handleNext}
              >
                LOCK TRAINING & STATUS SCAN
              </button>
            </motion.div>
          )}

          {/* STEP 4: CONSOLIDATED ARMAMENTS & SCHEDULE */}
          {step === 4 && (
            <motion.div
              key="armaments_schedule_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-1 uppercase">ARMAMENTS & CALENDAR</h2>
              <p className="text-slate-400 text-xs mb-5 font-mono">Configure training weapons, physical blocks, weekly cycles, and alerts.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-6 font-mono">
                
                {/* Column 1: Workout days & limits */}
                <div className="space-y-4">
                  {/* Active Days */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs uppercase text-cyan-400 font-bold tracking-wider">WEEKLY GRINDS</span>
                      <span className="text-cyan-400 font-bold text-sm">{workoutFrequency} DAYS</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      className="w-full accent-cyan-400 bg-slate-950 cursor-pointer h-1.5 rounded-full focus:outline-none mb-3"
                      value={workoutFrequency}
                      onChange={(e) => setWorkoutFrequency(parseInt(e.target.value))}
                    />

                    <span className="text-[10px] uppercase text-cyan-500 font-bold tracking-wider block mb-2">ACTIVE SYSTEM DAYS</span>
                    <div className="flex flex-wrap gap-1 justify-start">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                        const active = workoutDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center font-mono font-bold text-[9px] cursor-pointer transition ${
                              active 
                                ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-750"
                            }`}
                            onClick={() => toggleWorkoutDay(day)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* System Pings */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                      <div className="flex gap-2 items-center">
                        <Bell className="w-3.5 h-3.5 text-indigo-400 animate-bounce text-xs" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-200 block">System Pings</span>
                          <span className="text-[8px] text-slate-500 block leading-tight">Penalize workout day evasion</span>
                        </div>
                      </div>
                      <div className="cursor-pointer" onClick={() => setWorkoutReminder(!workoutReminder)}>
                        <div className={`w-8 h-4.5 rounded-full relative flex items-center p-0.5 transition-colors ${workoutReminder ? "bg-indigo-600" : "bg-slate-850"}`}>
                          <motion.div 
                            className="w-3.5 h-3.5 rounded-full bg-slate-100"
                            animate={{ x: workoutReminder ? 14 : 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Equipment checklist & health report text */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Equipment checklist dropdown/multiselect or grid */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider">AVAILABLE EQUIPMENT</h3>
                      <button 
                        type="button"
                        className="text-[9px] font-mono text-slate-500 hover:text-cyan-350 uppercase underline"
                        onClick={selectNoneEquipment}
                      >
                        Bodyweight
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 overflow-y-auto max-h-[110px] pr-1">
                      {EQUIPMENTS_LIST.map((item) => {
                        const isSel = selectedEquipment.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`p-1.5 rounded-lg border text-left flex justify-between items-center transition-colors cursor-pointer ${
                              isSel 
                                ? "bg-slate-950 border-indigo-500 text-indigo-300" 
                                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-755"
                            }`}
                            onClick={() => toggleEquipment(item.id)}
                          >
                            <span className="text-[9px] leading-tight font-bold">{item.label}</span>
                            {isSel && <Check className="w-3 h-3 text-indigo-305 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Health Limitation Text area */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xs font-mono uppercase text-indigo-400 tracking-wider mb-2">ANATOMICAL LIMITATION WARNINGS</h3>
                    <textarea
                      id="input_health_issues"
                      className="w-full h-[65px] p-2 bg-slate-950 border border-slate-850 outline-none focus:border-cyan-400/50 rounded-lg text-[10px] font-mono text-slate-300 resize-none leading-normal"
                      placeholder="E.g., Shoulder, back injuries, none..."
                      value={healthIssues}
                      onChange={(e) => setHealthIssues(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center max-w-xl mx-auto px-1">
                <button
                  type="button"
                  id="btn_days_back"
                  className="bg-slate-950 border border-slate-900 text-slate-400 font-mono tracking-wider text-xs uppercase px-6 py-3 rounded-full hover:bg-slate-900 cursor-pointer"
                  onClick={handlePrev}
                >
                  Back
                </button>
                <button
                  type="button"
                  id="btn_days_continue"
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-mono tracking-wider font-bold text-xs uppercase px-10 py-3.5 rounded-full shadow-lg shadow-cyan-500/10 cursor-pointer border border-cyan-300/10 animate-pulse animate-duration-1000"
                  onClick={finishJourney}
                >
                  Construct Custom Plan
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer steps indicator */}
      {step > 0 && step < 4 && (
        <footer className="py-4 border-t border-slate-900 w-full max-w-2xl mx-auto flex justify-between items-center z-10">
          <button
            id="btn_footer_back"
            aria-label="Previous Step"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-mono uppercase cursor-pointer"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Prev Factor</span>
          </button>
          
          <div className="flex gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${i < step ? "bg-cyan-500 scale-110 shadow-sm shadow-cyan-500/50" : "bg-slate-800"}`} 
              />
            ))}
          </div>

          <button
            id="btn_footer_next"
            aria-label="Next Step"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-mono uppercase cursor-pointer font-bold"
            onClick={handleNext}
          >
            <span>Skip Forward</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </footer>
      )}

      {/* SYSTEM PLAYER POPUP MODAL */}
      <AnimatePresence>
        {showSystemPopup && (
          <div id="system_glow_overlay" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-950 border border-cyan-500 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400" />
              
              <div className="flex gap-4 items-start mb-6">
                <div id="system_popup_alert" className="p-3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 rounded-xl">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-wider font-mono text-cyan-400 uppercase">System Notification</h3>
                  <p className="text-slate-500 text-[10px] font-mono mt-1">INCOMING BLUE-SCREEN INTERACTION</p>
                </div>
              </div>

              <div id="system_popup_question" className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 mb-6 leading-relaxed">
                &ldquo;You have inquired to be a player. Will you accept? We warn you: if you accept, your daily training limits will be monitored by the Monarch system. Extreme penalties govern active workout day evasions.&rdquo;
              </div>

              {declineWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-950/40 border border-red-900 text-red-200 text-xs font-mono rounded-lg leading-relaxed"
                >
                  <span className="font-extrabold text-red-400 block mb-1">WARNING RED ZONE</span>
                  The System does click on those who do not desire to transcend human limitations... Are you sure you are ready to remain an E-rank forever?
                </motion.div>
              )}

              <div id="popup_actions" className="flex justify-end gap-3 font-mono text-xs">
                <button
                  id="btn_popup_decline"
                  className="px-5 py-2.5 border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer font-bold transition-all"
                  onClick={declineCall}
                >
                  DECLINE
                </button>
                <button
                  id="btn_popup_accept"
                  className="px-8 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer hover:shadow-md hover:shadow-cyan-500/20 transition-all font-mono"
                  onClick={acceptCall}
                >
                  ACCEPT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
