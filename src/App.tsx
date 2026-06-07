/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import PlanPreview from "./components/PlanPreview";
import RpgGame from "./components/RpgGame";
import CosmicBackground from "./components/CosmicBackground";
import AdminPanel from "./components/AdminPanel";
import PartyApp from "./party/PartyApp";
import AuthScreen from "./components/AuthScreen";
import { OnboardingData } from "./types";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

type AppPhase = "authentication" | "onboarding" | "plan_preview" | "rpg_dashboard";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return (
      window.location.pathname === "/admin" ||
      window.location.hash === "#admin"
    );
  });

  const [isPartyMode, setIsPartyMode] = useState<boolean>(() => {
    return (
      window.location.pathname === "/party" ||
      window.location.hash === "#party"
    );
  });

  const [phase, setPhase] = useState<AppPhase>(() => {
    // Restore stage from storage if user already registered previously
    const savedName = localStorage.getItem("monarch_active_player");
    const savedProfile = localStorage.getItem("monarch_onboard_profile");
    if (savedName && savedProfile) return "rpg_dashboard";
    return "onboarding";
  });

  const [onboardingStep, setOnboardingStep] = useState<number>(0);

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

  useEffect(() => {
    const checkRoutes = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      setIsAdminMode(path === "/admin" || hash === "#admin");
      setIsPartyMode(path === "/party" || hash === "#party");
    };

    window.addEventListener("popstate", checkRoutes);
    window.addEventListener("hashchange", checkRoutes);
    const interval = setInterval(checkRoutes, 1000);

    return () => {
      window.removeEventListener("popstate", checkRoutes);
      window.removeEventListener("hashchange", checkRoutes);
      clearInterval(interval);
    };
  }, []);

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

  const handleLogout = async () => {
    await import("firebase/auth").then(m => m.signOut(auth));
    localStorage.removeItem("monarch_active_player");
    localStorage.removeItem("monarch_onboard_profile");
    setPhase("landing");
    setProfile(null);
  };

  if (isAdminMode) {
    return (
      <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 selection:text-purple-300 relative overflow-x-hidden">
        <CosmicBackground />
        <div className="relative z-10 w-full h-full">
          <AdminPanel 
            onBackToApp={() => {
              window.history.pushState({}, "", "/");
              window.location.hash = "";
              setIsAdminMode(false);
            }} 
          />
        </div>
      </div>
    );
  }

  if (isPartyMode) {
    return (
      <PartyApp 
        playerName={activePlayerName}
        onBack={() => {
          window.history.pushState({}, "", "/");
          window.location.hash = "";
          setIsPartyMode(false);
        }}
        playSelectSound={() => {}}
      />
    );
  }

  return (
    <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      
      {/* Dynamic Cosmic Background & Particle Fallback Layer */}
      <CosmicBackground />

      <div className="relative z-10 w-full h-full">
        {phase === "onboarding" && (
          <Onboarding 
            initialStep={onboardingStep} 
            onStartGate={() => setPhase("authentication")} 
            onComplete={handleOnboardingComplete} 
          />
        )}

        {phase === "authentication" && (
          <AuthScreen onSuccess={() => {
              setPhase("onboarding");
              setOnboardingStep(1);
          }} />
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
