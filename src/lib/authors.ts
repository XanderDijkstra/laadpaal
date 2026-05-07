// Editorial author profile referenced in Article / Review JSON-LD.
// Strengthens E-E-A-T (Experience, Expertise, Authority, Trust) signals.
import { SITE } from "./site";

export interface Author {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  sameAs?: string[];
}

export const REDACTIE: Author = {
  name: "Redactie Laadthuis",
  jobTitle: "EV-laadinfrastructuur redactie",
  description:
    "De redactie van Laadthuis analyseert publieke specs, eigenaars-reviews via installateursnetwerken in Vlaanderen, en officiële prijslijsten van erkende verdelers. Geen sponsoring, geen affiliate.",
  url: `${SITE.url}/over-ons`,
};

export function authorJsonLd(author: Author = REDACTIE) {
  return {
    "@type": "Person",
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.description,
    url: author.url,
    ...(author.sameAs ? { sameAs: author.sameAs } : {}),
  };
}

export function publisherJsonLd() {
  return {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/og/default.svg`,
      width: 1200,
      height: 630,
    },
  };
}
