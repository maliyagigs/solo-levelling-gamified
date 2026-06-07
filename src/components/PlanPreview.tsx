/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Sparkles, 
  CheckCircle, 
  Activity, 
  Droplet, 
  Clock, 
  Coffee, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  ArrowRight, 
  Zap, 
  UserPlus, 
  Lock,
  Apple
} from "lucide-react";
import { OnboardingData } from "../types";
import { generatePlan, CustomPlan } from "../data";

interface PlanPreviewProps {
  profile: OnboardingData;
  onComplete: (playerName: string) => void;
}

export default function PlanPreview({ profile, onComplete }: PlanPreviewProps) {
  const [subStep, setSubStep] = useState<"plan" | "loading" | "current_potential" | "attributes" | "growth_90" | "signup">("plan");
  
  // Calculations
  const weightKg = profile.isMetricWeight ? profile.weight : Math.round(profile.weight * 0.453592);
  const heightCm = profile.isMetricHeight ? profile.heightFeet : Math.round((profile.heightFeet * 12 + profile.heightInches) * 2.54);
  
  // BMI calculation
  const bmiRaw = profile.isMetricHeight 
    ? (profile.weight / ((profile.heightFeet / 100) ** 2)) // assuming cm is stored in heightFeet when metric
    : (profile.weight * 703) / ((profile.heightFeet * 12 + profile.heightInches) ** 2);
  const bmi = Math.round(bmiRaw * 10) / 10 || 22.4;

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: "Underweight (Fragile Warrior)", color: "text-amber-400" };
    if (val < 25) return { label: "Normal (Optimal Canvas)", color: "text-emerald-400" };
    if (val < 30) return { label: "Overweight (Bulky Heavy Armour)", color: "text-fuchsia-400" };
    return { label: "Obese (Titan Class)", color: "text-red-500" };
  };

  const bmiStatus = getBmiStatus(bmi);
  const plan: CustomPlan = generatePlan(profile.focusGoal, weightKg);

  // Loading States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  
  // Attributes Show Potential State
  const [showPotentialAttr, setShowPotentialAttr] = useState(false);

  // Sign up form
  const [username, setUsername] = useState("Sung Jin-Woo");
  const [password, setPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const logs = [
    "Analyzing battle dimension variables...",
    "Calculating physical load parameters...",
    "Measuring initial muscular volume thresholds...",
    "Interfacing with the Monarch deep shadow storage...",
    "Generating hyper-trophy calorie macros...",
    "Fusing optimal meal guides with system database...",
    "Establishing system daily penalty quest protocols...",
    "System compilation successfully completed!"
  ];

  // Loading simulator
  useEffect(() => {
    if (subStep === "loading") {
      setLoadingProgress(0);
      setTerminalLines([]);
      
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setSubStep("current_potential");
            }, 800);
            return 100;
          }
          return prev + 4;
        });
      }, 80);

      return () => clearInterval(interval);
    }
  }, [subStep]);

  useEffect(() => {
    if (subStep === "loading") {
      const lineIndex = Math.floor((loadingProgress / 100) * logs.length);
      if (lineIndex < logs.length && !terminalLines.includes(logs[lineIndex])) {
        setTerminalLines((prev) => [...prev, logs[lineIndex]]);
      }
    }
  }, [loadingProgress, subStep]);

  const handleActiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setSignupError("You must supply a hunter name to register your status.");
      return;
    }
    onComplete(username);
  };

  return (
    <div id="plan_preview_container" className="min-h-screen bg-slate-950 text-white p-4 flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Visual Effects */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-10 left-5 w-80 h-80 bg-cyan-900/10 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-center py-6 z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. PLAN PREVIEW DISPLAY */}
          {subStep === "plan" && (
            <motion.div
              key="plan_screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/20 rounded-full filter blur-xl animate-pulse" />
                
                <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase">CUSTOM SELECTION COMPLETE</span>
                <h2 id="plan_preview_title" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-slate-100">
                  Here is your custom plan preview. Tap to continue to get your custom plan
                </h2>
                
                <p className="text-slate-400 text-xs font-mono mt-4 leading-relaxed border-l-2 border-indigo-500 pl-3">
                  Based on your age cycle ({profile.age}) and target awakening goal ({profile.focusGoal.replace("_", " ")}), the system has generated an exact metabolic progression code.
                </p>
              </div>

              {/* BMI and Summary Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="bmi_metric_card" className="bg-slate-950 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500">Gravitational Density Factor</span>
                    <h3 className="text-sm font-bold tracking-wide mt-1 text-slate-300">BODY MASS INDEX</h3>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-extrabold font-mono text-cyan-400">{bmi}</span>
                    <span className="text-xs text-slate-600 font-mono ml-1">kg/m²</span>
                  </div>
                  <div className={`text-xs font-mono font-bold ${bmiStatus.color}`}>
                     {bmiStatus.label}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500">Calibration Profile</span>
                    <h3 className="text-sm font-bold tracking-wide mt-1 text-slate-300">HUNTER PARAMETERS</h3>
                  </div>
                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Academic focus:</span>
                      <span className="text-cyan-300 font-bold capitalize">
                        {profile.academicSubject === "comp_sci" ? "Computer Science" : 
                         profile.academicSubject === "math_physics" ? "Math & Physics" :
                         profile.academicSubject === "bio_med" ? "Biomedical & Med" :
                         profile.academicSubject === "biz_finance" ? "Business & Finance" :
                         profile.academicSubject === "humanities" ? "Humanities" : "Scholar Grinds"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Daily Study Target:</span>
                      <span className="text-blue-300 font-bold">{profile.academicSessionsGoal || 4} Pomodoros</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Career Target:</span>
                      <span className="text-indigo-300 font-bold capitalize">
                        {profile.careerTargetRole === "software_eng" ? "Software Engineer" :
                         profile.careerTargetRole === "data_scientist" ? "Data/AI Alchemist" :
                         profile.careerTargetRole === "product_manager" ? "Product Specialist" :
                         profile.careerTargetRole === "designer" ? "Creative Designer" :
                         profile.careerTargetRole === "analyst" ? "Financial Analyst" : "Professional Guild"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Training Split:</span>
                      <span className="text-cyan-400 font-bold uppercase">
                        {profile.bodybuildingSplit === "push_pull_legs" ? "Push Pull Legs" :
                         profile.bodybuildingSplit === "bro_split" ? "Classic Bro" :
                         profile.bodybuildingSplit === "upper_lower" ? "Upper Lower" : "Full Body Force"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warrior Rank:</span>
                      <span className="text-emerald-400 font-bold uppercase">{profile.fitnessLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition & Macros Section */}
              <div id="nutrition_preview" className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm tracking-wide text-slate-300">DAILY METABOLIC FUEL (MACROS)</h3>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    Target: {plan.calorieGoal} Calories
                  </div>
                </div>

                <div id="macro_bars" className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">PROTEIN</span>
                    <span className="text-lg font-bold font-mono text-cyan-300">{plan.proteinG}g</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">CARBS</span>
                    <span className="text-lg font-bold font-mono text-amber-500">{plan.carbsG}g</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">FAT</span>
                    <span className="text-lg font-bold font-mono text-fuchsia-400">{plan.fatsG}g</span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">System Recommended Daily Feast (Easy-to-Find):</span>
                  
                  {plan.meals.map((meal, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.favicon}</span>
                        <div>
                          <span className="text-xs text-slate-500 font-mono block uppercase">{meal.type}</span>
                          <span className="text-xs font-bold text-slate-300">{meal.name}</span>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-400">
                        {meal.grams} Grams
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal parameters section */}
              <div id="parameter_blocks" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center">
                  <Droplet className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Water Drink</span>
                  <span className="font-bold text-sm font-mono mt-1 block">{plan.waterLiters} Liters</span>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center">
                  <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Workout Limit</span>
                  <span className="font-bold text-sm font-mono mt-1 block">{plan.workoutTimeMin} Mins</span>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center">
                  <Coffee className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Rest Breaks</span>
                  <span className="font-bold text-sm font-mono mt-1 block">{plan.restTimeMin} Seconds</span>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center col-span-2 md:col-span-1">
                  <TrendingUp className="w-5 h-5 text-fuchsia-400 mx-auto mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly Target</span>
                  <span className="font-bold text-xs font-mono mt-1 block truncate px-1">{profile.workoutFrequency} Runs</span>
                </div>
              </div>

              {/* Weekly text goal */}
              <div className="p-4 bg-slate-950 border border-dashed border-slate-900 rounded-xl text-center text-xs text-slate-400 font-mono italic">
                &ldquo;Weekly Target: {plan.weeklyGoalDesc}&rdquo;
              </div>

              <div id="preview_confirm_actions" className="pt-4 flex justify-center">
                <button
                  id="btn_continue_plan_preview"
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 font-mono tracking-widest text-xs uppercase px-14 py-4 rounded-full font-extrabold flex items-center gap-3 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-800/10 cursor-pointer animate-pulse border border-cyan-300/10"
                  onClick={() => setSubStep("loading")}
                >
                  <span>Build Custom Plan Portfolio</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. LOADING SCREEN WITH PROGRESS BAR */}
          {subStep === "loading" && (
            <motion.div
              key="loading_screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full text-center max-w-lg mx-auto"
            >
              <div className="relative mb-8 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full animate-spin flex items-center justify-center">
                  <div className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center">
                    <Flame className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-extrabold tracking-wider font-mono text-cyan-400 uppercase">Constructing Custom Plan...</h3>
              <p className="text-slate-500 text-sm font-mono mt-1 uppercase">Dimensional Synchronisation in progress</p>

              {/* Progress gauge */}
              <div id="loading_progress_container" className="my-8 bg-slate-900 border border-slate-800 h-6 p-1 rounded-full relative overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-slate-100 mix-blend-difference">
                  {loadingProgress}%
                </span>
              </div>

              {/* Terminal Logs Simulation */}
              <div id="terminal_logs" className="bg-slate-950 border border-slate-900 p-4 rounded-xl min-h-[160px] text-left font-mono text-xs text-indigo-400 space-y-2 overflow-y-auto">
                <AnimatePresence>
                  {terminalLines.map((line, ix) => (
                    <motion.div
                      key={ix}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-cyan-400 text-xs font-bold">&gt;</span>
                      <span className="text-slate-300 leading-relaxed text-xs">{line}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* 3. CURRENT VS POTENTIAL LEVEL (BAR GRAPH) */}
          {subStep === "current_potential" && (
            <motion.div
              key="current_potential_screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">SYSTEM AWAKENING CAPABILITIES</span>
                <h2 id="current_potential_heading" className="text-2xl font-extrabold tracking-tight">CURRENT VS. POTENTIAL LEVEL RANGE</h2>
                <p className="text-slate-400 text-xs mt-2 font-mono">The System has mapped your true physical ceiling following the 90 day challenge.</p>
              </div>

              {/* Bar Graph */}
              <div id="potential_bar_graph" className="bg-slate-950 border border-slate-900 p-8 rounded-2xl grid grid-cols-2 gap-8 relative overflow-hidden max-w-sm mx-auto">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
                
                {/* Current level bar container */}
                <div className="flex flex-col items-center justify-end h-64 space-y-3">
                  <div className="w-12 bg-slate-900 border border-slate-800 rounded-t-lg h-[10%] flex items-end justify-center relative overflow-hidden">
                    <motion.div 
                      className="w-full bg-slate-500" 
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <div className="text-center font-mono">
                    <div className="text-xl font-bold text-slate-500">Lv 1</div>
                    <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Current</div>
                  </div>
                </div>

                {/* Potential level bar container */}
                <div className="flex flex-col items-center justify-end h-64 space-y-3">
                  <div className="w-12 bg-slate-900 border border-indigo-500/20 rounded-t-lg h-[100%] flex items-end justify-center relative overflow-hidden">
                    <motion.div 
                      className="w-full bg-gradient-to-t from-indigo-600 via-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/20" 
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                    />
                  </div>
                  <div className="text-center font-mono">
                    <div className="text-2xl font-black text-cyan-400 animate-pulse">Lv 100+</div>
                    <div className="text-[10px] text-cyan-400 uppercase tracking-widest mt-1 font-bold">Potential</div>
                  </div>
                </div>
              </div>

              <div id="level_comparison_text_box" className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
                You are currently listed as an <span className="text-amber-500 font-bold">E-Rank Survivor (Lv 1)</span>. The Monarch Protocol opens direct access to a cosmic <span className="text-cyan-400 font-bold">Shadow Monarch (Lv 100+)</span> status, boosting cell recovery, muscle fiber density, and cardiovascular endurance.
              </div>

              <div className="flex justify-center">
                <button
                  id="btn_current_potential_continue"
                  className="bg-slate-900 border border-cyan-400/30 text-cyan-400 font-mono tracking-widest text-xs uppercase px-12 py-3 rounded-full hover:bg-slate-800 font-bold cursor-pointer flex items-center gap-2"
                  onClick={() => setSubStep("attributes")}
                >
                  <span>Continue Potential Scans</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. ATTRIBUTES PROGRESS BOOST STATUS SCREEN */}
          {subStep === "attributes" && (
            <motion.div
              key="attributes_screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">ANATOMICAL CAPACITY MULTI-SCAN</span>
                <h2 id="attributes_heading" className="text-2xl font-extrabold tracking-tight">CELLULAR STAT POINTS EVALUATION</h2>
                <p className="text-slate-400 text-xs mt-2 font-mono">Simulated growth output after the system unlocks your deep physical limits.</p>
              </div>

              {/* Progress bars block */}
              <div id="attributes_progress_list" className="bg-slate-950 border border-slate-900 p-6 rounded-2xl max-w-md mx-auto space-y-5 text-left font-mono">
                
                {/* Attribute: Strength */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase">STRENGTH (STR)</span>
                    <span className={showPotentialAttr ? "text-cyan-400 font-bold" : "text-slate-500"}>
                      {showPotentialAttr ? "98 / 100 (Sovereign Level)" : "12 / 100 (E-Rank)"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                      initial={{ width: "12%" }}
                      animate={{ width: showPotentialAttr ? "98%" : "12%" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Attribute: Vitality */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase">VITALITY (VIT)</span>
                    <span className={showPotentialAttr ? "text-indigo-400 font-bold" : "text-slate-500"}>
                      {showPotentialAttr ? "95 / 100 (Unbreakable)" : "18 / 100 (Brittle)"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: "18%" }}
                      animate={{ width: showPotentialAttr ? "95%" : "18%" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Attribute: Agility */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase">AGILITY (AGI)</span>
                    <span className={showPotentialAttr ? "text-cyan-400 font-bold" : "text-slate-500"}>
                      {showPotentialAttr ? "99 / 100 (Godspeed)" : "8 / 100 (Heavy Slug)"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-400"
                      initial={{ width: "8%" }}
                      animate={{ width: showPotentialAttr ? "99%" : "8%" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Attribute: Recovery */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase">RECOVERY (REC)</span>
                    <span className={showPotentialAttr ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {showPotentialAttr ? "92 / 100 (Regenerative)" : "22 / 100 (Delayed Soreness)"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500"
                      initial={{ width: "22%" }}
                      animate={{ width: showPotentialAttr ? "92%" : "22%" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

              </div>

              {/* Command button area */}
              <div id="attributes_show_potential_actions" className="flex flex-col items-center gap-4 pt-3">
                {!showPotentialAttr ? (
                  <motion.button
                    id="btn_show_potential"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-mono tracking-widest text-xs uppercase px-12 py-4 rounded-full font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
                    onClick={() => setShowPotentialAttr(true)}
                  >
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <span>Show Potential</span>
                  </motion.button>
                ) : (
                  <motion.button
                    id="btn_attributes_continue"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-emerald-400 text-emerald-400 font-mono tracking-widest text-xs uppercase px-14 py-4 rounded-full font-extrabold cursor-pointer flex items-center gap-2 hover:bg-slate-800"
                    onClick={() => setSubStep("growth_90")}
                  >
                    <span>Proceed after Awakening</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. THE SOVEREIGN CHALLENGE SCREEN (90 DAYS) */}
          {subStep === "growth_90" && (
            <motion.div
              key="growth_90_screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">90 DAYS PHYSICAL EVOLUTION</span>
                <h2 id="growth_90_heading" className="text-2xl font-extrabold tracking-tight">GIVE YOURSELF 90 DAYS</h2>
                <p className="text-slate-400 text-xs mt-2 font-mono">Compare growth trajectory with the Monarch tracking versus standard lone efforts.</p>
              </div>

              {/* 90-day comparison growth chart */}
              <div id="growth_chart_block" className="bg-slate-950 border border-slate-900 p-6 rounded-2xl max-w-md mx-auto space-y-6 relative overflow-hidden font-mono text-left">
                
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-900">
                  <span>Awakening Phase</span>
                  <span>Predicted Rank Progress</span>
                </div>

                <div className="space-y-4">
                  {/* Option A: With Monarch System */}
                  <div className="p-4 bg-slate-900/40 border border-cyan-500/25 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        WITH THE MONARCH
                      </span>
                      <span className="text-cyan-300">S-Rank Level (E to S in 90 Days)</span>
                    </div>
                    {/* Linear trend estimation visual */}
                    <div className="h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.8, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block leading-relaxed">
                      Sustained workout cycles driven by interactive XP gains, guild rankings, and leveling structures.
                    </span>
                  </div>

                  {/* Option B: Without system tracker */}
                  <div className="p-4 bg-slate-900/10 border border-slate-900 rounded-xl opacity-60">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-wider">WITHOUT MONARCH SYSTEM</span>
                      <span className="text-slate-500">Stuck E-Rank (Flatline)</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        className="h-full bg-slate-700"
                        initial={{ width: 0 }}
                        animate={{ width: "15%" }}
                        transition={{ duration: 1.2 }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                      Standard fitness applications lead to 85% drop-out thresholds within the first 14 days due to repetitive loops.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900 rounded-xl text-xs text-indigo-300 text-center leading-relaxed font-semibold italic">
                  &ldquo;A king rules. A monarch rules absolute. Choose target ascension.&rdquo;
                </div>
              </div>

              <div id="growth_verify_actions" className="pt-2 flex justify-center">
                <button
                  id="btn_unlock_my_potential"
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-mono tracking-widest text-xs uppercase px-14 py-4 rounded-full font-extrabold flex items-center gap-2 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-800/10 cursor-pointer border border-cyan-300/15 animate-bounce"
                  onClick={() => setSubStep("signup")}
                >
                  <Lock className="w-4 h-4 text-cyan-300" />
                  <span>Unlock My Potential</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. SIGN-IN / SIGN-UP FORM GATES */}
          {subStep === "signup" && (
            <motion.div
              key="signup_screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-sm mx-auto"
            >
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">PLAYER CERTIFICATION REGISTRY</span>
                <h2 id="signup_heading" className="text-2xl font-extrabold tracking-tight">ACCEPT THE CONTRACT</h2>
                <p className="text-slate-400 text-xs mt-2 font-mono">Assign your hunter name or claim your Sung Jin-Woo identity to connect with the server database.</p>
              </div>

              <form id="signup_interactive_form" onSubmit={handleActiveSubmit} className="bg-slate-950 border border-slate-900 p-6 rounded-2xl text-left space-y-4">
                
                {/* Name field */}
                <div className="space-y-2">
                  <label id="lbl_hunter_name" className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">Hunter Identity (Name)</label>
                  <input
                    id="input_username"
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm font-mono text-cyan-300 outline-none focus:border-cyan-400/50"
                    placeholder="Sung Jin-Woo" aria-label="Sung Jin-Woo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label id="lbl_hunter_pin" className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">Security PIN-code / Password (Optional)</label>
                  <input
                    id="input_password"
                    type="password"
                    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm font-mono text-cyan-300 outline-none focus:border-cyan-400/50"
                    placeholder="••••" aria-label="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="text-[9px] text-slate-600 block uppercase font-mono">Locks your character's gear and attributes locally.</span>
                </div>

                {signupError && (
                  <div className="p-3 bg-red-950/40 border border-red-900 text-red-200 text-xs font-mono rounded-lg">
                    {signupError}
                  </div>
                )}

                <button
                  id="btn_submit_signup"
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-mono font-extrabold tracking-widest text-xs uppercase p-4 h-12 rounded-xl flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-indigo-500 shadow-md cursor-pointer border border-cyan-400/10"
                >
                  <UserPlus className="w-4 h-4 text-cyan-300" />
                  <span>CLAIM HUNTER LICENSE</span>
                </button>
              </form>

              <div id="register_note" className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl text-[10px] text-slate-500 font-mono leading-relaxed uppercase">
                BY ENTERING THE GATES, YOU CERTIFY RESPONSIBILITY FOR YOUR PHYSICAL CONDITIONAL TRAINING DAILY TASKS. GOOD LUCK HUNTER.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {subStep === "plan" && (
        <footer className="py-4 border-t border-slate-900 w-full max-w-2xl mx-auto flex justify-between items-center z-10 text-xs font-mono text-slate-600">
          <span>PORTFOLIO CODE PREVIEW v1.07</span>
          <span>MONARCH SECURE LOG REGISTER</span>
        </footer>
      )}
    </div>
  );
}
