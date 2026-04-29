import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { evModels } from "@/data/evModels";

export default function AutoIndexPage() {
  usePageMeta({
    title: `Welke laadpaal past bij uw EV? | ${SITE.shortName}`,
    description:
      "25 EV-modellen met aanbevolen laadpaal op basis van laadvermogen en eigenaar-feedback.",
    canonical: `${SITE.url}/auto`,
  });

  const sorted = [...evModels].sort((a, b) =>
    `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`),
  );

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Per auto" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Welke laadpaal past bij uw EV",
          url: `${SITE.url}/auto`,
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Welke laadpaal past bij uw elektrische auto?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Aanbevelingen per model — gebaseerd op het AC-laadvermogen van uw EV en
          de typische gebruikersprofielen.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((m) => (
          <Link
            key={m.slug}
            to={`/auto/${m.slug}`}
            className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
          >
            <div className="text-xs text-muted-foreground">{m.brand}</div>
            <div className="font-semibold">{m.name}</div>
            <div className="font-mono text-xs text-muted-foreground mt-1">
              AC max {m.acMaxKw} kW · {m.batteryKwh} kWh
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
