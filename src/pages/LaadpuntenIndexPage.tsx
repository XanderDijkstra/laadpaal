import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";
import { LaadpuntenLijst } from "@/components/LaadpuntenLijst";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { laadpunten } from "@/data/laadpunten";
import { gemeenten } from "@/data/gemeenten";
import { operatorTariffs } from "@/data/operatorTariffs";

export default function LaadpuntenIndexPage() {
  usePageMeta({
    title: `Publieke laadpalen Vlaanderen — ${laadpunten.length} stations`,
    description: `Alle publieke laadpalen in Vlaanderen op één pagina. Vul uw postcode in en zie de afstand tot het dichtstbijzijnde laadpunt. Tarief per kWh per operator inbegrepen.`,
    canonical: `${SITE.url}/laadpunten`,
  });

  // Aantal per provincie
  const perProvincie = gemeenten.reduce<Record<string, number>>((acc, g) => {
    acc[g.provincie] = (acc[g.provincie] ?? 0) + laadpunten.filter((p) => p.gemeenteSlug === g.slug).length;
    return acc;
  }, {});

  // Top gemeenten met meeste laadpunten
  const topGemeenten = [...gemeenten]
    .map((g) => ({ ...g, count: laadpunten.filter((p) => p.gemeenteSlug === g.slug).length }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laadpunten" },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Publieke laadpalen Vlaanderen",
            url: `${SITE.url}/laadpunten`,
            description:
              "Vlaams overzicht van publieke laadpalen met postcode-afstand en operator-tarief.",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: laadpunten.length,
            },
          },
        ]}
      />

      <header>
        <Pill tone="success" className="mb-2">
          {laadpunten.length} laadpunten · {topGemeenten.length} gemeenten
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Publieke laadpalen in Vlaanderen
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Vul uw postcode in en zie het dichtstbijzijnde publieke laadpunt, met
          maximaal vermogen, type (AC/DC) en het indicatieve tarief van de
          operator. Werkelijke prijs hangt af van uw laadpas.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Totaal" value={laadpunten.length} />
        {Object.entries(perProvincie).map(([prov, count]) => (
          <Stat key={prov} label={prov} value={count} />
        ))}
      </section>

      <section className="mt-10">
        <LaadpuntenLijst limit={50} />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">
          Bekijk per gemeente
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Iedere gemeente heeft een eigen pagina met postcode-zoeker en
          afstand-berekening.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {topGemeenten.map((g) => (
            <Link
              key={g.slug}
              to={`/laadpunten/${g.slug}`}
              className="p-3 rounded-md border border-border bg-card hover:border-primary/50 transition flex items-center justify-between text-sm"
            >
              <span>
                <span className="font-medium">{g.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {g.count} laadpunten
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          ))}
        </div>
        <Link
          to="/gemeente"
          className="mt-3 inline-flex text-primary text-sm hover:underline"
        >
          Alle Vlaamse gemeenten →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">
          Tarieven per operator (indicatief)
        </h2>
        <div className="mt-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs">
          <strong>Indicatief — geen offerte.</strong> Bedragen zijn gemiddelden
          uit publieke prijslijsten van januari {new Date().getFullYear()}. Uw
          werkelijk tarief hangt af van uw laadpas, abonnement, locatie en
          tijdstip. Controleer altijd het tarief in de app/op de paal vóór u
          laadt.
        </div>
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Operator
                </th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">
                  AC tarief
                </th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">
                  DC tarief
                </th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">
                  Start fee
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Notities
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {operatorTariffs
                .filter((t) => t.slug !== "onbekend")
                .map((t) => (
                  <tr key={t.slug}>
                    <td className="py-2 px-3 font-medium">
                      {t.url ? (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline"
                        >
                          {t.name}
                        </a>
                      ) : (
                        t.name
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {t.acPrice != null ? `€${t.acPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {t.dcPrice != null ? `€${t.dcPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {t.startFee != null ? `€${t.startFee.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-xs text-muted-foreground">
                      {t.notes ?? ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12">
        <OfferteCta
          title="Liever thuisladen tegen €0,32 in plaats van €0,79?"
          subtitle="Een eigen laadpaal verdient zichzelf typisch in 2-3 jaar terug. 3 erkende installateurs sturen u offertes — gratis."
        />
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono font-bold text-lg mt-1">{value}</div>
    </div>
  );
}
