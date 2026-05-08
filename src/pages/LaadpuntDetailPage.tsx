import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Navigation,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { LaadpuntenMap } from "@/components/LaadpuntenMap";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { laadpunten, haversine } from "@/data/laadpunten";
import { gemeenten } from "@/data/gemeenten";
import { getTariff } from "@/data/operatorTariffs";
import { formatNumber } from "@/lib/utils";

export default function LaadpuntDetailPage() {
  const { id } = useParams();
  const station = laadpunten.find((s) => s.id === id);
  if (!station) return <NotFoundPage />;

  const gemeente = gemeenten.find((g) => g.slug === station.gemeenteSlug);
  const tariff = getTariff(station.operator);

  // Nearest 4 other stations (by Haversine, capped at 25 km)
  const nearby = laadpunten
    .filter((s) => s.id !== station.id)
    .map((s) => ({
      ...s,
      distance: haversine(station.lat, station.lng, s.lat, s.lng),
    }))
    .filter((s) => s.distance <= 25)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  // Other stations from the same operator within 50 km
  const sameOperator = laadpunten
    .filter((s) => s.id !== station.id && s.operator === station.operator)
    .map((s) => ({
      ...s,
      distance: haversine(station.lat, station.lng, s.lat, s.lng),
    }))
    .filter((s) => s.distance <= 50)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  const acPrice = tariff.acPrice;
  const dcPrice = tariff.dcPrice;
  const indicativePrice =
    station.type === "DC"
      ? dcPrice
      : station.type === "AC"
        ? acPrice
        : (acPrice ?? dcPrice);

  const fullName = station.name || `Laadpunt ${gemeente?.name ?? ""}`.trim();
  const fullAddress = [station.address, station.postcode, gemeente?.name]
    .filter(Boolean)
    .join(", ");

  usePageMeta({
    title: `${fullName} — ${tariff.name} · ${station.maxKw} kW · ${gemeente?.name ?? ""}`.slice(0, 70),
    description:
      `${fullName} in ${gemeente?.name ?? "Vlaanderen"}: ${station.maxKw} kW ${station.type} laadpunt van ${tariff.name}. ${station.connectors} ${station.connectors === 1 ? "stekker" : "stekkers"}. Adres, route en indicatief tarief.`.slice(0, 165),
    canonical: `${SITE.url}/laadpunt/${station.id}`,
  });

  const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}#map=18/${station.lat}/${station.lng}`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laadpunten", href: "/laadpunten" },
        ...(gemeente
          ? [{ label: gemeente.name, href: `/laadpunten/${gemeente.slug}` }]
          : []),
        { label: fullName },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "EVChargingStation",
            name: fullName,
            url: `${SITE.url}/laadpunt/${station.id}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: station.address || undefined,
              postalCode: station.postcode || undefined,
              addressLocality: gemeente?.name,
              addressRegion: gemeente?.provincie,
              addressCountry: "BE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: station.lat,
              longitude: station.lng,
            },
            containedInPlace: gemeente
              ? {
                  "@type": "AdministrativeArea",
                  name: gemeente.name,
                  containedInPlace: {
                    "@type": "AdministrativeArea",
                    name: gemeente.provincie,
                  },
                }
              : undefined,
            amenityFeature: [
              {
                "@type": "LocationFeatureSpecification",
                name: "Maximaal vermogen",
                value: `${station.maxKw} kW`,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Type",
                value: station.type,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Aantal stekkers",
                value: station.connectors,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Operator",
                value: tariff.name,
              },
            ],
          },
        ]}
      />

      <header>
        <Pill tone="muted" className="mb-2">
          {tariff.name}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {fullName}
        </h1>
        {fullAddress ? (
          <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
            <MapPin className="h-4 w-4 inline mr-1.5 -mt-0.5" />
            {fullAddress}
          </p>
        ) : null}
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <Pill tone="info">
          <Zap className="h-3 w-3 inline mr-1" />
          {station.maxKw} kW
        </Pill>
        <Pill tone={station.type === "DC" ? "success" : "muted"}>
          {station.type}
        </Pill>
        <Pill tone="muted">
          {station.connectors}{" "}
          {station.connectors === 1 ? "stekker" : "stekkers"}
        </Pill>
      </div>

      <section className="mt-8">
        <h2 className="sr-only">Locatie op de kaart</h2>
        <LaadpuntenMap
          stations={[station]}
          center={[station.lat, station.lng]}
          zoom={16}
          autoFit={false}
          height={360}
        />
      </section>

      <section className="mt-8 grid sm:grid-cols-2 gap-3">
        <a
          href={gmapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-md border border-primary/30 bg-primary/5 hover:border-primary/60 transition flex items-center gap-3"
        >
          <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold">Route via Google Maps</div>
            <div className="text-xs text-muted-foreground">
              Open in browser of app op uw telefoon
            </div>
          </div>
        </a>
        <a
          href={osmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition flex items-center gap-3"
        >
          <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div className="font-semibold">Bekijk in OpenStreetMap</div>
            <div className="text-xs text-muted-foreground">
              Coördinaten {formatNumber(station.lat, 4)},{" "}
              {formatNumber(station.lng, 4)}
            </div>
          </div>
        </a>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Indicatief tarief van {tariff.name}
        </h2>
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs">
          <strong>Indicatief, geen offerte.</strong> Werkelijk tarief hangt af
          van uw laadpas, abonnement, locatie en tijdstip. Controleer altijd
          het tarief in de app of op de paal vóór u laadt.
        </div>
        <Card className="mt-4 p-5">
          <dl className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                AC tarief
              </dt>
              <dd className="font-mono text-lg font-bold mt-1">
                {acPrice != null ? `€${acPrice.toFixed(2)}/kWh` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                DC tarief
              </dt>
              <dd className="font-mono text-lg font-bold mt-1">
                {dcPrice != null ? `€${dcPrice.toFixed(2)}/kWh` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                Start fee
              </dt>
              <dd className="font-mono text-lg font-bold mt-1">
                {tariff.startFee != null
                  ? `€${tariff.startFee.toFixed(2)}`
                  : "geen"}
              </dd>
            </div>
          </dl>
          {tariff.notes ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {tariff.notes}
            </p>
          ) : null}
          {tariff.url ? (
            <a
              href={tariff.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
            >
              Officieel tarief bij {tariff.name}{" "}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {indicativePrice != null && station.maxKw > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Voorbeeld: een EV met 60 kWh batterij voor de helft opladen
              kost ongeveer{" "}
              <span className="font-mono font-semibold text-foreground">
                €{(30 * indicativePrice).toFixed(2)}
              </span>{" "}
              tegen dit tarief.
            </p>
          ) : null}
        </Card>
      </section>

      {nearby.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Nabijgelegen laadpunten
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            De {nearby.length} dichtstbijzijnde alternatieven binnen 25 km.
          </p>
          <ul className="mt-4 divide-y divide-border border border-border rounded-md bg-card">
            {nearby.map((n) => (
              <li key={n.id}>
                <Link
                  to={`/laadpunt/${n.id}`}
                  className="block p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {getTariff(n.operator).name}
                      </div>
                      <div className="font-semibold mt-0.5">{n.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {n.maxKw} kW · {n.type} · {n.connectors}{" "}
                        {n.connectors === 1 ? "stekker" : "stekkers"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-primary">
                        {formatNumber(n.distance, 1)} km
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary inline" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sameOperator.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Andere {tariff.name} laadpunten in de buurt
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {sameOperator.map((s) => (
              <Link
                key={s.id}
                to={`/laadpunt/${s.id}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold line-clamp-1">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      {s.maxKw} kW · {s.type}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-primary">
                    {formatNumber(s.distance, 1)} km
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {gemeente ? (
        <section className="mt-10 grid sm:grid-cols-2 gap-3">
          <Link
            to={`/laadpunten/${gemeente.slug}`}
            className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Alle laadpunten
            </div>
            <div className="font-semibold mt-1">
              Publieke laadpunten in {gemeente.name}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Bekijk alle stations met postcode-zoeker en filter →
            </div>
          </Link>
          <Link
            to={`/gemeente/${gemeente.slug}`}
            className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Eigen laadpaal
            </div>
            <div className="font-semibold mt-1">
              Laadpaal-installateur in {gemeente.name}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              3 erkende installateurs sturen u offertes →
            </div>
          </Link>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta
          title="Liever thuisladen?"
          subtitle="Een eigen laadpaal verdient zichzelf typisch in 2-3 jaar terug versus publiek laden. Krijg gratis offertes van erkende installateurs."
          prefill={
            gemeente
              ? { postcode: gemeente.postcodes[0], gemeente: gemeente.slug }
              : undefined
          }
        />
      </div>
    </PageShell>
  );
}
