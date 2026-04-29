import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { guides } from "@/data/guides";

export default function GidsDetailPage() {
  const { slug } = useParams();
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return <NotFoundPage />;

  usePageMeta({
    title: `${guide.title} | ${SITE.shortName}`,
    description: guide.lede,
    canonical: `${SITE.url}/gids/${guide.slug}`,
  });

  const related = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

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
          datePublished: guide.updated,
          dateModified: guide.updated,
          url: `${SITE.url}/gids/${guide.slug}`,
        }}
      />
      <header>
        <Pill tone="muted" className="mb-2">{guide.category}</Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {guide.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {guide.lede}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Bijgewerkt {new Date(guide.updated).toLocaleDateString("nl-BE")}
        </div>
      </header>

      <article className="mt-8 prose prose-neutral max-w-none">
        <p className="text-muted-foreground italic">
          Volledige inhoud volgt. Hieronder vindt u verwante gidsen.
        </p>
      </article>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Verwante gidsen</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              to={`/gids/${r.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
            >
              <div className="font-semibold line-clamp-2">{r.title}</div>
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
