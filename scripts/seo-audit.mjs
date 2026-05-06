// Static SEO audit — scans every HTML file in dist/ and reports issues.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const TITLE_MIN = 25;
const TITLE_MAX = 70;
const DESC_MIN = 70;
const DESC_MAX = 165;

async function listHtml(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await listHtml(p, results);
    else if (e.name.endsWith(".html")) results.push(p);
  }
  return results;
}

function pick(text, regex) {
  const m = text.match(regex);
  return m ? m[1] : null;
}

function pickAll(text, regex) {
  return [...text.matchAll(regex)].map((m) => m[1]);
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function audit(html, relPath) {
  const issues = [];
  const out = { relPath, title: null, description: null, canonical: null, ogImage: null };

  // <title>
  const title = pick(html, /<title>([^<]*)<\/title>/);
  out.title = title ? decodeEntities(title) : null;
  if (!title) issues.push({ level: "error", code: "title-missing", msg: "geen <title>" });
  else if (title.length < TITLE_MIN)
    issues.push({ level: "warn", code: "title-short", msg: `title ${title.length} chars (<${TITLE_MIN})` });
  else if (title.length > TITLE_MAX)
    issues.push({ level: "warn", code: "title-long", msg: `title ${title.length} chars (>${TITLE_MAX})` });

  // meta description
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  out.description = desc ? decodeEntities(desc) : null;
  if (!desc) issues.push({ level: "error", code: "desc-missing", msg: "geen meta description" });
  else {
    if (desc.length < DESC_MIN)
      issues.push({ level: "warn", code: "desc-short", msg: `desc ${desc.length} chars (<${DESC_MIN})` });
    if (desc.length > DESC_MAX)
      issues.push({ level: "warn", code: "desc-long", msg: `desc ${desc.length} chars (>${DESC_MAX})` });
  }

  // canonical
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  out.canonical = canonical;
  if (!canonical) issues.push({ level: "error", code: "canonical-missing", msg: "geen canonical link" });
  else if (!canonical.startsWith("https://"))
    issues.push({ level: "error", code: "canonical-not-https", msg: `canonical not https: ${canonical}` });

  // OG image
  const ogImage = pick(html, /<meta property="og:image" content="([^"]*)"/);
  out.ogImage = ogImage;
  if (!ogImage) issues.push({ level: "warn", code: "og-image-missing", msg: "geen og:image" });

  // og:title / og:description present?
  if (!html.match(/<meta property="og:title"/))
    issues.push({ level: "warn", code: "og-title-missing", msg: "geen og:title" });
  if (!html.match(/<meta property="og:description"/))
    issues.push({ level: "warn", code: "og-description-missing", msg: "geen og:description" });

  // robots
  const robots = pick(html, /<meta name="robots" content="([^"]*)"/);
  if (!robots) issues.push({ level: "warn", code: "robots-missing", msg: "geen robots meta" });

  // H1
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count === 0) issues.push({ level: "error", code: "h1-missing", msg: "geen <h1>" });
  else if (h1Count > 1)
    issues.push({ level: "error", code: "h1-multiple", msg: `${h1Count}× <h1>` });

  // Heading order (h3 niet vóór h2 op niveau)
  const headingSeq = pickAll(html, /<h([2-6])[\s>]/g).map(Number);
  let lastHeading = 1;
  for (const h of headingSeq) {
    if (h > lastHeading + 1) {
      issues.push({
        level: "warn",
        code: "heading-skip",
        msg: `heading skipped: jumped from h${lastHeading} to h${h}`,
      });
      break;
    }
    lastHeading = h;
  }

  // lang attr
  const lang = pick(html, /<html\s+lang="([^"]*)"/);
  if (lang !== "nl-BE")
    issues.push({ level: "warn", code: "lang", msg: `lang=${lang}, expected nl-BE` });

  // viewport
  if (!html.match(/<meta name="viewport"/))
    issues.push({ level: "error", code: "viewport-missing", msg: "geen viewport meta" });

  // <img> zonder alt
  const imgsWithoutAlt = pickAll(html, /<img\b((?:(?!\salt=)[^>])*)>/g);
  if (imgsWithoutAlt.length > 0)
    issues.push({
      level: "warn",
      code: "img-alt",
      msg: `${imgsWithoutAlt.length} <img> zonder alt`,
    });

  // JSON-LD parse
  const jsonLdBlocks = pickAll(
    html,
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  );
  let jsonLdCount = 0;
  for (const json of jsonLdBlocks) {
    try {
      JSON.parse(json);
      jsonLdCount += 1;
    } catch (err) {
      issues.push({
        level: "error",
        code: "jsonld-parse",
        msg: `JSON-LD parse error: ${err.message}`,
      });
    }
  }
  out.jsonLdCount = jsonLdCount;
  if (jsonLdCount === 0)
    issues.push({ level: "warn", code: "jsonld-missing", msg: "geen JSON-LD" });

  // SSR-outlet markers leaked
  if (html.includes("<!--ssr-outlet-->"))
    issues.push({ level: "error", code: "ssr-outlet-leak", msg: "SSR placeholder niet vervangen" });
  if (html.includes("<!--ssr-head-->"))
    issues.push({ level: "error", code: "ssr-head-leak", msg: "SSR head placeholder niet vervangen" });

  // Body content niet leeg
  const bodyText = (html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? "").replace(
    /<[^>]+>/g,
    "",
  );
  const bodyTextTrimmed = bodyText.replace(/\s+/g, " ").trim();
  if (bodyTextTrimmed.length < 200)
    issues.push({
      level: "warn",
      code: "thin-content",
      msg: `body text only ${bodyTextTrimmed.length} chars`,
    });

  return { ...out, issues };
}

