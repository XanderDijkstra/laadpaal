import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { comparisons } from "@/data/comparisons";
import { brands } from "@/data/brands";
import { pairSlug } from "@/lib/brandPairs";

const FEATURED_BRAND_PAIRS: [string, string][] = [
  ["easee", "zaptec"],
  ["easee", "wallbox"],
  ["zaptec", "wallbox"],
  ["alfen", "easee"],
  ["alfen", "zaptec"],
  ["tesla", "easee"],
  ["myenergi", "easee"],
  ["abb", "alfen"],
  ["keba", "mennekes"],
];

export default function VergelijkenIndexPage() {
  usePageMeta({
    title: `Laadpalen vergelijken — alle ${comparisons.length} head-to-head reviews`,
    description: `Eerlijke vergelijkingen tussen populaire laadpalen voor Vlaanderen. ${comparisons.length} side-by-side reviews met conclusie en specs.`,
    canonical: `${SITE.url}/vergelijken`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Vergelijken" },
      ]}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Laadpalen vergelijken",
          url: `${SITE.url}/vergelijken`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: comparisons.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE.url}/vergelijken/${c.slug}`,
              name: c.title,
            })),
          },
        }}
      />

      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpalen vergelijken
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          {comparisons.length} eerlijke head-to-head reviews tussen populaire
          modellen. Specs, prijs, sterke en zwakke punten — met onze conclusie.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Merk-vergelijkingen</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Volledige merk-lineup naast elkaar — prijs, MID-meter, garantie en alle modellen vergeleken.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          {FEATURED_BRAND_PAIRS.map(([a, b]) => {
            const ba = brands.find((br) => br.slug === a);
            const bb = brands.find((br) => br.slug === b);
            if (!ba || !bb) return null;
            return (
              <Link
                key={`${a}-${b}`}
                to={`/merken-vergelijken/${pairSlug(a, b)}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="font-semibold">
                  {ba.name} <span className="text-muted-foreground">vs</span> {bb.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Volledig merk overzicht
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          to={`/merken-vergelijken/${pairSlug("easee", "zaptec")}`}
          className="mt-3 inline-flex text-primary text-sm hover:underline"
        >
          Alle merk-vergelijkingen →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Model-vs-model vergelijkingen</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              to={`/vergelijken/${c.slug}`}
              className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition flex flex-col"
            >
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {c.verdict}
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-medium">
                Lees vergelijking <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <OfferteCta
          title="Twijfelt u nog tussen modellen?"
          subtitle="3 erkende installateurs adviseren u op basis van uw situatie — gratis offertes binnen 24 uur."
        />
      </div>
    </PageShell>
  );
}
