import React, { useState, useEffect, useRef } from "react";
import React, { useState, useEffect, useRef } from "react";

// Extremely detailed menacing SVG representations of the weapons.
const VectorWeapons = {
  rusty_dagger: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="rustyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="50%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="rustEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <filter id="rustAura">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>
      {/* Blade Base */}
      <path d="M45,30 L50,5 L55,30 L53,130 L47,130 Z" fill="url(#rustyGrad)" stroke="#292524" strokeWidth="1" filter="url(#rustAura)" />
      {/* Edge */}
      <path d="M48,30 L50,10 L52,30 L51,128 L49,128 Z" fill="url(#rustEdge)" opacity="0.8" />
      {/* Deep jagged chunks missing */}
      <path d="M55,50 L48,55 L54,60 Z" fill="#0c0a09" />
      <path d="M45,75 L50,78 L46,85 Z" fill="#0c0a09" />
      <path d="M54,100 L51,102 L53,108 Z" fill="#0c0a09" />
      <path d="M50,40 L50,110" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 2" />
      {/* Guard */}
      <path d="M30,130 L70,130 L65,138 L35,138 Z" fill="#292524" stroke="#ca8a04" strokeWidth="0.5" />
      {/* Handle */}
      <rect x="43" y="138" width="14" height="42" fill="#451a03" />
      <path d="M43,142 L57,148 M43,150 L57,156 M43,158 L57,164 M43,166 L57,172" stroke="#b45309" strokeWidth="2" />
      {/* Pommel */}
      <polygon points="50,186 42,180 58,180" fill="#292524" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  ),
  kasaka_fang: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="kasakaGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="30%" stopColor="#059669" />
          <stop offset="70%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#ecfdf5" />
        </linearGradient>
        <filter id="kasakaGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="venomPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Ambient venom glow */}
      <circle cx="50" cy="50" r="40" fill="url(#venomPulse)" opacity="0.4" />
      
      {/* Wicked Curved Fang Blade */}
      <path d="M35,115 C20,70 45,20 70,5 C70,5 65,35 55,50 C45,65 60,90 50,115 Z" fill="url(#kasakaGrad)" filter="url(#kasakaGlow)" />
      
      {/* Internal acidic core */}
      <path d="M42,105 C32,70 50,30 65,15" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
      
      {/* Serpentine Bone Guard */}
      <path d="M25,115 Q50,140 75,115 L80,125 Q50,150 20,125 Z" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
      <circle cx="25" cy="120" r="3" fill="#10b981" className="animate-ping" />
      <circle cx="75" cy="120" r="3" fill="#10b981" className="animate-ping" />
      
      {/* Scaled Viper Handle */}
      <path d="M42,125 L58,125 L55,175 L45,175 Z" fill="#020617" />
      <path d="M43,130 L57,135 L43,140 L57,145 L43,150 L57,155 L43,160 L57,165 L43,170 L57,175" fill="none" stroke="#059669" strokeWidth="1.5" />
      
      {/* Venom drip from tip */}
      <circle cx="70" cy="10" r="2" fill="#34d399" className="animate-bounce" />
    </svg>
  ),
  baruka_dagger: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="iceGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="40%" stopColor="#bae6fd" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="frostGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Ice Crystal Blade - Angular and Sharp */}
      <polygon points="50,10 65,50 63,110 50,125 37,110 35,50" fill="url(#iceGrad)" filter="url(#frostGlow)" />
      {/* Frosty sheer reflection */}
      <polygon points="50,15 60,50 58,105 50,115" fill="#ffffff" opacity="0.7" />
      <polygon points="50,15 40,50 42,105 50,115" fill="#38bdf8" opacity="0.4" />
      {/* Frost Guard */}
      <polygon points="30,120 70,120 75,130 50,140 25,130" fill="#082f49" stroke="#7dd3fc" strokeWidth="2" />
      {/* Wrapped Handle in White Leather */}
      <rect x="42" y="135" width="16" height="40" fill="#f8fafc" />
      <path d="M42,140 L58,145 M42,150 L58,155 M42,160 L58,165" stroke="#94a3b8" strokeWidth="2" />
      {/* Frozen Pommel Crystal */}
      <polygon points="50,185 40,175 60,175" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" filter="url(#frostGlow)" className="animate-ping" />
      {/* Little floating ice dust */}
      <circle cx="20" cy="40" r="1.5" fill="#ffffff" className="animate-pulse" />
      <circle cx="80" cy="70" r="2" fill="#bae6fd" className="animate-pulse" />
    </svg>
  ),
  demon_dagger: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="demonGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#450a0a" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="demonSteel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="hellFire">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Menacing Demonic Aura */}
      <ellipse cx="50" cy="60" rx="30" ry="50" fill="#991b1b" opacity="0.3" filter="url(#hellFire)" className="animate-pulse" />
      
      {/* Brutal Serrated Main Blade */}
      <path d="M45,20 L50,-5 L55,20 L65,30 L57,40 L68,55 L55,60 L62,80 L55,85 L60,110 L40,110 L45,85 L38,80 L45,60 L32,55 L43,40 L35,30 Z" fill="url(#demonGrad)" />
      
      {/* Razor Edge Highlight */}
      <path d="M50,-2 L50,110" stroke="#fecaca" strokeWidth="1.5" opacity="0.8" />
      <path d="M45,20 L65,30 M57,40 L68,55 M55,60 L62,80 M45,20 L35,30 M43,40 L32,55 M45,60 L38,80" stroke="#fca5a5" strokeWidth="1" opacity="0.6" />
      
      {/* Infernal Eye Guard */}
      <path d="M20,105 Q50,90 80,105 Q90,130 80,120 Q50,140 20,120 Q10,130 20,105 Z" fill="url(#demonSteel)" stroke="#991b1b" strokeWidth="2" />
      <circle cx="50" cy="115" r="5" fill="#f87171" filter="url(#hellFire)" className="animate-ping" />
      <circle cx="50" cy="115" r="2" fill="#ffffff" />
      
      {/* Spiked Grip */}
      <rect x="42" y="125" width="16" height="45" fill="#020617" />
      <path d="M40,135 L60,138 M40,150 L60,153 M40,165 L60,168" stroke="#dc2626" strokeWidth="2" />
      
      {/* Claw Pommel */}
      <path d="M35,170 L45,195 L50,185 L55,195 L65,170 Z" fill="url(#demonSteel)" stroke="#ef4444" strokeWidth="1" />
    </svg>
  ),
  shadow_reaper: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <radialGradient id="reaperAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Shadow background */}
      <circle cx="50" cy="50" r="45" fill="url(#reaperAura)" opacity="0.5" className="animate-pulse" />
      {/* Dagger modeled as a mini curving scythe / krambit style */}
      <path d="M20,60 C30,10 70,5 90,30 C70,10 40,20 30,60 Z" fill="#0f172a" />
      <path d="M18,58 C28,12 65,8 80,28 C62,15 42,22 33,56 Z" fill="#c084fc" opacity="0.8" />
      <path d="M15,55 C25,15 60,10 75,25 C55,15 45,25 35,50 Z" fill="#e9d5ff" />
      {/* Hilt */}
      <path d="M20,60 L45,75 M30,45 L50,60" stroke="#581c87" strokeWidth="3" />
      <rect x="35" y="60" width="12" height="40" transform="rotate(-30 41 80)" fill="#020617" />
      <circle cx="68" cy="115" r="8" fill="#020617" stroke="#9333ea" strokeWidth="2" />
      <circle cx="68" cy="115" r="4" fill="#d8b4fe" className="animate-ping" />
    </svg>
  ),
  kamish_fang: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="dragonFlame" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="30%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="kamishGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Immense aura of the Dragon's wrath */}
      <circle cx="50" cy="50" r="45" fill="#f97316" filter="url(#kamishGlow)" opacity="0.3" className="animate-ping" />
      {/* Huge, brutal dragon tooth curved blade */}
      <path d="M35,110 C20,30 50,0 65,0 C55,40 60,80 55,110 Z" fill="url(#dragonFlame)" filter="url(#kamishGlow)" />
      {/* Glowing superheated core within the tooth */}
      <path d="M42,90 C35,40 50,15 58,5" fill="none" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
      {/* Scaled obsidian guard */}
      <path d="M25,115 Q50,105 75,115 L70,135 Q50,120 30,135 Z" fill="#020617" />
      <path d="M25,115 Q50,105 75,115" fill="none" stroke="#fb923c" strokeWidth="2" filter="url(#kamishGlow)" />
      {/* Dragon-scale Grip */}
      <path d="M40,125 L60,125 L55,185 L45,185 Z" fill="#292524" />
      <path d="M41,135 L59,145 M41,150 L59,160 M41,165 L59,175" stroke="#f97316" strokeWidth="2" />
      {/* Eye of Kamish Pommel */}
      <circle cx="50" cy="190" r="7" fill="#fbbf24" stroke="#c2410c" strokeWidth="2" filter="url(#kamishGlow)" />
      <circle cx="50" cy="190" r="2" fill="#000000" />
    </svg>
  ),
  vulcan_rage: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <radialGradient id="lavaCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <filter id="lavaGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Demon king Vulcan's heavy magma club/mace */}
      <ellipse cx="50" cy="40" rx="35" ry="40" fill="url(#lavaCore)" filter="url(#lavaGlow)" className="animate-pulse" />
      {/* Cracks showing lava */}
      <path d="M30,20 L40,35 L35,50 M65,25 L55,40 L60,55 M45,60 L50,75 L45,85 M55,30 L45,45" stroke="#fef08a" strokeWidth="1" fill="none" filter="url(#lavaGlow)" />
      {/* Spikes jutting out */}
      <polygon points="15,40 5,30 20,25" fill="#450a0a" />
      <polygon points="85,40 95,30 80,25" fill="#450a0a" />
      <polygon points="30,5 25,-5 40,10" fill="#450a0a" />
      <polygon points="70,5 75,-5 60,10" fill="#450a0a" />
      {/* Heavy obsidian shaft */}
      <path d="M40,75 L60,75 L55,190 L45,190 Z" fill="#292524" />
      <path d="M42,90 L58,95 M43,120 L57,125 M44,150 L56,155 M45,180 L55,185" stroke="#b91c1c" strokeWidth="3" />
    </svg>
  ),
  igris_sword: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="igrisBlade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="30%" stopColor="#1e1b4b" />
          <stop offset="45%" stopColor="#be123c" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="55%" stopColor="#be123c" />
          <stop offset="70%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="igrisGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <filter id="bloodLightning">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Arcing Red Lightning Vectors */}
      <path d="M45,20 L35,30 L40,50 L25,60 L45,70" fill="none" stroke="#f43f5e" strokeWidth="1" filter="url(#bloodLightning)" opacity="0.7" className="animate-pulse" />
      <path d="M55,30 L70,40 L60,60 L75,70 L55,80" fill="none" stroke="#f43f5e" strokeWidth="1" filter="url(#bloodLightning)" opacity="0.7" className="animate-pulse" />
      
      {/* Massive Dark Greatsword Blade */}
      <path d="M40,30 L50,-10 L60,30 L62,110 L38,110 Z" fill="url(#igrisBlade)" />
      
      {/* Crimson Energy Core Fuller */}
      <path d="M50,0 L50,110" stroke="#fb7185" strokeWidth="2" filter="url(#bloodLightning)" />
      <path d="M50,0 L50,110" stroke="#ffffff" strokeWidth="1" />
      
      {/* intricate Royal Guard */}
      <path d="M10,105 L35,115 L45,108 L50,120 L55,108 L65,115 L90,105 L70,125 L85,140 L60,130 L50,145 L40,130 L15,140 L30,125 Z" fill="url(#igrisGold)" stroke="#78350f" strokeWidth="0.5" />
      
      {/* Extended Two-Handed Dark Grip */}
      <rect x="42" y="140" width="16" height="45" fill="#0f172a" />
      <path d="M42,145 L58,150 M42,150 L58,155 M42,155 L58,160 M42,160 L58,165 M42,165 L58,170 M42,170 L58,175 M42,175 L58,180" stroke="#78350f" strokeWidth="1.5" />
      
      {/* Weighted Spiked Pommel */}
      <path d="M35,185 L65,185 L50,205 Z" fill="url(#igrisGold)" />
      <circle cx="50" cy="188" r="4" fill="#e11d48" filter="url(#bloodLightning)" />
    </svg>
  ),
  sovereigns_wrath: (animate: boolean) => (
    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="wrathBladeL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#be185d" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="wrathBladeR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="galaxyGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="starCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Cosmic Nexus Background Aura */}
      <circle cx="100" cy="110" r="60" fill="url(#starCore)" opacity="0.6" className="animate-pulse" />
      
      {/* V-formation Dual Blades crossed at base */}
      <g transform="translate(0, -10)">
        {/* Left Saber of Dawn */}
        <path d="M85,160 L20,30 L35,15 L95,145 Z" fill="url(#wrathBladeL)" />
        <path d="M28,22 L90,152" stroke="#fbcfe8" strokeWidth="2.5" filter="url(#galaxyGlow)" />
        
        {/* Right Saber of Dusk */}
        <path d="M115,160 L180,30 L165,15 L105,145 Z" fill="url(#wrathBladeR)" />
        <path d="M172,22 L110,152" stroke="#d8b4fe" strokeWidth="2.5" filter="url(#galaxyGlow)" />
        
        {/* Central Crown Guard */}
        <path d="M70,140 L100,120 L130,140 L140,170 L100,190 L60,170 Z" fill="#0f172a" stroke="#ec4899" strokeWidth="2" filter="url(#galaxyGlow)" />
        <path d="M80,150 L100,135 L120,150 L100,170 Z" fill="#020617" />
        <circle cx="100" cy="152" r="10" fill="url(#starCore)" filter="url(#galaxyGlow)" className="animate-pulse" />
        
        {/* Monarch Grip */}
        <rect x="90" y="180" width="20" height="30" fill="#020617" />
        <path d="M85,190 L115,190 M85,200 L115,200" stroke="#8b5cf6" strokeWidth="3" />
        
        {/* Orbiting Stars */}
        <circle cx="50" cy="60" r="3" fill="#fdf2f8" filter="url(#galaxyGlow)" className="animate-ping" />
        <circle cx="150" cy="80" r="2.5" fill="#f5f3ff" filter="url(#galaxyGlow)" className="animate-ping" />
        <circle cx="100" cy="40" r="4" fill="#fbcfe8" filter="url(#galaxyGlow)" className="animate-ping" />
      </g>
    </svg>
  ),
  monarch_authority: (animate: boolean) => (
    <svg viewBox="0 0 100 240" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <radialGradient id="authorityGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="40%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Majestic spear / staff of raw dominance */}
      <rect x="45" y="60" width="10" height="180" fill="#020617" />
      <path d="M45,60 L55,60" fill="none" stroke="#d8b4fe" strokeWidth="10" strokeDasharray="15 30" opacity="0.6" />
      <path d="M40,65 L60,65 M40,85 L60,85 M40,210 L60,210" stroke="#e879f9" strokeWidth="3" />
      
      {/* Floating spearhead wings */}
      <path d="M30,70 C10,40 50,20 50,0 M70,70 C90,40 50,20 50,0" fill="none" stroke="#d8b4fe" strokeWidth="3" filter="drop-shadow(0 0 5px #c084fc)" />
      <path d="M20,60 C0,30 50,10 50,0 M80,60 C100,30 50,10 50,0" fill="none" stroke="#c084fc" strokeWidth="1" />
      
      {/* Main Core diamond spear tip */}
      <polygon points="50,10 65,40 50,60 35,40" fill="#a855f7" filter="drop-shadow(0 0 10px #e9d5ff)" className="animate-pulse" />
      <polygon points="50,15 58,40 50,55 42,40" fill="#faf5ff" opacity="0.9" />
      {/* Halo Behind Tip */}
      <ellipse cx="50" cy="35" rx="35" ry="10" fill="url(#authorityGlow)" opacity="0.6" className="animate-ping" />
      <ellipse cx="50" cy="35" rx="45" ry="5" fill="url(#authorityGlow)" opacity="0.4" className="animate-pulse" />
    </svg>
  ),
  abyssal_void: (animate: boolean) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <radialGradient id="voidCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="70%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <filter id="voidGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Swirling black hole core aura */}
      <circle cx="50" cy="50" r="45" fill="#4c1d95" opacity="0.3" filter="url(#voidGlow)" className="animate-ping" />
      <ellipse cx="50" cy="50" rx="30" ry="10" fill="#1e1b4b" transform="rotate(45 50 50)" filter="url(#voidGlow)" />
      <ellipse cx="50" cy="50" rx="30" ry="10" fill="#1e1b4b" transform="rotate(-45 50 50)" filter="url(#voidGlow)" />
      
      {/* A spatial tear acting as a blade */}
      <path d="M40,110 C20,50 60,-10 65,0 C50,20 65,80 60,110 Z" fill="url(#voidCore)" filter="drop-shadow(0 0 10px #581c87)" />
      <path d="M48,100 C32,50 58,-5 62,5" fill="none" stroke="#c084fc" strokeWidth="2" strokeDasharray="3 6" opacity="0.8" className="animate-pulse" />
      
      {/* Broken space hilt */}
      <path d="M20,115 L80,105 L70,125 L30,135 Z" fill="#0f172a" stroke="#7e22ce" strokeWidth="2" />
      
      {/* Void Grip */}
      <path d="M42,125 L58,122 L55,185 L45,185 Z" fill="#000000" />
      {/* Rings of distorted gravity around grip */}
      <ellipse cx="50" cy="140" rx="12" ry="3" fill="none" stroke="#a855f7" strokeWidth="1" filter="url(#voidGlow)" />
      <ellipse cx="50" cy="160" rx="12" ry="3" fill="none" stroke="#a855f7" strokeWidth="1" filter="url(#voidGlow)" />
      
      {/* Void gem */}
      <circle cx="50" cy="190" r="8" fill="#000000" stroke="#7e22ce" strokeWidth="3" filter="url(#voidGlow)" className="animate-ping" />
    </svg>
  ),  
  shadow_scythe: (animate: boolean) => (
    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <radialGradient id="scytheAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="soulGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Massive Dark Aura */}
      <ellipse cx="120" cy="60" rx="80" ry="60" fill="url(#scytheAura)" opacity="0.5" className="animate-pulse" />
      
      {/* Obsidian Staff */}
      <path d="M115,10 L85,200" stroke="#020617" strokeWidth="10" strokeLinecap="round" />
      {/* Glowing bindings */}
      <path d="M115,10 L85,200" stroke="#c084fc" strokeWidth="2" strokeDasharray="15 15" opacity="0.9" filter="url(#soulGlow)" />
      
      {/* Immense Soul-Reaping Blade */}
      <path d="M110,40 C160,0 210,30 200,80 C150,40 120,60 95,95 Z" fill="#4c1d95" />
      <path d="M107,37 C155,-5 205,25 195,75 C145,35 115,55 92,92 Z" fill="#0f172a" opacity="0.9" />
      {/* Razor Edge of Void */}
      <path d="M105,35 C150,-10 200,20 190,70" fill="none" stroke="#d8b4fe" strokeWidth="2" filter="url(#soulGlow)" />
      
      {/* Skull Nexus (where blade meets staff) */}
      <path d="M90,45 C80,35 115,30 120,50 C125,70 90,75 80,60 Z" fill="#1e293b" stroke="#7e22ce" strokeWidth="2" />
      {/* Glowing amethyst eyes */}
      <circle cx="102" cy="48" r="3" fill="#c084fc" filter="url(#soulGlow)" className="animate-ping" />
      <circle cx="112" cy="52" r="3" fill="#c084fc" filter="url(#soulGlow)" className="animate-ping" />
      
      {/* Ethereal soul wisps draining from the blade */}
      <path d="M150,40 Q160,20 180,25" fill="none" stroke="#c084fc" strokeWidth="1.5" opacity="0.7" filter="url(#soulGlow)" className="animate-pulse" />
      <path d="M170,55 Q185,45 195,60" fill="none" stroke="#d8b4fe" strokeWidth="1" opacity="0.8" filter="url(#soulGlow)" className="animate-pulse" />
    </svg>
  ),
  hunters_bow: (animate: boolean) => (
    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="bowMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id="holyLight">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Electrified Hard-Light Bow String */}
      <path d="M40,20 Q60,100 40,180" fill="none" stroke="#7dd3fc" strokeWidth="2" filter="url(#holyLight)" className="animate-pulse" />
      <path d="M40,20 L60,100 L40,180" fill="none" stroke="#e0f2fe" strokeWidth="1" />
      
      {/* High Tech Composite Recurve Limbs */}
      <path d="M30,10 C180,30 180,170 30,190 C75,140 85,120 85,100 C85,80 75,60 30,10 Z" fill="url(#bowMetal)" />
      {/* Inner power tracts */}
      <path d="M45,30 C150,50 150,150 45,170" fill="none" stroke="#38bdf8" strokeWidth="3" filter="url(#holyLight)" />
      
      {/* Advanced Stabilizer Grip */}
      <path d="M70,80 L100,80 L95,120 L70,120 Z" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="85" cy="100" r="5" fill="#bae6fd" filter="url(#holyLight)" className="animate-ping" />
      
      {/* Loaded Radiant Arrow */}
      <path d="M10,100 L160,100" stroke="#ffffff" strokeWidth="3" filter="url(#holyLight)" />
      {/* Arrow Head */}
      <polygon points="150,90 180,100 150,110" fill="#e0f2fe" filter="url(#holyLight)" className="animate-pulse" />
      {/* Arrow Fletching */}
      <path d="M10,100 L30,90 L30,110 Z" fill="#bae6fd" opacity="0.8" />
    </svg>
  ),
  knights_shield: (animate: boolean) => (
    <svg viewBox="0 0 160 200" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="shieldBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="shieldGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="20%" stopColor="#ca8a04" />
          <stop offset="80%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <filter id="coreGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Massive Tower Shield Base */}
      <path d="M15,15 L145,15 L145,90 C145,150 80,195 80,195 C80,195 15,150 15,90 Z" fill="url(#shieldBase)" stroke="#020617" strokeWidth="6" />
      
      {/* Heavy Gold Spiked Trim */}
      <path d="M25,25 L135,25 L135,85 C135,135 80,175 80,175 C80,175 25,135 25,85 Z" fill="none" stroke="url(#shieldGold)" strokeWidth="8" />
      <path d="M10,10 L30,30 M150,10 L130,30 M80,195 L80,175" stroke="url(#shieldGold)" strokeWidth="6" strokeLinecap="round" />
      
      {/* Central Blue Diamond Core (Paladin's Heart) */}
      <path d="M80,50 L110,85 L80,120 L50,85 Z" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2" />
      <path d="M80,60 L100,85 L80,110 L60,85 Z" fill="#93c5fd" filter="url(#coreGlow)" className="animate-pulse" />
      <circle cx="80" cy="85" r="5" fill="#ffffff" filter="url(#coreGlow)" />
      
      {/* Engraved Guardian Wings */}
      <path d="M70,85 Q40,60 35,95 Q50,110 70,100" fill="none" stroke="#64748b" strokeWidth="3" opacity="0.6" />
      <path d="M90,85 Q120,60 125,95 Q110,110 90,100" fill="none" stroke="#64748b" strokeWidth="3" opacity="0.6" />
      
      {/* Forged Steel Rivets */}
      <circle cx="35" cy="35" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      <circle cx="125" cy="35" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      <circle cx="35" cy="85" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      <circle cx="125" cy="85" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      <circle cx="55" cy="135" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      <circle cx="105" cy="135" r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
    </svg>
  ),
  mage_staff: (animate: boolean) => (
    <svg viewBox="0 0 100 240" className={`w-full h-full drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
      <defs>
        <linearGradient id="ancientWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#292524" />
          <stop offset="30%" stopColor="#451a03" />
          <stop offset="70%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
        <filter id="manaGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="gemCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
      </defs>
      
      {/* Ambient Mana Aura */}
      <circle cx="50" cy="40" r="35" fill="#38bdf8" opacity="0.3" filter="url(#manaGlow)" className="animate-pulse" />
      
      {/* Gnarled Ancient Wood Shaft */}
      <path d="M42,70 C55,120 35,180 48,235 L52,235 C38,180 58,120 48,70 Z" fill="url(#ancientWood)" />
      
      {/* Dark magical vines wrapped around staff */}
      <path d="M45,90 C30,110 70,130 45,160" fill="none" stroke="#1c1917" strokeWidth="3" />
      <path d="M48,150 C70,170 30,190 50,220" fill="none" stroke="#1c1917" strokeWidth="2.5" />
      
      {/* Crown of Gnarled Branches clutching the gem */}
      <path d="M45,75 C25,50 15,30 25,10 C35,25 42,50 48,65 Z" fill="url(#ancientWood)" />
      <path d="M52,70 C70,45 80,25 70,10 C60,25 55,50 50,65 Z" fill="url(#ancientWood)" />
      <path d="M48,75 C35,60 30,50 40,40 C45,50 48,60 50,70 Z" fill="url(#ancientWood)" />
      
      {/* Levitating Supreme Mana Gem */}
      <polygon points="50,15 65,40 50,65 35,40" fill="url(#gemCore)" filter="url(#manaGlow)" />
      <polygon points="50,20 60,40 50,60 40,40" fill="#ffffff" opacity="0.8" />
      
      {/* Floating Arcane Runes & Mana Particles */}
      <circle cx="20" cy="20" r="2.5" fill="#bae6fd" filter="url(#manaGlow)" className="animate-ping" />
      <circle cx="80" cy="50" r="2" fill="#7dd3fc" filter="url(#manaGlow)" className="animate-ping" />
      <circle cx="50" cy="0" r="3" fill="#e0f2fe" filter="url(#manaGlow)" className="animate-ping" />
      <path d="M15,40 L25,45 L15,50" fill="none" stroke="#38bdf8" strokeWidth="1.5" filter="url(#manaGlow)" className="animate-pulse" />
      <path d="M75,20 L85,15 L80,25" fill="none" stroke="#38bdf8" strokeWidth="1.5" filter="url(#manaGlow)" className="animate-pulse" />
    </svg>
  ),
  default: (animate: boolean) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full opacity-50 ${animate ? "animate-pulse" : ""}`}>
      <circle cx="50" cy="50" r="20" fill="currentColor" />
    </svg>
  )
};

