import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  GeoLocation,
  MapCoordinates,
  gpsToMapCoordinates,
  gpsToCampusMapCoordinates,
  mapCoordinatesToGps,
  headingToCardinal,
  latitudeOrigin,
  longitudeOrigin,
  originX,
  originY,
  MAP_SCALE_SVG_PER_METER,
  METERS_PER_DEG_LNG,
  METERS_PER_DEG_LAT,
} from "../utils/geoUtils";
import { CAMPUS_BUILDINGS, getClosestBuilding } from "../data/campusData";

export interface GpsDebugInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  metersEast: number;
  metersNorth: number;
  svgX: number;
  svgY: number;
  x: number;
  y: number;
  timestamp: number;
  isManual: boolean;
}

export interface GeolocationState {
  // Live GPS Tracking State
  isTracking: boolean;
  isSupported: boolean;
  hasPermission: boolean | null;
  error: string | null;
  location: GeoLocation | null;
  mapCoords: MapCoordinates;
  heading: number; // 0-360 degrees (0 = North)
  rawHeading: number;
  headingOffset: number;
  positionOffset: { dx: number; dy: number };
  scaleMultiplier: number;
  accuracy: number | null;
  speed: number | null;
  isManualMode: boolean;
  isSimulating: boolean;
  isCalibratingPosition: boolean;
  isSensorSyncEnabled: boolean;
  nearestBuildingName: string;
  debugInfo: GpsDebugInfo;

  // Actions: Tracking & Mode
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  toggleSimulation: () => void;
  resetToLiveGps: () => void;
  resetPositionOffset: () => void;
  setScaleMultiplier: (multiplier: number) => void;

  // Actions: Manual Position & Walking Adjustments
  setPosition: (x: number, y: number) => void;
  setPositionByBuildingId: (buildingId: string) => void;
  adjustPositionOffset: (deltaX: number, deltaY: number) => void;
  setSimulatedPoint: (x: number, y: number, heading?: number) => void;
  stepDirection: (direction: "north" | "south" | "east" | "west", distanceMultiplier?: number) => void;
  stepMove: (distanceMultiplier?: number) => void;
  stepMoveBackward: () => void;
  toggleCalibratingPosition: (active?: boolean) => void;

  // Actions: Compass & Direction Calibration
  setHeading: (deg: number) => void;
  rotateHeading: (deltaDegrees: number) => void;
  setHeadingOffset: (offset: number) => void;
  adjustHeadingOffset: (delta: number) => void;
  resetCalibration: () => void;
  toggleSensorSync: () => void;
  requestOrientationPermission: () => Promise<boolean>;
}

// Default initial location: Quadrangle center (x: 50, y: 50)
const DEFAULT_MAP_X = 50;
const DEFAULT_MAP_Y = 50;
const DEFAULT_HEADING = 0;

const DEFAULT_GPS_LOCATION: GeoLocation = {
  latitude: latitudeOrigin,
  longitude: longitudeOrigin,
  accuracy: 5,
  heading: 0,
  speed: 0,
  altitude: 18,
  timestamp: Date.now(),
};

/**
 * Clean, simple Hook for GPS tracking and coordinate conversion.
 * Completely decoupled from Dijkstra and walkway routing graphs.
 */
