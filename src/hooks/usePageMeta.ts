import { useEffect } from "react";
import { SITE } from "@/lib/site";
import { recordHead } from "@/lib/headStore";

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const isServer = typeof window === "undefined";

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(prop: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(
    `meta[property="${prop}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta(meta: PageMeta) {
  const ogImage = meta.ogImage ?? `${SITE.url}/og/default.svg`;
  const enriched: PageMeta = { ...meta, ogImage };

  if (isServer) {
    recordHead(enriched);
  }

  useEffect(() => {
    document.title = enriched.title;
    setMeta("description", enriched.description);
    setProperty("og:title", enriched.title);
    setProperty("og:description", enriched.description);
    setProperty("og:type", "website");
    setProperty("og:site_name", SITE.name);
    if (enriched.canonical) {
      setLink("canonical", enriched.canonical);
      setProperty("og:url", enriched.canonical);
    }
    setProperty("og:image", enriched.ogImage!);
    setProperty("og:image:width", "1200");
    setProperty("og:image:height", "630");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:image", enriched.ogImage!);
    setMeta("twitter:title", enriched.title);
    setMeta("twitter:description", enriched.description);
    setMeta(
      "robots",
      enriched.noindex ? "noindex,nofollow" : "index,follow",
    );
  }, [
    enriched.title,
    enriched.description,
    enriched.canonical,
    enriched.ogImage,
    enriched.noindex,
  ]);
}

export function renderHeadTags(meta: PageMeta): string {
  const parts: string[] = [];
  parts.push(`<title>${escapeHtml(meta.title)}</title>`);
  parts.push(
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
  );
  parts.push(
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
  );
  parts.push(
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
  );
  parts.push(`<meta property="og:type" content="website" />`);
  parts.push(
    `<meta property="og:site_name" content="${escapeAttr(SITE.name)}" />`,
  );
  if (meta.canonical) {
    parts.push(
      `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    );
    parts.push(
      `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    );
  }
  const ogImage = meta.ogImage ?? `${SITE.url}/og/default.svg`;
  parts.push(
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
  );
  parts.push(`<meta property="og:image:width" content="1200" />`);
  parts.push(`<meta property="og:image:height" content="630" />`);
  parts.push(`<meta name="twitter:card" content="summary_large_image" />`);
  parts.push(
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
  );
  parts.push(
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
  );
  parts.push(
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
  );
  parts.push(
    `<meta name="robots" content="${meta.noindex ? "noindex,nofollow" : "index,follow"}" />`,
  );
  return parts.join("\n    ");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
