export interface Geodetic {
  lat: number;
  lon: number;
  alt: number;
}

export interface Enu {
  east: number;
  north: number;
  up: number;
}

const earthRadius = 6_371_000;
const radians = Math.PI / 180;

export const origin: Geodetic = { lat: 52.3105, lon: 4.7683, alt: 0 };

// #region to-enu
export function toEnu(fix: Geodetic, reference: Geodetic = origin): Enu {
  return {
    east: (fix.lon - reference.lon) * radians * earthRadius * Math.cos(reference.lat * radians),
    north: (fix.lat - reference.lat) * radians * earthRadius,
    up: fix.alt - reference.alt
  };
}
// #endregion

export function toGeodetic(point: Enu, reference: Geodetic = origin): Geodetic {
  return {
    lat: reference.lat + point.north / earthRadius / radians,
    lon: reference.lon + point.east / (earthRadius * Math.cos(reference.lat * radians)) / radians,
    alt: reference.alt + point.up
  };
}
