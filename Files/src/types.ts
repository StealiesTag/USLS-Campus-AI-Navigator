// All custom types here
export type BuildingCategory =
  | "academic"
  | "admin"
  | "amenity"
  | "sports"
  | "gates"
  | "religious";

export interface Waypoint {
  x: number;
  y: number;
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortName: string;
  category: BuildingCategory;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
  description: string;
  floors: number;
  departments: string[];
  amenities: string[];
  popularFor: string;
  operatingHours: string;
  color?: string;
  shape?: "rect" | "circle" | "oval" | "complex";
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  landmarkCue?: string;
}

export interface NavigationRoute {
  origin: CampusBuilding;
  destination: CampusBuilding;
  distanceMeters: number;
  estimatedMinutes: number;
  pathWaypoints: Waypoint[];
  steps: NavigationStep[];
}

export interface UserInteraction {
  id: string;
  userId: string;
  title: string;
  originId: string;
  destinationId: string;
  originName: string;
  destinationName: string;
  notes?: string;
  aiSummary?: string;
  distanceMeters: number;
  estimatedMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  destinationId?: string | null;
  originId?: string | null;
  suggestedAction?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
