import React from "react";
import { ShieldCheck, Lock, Server, Database, X } from "lucide-react";

export interface SecurityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityDrawer: React.FC<SecurityDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto text-slate-800 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">System &amp; Security Specs</h2>
                <p className="text-xs text-slate-500 font-medium">Architecture and privacy boundaries</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Security Cards */}
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Server className="h-4 w-4 text-emerald-700" />
                <span>Zero-Client Key Exposure</span>
              </div>
              <p className="leading-relaxed text-slate-600 font-medium">
                Gemini API tokens and backend credentials never touch the browser. All AI prompts are routed through server-side Express proxies (<code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">/api/chat</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Database className="h-4 w-4 text-emerald-700" />
                <span>Firestore User Isolation</span>
              </div>
              <p className="leading-relaxed text-slate-600 font-medium">
                Database rules enforce authenticated user isolation at <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">/users/{`{userId}`}/*</code>, protecting saved trip data across sessions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Lock className="h-4 w-4 text-emerald-700" />
                <span>Client-Side Google OAuth</span>
              </div>
              <p className="leading-relaxed text-slate-600 font-medium">
                Authentication flows run directly through official Firebase Auth popups with automatic redirect fallbacks for iframe sandboxes.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
          >
            Close Security Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
