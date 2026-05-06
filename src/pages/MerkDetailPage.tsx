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
import { comparisonsForBrand } from "@/lib/relations";
import { pairSlug } from "@/lib/brandPairs";

const POPULAR_PEERS = ["easee", "zaptec", "wallbox", "alfen", "tesla", "myenergi"];

export default function MerkDetailPage() {
  const { slug } = useParams();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return <NotFoundPage />;

  const models = chargers.filter((c) => c.brandSlug === brand.slug);
  const brandComparisons = comparisonsForBrand(brand.slug);
  const peerBrands = brands
    .filter((b) => b.slug !== brand.slug)
    .filter((b) => POPULAR_PEERS.includes(b.slug) || POPULAR_PEERS.includes(brand.slug))
    .slice(0, 6);

  const ogImage = `${SITE.url}/og/brand/${brand.slug}.svg`;
  usePageMeta({
    title: `${brand.name} laadpalen in België — alle modellen`,
    description: `${brand.name} laadpalen: ${models.length} modellen vergeleken op vermogen, MID-meter, app-bediening en prijs. Inclusief installatie in Vlaanderen.`,
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

      {brandComparisons.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            {brand.name} vergeleken met andere merken
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Directe head-to-head reviews waarin een {brand.name} model voorkomt.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {brandComparisons.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to={`/vergelijken/${c.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="font-semibold line-clamp-2">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {c.verdict}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {peerBrands.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            {brand.name} vergelijken met andere merken
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Side-by-side overzicht van prijs, MID-meter en garantie tussen {brand.name} en populaire alternatieven.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {peerBrands.map((peer) => (
              <Link
                key={peer.slug}
                to={`/merken-vergelijken/${pairSlug(brand.slug, peer.slug)}`}
                className="p-3 rounded-md border border-border bg-card hover:border-primary/50 transition text-sm flex items-center justify-between"
              >
                <span>
                  {brand.name}{" "}
                  <span className="text-muted-foreground">vs</span>{" "}
                  {peer.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta
          title={`Krijg offertes voor een ${brand.name} laadpaal`}
          prefill={{ model: brand.slug }}
        />
      </div>
    </PageShell>
  );
}
