import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";

export default function NotFoundPage() {
  usePageMeta({
    title: `Pagina niet gevonden — Laadthuis`,
    description:
      "De pagina die u zoekt bestaat niet of is verplaatst. Bekijk onze laadpaal-vergelijker, gids of vraag direct gratis offertes aan.",
    canonical: `${SITE.url}/404`,
    noindex: true,
  });

  return (
    <PageShell width="prose">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Pagina niet gevonden",
          url: `${SITE.url}/404`,
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
        }}
      />
      <div className="py-16">
        <div className="font-mono text-primary text-sm">404</div>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-2">
          Pagina niet gevonden
        </h1>
        <p className="text-muted-foreground mt-3 max-w-prose">
          De pagina die u zoekt bestaat niet of is verplaatst. Hieronder enkele
          handige links.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex h-10 px-4 items-center rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            Terug naar home
          </Link>
          <Link
            to="/offerte"
            className="inline-flex h-10 px-4 items-center rounded-md border border-input hover:bg-muted"
          >
            Vraag een offerte aan
          </Link>
          <Link
            to="/laadpalen"
            className="inline-flex h-10 px-4 items-center rounded-md border border-input hover:bg-muted"
          >
            Bekijk laadpalen
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