export const ALL_WEAPON_NAMES = [
  "Rusty Dagger",
  "Kasaka's Venom Fang",
  "Baruka's Dagger",
  "Demon King's Dagger",
  "Shadow Reaper",
  "Kamish's Fang",
  "Knight Killer",
  "Vulcan's Rage",
  "Sovereign's Wrath",
  "Monarch's Authority",
  "Abyssal Void",
  "Shadow Scythe",
  "Hunter's bow",
  "Knight's shield",
  "Mage staff"
];

export const renderNeonWeaponPreview = (itemId: string, animate = false) => {
  const getVectorGraphic = (id: string) => {
    if (!id) id = "generic_sword";
    const lowerId = id.toString().toLowerCase();
    
    if (lowerId.includes("rusty")) return VectorWeapons.rusty_dagger(animate);
    if (lowerId.includes("kasaka") || lowerId.includes("venom")) return VectorWeapons.kasaka_fang(animate);
    if (lowerId.includes("baruka") || lowerId.includes("ice")) return VectorWeapons.baruka_dagger(animate);
    if (lowerId.includes("demon") || lowerId.includes("blood")) return VectorWeapons.demon_dagger(animate);
    if (lowerId.includes("reaper")) return VectorWeapons.shadow_reaper(animate);
    if (lowerId.includes("kamish") || lowerId.includes("dragon")) return VectorWeapons.kamish_fang(animate);
    if (lowerId.includes("igris") || lowerId.includes("knight") || lowerId.includes("sword")) return VectorWeapons.igris_sword(animate);
    if (lowerId.includes("vulcan") || lowerId.includes("rage") || lowerId.includes("mace") || lowerId.includes("club")) return VectorWeapons.vulcan_rage(animate);
    if (lowerId.includes("sovereign") || lowerId.includes("wrath") || lowerId.includes("blade")) return VectorWeapons.sovereigns_wrath(animate);
    if (lowerId.includes("monarch") || lowerId.includes("authority") || lowerId.includes("spear")) return VectorWeapons.monarch_authority(animate);
    if (lowerId.includes("void") || lowerId.includes("abyssal")) return VectorWeapons.abyssal_void(animate);
    if (lowerId.includes("scythe")) return VectorWeapons.shadow_scythe(animate);
    if (lowerId.includes("bow")) return VectorWeapons.hunters_bow(animate);
    if (lowerId.includes("shield")) return VectorWeapons.knights_shield(animate);
    if (lowerId.includes("staff") || lowerId.includes("mage")) return VectorWeapons.mage_staff(animate);
    
    // Default fallback - generic sword rather than an egg
    return (
      <svg viewBox="0 0 100 200" className={`w-full h-full opacity-60 drop-shadow-sm ${animate ? "animate-pulse" : ""}`}>
        {/* Simple Sword Base */}
        <path d="M45,30 L55,30 L50,10 Z" fill="#94a3b8" />
        <path d="M45,30 L55,30 L53,130 L47,130 Z" fill="#cbd5e1" />
        <path d="M50,10 L50,130" stroke="#f8fafc" strokeWidth="1" opacity="0.6" />
        {/* Guard */}
        <polygon points="30,130 70,130 65,140 35,140" fill="#334155" />
        {/* Handle */}
        <rect x="44" y="140" width="12" height="35" fill="#475569" />
        {/* Pommel */}
        <circle cx="50" cy="180" r="6" fill="#334155" />
      </svg>
    );
  }

  return (
    <div className={`w-full h-full relative flex items-center justify-center select-none ${animate ? "animate-pulse" : ""}`}>
      {getVectorGraphic(itemId)}
    </div>
  );
};

