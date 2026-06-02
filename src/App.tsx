/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import PlanPreview from "./components/PlanPreview";
import RpgGame from "./components/RpgGame";
import CosmicBackground from "./components/CosmicBackground";
import { OnboardingData } from "./types";

type AppPhase = "onboarding" | "plan_preview" | "rpg_dashboard";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(() => {
    // Restore stage from storage if user already registered previously
    const savedName = localStorage.getItem("monarch_active_player");
    const savedProfile = localStorage.getItem("monarch_onboard_profile");
    if (savedName && savedProfile) return "rpg_dashboard";
    if (savedProfile) return "plan_preview";
    return "onboarding";
  });

  const [activePlayerName, setActivePlayerName] = useState<string>(() => {
    return localStorage.getItem("monarch_active_player") || "Sung Jin-Woo";
  });

  const [profile, setProfile] = useState<OnboardingData | null>(() => {
    const savedProfile = localStorage.getItem("monarch_onboard_profile");
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleOnboardingComplete = (data: OnboardingData) => {
    setProfile(data);
    localStorage.setItem("monarch_onboard_profile", JSON.stringify(data));
    setPhase("plan_preview");
  };

  const handleRegistrationComplete = (name: string) => {
    setActivePlayerName(name);
    localStorage.setItem("monarch_active_player", name);
    setPhase("rpg_dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("monarch_active_player");
    localStorage.removeItem("monarch_onboard_profile");
    setPhase("onboarding");
    setProfile(null);
  };

  return (
    <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      
      {/* Dynamic Cosmic Background & Particle Fallback Layer */}
      <CosmicBackground />

      <div className="relative z-10 w-full h-full">
        {phase === "onboarding" && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {phase === "plan_preview" && profile && (
          <PlanPreview profile={profile} onComplete={handleRegistrationComplete} />
        )}

        {phase === "rpg_dashboard" && profile && (
          <RpgGame 
            playerName={activePlayerName}
            onboardProfile={profile}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}
