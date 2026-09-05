// =============================================================================
// CARTESIAN COORDINATE SYSTEM
// University of St. La Salle (USLS), Bacolod City


export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null; // 0-360 degrees (0 = North)
  speed: number | null; // meters / second
  altitude: number | null;
  timestamp: number;
}

export interface MapCoordinates {
  x: number; // Map coordinate percentage (0 - 100)
  y: number; // Map coordinate percentage (0 - 100)
  svgX: number; // SVG ViewBox coordinate (0 - 1000)
  svgY: number; // SVG ViewBox coordinate (0 - 1000)
  metersEast: number; // Approximate meters East (+) / West (-) from GPS origin
  metersNorth: number; // Approximate meters North (+) / South (-) from GPS origin
  cartesianX: number; // Alias for metersEast
  cartesianY: number; // Alias for metersNorth
  scaleRatioPxPerMeter: number; // Scale ratio: SVG units per meter (default 2.0)
  scaleRatioMetersPerPx: number; // Scale ratio: Meters per SVG unit (default 0.5)
  isOnCampus: boolean;
  accuracyMapRadius: number; // Accuracy circle radius in SVG units
}

export interface MapPosition {
  x: number; // Map coordinate percentage (0 - 100)
  y: number; // Map coordinate percentage (0 - 100)
  svgX: number; // SVG coordinate (0 - 1000)
  svgY: number; // SVG coordinate (0 - 1000)
  metersEast: number; // Distance east/west in meters from origin
  metersNorth: number; // Distance north/south in meters from origin
}




// Known GPS origin on the campus: Central Quadrangle / Library area (USLS Bacolod)
export const latitudeOrigin = 10.67889;
export const longitudeOrigin = 122.96250;

export const ORIGIN_GPS = {
  latitude: latitudeOrigin,
  longitude: longitudeOrigin,
};

// Corresponding point on the SVG map (1000 x 1000 SVG canvas)
export const originX = 500;
export const originY = 500;

export const ORIGIN_MAP = {
  svgX: originX,
  svgY: originY,
  xPercent: 50,
  yPercent: 50,
};

// Approximate geographic degree-to-meter conversion for Bacolod City (10.67° N):
// 1 degree latitude ≈ 110,852 meters
// 1 degree longitude ≈ 111,320 * cos(10.67° * π/180) ≈ 109,390 meters
export const METERS_PER_DEG_LAT = 110852;
export const METERS_PER_DEG_LNG = 109390;

// Simple Fixed Scale:
// Real campus span: ~500m × 500m
// Digital map: 1000 × 1000 SVG units
// Therefore: 1 meter = 2 SVG units (0.5 meters per SVG unit)
export const MAP_SCALE_SVG_PER_METER = 2.0;
export const METERS_PER_SVG_UNIT = 1 / MAP_SCALE_SVG_PER_METER; // 0.5 m/unit
// Though y coordinate is negative, since SVG does it from top-down for some reason.
// Compatibility aliases
export const PIXELS_PER_METER = MAP_SCALE_SVG_PER_METER;
export const METERS_PER_PIXEL = METERS_PER_SVG_UNIT;
export const PERCENT_PER_METER = MAP_SCALE_SVG_PER_METER / 10;
export const METERS_PER_PERCENT = 1 / PERCENT_PER_METER;
export const CAMPUS_GEO_CENTER = { lat: latitudeOrigin, lng: longitudeOrigin };
export const DIGITAL_MAP_ORIGIN = { svgX: originX, svgY: originY, mapPercentX: 50, mapPercentY: 50 };

// -----------------------------------------------------------------------------
// CORE COORDINATE CONVERSION (INDEPENDENT & SIMPLE)
// -----------------------------------------------------------------------------

/**
 * Converts real-world GPS (latitude, longitude) to digital SVG campus map coordinates.
 *
 * Algorithm:
 * 1. Calculate approximate distance east/west and north/south from GPS origin in meters.
 * 2. Multiply meters by fixed map scale (1m = 2 SVG units).
 * 3. Convert to SVG x/y:
 *    - SVG X = originX + (metersEast * scale)
 *    - SVG Y = originY - (metersNorth * scale) (decreases upward towards North)
 *
 * Completely independent from:
 * - Dijkstra shortest path
 * - Pathway nodes & walkway graphs
 * - Snapping or filtering
 */
