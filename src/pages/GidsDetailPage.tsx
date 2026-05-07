import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { GuideContent } from "@/components/guide/GuideContent";
import { GuideTOC } from "@/components/guide/GuideTOC";
import { GuideFAQList } from "@/components/guide/GuideFAQ";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { guides } from "@/data/guides";
import { relevantChargersForGuide } from "@/lib/relations";
import { authorJsonLd, publisherJsonLd } from "@/lib/authors";
import { formatEuro } from "@/lib/utils";

export default function GidsDetailPage() {
  const { slug } = useParams();
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return <NotFoundPage />;

  usePageMeta({
    title: guide.title,
    description: guide.lede.slice(0, 165),
    canonical: `${SITE.url}/gids/${guide.slug}`,
  });

  const explicitRelated = (guide.related ?? [])
    .map((s) => guides.find((g) => g.slug === s))
    .filter((g): g is (typeof guides)[number] => Boolean(g));

  const filler = guides
    .filter(
      (g) => g.slug !== guide.slug && !guide.related?.includes(g.slug),
    )
    .slice(0, Math.max(0, 3 - explicitRelated.length));

  const related = [...explicitRelated, ...filler].slice(0, 4);
  const relevantChargers = relevantChargersForGuide(guide.slug);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Gids", href: "/gids" },
        { label: guide.title },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.lede,
          datePublished: guide.updated,
          dateModified: guide.updated,
          url: `${SITE.url}/gids/${guide.slug}`,
          mainEntityOfPage: `${SITE.url}/gids/${guide.slug}`,
          inLanguage: "nl-BE",
          author: authorJsonLd(),
          publisher: publisherJsonLd(),
        }}
      />
      <header>
        <Pill tone="muted" className="mb-2">
          {guide.category}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {guide.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {guide.lede}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Bijgewerkt{" "}
          {new Date(guide.updated).toLocaleDateString("nl-BE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </header>

      {guide.body ? <GuideTOC blocks={guide.body} /> : null}

      {guide.body ? (
        <GuideContent blocks={guide.body} />
      ) : (
        <article className="mt-8 max-w-prose">
          <p className="text-muted-foreground italic">
            Volledige inhoud volgt. Hieronder vindt u verwante gidsen.
          </p>
        </article>
      )}

      {guide.faqs && guide.faqs.length > 0 ? (
        <GuideFAQList faqs={guide.faqs} />
      ) : null}

      {relevantChargers.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">
            Laadpalen die hierbij passen
          </h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {relevantChargers.map((c) => (
              <Link
                key={c.slug}
                to={`/laadpalen/${c.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
              >
                <div className="text-xs text-muted-foreground">{c.brand}</div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {c.maxKw} kW · {c.phases}-fase
                  {c.midMeter ? " · MID" : ""}
                </div>
                <div className="font-mono text-sm mt-1">
                  vanaf {formatEuro(c.priceAllInFrom)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">Verwante gidsen</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/gids/${r.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
              >
                <Pill tone="muted" className="mb-1.5 text-[10px]">
                  {r.category}
                </Pill>
                <div className="font-semibold line-clamp-2">{r.title}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {r.lede}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta />
      </div>
    </PageShell>
  );
}
