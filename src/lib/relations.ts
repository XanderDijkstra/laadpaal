// Cross-page relation helpers — central place to compute "what's relevant
// to what" so each detail page emits dense, descriptive internal links.
import { chargers } from "@/data/chargers";
import { brands } from "@/data/brands";
import { guides } from "@/data/guides";
import { evModels } from "@/data/evModels";
import { comparisons } from "@/data/comparisons";

type Charger = (typeof chargers)[number];
type Guide = (typeof guides)[number];
type Ev = (typeof evModels)[number];
type Comparison = (typeof comparisons)[number];

// PV-friendly chargers — explicit allow-list because the data file doesn't
// have a `pvFriendly` flag.
const PV_FRIENDLY_SLUGS = new Set([
  "myenergi-zappi",
  "smappee-ev-wall",
  "zaptec-pro",
  "zaptec-go-2",
  "easee-charge-up",
  "easee-charge-core",
  "easee-charge-max",
  "wallbox-pulsar-plus",
  "wallbox-copper-sb",
  "go-e-charger-gemini-22",
]);

// Cars that are typically driven as a company car in Belgium.
const COMPANY_CAR_BRANDS = new Set([
  "bmw",
  "audi",
  "mercedes",
  "tesla",
  "porsche",
  "volvo",
  "polestar",
]);

export function isPvFriendly(charger: Charger): boolean {
  return PV_FRIENDLY_SLUGS.has(charger.slug);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getChargerBySlug(slug: string): Charger | undefined {
  return chargers.find((c) => c.slug === slug);
}

// ------------------------------------------------------------------
// Charger → relevant guides (based on charger features)
// ------------------------------------------------------------------
export function relevantGuidesForCharger(charger: Charger): Guide[] {
  const slugs = new Set<string>();
  // Always relevant
  slugs.add("laadpaal-kosten-totaal");
  slugs.add("6-procent-btw-laadpaal");
  slugs.add("arei-keuring-laadpaal");

  if (charger.phases === 1) slugs.add("1-fase-vs-3-fase-laadpaal");
  if (charger.maxKw >= 22) slugs.add("verzwaring-fluvius-laadpaal");
  if (charger.midMeter) {
    slugs.add("mid-meter-laadpaal");
    slugs.add("bedrijfswagen-laadpaal-thuis");
  }
  if (isPvFriendly(charger)) slugs.add("laadpaal-en-zonnepanelen");
  if (charger.app) slugs.add("slimme-laadpaal-vs-basis");
  // DLB-related guide for any 3-phase or smart charger
  if (charger.phases === 3 && charger.app) slugs.add("dynamic-load-balancing");

  return [...slugs]
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => Boolean(g))
    .slice(0, 4);
}

// ------------------------------------------------------------------
// Charger → compatible EVs (EV's AC max fits within charger's max)
// ------------------------------------------------------------------
export function compatibleEvsForCharger(charger: Charger, max = 4): Ev[] {
  return evModels
    .filter((ev) => ev.acMaxKw <= charger.maxKw)
    .sort((a, b) => b.acMaxKw - a.acMaxKw)
    .slice(0, max);
}

// ------------------------------------------------------------------
// EV → compatible chargers (charger meets EV's AC requirement)
// ------------------------------------------------------------------
export function compatibleChargersForEv(
  ev: Ev,
  excludeSlug?: string,
  max = 3,
): Charger[] {
  return chargers
    .filter((c) => c.slug !== excludeSlug && c.maxKw >= ev.acMaxKw)
    .sort((a, b) => {
      // Prefer matching phases, then cheaper
      const aPhaseMatch =
        (ev.acMaxKw <= 7.4 ? a.phases === 1 : a.phases === 3) ? 1 : 0;
      const bPhaseMatch =
        (ev.acMaxKw <= 7.4 ? b.phases === 1 : b.phases === 3) ? 1 : 0;
      if (aPhaseMatch !== bPhaseMatch) return bPhaseMatch - aPhaseMatch;
      return a.priceAllInFrom - b.priceAllInFrom;
    })
    .slice(0, max);
}

// ------------------------------------------------------------------
// EV → relevant guides
// ------------------------------------------------------------------
export function relevantGuidesForEv(ev: Ev): Guide[] {
  const slugs = new Set<string>();
  slugs.add("laadpaal-kosten-totaal");
  slugs.add("1-fase-vs-3-fase-laadpaal");
  slugs.add("6-procent-btw-laadpaal");
  if (COMPANY_CAR_BRANDS.has(ev.brand.toLowerCase())) {
    slugs.add("bedrijfswagen-laadpaal-thuis");
    slugs.add("mid-meter-laadpaal");
  }
  if (ev.acMaxKw >= 11) slugs.add("dynamic-load-balancing");
  return [...slugs]
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => Boolean(g))
    .slice(0, 4);
}

