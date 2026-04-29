import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { chargers } from "@/data/chargers";

export default function LaadpalenIndexPage() {
  usePageMeta({
    title: `Alle laadpalen voor thuis — vergelijk specs | ${SITE.shortName}`,
    description:
      "15 modellen, 8 merken. Filter op vermogen, kabel, app en budget. Inclusief 6% btw-prijzen.",
    canonical: `${SITE.url}/laadpalen`,
  });

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Laadpalen" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Alle laadpaalmodellen",
          url: `${SITE.url}/laadpalen`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: chargers.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE.url}/laadpalen/${c.slug}`,
              name: c.name,
            })),
          },
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Alle laadpaalmodellen voor thuis
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          {chargers.length} modellen van 8 toonaangevende merken. Vergelijk vermogen,
          kabel, app, garantie en richtprijs.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chargers.map((c) => (
          <Link
            key={c.slug}
            to={`/laadpalen/${c.slug}`}
            className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition flex flex-col"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {c.brand}
            </div>
            <h3 className="font-bold text-lg mt-1">{c.name}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {c.shortDescription}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill tone="info">⚡ {c.maxKw} kW</Pill>
              <Pill tone="muted">{c.cable === "vast" ? "Vaste kabel" : "Type 2 socket"}</Pill>
              {c.midMeter ? <Pill tone="success">MID-meter</Pill> : null}
            </div>
            <div className="mt-auto pt-4 flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground">All-in vanaf</div>
                <div className="font-mono font-bold text-lg">
                  {formatEuro(c.priceAllInFrom)}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                Bekijk <ArrowRight className="h-4 w-4" />
              </span>
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
