import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { gemeenten } from "@/data/gemeenten";

const PROVINCIES = [
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "West-Vlaanderen",
  "Vlaams-Brabant",
] as const;

export default function GemeenteIndexPage() {
  usePageMeta({
    title: `Laadpaal-installateurs per gemeente in Vlaanderen`,
    description:
      "Erkende laadpaal-installateurs in 50+ Vlaamse gemeenten — Antwerpen, Gent, Brugge, Leuven, Hasselt en meer. Vergelijk gratis 3 offertes en profiteer van 6% btw.",
    canonical: `${SITE.url}/gemeente`,
  });

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gemeenten" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Laadpaal-installateurs per gemeente in Vlaanderen",
          url: `${SITE.url}/gemeente`,
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpaal-installateurs in heel Vlaanderen
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          {gemeenten.length} gemeenten beschikbaar bij lancering. Per gemeente
          tonen we lokale info en matches met installateurs.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {PROVINCIES.map((prov) => {
          const list = gemeenten
            .filter((g) => g.provincie === prov)
            .sort((a, b) => a.name.localeCompare(b.name));
          if (list.length === 0) return null;
          return (
            <section key={prov}>
              <h2 className="text-xl font-bold tracking-tight">{prov}</h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {list.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/gemeente/${g.slug}`}
                    className="p-3 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition text-sm"
                  >
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.postcodes[0]}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
