export interface Charger {
  slug: string;
  name: string;
  brandSlug: string;
  brand: string;
  maxKw: number;
  phases: 1 | 3;
  cable: "vast" | "socket";
  socketType?: "Type 2";
  app: boolean;
  rfid: boolean;
  midMeter: boolean;
  warrantyYears: number;
  priceFrom: number;
  priceAllInFrom: number;
  shortDescription: string;
  pros: string[];
  cons: string[];
}

export interface Brand {
  slug: string;
  name: string;
  country: string;
  countryFlag: string;
  description: string;
  founded?: number;
  modelSlugs: string[];
}

export interface Comparison {
  slug: string;
  a: string;
  b: string;
  title: string;
  verdict: string;
}

export interface EvModel {
  slug: string;
  brand: string;
  name: string;
  year: number;
  segment: string;
  batteryKwh: number;
  acMaxKw: number;
  connector: "Type 2" | "Type 2 + CCS";
  recommendedChargerSlug: string;
}

export interface Gemeente {
  slug: string;
  name: string;
  provincie: "Antwerpen" | "Limburg" | "Oost-Vlaanderen" | "West-Vlaanderen" | "Vlaams-Brabant";
  postcodes: string[];
  population: number;
  netbeheerder: "Fluvius";
  hasLocalPremie: boolean;
  premieDescription?: string;
}

export interface ChargingStation {
  id: string;            // unique slug e.g. "antwerpen-grote-markt-1"
  name: string;          // human-readable location name
  operator: string;      // operator slug, see operatorTariffs.ts
  address: string;
  postcode: string;
  gemeenteSlug: string;
  lat: number;
  lng: number;
  maxKw: number;         // highest power available at this station
  connectors: number;    // number of plugs
  type: "AC" | "DC" | "AC+DC";
  source: "ocm" | "fluvius" | "seed";
}

export interface OperatorTariff {
  slug: string;
  name: string;
  acPrice: number | null;   // €/kWh AC
  dcPrice: number | null;   // €/kWh DC
  startFee: number | null;  // €/sessie
  notes?: string;
  url?: string;
}

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone?: "info" | "warning" | "success"; title?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface GuideFAQ {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  lede: string;
  category: "premies" | "kosten" | "techniek" | "praktisch";
  updated: string;
  /** Optional rich body. If absent, the page renders a stub. */
  body?: GuideBlock[];
  /** Article-specific FAQ block. Used for FAQPage schema + accordion. */
  faqs?: GuideFAQ[];
  /** Explicit related guide slugs in addition to category-based suggestions. */
  related?: string[];
}

export interface InstallationTopic {
  slug: string;
  title: string;
  lede: string;
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  short: string;
}