// ------------------------------------------------------------------
// Brand → comparisons featuring this brand's chargers
// ------------------------------------------------------------------
export function comparisonsForBrand(brandSlug: string): Comparison[] {
  const brand = brands.find((b) => b.slug === brandSlug);
  if (!brand) return [];
  const brandChargerSlugs = new Set(brand.modelSlugs);
  return comparisons.filter(
    (c) => brandChargerSlugs.has(c.a) || brandChargerSlugs.has(c.b),
  );
}

// ------------------------------------------------------------------
// Comparison → background guides (based on what's compared)
// ------------------------------------------------------------------
export function backgroundGuidesForComparison(cmp: Comparison): Guide[] {
  const slugs = new Set<string>();
  slugs.add("laadpaal-kosten-totaal");

  // Concept comparisons (slug-based)
  if (cmp.slug === "11kw-vs-22kw-laadpaal" || cmp.a === "11-kw" || cmp.b === "22-kw") {
    slugs.add("1-fase-vs-3-fase-laadpaal");
    slugs.add("verzwaring-fluvius-laadpaal");
  }
  if (cmp.slug === "vaste-kabel-vs-socket") {
    slugs.add("slimme-laadpaal-vs-basis");
    slugs.add("laadpaal-onderhoud");
  }

  // Charger-specific comparisons: derive from the chargers involved
  const a = getChargerBySlug(cmp.a);
  const b = getChargerBySlug(cmp.b);
  for (const c of [a, b]) {
    if (!c) continue;
    if (c.midMeter) {
      slugs.add("bedrijfswagen-laadpaal-thuis");
      slugs.add("mid-meter-laadpaal");
    }
    if (c.phases === 1) slugs.add("1-fase-vs-3-fase-laadpaal");
    if (isPvFriendly(c)) slugs.add("laadpaal-en-zonnepanelen");
    if (c.app) slugs.add("slimme-laadpaal-vs-basis");
  }

  return [...slugs]
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => Boolean(g))
    .slice(0, 4);
}

// ------------------------------------------------------------------
// Gemeente → top guides (always the cornerstone trio)
// ------------------------------------------------------------------
export function topGuidesForGemeente(): Guide[] {
  return [
    "laadpaal-premie-2026",
    "6-procent-btw-laadpaal",
    "laadpaal-kosten-totaal",
  ]
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => Boolean(g));
}

// ------------------------------------------------------------------
// Gemeente → recommended chargers (one cheap, one mid, one premium)
// ------------------------------------------------------------------
export function recommendedChargersForGemeente(): Charger[] {
  const sorted = [...chargers].sort(
    (a, b) => a.priceAllInFrom - b.priceAllInFrom,
  );
  const cheap = sorted.find((c) => c.priceAllInFrom < 1300);
  const mid = sorted.find(
    (c) => c.priceAllInFrom >= 1300 && c.priceAllInFrom < 1800 && c.app,
  );
  const premium = sorted.find((c) => c.midMeter && c.priceAllInFrom >= 1800);
  return [cheap, mid, premium].filter((c): c is Charger => Boolean(c));
}

// ------------------------------------------------------------------
// Guide → relevant chargers (based on guide topic)
// ------------------------------------------------------------------
export function relevantChargersForGuide(guideSlug: string): Charger[] {
  const map: Record<string, (c: Charger) => boolean> = {
    "1-fase-vs-3-fase-laadpaal": (c) => c.phases === 1 || c.maxKw === 7,
    "bedrijfswagen-laadpaal-thuis": (c) => c.midMeter,
    "mid-meter-laadpaal": (c) => c.midMeter,
    "laadpaal-en-zonnepanelen": (c) => isPvFriendly(c),
    "dynamic-load-balancing": (c) => c.app && c.phases === 3,
    "slimme-laadpaal-vs-basis": (c) => c.app,
    "capaciteitstarief-laadpaal": (c) => c.app,
    "laadpaal-onderhoud": () => true,
    "6-procent-btw-laadpaal": () => true,
    "laadpaal-kosten-totaal": () => true,
    "arei-keuring-laadpaal": () => true,
  };
  const filter = map[guideSlug];
  if (!filter) return [];
  return chargers
    .filter(filter)
    .sort((a, b) => a.priceAllInFrom - b.priceAllInFrom)
    .slice(0, 4);
}
