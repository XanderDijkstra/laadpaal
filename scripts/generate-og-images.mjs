// Generates per-charger and per-brand OG images as static SVG files.
// Output: public/og/charger/<slug>.svg, public/og/brand/<slug>.svg, public/og/default.svg
//
// SVGs are 1200×630 (Open Graph standard) and self-contained — no external assets,
// no fonts (uses generic sans-serif so social platforms don't need to fetch).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const NAVY = "#0A2540";
const PRIMARY = "#16A34A";
const ACCENT = "#FCD34D";

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ogSvg({ kicker, title, line2, line3, badge }) {
  const safeTitle = escapeXml(title);
  const safeKicker = escapeXml(kicker ?? "");
  const safeLine2 = escapeXml(line2 ?? "");
  const safeLine3 = escapeXml(line3 ?? "");
  const safeBadge = escapeXml(badge ?? "");
  // Keep the title under 30 chars for visual fit; otherwise wrap to two lines.
  const titleLines = wrap(safeTitle, 24);
  const titleY = titleLines.length === 1 ? 320 : 290;
  const titleSpans = titleLines
    .map(
      (line, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : 80}">${line}</tspan>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="#06182d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="630" fill="${PRIMARY}"/>
  <g font-family="Inter, system-ui, -apple-system, sans-serif" fill="white">
    <text x="80" y="160" font-size="28" font-weight="500" fill="${ACCENT}" letter-spacing="2">${safeKicker.toUpperCase()}</text>
    <text x="80" y="${titleY}" font-size="76" font-weight="800" letter-spacing="-2">${titleSpans}</text>
    <text x="80" y="465" font-size="32" font-weight="500" opacity="0.85">${safeLine2}</text>
    <text x="80" y="510" font-size="26" font-weight="400" opacity="0.65">${safeLine3}</text>
  </g>
  <g transform="translate(80 555)">
    <rect width="14" height="32" rx="2" fill="${PRIMARY}"/>
    <text x="28" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="white">Laadthuis</text>
  </g>
  ${
    safeBadge
      ? `<g transform="translate(960 80)">
    <rect width="160" height="44" rx="22" fill="${PRIMARY}"/>
    <text x="80" y="29" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="white">${safeBadge}</text>
  </g>`
      : ""
  }
</svg>`;
}

function wrap(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

async function readData(file) {
  return fs.readFile(path.join(ROOT, "src", "data", file), "utf-8");
}

function parseChargers(text) {
  const blocks = text.split(/^\s*\{$/gm);
  const result = [];
  for (const block of blocks) {
    const slug = block.match(/slug:\s*["']([a-z0-9-]+)["']/)?.[1];
    const name = block.match(/name:\s*["']([^"']+)["']/)?.[1];
    const brand = block.match(/brand:\s*["']([^"']+)["']/)?.[1];
    const maxKw = block.match(/maxKw:\s*(\d+)/)?.[1];
    const phases = block.match(/phases:\s*(\d+)/)?.[1];
    const priceAllInFrom = block.match(/priceAllInFrom:\s*(\d+)/)?.[1];
    if (slug && name && brand) {
      result.push({ slug, name, brand, maxKw, phases, priceAllInFrom });
    }
  }
  return result;
}

function parseBrands(text) {
  const blocks = text.split(/^\s*\{$/gm);
  const result = [];
  for (const block of blocks) {
    const slug = block.match(/slug:\s*["']([a-z0-9-]+)["']/)?.[1];
    const name = block.match(/name:\s*["']([^"']+)["']/)?.[1];
    const country = block.match(/country:\s*["']([^"']+)["']/)?.[1];
    const founded = block.match(/founded:\s*(\d+)/)?.[1];
    if (slug && name) result.push({ slug, name, country, founded });
  }
  return result;
}

function formatEuro(n) {
  return `€${Number(n).toLocaleString("nl-BE")}`;
}

async function main() {
  const start = Date.now();
  const [chargersText, brandsText] = await Promise.all([
    readData("chargers.ts"),
    readData("brands.ts"),
  ]);
  const chargers = parseChargers(chargersText);
  const brands = parseBrands(brandsText);

  const baseDir = path.join(ROOT, "public", "og");
  await fs.mkdir(path.join(baseDir, "charger"), { recursive: true });
  await fs.mkdir(path.join(baseDir, "brand"), { recursive: true });

  // Default site OG image
  await fs.writeFile(
    path.join(baseDir, "default.svg"),
    ogSvg({
      kicker: "Laadthuis",
      title: "Vergelijk en krijg 3 offertes",
      line2: "36 modellen · 18 merken · alle Vlaamse gemeenten",
      line3: "Inclusief 6% btw · gratis en vrijblijvend",
    }),
    "utf-8",
  );

  let cCount = 0;
  for (const c of chargers) {
    const phases = c.phases === "1" ? "1-fase" : "3-fase";
    const svg = ogSvg({
      kicker: c.brand,
      title: c.name,
      line2: `${c.maxKw} kW · ${phases}`,
      line3: "Specs, review en gratis offertes",
      badge: "VERGELIJK",
    });
    await fs.writeFile(
      path.join(baseDir, "charger", `${c.slug}.svg`),
      svg,
      "utf-8",
    );
    cCount += 1;
  }

  let bCount = 0;
  for (const b of brands) {
    const svg = ogSvg({
      kicker: b.country ?? "Laadpaal-merk",
      title: b.name,
      line2: b.founded ? `Sinds ${b.founded}` : "Laadpaalfabrikant",
      line3: "Modellen, specs en prijzen in België",
      badge: "MERK",
    });
    await fs.writeFile(
      path.join(baseDir, "brand", `${b.slug}.svg`),
      svg,
      "utf-8",
    );
    bCount += 1;
  }

  const ms = Date.now() - start;
  console.log(
    `[og-images] generated default + ${cCount} charger + ${bCount} brand SVGs in ${ms} ms`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
