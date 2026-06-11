import React from "react";
import { motion } from "motion/react";
import { Sparkles, Star, Camera } from "lucide-react";

interface AvatarWithFrameProps {
  playerName: string;
  level: number;
  profileImage: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  allowUpload?: boolean;
  className?: string;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  playerName,
  level,
  profileImage,
  size = "md",
  onClick,
  allowUpload = false,
  className = ""
}) => {
  // Dimensions map based on size
  const sizes = {
    sm: {
      wrapper: "w-12 h-12",
      avatar: "w-8 h-8",
      fontSize: "text-xs",
      levelBadgeSize: "text-[7px] px-1 py-0.5",
      frameOffset: "-inset-2",
      badgeOffset: "-bottom-1 -right-1",
    },
    md: {
      wrapper: "w-16 h-16",
      avatar: "w-12 h-12",
      fontSize: "text-sm",
      levelBadgeSize: "text-[8px] px-1.5 py-0.5",
      frameOffset: "-inset-2.5",
      badgeOffset: "-bottom-1 right-0",
    },
    lg: {
      wrapper: "w-24 h-24",
      avatar: "w-18 h-18",
      fontSize: "text-lg",
      levelBadgeSize: "text-[9px] px-2 py-0.5",
      frameOffset: "-inset-3.5",
      badgeOffset: "-bottom-1 right-1.5",
    },
    xl: {
      wrapper: "w-32 h-32",
      avatar: "w-24 h-24",
      fontSize: "text-2xl",
      levelBadgeSize: "text-[10px] px-2.5 py-1",
      frameOffset: "-inset-4.5",
      badgeOffset: "-bottom-2 right-3",
    }
  };

  const config = sizes[size];

  // Helper to determine tier
  // Tier 1: 1-9 (E-Rank / Bronze Recruit)
  // Tier 2: 10-19 (D-Rank / Silver Hunter)
  // Tier 3: 20-29 (C-Rank / Golden Knight)
  // Tier 4: 30-49 (S-Rank / Sapphire Sovereign)
  // Tier 5: 50+ (Monarch Prime Legend)
  const getTier = (lvl: number) => {
    if (lvl < 10) return 1;
    if (lvl < 20) return 2;
    if (lvl < 30) return 3;
    if (lvl < 50) return 4;
    return 5;
  };

  const tier = getTier(level);

  // Render SVG background frames dynamically
  const renderFrameSvg = () => {
    // TIER 1: Bronze/Copper Recruit (Lv 1 - 9)
    if (tier === 1) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_4px_rgba(180,83,9,0.3)]" viewBox="0 0 100 100" fill="none">
          {/* Inner solid border (keeps static) */}
          <circle cx="50" cy="50" r="38" stroke="#78350f" strokeWidth="2" />
          
          {/* Rotating outer ring and beads */}
          <g style={{ transformOrigin: "50px 50px", animation: "custom-spin 20s linear infinite" }}>
            {/* Outer simple circular outline */}
            <circle cx="50" cy="50" r="43" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            {/* Circular beads */}
            <circle cx="50" cy="8" r="3" fill="#b45309" />
            <circle cx="50" cy="92" r="3" fill="#b45309" />
            <circle cx="8" cy="50" r="3" fill="#b45309" />
            <circle cx="92" cy="50" r="3" fill="#b45309" />
          </g>
        </svg>
      );
    }

    // TIER 2: Silver Scout/Hunter (Lv 10 - 19)
    if (tier === 2) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" viewBox="0 0 100 100" fill="none">
          {/* Dashed outer technical gauge */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            stroke="#0891b2" 
            strokeWidth="1" 
            strokeDasharray="4 6" 
            style={{ transformOrigin: "50px 50px", animation: "custom-spin 12s linear infinite" }}
          />
          {/* Inner silver circle */}
          <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="37" stroke="#334155" strokeWidth="1" />
          
          {/* Circular ring nodes (instead of square angles) */}
          <g style={{ transformOrigin: "50px 50px", animation: "custom-spin 12s linear infinite" }}>
            <circle cx="24" cy="24" r="2.5" fill="#06b6d4" />
            <circle cx="76" cy="24" r="2.5" fill="#06b6d4" />
            <circle cx="24" cy="76" r="2.5" fill="#06b6d4" />
            <circle cx="76" cy="76" r="2.5" fill="#06b6d4" />
          </g>
        </svg>
      );
    }

    // TIER 3: Golden Sentinel (Lv 20 - 29)
    if (tier === 3) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" viewBox="0 0 100 100" fill="none">
          {/* Interlocking golden dials */}
          <circle cx="50" cy="50" r="45" stroke="#eab308" strokeWidth="1" />
          {/* Runic notches */}
          <circle 
            cx="50" 
            cy="50" 
            r="41" 
            stroke="#f59e0b" 
            strokeWidth="2.5" 
            strokeDasharray="25 8" 
            style={{ transformOrigin: "50px 50px", animation: "custom-spin-reverse 25s linear infinite" }}
          />
          <circle cx="50" cy="50" r="36" stroke="#fbbf24" strokeWidth="1" />
          {/* Royal Gems - glowing top/bottom and flanks */}
          <g style={{ transformOrigin: "50px 50px", animation: "custom-spin 16s linear infinite" }}>
            <circle cx="50" cy="5" r="4" fill="#ef4444" stroke="#eab308" strokeWidth="1" />
            <circle cx="50" cy="95" r="4" fill="#ef4444" stroke="#eab308" strokeWidth="1" />
            <circle cx="5" cy="50" r="4" fill="#eab308" />
            <circle cx="95" cy="50" r="4" fill="#eab308" />
          </g>
        </svg>
      );
    }

    // TIER 4: Sapphire Sovereign (Lv 30 - 49)
    if (tier === 4) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]" viewBox="0 0 100 100" fill="none">
          {/* Dual tone electric energy fields */}
          <circle 
            cx="50" 
            cy="50" 
            r="46" 
            stroke="#4338ca" 
            strokeWidth="1.5" 
            strokeDasharray="40 10 10 10" 
            style={{ transformOrigin: "50px 50px", animation: "custom-spin 15s linear infinite" }}
          />
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke="#22d3ee" 
            strokeWidth="2" 
            strokeDasharray="5 15" 
            style={{ transformOrigin: "50px 50px", animation: "custom-spin-reverse 8s linear infinite" }}
          />
          <circle cx="50" cy="50" r="36" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />
          {/* Curved cyan lines following the circle */}
          <g style={{ transformOrigin: "50px 50px", animation: "custom-spin 20s linear infinite" }}>
            <path d="M 8 30 C 4 42, 4 58, 8 70" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 92 30 C 96 42, 96 58, 92 70" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="6" r="4.5" fill="#22d3ee" />
            <circle cx="50" cy="94" r="4.5" fill="#22d3ee" />
          </g>
        </svg>
      );
    }

    // TIER 5: Monarch Prime Legend (Lv 50+)
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,0.95)]" viewBox="0 0 100 100" fill="none">
        {/* Triple ring solar system engine */}
        <circle 
          cx="50" 
          cy="50" 
          r="47" 
          stroke="#06b6d4" 
          strokeWidth="2.5" 
          strokeDasharray="60 30" 
          style={{ transformOrigin: "50px 50px", animation: "custom-spin 10s linear infinite" }}
        />
        <circle 
          cx="50" 
          cy="50" 
          r="43" 
          stroke="#f59e0b" 
          strokeWidth="1.5" 
          strokeDasharray="10 15 30 15" 
          style={{ transformOrigin: "50px 50px", animation: "custom-spin-reverse 18s linear infinite" }}
        />
        <circle 
          cx="50" 
          cy="50" 
          r="39" 
          stroke="#a855f7" 
          strokeWidth="1" 
          strokeDasharray="5 5" 
          style={{ transformOrigin: "50px 50px", animation: "custom-spin 4s linear infinite" }}
        />
        {/* Orbit flare nodes ON the circular paths (no square bounds) */}
        <g style={{ transformOrigin: "50px 50px", animation: "custom-spin 14s linear infinite" }}>
          <circle cx="50" cy="3" r="3.5" fill="#eab308" />
          <circle cx="50" cy="97" r="3.5" fill="#06b6d4" />
          <circle cx="3" cy="50" r="3.5" fill="#a855f7" />
          <circle cx="97" cy="50" r="3.5" fill="#22d3ee" />
        </g>
      </svg>
    );
  };

  // Border theme based on level tier
  const getAvatarBorderTheme = () => {
    switch (tier) {
      case 1: return "border-amber-700/80 bg-stone-950 shadow-[inset_0_0_8px_rgba(180,83,9,0.5)]";
      case 2: return "border-cyan-700 bg-slate-950 shadow-[inset_0_0_12px_rgba(6,182,212,0.6)]";
      case 3: return "border-yellow-600 bg-amber-950/20 shadow-[inset_0_0_15px_rgba(234,179,8,0.7)]";
      case 4: return "border-indigo-600 bg-slate-900/40 shadow-[inset_0_0_18px_rgba(99,102,241,0.8)]";
      case 5:
      default:
        return "border-cyan-500 bg-slate-950 shadow-[inset_0_0_25px_rgba(34,211,238,0.9)] animate-pulse";
    }
  };

  // Display text badge
  const getBadgeAccent = () => {
    switch (tier) {
      case 1: return "bg-amber-800 text-amber-100 border-amber-600";
      case 2: return "bg-cyan-850 text-cyan-200 border-cyan-500";
      case 3: return "bg-yellow-600 text-yellow-100 border-yellow-400";
      case 4: return "bg-indigo-900 text-indigo-100 border-indigo-400 animate-pulse";
      case 5:
      default:
        return "bg-gradient-to-r from-yellow-500 via-cyan-500 to-purple-600 text-white border-cyan-300 font-black animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.8)]";
    }
  };

  const getRankName = () => {
    if (tier === 1) return "E-Rank";
    if (tier === 2) return "D-Rank";
    if (tier === 3) return "C-Rank";
    if (tier === 4) return "S-Rank";
    return "MONARCH";
  };

  return (
    <div 
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative select-none flex items-center justify-center shrink-0 ${config.wrapper} ${className || ""} ${onClick ? "cursor-pointer hover:scale-105 transition-transform duration-300 active:scale-95 outline-none" : ""}`}
      id={`avatar_frame_wrapper_lvl_${level}`}
    >
      {/* 1. Rotatory/Detailed Frame Back layer */}
      <div className={`absolute ${config.frameOffset} z-0`}>
        {renderFrameSvg()}
      </div>

      {/* 2. Actual Avatar Circle */}
      <div 
        className={`relative z-10 ${config.avatar} rounded-full overflow-hidden flex items-center justify-center border font-extrabold ${getAvatarBorderTheme()} transition-all duration-300 group`}
      >
        {profileImage ? (
          <img 
            loading="lazy"
            src={profileImage}
            alt={playerName}
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={`font-black tracking-tighter text-slate-200 ${config.fontSize} select-none`}>
            {playerName.substring(0, 2).toUpperCase()}
          </span>
        )}

        {/* Hover overlay for profile pictures uploading if allowed */}
        {allowUpload && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-350 cursor-pointer pointer-events-none">
            <Camera className="w-5 h-5 text-cyan-300" />
          </div>
        )}
      </div>

      {/* 3. Level indicator badge at the corner */}
      <div 
        className={`absolute z-20 ${config.badgeOffset} ${config.levelBadgeSize} rounded-full border bg-slate-950 font-mono flex items-center justify-center scale-95 select-none font-bold tracking-tight ${getBadgeAccent()}`}
        title={`Tier: ${getRankName()} (Level ${level})`}
      >
        {tier === 5 && <Star className="w-2.5 h-2.5 text-yellow-300 mr-0.5 animate-pulse shrink-0 fill-yellow-300" />}
        {level}
      </div>

      {/* Floating particles effect for higher tiers */}
      {tier >= 4 && (
        <span className="absolute -inset-1 pointer-events-none block z-0 overflow-visible">
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cyan-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-1 w-2.5 h-2.5 text-purple-400 animate-ping" />
        </span>
      )}
    </div>
  );
};
