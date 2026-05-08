import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Zap } from "lucide-react";
import { Pill } from "./ui/Pill";
import { laadpunten, haversine } from "@/data/laadpunten";
import { gemeenten } from "@/data/gemeenten";
import { getTariff } from "@/data/operatorTariffs";
import { formatNumber } from "@/lib/utils";
import { isValidBelgianPostcode } from "@/lib/leadScoring";
import type { ChargingStation } from "@/data/types";

interface Props {
  // Restrict to a specific gemeente; undefined = full Vlaanderen
  gemeenteSlug?: string;
  // Initial postcode for distance calc; undefined = no distance until user types
  initialPostcode?: string;
  // Hard cap on rows displayed
  limit?: number;
  // Show postcode input widget
  showPostcodeWidget?: boolean;
}

type TypeFilter = "all" | "AC" | "DC" | "AC+DC";

export function LaadpuntenLijst({
  gemeenteSlug,
  initialPostcode = "",
  limit = 100,
  showPostcodeWidget = true,
}: Props) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [type, setType] = useState<TypeFilter>("all");
  const [minKw, setMinKw] = useState(0);
  const [operatorFilter, setOperatorFilter] = useState<string>("all");

  // Calculate the user's reference center based on their postcode (if any).
  const center = useMemo(() => {
    if (!isValidBelgianPostcode(postcode)) return null;
    const g = gemeenten.find((x) => x.postcodes.includes(postcode));
    if (!g) return null;
    return centerOfGemeente(g.slug);
  }, [postcode]);

  const sourceStations = useMemo(
    () =>
      gemeenteSlug
        ? laadpunten.filter((p) => p.gemeenteSlug === gemeenteSlug)
        : laadpunten,
    [gemeenteSlug],
  );

  const operators = useMemo(() => {
    const set = new Set(sourceStations.map((s) => s.operator));
    return [...set].sort();
  }, [sourceStations]);

  const enriched = useMemo(() => {
    let list = sourceStations
      .filter((s) => (type === "all" ? true : s.type === type))
      .filter((s) => s.maxKw >= minKw)
      .filter((s) => (operatorFilter === "all" ? true : s.operator === operatorFilter))
      .map((s) => ({
        ...s,
        distance: center ? haversine(center.lat, center.lng, s.lat, s.lng) : null,
      }));
    if (center) {
      list = list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      list = list.sort((a, b) => b.maxKw - a.maxKw);
    }
    return list.slice(0, limit);
  }, [sourceStations, type, minKw, operatorFilter, center, limit]);

  return (
    <div>
      {showPostcodeWidget ? (
        <div className="rounded-md border border-border bg-card p-4 md:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">Vind het dichtstbijzijnde laadpunt</div>
              <div className="text-xs text-muted-foreground">
                Vul uw postcode in om afstanden te berekenen.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="text-xs">
              <div className="font-medium mb-1">Uw postcode</div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                placeholder="2000"
                maxLength={4}
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </label>
            <label className="text-xs">
              <div className="font-medium mb-1">Type laadpunt</div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeFilter)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">AC en DC</option>
                <option value="AC">Enkel AC</option>
                <option value="DC">Enkel DC (snel)</option>
                <option value="AC+DC">Beide aanwezig</option>
              </select>
            </label>
            <label className="text-xs">
              <div className="font-medium mb-1">
                Minimum vermogen{" "}
                <span className="font-mono text-primary">{minKw} kW</span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                step={11}
                value={minKw}
                onChange={(e) => setMinKw(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>
            <label className="text-xs">
              <div className="font-medium mb-1">Operator</div>
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">Alle operatoren</option>
                {operators.map((o) => (
                  <option key={o} value={o}>
                    {getTariff(o).name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex justify-between">
            <span>{enriched.length} laadpunten getoond</span>
            {center ? (
              <span className="text-primary">
                Gesorteerd op afstand vanaf {postcode}
              </span>
            ) : (
              <span>Sorteer op vermogen — geef een geldige postcode in voor afstand</span>
            )}
          </div>
        </div>
      ) : null}

      {enriched.length === 0 ? (
        <div className="mt-6 p-6 text-center text-muted-foreground border border-dashed border-border rounded-md">
          Geen laadpunten gevonden met deze filters.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border rounded-md bg-card">
          {enriched.map((s) => (
            <Row key={s.id} station={s} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  station,
}: {
  station: ChargingStation & { distance: number | null };
}) {
  const tariff = getTariff(station.operator);
  const price =
    station.type === "DC"
      ? tariff.dcPrice
      : station.type === "AC"
        ? tariff.acPrice
        : (tariff.acPrice ?? tariff.dcPrice);

  return (
    <li className="p-4 md:p-5 hover:bg-muted/30">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {tariff.name}
          </div>
          <Link
            to={`/laadpunt/${station.id}`}
            className="font-semibold hover:text-primary"
          >
            {station.name}
          </Link>
          <div className="text-sm text-muted-foreground mt-1">
            {station.address}
            {station.address ? ", " : ""}
            {station.postcode}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone="info">
              <Zap className="h-3 w-3 inline mr-1" />
              {station.maxKw} kW
            </Pill>
            <Pill tone={station.type === "DC" ? "success" : "muted"}>
              {station.type}
            </Pill>
            <Pill tone="muted">
              {station.connectors} {station.connectors === 1 ? "stekker" : "stekkers"}
            </Pill>
          </div>
        </div>

        <div className="md:text-right md:w-44 flex-shrink-0">
          {station.distance != null ? (
            <div className="font-mono font-bold text-primary">
              {formatNumber(station.distance, 1)} km
            </div>
          ) : null}
          {price != null ? (
            <div className="text-xs text-muted-foreground mt-1">
              ± €{price.toFixed(2)}/kWh
              {tariff.startFee ? ` + €${tariff.startFee.toFixed(2)} start` : ""}
            </div>
          ) : null}
          {tariff.url ? (
            <a
              href={tariff.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Tarief bij {tariff.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function centerOfGemeente(slug: string): { lat: number; lng: number } | null {
  const stations = laadpunten.filter((p) => p.gemeenteSlug === slug);
  if (stations.length > 0) {
    const lat = stations.reduce((s, p) => s + p.lat, 0) / stations.length;
    const lng = stations.reduce((s, p) => s + p.lng, 0) / stations.length;
    return { lat, lng };
  }
  // Fall back: gemiddelde van alle laadpunten in dezelfde provincie
  const g = gemeenten.find((x) => x.slug === slug);
  if (!g) return null;
  const peers = laadpunten.filter(
    (p) => gemeenten.find((x) => x.slug === p.gemeenteSlug)?.provincie === g.provincie,
  );
  if (peers.length === 0) return null;
  const lat = peers.reduce((s, p) => s + p.lat, 0) / peers.length;
  const lng = peers.reduce((s, p) => s + p.lng, 0) / peers.length;
  return { lat, lng };
}