async function main() {
  const files = await listHtml(DIST);
  console.log(`[audit] scanning ${files.length} HTML files in dist/`);

  const reports = [];
  for (const file of files) {
    const html = await fs.readFile(file, "utf-8");
    const rel = path.relative(DIST, file);
    reports.push(audit(html, rel));
  }

  // Aggregate stats
  const issueCounts = {};
  let totalErrors = 0;
  let totalWarns = 0;
  for (const r of reports) {
    for (const i of r.issues) {
      issueCounts[i.code] = (issueCounts[i.code] ?? 0) + 1;
      if (i.level === "error") totalErrors += 1;
      else totalWarns += 1;
    }
  }

  // Duplicates
  const titleMap = new Map();
  const descMap = new Map();
  const canonicalMap = new Map();
  for (const r of reports) {
    if (r.title) {
      if (!titleMap.has(r.title)) titleMap.set(r.title, []);
      titleMap.get(r.title).push(r.relPath);
    }
    if (r.description) {
      if (!descMap.has(r.description)) descMap.set(r.description, []);
      descMap.get(r.description).push(r.relPath);
    }
    if (r.canonical) {
      if (!canonicalMap.has(r.canonical)) canonicalMap.set(r.canonical, []);
      canonicalMap.get(r.canonical).push(r.relPath);
    }
  }

  const duplicateTitles = [...titleMap.entries()].filter(([, paths]) => paths.length > 1);
  const duplicateDescs = [...descMap.entries()].filter(([, paths]) => paths.length > 1);
  const duplicateCanonicals = [...canonicalMap.entries()].filter(([, paths]) => paths.length > 1);

  // Sitemap audit
  const sitemap = await fs.readFile(path.join(DIST, "sitemap.xml"), "utf-8");
  const sitemapUrls = pickAll(sitemap, /<loc>([^<]+)<\/loc>/g);
  // Map dist/foo/index.html → /foo, dist/index.html → /
  const renderedPaths = new Set(
    reports.map((r) => {
      const rel = r.relPath.replace(/[\\/]?index\.html$/, "").replace(/\\/g, "/");
      return rel === "" ? "/" : `/${rel}`;
    }),
  );

  const sitemapButNoFile = [];
  for (const url of sitemapUrls) {
    const u = new URL(url);
    let p = u.pathname.replace(/\/+$/, "");
    if (p === "") p = "/";
    if (!renderedPaths.has(p)) sitemapButNoFile.push(url);
  }

  // Verslag
  const sep = "─".repeat(72);
  console.log("\n" + sep);
  console.log("ISSUE TALLY");
  console.log(sep);
  for (const [code, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(4)} × ${code}`);
  }
  console.log(`\n  TOTAL: ${totalErrors} errors, ${totalWarns} warnings\n`);

  console.log(sep);
  console.log("DUPLICATES");
  console.log(sep);
  console.log(`  ${duplicateTitles.length} duplicate <title>`);
  console.log(`  ${duplicateDescs.length} duplicate meta descriptions`);
  console.log(`  ${duplicateCanonicals.length} duplicate canonicals`);

  if (duplicateTitles.length > 0) {
    console.log("\n  Top 5 dup titles:");
    duplicateTitles.slice(0, 5).forEach(([t, paths]) => {
      console.log(`    "${t.slice(0, 70)}" — ${paths.length}× (${paths[0]} …)`);
    });
  }
  if (duplicateCanonicals.length > 0) {
    console.log("\n  Top 5 dup canonicals:");
    duplicateCanonicals.slice(0, 5).forEach(([c, paths]) => {
      console.log(`    ${c} — ${paths.length}× (${paths[0]} …)`);
    });
  }

  console.log("\n" + sep);
  console.log("SITEMAP CONSISTENCY");
  console.log(sep);
  console.log(`  ${sitemapUrls.length} URLs in sitemap.xml`);
  console.log(`  ${renderedPaths.size} rendered HTML files`);
  console.log(`  ${sitemapButNoFile.length} sitemap URLs without rendered file`);
  if (sitemapButNoFile.length > 0) {
    console.log("\n  First missing:");
    sitemapButNoFile.slice(0, 8).forEach((u) => console.log(`    ${u}`));
  }

  console.log("\n" + sep);
  console.log("PER-FILE ISSUES");
  console.log(sep);
  const offenders = reports.filter((r) => r.issues.length > 0);
  if (offenders.length === 0) {
    console.log("  No per-file issues — all clean!");
  } else {
    console.log(`  ${offenders.length}/${reports.length} files have issues\n`);
    // Print only files with errors first, then warnings
    const errorOffenders = offenders.filter((r) =>
      r.issues.some((i) => i.level === "error"),
    );
    const warnOnly = offenders.filter(
      (r) => !r.issues.some((i) => i.level === "error"),
    );
    for (const r of errorOffenders.slice(0, 20)) {
      console.log(`  ${r.relPath}`);
      r.issues.forEach((i) => {
        console.log(`    [${i.level}] ${i.code}: ${i.msg}`);
      });
    }
    for (const r of warnOnly.slice(0, 30)) {
      console.log(`  ${r.relPath}`);
      r.issues.forEach((i) => {
        console.log(`    [${i.level}] ${i.code}: ${i.msg}`);
      });
    }
    if (warnOnly.length > 30) {
      console.log(`\n  …and ${warnOnly.length - 30} more.`);
    }
  }
  console.log(sep);

  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
