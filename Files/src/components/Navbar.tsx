import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Compass,
  Building2,
  History,
  ShieldCheck,
  HelpCircle,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export interface NavbarProps {
  onToggleDirectory?: () => void;
  onToggleHistory?: () => void;
  onToggleSecurity?: () => void;
  onToggleWalkthrough?: () => void;
  directoryOpen?: boolean;
  historyOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleDirectory,
  onToggleHistory,
  onToggleSecurity,
  onToggleWalkthrough,
  directoryOpen = false,
  historyOpen = false,
}) => {
  const { user, login, logout, loading } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
      {/* Brand Title & Directory Trigger */}
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              USLS Campus AI Navigator
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
              Live Map
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            University of St. La Salle &bull; Turn-by-Turn AI Guidance
          </p>
        </div>

        {onToggleDirectory && (
          <button
            onClick={onToggleDirectory}
            className={`ml-2 hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              directoryOpen
                ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Campus Directory</span>
          </button>
        )}
      </div>

      {/* Right Action Icons & Auth Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Walkthrough Button */}
        {onToggleWalkthrough && (
          <button
            onClick={onToggleWalkthrough}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Campus Map Guide"
          >
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <span className="hidden md:inline">Quick Guide</span>
          </button>
        )}

        {/* Security Specs Drawer */}
        {onToggleSecurity && (
          <button
            onClick={onToggleSecurity}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="System & Security Specs"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        )}

        {/* History Button (if user is logged in) */}
        {user && onToggleHistory && (
          <button
            onClick={onToggleHistory}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              historyOpen
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
            title="View Saved Trips"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Saved Trips</span>
          </button>
        )}

        {/* Auth Profile / Login */}
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 shadow-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-5 w-5 rounded-full border border-emerald-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="h-3.5 w-3.5 text-emerald-700" />
              )}
              <span className="text-xs font-bold text-emerald-900 hidden sm:inline">
                {user.displayName}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            disabled={loading}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>{loading ? "..." : "Sign In"}</span>
          </button>
        )}
      </div>
    </header>
  );
};
