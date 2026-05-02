// Fetcht alle publieke laadpunten in Vlaanderen via Open Charge Map.
//
//   OCM_API_KEY=xxxxxxxx node scripts/fetch-laadpunten.mjs
//
// Registreer een gratis key op https://openchargemap.org/site/loginprovider/
// Schrijft naar src/data/laadpunten.ts en overschrijft de seed dataset.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const OCM_KEY = process.env.OCM_API_KEY;
if (!OCM_KEY) {
  console.error(
    "FATAL: set OCM_API_KEY env var. Register at https://openchargemap.org/",
  );
  process.exit(1);
}

const VLAAMS_PROVINCIES = new Set([
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "West-Vlaanderen",
  "Vlaams-Brabant",
  "Antwerp",
  "Limbourg",
  "East Flanders",
  "West Flanders",
  "Flemish Brabant",
]);

// Mapping van OCM-operator naar onze tariff slugs (operatorTariffs.ts).
const OPERATOR_MAP = {
  Allego: "allego",
  "Allego BV": "allego",
  TotalEnergies: "totalenergies",
  Total: "totalenergies",
  Pluginvest: "pluginvest",
  "Pluginvest NV": "pluginvest",
  "ENGIE Mobility": "engie",
  ENGIE: "engie",
  "Tesla Inc": "tesla",
  Tesla: "tesla",
  IONITY: "ionity",
  "Ionity GmbH": "ionity",
  "Fastned BV": "fastned",
  Fastned: "fastned",
  "Shell Recharge": "shell-recharge",
  "Shell Recharge Solutions": "shell-recharge",
  "Blue Corner": "blue-corner",
  Mobiflow: "mobiflow",
  "Eneco eMobility": "eneco",
  Eneco: "eneco",
  Stroohm: "stroohm",
};

function normalizeOperator(name) {
  if (!name) return "onbekend";
  if (OPERATOR_MAP[name]) return OPERATOR_MAP[name];
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(OPERATOR_MAP)) {
    if (lower.includes(k.toLowerCase())) return v;
  }
  return "onbekend";
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function readGemeenten() {
  const text = await fs.readFile(
    path.join(ROOT, "src", "data", "gemeenten.ts"),
    "utf-8",
  );
  // Pak slug + postcodes uit elk gemeente-record
  const blocks = text.split(/^\s*\{ slug:/gm).slice(1);
  const result = [];
  for (const block of blocks) {
    const slug = block.match(/^\s*"([a-z0-9-]+)"/)?.[1];
    const postcodes = (block.match(/postcodes:\s*\[([^\]]+)\]/)?.[1] ?? "")
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""))
      .filter(Boolean);
    if (slug) result.push({ slug, postcodes });
  }
  return result;
}

function gemeenteSlugForPostcode(postcode, gemeenten) {
  const g = gemeenten.find((x) => x.postcodes.includes(postcode));
  return g?.slug ?? null;
}

