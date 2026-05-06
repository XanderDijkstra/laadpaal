import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { SITE } from "@/lib/site";

const COLS = [
  {
    title: "Laadpalen",
    links: [
      { label: "Beste laadpaal 2026", href: "/beste-laadpaal" },
      { label: "Alle modellen", href: "/laadpalen" },
      { label: "Alle merken", href: "/merken" },
      { label: "Per auto", href: "/auto" },
    ],
  },
  {
    title: "Installatie",
    links: [
      { label: "Installatie-gids", href: "/installatie" },
      { label: "Kosten", href: "/installatie/kosten" },
      { label: "AREI-keuring", href: "/installatie/arei-keuring" },
      { label: "1- vs 3-fase", href: "/installatie/1-fase-vs-3-fase" },
    ],
  },
  {
    title: "Vlaanderen",
    links: [
      { label: "Publieke laadpalen", href: "/laadpunten" },
      { label: "Alle gemeenten", href: "/gemeente" },
      { label: "Antwerpen", href: "/gemeente/antwerpen" },
      { label: "Gent", href: "/gemeente/gent" },
    ],
  },
  {
    title: "Tools & gids",
    links: [
      { label: "Laadkost berekenen", href: "/laadkost-berekenen" },
      { label: "Gids", href: "/gids" },
      { label: "Over ons", href: "/over-ons" },
      { label: "Voor installateurs", href: "/voor-installateurs" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container max-w-7xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-base tracking-tight text-secondary"
            >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              {SITE.shortName}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Onafhankelijk vergelijken van laadpalen voor thuis. Wij matchen u
              met erkende installateurs in uw gemeente.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-sm text-foreground mb-3">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {year} {SITE.name}. Alle prijzen incl. 6% btw waar van
            toepassing.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/voorwaarden" className="hover:text-foreground">
              Voorwaarden
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
