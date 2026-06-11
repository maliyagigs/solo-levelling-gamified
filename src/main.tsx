// DOM Storage & Compatibility Shims for sandboxed environments like standard Android WebViews
(function bootstrapShims() {
  interface MemoryStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
    readonly length: number;
    key: (index: number) => string | null;
  }

  const createMemoryStorage = (): MemoryStorage => {
    let store: Record<string, string> = {};
    return {
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
  };

  let storageOperational = false;
  try {
    const testKey = "__monarch_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    if (retrieved === testKey) {
      storageOperational = true;
    }
  } catch (e) {
    console.warn("Storage check failed. Redundant memory storage fallback initiated.", e);
  }

  if (!storageOperational) {
    try {
      Object.defineProperty(window, "localStorage", {
        value: createMemoryStorage(),
        writable: true,
        configurable: true
      });
    } catch (err) {
      console.error("Critical: Failed to shim localStorage.", err);
    }

    try {
      Object.defineProperty(window, "sessionStorage", {
        value: createMemoryStorage(),
        writable: true,
        configurable: true
      });
    } catch (err) {
      console.error("Critical: Failed to shim sessionStorage.", err);
    }
  }
})();

// Global uncaught error tracker to prevent blank screens and offer friendly on-screen diagnostics in WebViews
window.addEventListener("error", (event) => {
  renderDiagnosticsOverlay(event.error || new Error(event.message || "Unknown error"));
});

window.addEventListener("unhandledrejection", (event) => {
  renderDiagnosticsOverlay(new Error(String(event.reason || "Unhandled Promise Rejection")));
});

function renderDiagnosticsOverlay(error: Error) {
  console.error("Monarch Global Diagnostics caught error:", error);
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
      <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-w: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
         <div style="font-size: 40px; margin-bottom: 16px;">🔮</div>
         <h2 style="font-size: 18px; font-weight: bold; color: #ef4444; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">System Interruption</h2>
         <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px 0; line-height: 1.5;">
           The Monarch interface encountered a runtime mismatch. Please ensure cookies & JavaScript storage are enabled in your device settings.
         </p>
         <pre style="background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 11px; color: #cbd5e1; text-align: left; white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto; margin-bottom: 24px;">${errorDetails}</pre>
         <button id="diagnostics-retry" style="background-color: #3b82f6; border: none; color: white; padding: 10px 24px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3));">
           Wipe Cash & Recalibrate
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
