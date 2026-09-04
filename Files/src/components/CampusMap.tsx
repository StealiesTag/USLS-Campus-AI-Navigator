import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CampusBuilding,
  CAMPUS_BUILDINGS,
  CAMPUS_GRAPH_NODES,
  calculateCampusRoute,
  calculateRouteFromGpsLocation,
  getClosestBuilding,
} from "../data/campusData";
import { NavigationRoute } from "../types";
import { useGeolocation } from "../hooks/useGeolocation";
import { ManualAdjustmentModal } from "./ManualAdjustmentModal";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  MapPin,
  Navigation,
  Footprints,
  Clock,
  X,
  Search,
  Church,
  Info,
  Compass,
  Sparkles,
  CheckCircle2,
  Locate,
  Crosshair,
  Radio,
  RotateCw,
  RotateCcw,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Play,
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders,
  GraduationCap,
  Building2,
  Trophy,
  DoorOpen,
} from "lucide-react";

export interface CampusMapProps {
  selectedBuildingId?: string | null;
  originBuildingId?: string;
  onSelectBuilding: (building: CampusBuilding) => void;
  onNavigateTo: (destinationId: string, originId?: string) => void;
  activeRoute?: NavigationRoute | null;
  onClearRoute?: () => void;
  onOpenAiChat?: (building?: CampusBuilding) => void;
}

// Helper to split text into neat lines inside SVG building shapes
function getBuildingLabelLines(shortName: string, maxWidthPx: number): { lines: string[]; fontSize: number } {
  // Manual overrides for known building labels to look balanced
  const customSplits: Record<string, string[]> = {
    "Santuario de La Salle": ["Santuario", "de La Salle"],
    "USLS Coliseum": ["USLS", "Coliseum"],
    "Universal Bookshop": ["Universal", "Bookshop"],
    "University Chapel": ["University", "Chapel"],
    "Business Office / Clinic": ["Business Office", "& Clinic"],
    "Science & Eng'g Bldg": ["Science &", "Eng'g Bldg"],
    "Balay Kalinungan Ph-2": ["Balay Kalinungan", "Phase 2"],
    "Balay Kalinungan Ph-1": ["Balay Kalinungan", "Phase 1"],
    "Swimming Pool & Stand": ["Swimming Pool", "& Grandstand"],
    "Track & Field Oval": ["Track & Field", "Oval"],
    "HS Covered Court": ["HS Covered", "Court"],
    "Dormitory #1 & #2": ["Dormitory", "1 & 2"],
    "MRF Power House": ["MRF / Power", "House"],
    "Br. Hugh Wester Hall": ["Br. Hugh Wester", "Hall"],
    "Admin Bldg (IS)": ["IS Admin", "Bldg"],
  };

  let lines = customSplits[shortName];
  if (!lines) {
    if (shortName.length > 13 && shortName.includes(" ")) {
      const words = shortName.split(" ");
      if (words.length === 2) {
        lines = words;
      } else if (words.length > 2) {
        const mid = Math.ceil(words.length / 2);
        lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
      } else {
        lines = [shortName];
      }
    } else {
      lines = [shortName];
    }
  }

  // Calculate font size based on building width and longest line
  const maxLineLen = Math.max(...lines.map((l) => l.length));
  let fontSize = 7.5;

  if (maxWidthPx < 45) {
    fontSize = maxLineLen > 8 ? 5.5 : 6.5;
  } else if (maxWidthPx < 65) {
    fontSize = maxLineLen > 12 ? 6 : maxLineLen > 9 ? 6.8 : 7.5;
  } else if (maxWidthPx < 90) {
    fontSize = maxLineLen > 14 ? 6.8 : 7.8;
  } else {
    fontSize = maxLineLen > 15 ? 7.5 : 8.5;
  }

  return { lines, fontSize };
}

