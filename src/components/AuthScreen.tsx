import React, { useState, useEffect } from "react";
import { auth } from "../utils/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Monitor returning redirect auth state transitions on mount
  useEffect(() => {
    let active = true;

    if (auth.currentUser) {
      onSuccess();
      return;
    }

    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (active && result?.user) {
          onSuccess();
        }
      } catch (err: any) {
        if (active) {
          console.error("Google Redirect Auth recovery error:", err);
          setError(getFriendlyErrorMessage(err));
        }
      }
    };
    processRedirect();
    return () => {
      active = false;
    };
  }, [onSuccess]);

  const getFriendlyErrorMessage = (err: any) => {
    const code = err?.code || "";
    const msg = err?.message || "";
    
    if (code.includes("invalid-credential") || msg.includes("invalid-credential")) {
      return "Invalid email, password, or security token. If you do not have a registered password account yet, click 'Need an account? Sign Up' below, or authenticate using your Google account.";
    }
    if (code.includes("email-already-in-use") || msg.includes("email-already-in-use")) {
      return "Registration Error: This email coordinate is already bound to an active Shadow Monarch hunter card.";
    }
    if (code.includes("weak-password") || msg.includes("weak-password")) {
      return "Security Firewall: The password passcode is too weak. Ensure it is at least 6 characters of mana strength!";
    }
    if (code.includes("invalid-email") || msg.includes("invalid-email")) {
      return "Format Error: Your email is not a valid coordinate structure.";
    }
    if (code.includes("user-not-found") || msg.includes("user-not-found")) {
      return "No hunter found on this frequency. Toggle 'Sign Up' first!";
    }
    if (code.includes("too-many-requests") || msg.includes("too-many-requests")) {
      return "Firewall Alert: System is temporarily locked due to intense signal noise. Please try again in a bit.";
    }
    return msg.replace("Firebase: ", "");
  };

  const handleEmailAuth = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth error details:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      // Small delay to ensure state doesn't jitter
      setTimeout(() => setAuthLoading(false), 500);
    }
  };

  const handleGoogleAuth = async () => {
    let isPending = true;
    try {
      setError(null);
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      
      // Select account automatically on trigger
      provider.setCustomParameters({
        prompt: "select_account"
      });

      // Safety timeout for the popup (25 seconds)
      const popupTimeout = setTimeout(() => {
        if (isPending) {
          setError("The authentication window is taking too long to respond. Please ensure popups are allowed and try again.");
          setAuthLoading(false);
          isPending = false;
        }
      }, 25000);

      try {
        // Try Popup first for general web browsers (faster, single session)
        await signInWithPopup(auth, provider);
        isPending = false;
        clearTimeout(popupTimeout);
        onSuccess();
        setAuthLoading(false);
      } catch (err: any) {
        if (!isPending) return;
        isPending = false;
        clearTimeout(popupTimeout);
        console.error("Google Auth error details:", err);
        
        // Fallback seamlessly to standard HTTP Auth redirect if popup is blocked or closed manually
        const isPopupIssue = 
          err.code === "auth/popup-blocked" || 
          err.code === "auth/popup-closed-by-user" || 
          err.code === "auth/cancelled-popup-request" ||
          err.message?.toLowerCase().includes("closed") ||
          err.message?.toLowerCase().includes("blocked");

        const isIframe = window.self !== window.top;

        if (isPopupIssue) {
          if (isIframe) {
            setError(
              "Popup Blocked: The authentication window was blocked. " +
              "Since you are inside the preview iframe, please click the 'Open in New Tab' icon at the top right of this preview panel, allow popups, and sign in there!"
            );
            setAuthLoading(false);
          } else {
            try {
              await signInWithRedirect(auth, provider);
            } catch (redirectErr: any) {
              setError(`Google Sign-In redirection failed: ${redirectErr.message}`);
              setAuthLoading(false);
            }
          }
        } else if (err.code === "auth/operation-not-allowed") {
          setError("Console Setting Error: Google Auth is disabled in the Firebase Console under Sign-in methods.");
          setAuthLoading(false);
        } else {
          setError(getFriendlyErrorMessage(err));
          setAuthLoading(false);
        }
      }
    } catch (outerErr: any) {
      console.error("Critical Google Auth Error:", outerErr);
      setError("System failure during authentication initialization.");
      setAuthLoading(false);
    }
  };

  const handlePurge = () => {
    if (confirm("This will PERMANENTLY wipe all local hunter progress. Are you sure you wish to purge the local spatial matrix?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main role="main" className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tighter text-center">
          {isSignUp ? "INITIALIZE" : "AUTHENTICATE"}
        </h1>
        {error && <p role="alert" aria-live="assertive" className="text-red-400 text-sm mb-4 text-center bg-red-950/40 p-3 rounded-lg border border-red-900/50">{error}</p>}
        <div>
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email Address" 
            aria-label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authLoading}
            className="w-full p-4 mb-4 bg-slate-950 rounded-xl border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-55"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password" 
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authLoading}
            className="w-full p-4 mb-6 bg-slate-950 rounded-xl border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-55"
          />
        </div>
        <button aria-label={isSignUp ? "Create Account" : "Sign In"}
          onClick={handleEmailAuth}
          disabled={authLoading}
          className="w-full p-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {authLoading ? (
            <div className="w-5 h-5 border-2 border-dashed border-white rounded-full animate-spin" />
          ) : null}
          {isSignUp ? "Create Account" : "Access Console"}
        </button>
        <button aria-label={isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={authLoading}
          className="w-full text-sm text-slate-400 hover:text-white transition-colors mb-6 text-center underline underline-offset-4 disabled:opacity-40"
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-500">OR</span>
          </div>
        </div>

        <button aria-label="Sign in with Google"
          onClick={handleGoogleAuth}
          disabled={authLoading}
          className="w-full p-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authLoading ? (
            <div className="w-5 h-5 border-2 border-dashed border-cyan-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          {authLoading ? "Synchronizing..." : "Sign in with Google"}
        </button>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button 
              onClick={handlePurge}
              className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-500 transition-colors"
            >
              Emergency Hunter Profile Purge
            </button>
        </div>
      </div>
    </main>
  );
}
