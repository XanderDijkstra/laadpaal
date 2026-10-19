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
import {
  topGuidesForGemeente,
  recommendedChargersForGemeente,
} from "@/lib/relations";
import { laadpunten } from "@/data/laadpunten";

export default function GemeenteDetailPage() {
  const { slug } = useParams();
  const g = gemeenten.find((x) => x.slug === slug);
  if (!g) return <NotFoundPage />;

  // All other gemeenten in the same provincie, largest first — every
  // gemeente page links to its whole provincie cluster.
  const provincieGemeenten = gemeenten
    .filter((x) => x.provincie === g.provincie)
    .sort((a, b) => b.population - a.population);
  const neighbors = provincieGemeenten.filter((x) => x.slug !== g.slug);
  const populationRank =
    provincieGemeenten.findIndex((x) => x.slug === g.slug) + 1;
  const topGuides = topGuidesForGemeente();
  const recommended = recommendedChargersForGemeente();
  const stations = laadpunten.filter((p) => p.gemeenteSlug === g.slug);
  const publicStationCount = stations.length;
  const dcStationCount = stations.filter((s) => s.type !== "AC").length;
  const maxStationKw = stations.reduce((m, s) => Math.max(m, s.maxKw), 0);
  const postcodeLabel =
    g.postcodes.length === 1
      ? `postcode ${g.postcodes[0]}`
      : `postcodes ${g.postcodes.join(", ")}`;

  usePageMeta({
    title: `Laadpaal installateur ${g.name} (${g.postcodes[0]}) — gratis offertes`,
    description: `Laadpaal laten plaatsen in ${g.name} (${g.provincie}, ${g.postcodes.length === 1 ? "postcode" : "postcodes"} ${g.postcodes.slice(0, 3).join(", ")}${g.postcodes.length > 3 ? " …" : ""})? ${publicStationCount} ${publicStationCount === 1 ? "publiek laadpunt" : "publieke laadpunten"}, netbeheerder ${g.netbeheerder}. Vergelijk 3 gratis offertes.`,
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
          {g.name} telt ongeveer {formatNumber(g.population)} inwoners ({postcodeLabel})
          en is daarmee de{" "}
          {populationRank === 1 ? "grootste" : `${populationRank}e grootste`} van de{" "}
          {provincieGemeenten.length} gemeenten in {g.provincie} die Laadthuis
          behandelt.
          Netbeheerder is {g.netbeheerder}.{" "}
          {publicStationCount > 0
            ? `In onze databank ${publicStationCount === 1 ? "staat 1 publieke laadlocatie" : `staan ${publicStationCount} publieke laadlocaties`} in ${g.name}${dcStationCount > 0 ? `, waarvan ${dcStationCount} met DC-snelladen` : ""}, tot ${maxStationKw} kW.`
            : `In onze databank staan nog geen publieke laadlocaties in ${g.name}.`}{" "}
          Hieronder vindt u lokale info, populaire laadpalen en een directe
          match met erkende installateurs.
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

      {publicStationCount > 0 ? (
        <section className="mt-10">
          <Link
            to={`/laadpunten/${g.slug}`}
            className="block p-5 rounded-md border border-primary/30 bg-primary/5 hover:border-primary/60 transition"
          >
            <div className="text-xs text-primary font-semibold uppercase tracking-wide">
              Publiek laden
            </div>
            <div className="mt-1 text-lg font-bold tracking-tight">
              {publicStationCount} publieke laadpalen in {g.name}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Bekijk alle stations met postcode-afstand en operator-tarief →
            </div>
          </Link>
        </section>
      ) : null}

      {recommended.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Populaire laadpalen in {g.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drie typische keuzes voor een rijwoning in {g.provincie}: een
            instapmodel, een midrange en een premium met MID-meter.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            {recommended.map((c) => (
              <Link
                key={c.slug}
                to={`/laadpalen/${c.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="text-xs text-muted-foreground">{c.brand}</div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {c.maxKw} kW · {c.phases}-fase
                  {c.midMeter ? " · MID" : ""}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {topGuides.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Belangrijke gidsen voor inwoners van {g.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Wat u moet weten voordat u een laadpaal in {g.provincie} laat
            plaatsen.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            {topGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/gids/${guide.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <Pill tone="muted" className="mb-1.5 text-[10px]">
                  {guide.category}
                </Pill>
                <div className="font-semibold line-clamp-2">{guide.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {guide.lede}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {neighbors.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Andere gemeenten in {g.provincie}
          </h2>
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
          <p className="mt-4 text-sm">
            <Link to="/gemeente" className="text-primary hover:underline">
              Alle gemeenten in Vlaanderen →
            </Link>{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <Link
              to={`/laadpunten/${g.slug}`}
              className="text-primary hover:underline"
            >
              Publieke laadpalen in {g.name} →
            </Link>
          </p>
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
