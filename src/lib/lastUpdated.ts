// Single source of truth for the "laatst bijgewerkt" date emitted on
// detail pages without per-item timestamps (chargers, brands, comparisons,
// brand-pair pages). Bump this when data is materially refreshed so Google
// sees a freshness signal across the site.
export const LAST_UPDATED = "2026-02-15";

export function formatNlDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