export function gpsToMapCoordinates(
  latitude: number,
  longitude: number,
  scaleMultiplier: number = 1.0
): MapPosition {
  // 1. Calculate approximate distance east/west and north/south from the GPS origin
  const metersEast = (longitude - longitudeOrigin) * METERS_PER_DEG_LNG;
  const metersNorth = (latitude - latitudeOrigin) * METERS_PER_DEG_LAT;

  // 2. Convert meters to SVG coordinates using scale with walking sensitivity multiplier
  const effectiveScale = MAP_SCALE_SVG_PER_METER * scaleMultiplier;
  const rawSvgX = originX + metersEast * effectiveScale;
  const rawSvgY = originY - metersNorth * effectiveScale;

  // Keep marker bounded within visible map canvas [20, 980] so it's always visible
  const svgX = Math.max(20, Math.min(980, rawSvgX));
  const svgY = Math.max(20, Math.min(980, rawSvgY));

  // 3. Map percentages (0 - 100)
  const x = svgX / 10;
  const y = svgY / 10;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    svgX: Number(svgX.toFixed(1)),
    svgY: Number(svgY.toFixed(1)),
    metersEast: Number(metersEast.toFixed(2)),
    metersNorth: Number(metersNorth.toFixed(2)),
  };
}

/**
 * Converts GPS to full MapCoordinates object with accuracy radius and bounding info.
 */
export function gpsToCampusMapCoordinates(
  latitude: number,
  longitude: number,
  accuracyMeters: number = 5,
  scaleMultiplier: number = 1.0
): MapCoordinates {
  const pos = gpsToMapCoordinates(latitude, longitude, scaleMultiplier);
  const accuracyMapRadius = Math.max(6, Math.min(60, accuracyMeters * MAP_SCALE_SVG_PER_METER));

  return {
    ...pos,
    cartesianX: pos.metersEast,
    cartesianY: pos.metersNorth,
    scaleRatioPxPerMeter: MAP_SCALE_SVG_PER_METER,
    scaleRatioMetersPerPx: METERS_PER_SVG_UNIT,
    isOnCampus: pos.x >= 0 && pos.x <= 100 && pos.y >= 0 && pos.y <= 100,
    accuracyMapRadius: Number(accuracyMapRadius.toFixed(1)),
  };
}

/**
 * Converts map percentage coordinates (0-100) back to real-world GPS.
 */
export function mapCoordinatesToGps(
  xPercent: number,
  yPercent: number
): { latitude: number; longitude: number } {
  const svgX = xPercent * 10;
  const svgY = yPercent * 10;

  const metersEast = (svgX - originX) / MAP_SCALE_SVG_PER_METER;
  const metersNorth = (originY - svgY) / MAP_SCALE_SVG_PER_METER;

  const latitude = latitudeOrigin + metersNorth / METERS_PER_DEG_LAT;
  const longitude = longitudeOrigin + metersEast / METERS_PER_DEG_LNG;

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

// Helper conversions for Cartesian meters
export function gpsToCartesianMeters(lat: number, lng: number): { xMeters: number; yMeters: number } {
  const pos = gpsToMapCoordinates(lat, lng);
  return { xMeters: pos.metersEast, yMeters: pos.metersNorth };
}

export function cartesianMetersToGps(xMeters: number, yMeters: number): { lat: number; lng: number } {
  const lat = latitudeOrigin + yMeters / METERS_PER_DEG_LAT;
  const lng = longitudeOrigin + xMeters / METERS_PER_DEG_LNG;
  return { lat, lng };
}

export function mapPercentToCartesian(mapX: number, mapY: number): { xMeters: number; yMeters: number } {
  const metersEast = (mapX * 10 - originX) / MAP_SCALE_SVG_PER_METER;
  const metersNorth = (originY - mapY * 10) / MAP_SCALE_SVG_PER_METER;
  return { xMeters: Number(metersEast.toFixed(1)), yMeters: Number(metersNorth.toFixed(1)) };
}

export function digitalMapToCartesian(svgX: number, svgY: number): { xMeters: number; yMeters: number } {
  const metersEast = (svgX - originX) / MAP_SCALE_SVG_PER_METER;
  const metersNorth = (originY - svgY) / MAP_SCALE_SVG_PER_METER;
  return { xMeters: Number(metersEast.toFixed(1)), yMeters: Number(metersNorth.toFixed(1)) };
}

export function cartesianToDigitalMap(
  xMeters: number,
  yMeters: number
): { svgX: number; svgY: number; mapX: number; mapY: number } {
  const svgX = originX + xMeters * MAP_SCALE_SVG_PER_METER;
  const svgY = originY - yMeters * MAP_SCALE_SVG_PER_METER;
  return { svgX, svgY, mapX: svgX / 10, mapY: svgY / 10 };
}

/**
 * Standard Haversine distance between two GPS coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format heading degrees to readable compass cardinal direction
 */
export function headingToCardinal(degrees: number | null): string {
  if (degrees === null || isNaN(degrees)) return "North (0°)";
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return `${directions[index]} (${Math.round(normalized)}°)`;
}
