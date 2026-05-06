import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { installationTopics } from "@/data/installationTopics";

export default function InstallatieDetailPage() {
  const { slug } = useParams();
  const topic = installationTopics.find((t) => t.slug === slug);
  if (!topic) return <NotFoundPage />;

  const desc =
    topic.lede.length >= 70
      ? topic.lede.slice(0, 165)
      : `${topic.lede} Lees onze installatiegids voor Vlaanderen — kosten, AREI-keuring, fasen en eventuele verzwaring.`.slice(0, 165);
  const title =
    topic.title.length >= 30
      ? topic.title
      : `${topic.title} — laadpaal-installatie Vlaanderen`;
  usePageMeta({
    title,
    description: desc,
    canonical: `${SITE.url}/installatie/${topic.slug}`,
  });

  const related = installationTopics.filter((t) => t.slug !== topic.slug).slice(0, 3);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Installatie", href: "/installatie" },
        { label: topic.title },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: topic.title,
          url: `${SITE.url}/installatie/${topic.slug}`,
        }}
      />

      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {topic.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {topic.lede}
        </p>
      </header>

      <article className="mt-8 prose prose-neutral max-w-none">
        <p className="text-muted-foreground italic">
          Dit artikel wordt nog uitgewerkt. Hieronder vindt u verwante onderwerpen.
        </p>
      </article>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Verwante onderwerpen</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              to={`/installatie/${r.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
            >
              <div className="font-semibold">{r.title}</div>
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