// Rotatable 3D Weapon inspector stage utilizing layered parallax Z-axial translation offsets (highly optimized for Android WebView performance)
export const Rotatable3DWeapon = ({ itemId }: { itemId: string }) => {
  const rotationRef = useRef({ x: -10, y: 35, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentRotationStart = useRef({ x: 0, y: 0 });
  const autoSpinActive = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  // High quality adaptive glow and color parameters for inherit weapon styling
  const WEAPON_THEMES: Record<string, {
    color: string;
    glowColor: string;
    glowColorLight: string;
    accentColor: string;
    shadows: {
      backGlow: string;
      midGlow: string;
      frontGlow: string;
    };
    wireframeBorder: string;
  }> = {
    rusty_dagger: {
      color: "#eab308",
      glowColor: "rgba(234, 179, 8, 1)",
      glowColorLight: "rgba(234, 179, 8, 0.4)",
      accentColor: "amber",
      shadows: {
        backGlow: "drop-shadow(0 0 10px rgba(234,179,8,0.4)) drop-shadow(0 0 20px rgba(234,179,8,0.2))",
        midGlow: "drop-shadow(0 0 5px rgba(234,179,8,0.5))",
        frontGlow: "drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 0 8px rgba(234,179,8,0.6))"
      },
      wireframeBorder: "border-amber-500/50 shadow-[inset_0_0_15px_rgba(234,179,8,0.2)]"
    },
    kasaka_fang: {
      color: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 1)",
      glowColorLight: "rgba(34, 211, 238, 0.4)",
      accentColor: "cyan",
      shadows: {
        backGlow: "drop-shadow(0 0 10px rgba(34,211,238,0.4)) drop-shadow(0 0 20px rgba(34,211,238,0.2))",
        midGlow: "drop-shadow(0 0 5px rgba(34,211,238,0.5))",
        frontGlow: "drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 0 8px rgba(34,211,238,0.6))"
      },
      wireframeBorder: "border-cyan-500/50 shadow-[inset_0_0_15px_rgba(34,211,238,0.2)]"
    },
    igris_sword: {
      color: "#f43f5e",
      glowColor: "rgba(244, 63, 94, 1)",
      glowColorLight: "rgba(244, 63, 94, 0.4)",
      accentColor: "rose",
      shadows: {
        backGlow: "drop-shadow(0 0 10px rgba(244,63,94,0.4)) drop-shadow(0 0 20px rgba(244,63,94,0.2))",
        midGlow: "drop-shadow(0 0 5px rgba(244,63,94,0.5))",
        frontGlow: "drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 0 8px rgba(244,63,94,0.6))"
      },
      wireframeBorder: "border-rose-500/50 shadow-[inset_0_0_15px_rgba(244,63,94,0.2)]"
    },
    demon_dagger: {
      color: "#818cf8",
      glowColor: "rgba(129, 140, 248, 1)",
      glowColorLight: "rgba(129, 140, 248, 0.4)",
      accentColor: "indigo",
      shadows: {
        backGlow: "drop-shadow(0 0 10px rgba(129,140,248,0.4)) drop-shadow(0 0 20px rgba(129,140,248,0.2))",
        midGlow: "drop-shadow(0 0 5px rgba(129,140,248,0.5))",
        frontGlow: "drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 0 8px rgba(129,140,248,0.6))"
      },
      wireframeBorder: "border-indigo-500/50 shadow-[inset_0_0_15px_rgba(129,140,248,0.2)]"
    },
    kamish_fang: {
      color: "#db2777",
      glowColor: "rgba(219, 39, 119, 1)",
      glowColorLight: "rgba(219, 39, 119, 0.4)",
      accentColor: "purple",
      shadows: {
        backGlow: "drop-shadow(0 0 10px rgba(219, 39, 119, 0.4)) drop-shadow(0 0 20px rgba(219, 39, 119, 0.2))",
        midGlow: "drop-shadow(0 0 5px rgba(219, 39, 119, 0.5))",
        frontGlow: "drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 0 8px rgba(219, 39, 119, 0.6))"
      },
      wireframeBorder: "border-fuchsia-500/50 shadow-[inset_0_0_15px_rgba(219,39,119,0.2)]"
    },
    sovereigns_wrath: {
      color: "#ec4899",
      glowColor: "rgba(236, 72, 153, 1)",
      glowColorLight: "rgba(236, 72, 153, 0.4)",
      accentColor: "pink",
      shadows: {
        backGlow: "drop-shadow(0 0 12px rgba(236, 72, 153, 0.4)) drop-shadow(0 0 25px rgba(236, 72, 153, 0.2))",
        midGlow: "drop-shadow(0 0 6px rgba(236, 72, 153, 0.5))",
        frontGlow: "drop-shadow(0 0 3px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(236, 72, 153, 0.6))"
      },
      wireframeBorder: "border-pink-500/50 shadow-[inset_0_0_15px_rgba(236,72,153,0.2)]"
    },
    baruka_dagger: {
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 1)",
      glowColorLight: "rgba(56, 189, 248, 0.4)",
      accentColor: "sky",
      shadows: {
        backGlow: "drop-shadow(0 0 12px rgba(56,189,248,0.4)) drop-shadow(0 0 25px rgba(56,189,248,0.2))",
        midGlow: "drop-shadow(0 0 6px rgba(56,189,248,0.5))",
        frontGlow: "drop-shadow(0 0 3px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(56,189,248,0.6))"
      },
      wireframeBorder: "border-sky-500/50 shadow-[inset_0_0_15px_rgba(56,189,248,0.2)]"
    },
    vulcan_rage: {
      color: "#f97316",
      glowColor: "rgba(249, 115, 22, 1)",
      glowColorLight: "rgba(249, 115, 22, 0.4)",
      accentColor: "orange",
      shadows: {
        backGlow: "drop-shadow(0 0 12px rgba(249,115,22,0.4)) drop-shadow(0 0 25px rgba(249,115,22,0.2))",
        midGlow: "drop-shadow(0 0 6px rgba(249,115,22,0.5))",
        frontGlow: "drop-shadow(0 0 3px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(249,115,22,0.6))"
      },
      wireframeBorder: "border-orange-500/50 shadow-[inset_0_0_15px_rgba(249,115,22,0.2)]"
    },
    shadow_reaper: {
      color: "#a855f7",
      glowColor: "rgba(168, 85, 247, 1)",
      glowColorLight: "rgba(168, 85, 247, 0.4)",
      accentColor: "purple",
      shadows: {
        backGlow: "drop-shadow(0 0 12px rgba(168,85,247,0.4)) drop-shadow(0 0 25px rgba(168,85,247,0.2))",
        midGlow: "drop-shadow(0 0 6px rgba(168,85,247,0.5))",
        frontGlow: "drop-shadow(0 0 3px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(168,85,247,0.6))"
      },
      wireframeBorder: "border-purple-500/50 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]"
    },
    monarch_authority: {
      color: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 1)",
      glowColorLight: "rgba(251, 191, 36, 0.4)",
      accentColor: "amber",
      shadows: {
        backGlow: "drop-shadow(0 0 15px rgba(251,191,36,0.4)) drop-shadow(0 0 30px rgba(251,191,36,0.2))",
        midGlow: "drop-shadow(0 0 8px rgba(251,191,36,0.5))",
        frontGlow: "drop-shadow(0 0 4px rgba(255,255,255,0.4)) drop-shadow(0 0 12px rgba(251,191,36,0.6))"
      },
      wireframeBorder: "border-yellow-500/50 shadow-[inset_0_0_15px_rgba(251,191,36,0.2)]"
    },
    abyssal_void: {
      color: "#ec4899",
      glowColor: "rgba(236, 72, 153, 1)",
      glowColorLight: "rgba(236, 72, 153, 0.4)",
      accentColor: "pink",
      shadows: {
        backGlow: "drop-shadow(0 0 15px rgba(236,72,153,0.4)) drop-shadow(0 0 30px rgba(236,72,153,0.2))",
        midGlow: "drop-shadow(0 0 8px rgba(236,72,153,0.5))",
        frontGlow: "drop-shadow(0 0 4px rgba(255,255,255,0.4)) drop-shadow(0 0 12px rgba(236,72,153,0.6))"
      },
      wireframeBorder: "border-pink-500/50 shadow-[inset_0_0_15px_rgba(236,72,153,0.2)]"
    }
  };

  const baseId = Object.keys(WEAPON_THEMES).find(k => itemId.toLowerCase().includes(k)) || "rusty_dagger";
  const theme = WEAPON_THEMES[baseId];

  const updateTransforms = () => {
    if (plateRef.current) {
      plateRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg) rotateZ(${rotationRef.current.z}deg)`;
    }
  };

  // Passive slow idle spin/wobble
  useEffect(() => {
    let lastTime = performance.now();
    const updateRef = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isDragging && autoSpinActive.current) {
        rotationRef.current.x = -10 + Math.sin(now * 0.001) * 8;
        rotationRef.current.y = (rotationRef.current.y + delta * 25) % 360;
        rotationRef.current.z = Math.cos(now * 0.0007) * 4;
        updateTransforms();
      }
      animationFrameRef.current = requestAnimationFrame(updateRef);
    };

    animationFrameRef.current = requestAnimationFrame(updateRef);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging]);

  // Handle mouse/touch down
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    autoSpinActive.current = false;
    dragStart.current = { x: clientX, y: clientY };
    currentRotationStart.current = { x: rotationRef.current.x, y: rotationRef.current.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.pointerType === "mouse" || (e.touches && e.touches[0])) {
      const clientX = e.touches ? e.touches[0].clientX : (e as any).clientX;
      const clientY = e.touches ? e.touches[0].clientY : (e as any).clientY;
      handleDragStart(clientX, clientY);
    }
  };

  // Handle mouse/touch move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;

    // Sensitivity: 0.6 degrees per pixel
    const newRotationY = currentRotationStart.current.y + deltaX * 0.6;
    // Clamp X rotation to prevent flipping upside down (-60 to 60 is perfect)
    const newRotationX = Math.max(-60, Math.min(60, currentRotationStart.current.x - deltaY * 0.6));

    rotationRef.current.x = newRotationX;
    rotationRef.current.y = newRotationY;
    updateTransforms();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : (e as any).clientX;
    const clientY = e.touches ? e.touches[0].clientY : (e as any).clientY;
    handleDragMove(clientX, clientY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Resume auto spin after short delay
    setTimeout(() => {
      autoSpinActive.current = true;
    }, 1500);
  };

  const resetRotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    rotationRef.current = { x: -10, y: 35, z: 0 };
    updateTransforms();
    autoSpinActive.current = true;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between pointer-events-auto">
      {/* Hidden SVG Filter Definition for the Metallic Bevel */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="global3DMetalBevel" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="2.0" specularConstant="0.8" specularExponent="20" lightingColor="#ffffff" result="specOut">
              <fePointLight x="-50" y="-100" z="200" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feDiffuseLighting in="blur" surfaceScale="1.5" diffuseConstant="1.1" lightingColor="#e2e8f0" result="diffOut">
              <fePointLight x="150" y="200" z="50" />
            </feDiffuseLighting>
            <feComposite in="diffOut" in2="SourceAlpha" operator="in" result="diffOut" />
            <feBlend mode="screen" in="specOut" in2="SourceGraphic" result="lit1" />
            <feBlend mode="multiply" in="diffOut" in2="lit1" result="lit2" />
          </filter>
        </defs>
      </svg>
      {/* Helper instructions overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-30 select-none">
        <button 
          type="button"
          onClick={resetRotation}
          className="text-[9px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1 cursor-pointer z-40"
          title="Reset Vector Perspective"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          ALIGN VIEW
        </button>
      </div>

      {/* Outer Perspective Wrapper */}
      <div 
        className="relative w-full aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ perspective: "1000px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Main 3D rotatable staging plate */}
        <div 
          ref={plateRef}
          className="relative w-full h-full max-w-[450px] max-h-[450px] flex items-center justify-center will-change-transform"
          style={{ 
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg) rotateZ(${rotationRef.current.z}deg)`
          }}
        >
          {/* High-Resolution Voxel/Layer Extrusion for Real 3D Structure */}
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center scale-[1.7]"
            style={{ 
              transform: "translateZ(0px)", 
              transformStyle: "preserve-3d",
            }}
          >
            {/* Ambient Back Glow - Immense Area */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-[0.5]" style={{ filter: theme.shadows.backGlow, transform: "translateZ(-20px)" }}>
               {renderNeonWeaponPreview(itemId, false)}
            </div>
            
            {/* Micro-Facet Real 3D Extrusion (Volumetric slice stacking) */}
            {Array.from({length: 41}).map((_, i) => {
              const z = (i - 20) * 0.8; // fine step size
              const isFront = i === 40;
              const isBack = i === 0;
              const isSurface = isFront || isBack;
              
              // Simulate highly realistic metallic shading across the Z-axis (darker in the middle, light catching edges)
              // The faces (front and back) are bright, the sides are dark but picking up specular highlights
              const brightness = isSurface ? 'brightness-[1.1] contrast-[1.1]' : 'brightness-[0.4] contrast-[1.5] saturate-50';
              const edgeHighlight = (i === 1 || i === 39) ? 'brightness-[1.5] opacity-90' : '';
              
              return (
                <div 
                  key={z} 
                  className={`absolute inset-0 w-full h-full flex items-center justify-center transform-gpu ${brightness} ${edgeHighlight} ${isSurface ? 'drop-shadow-sm' : 'opacity-[0.98]'}`} 
                  style={{ 
                    transform: `translateZ(${z}px)`,
                    filter: isSurface ? 'url(#global3DMetalBevel)' : 'none'
                  }}
                >
                   {renderNeonWeaponPreview(itemId, false)}
                </div>
              );
            })}

            {/* Sub-Surface Scattering / Volumetric Glow Core */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center mix-blend-screen opacity-70" style={{ filter: theme.shadows.midGlow, transform: "translateZ(18px)" }}>
               {renderNeonWeaponPreview(itemId, false)}
            </div>
            
            {/* Front Specular Highlight */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center brightness-[1.2] contrast-[1.1] saturate-[1.2] mix-blend-overlay opacity-60" style={{ filter: theme.shadows.frontGlow, transform: "translateZ(20px)" }}>
               {renderNeonWeaponPreview(itemId, false)}
            </div>
            {/* Soft Bloom */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center mix-blend-screen opacity-40" style={{ transform: "translateZ(22px)", filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))" }}>
               {renderNeonWeaponPreview(itemId, false)}
            </div>
          </div>

          {/* Holographic Staging Grid (Floor plate to ground the look in match colors) */}
          <div 
            className="absolute bottom-1 w-[80%] h-[12%] rounded-full border pointer-events-none opacity-60"
            style={{ 
              transform: "rotateX(90deg) translateZ(-40px)",
              transformStyle: "preserve-3d",
              borderColor: `${theme.color}40`,
              backgroundImage: `radial-gradient(ellipse at center, ${theme.color}25 0%, transparent 70%)`
            }}
          />
        </div>
      </div>

      {/* Interaction drag tooltip at bottom */}
      <span className="text-[9px] text-slate-500 tracking-widest uppercase mb-1 pointer-events-none select-none z-10 flex items-center gap-1.5 font-bold">
        <svg className="w-3 h-3 text-slate-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        DRAG TO INSPECT VECTOR 3D VOLUME
      </span>
    </div>
  );
};
