import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { brands } from "@/data/brands";
import { chargers } from "@/data/chargers";

export default function MerkenIndexPage() {
  usePageMeta({
    title: `Laadpaalmerken in België — een overzicht | ${SITE.shortName}`,
    description:
      "8 toonaangevende merken in Vlaanderen: Zaptec, Easee, Wallbox, Alfen, Peblar, Smappee, Tesla, MyEnergi.",
    canonical: `${SITE.url}/merken`,
  });

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Merken" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Laadpaalmerken in België",
          url: `${SITE.url}/merken`,
        }}
      />

      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpaalmerken in België
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Onafhankelijke uitleg per merk — sterke en zwakke punten, modelaanbod
          en typische prijsklasse in Vlaanderen.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((b) => {
          const count = chargers.filter((c) => c.brandSlug === b.slug).length;
          return (
            <Link
              key={b.slug}
              to={`/merken/${b.slug}`}
              className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
            >
              <div className="text-xs text-muted-foreground">
                {b.countryFlag} {b.country}
                {b.founded ? ` · sinds ${b.founded}` : ""}
              </div>
              <h2 className="font-bold text-lg mt-1">{b.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {b.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">
                  {count} model{count === 1 ? "" : "len"} in ons aanbod
                </span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
