import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { glossary } from "@/data/glossary";

export default function WoordenlijstDetailPage() {
  const { slug } = useParams();
  const term = glossary.find((g) => g.slug === slug);
  if (!term) return <NotFoundPage />;

  const desc =
    term.short.length >= 70
      ? term.short.slice(0, 165)
      : `${term.short} Lees meer in onze laadpaal-woordenlijst voor Vlaanderen.`.slice(0, 165);
  usePageMeta({
    title: `${term.term} — definitie laadpaal-woordenlijst`,
    description: desc,
    canonical: `${SITE.url}/woordenlijst/${term.slug}`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Woordenlijst", href: "/woordenlijst" },
        { label: term.term },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: term.term,
          description: term.short,
          url: `${SITE.url}/woordenlijst/${term.slug}`,
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
          {term.term}
        </h1>
        <p className="text-base md:text-lg text-foreground mt-4 border-l-4 border-primary pl-4">
          {term.short}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight">Andere termen</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {glossary
            .filter((g) => g.slug !== term.slug)
            .slice(0, 6)
            .map((g) => (
              <Link
                key={g.slug}
                to={`/woordenlijst/${g.slug}`}
                className="px-3 py-1.5 rounded-md border border-border bg-card hover:border-primary/50 text-sm"
              >
                {g.term}
              </Link>
            ))}
        </div>
      </section>

      <div className="mt-12">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
