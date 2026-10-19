// Build-time sitemap generator. Loads src/data/* (TS transpiled on the fly)
// and emits public/sitemap.xml with a truthful <lastmod> per URL.
//
// How <lastmod> is determined
// ---------------------------
// Every URL declares the "sources" that drive its content: the page template
// (src/pages/*.tsx, plus content helpers like src/lib/brandPairs.ts) and the
// individual data RECORDS it renders (e.g. gemeenten.ts → record "gent",
// laadpunten.json → all stations with gemeenteSlug "gent"). Shared chrome
// (header/footer/global CSS) is deliberately NOT a source: changing the footer
// is not a content change of 400 pages.
//
// For each source we walk its git history (oldest → newest), hash every record
// per commit and remember the committer date of the last commit in which that
// record's hash changed. So editing one guide in guides.ts only bumps that
// guide's URL, not all 15. If the working tree differs from HEAD (uncommitted
// edits, or fetch-laadpunten.mjs just rewrote laadpunten.json with fresh OCM
// data) the changed records get the build time — that content really is new
// at build time. Unchanged fresh data keeps its old date.
//
// URL lastmod = max(date of its sources). Guides additionally take their own
// `updated` field into account.
//
// Fallbacks for CI without full git history (e.g. Vercel's shallow clone, or
// no .git at all): records whose last change lies at/before the shallow
// boundary are "unknown". We then use scripts/sitemap-lastmod.json — a cache of
// {url: {hash, lastmod}} written by every build that has full history (commit
// it). If the URL's content hash still matches the cache we reuse its date;
// otherwise the content changed after the cache was written, so we use the
// shallow boundary commit date (shallow clone) or the build time (no git).
// Setting VERCEL_DEEP_CLONE=true on Vercel avoids the fallback entirely.
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SITE_URL = process.env.SITE_URL ?? "https://laadthuis.be";
const CACHE_FILE = path.join(ROOT, "scripts", "sitemap-lastmod.json");
const BUILD_DATE = new Date();

// ------------------------------------------------------------------
// git helpers
// ------------------------------------------------------------------
function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

const GIT_OK = git(["rev-parse", "--verify", "HEAD"]) !== null;
const SHALLOW =
  GIT_OK && git(["rev-parse", "--is-shallow-repository"])?.trim() === "true";
const SHALLOW_BOUNDARY = new Set();
let SHALLOW_BOUNDARY_DATE = null;
if (SHALLOW) {
  const shallowFile = git(["rev-parse", "--git-path", "shallow"])?.trim();
  const abs = shallowFile ? path.resolve(ROOT, shallowFile) : null;
  if (abs && existsSync(abs)) {
    for (const sha of readFileSync(abs, "utf-8").split(/\s+/).filter(Boolean)) {
      SHALLOW_BOUNDARY.add(sha);
      const d = git(["show", "-s", "--format=%cI", sha])?.trim();
      if (d && (!SHALLOW_BOUNDARY_DATE || new Date(d) > SHALLOW_BOUNDARY_DATE)) {
        SHALLOW_BOUNDARY_DATE = new Date(d);
      }
    }
  }
}

// Sentinel for "changed at some unknown point before the shallow boundary".
const UNKNOWN = Symbol("unknown");

// ------------------------------------------------------------------
// Source extraction: file text → Map<recordKey, value>
// ------------------------------------------------------------------
async function evalTsArray(text) {
  const js = ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = await import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
  const arr = Object.values(mod).find(Array.isArray);
  if (!arr) throw new Error("no exported array");
  return arr;
}

function bySlug(arr, extra) {
  const m = new Map([["*", arr]]);
  for (const r of arr) {
    if (r && typeof r.slug === "string") m.set(r.slug, r);
  }
  if (extra) extra(arr, m);
  return m;
}

