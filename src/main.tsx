// DOM Storage & Compatibility Shims for sandboxed environments like standard Android WebViews
(function bootstrapShims() {
  interface MemoryStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
    readonly length: number;
    key: (index: number) => string | null;
    [key: string]: any;
  }

  const createMemoryStorage = (): MemoryStorage => {
    let store: Record<string, string> = {};
    const storageObj = {
      getItem(key: string): string | null {
        return key in store ? store[key] : null;
      },
      setItem(key: string, value: string): void {
        store[key] = String(value);
      },
      removeItem(key: string): void {
        delete store[key];
      },
      clear(): void {
        store = {};
      },
      get length(): number {
        return Object.keys(store).length;
      },
      key(index: number): string | null {
        const keys = Object.keys(store);
        return index >= 0 && index < keys.length ? keys[index] : null;
      }
    };

    return new Proxy(storageObj, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if (typeof prop === "string") {
          return store[prop] !== undefined ? store[prop] : null;
        }
        return undefined;
      },
      set(target, prop, value, receiver) {
        if (typeof prop === "string" && !(prop in target)) {
          store[prop] = String(value);
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      },
      deleteProperty(target, prop) {
        if (typeof prop === "string" && !(prop in target)) {
          delete store[prop];
          return true;
        }
        return Reflect.deleteProperty(target, prop);
      },
      ownKeys() {
        return Object.keys(store);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (typeof prop === "string" && store[prop] !== undefined) {
          return {
            value: store[prop],
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        return undefined;
      }
    }) as any;
  };

  let storageOperational = false;
  try {
    // Checking if both accessing and using localStorage works
    if (typeof window !== "undefined" && window.localStorage) {
      const testKey = "__monarch_storage_test__";
      window.localStorage.setItem(testKey, testKey);
      const retrieved = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      if (retrieved === testKey) {
        storageOperational = true;
      }
    }
  } catch (e) {
    console.warn("Native localStorage check failed. Initiating fallback...", e);
  }

  if (!storageOperational) {
    const fallbackLocal = createMemoryStorage();
    const fallbackSession = createMemoryStorage();

    const applyShim = (targetObj: any, propName: string, value: any) => {
      try {
        Object.defineProperty(targetObj, propName, {
          get() { return value; },
          set() { /* Keep read-only assignment silent */ },
          configurable: true,
          enumerable: true
        });
      } catch (err) {
        // Fallback simple assignment
        try {
          targetObj[propName] = value;
        } catch (_) {}
      }
    };

    // Apply shim at multiple layers to catch all access vectors
    if (typeof Window !== "undefined" && Window.prototype) {
      applyShim(Window.prototype, "localStorage", fallbackLocal);
      applyShim(Window.prototype, "sessionStorage", fallbackSession);
    }
    
    if (typeof window !== "undefined") {
      applyShim(window, "localStorage", fallbackLocal);
      applyShim(window, "sessionStorage", fallbackSession);
    }

    if (typeof globalThis !== "undefined") {
      applyShim(globalThis, "localStorage", fallbackLocal);
      applyShim(globalThis, "sessionStorage", fallbackSession);
    }
    
    console.log("🔒 Storage security compatibility shields successfully deployed.");
  }
})();

// Global uncaught error tracker to prevent blank screens and offer friendly on-screen diagnostics in WebViews
window.addEventListener("error", (event) => {
  const errObj = event.error || new Error(event.message || "Unknown error");
  renderDiagnosticsOverlay(errObj);
});

window.addEventListener("unhandledrejection", (event) => {
  const errObj = new Error(String(event.reason || "Unhandled Promise Rejection"));
  renderDiagnosticsOverlay(errObj);
});

function renderDiagnosticsOverlay(error: Error) {
  // Explicitly log the full error details and stack trace to help test runners see the actual root cause
  console.error("Monarch Global Diagnostics caught error message:", error.message);
  console.error("Monarch Global Diagnostics caught error stack:", error.stack || "No stack trace available");
  
  if (typeof document === "undefined" || !document.body) {
    return;
  }
  
  let div = document.getElementById("diagnostics-overlay");
  if (!div) {
    div = document.createElement("div");
    div.id = "diagnostics-overlay";
    div.style.position = "fixed";
    div.style.inset = "0";
    div.style.backgroundColor = "#020617";
    div.style.color = "#f8fafc";
    div.style.fontFamily = "monospace";
    div.style.padding = "24px";
    div.style.zIndex = "999999";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.textAlign = "center";
    div.style.overflowY = "auto";

    const errorDetails = error ? (error.stack || error.message || String(error)) : "Unknown system disruption";

    div.innerHTML = `
      <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
         <div style="font-size: 40px; margin-bottom: 16px;">🔮</div>
         <h2 style="font-size: 18px; font-weight: bold; color: #ef4444; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">System Interruption</h2>
         <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px 0; line-height: 1.5;">
           The Monarch interface encountered a runtime mismatch. Please ensure cookies & JavaScript storage are enabled in your device settings.
         </p>
         <pre style="background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 11px; color: #cbd5e1; text-align: left; white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto; margin-bottom: 24px;">${errorDetails}</pre>
         <button id="diagnostics-retry" style="background-color: #3b82f6; border: none; color: white; padding: 10px 24px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3));">
           Wipe Cache & Recalibrate
         </button>
      </div>
    `;
    document.body.appendChild(div);

    const btn = document.getElementById("diagnostics-retry");
    if (btn) {
      btn.onclick = () => {
        try {
          localStorage.clear();
        } catch (_) {}
        window.location.reload();
      };
    }
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
