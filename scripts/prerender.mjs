// Pre-render every known route to static HTML using the SSR bundle.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const DIST = path.join(ROOT, "dist");
const DIST_SSR = path.join(ROOT, "dist-ssr");

async function readSlugs(file) {
  const content = await fs.readFile(
    path.join(ROOT, "src", "data", file),
    "utf-8",
  );
  return [...content.matchAll(/slug:\s*["']([a-z0-9-]+)["']/g)].map(
    (m) => m[1],
  );
}

async function collectRoutes() {
  const [chargers, brands, comparisons, evModels, installationTopics, gemeenten, guides, glossary] =
    await Promise.all([
      readSlugs("chargers.ts"),
      readSlugs("brands.ts"),
      readSlugs("comparisons.ts"),
      readSlugs("evModels.ts"),
      readSlugs("installationTopics.ts"),
      readSlugs("gemeenten.ts"),
      readSlugs("guides.ts"),
      readSlugs("glossary.ts"),
    ]);

  const routes = [
    "/",
    "/offerte",
    "/offerte/verzonden",
    "/beste-laadpaal",
    "/laadkost-berekenen",
    "/laadpunten",
    "/laadpalen",
    "/merken",
    "/vergelijken",
    "/auto",
    "/installatie",
    "/gemeente",
    "/gids",
    "/woordenlijst",
    "/over-ons",
    "/voor-installateurs",
    "/contact",
    "/privacy",
    "/voorwaarden",
    "/admin",
  ];

  for (const s of chargers) routes.push(`/laadpalen/${s}`);
  for (const s of brands) routes.push(`/merken/${s}`);
  for (const s of comparisons) routes.push(`/vergelijken/${s}`);
  // Brand-vs-brand pairs (alphabetical canonical), C(N, 2) routes
  const sortedBrands = [...brands].sort();
  for (let i = 0; i < sortedBrands.length; i++) {
    for (let j = i + 1; j < sortedBrands.length; j++) {
      routes.push(`/merken-vergelijken/${sortedBrands[i]}-vs-${sortedBrands[j]}`);
    }
  }
  for (const s of evModels) routes.push(`/auto/${s}`);
  for (const s of installationTopics) routes.push(`/installatie/${s}`);
  for (const s of gemeenten) routes.push(`/gemeente/${s}`);
  for (const s of gemeenten) routes.push(`/laadpunten/${s}`);

  // Per-station detail pages — read ids from laadpunten.json
  try {
    const stationsRaw = await fs.readFile(
      path.join(ROOT, "src", "data", "laadpunten.json"),
      "utf-8",
    );
    const stations = JSON.parse(stationsRaw);
    if (Array.isArray(stations)) {
      for (const s of stations) {
        if (s && typeof s.id === "string" && /^[a-z0-9-]+$/.test(s.id)) {
          routes.push(`/laadpunt/${s.id}`);
        }
      }
    }
  } catch (err) {
    console.warn(
      "[prerender] kon laadpunten.json niet lezen:",
      err?.message ?? err,
    );
  }
  for (const s of guides) routes.push(`/gids/${s}`);
  for (const s of glossary) routes.push(`/woordenlijst/${s}`);

  return routes;
}

function routeToFile(route) {
  if (route === "/") return path.join(DIST, "index.html");
  // Strip leading slash, write to <route>/index.html for clean URLs
  const safe = route.replace(/^\/+/, "");
  return path.join(DIST, safe, "index.html");
}

async function main() {
  const start = Date.now();

  const ssrEntryPath = path.join(DIST_SSR, "entry-server.js");
  await fs.access(ssrEntryPath).catch(() => {
    throw new Error(
      `SSR bundle not found at ${ssrEntryPath}. Run \`vite build --ssr src/entry-server.tsx --outDir dist-ssr\` first.`,
    );
  });

  const ssrModule = await import(pathToFileURL(ssrEntryPath).href);
  const render = ssrModule.render;
  if (typeof render !== "function") {
    throw new Error("SSR bundle does not export `render`");
  }

  const template = await fs.readFile(path.join(DIST, "index.html"), "utf-8");
  if (!template.includes("<!--ssr-outlet-->")) {
    throw new Error("dist/index.html missing <!--ssr-outlet--> marker");
  }
  if (!template.includes("<!--ssr-head-->")) {
    throw new Error("dist/index.html missing <!--ssr-head--> marker");
  }

  const routes = await collectRoutes();
  let written = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const { html, head } = render(route);
      const out = template
        .replace("<!--ssr-outlet-->", html)
        .replace("<!--ssr-head-->", head);
      const file = routeToFile(route);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, out, "utf-8");
      written += 1;
    } catch (err) {
      failed += 1;
      console.error(`[prerender] FAILED ${route}:`, err?.message ?? err);
    }
  }

  // Render catch-all to dist/404.html so Vercel serves it for unknown URLs
  try {
    const { html, head } = render("/__not_found__");
    const out = template
      .replace("<!--ssr-outlet-->", html)
      .replace("<!--ssr-head-->", head);
    await fs.writeFile(path.join(DIST, "404.html"), out, "utf-8");
    written += 1;
  } catch (err) {
    failed += 1;
    console.error("[prerender] FAILED 404.html:", err?.message ?? err);
  }

  // Clean up SSR build artifacts so they don't ship to production
  await fs.rm(DIST_SSR, { recursive: true, force: true });

  const ms = Date.now() - start;
  console.log(
    `[prerender] wrote ${written} HTML files (${failed} failed) in ${ms} ms`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
