import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";
import { LaadpuntenLijst } from "@/components/LaadpuntenLijst";
import { LaadpuntenMap } from "@/components/LaadpuntenMap";
import { OfferteCta } from "@/components/OfferteCta";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { gemeenten } from "@/data/gemeenten";
import { laadpunten } from "@/data/laadpunten";
import { getTariff } from "@/data/operatorTariffs";

export default function LaadpuntenGemeentePage() {
  const { slug } = useParams();
  const g = gemeenten.find((x) => x.slug === slug);
  if (!g) return <NotFoundPage />;

  const stations = laadpunten.filter((p) => p.gemeenteSlug === g.slug);
  const acCount = stations.filter((s) => s.type !== "DC").length;
  const dcCount = stations.filter((s) => s.type !== "AC").length;
  const maxPower = stations.reduce((m, s) => Math.max(m, s.maxKw), 0);
  const connectorCount = stations.reduce((n, s) => n + s.connectors, 0);
  const operatorNames = [
    ...new Set(
      stations
        .filter((s) => s.operator !== "onbekend")
        .map((s) => getTariff(s.operator).name),
    ),
  ].sort();

  usePageMeta({
    title: `Publieke laadpalen ${g.name} — ${stations.length} ${stations.length === 1 ? "station" : "stations"} met tarief`,
    description:
      stations.length > 0
        ? `${stations.length} ${stations.length === 1 ? "publieke laadpaal" : "publieke laadpalen"} in ${g.name} (${g.provincie}): ${acCount} AC, ${dcCount} DC, tot ${maxPower} kW${operatorNames.length > 0 ? ` (${operatorNames.slice(0, 3).join(", ")})` : ""}. Afstand vanaf uw postcode en tarief per kWh.`.slice(0, 165)
        : `Publieke laadpalen in ${g.name} (${g.provincie}): nog geen stations in onze databank. Bekijk laadpalen in andere ${g.provincie}-gemeenten of plaats een thuislaadpaal.`,
    canonical: `${SITE.url}/laadpunten/${g.slug}`,
  });

  const neighbors = gemeenten
    .filter((x) => x.provincie === g.provincie && x.slug !== g.slug)
    .map((x) => ({
      ...x,
      count: laadpunten.filter((p) => p.gemeenteSlug === x.slug).length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laadpunten", href: "/laadpunten" },
        { label: g.name },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Publieke laadpalen in ${g.name}`,
            url: `${SITE.url}/laadpunten/${g.slug}`,
            description: `Alle ${stations.length} publieke laadpalen in ${g.name} met postcode-afstand en tarief per kWh.`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: stations.length,
              itemListElement: stations.slice(0, 20).map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.name,
                item: {
                  "@type": "Place",
                  name: s.name,
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: s.address,
                    postalCode: s.postcode,
                    addressLocality: g.name,
                    addressCountry: "BE",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: s.lat,
                    longitude: s.lng,
                  },
                },
              })),
            },
          },
        ]}
      />

      <header>
        <Pill tone="muted" className="mb-2">
          {g.provincie}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Publieke laadpalen in {g.name}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          {stations.length === 0
            ? `Wij hebben nog geen publieke laadpalen geregistreerd voor ${g.name}. Bekijk de naburige gemeenten of overweeg een eigen thuislaadpaal.`
            : `${stations.length} publieke ${stations.length === 1 ? "laadlocatie" : "laadlocaties"} in ${g.name} met samen ${connectorCount} ${connectorCount === 1 ? "stekker" : "stekkers"}: ${acCount} met AC-laden en ${dcCount} met DC-snelladen, tot ${maxPower} kW${operatorNames.length > 0 ? `. Operators: ${operatorNames.join(", ")}` : ""}. Sorteer op afstand vanaf uw postcode en zie het indicatieve tarief per operator.`}
        </p>
      </header>

      {stations.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Totaal" value={stations.length} />
          <Stat label="AC laadpunten" value={acCount} />
          <Stat label="DC snelladers" value={dcCount} />
          <Stat label="Max vermogen" value={`${maxPower} kW`} />
        </section>
      ) : null}

      {stations.length > 0 ? (
        <section className="mt-10">
          <h2 className="sr-only">Kaart van publieke laadpalen in {g.name}</h2>
          <LaadpuntenMap stations={stations} height={420} />
        </section>
      ) : null}

      <section className="mt-10">
        <LaadpuntenLijst
          gemeenteSlug={g.slug}
          initialPostcode={g.postcodes[0] ?? ""}
          limit={Math.max(stations.length, 1)}
        />
      </section>

      {neighbors.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">
            Andere gemeenten in {g.provincie}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Publieke laadpalen in de andere {g.provincie}-gemeenten.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {neighbors.map((n) => (
              <Link
                key={n.slug}
                to={`/laadpunten/${n.slug}`}
                className="p-3 rounded-md border border-border bg-card hover:border-primary/50 transition flex items-center justify-between text-sm"
              >
                <span>
                  <span className="font-medium">{n.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {n.count} laadpunten
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
          <Link
            to="/laadpunten"
            className="mt-3 inline-flex text-primary text-sm hover:underline"
          >
            Alle publieke laadpalen in Vlaanderen →
          </Link>
        </section>
      ) : null}

      <section className="mt-12 grid sm:grid-cols-2 gap-3">
        <Link
          to={`/gemeente/${g.slug}`}
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
        >
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Installateurs
          </div>
          <div className="font-semibold mt-1">
            Laadpaal-installateurs in {g.name}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Lokale info, premies en directe match met erkende installateurs.
          </div>
        </Link>
        <Link
          to="/laadkost-berekenen"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
        >
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Calculator
          </div>
          <div className="font-semibold mt-1">Bereken uw laadkost</div>
          <div className="text-sm text-muted-foreground mt-1">
            Wat kost laden u per jaar — thuis versus publiek? Inclusief
            vergelijking met een benzineauto.
          </div>
        </Link>
      </section>

      <div className="mt-12">
        <OfferteCta
          title={`Eigen laadpaal in ${g.name}?`}
          subtitle="Thuisladen kost ±€0,32/kWh, een publiek snelladerstation €0,79. 3 erkende installateurs sturen u offertes."
          prefill={{ postcode: g.postcodes[0], gemeente: g.slug }}
        />
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono font-bold text-lg mt-1">{value}</div>
    </div>
  );
}
