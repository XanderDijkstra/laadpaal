// Pings IndexNow (Bing, Yandex, Naver, Seznam) with all sitemap URLs after
// each successful build. Skips silently if INDEXNOW_KEY is missing.
//
// Setup on Vercel:
//   1. Generate a hex key: `openssl rand -hex 16` → e.g. "a1b2c3..."
//   2. Add INDEXNOW_KEY=<key> to Vercel env vars
//   3. The build writes dist/<key>.txt so /<key>.txt is served at the host
//   4. Each build POSTs the sitemap URL list to https://api.indexnow.org
//
// To force a hard fail when the key is missing (e.g. for CI sanity), set
// INDEXNOW_REQUIRE=1.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const KEY = process.env.INDEXNOW_KEY;
const REQUIRE = process.env.INDEXNOW_REQUIRE === "1";
const SITE_URL = process.env.SITE_URL ?? "https://laadthuis.be";

function bail(msg) {
  if (REQUIRE) {
    console.error(`[indexnow] ${msg}`);
    process.exit(1);
  }
  console.warn(`[indexnow] ${msg}`);
  process.exit(0);
}

async function main() {
  if (!KEY) {
    bail("no INDEXNOW_KEY env var — skipping ping");
    return;
  }
  if (!/^[a-z0-9-]{8,128}$/i.test(KEY)) {
    bail(`INDEXNOW_KEY must be 8-128 chars (a-z, 0-9, -); got ${KEY.length} chars`);
    return;
  }

  // Write the verification key file so /<key>.txt resolves to the key value
  const keyFile = path.join(DIST, `${KEY}.txt`);
  await fs.writeFile(keyFile, KEY, "utf-8");
  console.log(`[indexnow] wrote ${path.relative(ROOT, keyFile)}`);

  // Read sitemap.xml and extract URLs
  const sitemapPath = path.join(DIST, "sitemap.xml");
  const sitemap = await fs.readFile(sitemapPath, "utf-8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  if (urls.length === 0) {
    bail("no URLs in sitemap.xml");
    return;
  }

  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${KEY}.txt`;

  // IndexNow accepts up to 10,000 URLs per request
  const chunks = [];
  for (let i = 0; i < urls.length; i += 10000) chunks.push(urls.slice(i, i + 10000));

  let totalSubmitted = 0;
  for (const [idx, chunk] of chunks.entries()) {
    const body = {
      host,
      key: KEY,
      keyLocation,
      urlList: chunk,
    };
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    if (res.status >= 200 && res.status < 300) {
      totalSubmitted += chunk.length;
      console.log(
        `[indexnow] chunk ${idx + 1}/${chunks.length}: ${res.status} ${res.statusText}, ${chunk.length} URLs`,
      );
    } else {
      // Common: 422 (some URLs invalid) is non-fatal; log and continue
      const text = await res.text().catch(() => "");
      console.warn(
        `[indexnow] chunk ${idx + 1}/${chunks.length}: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`,
      );
      if (REQUIRE && res.status >= 500) process.exit(1);
    }
  }
  console.log(`[indexnow] total submitted: ${totalSubmitted}/${urls.length}`);
}

main().catch((err) => {
  console.error("[indexnow] failed:", err?.message ?? err);
  if (REQUIRE) process.exit(1);
  process.exit(0);
});
