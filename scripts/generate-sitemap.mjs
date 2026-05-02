// Build-time sitemap generator. Reads data from src/data/* via dynamic import.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SITE_URL =
  process.env.SITE_URL ?? "https://laadpaal.vlaanderen";

async function loadData() {
  // Light TS-stripping: read each data file as text and strip type imports.
  // Simpler: use a small helper that re-exports plain JS via node --experimental-vm-modules
  // We'll dynamic-import after writing temp .mjs versions if needed. For now we
  // parse the slug fields with a light regex since shapes are stable.
  const dataDir = path.join(ROOT, "src", "data");
  const files = [
    "chargers.ts",
    "brands.ts",
    "comparisons.ts",
    "evModels.ts",
    "gemeenten.ts",
    "guides.ts",
    "installationTopics.ts",
    "glossary.ts",
  ];
  const out = {};
  for (const f of files) {
    const content = await fs.readFile(path.join(dataDir, f), "utf-8");
    const slugs = [...content.matchAll(/slug:\s*["']([a-z0-9-]+)["']/g)].map(
      (m) => m[1],
    );
    out[f.replace(".ts", "")] = slugs;
  }
  return out;
}

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

async function main() {
  const data = await loadData();
  const urls = [];

  // Standalone unique pages
  urls.push(urlEntry("/", 1.0, "weekly"));
  urls.push(urlEntry("/offerte", 1.0, "weekly"));
  urls.push(urlEntry("/beste-laadpaal", 1.0, "monthly"));
  urls.push(urlEntry("/laadkost-berekenen", 0.9, "monthly"));
  urls.push(urlEntry("/laadpunten", 0.9, "weekly"));
  urls.push(urlEntry("/laadpalen", 0.9, "weekly"));
  urls.push(urlEntry("/merken", 0.9, "weekly"));
  urls.push(urlEntry("/auto", 0.9, "weekly"));
  urls.push(urlEntry("/installatie", 0.9, "weekly"));
  urls.push(urlEntry("/gemeente", 0.9, "weekly"));
  urls.push(urlEntry("/gids", 0.9, "weekly"));
  urls.push(urlEntry("/woordenlijst", 0.7, "monthly"));
  urls.push(urlEntry("/over-ons", 0.5, "monthly"));
  urls.push(urlEntry("/voor-installateurs", 0.6, "monthly"));
  urls.push(urlEntry("/contact", 0.4, "monthly"));
  urls.push(urlEntry("/privacy", 0.3, "yearly"));
  urls.push(urlEntry("/voorwaarden", 0.3, "yearly"));

  for (const slug of data.chargers) urls.push(urlEntry(`/laadpalen/${slug}`, 0.8, "monthly"));
  for (const slug of data.brands) urls.push(urlEntry(`/merken/${slug}`, 0.8, "monthly"));
  for (const slug of data.comparisons) urls.push(urlEntry(`/vergelijken/${slug}`, 0.7, "monthly"));
  for (const slug of data.evModels) urls.push(urlEntry(`/auto/${slug}`, 0.8, "monthly"));
  for (const slug of data.installationTopics) urls.push(urlEntry(`/installatie/${slug}`, 0.7, "monthly"));
  for (const slug of data.gemeenten) urls.push(urlEntry(`/gemeente/${slug}`, 0.8, "monthly"));
  for (const slug of data.gemeenten) urls.push(urlEntry(`/laadpunten/${slug}`, 0.8, "weekly"));
  for (const slug of data.guides) urls.push(urlEntry(`/gids/${slug}`, 0.7, "monthly"));
  for (const slug of data.glossary) urls.push(urlEntry(`/woordenlijst/${slug}`, 0.5, "monthly"));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const outDir = path.join(ROOT, "public");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "sitemap.xml"), xml, "utf-8");

  const counts = {
    standalone: 17,
    chargers: data.chargers.length,
    brands: data.brands.length,
    comparisons: data.comparisons.length,
    evModels: data.evModels.length,
    installationTopics: data.installationTopics.length,
    gemeenten: data.gemeenten.length,
    guides: data.guides.length,
    glossary: data.glossary.length,
    total: urls.length,
  };
  // eslint-disable-next-line no-console
  console.log("[sitemap] wrote public/sitemap.xml", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Suppress unused import lint
void pathToFileURL;