async function fetchPage(offset, limit, country = "BE") {
  const url = new URL("https://api.openchargemap.io/v3/poi");
  url.searchParams.set("countrycode", country);
  url.searchParams.set("maxresults", String(limit));
  url.searchParams.set("startindex", String(offset));
  url.searchParams.set("compact", "true");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("output", "json");
  url.searchParams.set("key", OCM_KEY);

  const res = await fetch(url, {
    headers: { "User-Agent": "laadpaal-vlaanderen/0.1 (build script)" },
  });
  if (!res.ok) {
    throw new Error(`OCM fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function pickConnections(connections) {
  if (!Array.isArray(connections)) return { maxKw: 0, count: 0, type: "AC" };
  const kws = connections
    .map((c) => Number(c.PowerKW ?? 0))
    .filter((n) => Number.isFinite(n) && n > 0);
  const maxKw = kws.length ? Math.round(Math.max(...kws)) : 0;
  const count = connections.length;
  const hasDc = connections.some((c) => {
    const t = c.CurrentTypeID;
    return t === 30 || t === 20; // OCM: 30=DC, 20=AC three-phase, 10=AC single
  });
  const hasAc = connections.some((c) => {
    const t = c.CurrentTypeID;
    return t === 10 || t === 20;
  });
  const type = hasDc && hasAc ? "AC+DC" : hasDc ? "DC" : "AC";
  return { maxKw, count, type };
}

function normalizeStation(poi, gemeenten) {
  const a = poi.AddressInfo ?? {};
  const province = a.StateOrProvince ?? "";
  if (!VLAAMS_PROVINCIES.has(province)) return null;

  const postcode = (a.Postcode ?? "").trim();
  const gemeenteSlug = gemeenteSlugForPostcode(postcode, gemeenten);
  if (!gemeenteSlug) return null; // outside our gemeente set

  const { maxKw, count, type } = pickConnections(poi.Connections);
  if (maxKw < 7) return null; // skip low-power household sockets

  const operatorName = poi.OperatorInfo?.Title ?? "";
  const operator = normalizeOperator(operatorName);
  const baseId = `${gemeenteSlug}-${slugify(a.Title ?? a.AddressLine1 ?? `poi-${poi.ID}`)}`;

  return {
    id: baseId.slice(0, 80),
    name: a.Title ?? `Laadpunt ${a.Town ?? ""}`.trim(),
    operator,
    address: a.AddressLine1 ?? "",
    postcode,
    gemeenteSlug,
    lat: a.Latitude,
    lng: a.Longitude,
    maxKw,
    connectors: count,
    type,
    source: "ocm",
  };
}

async function main() {
  const gemeenten = await readGemeenten();
  console.log(`[fetch-laadpunten] ${gemeenten.length} Vlaams gemeenten geladen`);

  const stations = [];
  const ids = new Set();
  let offset = 0;
  const pageSize = 500;
  let kept = 0;
  let total = 0;

  while (true) {
    const page = await fetchPage(offset, pageSize);
    if (!Array.isArray(page) || page.length === 0) break;
    total += page.length;
    for (const poi of page) {
      const s = normalizeStation(poi, gemeenten);
      if (!s) continue;
      let id = s.id;
      let i = 2;
      while (ids.has(id)) id = `${s.id}-${i++}`;
      s.id = id;
      ids.add(id);
      stations.push(s);
      kept += 1;
    }
    if (page.length < pageSize) break;
    offset += pageSize;
    if (offset > 20000) break; // safety
  }

  console.log(
    `[fetch-laadpunten] ${total} OCM POIs gefetcht, ${kept} bewaard (Vlaanderen)`,
  );

  // Sort: gemeente, dan operator, dan id
  stations.sort(
    (a, b) =>
      a.gemeenteSlug.localeCompare(b.gemeenteSlug) ||
      a.operator.localeCompare(b.operator) ||
      a.id.localeCompare(b.id),
  );

  const ts = `// AUTOGENERATED door scripts/fetch-laadpunten.mjs op ${new Date().toISOString()}.
// ${kept} laadpunten in Vlaanderen, gegroepeerd per gemeente. Niet manueel bewerken.
import type { ChargingStation } from "./types";

export const laadpunten: ChargingStation[] = ${JSON.stringify(stations, null, 2)};

export function laadpuntenInGemeente(gemeenteSlug: string): ChargingStation[] {
  return laadpunten.filter((p) => p.gemeenteSlug === gemeenteSlug);
}

export function laadpuntenInProvincie(provincieGemeenten: string[]): ChargingStation[] {
  const set = new Set(provincieGemeenten);
  return laadpunten.filter((p) => set.has(p.gemeenteSlug));
}

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
`;

  const outPath = path.join(ROOT, "src", "data", "laadpunten.ts");
  await fs.writeFile(outPath, ts, "utf-8");
  console.log(`[fetch-laadpunten] geschreven naar ${path.relative(ROOT, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
