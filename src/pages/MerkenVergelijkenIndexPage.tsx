import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { brands } from "@/data/brands";
import { chargers } from "@/data/chargers";
import { allBrandPairs, pairSlug } from "@/lib/brandPairs";

export default function MerkenVergelijkenIndexPage() {
  const pairs = allBrandPairs();
  const sortedBrands = [...brands].sort((a, b) => a.slug.localeCompare(b.slug));

  usePageMeta({
    title: `Laadpaalmerken vergelijken — alle ${pairs.length} merk-duels`,
    description: `${brands.length} laadpaalmerken, ${chargers.length} modellen, ${pairs.length} merk-tegen-merk vergelijkingen: vermogen, MID-meter, app-bediening en garantie naast elkaar.`,
    canonical: `${SITE.url}/merken-vergelijken`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Merk-vergelijkingen" },
      ]}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Laadpaalmerken vergelijken",
          url: `${SITE.url}/merken-vergelijken`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: pairs.length,
          },
        }}
      />

      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpaalmerken vergelijken
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Alle {pairs.length} combinaties van de {brands.length} merken in ons
          aanbod ({chargers.length} modellen), telkens met de volledige
          modellen-lineup, het maximale vermogen, het aandeel modellen met
          MID-meter en app-bediening en de langste garantie naast elkaar.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        {sortedBrands.map((brand) => {
          const others = sortedBrands.filter((b) => b.slug !== brand.slug);
          return (
            <section key={brand.slug}>
              <h2 className="text-xl font-bold tracking-tight">
                <Link to={`/merken/${brand.slug}`} className="hover:text-primary">
                  {brand.name}
                </Link>{" "}
                <span className="text-muted-foreground font-normal text-base">
                  vergeleken met
                </span>
              </h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    to={`/merken-vergelijken/${pairSlug(brand.slug, other.slug)}`}
                    className="p-3 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition text-sm"
                  >
                    {brand.name} <span className="text-muted-foreground">vs</span>{" "}
                    {other.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Liever twee specifieke modellen naast elkaar?{" "}
        <Link to="/vergelijken" className="text-primary hover:underline">
          Bekijk de model-vergelijkingen
        </Link>{" "}
        of{" "}
        <Link to="/laadpalen" className="text-primary hover:underline">
          alle laadpalen
        </Link>
        .
      </p>

      <div className="mt-16">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
