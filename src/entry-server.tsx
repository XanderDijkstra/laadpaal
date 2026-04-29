import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { resetHead, getRecordedHead } from "@/lib/headStore";
import { renderHeadTags, type PageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";

const FALLBACK: PageMeta = {
  title: `${SITE.name} — vergelijk en krijg 3 offertes`,
  description:
    "Vergelijk gratis offertes voor een laadpaal van erkende installateurs in jouw gemeente. 6% btw automatisch berekend.",
};

export interface RenderResult {
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  resetHead();
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const recorded = getRecordedHead() ?? FALLBACK;
  const head = renderHeadTags(recorded);
  return { html, head };
}
