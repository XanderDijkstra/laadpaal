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
const REQUIRE_KEY = process.env.OCM_REQUIRE_KEY === "1";
if (!OCM_KEY) {
  const msg =
    "[fetch-laadpunten] no OCM_API_KEY env var — keeping existing seed data";
  if (REQUIRE_KEY) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(msg);
  process.exit(0);
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
    headers: { "User-Agent": "laadthuis.be/0.1 (build script)" },
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

// OCM UsageTypeID — only keep publicly-accessible chargers.
// 1 Public, 4 Public-Membership, 5 Public-PayAtLocation, 7 Public-NoticeRequired
const PUBLIC_USAGE_TYPES = new Set([1, 4, 5, 7]);
// Skip: 2 Private (Restricted), 3 Privately Owned, 6 Private staff/visitors

function normalizeStation(poi, gemeenten) {
  const a = poi.AddressInfo ?? {};
  const province = a.StateOrProvince ?? "";
  if (!VLAAMS_PROVINCIES.has(province)) return null;

  // Drop private/restricted entries (home chargers, staff parkings, …)
  const usageType = poi.UsageTypeID;
  if (typeof usageType === "number" && !PUBLIC_USAGE_TYPES.has(usageType)) {
    return null;
  }

  const postcode = (a.Postcode ?? "").trim();
  const gemeenteSlug = gemeenteSlugForPostcode(postcode, gemeenten);
  if (!gemeenteSlug) return null; // outside our gemeente set

  const { maxKw, count, type } = pickConnections(poi.Connections);
  if (maxKw < 7) return null; // skip low-power household sockets

  // Sanity-check coordinates and round to 4 decimals (~11 m precision).
  // Anything closer than 11m is the same physical site — collapse it later.
  const lat = Number(a.Latitude);
  const lng = Number(a.Longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;

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
    lat: roundedLat,
    lng: roundedLng,
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
    `[fetch-laadpunten] ${total} OCM POIs gefetcht, ${kept} bewaard na filter (Vlaanderen, publiek, ≥7 kW)`,
  );

  // ── Stap 1: drop "phantom" coördinaten ────────────────────────────────
  // OCM-entries zonder echte GPS krijgen vaak het stadscentrum als plaatsvervanger.
  // Wanneer 8+ verschillende stations exact dezelfde lat/lng delen, is dat
  // bijna zeker een placeholder en geen 8 echte fysieke laadpunten.
  const PHANTOM_THRESHOLD = 8;
  const countByCoord = new Map();
  for (const s of stations) {
    const k = `${s.lat}|${s.lng}`;
    countByCoord.set(k, (countByCoord.get(k) ?? 0) + 1);
  }
  const phantomKeys = new Set(
    [...countByCoord.entries()]
      .filter(([, n]) => n >= PHANTOM_THRESHOLD)
      .map(([k]) => k),
  );
  const real = stations.filter(
    (s) => !phantomKeys.has(`${s.lat}|${s.lng}`),
  );
  console.log(
    `[fetch-laadpunten] ${stations.length - real.length} phantom-stations gedropt op ${phantomKeys.size} placeholder-coördinaten`,
  );

  // ── Stap 2: merge stations op zelfde coord+operator ───────────────────
  // Dezelfde fysieke locatie staat in OCM soms meerdere keren (één per stekker).
  // Merge ze tot één marker met cumulatief aantal stekkers en max kW.
  const merged = new Map();
  for (const s of real) {
    const k = `${s.lat}|${s.lng}|${s.operator}`;
    const existing = merged.get(k);
    if (!existing) {
      merged.set(k, { ...s });
      continue;
    }
    existing.connectors += s.connectors;
    existing.maxKw = Math.max(existing.maxKw, s.maxKw);
    if (existing.type !== s.type) existing.type = "AC+DC";
    // Verkies een specifieke naam over een generieke "Laadpunt X"
    if (
      (existing.name?.startsWith("Laadpunt ") || !existing.name) &&
      s.name &&
      !s.name.startsWith("Laadpunt ")
    ) {
      existing.name = s.name;
    }
  }
  const finalStations = [...merged.values()];
  console.log(
    `[fetch-laadpunten] ${real.length - finalStations.length} duplicaten samengevoegd → ${finalStations.length} unieke locaties`,
  );

  const stationsOut = finalStations;
  // Sort: gemeente, dan operator, dan id
  stationsOut.sort(
    (a, b) =>
      a.gemeenteSlug.localeCompare(b.gemeenteSlug) ||
      a.operator.localeCompare(b.operator) ||
      a.id.localeCompare(b.id),
  );

  const json = JSON.stringify(stationsOut, null, 2) + "\n";
  const outPath = path.join(ROOT, "src", "data", "laadpunten.json");
  await fs.writeFile(outPath, json, "utf-8");
  console.log(
    `[fetch-laadpunten] geschreven naar ${path.relative(ROOT, outPath)} (${stationsOut.length} stations)`,
  );
}

main().catch((err) => {
  console.error("[fetch-laadpunten] failed:", err?.message ?? err);
  if (REQUIRE_KEY) process.exit(1);
  console.warn("[fetch-laadpunten] keeping existing seed data, build continues");
  process.exit(0);
});
