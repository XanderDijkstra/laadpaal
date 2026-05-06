import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { installationTopics } from "@/data/installationTopics";

export default function InstallatiePillarPage() {
  usePageMeta({
    title: `Laadpaal installeren in Vlaanderen — complete gids`,
    description:
      "Alles wat u moet weten over de installatie van een laadpaal in Vlaanderen: kosten, AREI-keuring, fasen, Fluvius en meer.",
    canonical: `${SITE.url}/installatie`,
  });

  return (
    <PageShell
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Installatie" }]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Laadpaal installeren in Vlaanderen — Complete gids 2026",
          url: `${SITE.url}/installatie`,
        }}
      />

      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpaal installeren in Vlaanderen
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          Complete gids 2026 — van eerste vraag tot keuring. Concrete bedragen,
          procedures en valkuilen voor wie thuis een laadpaal wil.
        </p>
      </header>

      <div className="mt-10 space-y-3">
        {installationTopics.map((t) => (
          <Link
            key={t.slug}
            to={`/installatie/${t.slug}`}
            className="block p-5 rounded-md border border-border bg-card hover:border-primary/50 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">{t.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.lede}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
