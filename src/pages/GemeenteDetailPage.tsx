import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatNumber } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { gemeenten } from "@/data/gemeenten";

export default function GemeenteDetailPage() {
  const { slug } = useParams();
  const g = gemeenten.find((x) => x.slug === slug);
  if (!g) return <NotFoundPage />;

  const neighbors = gemeenten
    .filter((x) => x.provincie === g.provincie && x.slug !== g.slug)
    .slice(0, 5);

  usePageMeta({
    title: `Laadpaal installateur ${g.name} — gratis offertes | ${SITE.shortName}`,
    description: `Erkende laadpaal-installateurs in ${g.name}. Vergelijk 3 offertes, profiteer van 6% btw en eventuele lokale premies.`,
    canonical: `${SITE.url}/gemeente/${g.slug}`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Gemeenten", href: "/gemeente" },
        { label: g.name },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: g.name,
          containedInPlace: { "@type": "AdministrativeArea", name: g.provincie },
        }}
      />
      <header>
        <Pill tone="muted" className="mb-2">{g.provincie}</Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadpaal-installateurs in {g.name}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {g.name} telt {formatNumber(g.population)} inwoners en ligt in{" "}
          {g.provincie}. Hier vindt u alles voor uw thuislaadpaal: lokale info,
          richtprijzen en een directe match met erkende installateurs.
        </p>
      </header>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <SpecBox label="Provincie" value={g.provincie} />
        <SpecBox label="Postcode(s)" value={g.postcodes.join(", ")} />
        <SpecBox label="Netbeheerder" value={g.netbeheerder} />
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-lg font-bold tracking-tight">Lokale premie?</h2>
        {g.hasLocalPremie ? (
          <p className="mt-2 text-sm">
            <Pill tone="success">Beschikbaar</Pill>
            <span className="ml-2">{g.premieDescription}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Wij hebben geen lokale gemeentelijke premie kunnen vinden voor{" "}
            {g.name}. De Vlaamse aankooppremie en de federale belastingvermindering
            zijn beide afgelopen — wel komt u meestal in aanmerking voor 6% btw.
          </p>
        )}
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Top installateurs in {g.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We tonen hier binnenkort onze partner-installateurs in deze regio.
          Ondertussen kunt u via onze offerteflow tot 3 erkende installateurs
          contacteren.
        </p>
      </section>

      {neighbors.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Nabijgelegen gemeenten</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {neighbors.map((n) => (
              <Link
                key={n.slug}
                to={`/gemeente/${n.slug}`}
                className="px-3 py-1.5 rounded-md border border-border bg-card hover:border-primary/50 text-sm"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta
          title={`Vraag offertes aan in ${g.name}`}
          prefill={{ postcode: g.postcodes[0], gemeente: g.slug }}
        />
      </div>
    </PageShell>
  );
}

function SpecBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono font-bold mt-1 text-sm">{value}</div>
    </div>
  );
}
