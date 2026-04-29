import { PageShell } from "@/components/PageShell";
import { OfferteForm } from "@/components/OfferteForm";
import { JsonLd } from "@/components/JsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";

export default function OffertePage() {
  usePageMeta({
    title: `Vraag 3 gratis offertes voor een laadpaal | ${SITE.shortName}`,
    description:
      "In 2 minuten ingevuld. 3 erkende installateurs sturen u een offerte op maat binnen 24 uur. Volledig gratis en vrijblijvend.",
    canonical: `${SITE.url}/offerte`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Offerte aanvragen" },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Vraag 3 offertes voor een laadpaal",
          url: `${SITE.url}/offerte`,
        }}
      />
      <header className="mt-2">
        <h1 className="font-heading text-2xl md:text-4xl font-bold tracking-tight">
          Vraag 3 gratis offertes voor een laadpaal
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-prose">
          In 2 minuten ingevuld. We matchen u met 3 erkende installateurs in uw
          gemeente. Zij sturen u een offerte op maat binnen 24 uur. Volledig
          gratis en vrijblijvend.
        </p>
      </header>
      <div className="mt-8">
        <OfferteForm />
      </div>

      <aside className="mt-12 rounded-md border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Privacy:</strong> Uw gegevens
        worden uitsluitend gebruikt om u te matchen met maximaal 3 erkende
        installateurs. We verkopen of delen geen data buiten dit doel. Bewaartijd
        12 maanden, daarna automatisch verwijderd.
      </aside>
    </PageShell>
  );
}
