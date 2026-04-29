import { useEffect } from "react";
import { SITE } from "@/lib/site";

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

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
  useEffect(() => {
    document.title = meta.title;
    setMeta("description", meta.description);
    setProperty("og:title", meta.title);
    setProperty("og:description", meta.description);
    setProperty("og:type", "website");
    setProperty("og:site_name", SITE.name);
    if (meta.canonical) {
      setLink("canonical", meta.canonical);
      setProperty("og:url", meta.canonical);
    }
    if (meta.ogImage) {
      setProperty("og:image", meta.ogImage);
    }
    setMeta(
      "robots",
      meta.noindex ? "noindex,nofollow" : "index,follow",
    );
  }, [
    meta.title,
    meta.description,
    meta.canonical,
    meta.ogImage,
    meta.noindex,
  ]);
}
