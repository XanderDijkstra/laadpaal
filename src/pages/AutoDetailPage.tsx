import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { evModels } from "@/data/evModels";
import { chargers } from "@/data/chargers";

export default function AutoDetailPage() {
  const { slug } = useParams();
  const ev = evModels.find((m) => m.slug === slug);
  if (!ev) return <NotFoundPage />;

  const recommended = chargers.find((c) => c.slug === ev.recommendedChargerSlug);
  const alternatives = chargers
    .filter(
      (c) =>
        c.slug !== ev.recommendedChargerSlug &&
        c.maxKw >= ev.acMaxKw,
    )
    .slice(0, 2);

  usePageMeta({
    title: `Beste laadpaal voor ${ev.brand} ${ev.name} (${ev.year}) | ${SITE.shortName}`,
    description: `Welke laadpaal past bij uw ${ev.brand} ${ev.name}? Aanbevelingen op basis van AC-laadvermogen (${ev.acMaxKw} kW) en eigenaar-feedback.`,
    canonical: `${SITE.url}/auto/${ev.slug}`,
  });

  const fullChargeAt = (kw: number) => Math.ceil(ev.batteryKwh / kw);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Per auto", href: "/auto" },
        { label: `${ev.brand} ${ev.name}` },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Beste laadpaal voor ${ev.brand} ${ev.name}`,
          url: `${SITE.url}/auto/${ev.slug}`,
        }}
      />
      <header>
        <Pill tone="muted" className="mb-2">
          {ev.brand} · {ev.year}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Beste laadpaal voor {ev.brand} {ev.name}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {ev.brand} {ev.name} accepteert maximaal {ev.acMaxKw} kW AC.
          {ev.acMaxKw <= 11
            ? " Een 11 kW laadpaal is daarom de optimale keuze — een 22 kW model levert geen extra snelheid."
            : " Met dit AC-vermogen is een 22 kW laadpaal nuttig en haalbaar."}
        </p>
      </header>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <SpecBox label="Batterij" value={`${ev.batteryKwh} kWh`} />
        <SpecBox label="AC max" value={`${ev.acMaxKw} kW`} />
        <SpecBox label="Connector" value={ev.connector} />
      </div>

      {recommended ? (
        <Card className="mt-10 p-6 border-primary/30 bg-primary/5">
          <Pill tone="success" className="mb-2">Onze aanbeveling</Pill>
          <h2 className="text-xl font-bold tracking-tight">{recommended.name}</h2>
          <p className="mt-2 text-sm">{recommended.shortDescription}</p>
          <div className="mt-3 font-mono text-sm">
            All-in vanaf {formatEuro(recommended.priceAllInFrom)}
          </div>
          <Link
            to={`/laadpalen/${recommended.slug}`}
            className="mt-4 inline-flex text-primary font-medium hover:underline"
          >
            Bekijk volledige review →
          </Link>
        </Card>
      ) : null}

      {alternatives.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight">Alternatieven</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {alternatives.map((alt) => (
              <Link
                key={alt.slug}
                to={`/laadpalen/${alt.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
              >
                <div className="text-xs text-muted-foreground">{alt.brand}</div>
                <div className="font-semibold">{alt.name}</div>
                <div className="font-mono text-sm mt-1">
                  vanaf {formatEuro(alt.priceAllInFrom)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Laadtijd ({ev.batteryKwh} kWh tot vol)
        </h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-semibold text-muted-foreground">Laadvermogen</th>
              <th className="text-left py-2 font-semibold text-muted-foreground">Laadtijd</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-2 font-mono">7,4 kW (1-fase)</td>
              <td className="py-2 font-mono">{fullChargeAt(7.4)} uur</td>
            </tr>
            <tr>
              <td className="py-2 font-mono">11 kW (3-fase)</td>
              <td className="py-2 font-mono">{fullChargeAt(11)} uur</td>
            </tr>
            <tr>
              <td className="py-2 font-mono">22 kW (3-fase)</td>
              <td className="py-2 font-mono">
                {ev.acMaxKw >= 22 ? `${fullChargeAt(22)} uur` : `${fullChargeAt(ev.acMaxKw)} uur (auto beperkt tot ${ev.acMaxKw} kW)`}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="mt-12">
        <OfferteCta
          title={`Krijg offertes voor uw ${ev.brand} ${ev.name}`}
          prefill={{ auto: ev.slug }}
        />
      </div>
    </PageShell>
  );
}

function SpecBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono font-bold mt-1">{value}</div>
    </div>
  );
}
