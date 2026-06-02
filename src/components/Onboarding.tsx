/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  Sword, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Music, 
  Instagram, 
  Facebook, 
  Youtube, 
  Search, 
  User, 
  MoreHorizontal, 
  Layers, 
  Flame, 
  Compass, 
  Heart, 
  Activity, 
  Brain, 
  GraduationCap, 
  UserCheck, 
  Calendar,
  Bell,
  Check,
  Volume2,
  VolumeX
} from "lucide-react";
import { OnboardingData } from "../types";
import { 
  FITNESS_GOALS, 
  REFERRAL_SOURCES, 
  FITNESS_MOTIVATIONS, 
  FOCUS_AREAS, 
  ARCHETYPES, 
  EQUIPMENTS_LIST,
  SOVEREIGN_ASCENSION_GOALS,
  ACADEMIC_DISCIPLINE_LIST,
  ACADEMIC_SESSIONS_GOALS,
  CAREER_TARGET_ROLES,
  CAREER_PREPARATION_ACTIVITIES,
  BODYBUILDING_SPLITS,
  DIET_METABOLIC_GOALS
} from "../data";

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0); 
  const [showSystemPopup, setShowSystemPopup] = useState<boolean>(false);
  const [declineWarning, setDeclineWarning] = useState<boolean>(false);

  // Form states
  const [gender, setGender] = useState<string>("");
  const [focusGoal, setFocusGoal] = useState<string>("");
  const [referredBy, setReferredBy] = useState<string>("");
  const [motivation, setMotivation] = useState<string>("");
  const [focusArea, setFocusArea] = useState<string>("");
  const [archetype, setArchetype] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("");

  // New features form states
  const [academicSubject, setAcademicSubject] = useState<string>("comp_sci");
  const [academicSessionsGoal, setAcademicSessionsGoal] = useState<number>(4);
  const [careerTargetRole, setCareerTargetRole] = useState<string>("software_eng");
  const [careerPrepActivity, setCareerPrepActivity] = useState<string>("leetcode");
  const [bodybuildingSplit, setBodybuildingSplit] = useState<string>("push_pull_legs");
  const [fitnessDietGoal, setFitnessDietGoal] = useState<string>("recomp");
  
  // Custom scrolling selectors
  const [age, setAge] = useState<number>(18);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [isMetricHeight, setIsMetricHeight] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<number>(178);

  const [weight, setWeight] = useState<number>(150); // standard imperial
  const [isMetricWeight, setIsMetricWeight] = useState<boolean>(false);
  const [weightKg, setWeightKg] = useState<number>(68);

  const [targetWeight, setTargetWeight] = useState<number>(160);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(72);

  const [healthIssues, setHealthIssues] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(4);
  const [workoutDays, setWorkoutDays] = useState<string[]>(["Mon", "Wed", "Fri", "Sat"]);
  const [workoutReminder, setWorkoutReminder] = useState<boolean>(true);

  // Update CM when feet/inches change
  useEffect(() => {
    if (!isMetricHeight) {
      const cm = Math.round((heightFeet * 12 + heightInches) * 2.54);
      setHeightCm(cm);
    }
  }, [heightFeet, heightInches, isMetricHeight]);

  // Update feet/inches when CM changes
  useEffect(() => {
    if (isMetricHeight) {
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inc = Math.round(totalInches % 12);
      setHeightFeet(ft || 1);
      setHeightInches(inc === 12 ? 0 : inc);
    }
  }, [heightCm, isMetricHeight]);

  // Handle unit conversions for weight
  useEffect(() => {
    if (isMetricWeight) {
      setWeightKg(Math.round(weight / 2.20462));
    } else {
      setWeight(Math.round(weightKg * 2.20462));
    }
  }, [isMetricWeight]);

  useEffect(() => {
    if (isMetricWeight) {
      setTargetWeightKg(Math.round(targetWeight / 2.20462));
    } else {
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
    setStep(1);
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

  const renderSocialIcon = (source: string) => {
    switch (source) {
      case "tiktok":
        return <Music className="w-4 h-4 ml-2 text-pink-500 inline-block" />;
      case "instagram":
        return <Instagram className="w-4 h-4 ml-2 text-purple-400 inline-block" />;
      case "facebook":
        return <Facebook className="w-4 h-4 ml-2 text-blue-500 inline-block" />;
      case "youtube":
        return <Youtube className="w-4 h-4 ml-2 text-red-600 inline-block" />;
      case "google":
        return <Search className="w-4 h-4 ml-2 text-blue-300 inline-block" />;
      case "friend":
        return <User className="w-4 h-4 ml-2 text-emerald-400 inline-block" />;
      default:
        return <MoreHorizontal className="w-4 h-4 ml-2 text-gray-400 inline-block" />;
    }
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
      healthIssues,
      equipment: selectedEquipment,
      workoutFrequency,
      workoutDays,
      workoutReminder,
      
      // New fields
      academicSubject,
      academicSessionsGoal,
      careerTargetRole,
      careerPrepActivity,
      fitnessDietGoal,
      bodybuildingSplit,
    };
    onComplete(finalData);
  };

  return (
    <div id="onboarding_container" className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 relative overflow-hidden font-sans select-none">
      {/* Background artwork with a tiny blur to add textured atmosphere */}
      <div 
        className="absolute inset-0 z-0 opacity-25 pointer-events-none mix-blend-screen select-none blur-[2px] transition-all duration-1000 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/statue.jpg'), url('/statue.jpg'), url('/assets/double_dungeon_bg.jpg'), url('/assets/photo_provided.jpg'), url('https://images.alphacoders.com/134/1346305.jpeg')",
        }}
      />
      {/* Absolute Dark Cyber Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-900/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header section (progress indicator) */}
      <header className="p-2 border-b border-slate-900 flex justify-between items-center z-10 w-full max-w-4xl mx-auto">
        <div id="app_brand" className="flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
            <Sword className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
            M O N A R C H
          </span>
        </div>
        {step > 0 && (
          <div id="onboarding_progress" className="text-right">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">System Setup</span>
            <div className="text-xs font-mono text-cyan-400 font-bold">{step} / 18</div>
            <div className="w-24 h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 18) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex items-center justify-center py-6 w-full max-w-2xl mx-auto z-10">
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
                className="mb-6 relative"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur opacity-40 animate-pulse" />
                <div id="gate_icon_container" className="bg-slate-900 border-2 border-cyan-400/30 p-8 rounded-full relative">
                  <Flame className="w-16 h-16 text-cyan-400 animate-bounce" />
                </div>
              </motion.div>

              <h1 id="cover_title" className="text-5xl font-extrabold tracking-widest text-slate-100 uppercase mb-3">
                ʍօռǟʀƈɦ
              </h1>
              <p className="text-cyan-400 text-xs font-mono tracking-widest uppercase mb-8">
                Physical Ascension Protocol &middot; Gate Challenge
              </p>

              <div id="flavor_quote" className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl mb-10 text-sm text-slate-400 font-mono leading-relaxed max-w-sm">
                &ldquo;Do you desire to break your limits? The System offers a path. Break away from your battered E-Rank shell and ascend as the Sovereign ruler of your own flesh.&rdquo;
              </div>

              <motion.button
                id="btn_get_started"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold tracking-widest uppercase px-12 py-4 rounded-full shadow-lg shadow-cyan-500/20 text-sm cursor-pointer border border-cyan-300/20"
                onClick={startOnboarding}
              >
                Enter the Gate
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: Gender */}
          {step === 1 && (
            <motion.div
              key="gender_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">CHOOSE YOUR AVATAR PROFILE</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">The System calibrates metabolic constants based on your anatomy.</p>
              
              <div id="gender_options" className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {["Male", "Female", "Other"].map((gen) => (
                  <motion.button
                    key={gen}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border font-bold text-lg cursor-pointer text-left flex justify-between items-center transition-colors ${
                      gender === gen 
                        ? "bg-slate-900 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/20" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setGender(gen);
                      setTimeout(handleNext, 200);
                    }}
                  >
                    <span>{gen}</span>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Ultimate Quest (Sovereign Ascension Goals) */}
          {step === 2 && (
            <motion.div
              key="goal_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2 font-sans">DEFINE YOUR SOVEREIGN QUEST</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Select the primary awakening objective of your physical and mental form.</p>
              
              <div id="goal_options" className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {SOVEREIGN_ASCENSION_GOALS.map((goal) => (
                  <motion.button
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-all ${
                      focusGoal === goal.id 
                        ? "bg-slate-900 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-950/20" 
                        : "bg-slate-950/80 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setFocusGoal(goal.id);
                      setTimeout(handleNext, 200);
                    }}
                  >
                    <div className="font-bold text-lg">{goal.label}</div>
                    <div className="text-slate-400 text-xs font-mono mt-1 leading-relaxed">{goal.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Academic/Scholar Discipline */}
          {step === 3 && (
            <motion.div
              key="academic_subject_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">SELECT YOUR COGNITIVE DOMAIN</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Which intellectual discipline or syllabus grid will you cultivate?</p>
              
              <div id="academic_subject_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {ACADEMIC_DISCIPLINE_LIST.map((subj) => (
                  <motion.button
                    key={subj.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      academicSubject === subj.id 
                        ? "bg-slate-900 border-cyan-400 text-cyan-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setAcademicSubject(subj.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{subj.label}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-snug">{subj.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Academic Study Goal */}
          {step === 4 && (
            <motion.div
              key="academic_sessions_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">DAILY POMODORO SCHEDULE</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrate daily intellectual sessions of deep focus.</p>
              
              <div id="academic_sessions_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {ACADEMIC_SESSIONS_GOALS.map((ses) => {
                  const sessionsCount = ses.id === "sessions_2" ? 2 : ses.id === "sessions_4" ? 4 : ses.id === "sessions_6" ? 6 : 8;
                  return (
                    <motion.button
                      key={ses.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                        academicSessionsGoal === sessionsCount 
                          ? "bg-slate-900 border-cyan-400 text-cyan-300" 
                          : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                      }`}
                      onClick={() => {
                        setAcademicSessionsGoal(sessionsCount);
                        setTimeout(handleNext, 250);
                      }}
                    >
                      <div className="font-bold text-sm">{ses.label}</div>
                      <div className="text-slate-400 text-xs mt-1 leading-snug">{ses.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Career Target Role */}
          {step === 5 && (
            <motion.div
              key="career_role_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">TARGET PROFESSIONAL GUILD</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Choose your target professional specialization archetype.</p>
              
              <div id="career_role_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {CAREER_TARGET_ROLES.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      careerTargetRole === role.id 
                        ? "bg-slate-900 border-indigo-400 text-indigo-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setCareerTargetRole(role.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{role.label}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-snug">{role.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: Career Prep Activity */}
          {step === 6 && (
            <motion.div
              key="career_prep_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">DAILY CAREER DIRECTIVE</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">What is your primary method of preparation when grinding through the hiring gates?</p>
              
              <div id="career_prep_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {CAREER_PREPARATION_ACTIVITIES.map((act) => (
                  <motion.button
                    key={act.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      careerPrepActivity === act.id 
                        ? "bg-slate-900 border-indigo-400 text-indigo-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setCareerPrepActivity(act.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{act.label}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-snug">{act.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 7: Bodybuilding Splits */}
          {step === 7 && (
            <motion.div
              key="bodybuilding_split_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">BODYBUILDING TRAINING SPLIT</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono font-sans">Which muscular conditioning routine governs your training session?</p>
              
              <div id="bodybuilding_split_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {BODYBUILDING_SPLITS.map((split) => (
                  <motion.button
                    key={split.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      bodybuildingSplit === split.id 
                        ? "bg-slate-900 border-cyan-400 text-cyan-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setBodybuildingSplit(split.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{split.label}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-snug">{split.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 8: Metabolic Diet Goal */}
          {step === 8 && (
            <motion.div
              key="diet_goal_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">METABOLIC & NUTRITION APPROACH</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrate daily nutritional and target energy thresholds.</p>
              
              <div id="diet_goal_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {DIET_METABOLIC_GOALS.map((diet) => (
                  <motion.button
                    key={diet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      fitnessDietGoal === diet.id 
                        ? "bg-slate-900 border-indigo-400 text-indigo-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setFitnessDietGoal(diet.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{diet.label}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-snug">{diet.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 9: Fitness Level */}
          {step === 9 && (
            <motion.div
              key="fitness_level_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2 font-sans">INITIAL WARRIOR RANK</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Be completely honest with the system scanner. What is your current capacity?</p>
              
              <div id="fitness_options" className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {[
                  { id: "beginner", title: "BEGINNER (E-Rank)", desc: "Brand new to combat conditioning. Bandages ready." },
                  { id: "intermediate", title: "INTERMEDIATE (C-Rank)", desc: "Familiar with lift patterns and gate environments." },
                  { id: "advanced", title: "ADVANCED (S-Rank equivalent)", desc: "Highly conditioned warrior seeking cosmic evolution." }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-colors ${
                      fitnessLevel === item.id 
                        ? "bg-slate-900 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/20" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setFitnessLevel(item.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-extrabold text-lg tracking-wide">{item.title}</div>
                    <div className="text-slate-400 text-xs font-mono mt-1 leading-relaxed">{item.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 10: Active Level */}
          {step === 10 && (
            <motion.div
              key="activity_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">DAILY ACTIVITY SCAN</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">How frequently do you leave safety and venture out of the shelter?</p>
              
              <div id="activity_options" className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {[
                  { id: "sedentary", title: "Sedentary", detail: "Little to no workout. Sheltered life." },
                  { id: "light active", title: "Light Active", detail: "Active 1-3 days a week. Short raids." },
                  { id: "moderately active", title: "Moderately Active", detail: "Active 4-6 days a week. Standard guild warrior." },
                  { id: "very active", title: "Very Active", detail: "Grinding the gym heavy. Supreme legion commander." }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      activityLevel === item.id 
                        ? "bg-slate-900 border-indigo-400 text-indigo-300" 
                        : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                    }`}
                    onClick={() => {
                      setActivityLevel(item.id);
                      setTimeout(handleNext, 250);
                    }}
                  >
                    <div className="font-bold text-sm">{item.title}</div>
                    <div className="text-slate-400 text-xs font-mono mt-1">{item.detail}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 11: Age Selector */}
          {step === 11 && (
            <motion.div
              key="age_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">CHRONO ROTATION INDEX (AGE)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrates hormone release potential. Current age index: <span className="text-cyan-400 font-bold">{age}</span></p>
              
              {/* Scrolling Horizontal Age Selector */}
              <div id="age_picker_slider" className="my-10 relative flex justify-center items-center">
                <div className="absolute w-24 h-24 border-2 border-dashed border-cyan-400/20 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-20 h-20 bg-cyan-500/10 rounded-full blur pointer-events-none" />
                
                <div className="flex items-center gap-6 z-10">
                  <button 
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full cursor-pointer text-cyan-400 disabled:opacity-20"
                    disabled={age <= 12}
                    onClick={() => setAge((prev) => prev - 1)}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="w-24 text-center">
                    <motion.div
                      key={age}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      className="text-6xl font-extrabold font-mono text-cyan-400"
                    >
                      {age}
                    </motion.div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 mt-2 block tracking-widest">cycles</span>
                  </div>

                  <button 
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full cursor-pointer text-cyan-400 disabled:opacity-20"
                    disabled={age >= 90}
                    onClick={() => setAge((prev) => prev + 1)}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Age recommendation disclaimer */}
              <div className="bg-slate-950/80 max-w-sm mx-auto p-4 border border-slate-900 rounded-xl mb-10 text-xs leading-relaxed text-slate-400">
                <span className="text-indigo-400 font-bold block mb-1">MONARCH TELEMETRY SCAN</span>
                System optimizes hyper-trophy metabolic curves specifically tailored for age cycle {age}.
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_age_next"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-10 py-3 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Confirm Chrono Info
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 12: Height Selector */}
          {step === 12 && (
            <motion.div
              key="height_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">VERTICAL ANATOMICAL SPAN (HEIGHT)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrates reach, power output, and optimal dynamic joint load ratios.</p>
              
              {!isMetricHeight ? (
                <div id="feet_inch_selector" className="grid grid-cols-2 gap-8 max-w-xs mx-auto mb-10 items-center justify-center">
                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl relative">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Feet</div>
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-slate-400 hover:text-white px-2 text-xl" onClick={() => setHeightFeet(Math.max(3, heightFeet - 1))}>-</button>
                      <span className="text-4xl font-extrabold font-mono text-cyan-300">{heightFeet}</span>
                      <button className="text-slate-400 hover:text-white px-2 text-xl" onClick={() => setHeightFeet(Math.min(9, heightFeet + 1))}>+</button>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl relative">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Inches</div>
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-slate-400 hover:text-white px-2 text-xl" onClick={() => setHeightInches(Math.max(0, heightInches - 1))}>-</button>
                      <span className="text-4xl font-extrabold font-mono text-cyan-300">{heightInches}</span>
                      <button className="text-slate-400 hover:text-white px-2 text-xl" onClick={() => setHeightInches(Math.min(11, heightInches + 1))}>+</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="cm_height_selector" className="max-w-xs mx-auto mb-10">
                  <div className="bg-slate-950 p-6 border border-slate-900 rounded-2xl">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Centimeters</div>
                    <div className="flex items-center justify-center gap-4">
                      <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg" onClick={() => setHeightCm((prev) => Math.max(90, prev - 1))}>-</button>
                      <span className="text-5xl font-extrabold font-mono text-cyan-300">{heightCm}</span>
                      <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg" onClick={() => setHeightCm((prev) => Math.min(270, prev + 1))}>+</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle switch with rising opacity concept */}
              <div className="flex flex-col items-center gap-8">
                <div id="height_unit_toggle" className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMetricHeight(!isMetricHeight)}>
                  <span className={`text-xs font-mono transition-opacity ${!isMetricHeight ? "opacity-100 text-cyan-300 font-bold" : "opacity-40 text-slate-500"}`}>IMPERIAL</span>
                  <div className="w-12 h-6 bg-slate-900 border border-slate-800 rounded-full relative flex items-center p-1">
                    <motion.div 
                      className="w-4 h-4 rounded-full bg-cyan-400"
                      animate={{ x: isMetricHeight ? 22 : 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  </div>
                  <span className={`text-xs font-mono transition-opacity ${isMetricHeight ? "opacity-100 text-cyan-300 font-bold" : "opacity-40 text-slate-500"}`}>METRIC (CM)</span>
                </div>

                <button
                  id="btn_height_next"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-10 py-3 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Lock Height Factor
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 13: Current Weight */}
          {step === 13 && (
            <motion.div
              key="weight_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">CURRENT GRAVITATIONAL LOAD (WEIGHT)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrates basic metabolic energy expenditure indices.</p>
              
              <div id="current_weight_display" className="max-w-xs mx-auto mb-10">
                <div className="bg-slate-950 p-6 border border-slate-900 rounded-2xl relative">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">CURRENT MASS</div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl" onClick={() => {
                      if (isMetricWeight) setWeightKg(Math.max(30, weightKg - 1));
                      else setWeight(Math.max(60, weight - 2));
                    }}>-</button>
                    
                    <span className="text-5xl font-extrabold font-mono text-indigo-400">
                      {isMetricWeight ? weightKg : weight}
                    </span>
                    
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl" onClick={() => {
                      if (isMetricWeight) setWeightKg(Math.min(250, weightKg + 1));
                      else setWeight(Math.min(500, weight + 2));
                    }}>+</button>
                  </div>
                  <span className="text-xs font-mono text-slate-500 mt-2 block uppercase">{isMetricWeight ? "Kilograms (kg)" : "Pounds (lbs)"}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8">
                <div id="weight_unit_toggle" className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMetricWeight(!isMetricWeight)}>
                  <span className={`text-xs font-mono transition-opacity ${!isMetricWeight ? "opacity-100 text-indigo-300 font-bold" : "opacity-40 text-slate-500"}`}>LBS</span>
                  <div className="w-12 h-6 bg-slate-900 border border-slate-800 rounded-full relative flex items-center p-1">
                    <motion.div 
                      className="w-4 h-4 rounded-full bg-indigo-400"
                      animate={{ x: isMetricWeight ? 22 : 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  </div>
                  <span className={`text-xs font-mono transition-opacity ${isMetricWeight ? "opacity-100 text-indigo-300 font-bold" : "opacity-40 text-slate-500"}`}>KG</span>
                </div>

                <button
                  id="btn_weight_next"
                  className="bg-slate-950 border border-slate-800 text-indigo-300 font-mono tracking-wider text-xs uppercase px-10 py-3 rounded-full hover:bg-slate-900 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Write Gravity Metric
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 14: Target Weight */}
          {step === 14 && (
            <motion.div
              key="target_weight_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">TARGET AWAKENING MASS (TARGET WEIGHT)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">Calibrates the target scale energy deficit or surplus.</p>
              
              <div id="target_weight_display" className="max-w-xs mx-auto mb-10">
                <div className="bg-slate-950 p-6 border border-slate-900 rounded-2xl relative">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">TARGET MASS</div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl" onClick={() => {
                      if (isMetricWeight) setTargetWeightKg(Math.max(30, targetWeightKg - 1));
                      else setTargetWeight(Math.max(60, targetWeight - 2));
                    }}>-</button>
                    
                    <span className="text-5xl font-extrabold font-mono text-cyan-400">
                      {isMetricWeight ? targetWeightKg : targetWeight}
                    </span>
                    
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl" onClick={() => {
                      if (isMetricWeight) setTargetWeightKg(Math.min(250, targetWeightKg + 1));
                      else setTargetWeight(Math.min(500, targetWeight + 2));
                    }}>+</button>
                  </div>
                  <span className="text-xs font-mono text-slate-500 mt-2 block uppercase">{isMetricWeight ? "Kilograms (kg)" : "Pounds (lbs)"}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_target_next"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-10 py-3 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Accept Target Boundary
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 15: Health Issues */}
          {step === 15 && (
            <motion.div
              key="health_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">ANATOMICAL LIMITATION SCANS (HEALTH ISSUES)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">List any injury warnings, heart conditions, or structural limitations (Optional).</p>
              
              <div id="health_text_wrapper" className="max-w-md mx-auto mb-10">
                <textarea
                  id="input_health_issues"
                  className="w-full h-32 p-4 bg-slate-950 border border-slate-900 outline-none focus:border-cyan-400/50 rounded-xl text-sm font-mono text-slate-300 resize-none leading-relaxed"
                  placeholder="E.g., Minor left shoulder impingement, lower back recovery stiffness, none..."
                  value={healthIssues}
                  onChange={(e) => setHealthIssues(e.target.value)}
                />
                <span className="text-slate-600 text-[10px] font-mono text-left block mt-1 uppercase">Leave blank if no system failures.</span>
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_health_next"
                  className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-mono tracking-wider text-xs uppercase px-12 py-3 rounded-full hover:from-cyan-500 hover:to-indigo-500 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Write Scan Reports
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 16: Equipment Access */}
          {step === 16 && (
            <motion.div
              key="equipment_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">ARMAMENT DEPOSITARY (EQUIPMENT ACCESS)</h2>
              <p className="text-slate-400 text-sm mb-6 font-mono">Select which tools are available at your training gate.</p>
              
              <div id="equipment_extra_buttons" className="flex justify-center gap-4 mb-6">
                <button 
                  className={`px-4 py-2 border rounded-full text-xs font-mono cursor-pointer transition text-center ${
                    selectedEquipment.length === 0 
                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                  }`}
                  onClick={selectNoneEquipment}
                >
                  Bodyweight Only (None)
                </button>
              </div>

              <div id="equipment_selection_grid" className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-10">
                {EQUIPMENTS_LIST.map((item) => {
                  const isSel = selectedEquipment.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border flex justify-between items-center text-left cursor-pointer transition-colors ${
                        isSel 
                          ? "bg-slate-900 border-indigo-400 text-indigo-300" 
                          : "bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-800"
                      }`}
                      onClick={() => toggleEquipment(item.id)}
                    >
                      <span className="text-xs font-mono font-bold">{item.label}</span>
                      {isSel && <Check className="w-4 h-4 text-indigo-300 ml-2" />}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_equipment_next"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-12 py-3 rounded-full hover:bg-slate-805 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Verify Armaments
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 17: Workout Frequency */}
          {step === 17 && (
            <motion.div
              key="frequency_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">WEEKLY GATE CLOSURES (FREQUENCY)</h2>
              <p className="text-slate-400 text-sm mb-8 font-mono">How many training session gates will you battle through each week?</p>
              
              <div id="frequency_slider_card" className="max-w-md mx-auto bg-slate-950 border border-slate-900 p-8 rounded-3xl mb-10">
                <div className="text-center mb-6">
                  <span className="text-[10px] tracking-widest uppercase text-slate-500 font-mono block">Optimal Target</span>
                  <div className="text-6xl font-extrabold text-cyan-400 font-mono mt-2">{workoutFrequency}</div>
                  <span className="text-xs font-mono text-slate-400">Workouts / Week</span>
                </div>

                {/* Custom draggable timeline/slider layout */}
                <div id="workout_frequency_range" className="px-4 relative flex items-center h-12">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    className="w-full accent-cyan-400 bg-slate-900 cursor-pointer h-2 rounded-full focus:outline-none"
                    value={workoutFrequency}
                    onChange={(e) => setWorkoutFrequency(parseInt(e.target.value))}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase px-2">
                  <span>1 Min</span>
                  <span>4 Standard</span>
                  <span>7 Absolute</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_frequency_next"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-wider text-xs uppercase px-10 py-3 rounded-full hover:bg-slate-800 font-bold cursor-pointer"
                  onClick={handleNext}
                >
                  Accept Frequency Range
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 18: Workout Days & Reminder */}
          {step === 18 && (
            <motion.div
              key="days_step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">CHOOSE ACTIVE SYSTEM DAYS</h2>
              <p className="text-slate-400 text-sm mb-6 font-mono">Set specific weekly cycles when the dungeon key will drop.</p>
              
              {/* Daily selectors */}
              <div id="workout_days_grid" className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto mb-8">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const active = workoutDays.includes(day);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-14 h-14 rounded-full border flex items-center justify-center font-mono font-bold text-sm cursor-pointer transition ${
                        active 
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300" 
                          : "bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300"
                      }`}
                      onClick={() => toggleWorkoutDay(day)}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>

              {/* Reminder toggle */}
              <div id="reminder_toggle_box" className="max-w-md mx-auto bg-slate-950 border border-slate-900 p-5 rounded-2xl mb-10 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold">System Reminder Pings</h4>
                    <p className="text-slate-500 text-xs font-mono">Triggers penalty warning if active step days are avoided.</p>
                  </div>
                </div>
                
                <div className="cursor-pointer" onClick={() => setWorkoutReminder(!workoutReminder)}>
                  <div className={`w-12 h-6 rounded-full relative flex items-center p-1 transition-colors ${workoutReminder ? "bg-indigo-600" : "bg-slate-900 border border-slate-800"}`}>
                    <motion.div 
                      className="w-4 h-4 rounded-full bg-slate-100"
                      animate={{ x: workoutReminder ? 22 : 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  </div>
                </div>
              </div>

              {/* Absolute Action button */}
              <div className="flex justify-between items-center max-w-md mx-auto px-2">
                <button
                  id="btn_days_back"
                  className="bg-slate-950 border border-slate-900 text-slate-500 font-mono tracking-wider text-xs uppercase px-6 py-3 rounded-full hover:bg-slate-900 cursor-pointer"
                  onClick={handlePrev}
                >
                  Back
                </button>
                <button
                  id="btn_days_continue"
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-mono tracking-wider font-bold text-xs uppercase px-12 py-4 rounded-full shadow-lg shadow-cyan-500/10 cursor-pointer border border-cyan-300/10 animate-pulse"
                  onClick={finishJourney}
                >
                  Construct Custom Plan
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer back controls during onboarding */}
      {step > 0 && step < 18 && (
        <footer className="py-4 border-t border-slate-900 w-full max-w-4xl mx-auto flex justify-between items-center z-10">
          <button
            id="btn_footer_back"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-mono uppercase cursor-pointer"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Factor</span>
          </button>
          
          <div className="text-xs text-slate-600 font-mono">
            MONARCH SWIFT SCANNER
          </div>

          <button
            id="btn_footer_next"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-mono uppercase cursor-pointer font-bold"
            onClick={handleNext}
          >
            <span>Skip Forward</span>
            <ChevronRight className="w-4 h-4" />
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
                  <h3 className="text-lg font-extrabold tracking-wider font-mono text-cyan-400 uppercase">System Notification</h3>
                  <p className="text-slate-400 text-xs font-mono mt-1">INCOMING BLUE-SCREEN INTERACTION</p>
                </div>
              </div>

              <div id="system_popup_question" className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 mb-6 leading-relaxed">
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
                  className="px-5 py-3 border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer font-bold"
                  onClick={declineCall}
                >
                  DECLINE
                </button>
                <button
                  id="btn_popup_accept"
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer hover:shadow-md hover:shadow-cyan-500/20"
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
