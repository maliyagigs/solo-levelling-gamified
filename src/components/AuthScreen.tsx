import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { safeLocalStorage as localStorage } from "../utils/storage";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Lock, 
  Mail, 
  AlertTriangle, 
  RefreshCw, 
  UserPlus, 
  LogIn, 
  Fingerprint, 
  ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const getFriendlyErrorMessage = (err: any) => {
    const code = err?.code || "";
    const msg = err?.message || "";
    
    if (code.includes("invalid-credential") || msg.includes("invalid-credential") || code.includes("wrong-password")) {
      return "Access Denied: The credentials supplied do not match our database registries. Double-check your password. Or, if you are a new candidate user, please select the 'REGISTER' tab above to initialize your account first!";
    }
    if (code.includes("email-already-in-use") || msg.includes("email-already-in-use")) {
      return "Registration Blocked: This email address is already bound to an active Hunter account. Toggle to the 'SIGN IN' tab to access your account.";
    }
    if (code.includes("weak-password") || msg.includes("weak-password")) {
      return "Security Firewall: Password too weak. Ensure your password is at least 6 characters in length.";
    }
    if (code.includes("invalid-email") || msg.includes("invalid-email")) {
      return "Credential Fail: The entered email structure is invalid.";
    }
    if (code.includes("user-not-found") || msg.includes("user-not-found")) {
      return "No active profile found. Toggle the 'REGISTER' tab above to create a new hunter profile first.";
    }
    if (code.includes("too-many-requests") || msg.includes("too-many-requests")) {
      return "Gateway Calibrating: Too many failed auth attempts. The system is temporarily cooling down to prevent penetration.";
    }
    return msg.replace("Firebase: ", "");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Credentials missing: Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Security Guidelines: Your cipher passcode must be at least 6 characters in length.");
      return;
    }

    try {
      setError(null);
      setAuthLoading(true);

      if (isSignUp) {
        // Create user
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Write initial empty profile metadata to Firestore for the new user
        if (credential.user) {
          const userDocRef = doc(db, "users", credential.user.uid);
          await setDoc(userDocRef, {
            email: credential.user.email,
            v3_reset: true,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Standard Sign In
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth process failure:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePurge = () => {
    if (confirm("SYSTEM NOTIFICATION\n\nThis will completely flush all cached local hunter cards and session storage slots. Are you ready to clear system memory?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main role="main" className="flex flex-col items-center justify-start sm:justify-center min-h-[100dvh] py-10 px-4 text-slate-100 select-none overflow-y-auto w-full pb-safe">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Subtle accent glow lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-indigo-500" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />

        {/* Brand System Logo & Identity */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex p-3 bg-slate-950 border border-cyan-500/20 rounded-2xl mb-3 text-cyan-400">
            <Fingerprint className="w-10 h-10 animate-pulse text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-widest text-white font-sans uppercase">
            Sovereign Portal
          </h1>
          <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mt-1">
            Core Security Gateway &bull; Credentials Registry
          </p>
        </div>

        {/* Tab System Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            disabled={authLoading}
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              !isSignUp 
                ? "bg-slate-800 text-cyan-400 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={authLoading}
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              isSignUp 
                ? "bg-slate-800 text-cyan-400 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Diagnostic Errors panel */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div 
                role="alert" 
                className="bg-red-950/40 border border-red-900 text-red-200 text-xs p-4 rounded-xl flex items-start gap-3 font-mono leading-relaxed"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-400 block mb-1">SYSTEM ALERT</span>
                  {error}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Security Tip */}
        <div 
          id="security_validation_tip" 
          className="mb-6 bg-cyan-950/20 border border-cyan-900/30 text-cyan-400 text-[10px] p-3 rounded-xl flex items-start gap-2.5 font-mono leading-relaxed"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-cyan-300 block mb-0.5">SECURE ENDPOINT VALIDATION</span>
            Authentication is processed directly with our secure database enclave. All passkeys are securely salted and hashed.
          </div>
        </div>

        {/* Input credentials interaction form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block" htmlFor="gateway_email">
              Gate Coordinate (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="gateway_email"
                type="email"
                required
                disabled={authLoading}
                placeholder="huntername@shadowmonarch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 p-4 pl-12 rounded-xl text-sm text-slate-200 outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block" htmlFor="gateway_passcode">
              Cipher Code (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="gateway_passcode"
                type="password"
                required
                disabled={authLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 p-4 pl-12 rounded-xl text-sm text-slate-200 outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action button - Confirm auth */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase p-4 h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md disabled:opacity-50 active:scale-98"
          >
            {authLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isSignUp ? "INITIALIZE VESSEL" : "ACCESS CONSOLE"}</span>
          </button>
        </form>

        {/* Switch tab text helpers */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            {isSignUp ? (
              <>
                Already certified?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
                >
                  Switch to Sign In
                </button>
              </>
            ) : (
              <>
                New candidate?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
                >
                  Register Profile
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom utility: System Purge */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handlePurge}
            className="text-[9px] uppercase tracking-widest text-slate-600 hover:text-red-400 transition-colors font-mono cursor-pointer"
          >
            SYSTEM RESET &bull; FLUSH SESSION MEMORY
          </button>
        </div>
      </motion.div>
    </main>
  );
}