function groupInto(m, prefix, arr, keyFn) {
  for (const r of arr) {
    const k = `${prefix}=${keyFn(r)}`;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
}

const DATA = {
  chargers: {
    file: "src/data/chargers.ts",
    extract: async (t) =>
      bySlug(await evalTsArray(t), (arr, m) =>
        groupInto(m, "brand", arr, (c) => c.brandSlug),
      ),
  },
  brands: { file: "src/data/brands.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  comparisons: { file: "src/data/comparisons.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  evModels: { file: "src/data/evModels.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  gemeenten: { file: "src/data/gemeenten.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  guides: { file: "src/data/guides.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  installationTopics: { file: "src/data/installationTopics.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  glossary: { file: "src/data/glossary.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  operatorTariffs: { file: "src/data/operatorTariffs.ts", extract: async (t) => bySlug(await evalTsArray(t)) },
  laadpunten: {
    file: "src/data/laadpunten.json",
    extract: async (t) => {
      const arr = JSON.parse(t);
      const m = new Map([["*", arr]]);
      for (const s of arr) if (s && typeof s.id === "string") m.set(s.id, s);
      groupInto(m, "gemeente", arr, (s) => s.gemeenteSlug);
      return m;
    },
  },
};

const hash = (v) =>
  crypto
    .createHash("sha1")
    .update(typeof v === "string" ? v : JSON.stringify(v))
    .digest("hex");

async function hashesFor(text, extract) {
  if (!extract) return new Map([["*", hash(text)]]);
  try {
    const m = await extract(text);
    return new Map([...m].map(([k, v]) => [k, hash(v)]));
  } catch {
    // Old revision we can't evaluate — fall back to a whole-file hash.
    return new Map([["*", hash(text)]]);
  }
}

// ------------------------------------------------------------------
// History per source file → { changed: Map<key, Date|UNKNOWN>, current }
// ------------------------------------------------------------------
const historyCache = new Map();

async function history(rel, extract) {
  if (historyCache.has(rel)) return historyCache.get(rel);
  const changed = new Map();
  let headHashes = null;

  if (GIT_OK) {
    const log = git(["log", "--reverse", "--format=%H %cI", "--", rel]) ?? "";
    let prev = new Map();
    for (const line of log.split("\n").filter(Boolean)) {
      const [sha, date] = line.split(" ");
      const text = git(["show", `${sha}:${rel}`]);
      const hashes = text === null ? new Map() : await hashesFor(text, extract);
      const when = SHALLOW_BOUNDARY.has(sha) ? UNKNOWN : new Date(date);
      for (const [k, h] of hashes) {
        if (prev.get(k) !== h) changed.set(k, when);
      }
      prev = hashes;
    }
    headHashes = prev;
  }

  const currentText = await fs.readFile(path.join(ROOT, rel), "utf-8");
  const current = await hashesFor(currentText, extract);
  for (const [k, h] of current) {
    if (!headHashes) changed.set(k, UNKNOWN);
    // Working tree differs from HEAD → content is new as of this build.
    else if (headHashes.get(k) !== h) changed.set(k, BUILD_DATE);
    else if (!changed.has(k)) changed.set(k, UNKNOWN);
  }

  const result = { changed, current };
  historyCache.set(rel, result);
  return result;
}

// A source reference: [file, key] for data records, or "path.tsx" for a
// whole-file template source.
async function resolveSource(src) {
  const [rel, key] = Array.isArray(src) ? src : [src, "*"];
  const extract = Object.values(DATA).find((d) => d.file === rel)?.extract;
  const h = await history(rel, extract);
  return {
    date: h.changed.get(key) ?? UNKNOWN,
    hash: h.current.get(key) ?? "missing",
  };
}

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
const P = (name) => `src/pages/${name}.tsx`;
const D = (name, key = "*") => [DATA[name].file, key];

async function loadCurrent(name) {
  const text = await fs.readFile(path.join(ROOT, DATA[name].file), "utf-8");
  const m = await DATA[name].extract(text);
  return m.get("*");
}

async function collectUrls() {
  const data = {};
  for (const name of Object.keys(DATA)) data[name] = await loadCurrent(name);
  const urls = [];
  const add = (loc, priority, changefreq, sources, extraDates = []) =>
    urls.push({ loc, priority, changefreq, sources, extraDates });

  // Standalone unique pages + hubs
  add("/", 1.0, "weekly", [P("HomePage")]);
  add("/offerte", 1.0, "weekly", [P("OffertePage")]);
  add("/beste-laadpaal", 1.0, "monthly", [P("BesteLaadpaalPage"), D("chargers")]);
  add("/laadkost-berekenen", 0.9, "monthly", [P("LaadkostCalculatorPage"), D("operatorTariffs")]);
  add("/laadpunten", 0.9, "weekly", [P("LaadpuntenIndexPage"), D("laadpunten"), D("gemeenten"), D("operatorTariffs")]);
  add("/laadpalen", 0.9, "weekly", [P("LaadpalenIndexPage"), D("chargers")]);
  add("/vergelijken", 0.8, "monthly", [P("VergelijkenIndexPage"), D("comparisons"), D("brands")]);
  add("/merken-vergelijken", 0.8, "monthly", [P("MerkenVergelijkenIndexPage"), D("brands"), D("chargers")]);
  add("/merken", 0.9, "weekly", [P("MerkenIndexPage"), D("brands"), D("chargers")]);
  add("/auto", 0.9, "weekly", [P("AutoIndexPage"), D("evModels")]);
  add("/installatie", 0.9, "weekly", [P("InstallatiePillarPage"), D("installationTopics")]);
  add("/gemeente", 0.9, "weekly", [P("GemeenteIndexPage"), D("gemeenten"), D("laadpunten")]);
  add("/gids", 0.9, "weekly", [P("GidsIndexPage"), D("guides")]);
  add("/woordenlijst", 0.7, "monthly", [P("WoordenlijstIndexPage"), D("glossary")]);
  add("/over-ons", 0.5, "monthly", [P("OverOnsPage")]);
  add("/voor-installateurs", 0.6, "monthly", [P("VoorInstallateursPage")]);
  add("/contact", 0.4, "monthly", [P("ContactPage")]);
  add("/privacy", 0.3, "yearly", [P("PrivacyPage")]);
  add("/voorwaarden", 0.3, "yearly", [P("VoorwaardenPage")]);

  for (const c of data.chargers) {
    add(`/laadpalen/${c.slug}`, 0.8, "monthly", [P("LaadpaalDetailPage"), D("chargers", c.slug)]);
  }
  for (const b of data.brands) {
    add(`/merken/${b.slug}`, 0.8, "monthly", [
      P("MerkDetailPage"),
      D("brands", b.slug),
      D("chargers", `brand=${b.slug}`),
      D("brands"), // lists comparisons with every other brand
    ]);
  }
  for (const c of data.comparisons) {
    add(`/vergelijken/${c.slug}`, 0.7, "monthly", [
      P("VergelijkenDetailPage"),
      D("comparisons", c.slug),
      D("chargers", c.a),
      D("chargers", c.b),
    ]);
  }
  // Brand-vs-brand: alphabetical canonical slug, C(N, 2) combinations
  const sortedBrands = data.brands.map((b) => b.slug).sort();
  for (let i = 0; i < sortedBrands.length; i++) {
    for (let j = i + 1; j < sortedBrands.length; j++) {
      const [a, b] = [sortedBrands[i], sortedBrands[j]];
      add(`/merken-vergelijken/${a}-vs-${b}`, 0.7, "monthly", [
        P("MerkenVergelijkenDetailPage"),
        "src/lib/brandPairs.ts",
        D("brands", a),
        D("brands", b),
        D("chargers", `brand=${a}`),
        D("chargers", `brand=${b}`),
      ]);
    }
  }
  for (const ev of data.evModels) {
    add(`/auto/${ev.slug}`, 0.8, "monthly", [
      P("AutoDetailPage"),
      D("evModels", ev.slug),
      D("chargers", ev.recommendedChargerSlug),
    ]);
  }
  for (const t of data.installationTopics) {
    add(`/installatie/${t.slug}`, 0.7, "monthly", [P("InstallatieDetailPage"), D("installationTopics", t.slug)]);
  }
  for (const g of data.gemeenten) {
    add(`/gemeente/${g.slug}`, 0.8, "monthly", [
      P("GemeenteDetailPage"),
      D("gemeenten", g.slug),
      D("laadpunten", `gemeente=${g.slug}`),
    ]);
  }
  for (const g of data.gemeenten) {
    add(`/laadpunten/${g.slug}`, 0.8, "weekly", [
      P("LaadpuntenGemeentePage"),
      "src/components/LaadpuntenLijst.tsx",
      D("gemeenten", g.slug),
      D("laadpunten", `gemeente=${g.slug}`),
      D("operatorTariffs"),
    ]);
  }
  for (const s of data.laadpunten) {
    if (s && typeof s.id === "string" && /^[a-z0-9-]+$/.test(s.id)) {
      add(`/laadpunt/${s.id}`, 0.5, "weekly", [
        P("LaadpuntDetailPage"),
        D("laadpunten", s.id),
        D("operatorTariffs", s.operator),
      ]);
    }
  }
  for (const g of data.guides) {
    // Guides carry their own editorial `updated` date — use it too.
    add(`/gids/${g.slug}`, 0.7, "monthly", [P("GidsDetailPage"), D("guides", g.slug)], [g.updated]);
  }
  for (const t of data.glossary) {
    add(`/woordenlijst/${t.slug}`, 0.5, "monthly", [P("WoordenlijstDetailPage"), D("glossary", t.slug)]);
  }
  return urls;
}

// ------------------------------------------------------------------
// lastmod resolution
// ------------------------------------------------------------------
function w3c(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function resolveLastmod(u, cache, stats) {
  const resolved = await Promise.all(u.sources.map(resolveSource));
  const urlHash = hash(resolved.map((r) => r.hash).join("|"));
  const known = resolved.map((r) => r.date).filter((d) => d instanceof Date);
  const hasUnknown = resolved.some((r) => r.date === UNKNOWN);

  let date;
  if (!hasUnknown) {
    date = new Date(Math.max(...known.map(Number)));
    stats.git += 1;
  } else if (known.length > 0) {
    // Unknown sources changed before the shallow boundary, i.e. before every
    // known commit — so the newest known date is still correct.
    date = new Date(Math.max(...known.map(Number)));
    stats.git += 1;
  } else if (cache[u.loc]?.hash === urlHash) {
    date = new Date(cache[u.loc].lastmod);
    stats.cache += 1;
  } else {
    date = SHALLOW_BOUNDARY_DATE ?? BUILD_DATE;
    stats.fallback += 1;
  }
  for (const d of u.extraDates) {
    const x = new Date(d);
    if (!Number.isNaN(+x) && x > date) date = x;
  }
  return { lastmod: w3c(date), hash: urlHash };
}

function urlEntry(u) {
  return `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`;
}

async function main() {
  const urls = await collectUrls();
  const cache = await readCache();
  const stats = { git: 0, cache: 0, fallback: 0 };
  const nextCache = {};
  for (const u of urls) {
    const { lastmod, hash: h } = await resolveLastmod(u, cache, stats);
    u.lastmod = lastmod;
    nextCache[u.loc] = { hash: h, lastmod };
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(urlEntry).join("\n")}
</urlset>
`;

  const outDir = path.join(ROOT, "public");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "sitemap.xml"), xml, "utf-8");

  // Only a build with complete history produces authoritative dates.
  if (GIT_OK && !SHALLOW) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(nextCache, null, 1) + "\n", "utf-8");
  }

  const byPrefix = {};
  for (const u of urls) {
    const k = u.loc.split("/")[1] || "/";
    byPrefix[k] = (byPrefix[k] ?? 0) + 1;
  }
  // eslint-disable-next-line no-console
  console.log("[sitemap] wrote public/sitemap.xml", { ...byPrefix, total: urls.length });
  // eslint-disable-next-line no-console
  console.log(
    `[sitemap] lastmod source — git history: ${stats.git}, cache: ${stats.cache}, fallback: ${stats.fallback}` +
      (GIT_OK ? (SHALLOW ? " (shallow clone)" : "") : " (no git)"),
  );
  if (stats.fallback > 0) {
    console.warn(
      "[sitemap] some lastmod values are approximations — build with full git history (e.g. VERCEL_DEEP_CLONE=true) and commit scripts/sitemap-lastmod.json",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
