import React, { useState, useEffect, useRef } from "react";

// High quality vector contour neon renderings for weapon previews (1000x Detailed)
export const renderNeonWeaponPreview = (itemId: string, animate = false, layer: "all" | "back" | "base" | "front" | "sparks" = "all") => {
  const baseId = itemId.split("_")[0];
  switch (baseId) {
    case "rusty_dagger":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="rustyBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#452a10" />
              <stop offset="50%" stopColor="#8c5825" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <radialGradient id="rustyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
              <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
            </radialGradient>
            <filter id="yellowNeonGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Aura */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="35" fill="url(#rustyGlow)" className="opacity-60" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1" strokeDasharray="3,3" />
            </>
          )}

          {/* Rusty Scrap Sparks */}
          {(layer === "all" || layer === "sparks") && (
            <g className="opacity-70">
              <path d="M 25,25 L 27,27 M 70,70 L 68,68 M 30,72 L 32,70 M 75,25 L 73,27" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="45" cy="20" r="1.2" fill="#eab308" />
              <circle cx="55" cy="78" r="1.2" fill="#eab308" />
            </g>
          )}

          {/* Weapon Art */}
          {(layer === "all" || layer === "base") && (
            <g transform="translate(0, 0)">
              {/* Handle / Wooden Grip */}
              <path d="M 22,78 L 38,62" stroke="#27190c" strokeWidth="6" strokeLinecap="round" />
              {/* Crude Leather Wrapping lines */}
              <path d="M 24,76 L 27,77 M 28,72 L 31,73 M 32,68 L 35,69" stroke="#8c5825" strokeWidth="1.5" />
              
              {/* Crude Pummel */}
              <circle cx="20" cy="80" r="4" fill="#3a230c" stroke="#eab308" strokeWidth="1" />
              
              {/* Metal Guard (Rusty bronze notched block) */}
              <path d="M 30,65 L 43,52 L 40,49 L 27,62 Z" fill="#5c3a1a" stroke="#eab308" strokeWidth="1.5" />
              <circle cx="35" cy="58" r="2" fill="#eab308" />

              {/* Rusty Blade with Notches, Cracks and Wear */}
              <path 
                d="M 38,51 L 78,11 L 74,8 L 60,18 L 47,31 L 43,46 Z" 
                fill="url(#rustyBladeGrad)" 
                stroke="#eab308" 
                strokeWidth="1.2" 
                filter="url(#yellowNeonGlow)"
              />
              {/* Jagged Chips/Notches carved in blade */}
              <path d="M 52,37 L 54,39 L 56,36" stroke="#27190c" strokeWidth="1.5" fill="none" />
              <path d="M 64,25 L 66,27 L 68,24" stroke="#27190c" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {/* Glowing / Detailed details */}
          {(layer === "all" || layer === "front") && (
            <g>
              {/* Shining White Sharp Blade Edge */}
              <path d="M 40,49 L 76,13" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" className="opacity-90" />
              
              {/* Tetanus poison trace */}
              <path d="M 65,24 S 70,18 73,15 S 76,14 78,11" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" className="opacity-80 animate-pulse" />
            </g>
          )}
        </svg>
      );

    case "kasaka_fang":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="kasakaBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="50%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <radialGradient id="cyanViperGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.45)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
            <filter id="cyanGlowFilter" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Radiant serpent magic aura */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="38" fill="url(#cyanViperGlow)" />
              <path d="M 50,15 A 35,35 0 0,1 85,50" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="5,3" />
              <path d="M 15,50 A 35,35 0 0,1 50,85" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="5,3" />
            </>
          )}

          {/* Snake Ribs/Vapor particles */}
          {(layer === "all" || layer === "sparks") && (
            <g className="opacity-70">
              <path d="M 33,25 Q 30,22 28,26" fill="none" stroke="#22d3ee" strokeWidth="1" />
              <path d="M 72,75 Q 75,78 77,74" fill="none" stroke="#22d3ee" strokeWidth="1" />
              <circle cx="75" cy="35" r="1.5" fill="#22d3ee" />
              <circle cx="28" cy="62" r="1.2" fill="#22d3ee" />
            </g>
          )}

          {/* Weapon Composition - Base */}
          {(layer === "all" || layer === "base") && (
            <g>
              {/* Snake Tail/Scale Wrap Handle */}
              <path d="M 18,82 L 34,66" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" />
              {/* Wrapping snake scales */}
              <path d="M 20,80 L 22,78 M 24,76 L 26,74 M 28,72 L 30,70 M 32,68 L 34,66" stroke="#0891b2" strokeWidth="2.2" />

              {/* Snake Fang Guard (Curved skull jaws) */}
              <path d="M 28,70 C 26,65 30,58 36,60 C 42,62 44,56 42,62 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.2" />
              <path d="M 30,68 L 26,62 M 34,64 L 38,58" stroke="#22d3ee" strokeWidth="1" />

              {/* Translucent venom fang blade */}
              <path 
                d="M 34,62 C 38,55 35,42 45,30 C 55,18 75,10 82,6 C 74,20 62,38 52,48 C 45,55 34,62 34,62" 
                fill="url(#kasakaBladeGrad)" 
                stroke="#22d3ee" 
                strokeWidth="1.5" 
                filter="url(#cyanGlowFilter)"
              />
            </g>
          )}

          {/* Front details / poison flows */}
          {(layer === "all" || layer === "front") && (
            <g>
              {/* Venomous glowing core energy channel */}
              <path d="M 40,55 C 45,45 52,32 68,18" fill="none" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" />

              {/* Venom Droplets dripping from blade tip */}
              <circle cx="81" cy="9" r="1.5" fill="#10b981" className="animate-pulse" />
              <path d="M 81,10 Q 82,15 80,18" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );

    case "igris_sword":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="igrisBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e050b" />
              <stop offset="50%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <radialGradient id="bloodGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
            </radialGradient>
            <filter id="crimsonLaserGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric royal seal circles */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="40" fill="url(#bloodGlow)" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="1" strokeDasharray="6,4" />
            </>
          )}

          {/* Red Lightning Arcs around sword */}
          {(layer === "all" || layer === "sparks") && (
            <g className="opacity-80">
              <path d="M 30,35 L 34,31 L 30,27" fill="none" stroke="#f43f5e" strokeWidth="1" />
              <path d="M 68,75 L 72,71 L 68,67" fill="none" stroke="#f43f5e" strokeWidth="1" />
              <path d="M 58,25 L 62,18 L 57,14" fill="none" stroke="#f43f5e" strokeWidth="1" />
            </g>
          )}

          {/* Longsword Assembly - Base */}
          {(layer === "all" || layer === "base") && (
            <g>
              {/* Two Handed royal handle hilt */}
              <path d="M 15,85 L 35,65" stroke="#090d16" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 16,84 L 18,82 M 20,80 L 22,78 M 24,76 L 26,74 M 28,72 L 30,70 M 32,68 L 34,66" stroke="#4c0519" strokeWidth="2" />

              {/* Ruby Pommel */}
              <circle cx="13" cy="87" r="4.5" fill="#e11d48" stroke="#fda4af" strokeWidth="1.2" />

              {/* Winged forward-spiked gold guard */}
              <path d="M 26,69 L 40,55 L 43,58 L 29,72 Z" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />
              <path d="M 31,61 Q 25,54 18,52 C 24,58 31,61 31,61" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />
              <path d="M 39,69 Q 46,76 48,83 C 42,77 39,69 39,69" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />

              {/* Royal Blood Blade with fuller and laser thunder */}
              <path 
                d="M 34,61 L 84,11 L 81,8 L 31,58 Z" 
                fill="url(#igrisBladeGrad)" 
                stroke="#f43f5e" 
                strokeWidth="1.5" 
                filter="url(#crimsonLaserGlow)"
              />
            </g>
          )}

          {/* Front lightning/laser line */}
          {(layer === "all" || layer === "front") && (
            <g>
              {/* Shining White Fuller centerline laser */}
              <path d="M 32,59 L 82,9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Embedded runic engravings along blade */}
              <g stroke="#fda4af" strokeWidth="1" fill="none" className="opacity-80">
                <path d="M 45,46 L 47,44" />
                <path d="M 53,38 L 55,36" />
                <path d="M 61,30 L 63,28" />
                <path d="M 69,22 L 71,20" />
              </g>
            </g>
          )}
        </svg>
      );

    case "demon_dagger":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="demonBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="40%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <radialGradient id="violetDemonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.45)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </radialGradient>
            <filter id="demonicPurpleGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Demonic portal circle background */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="41" fill="url(#violetDemonGlow)" />
              <path d="M 50,12 A 38,38 0 1,1 12,50" fill="none" stroke="rgba(99, 102, 241, 0.22)" strokeWidth="1.2" strokeDasharray="3,1" />
              <path d="M 32,32 L 68,68 M 32,68 L 68,32" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="1" />
            </>
          )}

          {/* Demonic flames */}
          {(layer === "all" || layer === "sparks") && (
            <g className="opacity-70">
              <path d="M 23,45 Q 16,36 21,30 C 26,34 23,45 23,45" fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth="0.8" />
              <path d="M 77,55 Q 84,64 79,70 C 74,66 77,55 77,55" fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth="0.8" />
            </g>
          )}

          {/* Gothic Brutalist Demon Dagger - Base */}
          {(layer === "all" || layer === "base") && (
            <g>
              {/* Spiked pummel ring handle */}
              <circle cx="16" cy="84" r="5" fill="none" stroke="#4f46e5" strokeWidth="3" />
              <path d="M 14,81 L 11,78 M 18,87 L 21,90" stroke="#818cf8" strokeWidth="1.5" />

              {/* Gothic leather bound handle */}
              <path d="M 18,82 L 36,64" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <path d="M 21,79 L 24,76 M 26,74 L 29,71 M 31,69 L 34,66" stroke="#312e81" strokeWidth="2.2" />

              {/* Horned beast skull guards with violet eye */}
              <path d="M 28,68 Q 24,58 34,56 Q 44,54 40,64 Z" fill="#111827" stroke="#4f46e5" strokeWidth="1.5" />
              <path d="M 26,60 L 18,52 M 42,66 L 50,74" fill="none" stroke="#818cf8" strokeWidth="1.8" />

              {/* Aggressive serrated void blades */}
              <path 
                d="M 36,60 L 46,62 L 52,48 L 47,43 L 64,28 L 61,22 L 86,6 C 72,18 64,28 66,35 L 53,40 L 58,46 L 46,50 Z" 
                fill="url(#demonBladeGrad)" 
                stroke="#818cf8" 
                strokeWidth="1.5" 
                filter="url(#demonicPurpleGlow)"
              />
            </g>
          )}

          {/* Front Details (Violet Eye & Center Energy Ridge) */}
          {(layer === "all" || layer === "front") && (
            <g>
              <circle cx="34" cy="62" r="2.5" fill="#c084fc" className="animate-pulse" />
              {/* High-intensity pure white energy ridge down center */}
              <path d="M 38,58 L 76,14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );

    case "kamish_fang":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="kamishBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <radialGradient id="dragonFireGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(219, 39, 119, 0.5)" />
              <stop offset="100%" stopColor="rgba(219, 39, 119, 0)" />
            </radialGradient>
            <filter id="kamishAestheticGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Epic dragon fire storm backdrop */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="42" fill="url(#dragonFireGlow)" />
              <path d="M 50,8 A 42,42 0 0,1 92,50 A 42,42 0 0,1 50,92 A 42,42 0 0,1 8,50" fill="none" stroke="rgba(219, 39, 119, 0.25)" strokeWidth="1.5" strokeDasharray="8,5" />
            </>
          )}
          
          {/* Floating embers */}
          {(layer === "all" || layer === "sparks") && (
            <g className="opacity-90">
              <circle cx="45" cy="18" r="1.5" fill="#f43f5e" />
              <circle cx="78" cy="28" r="1" fill="#facc15" />
              <circle cx="30" cy="72" r="1.2" fill="#ca8a04" />
              <circle cx="68" cy="80" r="1.8" fill="#fda4af" />
            </g>
          )}

          {/* Dragon Bone Kamish Fang - Base */}
          {(layer === "all" || layer === "base") && (
            <g>
              {/* Dragon claw bound bone tail grip segment */}
              <path d="M 16,84 L 32,68" stroke="#1c1917" strokeWidth="7" strokeLinecap="round" />
              <path d="M 15,83 L 13,85 M 19,79 L 18,81 M 23,75 L 22,77 M 27,71 L 26,73" stroke="#ca8a04" strokeWidth="2.5" />
              <circle cx="13" cy="87" r="3.2" fill="#881337" />

              {/* Skull spinal dragon vertebrae guard */}
              <path d="M 26,72 C 22,66 28,58 35,62 C 41,56 46,65 38,72 Z" fill="#292524" stroke="#db2777" strokeWidth="1.5" />
              <circle cx="31" cy="65" r="2" fill="#db2777" />

              {/* Curved organic spiky bone dragon edge blade */}
              <path 
                d="M 32,68 C 36,60 32,48 42,32 C 52,16 78,8 85,5 C 72,18 58,28 48,38 C 38,48 32,68 32,68" 
                fill="url(#kamishBladeGrad)" 
                stroke="#db2777" 
                strokeWidth="1.8" 
                filter="url(#kamishAestheticGlow)"
              />
              {/* Spine spikes jutting out the outer curve */}
              <path d="M 46,31 Q 50,22 45,26 M 55,21 Q 62,13 56,17 L 68,10" fill="none" stroke="#db2777" strokeWidth="1.5" />
            </g>
          )}

          {/* High energy front mana line */}
          {(layer === "all" || layer === "front") && (
            <g>
              {/* Mana transmission core line - glowing pure yellow/hot pink */}
              <path d="M 36,60 Q 45,46 72,15" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 36,60 Q 45,46 72,15" fill="none" stroke="#facc15" strokeWidth="3" className="opacity-45" style={{ filter: "blur(2px)" }} />
            </g>
          )}
        </svg>
      );

    case "sovereigns_wrath":
      return (
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
        >
          <defs>
            <linearGradient id="sovereignBlade1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="40%" stopColor="#581c87" />
              <stop offset="80%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="sovereignBlade2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="40%" stopColor="#31105e" />
              <stop offset="80%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <radialGradient id="voidAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.55)" />
              <stop offset="50%" stopColor="rgba(88, 28, 135, 0.3)" />
              <stop offset="100%" stopColor="rgba(2, 6, 23, 0)" />
            </radialGradient>
            <filter id="etherealAstralFilter" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sovereign crown & Void nebula backdrop */}
          {(layer === "all" || layer === "back") && (
            <>
              <circle cx="50" cy="50" r="45" fill="url(#voidAura)" />
              {/* Concentric mystical runic star map */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244, 114, 182, 0.28)" strokeWidth="1" strokeDasharray="3,1" />
              <path d="M 50,5 L 50,95 M 5,50 L 95,50" stroke="rgba(244, 114, 182, 0.12)" strokeWidth="1.2" strokeDasharray="2,5" />
            </>
          )}
          
          {/* Floating violet-pink sparkles / Crown details */}
          {(layer === "all" || layer === "sparks") && (
            <g>
              <g className="opacity-95">
                <circle cx="50" cy="18" r="2" fill="#ffffff" />
                <circle cx="25" cy="35" r="1.5" fill="#f472b6" />
                <circle cx="75" cy="35" r="1.2" fill="#db2777" />
                <circle cx="18" cy="62" r="1.8" fill="#e879f9" />
                <circle cx="82" cy="62" r="1.5" fill="#ffffff" />
                <circle cx="35" cy="80" r="1.0" fill="#f472b6" />
                <circle cx="65" cy="80" r="1.2" fill="#c084fc" />
              </g>
              {/* Floating crown insignia centered at top */}
              <g transform="translate(42, 8)" stroke="#ec4899" strokeWidth="1" fill="none" className="opacity-80">
                <path d="M 2,12 L 14,12 L 16,5 L 11,8 L 8,2 L 5,8 L 0,5 Z" fill="rgba(236,72,153,0.15)" />
              </g>
            </g>
          )}

          {/* Twin Void blades intersecting elegantly - Base structure */}
          {(layer === "all" || layer === "base") && (
            <g>
              {/* 1. LEFT HAND SABER */}
              <g transform="translate(0, 0)">
                <path d="M 12,88 L 32,68" stroke="#090514" strokeWidth="5" strokeLinecap="round" />
                <path d="M 13,87 L 15,85 M 18,82 L 20,80 M 23,77 L 25,75 M 28,72 L 30,70" stroke="#db2777" strokeWidth="1.8" />
                <circle cx="10" cy="90" r="4" fill="#ec4899" stroke="#f472b6" strokeWidth="1" />

                <path d="M 22,72 L 34,60 M 23,73 C 25,65 31,68 31,68" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                
                <path 
                  d="M 30,70 L 60,40 L 78,12 L 48,34 L 30,70" 
                  fill="url(#sovereignBlade1)" 
                  stroke="#ec4899" 
                  strokeWidth="1.5" 
                  filter="url(#etherealAstralFilter)"
                />
              </g>

              {/* 2. RIGHT HAND SABER */}
              <g transform="translate(0, 0)">
                <path d="M 88,88 L 68,68" stroke="#090514" strokeWidth="5" strokeLinecap="round" />
                <path d="M 87,87 L 85,85 M 82,82 L 80,80 M 77,77 L 75,75 M 72,72 L 70,70" stroke="#db2777" strokeWidth="1.8" />
                <circle cx="90" cy="90" r="4" fill="#ec4899" stroke="#f472b6" strokeWidth="1" />

                <path d="M 78,72 L 66,60 M 77,73 C 75,65 69,68 69,68" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                
                <path 
                  d="M 70,70 L 40,40 L 22,12 L 52,34 L 70,70" 
                  fill="url(#sovereignBlade2)" 
                  stroke="#ec4899" 
                  strokeWidth="1.5" 
                  filter="url(#etherealAstralFilter)"
                />
              </g>
            </g>
          )}

          {/* High intensity White central beams */}
          {(layer === "all" || layer === "front") && (
            <g>
              <path d="M 32,68 L 72,18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 68,68 L 28,18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );
    
    case "baruka_dagger":
      return renderNeonWeaponPreview("kasaka_fang", animate, layer);
    case "vulcan_rage":
      return renderNeonWeaponPreview("igris_sword", animate, layer);
    case "shadow_reaper":
      return renderNeonWeaponPreview("demon_dagger", animate, layer);
    case "monarch_authority":
      return renderNeonWeaponPreview("sovereigns_wrath", animate, layer);
    case "abyssal_void":
      return renderNeonWeaponPreview("sovereigns_wrath", animate, layer);

    default:
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="w-16 h-16 pointer-events-none mx-auto"
        >
          <circle cx="50" cy="50" r="2" fill="#fff" />
        </svg>
      );
  }
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
        backGlow: "drop-shadow(0 0 20px rgba(234,179,8,1)) drop-shadow(0 0 45px rgba(234,179,8,0.95)) drop-shadow(0 0 75px rgba(234,179,8,0.75)) drop-shadow(0 0 120px rgba(234,179,8,0.5))",
        midGlow: "drop-shadow(0 0 12px rgba(234,179,8,1)) drop-shadow(0 0 25px rgba(234,179,8,0.85)) drop-shadow(0 0 50px rgba(234,179,8,0.55))",
        frontGlow: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 15px rgba(234,179,8,1)) drop-shadow(0 0 30px rgba(234,179,8,0.85))"
      },
      wireframeBorder: "border-amber-500/50 shadow-[inset_0_0_35px_rgba(234,179,8,0.45)]"
    },
    kasaka_fang: {
      color: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 1)",
      glowColorLight: "rgba(34, 211, 238, 0.4)",
      accentColor: "cyan",
      shadows: {
        backGlow: "drop-shadow(0 0 20px rgba(34,211,238,1)) drop-shadow(0 0 45px rgba(34,211,238,0.95)) drop-shadow(0 0 75px rgba(34,211,238,0.75)) drop-shadow(0 0 120px rgba(34,211,238,0.5))",
        midGlow: "drop-shadow(0 0 12px rgba(34,211,238,1)) drop-shadow(0 0 25px rgba(34,211,238,0.85)) drop-shadow(0 0 50px rgba(34,211,238,0.55))",
        frontGlow: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 15px rgba(34,211,238,1)) drop-shadow(0 0 30px rgba(34,211,238,0.85))"
      },
      wireframeBorder: "border-cyan-500/50 shadow-[inset_0_0_35px_rgba(34,211,238,0.45)]"
    },
    igris_sword: {
      color: "#f43f5e",
      glowColor: "rgba(244, 63, 94, 1)",
      glowColorLight: "rgba(244, 63, 94, 0.4)",
      accentColor: "rose",
      shadows: {
        backGlow: "drop-shadow(0 0 20px rgba(244,63,94,1)) drop-shadow(0 0 45px rgba(244,63,94,0.95)) drop-shadow(0 0 75px rgba(244,63,94,0.75)) drop-shadow(0 0 120px rgba(244,63,94,0.5))",
        midGlow: "drop-shadow(0 0 12px rgba(244,63,94,1)) drop-shadow(0 0 25px rgba(244,63,94,0.85)) drop-shadow(0 0 50px rgba(244,63,94,0.55))",
        frontGlow: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 15px rgba(244,63,94,1)) drop-shadow(0 0 30px rgba(244,63,94,0.85))"
      },
      wireframeBorder: "border-rose-500/50 shadow-[inset_0_0_35px_rgba(244,63,94,0.45)]"
    },
    demon_dagger: {
      color: "#818cf8",
      glowColor: "rgba(129, 140, 248, 1)",
      glowColorLight: "rgba(129, 140, 248, 0.4)",
      accentColor: "indigo",
      shadows: {
        backGlow: "drop-shadow(0 0 20px rgba(129,140,248,1)) drop-shadow(0 0 45px rgba(129,140,248,0.95)) drop-shadow(0 0 75px rgba(129,140,248,0.75)) drop-shadow(0 0 120px rgba(129,140,248,0.5))",
        midGlow: "drop-shadow(0 0 12px rgba(129,140,248,1)) drop-shadow(0 0 25px rgba(129,140,248,0.85)) drop-shadow(0 0 50px rgba(129,140,248,0.55))",
        frontGlow: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 15px rgba(129,140,248,1)) drop-shadow(0 0 30px rgba(129,140,248,0.85))"
      },
      wireframeBorder: "border-indigo-500/50 shadow-[inset_0_0_35px_rgba(129,140,248,0.45)]"
    },
    kamish_fang: {
      color: "#db2777",
      glowColor: "rgba(219, 39, 119, 1)",
      glowColorLight: "rgba(219, 39, 119, 0.4)",
      accentColor: "purple",
      shadows: {
        backGlow: "drop-shadow(0 0 20px rgba(219, 39, 119, 1)) drop-shadow(0 0 45px rgba(219, 39, 119, 0.95)) drop-shadow(0 0 75px rgba(219, 39, 119, 0.75)) drop-shadow(0 0 120px rgba(219, 39, 119, 0.5))",
        midGlow: "drop-shadow(0 0 12px rgba(219, 39, 119, 1)) drop-shadow(0 0 25px rgba(219, 39, 119, 0.85)) drop-shadow(0 0 50px rgba(219, 39, 119, 0.55))",
        frontGlow: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 15px rgba(219, 39, 119, 1)) drop-shadow(0 0 30px rgba(219, 39, 119, 0.85))"
      },
      wireframeBorder: "border-fuchsia-500/50 shadow-[inset_0_0_35px_rgba(219,39,119,0.45)]"
    },
    sovereigns_wrath: {
      color: "#ec4899",
      glowColor: "rgba(236, 72, 153, 1)",
      glowColorLight: "rgba(236, 72, 153, 0.4)",
      accentColor: "pink",
      shadows: {
        backGlow: "drop-shadow(0 0 25px rgba(236, 72, 153, 1)) drop-shadow(0 0 55px rgba(236, 72, 153, 0.95)) drop-shadow(0 0 90px rgba(236, 72, 153, 0.82)) drop-shadow(0 0 145px rgba(236, 72, 153, 0.6))",
        midGlow: "drop-shadow(0 0 15px rgba(236, 72, 153, 1)) drop-shadow(0 0 30px rgba(236, 72, 153, 0.85)) drop-shadow(0 0 60px rgba(236, 72, 153, 0.55))",
        frontGlow: "drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 20px rgba(236, 72, 153, 1)) drop-shadow(0 0 35px rgba(236, 72, 153, 0.85))"
      },
      wireframeBorder: "border-pink-500/50 shadow-[inset_0_0_35px_rgba(236,72,153,0.45)]"
    },
    baruka_dagger: {
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 1)",
      glowColorLight: "rgba(56, 189, 248, 0.4)",
      accentColor: "sky",
      shadows: {
        backGlow: "drop-shadow(0 0 30px rgba(56,189,248,1)) drop-shadow(0 0 60px rgba(56,189,248,0.95)) drop-shadow(0 0 100px rgba(56,189,248,0.75)) drop-shadow(0 0 150px rgba(56,189,248,0.5))",
        midGlow: "drop-shadow(0 0 18px rgba(56,189,248,1)) drop-shadow(0 0 35px rgba(56,189,248,0.85)) drop-shadow(0 0 65px rgba(56,189,248,0.55))",
        frontGlow: "drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 22px rgba(56,189,248,1)) drop-shadow(0 0 45px rgba(56,189,248,0.85))"
      },
      wireframeBorder: "border-sky-500/50 shadow-[inset_0_0_35px_rgba(56,189,248,0.45)]"
    },
    vulcan_rage: {
      color: "#f97316",
      glowColor: "rgba(249, 115, 22, 1)",
      glowColorLight: "rgba(249, 115, 22, 0.4)",
      accentColor: "orange",
      shadows: {
        backGlow: "drop-shadow(0 0 30px rgba(249,115,22,1)) drop-shadow(0 0 60px rgba(249,115,22,0.95)) drop-shadow(0 0 100px rgba(249,115,22,0.75)) drop-shadow(0 0 150px rgba(249,115,22,0.5))",
        midGlow: "drop-shadow(0 0 18px rgba(249,115,22,1)) drop-shadow(0 0 35px rgba(249,115,22,0.85)) drop-shadow(0 0 65px rgba(249,115,22,0.55))",
        frontGlow: "drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 22px rgba(249,115,22,1)) drop-shadow(0 0 45px rgba(249,115,22,0.85))"
      },
      wireframeBorder: "border-orange-500/50 shadow-[inset_0_0_35px_rgba(249,115,22,0.45)]"
    },
    shadow_reaper: {
      color: "#a855f7",
      glowColor: "rgba(168, 85, 247, 1)",
      glowColorLight: "rgba(168, 85, 247, 0.4)",
      accentColor: "purple",
      shadows: {
        backGlow: "drop-shadow(0 0 30px rgba(168,85,247,1)) drop-shadow(0 0 60px rgba(168,85,247,0.95)) drop-shadow(0 0 100px rgba(168,85,247,0.75)) drop-shadow(0 0 150px rgba(168,85,247,0.5))",
        midGlow: "drop-shadow(0 0 18px rgba(168,85,247,1)) drop-shadow(0 0 35px rgba(168,85,247,0.85)) drop-shadow(0 0 65px rgba(168,85,247,0.55))",
        frontGlow: "drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 22px rgba(168,85,247,1)) drop-shadow(0 0 45px rgba(168,85,247,0.85))"
      },
      wireframeBorder: "border-purple-500/50 shadow-[inset_0_0_35px_rgba(168,85,247,0.45)]"
    },
    monarch_authority: {
      color: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 1)",
      glowColorLight: "rgba(251, 191, 36, 0.4)",
      accentColor: "amber",
      shadows: {
        backGlow: "drop-shadow(0 0 35px rgba(251,191,36,1)) drop-shadow(0 0 70px rgba(251,191,36,0.95)) drop-shadow(0 0 120px rgba(251,191,36,0.75))",
        midGlow: "drop-shadow(0 0 20px rgba(251,191,36,1)) drop-shadow(0 0 40px rgba(251,191,36,0.85))",
        frontGlow: "drop-shadow(0 0 12px #ffffff) drop-shadow(0 0 26px rgba(251,191,36,1))"
      },
      wireframeBorder: "border-yellow-500/50 shadow-[inset_0_0_35px_rgba(251,191,36,0.45)]"
    },
    abyssal_void: {
      color: "#ec4899",
      glowColor: "rgba(236, 72, 153, 1)",
      glowColorLight: "rgba(236, 72, 153, 0.4)",
      accentColor: "pink",
      shadows: {
        backGlow: "drop-shadow(0 0 35px rgba(236,72,153,1)) drop-shadow(0 0 70px rgba(236,72,153,0.95)) drop-shadow(0 0 120px rgba(236,72,153,0.75))",
        midGlow: "drop-shadow(0 0 20px rgba(236,72,153,1)) drop-shadow(0 0 40px rgba(236,72,153,0.85))",
        frontGlow: "drop-shadow(0 0 12px #ffffff) drop-shadow(0 0 30px rgba(236,72,153,1))"
      },
      wireframeBorder: "border-pink-500/50 shadow-[inset_0_0_35px_rgba(236,72,153,0.45)]"
    }
  };

  const baseId = itemId.split("_")[0];
  const theme = WEAPON_THEMES[baseId] || WEAPON_THEMES.rusty_dagger;

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
          className="relative w-full h-full max-w-[280px] max-h-[280px] flex items-center justify-center"
          style={{ 
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg) rotateZ(${rotationRef.current.z}deg)`
          }}
        >
          {/* Layer 1: Radiant Back Aura Layer (Deepest Z) in high saturation inherit glow */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center"
            style={{ 
              transform: "translateZ(-45px)", 
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible"
            }}
          >
            <div 
              className="w-[120%] h-[120%] opacity-[0.98] flex items-center justify-center transition-all duration-300"
              style={{ filter: `blur(14px) ${theme.shadows.backGlow}` }}
            >
              {renderNeonWeaponPreview(itemId, false, "back")}
            </div>
          </div>

          {/* Layer 2: Sparks & Particle Cloud Layer */}
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse"
            style={{ 
              transform: "translateZ(-20px)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible"
            }}
          >
            <div 
              className="w-[110%] h-[110%] flex items-center justify-center"
              style={{ filter: `saturate(3) brightness(2.2) drop-shadow(0 0 12px ${theme.color})` }}
            >
              {renderNeonWeaponPreview(itemId, false, "sparks")}
            </div>
          </div>

          {/* ---- 3D VOLUMETRIC EXTRUSION (Real 3D Detailed Simulation with True Colors!) ---- */}
          {[-24, -18, -12, -6, 6, 12, 18, 24].map((zOffset, idx) => (
            <div 
              key={idx}
              className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 animate-fade-in"
              style={{ 
                transform: `translateZ(${zOffset}px)`, 
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible"
              }}
            >
              <div className={`w-full h-full flex items-center justify-center ${Math.abs(zOffset) > 15 ? "brightness-[0.4] opacity-50" : "brightness-[0.75]"}`}>
                {renderNeonWeaponPreview(itemId, false, "base")}
              </div>
            </div>
          ))}

          {/* Layer 3: Main Armament Geometry Core Layer in high-definition correct color */}
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ 
              transform: "translateZ(0px)", 
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible",
              filter: theme.shadows.midGlow
            }}
          >
            <div className="w-full h-full flex items-center justify-center relative">
               {renderNeonWeaponPreview(itemId, false, "base")}
               
               {/* Internal Wireframe/Facet Lines overlay matching weapon inherit color */}
               <div className={`absolute inset-0 border rounded mix-blend-screen ${theme.wireframeBorder}`} />
            </div>
          </div>

          {/* Core Blueprint Tech Crosshairs adapting to weapon accent */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 mix-blend-screen" style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}>
             <div className="w-[80%] h-[1px] shadow-[0_0_8px_currentColor]" style={{ backgroundColor: `${theme.color}aa`, color: theme.color }} />
             <div className="absolute h-[80%] w-[1px] shadow-[0_0_8px_currentColor]" style={{ backgroundColor: `${theme.color}aa`, color: theme.color }} />
             <div className="absolute w-[60%] h-[60%] border rounded-full" style={{ borderColor: `${theme.color}33` }} />
          </div>

          {/* Layer 4: Floating Star Edge & Laser High-Voltage Front Layer */}
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ 
              transform: "translateZ(30px)", 
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible",
              filter: theme.shadows.frontGlow
            }}
          >
            <div className="w-[98%] h-[98%] flex items-center justify-center filter saturate-[2] brightness-[1.6]">
              {renderNeonWeaponPreview(itemId, false, "front")}
            </div>
          </div>

          {/* Holographic Staging Grid (Floor plate to ground the 3D look in match colors) */}
          <div 
            className="absolute bottom-1 w-[80%] h-[12%] rounded-full border pointer-events-none"
            style={{ 
              transform: "rotateX(90deg) translateZ(-65px)",
              transformStyle: "preserve-3d",
              borderColor: `${theme.color}40`,
              backgroundImage: `linear-gradient(to top, ${theme.color}25, transparent)`,
              boxShadow: `0 0 25px ${theme.color}33, inset 0 0 15px ${theme.color}15`
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
