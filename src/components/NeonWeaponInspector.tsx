import React, { useState, useEffect, useRef } from "react";
import demonDaggerImg from "../assets/images/demon_dagger_1781193232605.jpg";
import huntersBowImg from "../assets/images/hunters_bow_1781193274363.jpg";
import igrisSwordImg from "../assets/images/igris_sword_1781193196591.jpg";
import kasakaFangImg from "../assets/images/kasaka_fang_1781193216513.jpg";
import knightsShieldImg from "../assets/images/knights_shield_1781193292481.jpg";
import mageStaffImg from "../assets/images/mage_staff_1781193308306.jpg";
import shadowScytheImg from "../assets/images/shadow_scythe_1781193247889.jpg";
import sovereignsWrathImg from "../assets/images/sovereigns_wrath_1781193262267.jpg";

// High quality vector contour neon renderings for weapon previews (1000x Detailed)
export const renderNeonWeaponPreview = (itemId: string, animate = false, layer: "all" | "back" | "base" | "front" | "sparks" = "all") => {
  const baseId = itemId.split("_")[0];
  let imageUrl = "";
  let glowColor = "rgba(255,255,255,0.2)";

  switch (baseId) {
    case "rusty_dagger":
    case "kasaka_fang":
    case "baruka_dagger":
      imageUrl = kasakaFangImg;
      glowColor = "rgba(34,197,94,0.6)"; // green
      break;
    case "demon_dagger":
    case "shadow_reaper":
      imageUrl = demonDaggerImg;
      glowColor = "rgba(239,68,68,0.6)"; // red
      break;
    case "igris_sword":
    case "vulcan_rage":
      imageUrl = igrisSwordImg;
      glowColor = "rgba(239,68,68,0.8)"; // bright red
      break;
    case "sovereigns_wrath":
    case "monarch_authority":
    case "abyssal_void":
      imageUrl = sovereignsWrathImg;
      glowColor = "rgba(236,72,153,0.7)"; // pink/purple
      break;
    case "shadow_scythe":
      imageUrl = shadowScytheImg;
      glowColor = "rgba(168,85,247,0.7)"; // purple
      break;
    case "hunters_bow":
      imageUrl = huntersBowImg;
      glowColor = "rgba(56,189,248,0.6)"; // cyan
      break;
    case "knights_shield":
      imageUrl = knightsShieldImg;
      glowColor = "rgba(59,130,246,0.6)"; // blue
      break;
    case "mage_staff":
      imageUrl = mageStaffImg;
      glowColor = "rgba(96,165,250,0.6)"; // light blue
      break;
    default:
      imageUrl = kasakaFangImg;
      glowColor = "rgba(255,255,255,0.4)";
      break;
  }

  // High-end screen blending drops out the dark generated background, treating the bright weapon pixels as light.
  return (
    <div className={`w-full h-full relative flex items-center justify-center select-none ${animate ? "animate-pulse" : ""}`}>
      <div 
        className="absolute inset-0 rounded-full blur-[15px] scale-95 z-0 transition-all mix-blend-screen"
        style={{ backgroundColor: glowColor, opacity: 0.6 }}
      />
      <img 
        src={imageUrl} 
        unselectable="on"
        className="w-[95%] h-[95%] object-contain drop-shadow-2xl z-10 transition-all pointer-events-none rounded-xl" 
        alt={baseId} 
        style={{ 
          filter: `drop-shadow(0 0 10px ${glowColor}) brightness(1.2) contrast(1.1)`,
          mixBlendMode: "screen",
          WebkitBackfaceVisibility: "visible" 
        }}
      />
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
