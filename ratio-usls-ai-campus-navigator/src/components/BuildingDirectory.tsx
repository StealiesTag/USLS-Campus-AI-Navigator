import React, { useState, useMemo } from "react";
import { CampusBuilding, CAMPUS_BUILDINGS } from "../data/campusData";
import {
  Search,
  MapPin,
  Navigation,
  BookOpen,
  Building2,
  Trophy,
  Coffee,
  DoorOpen,
  Clock,
  Layers,
  X,
  Church,
} from "lucide-react";

export interface BuildingDirectoryProps {
  selectedBuildingId?: string | null;
  onSelectBuilding: (building: CampusBuilding) => void;
  onNavigateTo: (destinationId: string) => void;
}

export const BuildingDirectory: React.FC<BuildingDirectoryProps> = ({
  selectedBuildingId,
  onSelectBuilding,
  onNavigateTo,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Facilities", icon: Layers },
    { id: "academic", label: "Colleges", icon: BookOpen },
    { id: "religious", label: "Sanctuary", icon: Church },
    { id: "admin", label: "Administration", icon: Building2 },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "amenity", label: "Services", icon: Coffee },
    { id: "gates", label: "Gates", icon: DoorOpen },
  ];

  const filteredBuildings = useMemo(() => {
    return CAMPUS_BUILDINGS.filter((b) => {
      const matchCat = selectedCategory === "all" || b.category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        searchTerm.trim() === "" ||
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.popularFor.toLowerCase().includes(q) ||
        b.departments.some((d) => d.toLowerCase().includes(q)) ||
        b.amenities.some((a) => a.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 text-slate-800 w-full lg:w-96 shrink-0 shadow-lg z-20">
      {/* Directory Header */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-none">Campus Directory</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {CAMPUS_BUILDINGS.length} Buildings &amp; Landmarks
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
            {filteredBuildings.length} Listed
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search college, office, lab, venue..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buildings List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
        {filteredBuildings.map((building) => {
          const isSelected = selectedBuildingId === building.id;
          return (
            <div
              key={building.id}
              onClick={() => onSelectBuilding(building)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="p-2 rounded-xl text-white font-bold text-xs shrink-0 mt-0.5 shadow-xs"
                    style={{ backgroundColor: building.color || "#047857" }}
                  >
                    {building.category === "gates" ? (
                      "🚪"
                    ) : building.category === "religious" ? (
                      <Church className="h-3.5 w-3.5" />
                    ) : (
                      building.shortName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                      {building.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 font-medium">
                      {building.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags & Quick Action */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  <span className="truncate max-w-[150px] font-medium">{building.operatingHours}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTo(building.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 hover:border-emerald-700 transition-colors shadow-2xs"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Route</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredBuildings.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Search className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">No facilities match your search.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
