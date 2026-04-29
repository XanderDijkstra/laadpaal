import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { guides } from "@/data/guides";

export default function GidsIndexPage() {
  usePageMeta({
    title: `Gids — eerlijke uitleg over laadpalen in Vlaanderen | ${SITE.shortName}`,
    description:
      "Actuele gidsen over premies, kosten, AREI, fasen, MID-meter en meer. Geen marketingpraat, wel cijfers.",
    canonical: `${SITE.url}/gids`,
  });

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gids" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Gids over laadpalen in Vlaanderen",
          url: `${SITE.url}/gids`,
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Gids — eerlijke uitleg over laadpalen
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Premies, kosten, technische keuzes — actuele gidsen voor wie thuis een
          laadpaal wil installeren.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            to={`/gids/${g.slug}`}
            className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition flex flex-col"
          >
            <Pill tone="muted" className="mb-2 self-start text-[10px]">
              {g.category}
            </Pill>
            <h2 className="font-bold">{g.title}</h2>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{g.lede}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              Bijgewerkt {new Date(g.updated).toLocaleDateString("nl-BE")}
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
