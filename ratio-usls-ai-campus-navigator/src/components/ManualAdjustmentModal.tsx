import React, { useState } from "react";
import {
  MapPin,
  Crosshair,
  Footprints,
  Navigation,
  X,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  RefreshCw,
  Radio,
  Locate,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { CAMPUS_BUILDINGS, CampusBuilding } from "../data/campusData";
import { GeolocationState } from "../hooks/useGeolocation";

export interface ManualAdjustmentModalProps {
  geo: GeolocationState;
  onClose: () => void;
  onRecenterOnUser: () => void;
  onSetUserAsRouteOrigin: () => void;
  selectedBuilding: CampusBuilding | null;
}

export const ManualAdjustmentModal: React.FC<ManualAdjustmentModalProps> = ({
  geo,
  onClose,
  onRecenterOnUser,
  onSetUserAsRouteOrigin,
  selectedBuilding,
}) => {
  const [activeTab, setActiveTab] = useState<"gps" | "position" | "walk">("gps");

  // Gate list
  const gateList = CAMPUS_BUILDINGS.filter((b) => b.category === "gates").sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 pointer-events-auto">
      <div className="bg-white border border-emerald-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-800 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-700 text-white shadow-md">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Geo Tracking &amp; Manual Tools
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    geo.isManualMode
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {geo.isManualMode ? "Manual Pin Mode" : "Live GPS Active"}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Real-time geolocation with manual position calibration tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 pt-2 gap-1.5 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("gps")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "gps"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>📡 Live GPS</span>
          </button>
          <button
            onClick={() => setActiveTab("position")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "position"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>📍 Position Pin</span>
          </button>
          <button
            onClick={() => setActiveTab("walk")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "walk"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Footprints className="h-3.5 w-3.5" />
            <span>🚶 Walk Controls</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Current Status Pill */}
          <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                {geo.isManualMode ? "Calibrated Position (Relative GPS Active)" : "Current Raw GPS Position"}
              </span>
              <span className="font-extrabold text-slate-900 text-sm block">
                📍 {geo.nearestBuildingName}
              </span>
              <span className="text-slate-500 text-[11px]">
                Map ({geo.mapCoords.x}%, {geo.mapCoords.y}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {geo.isManualMode ? (
                <button
                  onClick={() => {
                    geo.resetToLiveGps();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  title="Reset offset to raw hardware GPS"
                >
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>Reset Offset</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    geo.setPosition(33, 14);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  title="Calibrate position to Gate 2"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Calibrate</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 0: LIVE GPS TELEMETRY & STATUS                                        */}
          {/* ========================================================================= */}
          {activeTab === "gps" && (
            <div className="space-y-4">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-emerald-50/80 border border-emerald-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">WGS84 Coordinates</span>
                  <span className="font-mono font-extrabold text-emerald-950 text-xs block mt-0.5">
                    {geo.location ? `${geo.location.latitude.toFixed(5)}° N` : "10.67915° N"}
                  </span>
                  <span className="font-mono text-emerald-800 text-[11px]">
                    {geo.location ? `${geo.location.longitude.toFixed(5)}° E` : "122.96280° E"}
                  </span>
                </div>

                <div className="bg-blue-50/80 border border-blue-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Distance to Center</span>
                  <span className="font-mono font-extrabold text-blue-950 text-xs block mt-0.5">
                    {Math.abs(geo.mapCoords.metersEast)}m {geo.mapCoords.metersEast >= 0 ? "East" : "West"}
                  </span>
                  <span className="text-blue-700 text-[11px]">
                    {Math.abs(geo.mapCoords.metersNorth)}m {geo.mapCoords.metersNorth >= 0 ? "North" : "South"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">GPS Accuracy</span>
                  <span className="font-mono font-extrabold text-slate-900 text-xs block mt-0.5">
                    &plusmn;{geo.accuracy ? Math.round(geo.accuracy) : 3} meters
                  </span>
                  <span className="text-emerald-600 text-[11px] font-bold">
                    {geo.isTracking ? "Active Tracking" : "Standby"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Mode Status</span>
                  <span className="font-bold text-slate-900 text-xs block mt-0.5">
                    {geo.isManualMode ? "Manual Override" : "Live GPS Lock"}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {geo.isManualMode ? "Relative offset active" : "Satellite tracking"}
                  </span>
                </div>
              </div>

              {/* Campus Real-World Position Card */}
              <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    <span className="font-extrabold text-emerald-950 text-xs">Relative Real-Time GPS Tracking</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 font-bold">
                    {geo.isManualMode ? "Calibrated Offset Active" : "Direct GPS Active"}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-slate-700 space-y-1.5">
                  <p className="text-slate-600 leading-relaxed">
                    {geo.isManualMode
                      ? "Your position has been calibrated. As you walk, live GPS updates shift your avatar relative to your calibrated location so you stay aligned with the digital campus."
                      : "Receiving live satellite coordinates. If your avatar is slightly off, tap anywhere on the map or use the position tools to align it."}
                  </p>
                </div>
              </div>

              {/* Error or Warning banner if any */}
              {geo.error && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900 text-xs flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block">GPS Notice:</span>
                    <span>{geo.error}</span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    geo.resetToLiveGps();
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>Lock to Live GPS</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: POSITION MANUAL ADJUSTMENT                                         */}
          {/* ========================================================================= */}
          {activeTab === "position" && (
            <div className="space-y-4">
              {/* Tap on Map Action Card */}
              <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-3.5 rounded-2xl text-white shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-emerald-200 animate-pulse" />
                    <span className="font-bold text-sm">Tap on Map to Place Avatar</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    Interactive
                  </span>
                </div>
                <p className="text-emerald-50 text-[11px] leading-relaxed">
                  Tap anywhere on campus to calibrate your avatar. As you physically walk, your phone's GPS continues to move your pointer in real-time!
                </p>
                <button
                  onClick={() => {
                    geo.toggleCalibratingPosition(true);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-extrabold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Crosshair className="h-4 w-4 text-emerald-700" />
                  <span>Activate Map Tap-to-Place Mode</span>
                </button>

                {/* Relative Position Calibration Offset Pill */}
                {geo.isManualMode && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[11px]">
                    <span className="text-emerald-100 font-medium">
                      Offset: <span className="font-mono font-bold text-white">ΔX {geo.positionOffset.dx > 0 ? `+${geo.positionOffset.dx}` : geo.positionOffset.dx}%, ΔY {geo.positionOffset.dy > 0 ? `+${geo.positionOffset.dy}` : geo.positionOffset.dy}%</span> (moves with you)
                    </span>
                    <button
                      onClick={() => geo.resetPositionOffset()}
                      className="text-amber-200 hover:text-white font-bold underline text-[10px] ml-1 shrink-0"
                    >
                      Reset to Raw GPS
                    </button>
                  </div>
                )}
              </div>

              {/* Walking Scale & Stride Sensitivity (IRL to Digital Ratio Calibration) */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-emerald-700" />
                    <span className="font-extrabold text-slate-800 text-xs">Walking Speed Modifier (IRL Sensitivity)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {geo.scaleMultiplier !== 1.0 && (
                      <button
                        onClick={() => geo.setScaleMultiplier(1.0)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 underline font-medium"
                      >
                        Reset 1.0x
                      </button>
                    )}
                    <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                      {geo.scaleMultiplier.toFixed(2)}x
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Calibrate how fast your digital avatar travels across the campus map per meter of real-world walking (now adjustable up to 5.0x modifier):
                </p>

                {/* 5x Range Slider */}
                <div className="space-y-1.5 pt-0.5">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.05"
                    value={geo.scaleMultiplier}
                    onChange={(e) => geo.setScaleMultiplier(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.5x (Slow)</span>
                    <span>1.0x (1:1)</span>
                    <span className="font-bold text-emerald-700">2.5x (Brisk)</span>
                    <span>3.5x</span>
                    <span className="font-bold text-emerald-900">5.0x (Max)</span>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { label: "1.0x (1:1)", value: 1.0 },
                    { label: "1.5x", value: 1.5 },
                    { label: "2.5x", value: 2.5 },
                    { label: "3.5x", value: 3.5 },
                    { label: "5.0x (Max)", value: 5.0 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => geo.setScaleMultiplier(preset.value)}
                      className={`py-1.5 rounded-xl font-bold text-[10px] border transition-all active:scale-95 ${
                        Math.abs(geo.scaleMultiplier - preset.value) < 0.05
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Fine Nudge Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-500 font-medium">Fine-tune:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <button
                      onClick={() => geo.setScaleMultiplier(Math.max(0.5, Number((geo.scaleMultiplier - 0.5).toFixed(2))))}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold active:scale-95 transition-all"
                    >
                      -0.5x
                    </button>
                    <button
                      onClick={() => geo.setScaleMultiplier(Math.max(0.5, Number((geo.scaleMultiplier - 0.1).toFixed(2))))}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold active:scale-95 transition-all"
                    >
                      -0.1x
                    </button>
                    <button
                      onClick={() => geo.setScaleMultiplier(Math.min(5.0, Number((geo.scaleMultiplier + 0.1).toFixed(2))))}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold active:scale-95 transition-all"
                    >
                      +0.1x
                    </button>
                    <button
                      onClick={() => geo.setScaleMultiplier(Math.min(5.0, Number((geo.scaleMultiplier + 0.5).toFixed(2))))}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold active:scale-95 transition-all"
                    >
                      +0.5x
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Jump: Campus Gates */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-800 block text-xs flex items-center gap-1.5">
                  <span>🚪 Jump to Campus Entrance Gate</span>
                  <span className="text-[10px] text-slate-400 font-normal">(9 Official Gates)</span>
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {gateList.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        geo.setPosition(g.x, g.y);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all active:scale-95 ${
                        Math.hypot(g.x - geo.mapCoords.x, g.y - geo.mapCoords.y) < 4
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                          : "bg-white hover:bg-emerald-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-bold text-[11px] block truncate">{g.shortName}</span>
                      <span className="text-[9px] opacity-75 block truncate">
                        {g.id === "gate-2" ? "Main Admin Gate" : g.id === "gate-3" ? "IS Gate" : "Entrance"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump: Key Landmark Buildings & All Facilities */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-800 block text-xs">
                  🏛️ Place Avatar Inside Any Campus Building
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {CAMPUS_BUILDINGS.filter((b) => b.category !== "gates").map((b) => {
                    const isHere = Math.hypot(b.x - geo.mapCoords.x, b.y - geo.mapCoords.y) < 3.5;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          geo.setPosition(b.x, b.y);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all active:scale-95 flex items-center justify-between ${
                          isHere
                            ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                            : "bg-white hover:bg-emerald-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-bold text-[11px] block truncate">{b.name}</span>
                          <span className="text-[9px] opacity-75 block truncate">{b.popularFor}</span>
                        </div>
                        {isHere && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: WALK CONTROLS                                                      */}
          {/* ========================================================================= */}
          {activeTab === "walk" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center gap-3">
                <span className="font-bold text-slate-700 text-xs">Directional Walk Controls</span>

                {/* 4-Way Stepping Controls */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => geo.stepDirection("north", 1.5)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                    title="Step North"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span>Step North</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => geo.stepDirection("west", 1.5)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                      title="Step West"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Step West</span>
                    </button>

                    <button
                      onClick={() => onRecenterOnUser()}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                      title="Center on Avatar"
                    >
                      <Crosshair className="h-4 w-4" />
                      <span>Center</span>
                    </button>

                    <button
                      onClick={() => geo.stepDirection("east", 1.5)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                      title="Step East"
                    >
                      <span>Step East</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => geo.stepDirection("south", 1.5)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                    title="Step South"
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span>Step South</span>
                  </button>
                </div>
              </div>

              {/* Walking Speed Modifier in Walk tab */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-emerald-700" />
                    <span className="font-extrabold text-slate-800 text-xs">Walking Speed Modifier</span>
                  </div>
                  <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                    {geo.scaleMultiplier.toFixed(2)}x
                  </span>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.05"
                    value={geo.scaleMultiplier}
                    onChange={(e) => geo.setScaleMultiplier(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span className="font-bold text-emerald-700">2.5x</span>
                    <span>3.5x</span>
                    <span className="font-bold text-emerald-900">5.0x</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                  {[
                    { label: "1.0x", value: 1.0 },
                    { label: "1.5x", value: 1.5 },
                    { label: "2.5x", value: 2.5 },
                    { label: "3.5x", value: 3.5 },
                    { label: "5.0x", value: 5.0 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => geo.setScaleMultiplier(preset.value)}
                      className={`py-1.5 rounded-xl font-bold text-[10px] border transition-all active:scale-95 ${
                        Math.abs(geo.scaleMultiplier - preset.value) < 0.05
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Action */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-2">
                <span className="font-bold text-emerald-950 block text-xs">
                  Route to Destination
                </span>
                <p className="text-emerald-800 text-[11px]">
                  Calculate optimal walking paths from your current position to any building or gate on campus.
                </p>
                <button
                  onClick={() => {
                    onSetUserAsRouteOrigin();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>
                    {selectedBuilding
                      ? `Route to ${selectedBuilding.shortName}`
                      : "Route From My Location"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <button
            onClick={onRecenterOnUser}
            className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Locate className="h-4 w-4" />
            <span>Recenter Map on Me</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
