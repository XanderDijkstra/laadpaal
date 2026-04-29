import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { brands } from "@/data/brands";
import { chargers } from "@/data/chargers";

export default function MerkDetailPage() {
  const { slug } = useParams();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return <NotFoundPage />;

  const models = chargers.filter((c) => c.brandSlug === brand.slug);

  const ogImage = `${SITE.url}/og/brand/${brand.slug}.svg`;
  usePageMeta({
    title: `${brand.name} laadpalen in België — alle modellen | ${SITE.shortName}`,
    description: `${brand.name} laadpalen: alle modellen, prijzen en installatie in Vlaanderen. Vergelijk met andere merken.`,
    canonical: `${SITE.url}/merken/${brand.slug}`,
    ogImage,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Merken", href: "/merken" },
        { label: brand.name },
      ]}
      width="prose"
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Brand",
            "@id": `${SITE.url}/merken/${brand.slug}#brand`,
            name: brand.name,
            description: brand.description,
            logo: ogImage,
            url: `${SITE.url}/merken/${brand.slug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.name,
            url: `${SITE.url}/merken/${brand.slug}`,
            address: { "@type": "PostalAddress", addressCountry: brand.country },
            foundingDate: brand.founded,
          },
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            url: `${SITE.url}/merken/${brand.slug}`,
            name: `${brand.name} laadpalen`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: models.map((m, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE.url}/laadpalen/${m.slug}`,
                name: m.name,
              })),
            },
          },
        ]}
      />

      <header>
        <Pill tone="muted" className="mb-2">
          {brand.countryFlag} {brand.country}
          {brand.founded ? ` · sinds ${brand.founded}` : ""}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {brand.name} laadpalen
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {brand.description}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Modellen van {brand.name}
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {models.map((m) => (
            <Link
              key={m.slug}
              to={`/laadpalen/${m.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
            >
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {m.shortDescription}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="font-mono">{m.maxKw} kW</span>
                <span className="font-mono">{formatEuro(m.priceAllInFrom)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <OfferteCta
          title={`Krijg offertes voor een ${brand.name} laadpaal`}
          prefill={{ model: brand.slug }}
        />
      </div>
    </PageShell>
  );
}
