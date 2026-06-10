import React from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false, errorMsg: "" };
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleHardReset = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <div className="bg-slate-900/80 p-8 rounded-2xl border border-red-500/30 max-w-lg shadow-2xl backdrop-blur-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
            <h1 className="text-2xl font-bold text-red-400 tracking-tight uppercase mb-2">SYSTEM FAILURE DETECTED</h1>
            <p className="text-sm text-slate-400 mb-6 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 break-words text-left">
              {this.state.errorMsg || "An unknown corruption breached the UI barrier."}
            </p>
            
            <p className="text-sm text-slate-300 mb-8 max-w-sm mx-auto">
              The spatial matrix has collapsed. If reloading doesn't fix it, you may need to purge the corrupted local storage cache.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={this.handleReload}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Matrix
              </button>
              <button 
                onClick={this.handleHardReset}
                className="px-6 py-3 bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-900/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                Purge & Reset All Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
