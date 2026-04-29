import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { glossary } from "@/data/glossary";

export default function WoordenlijstIndexPage() {
  usePageMeta({
    title: `Woordenlijst — termen rond laadpalen | ${SITE.shortName}`,
    description:
      "Korte uitleg van termen rond laadpalen: Type 2, MID-meter, OCPP, AREI, capaciteitstarief en meer.",
    canonical: `${SITE.url}/woordenlijst`,
  });

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Woordenlijst" }]} width="prose">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Woordenlijst laadpalen",
          url: `${SITE.url}/woordenlijst`,
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Woordenlijst
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          Korte definities van de termen die u tegenkomt bij het kiezen en
          installeren van een laadpaal.
        </p>
      </header>

      <ul className="mt-8 divide-y divide-border border border-border rounded-md bg-card">
        {glossary.map((t) => (
          <li key={t.slug}>
            <Link
              to={`/woordenlijst/${t.slug}`}
              className="block p-4 hover:bg-muted/40"
            >
              <div className="font-semibold">{t.term}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {t.short}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