export function useGeolocation(): GeolocationState {
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [isSupported] = useState<boolean>(
    () => typeof navigator !== "undefined" && "geolocation" in navigator
  );
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(DEFAULT_GPS_LOCATION);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const isManualModeRef = useRef<boolean>(false);
  useEffect(() => {
    isManualModeRef.current = isManualMode;
  }, [isManualMode]);

  // Relative Calibration Offset (dx, dy in map coordinate percentage)
  const [positionOffset, setPositionOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const positionOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Real-world stride scale multiplier (defaults to 1.0, supports up to 5.0x)
  const [scaleMultiplier, setScaleMultiplierState] = useState<number>(1.0);
  const scaleMultiplierRef = useRef<number>(1.0);
  const setScaleMultiplier = useCallback((multiplier: number) => {
    const val = Math.max(0.5, Math.min(5.0, multiplier));
    const rounded = Number(val.toFixed(2));
    setScaleMultiplierState(rounded);
    scaleMultiplierRef.current = rounded;
  }, []);

  const [isCalibratingPosition, setIsCalibratingPosition] = useState<boolean>(false);

  // Raw hardware GPS cache for resuming live GPS tracking & calculating relative offset
  const latestHardwareGpsRef = useRef<GeoLocation | null>(null);
  const latestRawGpsCoordsRef = useRef<{ x: number; y: number }>({
    x: DEFAULT_MAP_X,
    y: DEFAULT_MAP_Y,
  });

  // Anchor GPS & Map position when calibrated manually
  const anchorGpsRef = useRef<{ lat: number; lng: number } | null>(null);
  const anchorMapCoordsRef = useRef<{ x: number; y: number } | null>(null);

  // Map Coordinates (Percentage 0-100)
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: DEFAULT_MAP_X,
    y: DEFAULT_MAP_Y,
  });

  const watchIdRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // 1. GPS TO MAP CONVERSION PIPELINE
  // ---------------------------------------------------------------------------
  const mapCoords: MapCoordinates = useMemo(() => {
    const accuracy = location?.accuracy ?? 5;
    const svgX = coords.x * 10;
    const svgY = coords.y * 10;
    const metersEast = (svgX - originX) / MAP_SCALE_SVG_PER_METER;
    const metersNorth = (originY - svgY) / MAP_SCALE_SVG_PER_METER;
    const accuracyMapRadius = Math.max(6, Math.min(60, accuracy * MAP_SCALE_SVG_PER_METER));

    return {
      x: coords.x,
      y: coords.y,
      svgX: Number(svgX.toFixed(1)),
      svgY: Number(svgY.toFixed(1)),
      metersEast: Number(metersEast.toFixed(2)),
      metersNorth: Number(metersNorth.toFixed(2)),
      cartesianX: Number(metersEast.toFixed(1)),
      cartesianY: Number(metersNorth.toFixed(1)),
      scaleRatioPxPerMeter: MAP_SCALE_SVG_PER_METER,
      scaleRatioMetersPerPx: 1 / MAP_SCALE_SVG_PER_METER,
      isOnCampus: coords.x >= 0 && coords.x <= 100 && coords.y >= 0 && coords.y <= 100,
      accuracyMapRadius: Number(accuracyMapRadius.toFixed(1)),
    };
  }, [coords.x, coords.y, location?.accuracy]);

  const nearestBuilding = useMemo(() => {
    return getClosestBuilding(coords.x, coords.y);
  }, [coords.x, coords.y]);

  // Debug Information
  const debugInfo: GpsDebugInfo = useMemo(() => {
    return {
      latitude: location?.latitude ?? latitudeOrigin,
      longitude: location?.longitude ?? longitudeOrigin,
      accuracy: location?.accuracy ?? 5,
      metersEast: mapCoords.metersEast,
      metersNorth: mapCoords.metersNorth,
      svgX: mapCoords.svgX,
      svgY: mapCoords.svgY,
      x: mapCoords.x,
      y: mapCoords.y,
      timestamp: location?.timestamp ?? Date.now(),
      isManual: isManualMode,
    };
  }, [location, mapCoords, isManualMode]);

  // ---------------------------------------------------------------------------
  // 2. LIVE GPS UPDATE HANDLER (PREDICTABLE & SUPPORTS RELATIVE MOVEMENT)
  // ---------------------------------------------------------------------------
  const handleGpsUpdate = useCallback(
    (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const headingVal = pos.coords.heading;
      const speedVal = pos.coords.speed;

      const newLocation: GeoLocation = {
        latitude: lat,
        longitude: lng,
        accuracy,
        heading: headingVal ?? null,
        speed: speedVal ?? null,
        altitude: pos.coords.altitude ?? null,
        timestamp: pos.timestamp,
      };

      // Convert GPS position to digital map coordinates using current scaleMultiplier
      const converted = gpsToMapCoordinates(lat, lng, scaleMultiplierRef.current);
      latestRawGpsCoordsRef.current = { x: converted.x, y: converted.y };

      let effectiveX: number;
      let effectiveY: number;

      if (isManualModeRef.current && anchorGpsRef.current && anchorMapCoordsRef.current) {
        // High-precision calibrated displacement relative to calibrated anchor point, scaled by walking sensitivity (up to 5x)
        const dEastMeters = (lng - anchorGpsRef.current.lng) * METERS_PER_DEG_LNG;
        const dNorthMeters = (lat - anchorGpsRef.current.lat) * METERS_PER_DEG_LAT;
        const dXPercent = (dEastMeters * MAP_SCALE_SVG_PER_METER * scaleMultiplierRef.current) / 10;
        const dYPercent = -(dNorthMeters * MAP_SCALE_SVG_PER_METER * scaleMultiplierRef.current) / 10;
        effectiveX = Number(Math.max(1, Math.min(99, anchorMapCoordsRef.current.x + dXPercent)).toFixed(2));
        effectiveY = Number(Math.max(1, Math.min(99, anchorMapCoordsRef.current.y + dYPercent)).toFixed(2));
      } else {
        // Apply relative calibration offset or direct converted coordinates
        effectiveX = Number(
          Math.max(1, Math.min(99, converted.x + positionOffsetRef.current.dx)).toFixed(2)
        );
        effectiveY = Number(
          Math.max(1, Math.min(99, converted.y + positionOffsetRef.current.dy)).toFixed(2)
        );
      }

      // If calibrated offset is active, reflect calibrated GPS coordinates
      if (isManualModeRef.current) {
        const derivedGps = mapCoordinatesToGps(effectiveX, effectiveY);
        newLocation.latitude = derivedGps.latitude;
        newLocation.longitude = derivedGps.longitude;
      }

      latestHardwareGpsRef.current = newLocation;
      setLocation(newLocation);
      setHasPermission(true);
      setError(null);

      // Always update on-screen position (moving relative to manual position)
      setCoords({ x: effectiveX, y: effectiveY });

      // Debug Console Logging
      console.log("[GPS Position Debug]", {
        "GPS Latitude": lat,
        "GPS Longitude": lng,
        "GPS Accuracy": `${accuracy.toFixed(1)}m`,
        "Raw Map X%": converted.x,
        "Raw Map Y%": converted.y,
        "Offset ΔX%": positionOffsetRef.current.dx,
        "Offset ΔY%": positionOffsetRef.current.dy,
        "Effective Map X%": effectiveX,
        "Effective Map Y%": effectiveY,
        "Mode": isManualModeRef.current ? "Calibrated Relative GPS" : "Live GPS Tracking",
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 3. START / STOP GPS TRACKING VIA STANDARD BROWSER API
  // ---------------------------------------------------------------------------
  const startTracking = useCallback(async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(true);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 27000,
    };

    // Prime location immediately with getCurrentPosition
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleGpsUpdate(pos),
        (err) => {
          console.warn("Initial GPS acquisition notice:", err);
          if (err.code === 1) {
            setHasPermission(false);
            setError("Location permission denied. Click or drag to move freely.");
          }
        },
        geoOptions
      );
    } catch {}

    // Continuous watch
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => handleGpsUpdate(pos),
        (err) => {
          console.warn("Geolocation watchPosition error:", err);
          if (err.code === 1) {
            setHasPermission(false);
            setError("Location permission denied. Click or drag to move freely.");
          } else if (err.code === 3) {
            console.log("GPS timeout, waiting for next satellite update...");
          } else {
            setError("GPS signal weak or unavailable.");
          }
        },
        geoOptions
      );
    } catch (err) {
      console.warn("Failed to start geolocation watch:", err);
    }
  }, [handleGpsUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Mount effect: start continuous tracking
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startTracking]);

  // ---------------------------------------------------------------------------
  // 4. CALIBRATED RELATIVE POSITIONING & STEPPING
  // ---------------------------------------------------------------------------
  const setPosition = useCallback((newX: number, newY: number) => {
    const clampedX = Number(Math.max(1, Math.min(99, newX)).toFixed(2));
    const clampedY = Number(Math.max(1, Math.min(99, newY)).toFixed(2));

    // Save calibration anchor points
    const currentLat = latestHardwareGpsRef.current?.latitude ?? latitudeOrigin;
    const currentLng = latestHardwareGpsRef.current?.longitude ?? longitudeOrigin;
    anchorGpsRef.current = { lat: currentLat, lng: currentLng };
    anchorMapCoordsRef.current = { x: clampedX, y: clampedY };

    // Calculate offset relative to the latest raw hardware GPS coordinates
    const rawX = latestRawGpsCoordsRef.current.x;
    const rawY = latestRawGpsCoordsRef.current.y;
    const offsetDx = Number((clampedX - rawX).toFixed(2));
    const offsetDy = Number((clampedY - rawY).toFixed(2));

    positionOffsetRef.current = { dx: offsetDx, dy: offsetDy };
    setPositionOffset({ dx: offsetDx, dy: offsetDy });
    setIsManualMode(true);
    isManualModeRef.current = true;

    setCoords({ x: clampedX, y: clampedY });

    // Derive simulated GPS coordinates corresponding to this map point
    const gps = mapCoordinatesToGps(clampedX, clampedY);
    setLocation((prev) => ({
      latitude: gps.latitude,
      longitude: gps.longitude,
      accuracy: prev?.accuracy ?? 3,
      heading: prev?.heading ?? 0,
      speed: 0,
      altitude: 18,
      timestamp: Date.now(),
    }));

    console.log("[Manual Position Offset Set - Moves with you]", {
      "Calibrated X%": clampedX,
      "Calibrated Y%": clampedY,
      "Raw GPS X%": rawX,
      "Raw GPS Y%": rawY,
      "Offset ΔX%": offsetDx,
      "Offset ΔY%": offsetDy,
      "Walking Speed Multiplier": `${scaleMultiplierRef.current}x`,
    });
  }, []);

  const resetToLiveGps = useCallback(() => {
    setIsManualMode(false);
    isManualModeRef.current = false;
    positionOffsetRef.current = { dx: 0, dy: 0 };
    setPositionOffset({ dx: 0, dy: 0 });
    anchorGpsRef.current = null;
    anchorMapCoordsRef.current = null;

    if (latestHardwareGpsRef.current) {
      const lat = latestHardwareGpsRef.current.latitude;
      const lng = latestHardwareGpsRef.current.longitude;
      const converted = gpsToMapCoordinates(lat, lng, scaleMultiplierRef.current);
      setCoords({ x: converted.x, y: converted.y });
      setLocation(latestHardwareGpsRef.current);
    }
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleGpsUpdate(pos),
        (err) => console.warn("Live GPS refresh notice:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    }
  }, [handleGpsUpdate]);

  const setPositionByBuildingId = useCallback(
    (buildingId: string) => {
      const b = CAMPUS_BUILDINGS.find((item) => item.id === buildingId);
      if (b) {
        setPosition(b.x, b.y);
      }
    },
    [setPosition]
  );

  const setSimulatedPoint = useCallback(
    (x: number, y: number) => {
      setPosition(x, y);
    },
    [setPosition]
  );

  // Directional step movement (moves North, South, East, West without direction tracking)
  // Distance scales directly with user's walking speed modifier (up to 5.0x)
  const stepDirection = useCallback(
    (direction: "north" | "south" | "east" | "west", distanceMultiplier: number = 1.0) => {
      const stepPercent =
        ((distanceMultiplier * 3 * scaleMultiplierRef.current) * MAP_SCALE_SVG_PER_METER) / 10;
      let dx = 0;
      let dy = 0;
      if (direction === "north") dy = -stepPercent;
      else if (direction === "south") dy = stepPercent;
      else if (direction === "west") dx = -stepPercent;
      else if (direction === "east") dx = stepPercent;

      setPosition(coords.x + dx, coords.y + dy);
    },
    [coords.x, coords.y, setPosition]
  );

  const stepMove = useCallback(
    (distanceMultiplier: number = 1.5) => {
      stepDirection("north", distanceMultiplier);
    },
    [stepDirection]
  );

  const stepMoveBackward = useCallback(() => {
    stepDirection("south", 1.5);
  }, [stepDirection]);

  return {
    isTracking,
    isSupported,
    hasPermission,
    error,
    location,
    mapCoords,
    heading: 0,
    rawHeading: 0,
    headingOffset: 0,
    positionOffset,
    scaleMultiplier,
    accuracy: location?.accuracy ?? null,
    speed: location?.speed ?? null,
    isManualMode,
    isSimulating: isManualMode,
    isCalibratingPosition,
    isSensorSyncEnabled: false,
    nearestBuildingName: nearestBuilding.name,
    debugInfo,

    startTracking,
    stopTracking,
    toggleSimulation: () => {
      if (isManualMode) {
        resetToLiveGps();
      } else {
        setIsManualMode(true);
        isManualModeRef.current = true;
      }
    },
    resetToLiveGps,
    resetPositionOffset: resetToLiveGps,
    setScaleMultiplier,

    setPosition,
    setPositionByBuildingId,
    adjustPositionOffset: (dx, dy) => setPosition(coords.x + dx, coords.y + dy),
    setSimulatedPoint,
    stepDirection,
    stepMove,
    stepMoveBackward,
    toggleCalibratingPosition: (active?: boolean) =>
      setIsCalibratingPosition((prev) => (active !== undefined ? active : !prev)),

    setHeading: () => {},
    rotateHeading: () => {},
    setHeadingOffset: () => {},
    adjustHeadingOffset: () => {},
    resetCalibration: () => {},
    toggleSensorSync: () => {},
    requestOrientationPermission: async () => true,
  };
}
