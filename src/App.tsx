/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import CosmicBackground from "./components/CosmicBackground";
import { OnboardingData } from "./types";
import { auth, db, saveToLeaderboard } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from "firebase/firestore";
import { safeLocalStorage as localStorage } from "./utils/storage";

import { ErrorBoundary } from "./components/ErrorBoundary";

const Onboarding = lazy(() => import("./components/Onboarding"));
const PlanPreview = lazy(() => import("./components/PlanPreview"));
const RpgGame = lazy(() => import("./components/RpgGame"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const PartyApp = lazy(() => import("./party/PartyApp"));
import AuthScreen from "./components/AuthScreen";

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
  const syncTargetRef = useRef<string | null>(null);

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
    const titles: Record<string, string> = {
      authentication: "Authentication | Monarch",
      onboarding: "Hunter Onboarding | Monarch",
      plan_preview: "Strategic Plan | Monarch",
      rpg_dashboard: `${activePlayerName} | Sovereign Dashboard`
    };
    
    if (isAdminMode) {
      document.title = "Sovereign Override: Master Deck";
    } else if (isPartyMode) {
      document.title = "Dimensional Hub: Multiplayer";
    } else {
      document.title = titles[phase] || "Monarch System";
    }
  }, [phase, activePlayerName, isAdminMode, isPartyMode]);

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
    // Global fallback for initial mount: if auth never fires, don't keep loading forever
    const globalTimeout = setTimeout(() => {
      if (isSyncing) {
        console.warn("Global auth synchronization timeout. Releasing UI.");
        setIsSyncing(false);
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(globalTimeout);
      
      const clearSync = () => {
        setIsSyncing(false);
      };

      if (user) {
        // Logged in: show sync status indicator and target client UID
        setIsSyncing(true);
        syncTargetRef.current = user.uid;
        setSyncStatus(`Shadow System: Scanning credentials for ${user.email}...`);

        try {
          const userDocRef = doc(db, "users", user.uid);
          setSyncStatus("Retrieving Hunter Ledger from Sovereign mainframe...");
          
          // Secure standard getDoc
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            setSyncStatus("Rematerializing progress metadata...");
            const data = docSnap.data();
            
            // Force reset balance v3 on the cloud database
            if (!data.v3_reset) {
              setSyncStatus("Calibrating Dimensional Balance [V3 Reset]...");
              await setDoc(userDocRef, {
                v3_reset: true,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith("monarch_") && key !== "monarch_v3_balanced_reset_enforced") {
                  localStorage.removeItem(key);
                }
              });
              
              setProfile(null);
              setOnboardingStep(1);
              setPhase("onboarding");
              clearSync();
              return;
            }
            
            // Restore name and profile shape
            const pName = data.playerName || "";
            const oProfile = data.onboardProfile || null;
            
            if (pName && oProfile) {
              // Re-populate localStorage to keep client offline cache refreshed
              localStorage.setItem("monarch_active_player", pName);
              localStorage.setItem("monarch_onboard_profile", JSON.stringify(oProfile));
              
              if (data.gameState) {
                localStorage.setItem(`monarch_save_v4_reset_${pName}`, JSON.stringify(data.gameState));
              }
              
              // Restore secondary statistics
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
            } else if (oProfile) {
              // Has onboarding data but has not registered a character name yet
              setProfile(oProfile);
              setPhase("plan_preview");
            } else {
              // No character card at all
              setOnboardingStep(1);
              setPhase("onboarding");
            }
          } else {
            // Document does not exist in Firebase
            // Check if we already have local progress from previous guest onboarding to seed
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
                setActivePlayerName(savedName);
                setProfile(parsedProfile);
                setPhase("rpg_dashboard");
              } catch (e) {
                console.error("Failed to seed initial Firestore data:", e);
                setPhase("onboarding");
              }
            } else if (savedProfileStr) {
              try {
                const parsedProfile = JSON.parse(savedProfileStr);
                setProfile(parsedProfile);
                setPhase("plan_preview");
              } catch (e) {
                setOnboardingStep(1);
                setPhase("onboarding");
              }
            } else {
              // Raw authenticated user without onboarding sequence completed
              setOnboardingStep(1);
              setPhase("onboarding");
            }
          }
        } catch (err) {
          console.error("Firestore sync error:", err);
          // Fallback seamlessly to local caching
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
            setOnboardingStep(1);
            setPhase("onboarding");
          }
        } finally {
          clearSync();
        }
      } else {
        // Non-authenticated Guest state: send to login/register console
        syncTargetRef.current = null;
        setProfile(null);
        setPhase("authentication");
        clearSync();
      }
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
          v3_reset: true,
          updatedAt: serverTimestamp()
        });
        
        // Ensure they appear in the leaderboard (hunter directory) immediately
        await saveToLeaderboard(name, 1, 0, "Hunter", "E-Rank");
      } catch (e) {
        console.error("Failed to write user profile to database:", e);
      }
    }
    setPhase("rpg_dashboard");
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed:", e);
    }
    
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
    setPhase("authentication");
  };

  const [syncStatus, setSyncStatus] = useState<string>("Initializing Spatial Gateway...");

  const suspenseFallback = (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center min-h-[100dvh] w-full fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] font-mono text-cyan-400 p-8 text-center overflow-y-auto">
      <div className="relative animate-pulse flex flex-col items-center">
        <div className="w-20 h-20 border-4 border-dashed border-cyan-500 rounded-full animate-spin mb-8" />
        <div className="absolute top-0 w-20 h-20 flex items-center justify-center">
          <div className="w-8 h-8 bg-cyan-500 rounded-full animate-ping opacity-75" />
        </div>
      </div>
      
      <span className="text-sm sm:text-base uppercase tracking-[0.4em] font-black animate-pulse mb-4 text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
        {syncStatus}
      </span>
      <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mb-10 leading-relaxed uppercase tracking-widest">
        Synchronizing with the Sovereign Monarch core processor. Establishing dimensional link...
      </p>
      
      {/* Emergency escape if sync hangs for some reason */}
      <button 
        type="button"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 hover:text-red-500 transition-all border border-slate-800 px-8 py-3 rounded-full bg-slate-900/50 hover:bg-slate-900 active:scale-95 shadow-xl"
      >
        Force System Purge & Reload
      </button>
      <span className="sr-only">Loading Progress</span>
    </div>
  );

  if (isSyncing) {
    return (
      <div id="monarch_root" className="min-h-[100dvh] bg-slate-950 text-white font-sans relative overflow-y-auto overflow-x-hidden">
        <CosmicBackground />
        <div className="relative z-10">
          {suspenseFallback}
        </div>
      </div>
    );
  }

  if (isAdminMode) {
    return (
      <div id="monarch_root" className="min-h-[100dvh] bg-slate-950 text-white font-sans selection:bg-purple-500/30 selection:text-purple-300 relative overflow-y-auto overflow-x-hidden">
        <CosmicBackground />
        <div className="relative z-10 w-full min-h-full">
          <ErrorBoundary>
            <Suspense fallback={suspenseFallback}>
              <AdminPanel 
                onBackToApp={() => {
                  window.history.pushState({}, "", "/");
                  window.location.hash = "";
                  setIsAdminMode(false);
                }} 
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  if (isPartyMode) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  return (
    <div id="monarch_root" className="min-h-[100dvh] bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-y-auto overflow-x-hidden flex flex-col">
      <CosmicBackground />

      <main role="main" className="relative z-10 w-full flex-1 flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={suspenseFallback}>
            {/* If we are loading or syncing, the top-level isSyncing check handles it. 
                Below is the authenticated view logic. */}
            {(phase === "onboarding" || (!profile && (phase === "rpg_dashboard" || phase === "plan_preview"))) ? (
              <Onboarding 
                initialStep={onboardingStep} 
                onStartGate={() => setPhase("authentication")} 
                onComplete={handleOnboardingComplete} 
              />
            ) : null}

            {phase === "authentication" && !profile && (
              <AuthScreen onSuccess={() => {
                  // Listener in App.tsx handles transition
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
        </ErrorBoundary>
      </main>
    </div>
  );
}
