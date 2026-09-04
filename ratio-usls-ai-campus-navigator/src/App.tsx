import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { CampusMap } from "./components/CampusMap";
import { BuildingDirectory } from "./components/BuildingDirectory";
import { NavigationChat } from "./components/NavigationChat";
import { HistorySidebar } from "./components/HistorySidebar";
import { SecurityDrawer } from "./components/SecurityDrawer";
import { WalkthroughModal } from "./components/WalkthroughModal";
import { CampusBuilding, NavigationRoute, UserInteraction } from "./types";
import { CAMPUS_BUILDINGS, calculateCampusRoute } from "./data/campusData";
import { LogIn, Sparkles, Compass, Layers } from "lucide-react";

function MainDashboard() {
  const { user, login } = useAuth();

  // Selected building & Origin state (defaults start position to user pointer)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>("santuario-de-la-salle");
  const [originBuildingId, setOriginBuildingId] = useState<string>("user-current-location");

  // Mobile Bottom Navigation Tab state ("map" | "chat" | "directory")
  const [activeMobileTab, setActiveMobileTab] = useState<"map" | "chat" | "directory">("map");

  // UI Drawer / Modal states
  const [directoryOpen, setDirectoryOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [securityOpen, setSecurityOpen] = useState<boolean>(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState<boolean>(false);

  // Active custom route (null by default so the user pointer moves with 100% unrestricted freedom)
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);

  const handleSelectBuilding = (building: CampusBuilding) => {
    setSelectedBuildingId(building.id);
    setActiveMobileTab("map");
  };

  const handleNavigateTo = (destinationId: string, originId?: string) => {
    const origin = originId || originBuildingId;
    if (originId) {
      setOriginBuildingId(originId);
    }
    setSelectedBuildingId(destinationId);
    const newRoute = calculateCampusRoute(origin, destinationId);
    setActiveRoute(newRoute);
    setActiveMobileTab("map");
  };

  const handleSelectHistoryInteraction = (item: UserInteraction) => {
    setOriginBuildingId(item.originId);
    setSelectedBuildingId(item.destinationId);
    const newRoute = calculateCampusRoute(item.originId, item.destinationId);
    setActiveRoute(newRoute);
    setActiveMobileTab("map");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-none font-sans">
      {/* Top Header */}
      <Navbar
        directoryOpen={directoryOpen}
        historyOpen={historyOpen}
        onToggleDirectory={() => setDirectoryOpen(!directoryOpen)}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        onToggleSecurity={() => setSecurityOpen(true)}
        onToggleWalkthrough={() => setWalkthroughOpen(true)}
      />

      {/* Guest Notice Strip (Hidden on mobile to preserve screen height) */}
      {!user && (
        <div className="hidden sm:flex bg-emerald-50 border-b border-emerald-200/80 px-4 py-1.5 text-xs text-emerald-800 items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Campus Visitor Mode:</strong> Interactive Vector Map &amp; AI Navigator are ready to assist you. Sign in with Google anytime to save your favorite routes.
            </span>
          </div>
          <button
            onClick={login}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shadow-xs"
          >
            <LogIn className="h-3 w-3" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Main Responsive Layout: Single Screen Tab on Mobile, Side-by-Side Split on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Left: Building Directory (Desktop Sidebar / Mobile Tab View) */}
        {(directoryOpen || activeMobileTab === "directory") && (
          <div
            className={`z-30 h-full ${
              activeMobileTab === "directory"
                ? "flex flex-col w-full h-full pb-14 lg:pb-0"
                : "hidden lg:flex"
            }`}
          >
            <BuildingDirectory
              selectedBuildingId={selectedBuildingId}
              onSelectBuilding={(b) => {
                handleSelectBuilding(b);
                setDirectoryOpen(false);
              }}
              onNavigateTo={(dest) => {
                handleNavigateTo(dest);
                setDirectoryOpen(false);
              }}
            />
          </div>
        )}

        {/* Center: Full Interactive Vector SVG Campus Map */}
        <section
          className={`flex-1 h-full min-w-0 relative ${
            activeMobileTab === "map" ? "flex" : "hidden lg:flex"
          }`}
        >
          <CampusMap
            selectedBuildingId={selectedBuildingId}
            originBuildingId={originBuildingId}
            onSelectBuilding={handleSelectBuilding}
            onNavigateTo={handleNavigateTo}
            activeRoute={activeRoute}
            onClearRoute={() => {
              setSelectedBuildingId(null);
              setActiveRoute(null);
            }}
            onOpenAiChat={(building) => {
              setActiveMobileTab("chat");
            }}
          />
        </section>

        {/* Right: AI Navigator Chat Panel (Desktop Sidebar / Mobile Tab View) */}
        <div
          className={`shrink-0 ${
            activeMobileTab === "chat"
              ? "flex flex-col w-full h-full pb-14 lg:pb-0 z-30"
              : "hidden lg:flex lg:w-96 xl:w-[420px] h-full"
          }`}
        >
          <NavigationChat
            selectedBuildingId={selectedBuildingId}
            originBuildingId={originBuildingId}
            onSetOrigin={(id) => setOriginBuildingId(id)}
            onSetDestination={(id) => {
              setSelectedBuildingId(id);
              const newRoute = calculateCampusRoute(originBuildingId, id);
              setActiveRoute(newRoute);
              setActiveMobileTab("map");
            }}
            activeRoute={activeRoute}
          />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 📱 MOBILE BOTTOM NAVIGATION BAR (Only visible on screens < lg)             */}
      {/* ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-emerald-100 backdrop-blur-lg shadow-2xl flex items-center justify-around py-2 px-3">
        <button
          onClick={() => {
            setActiveMobileTab("map");
            setDirectoryOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all active:scale-95 ${
            activeMobileTab === "map"
              ? "text-emerald-700 font-bold bg-emerald-50"
              : "text-slate-500 font-medium hover:text-emerald-700"
          }`}
        >
          <Compass className={`h-5 w-5 ${activeMobileTab === "map" ? "text-emerald-700" : ""}`} />
          <span className="text-[11px]">Campus Map</span>
        </button>

        <button
          onClick={() => {
            setActiveMobileTab("chat");
            setDirectoryOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all active:scale-95 relative ${
            activeMobileTab === "chat"
              ? "text-emerald-700 font-bold bg-emerald-50"
              : "text-slate-500 font-medium hover:text-emerald-700"
          }`}
        >
          <Sparkles className={`h-5 w-5 ${activeMobileTab === "chat" ? "text-emerald-700" : "text-amber-500"}`} />
          <span className="text-[11px]">AI Guide</span>
          <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        <button
          onClick={() => {
            setActiveMobileTab("directory");
            setDirectoryOpen(true);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all active:scale-95 ${
            activeMobileTab === "directory"
              ? "text-emerald-700 font-bold bg-emerald-50"
              : "text-slate-500 font-medium hover:text-emerald-700"
          }`}
        >
          <Layers className={`h-5 w-5 ${activeMobileTab === "directory" ? "text-emerald-700" : ""}`} />
          <span className="text-[11px]">Buildings</span>
        </button>
      </nav>

      {/* Firestore History Sidebar Drawer */}
      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        selectedId={selectedBuildingId}
        onSelectInteraction={handleSelectHistoryInteraction}
        onNewRoute={() => {
          setSelectedBuildingId(null);
          setActiveRoute(null);
        }}
      />

      {/* System & Architecture Specs Drawer */}
      <SecurityDrawer isOpen={securityOpen} onClose={() => setSecurityOpen(false)} />

      {/* Guided Walkthrough Modal */}
      <WalkthroughModal isOpen={walkthroughOpen} onClose={() => setWalkthroughOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
