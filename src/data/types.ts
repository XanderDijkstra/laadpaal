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

export interface Guide {
  slug: string;
  title: string;
  lede: string;
  category: "premies" | "kosten" | "techniek" | "praktisch";
  updated: string;
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
