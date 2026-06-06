import React from "react";
import { motion } from "motion/react";

export const getWeaponColorClasses = (itemId: string) => {
  switch (itemId) {
    case "rusty_dagger":
      return {
        border: "hover:border-amber-500/50",
        bg: "hover:bg-amber-950/20",
        glow: "hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]",
        text: "text-amber-400",
        textLight: "text-amber-300",
        badge: "bg-amber-950/50 text-amber-300 border-amber-500/30"
      };
    case "kasaka_fang":
      return {
        border: "hover:border-cyan-500/50",
        bg: "hover:bg-cyan-950/20",
        glow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]",
        text: "text-cyan-400",
        textLight: "text-cyan-300",
        badge: "bg-cyan-950/50 text-cyan-300 border-cyan-500/30"
      };
    case "igris_sword":
      return {
        border: "hover:border-rose-500/50",
        bg: "hover:bg-rose-950/20",
        glow: "hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
        text: "text-rose-400",
        textLight: "text-rose-300",
        badge: "bg-rose-950/50 text-rose-300 border-rose-500/30"
      };
    case "demon_dagger":
      return {
        border: "hover:border-indigo-500/50",
        bg: "hover:bg-indigo-950/20",
        glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
        text: "text-indigo-400",
        textLight: "text-indigo-300",
        badge: "bg-indigo-950/50 text-indigo-300 border-indigo-500/30"
      };
    case "kamish_fang":
      return {
        border: "hover:border-purple-500/50",
        bg: "hover:bg-purple-950/20",
        glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
        text: "text-purple-400",
        textLight: "text-purple-300",
        badge: "bg-purple-950/50 text-purple-300 border-purple-500/30"
      };
    case "sovereigns_wrath":
      return {
        border: "hover:border-pink-500/60",
        bg: "hover:bg-pink-950/20",
        glow: "hover:shadow-[0_0_35px_rgba(236,72,153,0.35)]",
        text: "text-pink-400",
        textLight: "text-pink-300",
        badge: "bg-pink-950/50 text-pink-300 border-pink-500/30 animate-pulse"
      };
    default:
      return {
        border: "hover:border-cyan-500/30",
        bg: "hover:bg-slate-900/40",
        glow: "hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]",
        text: "text-slate-350",
        textLight: "text-slate-200",
        badge: "bg-slate-900 text-slate-300 border-slate-700"
      };
  }
};

export const renderCircularProgress = (
  value: number,
  max: number,
  colorFrom: string,
  colorTo: string,
  glowColor: string,
  label: string,
  subText: React.ReactNode,
  icon: React.ReactNode,
  id: string,
  secondaryValue?: number,
  secondaryMax?: number,
  secondaryColorFrom?: string,
  secondaryColorTo?: string
) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const radius = 24;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  let secondaryPercentage = 0;
  let secondaryRadius = 29;
  let secondaryStrokeWidth = 2.5;
  let secondaryCircumference = 2 * Math.PI * secondaryRadius;
  let secondaryStrokeOffset = secondaryCircumference;

  if (secondaryValue !== undefined && secondaryMax !== undefined && secondaryMax > 0) {
    secondaryPercentage = Math.min(100, Math.max(0, (secondaryValue / secondaryMax) * 100));
    secondaryStrokeOffset = secondaryCircumference - (secondaryPercentage / 100) * secondaryCircumference;
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-slate-950/20 backdrop-blur-sm rounded-xl w-full border border-slate-900/40">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 select-none pointer-events-none" viewBox="0 0 64 64" style={{ overflow: 'visible' }}>
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="stroke-slate-900/60"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            stroke={`url(#${id}-gradient)`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 3px ${glowColor})`,
            }}
          />
          {secondaryValue !== undefined && (
            <>
              <circle
                cx="32"
                cy="32"
                r={secondaryRadius}
                className="stroke-slate-900/60"
                strokeWidth={secondaryStrokeWidth}
                fill="transparent"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={secondaryRadius}
                stroke={`url(#${id}-gradient-sec)`}
                strokeWidth={secondaryStrokeWidth}
                fill="transparent"
                strokeDasharray={secondaryCircumference}
                initial={{ strokeDashoffset: secondaryCircumference }}
                animate={{ strokeDashoffset: secondaryStrokeOffset }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                strokeLinecap="round"
              />
            </>
          )}
          <defs>
            <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
            {secondaryValue !== undefined && (
              <linearGradient id={`${id}-gradient-sec`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={secondaryColorFrom} />
                <stop offset="100%" stopColor={secondaryColorTo} />
              </linearGradient>
            )}
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          {icon}
        </div>
      </div>
      
      <div className="mt-2.5 font-mono text-center">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">{label}</span>
        <span className="text-[11px] font-bold text-cyan-400 mt-0.5 block truncate max-w-full px-1">{subText}</span>
      </div>
    </div>
  );
};
