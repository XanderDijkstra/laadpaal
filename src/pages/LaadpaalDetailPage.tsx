import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { chargers } from "@/data/chargers";
import { brands } from "@/data/brands";
import {
  relevantGuidesForCharger,
  compatibleEvsForCharger,
} from "@/lib/relations";

export default function LaadpaalDetailPage() {
  const { slug } = useParams();
  const charger = chargers.find((c) => c.slug === slug);
  if (!charger) return <NotFoundPage />;

  const brand = brands.find((b) => b.slug === charger.brandSlug);
  const alternatives = chargers
    .filter((c) => c.slug !== charger.slug && c.brandSlug !== charger.brandSlug)
    .slice(0, 3);
  const relatedGuides = relevantGuidesForCharger(charger);
  const compatibleEvs = compatibleEvsForCharger(charger);

  return (
    <DetailContent
      charger={charger}
      brand={brand}
      alternatives={alternatives}
      relatedGuides={relatedGuides}
      compatibleEvs={compatibleEvs}
    />
  );
}

function DetailContent({
  charger,
  brand,
  alternatives,
  relatedGuides,
  compatibleEvs,
}: {
  charger: (typeof chargers)[number];
  brand: (typeof brands)[number] | undefined;
  alternatives: typeof chargers;
  relatedGuides: ReturnType<typeof relevantGuidesForCharger>;
  compatibleEvs: ReturnType<typeof compatibleEvsForCharger>;
}) {
  const ogImage = `${SITE.url}/og/charger/${charger.slug}.svg`;
  usePageMeta({
    title: `${charger.name} review — specs, prijs, ervaringen | ${SITE.shortName}`,
    description: `${charger.name}: ${charger.maxKw} kW, ${charger.shortDescription} Prijs vanaf ${formatEuro(charger.priceAllInFrom)} all-in.`,
    canonical: `${SITE.url}/laadpalen/${charger.slug}`,
    ogImage,
  });

  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  const additionalProperty = [
    { "@type": "PropertyValue", name: "Maximaal vermogen", value: `${charger.maxKw} kW`, unitText: "kW" },
    { "@type": "PropertyValue", name: "Aantal fasen", value: `${charger.phases}-fase` },
    {
      "@type": "PropertyValue",
      name: "Kabel",
      value: charger.cable === "vast" ? "Vaste kabel" : `${charger.socketType ?? "Type 2"} socket`,
    },
    { "@type": "PropertyValue", name: "App-bediening", value: charger.app ? "Ja" : "Nee" },
    { "@type": "PropertyValue", name: "RFID", value: charger.rfid ? "Ja" : "Nee" },
    { "@type": "PropertyValue", name: "MID-meter", value: charger.midMeter ? "Ja" : "Nee" },
    { "@type": "PropertyValue", name: "Garantie", value: `${charger.warrantyYears} jaar` },
  ];

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laadpalen", href: "/laadpalen" },
        { label: charger.name },
      ]}
      width="prose"
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${SITE.url}/laadpalen/${charger.slug}#product`,
            name: charger.name,
            brand: { "@type": "Brand", name: charger.brand },
            manufacturer: { "@type": "Organization", name: charger.brand },
            description: charger.shortDescription,
            image: ogImage,
            sku: charger.slug,
            mpn: charger.name,
            category: "EV thuislaadpaal",
            url: `${SITE.url}/laadpalen/${charger.slug}`,
            additionalProperty,
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: charger.priceAllInFrom,
              priceValidUntil,
              url: `${SITE.url}/laadpalen/${charger.slug}`,
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: SITE.name,
                url: SITE.url,
              },
            },
          },
        ]}
      />

      <header>
        <Pill tone="muted" className="mb-2">
          {charger.brand}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {charger.name}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4">
          {charger.shortDescription}
        </p>
      </header>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <SpecBox label="Hardware vanaf" value={formatEuro(charger.priceFrom)} />
        <SpecBox label="All-in (incl. 6% btw)" value={formatEuro(charger.priceAllInFrom)} highlight />
        <SpecBox label="Garantie" value={`${charger.warrantyYears} jaar`} />
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-bold tracking-tight">Specificaties</h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Max. vermogen" value={`${charger.maxKw} kW`} />
          <Row label="Fasen" value={`${charger.phases}-fase`} />
          <Row label="Kabel" value={charger.cable === "vast" ? "Vaste kabel" : `${charger.socketType ?? "Type 2"} socket`} />
          <Row label="App" value={charger.app ? "Ja" : "Nee"} />
          <Row label="RFID" value={charger.rfid ? "Ja" : "Nee"} />
          <Row label="MID-meter" value={charger.midMeter ? "Ja, standaard" : "Nee"} />
        </dl>
      </Card>

      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Sterke punten
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {charger.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold flex items-center gap-2">
            <XCircle className="h-5 w-5 text-warning" />
            Aandachtspunten
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {charger.cons.map((c) => (
              <li key={c} className="flex gap-2">
                <XCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {brand ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Over {brand.name}</h2>
          <p className="mt-2 text-muted-foreground">{brand.description}</p>
          <Link
            to={`/merken/${brand.slug}`}
            className="mt-2 inline-flex text-primary hover:underline"
          >
            Alle modellen van {brand.name} →
          </Link>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Vergelijkbare modellen</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {alternatives.map((alt) => (
            <Link
              key={alt.slug}
              to={`/laadpalen/${alt.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
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

      {compatibleEvs.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Geschikt voor deze EVs
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            De {charger.name} levert {charger.maxKw} kW — voldoende voor deze
            populaire elektrische auto's.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {compatibleEvs.map((ev) => (
              <Link
                key={ev.slug}
                to={`/auto/${ev.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="text-xs text-muted-foreground">
                  {ev.brand} · {ev.year}
                </div>
                <div className="font-semibold">{ev.name}</div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {ev.batteryKwh} kWh · {ev.acMaxKw} kW AC
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedGuides.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Relevante gidsen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Achtergrond bij wat de {charger.name} bijzonder maakt.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                to={`/gids/${g.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <Pill tone="muted" className="mb-1.5 text-[10px]">
                  {g.category}
                </Pill>
                <div className="font-semibold line-clamp-2">{g.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {g.lede}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta
          prefill={{ model: charger.slug }}
          title={`Krijg offertes voor de ${charger.name}`}
          subtitle="3 erkende installateurs sturen u een prijs op maat — gratis en vrijblijvend."
        />
      </div>
    </PageShell>
  );
}

function SpecBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border"}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono font-bold mt-1 ${highlight ? "text-primary text-lg" : "text-base"}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-medium">{value}</dd>
    </div>
  );
}
