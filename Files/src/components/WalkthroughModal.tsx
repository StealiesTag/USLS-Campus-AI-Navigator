import React, { useState } from "react";
import { Compass, MapPin, Sparkles, Navigation, Check, X, ArrowRight } from "lucide-react";

export interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to USLS Campus Navigator",
      description:
        "Explore the University of St. La Salle campus with interactive vector mapping, building directories, and intelligent turn-by-turn routing.",
      icon: Compass,
    },
    {
      title: "Interactive Campus Vector Map",
      description:
        "Click on any building or landmark to view department directories, operating hours, and floor plans. Use zoom & pan controls to explore all colleges.",
      icon: MapPin,
    },
    {
      title: "AI-Powered Navigation Assistant",
      description:
        "Ask natural questions like 'How do I get to Santuario de La Salle from Gate 2?' or 'Where is the IT Lab?' and the AI will plot the optimal walking route directly on your map.",
      icon: Sparkles,
    },
    {
      title: "Cloud Sync & Trip Bookmarks",
      description:
        "Sign in with Google to save frequent routes and class itineraries directly to your personal Firestore cloud history.",
      icon: Navigation,
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Step {step + 1} of {steps.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 shadow-xs">
            <Icon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{current.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{current.description}</p>
          </div>
        </div>

        {/* Progress Bar & Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex space-x-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-emerald-700" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition-colors shadow-xs"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition-colors shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Start Exploring</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
