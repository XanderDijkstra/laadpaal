import { brands } from "@/data/brands";
import { chargers } from "@/data/chargers";

type Brand = (typeof brands)[number];
type Charger = (typeof chargers)[number];

// Sort brands alphabetically for canonical URLs (e.g. easee-vs-zaptec, never zaptec-vs-easee).
export function pairSlug(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `${x}-vs-${y}`;
}

// Split a `${a}-vs-${b}` slug back into two brand slugs. Handles the `go-e`
// edge case where the brand slug itself contains a hyphen.
export function parsePairSlug(combined: string): [string, string] | null {
  const known = new Set(brands.map((b) => b.slug));
  const idx: number[] = [];
  let from = 0;
  while (true) {
    const i = combined.indexOf("-vs-", from);
    if (i === -1) break;
    idx.push(i);
    from = i + 4;
  }
  for (const i of idx) {
    const left = combined.slice(0, i);
    const right = combined.slice(i + 4);
    if (known.has(left) && known.has(right)) return [left, right];
  }
  return null;
}

// All canonical pairs across the 18 brands → C(18, 2) = 153 routes.
export function allBrandPairs(): string[] {
  const slugs = brands.map((b) => b.slug).sort();
  const out: string[] = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      out.push(pairSlug(slugs[i], slugs[j]));
    }
  }
  return out;
}

export interface BrandStats {
  brand: Brand;
  models: Charger[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  maxKw: number;
  midShare: number;          // 0-1, fraction of models with MID-meter
  appShare: number;
  warrantyMax: number;
  hasOneFase: boolean;
  hasThreeFase: boolean;
}

export function statsForBrand(brand: Brand): BrandStats {
  const models = chargers.filter((c) => c.brandSlug === brand.slug);
  const prices = models.map((m) => m.priceAllInFrom);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((s, p) => s + p, 0) / models.length);
  const maxKw = Math.max(...models.map((m) => m.maxKw));
  const midShare = models.filter((m) => m.midMeter).length / models.length;
  const appShare = models.filter((m) => m.app).length / models.length;
  const warrantyMax = Math.max(...models.map((m) => m.warrantyYears));
  const hasOneFase = models.some((m) => m.phases === 1);
  const hasThreeFase = models.some((m) => m.phases === 3);
  return {
    brand,
    models,
    minPrice,
    maxPrice,
    avgPrice,
    maxKw,
    midShare,
    appShare,
    warrantyMax,
    hasOneFase,
    hasThreeFase,
  };
}

// Generate a 2-3 sentence verdict highlighting the differentiators between
// two brands. Picks 2-3 strongest contrasts; deterministic for SSR-safety.
export function brandVerdict(a: BrandStats, b: BrandStats): string {
  const facts: string[] = [];

  if (a.midShare !== b.midShare) {
    const winner = a.midShare > b.midShare ? a : b;
    if (winner.midShare === 1) {
      facts.push(
        `${winner.brand.name} levert MID-meter standaard op alle modellen — geschikt voor bedrijfswagen-terugbetaling`,
      );
    } else if (winner.midShare > 0.5) {
      facts.push(`${winner.brand.name} biedt vaker MID-meter standaard`);
    }
  }

  if (a.warrantyMax !== b.warrantyMax) {
    const winner = a.warrantyMax > b.warrantyMax ? a : b;
    facts.push(
      `${winner.brand.name} geeft tot ${winner.warrantyMax} jaar garantie`,
    );
  }

  if (a.maxKw !== b.maxKw) {
    const winner = a.maxKw > b.maxKw ? a : b;
    facts.push(
      `${winner.brand.name} biedt modellen tot ${winner.maxKw} kW`,
    );
  }

  if (a.appShare !== b.appShare) {
    const winner = a.appShare > b.appShare ? a : b;
    if (winner.appShare === 1 && winner !== (a.appShare > b.appShare ? a : b)) {
      // Skip if winner.appShare also == 1
    } else if (winner.appShare === 1) {
      facts.push(
        `${winner.brand.name} levert app-bediening standaard op alle modellen`,
      );
    }
  }

  if (facts.length === 0) {
    facts.push(
      `${a.brand.name} en ${b.brand.name} liggen technisch dicht bij elkaar — kies op merkvoorkeur en model-specifieke specs`,
    );
  }

  return facts.slice(0, 3).join(". ") + ".";
}

// "When to pick brand A" — generates a short bullet list based on stats.
export function whenToPick(s: BrandStats, other: BrandStats): string[] {
  const out: string[] = [];
  if (s.midShare > other.midShare && s.midShare >= 0.5)
    out.push(`U heeft een bedrijfswagen met werkgever-terugbetaling (MID-meter)`);
  if (s.appShare === 1 && other.appShare < 1)
    out.push(`U wilt smart laden, app-bediening en remote rapportage`);
  if (s.warrantyMax > other.warrantyMax)
    out.push(`Lange garantie staat hoog op uw lijst`);
  if (s.hasOneFase && !other.hasOneFase)
    out.push(`U heeft een 1-fase 230V netaansluiting`);
  if (s.maxKw > other.maxKw)
    out.push(`U wilt later kunnen upgraden naar ${s.maxKw} kW`);
  if (s.models.length > other.models.length)
    out.push(`U houdt van keuze tussen ${s.models.length} verschillende modellen`);
  if (s.brand.country !== other.brand.country)
    out.push(`U heeft voorkeur voor ${s.brand.countryFlag} ${s.brand.country} ontwerp`);
  return out.slice(0, 4);
}