export const CampusMap: React.FC<CampusMapProps> = ({
  selectedBuildingId,
  originBuildingId = "user-current-location",
  onSelectBuilding,
  onNavigateTo,
  activeRoute,
  onClearRoute,
  onOpenAiChat,
}) => {
  // Real-time GPS & Compass Sensor Hook
  const geo = useGeolocation();

  // Map viewport states
  const [zoom, setZoom] = useState<number>(1.05);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: -20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch gesture states for mobile pinch-to-zoom and pan
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1);

  // Filter & Layer states
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(true);
  const [showWalkways, setShowWalkways] = useState<boolean>(true);
  const [showTrees, setShowTrees] = useState<boolean>(true);
  const [showBuildingLabels, setShowBuildingLabels] = useState<boolean>(true);
  const [showGatheringPoints, setShowGatheringPoints] = useState<boolean>(true);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showGpsModal, setShowGpsModal] = useState<boolean>(false);
  const [showGpsDebug, setShowGpsDebug] = useState<boolean>(false);
  const [isAutoFollowingGps, setIsAutoFollowingGps] = useState<boolean>(false);
  const [calibrationToast, setCalibrationToast] = useState<string | null>(null);
  const [isDraggingUserPointer, setIsDraggingUserPointer] = useState<boolean>(false);
  const pointerDragMovedRef = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedSignificantlyRef = useRef<boolean>(false);

  // Active building entities
  const selectedBuilding = useMemo(() => {
    return CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId) || null;
  }, [selectedBuildingId]);

  const originBuilding = useMemo(() => {
    return CAMPUS_BUILDINGS.find((b) => b.id === originBuildingId) || CAMPUS_BUILDINGS[0]; // default user-current-location
  }, [originBuildingId]);

  // Current calculated route (ONLY active when navigation is explicitly requested, freeing user pointer when roaming)
  const currentRoute = useMemo(() => {
    if (!activeRoute) return null;
    if (originBuildingId === "user-current-location" && geo.mapCoords && selectedBuilding) {
      return calculateRouteFromGpsLocation(geo.mapCoords.x, geo.mapCoords.y, selectedBuilding.id);
    }
    return activeRoute;
  }, [activeRoute, originBuildingId, geo.mapCoords?.x, geo.mapCoords?.y, selectedBuilding?.id]);

  // Nearest building to current GPS location
  const nearestBuildingToUser = useMemo(() => {
    if (!geo.mapCoords) return CAMPUS_BUILDINGS[1];
    return getClosestBuilding(geo.mapCoords.x, geo.mapCoords.y);
  }, [geo.mapCoords?.x, geo.mapCoords?.y]);

  // Recenter map viewport smoothly on the User's GPS Location
  const handleRecenterOnUser = () => {
    if (geo.mapCoords) {
      const targetPanX = (50 - geo.mapCoords.x) * 7.5;
      const targetPanY = (50 - geo.mapCoords.y) * 7.5;
      setPan({ x: targetPanX, y: targetPanY });
      setZoom(1.35);
      setIsAutoFollowingGps(true);
    } else {
      geo.startTracking();
    }
  };

  // Auto-follow GPS when enabled (with change-guard to prevent state churn)
  useEffect(() => {
    if (!isAutoFollowingGps || !geo.mapCoords) return;
    const targetPanX = (50 - geo.mapCoords.x) * 7.5;
    const targetPanY = (50 - geo.mapCoords.y) * 7.5;
    setPan((prev) => {
      if (Math.abs(prev.x - targetPanX) < 0.1 && Math.abs(prev.y - targetPanY) < 0.1) {
        return prev;
      }
      return { x: targetPanX, y: targetPanY };
    });
  }, [isAutoFollowingGps, geo.mapCoords?.x, geo.mapCoords?.y]);

  // Keyboard walking controls (Arrow keys and WASD for direct 4-directional navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        geo.stepDirection("north", 1.5);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        geo.stepDirection("south", 1.5);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        geo.stepDirection("west", 1.5);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        geo.stepDirection("east", 1.5);
      } else if (e.key === " " && !e.repeat) {
        // Spacebar recenters
        e.preventDefault();
        handleRecenterOnUser();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [geo.stepDirection, handleRecenterOnUser]);

  // Buttery smooth pointer dragging across all touch screens & desktop mice
  useEffect(() => {
    if (!isDraggingUserPointer) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      pointerDragMovedRef.current = true;
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const mapX = Math.max(1, Math.min(99, Number(((clickX / rect.width) * 100).toFixed(2))));
      const mapY = Math.max(1, Math.min(99, Number(((clickY / rect.height) * 100).toFixed(2))));
      geo.setPosition(mapX, mapY);
    };

    const handleWindowPointerUp = () => {
      setIsDraggingUserPointer(false);
      if (pointerDragMovedRef.current && geo.mapCoords) {
        setCalibrationToast(
          `📍 Position calibrated — moves relative to your real walking`
        );
        setTimeout(() => setCalibrationToast(null), 2500);
      }
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [isDraggingUserPointer, geo.setPosition, geo.mapCoords]);

  // Set user GPS location as route starting point
  const handleSetUserAsRouteOrigin = () => {
    if (selectedBuilding) {
      onNavigateTo(selectedBuilding.id, "user-current-location");
      setShowGpsModal(false);
    } else {
      onNavigateTo("santuario-de-la-salle", "user-current-location");
      setShowGpsModal(false);
    }
  };

  // Pan to selected building whenever selected (with change-guard to prevent state churn)
  useEffect(() => {
    if (!selectedBuilding) return;
    const targetPanX = (50 - selectedBuilding.x) * 7.5;
    const targetPanY = (50 - selectedBuilding.y) * 7.5;
    setPan((prev) => {
      if (Math.abs(prev.x - targetPanX) < 0.1 && Math.abs(prev.y - targetPanY) < 0.1) {
        return prev;
      }
      return { x: targetPanX, y: targetPanY };
    });
  }, [selectedBuildingId, selectedBuilding?.x, selectedBuilding?.y]);

  // Handle building click (either set position when calibration mode is active, or select building for navigation)
  const handleBuildingClick = (building: CampusBuilding, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMovedSignificantlyRef.current) return;

    if (geo.isCalibratingPosition || e.shiftKey) {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const mapX = Number(((clickX / rect.width) * 100).toFixed(2));
        const mapY = Number(((clickY / rect.height) * 100).toFixed(2));
        geo.setPosition(mapX, mapY);
      } else {
        geo.setPosition(building.x, building.y);
      }
      setCalibrationToast(`📍 Position set inside ${building.shortName || building.name}`);
      setTimeout(() => setCalibrationToast(null), 3000);
      if (geo.isCalibratingPosition) geo.toggleCalibratingPosition(false);
      return;
    }

    // Normal mode: select building for navigation & details
    onSelectBuilding(building);
  };

  // Handle map click: Default free movement — clicking anywhere moves user pointer with zero pathway locking
  const handleMapSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (hasMovedSignificantlyRef.current) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mapX = Math.max(0, Math.min(100, Number(((clickX / rect.width) * 100).toFixed(2))));
    const mapY = Math.max(0, Math.min(100, Number(((clickY / rect.height) * 100).toFixed(2))));

    geo.setPosition(mapX, mapY);
    if (geo.isCalibratingPosition) {
      geo.toggleCalibratingPosition(false);
    }
  };

  // Double-click anywhere on the map to also freely jump the user pointer
  const handleMapDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mapX = Math.max(0, Math.min(100, Number(((clickX / rect.width) * 100).toFixed(2))));
    const mapY = Math.max(0, Math.min(100, Number(((clickY / rect.height) * 100).toFixed(2))));
    geo.setPosition(mapX, mapY);
  };

  // Pan & Zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isDraggingUserPointer) return;
    setIsAutoFollowingGps(false);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasMovedSignificantlyRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isDraggingUserPointer) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      if (
        Math.hypot(
          e.clientX - dragStartPosRef.current.x,
          e.clientY - dragStartPosRef.current.y
        ) > 18
      ) {
        hasMovedSignificantlyRef.current = true;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Handlers (Single finger drag, 2-finger pinch to zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDraggingUserPointer) return;
    setIsAutoFollowingGps(false);
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
      dragStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      hasMovedSignificantlyRef.current = false;
      setTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
      setTouchStartZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && !isDraggingUserPointer) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
      if (
        Math.hypot(
          e.touches[0].clientX - dragStartPosRef.current.x,
          e.touches[0].clientY - dragStartPosRef.current.y
        ) > 14
      ) {
        hasMovedSignificantlyRef.current = true;
      }
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = newDist / touchDistance;
      const nextZoom = Math.min(Math.max(touchStartZoom * scaleFactor, 0.5), 3.5);
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.6), 3.2));
  };

  const handleResetView = () => {
    setZoom(1.05);
    setPan({ x: 0, y: -20 });
  };

  // Filtered buildings for search & category
  const filteredBuildings = useMemo(() => {
    return CAMPUS_BUILDINGS.filter((b) => {
      const matchCat = activeCategory === "all" || b.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.departments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.popularFor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Extract unique walkway lines from graph nodes for accurate SVG rendering
  const walkwayEdges = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = [];
    const seen = new Set<string>();

    for (const [nodeId, node] of Object.entries(CAMPUS_GRAPH_NODES)) {
      for (const neighborId of node.neighbors) {
        const neighbor = CAMPUS_GRAPH_NODES[neighborId];
        if (!neighbor) continue;

        const key = [nodeId, neighborId].sort().join("---");
        if (!seen.has(key)) {
          seen.add(key);
          lines.push({
            id: key,
            x1: node.x * 10,
            y1: node.y * 10,
            x2: neighbor.x * 10,
            y2: neighbor.y * 10,
          });
        }
      }
    }
    return lines;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#EBF7F0] overflow-hidden select-none flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* ========================================================================= */}
      {/* 🧭 FLOATING TOP CONTROLS & HUD (Mobile-Optimized & Touch Friendly)         */}
      {/* ========================================================================= */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Search & Status Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Quick Search & Desktop Filter Pills */}
          <div className="flex items-center gap-1.5 pointer-events-auto min-w-0">
            {/* Desktop Search Bar */}
            <div className="hidden sm:flex relative items-center shadow-sm">
              <Search className="absolute left-3 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search halls, offices, gates..."
                className="pl-9 pr-8 py-2 text-xs bg-white/95 border border-emerald-200 backdrop-blur-md rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-md w-52 md:w-64 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-white/95 border border-emerald-200 backdrop-blur-md rounded-2xl text-slate-800 text-xs font-bold shadow-md active:scale-95 transition-transform shrink-0"
            >
              <Search className="h-4 w-4 text-emerald-600" />
              <span className="text-[11px]">Search</span>
            </button>

            {/* Desktop Category Filter Pills (Integrated on sm+ screens) */}
            <div className="hidden sm:flex items-center gap-1 bg-white/95 border border-emerald-100 backdrop-blur-md rounded-2xl p-1 shadow-md text-xs">
              {[
                { id: "all", label: "All", icon: Compass },
                { id: "academic", label: "Colleges", icon: GraduationCap },
                { id: "religious", label: "Sanctuary", icon: Church },
                { id: "admin", label: "Admin", icon: Building2 },
                { id: "sports", label: "Sports", icon: Trophy },
                { id: "gates", label: "Gates", icon: DoorOpen },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-all shrink-0 active:scale-95 ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Location & Direction Calibration Status Pill */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button
              onClick={() => setShowGpsModal(true)}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white/95 border border-emerald-300 text-slate-800 hover:bg-emerald-50 shadow-md backdrop-blur-md flex items-center gap-1.5 text-[11px] sm:text-xs font-bold transition-all active:scale-95"
              title="Open Campus Position & Calibration Tools"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span className="max-w-[100px] sm:max-w-[180px] truncate text-emerald-950">
                {geo.nearestBuildingName}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                  geo.isManualMode
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {geo.isManualMode ? "Calibrated (Live)" : "Live GPS"}
              </span>
            </button>

            {/* GPS Debug Toggle Button */}
            <button
              onClick={() => setShowGpsDebug((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-2xl border shadow-md backdrop-blur-md flex items-center gap-1.5 text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                showGpsDebug
                  ? "bg-slate-900 text-emerald-400 border-emerald-400 ring-2 ring-emerald-400/40"
                  : "bg-white/95 text-slate-700 border-slate-200 hover:bg-emerald-50"
              }`}
              title="Toggle Live GPS & Coordinate Debug Panel"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">GPS Debug</span>
            </button>
          </div>
        </div>

        {/* Row 2: Mobile Dedicated Category Filter Bar (Full width, spacious, smooth horizontal swipe) */}
        <div className="sm:hidden pointer-events-auto w-full overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1 touch-pan-x">
          <div className="flex items-center gap-1.5 min-w-max bg-white/95 border border-emerald-200/80 backdrop-blur-md rounded-2xl p-1.5 shadow-md">
            {[
              { id: "all", label: "All Facilities", icon: Compass },
              { id: "academic", label: "Colleges", icon: GraduationCap },
              { id: "religious", label: "Sanctuary", icon: Church },
              { id: "admin", label: "Admin", icon: Building2 },
              { id: "sports", label: "Sports", icon: Trophy },
              { id: "gates", label: "Gates", icon: DoorOpen },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-50/90 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Route Dismiss Pill */}
      {activeRoute && onClearRoute && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-emerald-900/95 border-2 border-emerald-400 text-white px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Navigation className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
          <span className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs">
            To: {activeRoute.destination.shortName} (~{activeRoute.distanceMeters}m)
          </span>
          <button
            onClick={onClearRoute}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            title="Clear route"
          >
            <X className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 INTERACTIVE PIN PROMPT & TOAST NOTIFICATION                            */}
      {/* ========================================================================= */}
      {geo.isCalibratingPosition && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-emerald-900/95 border-2 border-emerald-400 text-white px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Crosshair className="h-4 w-4 text-emerald-300 animate-spin" />
          <span className="text-xs font-extrabold">Tap anywhere on the map or inside a building to set your avatar position!</span>
          <button
            onClick={() => geo.toggleCalibratingPosition(false)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {calibrationToast && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-slate-900/95 border border-emerald-400 text-emerald-300 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{calibrationToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 REAL-TIME GPS POSITIONING DEBUG PANEL                                 */}
      {/* ========================================================================= */}
      {showGpsDebug && (
        <div className="absolute top-16 left-3 sm:left-4 z-40 bg-slate-950/95 text-slate-100 p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md text-xs font-mono max-w-sm w-full animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-emerald-400 font-sans text-xs">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>GPS Positioning System Debug</span>
            </div>
            <button
              onClick={() => setShowGpsDebug(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">GPS Latitude</span>
              <span className="text-emerald-300 font-bold">{geo.debugInfo.latitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">GPS Longitude</span>
              <span className="text-emerald-300 font-bold">{geo.debugInfo.longitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">GPS Accuracy</span>
              <span className="text-amber-300 font-bold">&plusmn;{geo.debugInfo.accuracy.toFixed(1)} meters</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Meters East / West</span>
              <span className="text-cyan-300 font-bold">
                {geo.debugInfo.metersEast > 0 ? "+" : ""}{geo.debugInfo.metersEast} m
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Meters North / South</span>
              <span className="text-cyan-300 font-bold">
                {geo.debugInfo.metersNorth > 0 ? "+" : ""}{geo.debugInfo.metersNorth} m
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Calculated SVG (X, Y)</span>
              <span className="text-indigo-300 font-bold">({geo.debugInfo.svgX}, {geo.debugInfo.svgY})</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Map Position %</span>
              <span className="text-white font-bold">({geo.debugInfo.x}%, {geo.debugInfo.y}%)</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400">Positioning Mode</span>
              <span
                className={`px-2 py-0.5 rounded font-sans font-bold text-[10px] ${
                  geo.isManualMode
                    ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {geo.isManualMode ? "Manual Free Move" : "Live GPS Tracking"}
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex gap-2">
            {geo.isManualMode ? (
              <button
                onClick={() => geo.resetToLiveGps()}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Radio className="h-3.5 w-3.5" />
                Resume Live GPS
              </button>
            ) : (
              <button
                onClick={() => geo.startTracking()}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
              >
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Tracking Active
              </button>
            )}
            <button
              onClick={() => {
                const text = JSON.stringify(geo.debugInfo, null, 2);
                navigator.clipboard.writeText(text);
                setCalibrationToast("Debug data copied to clipboard!");
                setTimeout(() => setCalibrationToast(null), 2000);
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-sans font-bold text-xs transition-all border border-slate-700 active:scale-95"
              title="Copy JSON debug coordinates"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧭 FLOATING ACTION BUTTONS (FAB STACK ON RIGHT)                             */}
      {/* ========================================================================= */}
      <div className="absolute top-16 sm:top-20 right-2.5 sm:right-3.5 z-20 pointer-events-auto flex flex-col items-center gap-2">
        {/* Campus Position Calibration & Tools FAB */}
        <button
          onClick={() => setShowGpsModal(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/95 border border-emerald-300 shadow-xl backdrop-blur-md flex items-center justify-center group hover:bg-emerald-50 active:scale-95 transition-all text-emerald-900"
          title="Position & Walking Calibration Tools"
        >
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700" />
        </button>

        {/* Pin Location Mode Toggle (Tap anywhere on map) */}
        <button
          onClick={() => geo.toggleCalibratingPosition()}
          className={`p-2.5 sm:p-3 rounded-2xl shadow-xl transition-all flex items-center justify-center active:scale-95 ${
            geo.isCalibratingPosition
              ? "bg-emerald-600 ring-4 ring-emerald-300 text-white animate-bounce"
              : "bg-white/95 text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
          }`}
          title={geo.isCalibratingPosition ? "Active: Click anywhere on map" : "Tap on map to pin position"}
        >
          <Crosshair className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Recenter / Auto-Follow View on Me (GPS) */}
        <button
          onClick={handleRecenterOnUser}
          className={`p-2.5 sm:p-3 rounded-2xl text-white shadow-xl transition-all flex items-center justify-center active:scale-95 ${
            isAutoFollowingGps
              ? "bg-blue-600 ring-2 ring-blue-400 ring-offset-2"
              : "bg-blue-600/90 hover:bg-blue-700"
          }`}
          title={isAutoFollowingGps ? "Auto-following GPS (Click to Re-lock)" : "Recenter Map on My Location"}
        >
          <Locate className={`h-4 w-4 sm:h-5 sm:w-5 ${isAutoFollowingGps ? "animate-pulse" : ""}`} />
        </button>

        {/* Zoom In Button */}
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3.2))}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-emerald-200 shadow-md backdrop-blur-md transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.6))}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-emerald-200 shadow-md backdrop-blur-md transition-all active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-emerald-200 shadow-md backdrop-blur-md transition-all active:scale-95"
          title="Reset Map View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Map Layers Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className={`p-2 sm:p-2.5 rounded-2xl border shadow-md transition-all active:scale-95 ${
              showLayersMenu
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white/95 text-slate-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
            title="Toggle Map Layers"
          >
            <Layers className="h-4 w-4" />
          </button>

          {showLayersMenu && (
            <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-30 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-1">
                Map Layers
              </div>
              <label className="flex items-center justify-between cursor-pointer hover:text-emerald-800 font-medium">
                <span>Paved Walkways</span>
                <input
                  type="checkbox"
                  checked={showWalkways}
                  onChange={(e) => setShowWalkways(e.target.checked)}
                  className="accent-emerald-600 rounded h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:text-emerald-800 font-medium">
                <span>Gathering Points</span>
                <input
                  type="checkbox"
                  checked={showGatheringPoints}
                  onChange={(e) => setShowGatheringPoints(e.target.checked)}
                  className="accent-emerald-600 rounded h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:text-emerald-800 font-medium">
                <span>Landscape &amp; Trees</span>
                <input
                  type="checkbox"
                  checked={showTrees}
                  onChange={(e) => setShowTrees(e.target.checked)}
                  className="accent-emerald-600 rounded h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:text-emerald-800 font-medium">
                <span>Building Labels</span>
                <input
                  type="checkbox"
                  checked={showBuildingLabels}
                  onChange={(e) => setShowBuildingLabels(e.target.checked)}
                  className="accent-emerald-600 rounded h-4 w-4"
                />
              </label>
            </div>
          )}
        </div>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`p-2 sm:p-2.5 rounded-2xl border shadow-md transition-all active:scale-95 ${
            showLegend
              ? "bg-emerald-700 text-white border-emerald-700"
              : "bg-white/95 text-slate-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
          title="Toggle Map Legend"
        >
          <Info className="h-4 w-4" />
        </button>

        {/* GPS Simulator Toggle Button */}
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className={`p-2 sm:p-2.5 rounded-2xl border shadow-md transition-all active:scale-95 ${
            showSimulator
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white/95 text-slate-700 border-emerald-200 hover:bg-blue-50 hover:text-blue-800"
          }`}
          title="Toggle GPS Walk Simulator"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🗺️ INTERACTIVE VECTOR SVG MAP CANVAS (White & Green Theme)               */}
      {/* ========================================================================= */}
      <div
        className="transition-transform duration-75 ease-out relative"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          onClick={handleMapSvgClick}
          onDoubleClick={handleMapDoubleClick}
          className={`w-[720px] h-[720px] sm:w-[880px] sm:h-[880px] lg:w-[1000px] lg:h-[1000px] rounded-3xl shadow-2xl border-4 border-white bg-[#E3F4EA] overflow-visible ${
            geo.isCalibratingPosition ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {/* SVG Definitions */}
          <defs>
            {/* Light Campus Lawn Grass Texture */}
            <pattern id="light-turf" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="#E2F5E9" />
              <circle cx="7" cy="7" r="1.5" fill="#D3EEDD" />
              <circle cx="21" cy="21" r="1.5" fill="#D3EEDD" />
            </pattern>

            {/* Direction Arrow Marker */}
            <marker
              id="route-arrow"
              viewBox="0 0 12 12"
              refX="8"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 11 6 L 1 11 z" fill="#059669" />
            </marker>

            {/* Vibrant GPS User Beacon Radial Core */}
            <radialGradient id="user-beacon-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </radialGradient>
          </defs>

          {/* ========================================================================= */}
          {/* 🌿 LAYER 1: BASE TERRAIN & SURROUNDING ROADS                              */}
          {/* ========================================================================= */}
          <g id="campus-terrain">
            {/* Campus Outer Property Boundary */}
            <rect x="0" y="0" width="1000" height="1000" fill="url(#light-turf)" rx="24" />

            {/* Angled Perimeter Roads Matching Map Outline */}
            {/* Top-West Perimeter Road (near Gate 1 & 2) */}
            <path
              d="M 20 220 L 180 140 L 400 110 L 520 100"
              stroke="#CBD5E1"
              strokeWidth="38"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 20 220 L 180 140 L 400 110 L 520 100"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="14 10"
              fill="none"
            />

            {/* Top-East Perimeter Road (near Gate 3, 4, 5, 6) */}
            <path
              d="M 500 100 L 700 160 L 880 240 L 980 320"
              stroke="#CBD5E1"
              strokeWidth="38"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 500 100 L 700 160 L 880 240 L 980 320"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="14 10"
              fill="none"
            />

            {/* South-East Perimeter Road (near Gate 7 & 8) */}
            <path
              d="M 980 620 L 700 680 L 580 860 L 500 960"
              stroke="#CBD5E1"
              strokeWidth="38"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 980 620 L 700 680 L 580 860 L 500 960"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="14 10"
              fill="none"
            />

            {/* South-West Perimeter Road (near Gate 9) */}
            <path
              d="M 50 780 L 180 720 L 260 720"
              stroke="#CBD5E1"
              strokeWidth="34"
              strokeLinecap="round"
              fill="none"
            />

            {/* Campus Property Boundary Line */}
            <polygon
              points="100,160 480,90 920,260 920,580 620,880 440,900 100,680"
              fill="#D4F0E0"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.6"
            />
          </g>

          {/* ========================================================================= */}
          {/* 🏟️ LAYER 2: SPORTS FIELDS, TRACK OVAL & WATER POOL                        */}
          {/* ========================================================================= */}
          <g id="athletic-facilities">
            {/* 400m Red Synthetic Track & Field Oval (Gathering Point A) */}
            <g transform="translate(680, 430)">
              {/* Red/Maroon All-Weather Running Track */}
              <ellipse cx="0" cy="0" rx="98" ry="76" fill="#BE123C" stroke="#9F1239" strokeWidth="4" />
              {/* White lane line stripes */}
              <ellipse cx="0" cy="0" rx="88" ry="66" fill="none" stroke="#FFE4E6" strokeWidth="1" strokeDasharray="6 4" />
              <ellipse cx="0" cy="0" rx="78" ry="56" fill="none" stroke="#FFE4E6" strokeWidth="1" strokeDasharray="6 4" />
              {/* Inner Green Grass Football Field */}
              <ellipse cx="0" cy="0" rx="68" ry="46" fill="#16A34A" stroke="#22C55E" strokeWidth="2" />
              {/* Center Line & Field Details */}
              <line x1="0" y1="-46" x2="0" y2="46" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="16" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>

            {/* Olympic Swimming Pool Complex */}
            <g transform="translate(630, 340)">
              <rect x="-42" y="-28" width="84" height="56" rx="6" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
              <rect x="-38" y="-24" width="76" height="48" rx="4" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5" />
              {/* Pool Lanes */}
              {[-15, -5, 5, 15].map((ly) => (
                <line key={ly} x1="-34" y1={ly} x2="34" y2={ly} stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 3" />
              ))}
            </g>

            {/* Covered Court & Open Court */}
            <g transform="translate(540, 390)">
              <rect x="-28" y="-28" width="56" height="56" rx="6" fill="#059669" stroke="#047857" strokeWidth="2" />
              <line x1="-28" y1="0" x2="28" y2="0" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="0" cy="0" r="8" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </g>

            {/* Tennis Court */}
            <g transform="translate(540, 330)">
              <rect x="-24" y="-18" width="48" height="36" rx="4" fill="#0D9488" stroke="#0F766E" strokeWidth="1.5" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFFFF" strokeWidth="1" />
              <rect x="-18" y="-12" width="36" height="24" fill="none" stroke="#FFFFFF" strokeWidth="0.75" />
            </g>

            {/* High School Covered Court */}
            <g transform="translate(840, 360)">
              <rect x="-28" y="-22" width="56" height="44" rx="6" fill="#059669" stroke="#047857" strokeWidth="2" />
              <circle cx="0" cy="0" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </g>

            {/* Integrated School Botanical Garden */}
            <g transform="translate(580, 210)">
              <rect x="-22" y="-16" width="44" height="32" rx="8" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
              <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                IS GARDEN
              </text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 🚶 LAYER 3: OFFICIAL RESTRUCTURED WALKWAY NETWORK                         */}
          {/* ========================================================================= */}
          {showWalkways && (
            <g id="campus-walkway-network">
              {/* Outer Walkway Pavers Border */}
              {walkwayEdges.map((edge) => (
                <line
                  key={`walkway-border-${edge.id}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#D97706"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.35}
                />
              ))}

              {/* Inner Clean Paved Walkway Body */}
              {walkwayEdges.map((edge) => (
                <line
                  key={`walkway-inner-${edge.id}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#FEF3C7"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.95}
                />
              ))}

              {/* Walkway Center Guide Stripe */}
              {walkwayEdges.map((edge) => (
                <line
                  key={`walkway-center-${edge.id}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              ))}

              {/* Central Plaza Roundabout (Hub at 380, 240) */}
              <g transform="translate(380, 240)">
                <circle cx="0" cy="0" r="26" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
                <circle cx="0" cy="0" r="20" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="0" cy="0" r="14" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
                {/* Roundabout icon / Gathering point B */}
                <circle cx="-4" cy="-3" r="2.5" fill="#FFFFFF" />
                <circle cx="4" cy="-3" r="2.5" fill="#FFFFFF" />
                <circle cx="0" cy="2" r="3" fill="#FFFFFF" />
              </g>

              {/* Node Junction Hub Dots */}
              {Object.values(CAMPUS_GRAPH_NODES).map((node) => (
                <circle
                  key={`node-hub-${node.id}`}
                  cx={node.x * 10}
                  cy={node.y * 10}
                  r="4"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}

          {/* ========================================================================= */}
          {/* 🌲 LAYER 4: TREES & LANDSCAPE SHADING (Lush Emerald Canopy)               */}
          {/* ========================================================================= */}
          {showTrees && (
            <g id="campus-trees">
              {[
                { x: 280, y: 190 },
                { x: 300, y: 220 },
                { x: 230, y: 270 },
                { x: 270, y: 280 },
                { x: 420, y: 160 },
                { x: 460, y: 170 },
                { x: 490, y: 210 },
                { x: 620, y: 180 },
                { x: 660, y: 180 },
                { x: 740, y: 200 },
                { x: 800, y: 240 },
                { x: 870, y: 280 },
                { x: 360, y: 290 },
                { x: 420, y: 290 },
                { x: 500, y: 290 },
                { x: 580, y: 300 },
                { x: 280, y: 430 },
                { x: 300, y: 470 },
                { x: 360, y: 520 },
                { x: 400, y: 520 },
                { x: 420, y: 480 },
                { x: 500, y: 500 },
                { x: 500, y: 550 },
                { x: 580, y: 580 },
                { x: 640, y: 600 },
                { x: 300, y: 620 },
                { x: 340, y: 640 },
                { x: 400, y: 720 },
                { x: 440, y: 740 },
                { x: 520, y: 730 },
                { x: 620, y: 760 },
                { x: 660, y: 780 },
                { x: 420, y: 860 },
                { x: 460, y: 880 },
                { x: 520, y: 860 },
              ].map((tree, idx) => (
                <g key={`tree-${idx}`} transform={`translate(${tree.x}, ${tree.y})`}>
                  <circle cx="0" cy="0" r="9" fill="#047857" opacity={0.6} />
                  <circle cx="-2" cy="-2" r="6.5" fill="#10B981" opacity={0.9} />
                  <circle cx="2" cy="-2" r="4.5" fill="#34D399" opacity={0.8} />
                </g>
              ))}
            </g>
          )}

          {/* ========================================================================= */}
          {/* 📍 LAYER 5: EMERGENCY GATHERING POINTS (A, B, C)                          */}
          {/* ========================================================================= */}
          {showGatheringPoints && (
            <g id="gathering-points">
              {/* Gathering Point A (Track Oval Pitch) */}
              <g transform="translate(670, 440)">
                <circle cx="0" cy="0" r="13" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  A
                </text>
                <text x="0" y="22" textAnchor="middle" fill="#991B1B" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                  GATHERING PT A
                </text>
              </g>

              {/* Gathering Point B (Central Academic Plaza) */}
              <g transform="translate(390, 260)">
                <circle cx="0" cy="0" r="12" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  B
                </text>
                <text x="0" y="20" textAnchor="middle" fill="#991B1B" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                  GATHERING PT B
                </text>
              </g>

              {/* Gathering Point C (Gate 2 Entrance) */}
              <g transform="translate(380, 170)">
                <circle cx="0" cy="0" r="11" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
                  C
                </text>
                <text x="0" y="-15" textAnchor="middle" fill="#991B1B" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                  GATHERING PT C
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 🏛️ LAYER 6: CAMPUS BUILDINGS & LANDMARK GEOMETRIES                        */}
          {/* ========================================================================= */}
          <g id="campus-buildings">
            {CAMPUS_BUILDINGS.map((building) => {
              const cx = building.x * 10;
              const cy = building.y * 10;
              const w = building.width * 10;
              const h = building.height * 10;
              const isSelected = selectedBuildingId === building.id;
              const isOrigin = originBuildingId === building.id;
              const isSantuario = building.id === "santuario-de-la-salle";
              const isGate2 = building.id === "gate-2";
              const isDimmed =
                filteredBuildings.length < CAMPUS_BUILDINGS.length &&
                !filteredBuildings.some((fb) => fb.id === building.id);

              const { lines, fontSize } = getBuildingLabelLines(building.shortName, w);
              const lineSpacing = fontSize * 1.15;
              const totalTextHeight = (lines.length - 1) * lineSpacing;
              const startTextY = cy - totalTextHeight / 2;

              // Building base fill color
              const fillColor = isSelected
                ? "#047857"
                : isOrigin
                ? "#1D4ED8"
                : isSantuario
                ? "#B91C1C"
                : building.category === "admin"
                ? "#065F46"
                : building.category === "academic"
                ? "#047857"
                : building.category === "sports"
                ? "#1E40AF"
                : building.category === "religious"
                ? "#7E22CE"
                : building.category === "gates"
                ? "#334155"
                : "#0F766E";

              const strokeColor = isSelected
                ? "#34D399"
                : isOrigin
                ? "#93C5FD"
                : isSantuario
                ? "#FCA5A5"
                : "#FFFFFF";

              return (
                <g
                  key={building.id}
                  id={`bldg-group-${building.id}`}
                  onClick={(e) => handleBuildingClick(building, e)}
                  className={`cursor-pointer transition-opacity duration-150 ${
                    isDimmed ? "opacity-35" : "opacity-100"
                  }`}
                >
                  {/* Building Base Shape - Crisp defined architectural footprint */}
                  {building.shape === "oval" ? (
                    <>
                      {/* Flat vector drop shadow offset down by 2.5px without raster blur */}
                      <ellipse
                        cx={cx}
                        cy={cy + 2.5}
                        rx={w / 2}
                        ry={h / 2}
                        fill="rgba(6, 78, 59, 0.16)"
                      />
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={w / 2}
                        ry={h / 2}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-colors duration-150 hover:brightness-110"
                      />
                    </>
                  ) : (
                    <>
                      {/* Flat vector drop shadow offset down by 2.5px without raster blur */}
                      <rect
                        x={cx - w / 2}
                        y={cy - h / 2 + 2.5}
                        width={w}
                        height={h}
                        rx={Math.min(4, Math.max(2, Math.min(w, h) / 6))}
                        fill="rgba(6, 78, 59, 0.16)"
                      />
                      <rect
                        x={cx - w / 2}
                        y={cy - h / 2}
                        width={w}
                        height={h}
                        rx={Math.min(4, Math.max(2, Math.min(w, h) / 6))}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-colors duration-150 hover:brightness-110"
                      />
                    </>
                  )}

                  {/* Building Name Label - INSIDE THE SHAPE */}
                  {showBuildingLabels && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize={fontSize}
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {lines.map((line, idx) => (
                        <tspan
                          key={idx}
                          x={cx}
                          y={startTextY + idx * lineSpacing}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )}

                  {/* Subtle Top Indicator Pin for Active Gate 2 (Start) */}
                  {isGate2 && (
                    <g transform={`translate(${cx}, ${cy - h / 2 - 10})`}>
                      <rect x="-24" y="-8" width="48" height="15" rx="4" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1" />
                      <text x="0" y="2.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
                        GATE 2
                      </text>
                    </g>
                  )}

                  {/* Subtle Top Indicator Pin for Santuario (Destination) */}
                  {isSantuario && (
                    <g transform={`translate(${cx}, ${cy - h / 2 - 10})`}>
                      <rect x="-30" y="-8" width="60" height="15" rx="4" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                      <text x="0" y="2.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
                        VENUE
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* 📍 LAYER 7: ACTIVE ROUTE PATH (HIGH-VISIBILITY NAVIGATION OVERLAY)         */}
          {/* ========================================================================= */}
          {currentRoute && currentRoute.pathWaypoints && currentRoute.pathWaypoints.length > 1 && (
            <g id="active-navigation-route">
              {/* Outer glowing path aura */}
              <polyline
                points={currentRoute.pathWaypoints
                  .map((pt) => `${pt.x * 10},${pt.y * 10}`)
                  .join(" ")}
                fill="none"
                stroke="#047857"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.35}
              />

              {/* Main vibrant navigation route line */}
              <polyline
                points={currentRoute.pathWaypoints
                  .map((pt) => `${pt.x * 10},${pt.y * 10}`)
                  .join(" ")}
                fill="none"
                stroke="#059669"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#route-arrow)"
              />

              {/* Inner animated white dashed trail */}
              <polyline
                points={currentRoute.pathWaypoints
                  .map((pt) => `${pt.x * 10},${pt.y * 10}`)
                  .join(" ")}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 6"
              />

              {/* Waypoint Connection Dots */}
              {currentRoute.pathWaypoints.map((pt, idx) => (
                <circle
                  key={`wpt-${idx}`}
                  cx={pt.x * 10}
                  cy={pt.y * 10}
                  r={idx === 0 || idx === currentRoute.pathWaypoints.length - 1 ? 6 : 3.5}
                  fill={
                    idx === 0
                      ? "#2563EB"
                      : idx === currentRoute.pathWaypoints.length - 1
                      ? "#DC2626"
                      : "#059669"
                  }
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}

              {/* Origin Marker Badge */}
              <g transform={`translate(${currentRoute.origin.x * 10}, ${currentRoute.origin.y * 10 - 18})`}>
                <rect x="-26" y="-9" width="52" height="16" rx="4" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.2" />
                <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                  START
                </text>
              </g>

              {/* Destination Marker Badge */}
              <g transform={`translate(${currentRoute.destination.x * 10}, ${currentRoute.destination.y * 10 - 18})`}>
                <rect x="-34" y="-9" width="68" height="16" rx="4" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.2" />
                <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                  DESTINATION
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 📍 LAYER 8: REAL USER GPS TRACKER & ORIENTATION COMPASS POINTER           */}
          {/* ========================================================================= */}
          {geo.mapCoords && (
            <g
              id="user-real-gps-pointer"
              transform={`translate(${geo.mapCoords.svgX}, ${geo.mapCoords.svgY})`}
              className={`pointer-events-auto select-none ${
                isDraggingUserPointer
                  ? "cursor-grabbing transition-none"
                  : "cursor-grab transition-transform duration-150 ease-out hover:scale-105"
              }`}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDragging(false);
                setIsDraggingUserPointer(true);
                pointerDragMovedRef.current = false;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!pointerDragMovedRef.current) {
                  setShowGpsModal(true);
                }
              }}
            >
              {/* 1. Dynamic GPS Accuracy Ring */}
              <circle
                cx="0"
                cy="0"
                r={geo.mapCoords.accuracyMapRadius}
                fill="#3B82F6"
                fillOpacity="0.12"
                stroke="#2563EB"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <circle
                cx="0"
                cy="0"
                r={Math.min(geo.mapCoords.accuracyMapRadius, 20)}
                fill="#60A5FA"
                fillOpacity="0.25"
                className="animate-ping"
              />

              {/* 2. High-Contrast Outer Beacon Circle */}
              {/* Vector shadow base */}
              <circle
                cx="0"
                cy="2"
                r="13"
                fill="rgba(30, 64, 175, 0.2)"
              />
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="#FFFFFF"
                stroke="#1E40AF"
                strokeWidth="2.5"
              />

              {/* 3. Vibrant Blue Core */}
              <circle
                cx="0"
                cy="0"
                r="9.5"
                fill="url(#user-beacon-grad)"
              />

              {/* 4. Center Pinpoint Dot */}
              <circle cx="0" cy="0" r="2" fill="#FFFFFF" />

              {/* 5. 'YOU' Marker Pill Badge */}
              <g transform="translate(0, -20)">
                {/* Vector shadow base */}
                <rect
                  x="-16"
                  y="-6"
                  width="32"
                  height="15"
                  rx="4"
                  fill="rgba(30, 64, 175, 0.2)"
                />
                <rect
                  x="-16"
                  y="-8"
                  width="32"
                  height="15"
                  rx="4"
                  fill="#1E40AF"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  YOU
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 🕹️ GPS SIMULATION / STEPPING D-PAD (Only visible when toggled)             */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 🕹️ CAMPUS WALKING & GPS CONTROLLER HUD                                    */}
      {/* ========================================================================= */}
      {showSimulator ? (
        <div className="absolute bottom-4 left-4 z-25 pointer-events-auto flex flex-col gap-2 bg-white/98 border border-emerald-200 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 max-w-xs">
          <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    geo.isManualMode ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    geo.isManualMode ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="text-[11px] font-bold text-emerald-950">
                {geo.isManualMode ? "Manual Position" : "Live GPS Tracking"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {geo.isManualMode ? (
                <button
                  onClick={() => geo.resetToLiveGps()}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                  title="Resume real-time device hardware GPS lock"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>Live GPS</span>
                </button>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ±{(geo.accuracy ?? 5).toFixed(0)}m
                </span>
              )}
              <button
                onClick={() => setShowSimulator(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
                title="Minimize controller"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Directional Step Controls (North, West, East, South) */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <button
              onClick={(e) => {
                if (e) e.stopPropagation();
                geo.stepDirection("north", 1.5);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-[11px] shadow-xs"
              title="Step North (W / Up Arrow)"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>North</span>
            </button>

            <div className="flex items-center gap-1.5 justify-center">
              <button
                onClick={(e) => {
                  if (e) e.stopPropagation();
                  geo.stepDirection("west", 1.5);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-[11px] shadow-xs"
                title="Step West (A / Left Arrow)"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>West</span>
              </button>

              <button
                onClick={(e) => {
                  if (e) e.stopPropagation();
                  handleRecenterOnUser();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-[11px] shadow-xs"
                title="Center on Position (Spacebar)"
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span>Center</span>
              </button>

              <button
                onClick={(e) => {
                  if (e) e.stopPropagation();
                  geo.stepDirection("east", 1.5);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-[11px] shadow-xs"
                title="Step East (D / Right Arrow)"
              >
                <span>East</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={(e) => {
                if (e) e.stopPropagation();
                geo.stepDirection("south", 1.5);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-[11px] shadow-xs"
              title="Step South (S / Down Arrow)"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>South</span>
            </button>
          </div>

          {/* Walking Speed Modifier / Sensitivity Pill */}
          <div className="flex items-center justify-between px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px]">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sliders className="h-3 w-3 text-emerald-700" />
              <span>Speed:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  geo.setScaleMultiplier(Math.max(0.5, Number((geo.scaleMultiplier - 0.5).toFixed(2))));
                }}
                className="h-5 w-5 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-700 active:scale-95 transition-all text-[11px]"
                title="Decrease walking speed (-0.5x)"
              >
                -
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGpsModal(true);
                }}
                className="font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200 transition-all"
                title="Click to open calibration modal with slider (up to 5x)"
              >
                {geo.scaleMultiplier.toFixed(1)}x
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  geo.setScaleMultiplier(Math.min(5.0, Number((geo.scaleMultiplier + 0.5).toFixed(2))));
                }}
                className="h-5 w-5 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-700 active:scale-95 transition-all text-[11px]"
                title="Increase walking speed (+0.5x)"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-600 pt-0.5 border-t border-slate-100">
            <span>Keys: <kbd className="px-1 py-0.2 bg-slate-100 rounded text-slate-700 border">WASD</kbd> or <kbd className="px-1 py-0.2 bg-slate-100 rounded text-slate-700 border">Arrows</kbd></span>
            <span>Drag avatar or click anywhere</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSimulator(true)}
          className="absolute bottom-4 left-4 z-25 pointer-events-auto flex items-center gap-1.5 px-3 py-2 bg-white/95 border border-emerald-200 hover:border-emerald-400 text-emerald-950 rounded-2xl shadow-lg backdrop-blur-md text-xs font-bold transition-all active:scale-95"
        >
          <Footprints className="h-3.5 w-3.5 text-emerald-700" />
          <span>Walk Controls</span>
          <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
            {geo.scaleMultiplier.toFixed(1)}x
          </span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* 🧭 BOTTOM-LEFT MAP LEGEND POPUP                                           */}
      {/* ========================================================================= */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-white/98 border border-emerald-200 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl text-slate-700 text-xs w-64 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-emerald-900">
            <span>Map Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-emerald-700 shrink-0" />
              <span>Colleges &amp; Academic Halls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-red-600 shrink-0" />
              <span>Santuario de La Salle (Venue)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-teal-800 shrink-0" />
              <span>Administration &amp; Offices</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-blue-700 shrink-0" />
              <span>Sports &amp; Athletics Arena</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-amber-400 shrink-0" />
              <span>Paved Covered Walkways</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold shrink-0">
                ●
              </span>
              <span>Your Live GPS Location &amp; Compass</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-bold shrink-0">
                A
              </span>
              <span>Emergency Gathering Points</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 QUICK SEARCH MODAL (For Fast Mobile Building Lookup)                   */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-12 pointer-events-auto">
          <div className="bg-white border border-emerald-200 rounded-3xl shadow-2xl w-full max-w-md p-4 text-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">Find Campus Building</h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college, library, gym, gates..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Category Filter Pills inside Search Modal */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 touch-pan-x">
              {[
                { id: "all", label: "All", icon: Compass },
                { id: "academic", label: "Colleges", icon: GraduationCap },
                { id: "religious", label: "Sanctuary", icon: Church },
                { id: "admin", label: "Admin", icon: Building2 },
                { id: "sports", label: "Sports", icon: Trophy },
                { id: "gates", label: "Gates", icon: DoorOpen },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="overflow-y-auto flex-1 space-y-1.5 divide-y divide-slate-100 pr-1">
              {filteredBuildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBuilding(b);
                    setShowSearchModal(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: b.color || "#047857" }}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{b.popularFor}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧭 LOCATION & DIRECTION MANUAL ADJUSTMENT / GPS MODAL                     */}
      {/* ========================================================================= */}
      {showGpsModal && (
        <ManualAdjustmentModal
          geo={geo}
          onClose={() => setShowGpsModal(false)}
          onRecenterOnUser={handleRecenterOnUser}
          onSetUserAsRouteOrigin={handleSetUserAsRouteOrigin}
          selectedBuilding={selectedBuilding}
        />
      )}

      {/* ========================================================================= */}
      {/* 📋 SELECTED BUILDING / ROUTE BOTTOM SHEET (Mobile & Desktop Responsive)    */}
      {/* ========================================================================= */}
      {selectedBuilding && (
        <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[400px] z-25 pointer-events-auto bg-white/98 border border-emerald-200/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl shadow-2xl text-slate-800 flex flex-col gap-2.5 max-h-[60vh] sm:max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Mobile Handle Pill */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-0.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="p-2 rounded-2xl text-white font-bold text-sm shadow-md shrink-0"
                style={{ backgroundColor: selectedBuilding.color || "#047857" }}
              >
                {selectedBuilding.category === "religious" ? (
                  <Church className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                  {selectedBuilding.name}
                </h3>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider block truncate">
                  {selectedBuilding.category} &bull; {selectedBuilding.floors} Floors
                </span>
              </div>
            </div>
            {onClearRoute && (
              <button
                onClick={onClearRoute}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 shrink-0"
                title="Close Info"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
            {selectedBuilding.description}
          </p>

          {/* Quick Info Tags */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] bg-emerald-50/80 p-2 sm:p-2.5 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-slate-500 block font-semibold">Popular For</span>
              <span className="text-emerald-900 font-bold truncate block">{selectedBuilding.popularFor}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Hours</span>
              <span className="text-emerald-900 font-bold truncate block">{selectedBuilding.operatingHours}</span>
            </div>
          </div>

          {/* Route Summary & Actions */}
          <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-2">
            {currentRoute && (
              <div className="flex items-center justify-between text-xs bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-emerald-700 text-[11px] sm:text-xs">
                    <Footprints className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ~{currentRoute.distanceMeters} m
                  </span>
                  <span className="flex items-center gap-1 font-bold text-blue-700 text-[11px] sm:text-xs">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ~{currentRoute.estimatedMinutes} min
                  </span>
                </div>
                {onClearRoute && (
                  <button
                    onClick={onClearRoute}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] shadow-xs active:scale-95 transition-all"
                    title="Clear active route"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
              {/* Set Location Inside Building Button */}
              <button
                onClick={() => {
                  geo.setPosition(selectedBuilding.x, selectedBuilding.y);
                  setCalibrationToast(`📍 Position set inside ${selectedBuilding.shortName || selectedBuilding.name}`);
                  setTimeout(() => setCalibrationToast(null), 3500);
                }}
                className="flex items-center justify-center gap-1 px-2.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-all active:scale-95"
                title="Place your avatar inside this building"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">Place Avatar Here</span>
              </button>

              {/* Route From User Pointer / Live Location Button */}
              <button
                onClick={() => onNavigateTo(selectedBuilding.id, "user-current-location")}
                className="flex items-center justify-center gap-1 px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] sm:text-xs shadow-md transition-all active:scale-95"
                title="Calculate route directly from your live user pointer position"
              >
                <Locate className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">From Pointer</span>
              </button>

              {/* Standard Navigate Button */}
              <button
                onClick={() => onNavigateTo(selectedBuilding.id, originBuildingId)}
                className="flex items-center justify-center gap-1 px-2.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] sm:text-xs shadow-md transition-all active:scale-95"
              >
                <Navigation className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {originBuildingId === "user-current-location" ? "Route Here" : `From ${originBuilding?.shortName || "Gate 2"}`}
                </span>
              </button>

              {/* Ask AI Navigator */}
              {onOpenAiChat && (
                <button
                  onClick={() => onOpenAiChat(selectedBuilding)}
                  className="col-span-2 sm:col-auto sm:flex-1 flex items-center justify-center gap-1 px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-all active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Ask AI Guide</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
