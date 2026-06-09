/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import CosmicBackground from "./components/CosmicBackground";
import { OnboardingData } from "./types";
import { auth, db } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Onboarding = lazy(() => import("./components/Onboarding"));
const PlanPreview = lazy(() => import("./components/PlanPreview"));
const RpgGame = lazy(() => import("./components/RpgGame"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const PartyApp = lazy(() => import("./party/PartyApp"));
const AuthScreen = lazy(() => import("./components/AuthScreen"));

type AppPhase = "authentication" | "onboarding" | "plan_preview" | "rpg_dashboard";

export default function App() {
  // Ensure synchronous legacy data wipe before any state initializers render!
  const resetKey = "monarch_v3_balanced_reset_enforced";
  if (!localStorage.getItem(resetKey)) {
    // Clear all legacy progress
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("monarch_")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(resetKey, "true");
  }

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
    const savedName = localStorage.getItem("monarch_active_player");
    const savedProfile = localStorage.getItem("monarch_onboard_profile");
    if (savedName && savedProfile) return "rpg_dashboard";
    return "onboarding";
  });

  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

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

  // Monitor Authentication and Sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsSyncing(true);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Force reset balance v3 on the cloud database
            if (!data.v3_reset) {
              await setDoc(userDocRef, {
                v3_reset: true,
                updatedAt: new Date().toISOString()
              });
              
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith("monarch_") && key !== "monarch_v3_balanced_reset_enforced") {
                  localStorage.removeItem(key);
                }
              });
              
              setProfile(null);
              setOnboardingStep(0);
              setPhase("onboarding");
              setIsSyncing(false);
              return;
            }
            
            // Restore name and profile
            const pName = data.playerName || "Hunter";
            const oProfile = data.onboardProfile || null;
            
            // Re-populate localStorage
            localStorage.setItem("monarch_active_player", pName);
            if (oProfile) {
              localStorage.setItem("monarch_onboard_profile", JSON.stringify(oProfile));
            }
            if (data.gameState) {
              localStorage.setItem(`monarch_save_v3_balanced_${pName}`, JSON.stringify(data.gameState));
            }
            
            // Restore secondary stats
            if (data.academicQuests) localStorage.setItem(`monarch_acad_quests_${pName}`, JSON.stringify(data.academicQuests));
            if (data.bodybuildingExercises) localStorage.setItem(`monarch_body_lifts_${pName}`, JSON.stringify(data.bodybuildingExercises));
            if (data.intakeCalories !== undefined) localStorage.setItem(`monarch_calories_${pName}`, String(data.intakeCalories));
            if (data.intakeProtein !== undefined) localStorage.setItem(`monarch_protein_${pName}`, String(data.intakeProtein));
            if (data.careerMilestones) localStorage.setItem(`monarch_career_stones_${pName}`, JSON.stringify(data.careerMilestones));
            if (data.jobApplications) localStorage.setItem(`monarch_job_apps_${pName}`, JSON.stringify(data.jobApplications));
            if (data.focusLogs) localStorage.setItem(`monarch_focus_logs_${pName}`, JSON.stringify(data.focusLogs));
            if (data.forceSystemEnforcement !== undefined) localStorage.setItem(`monarch_system_enforce_${pName}`, String(data.forceSystemEnforcement));
            if (data.playerMp !== undefined) localStorage.setItem(`monarch_player_mp_${pName}`, String(data.playerMp));
            if (data.isInPenaltyZone !== undefined) localStorage.setItem(`monarch_penalty_zone_${pName}`, String(data.isInPenaltyZone));
            
            setActivePlayerName(pName);
            setProfile(oProfile);
            setPhase("rpg_dashboard");
          } else {
            // New account: check if we have local onboarding to seed Firestore
            const savedName = localStorage.getItem("monarch_active_player");
            const savedProfileStr = localStorage.getItem("monarch_onboard_profile");
            
            if (savedName && savedProfileStr) {
              try {
                const parsedProfile = JSON.parse(savedProfileStr);
                const initialSave: any = {
                  playerName: savedName,
                  onboardProfile: parsedProfile,
                  v3_reset: true,
                  updatedAt: new Date().toISOString()
                };
                
                const existingGameStateStr = localStorage.getItem(`monarch_save_v4_reset_${savedName}`);
                if (existingGameStateStr) {
                  initialSave.gameState = JSON.parse(existingGameStateStr);
                }
                
                await setDoc(userDocRef, initialSave);
              } catch (e) {
                console.error("Failed to seed initial Firestore data:", e);
              }
              setPhase("rpg_dashboard");
            } else if (savedProfileStr) {
              try {
                setProfile(JSON.parse(savedProfileStr));
                setPhase("plan_preview");
              } catch (e) {
                setPhase("onboarding");
              }
            } else {
              setPhase((currentPhase) => {
                if (currentPhase === "authentication") {
                  setOnboardingStep(1);
                  return "onboarding";
                }
                if (currentPhase === "plan_preview") return currentPhase;
                return "onboarding";
              });
            }
          }
        } catch (err) {
          console.error("Firestore sync error:", err);
          // Fallback to local storage
          const savedName = localStorage.getItem("monarch_active_player");
          const savedProfileStr = localStorage.getItem("monarch_onboard_profile");
          if (savedName && savedProfileStr) {
            try { setProfile(JSON.parse(savedProfileStr)); } catch(e){}
            setPhase("rpg_dashboard");
          } else if (savedProfileStr) {
            try {
              setProfile(JSON.parse(savedProfileStr));
              setPhase("plan_preview");
            } catch (e) {
              setPhase("onboarding");
            }
          } else {
            setPhase((currentPhase) => {
              if (currentPhase === "authentication") {
                setOnboardingStep(1);
                return "onboarding";
              }
              if (currentPhase === "plan_preview") return currentPhase;
              return "onboarding";
            });
          }
        }
      } else {
        // Logged out: clean local variables if they was in active game
        setPhase((currentPhase) => {
          if (currentPhase === "rpg_dashboard") {
            setProfile(null);
            return "onboarding";
          }
          return currentPhase;
        });
      }
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setProfile(data);
    localStorage.setItem("monarch_onboard_profile", JSON.stringify(data));
    setPhase("plan_preview");
  };

  const handleRegistrationComplete = async (name: string) => {
    setActivePlayerName(name);
    localStorage.setItem("monarch_active_player", name);
    
    // Write profile data to Firestore
    const user = auth.currentUser;
    if (user && profile) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          playerName: name,
          onboardProfile: profile,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to write user profile to database:", e);
      }
    }
    setPhase("rpg_dashboard");
  };

  const handleLogout = async () => {
    await import("firebase/auth").then(m => m.signOut(auth));
    
    // Thoroughly wipe all monarch_ session data from local storage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("monarch_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    setOnboardingStep(0);
    setProfile(null);
    setPhase("onboarding");
  };

  const suspenseFallback = (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center min-h-screen relative z-10 font-mono text-cyan-400">
      <div className="w-12 h-12 border-2 border-dashed border-cyan-500 rounded-full animate-spin mb-4" />
      <span className="text-xs uppercase tracking-widest animate-pulse">Syncing with System Database...</span>
      <span className="sr-only">Loading</span>
    </div>
  );

  if (isSyncing) {
    return (
      <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans relative overflow-x-hidden">
        <CosmicBackground />
        {suspenseFallback}
      </div>
    );
  }

  if (isAdminMode) {
    return (
      <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 selection:text-purple-300 relative overflow-x-hidden">
        <CosmicBackground />
        <div className="relative z-10 w-full h-full">
          <Suspense fallback={suspenseFallback}>
            <AdminPanel 
              onBackToApp={() => {
                window.history.pushState({}, "", "/");
                window.location.hash = "";
                setIsAdminMode(false);
              }} 
            />
          </Suspense>
        </div>
      </div>
    );
  }

  if (isPartyMode) {
    return (
      <Suspense fallback={suspenseFallback}>
        <PartyApp 
          playerName={activePlayerName}
          onBack={() => {
            window.history.pushState({}, "", "/");
            window.location.hash = "";
            setIsPartyMode(false);
          }}
          playSelectSound={() => {}}
        />
      </Suspense>
    );
  }

  return (
    <div id="monarch_root" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      <CosmicBackground />

      <main role="main" className="relative z-10 w-full h-full">
        <Suspense fallback={suspenseFallback}>
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
        </Suspense>
      </main>
    </div>
  );
}
