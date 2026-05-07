// Data lives in laadpunten.json (auto-overwritten by scripts/fetch-laadpunten.mjs).
// Keeping the array out of TypeScript avoids "type too complex" errors when the
// dataset grows past a few thousand entries (TS would otherwise infer a giant
// discriminated union from the literal `type: "AC" | "DC" | "AC+DC"`).
import type { ChargingStation } from "./types";
import data from "./laadpunten.json";

export const laadpunten = data as ChargingStation[];

export function laadpuntenInGemeente(gemeenteSlug: string): ChargingStation[] {
  return laadpunten.filter((p) => p.gemeenteSlug === gemeenteSlug);
}

export function laadpuntenInProvincie(provincieGemeenten: string[]): ChargingStation[] {
  const set = new Set(provincieGemeenten);
  return laadpunten.filter((p) => set.has(p.gemeenteSlug));
}

// Haversine afstand in km tussen twee lat/lng paren.
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
