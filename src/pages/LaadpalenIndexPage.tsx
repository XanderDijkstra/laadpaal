import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpDown, Check, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { chargers } from "@/data/chargers";
import { brands } from "@/data/brands";

type SortKey = "name" | "brand" | "maxKw" | "warrantyYears";
type SortDir = "asc" | "desc";
type CableFilter = "all" | "vast" | "socket";
type PhaseFilter = "all" | "1" | "3";

export default function LaadpalenIndexPage() {
  usePageMeta({
    title: `Alle ${chargers.length} laadpalen voor thuis vergeleken`,
    description: `Vergelijk ${chargers.length} thuislaadpalen van ${brands.length} merken. Filter op vermogen, kabel, MID-meter en app. Krijg gratis offertes van erkende installateurs.`,
    canonical: `${SITE.url}/laadpalen`,
  });

  const [view, setView] = useState<"cards" | "table">("table");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [cableFilter, setCableFilter] = useState<CableFilter>("all");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [midOnly, setMidOnly] = useState(false);
  const [appOnly, setAppOnly] = useState(false);

  const filtered = useMemo(() => {
    const result = chargers.filter((c) => {
      if (brandFilter !== "all" && c.brandSlug !== brandFilter) return false;
      if (cableFilter !== "all" && c.cable !== cableFilter) return false;
      if (phaseFilter !== "all" && String(c.phases) !== phaseFilter) return false;
      if (midOnly && !c.midMeter) return false;
      if (appOnly && !c.app) return false;
      return true;
    });

    return [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortDir, brandFilter, cableFilter, phaseFilter, midOnly, appOnly]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setBrandFilter("all");
    setCableFilter("all");
    setPhaseFilter("all");
    setMidOnly(false);
    setAppOnly(false);
  }

  return (
    <PageShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Laadpalen" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Alle laadpaalmodellen",
          url: `${SITE.url}/laadpalen`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: chargers.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE.url}/laadpalen/${c.slug}`,
              name: c.name,
            })),
          },
        }}
      />
      <header>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Alle laadpaalmodellen voor thuis
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          {chargers.length} modellen van {brands.length} merken. Filter op vermogen,
          kabel, MID-meter en app. Klik op een kolomtitel om te sorteren. Voor uw
          installatieprijs vraagt u 3 gratis offertes — werkelijke kost varieert
          per situatie.
        </p>
      </header>

      <div className="mt-8 rounded-md border border-border bg-card p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            <div className="font-medium mb-1">Merk</div>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">Alle merken</option>
              {brands
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.countryFlag} {b.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Kabel</div>
            <select
              value={cableFilter}
              onChange={(e) => setCableFilter(e.target.value as CableFilter)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">Alle kabels</option>
              <option value="vast">Vaste kabel</option>
              <option value="socket">Type 2 socket</option>
            </select>
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Fase</div>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as PhaseFilter)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">1- en 3-fase</option>
              <option value="1">1-fase (max 7,4 kW)</option>
              <option value="3">3-fase (11-22 kW)</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setMidOnly((v) => !v)}
            className={cn(
              "px-3 py-1.5 rounded-md border text-xs font-medium",
              midOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40",
            )}
          >
            {midOnly ? "✓ " : ""}Enkel met MID-meter
          </button>
          <button
            type="button"
            onClick={() => setAppOnly((v) => !v)}
            className={cn(
              "px-3 py-1.5 rounded-md border text-xs font-medium",
              appOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40",
            )}
          >
            {appOnly ? "✓ " : ""}Enkel met app
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} / {chargers.length} resultaten
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Reset
            </button>
            <div className="ml-2 flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium",
                  view === "table" ? "bg-primary text-primary-foreground" : "bg-background",
                )}
              >
                Tabel
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium",
                  view === "cards" ? "bg-primary text-primary-foreground" : "bg-background",
                )}
              >
                Kaarten
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="mt-8 overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <Th label="Model" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Merk" sortKey="brand" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Vermogen" sortKey="maxKw" current={sortKey} dir={sortDir} onSort={toggleSort} numeric />
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Kabel</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">App</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">RFID</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">MID</th>
                <Th label="Garantie" sortKey="warrantyYears" current={sortKey} dir={sortDir} onSort={toggleSort} numeric />
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.slug} className="hover:bg-muted/30">
                  <td className="py-2 px-3">
                    <Link to={`/laadpalen/${c.slug}`} className="font-medium hover:text-primary">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">{c.brand}</td>
                  <td className="py-2 px-3 font-mono">{c.maxKw} kW</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {c.cable === "vast" ? "Vast" : "Socket"}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {c.app ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground inline" />}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {c.rfid ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground inline" />}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {c.midMeter ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground inline" />}
                  </td>
                  <td className="py-2 px-3 font-mono">{c.warrantyYears} jaar</td>
                  <td className="py-2 px-3 text-right">
                    <Link
                      to={`/laadpalen/${c.slug}`}
                      className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                    >
                      Bekijk <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Geen modellen voldoen aan deze filters.{" "}
                    <button onClick={resetFilters} className="text-primary hover:underline">
                      Filters resetten
                    </button>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              to={`/laadpalen/${c.slug}`}
              className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition flex flex-col"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {c.brand}
              </div>
              <h3 className="font-bold text-lg mt-1">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {c.shortDescription}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone="info">⚡ {c.maxKw} kW</Pill>
                <Pill tone="muted">{c.cable === "vast" ? "Vaste kabel" : "Type 2 socket"}</Pill>
                {c.midMeter ? <Pill tone="success">MID-meter</Pill> : null}
              </div>
              <div className="mt-auto pt-4 flex items-end justify-end">
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  Bekijk review <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Geen modellen voldoen aan deze filters.{" "}
              <button onClick={resetFilters} className="text-primary hover:underline">
                Filters resetten
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-16">
        <OfferteCta />
      </div>
    </PageShell>
  );
}

function Th({
  label,
  sortKey,
  current,
  dir,
  onSort,
  numeric = false,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  numeric?: boolean;
}) {
  const active = current === sortKey;
  return (
    <th className="py-2 px-3 font-semibold text-muted-foreground">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active ? "text-foreground" : "",
          numeric ? "" : "",
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-transform",
            active && dir === "desc" ? "rotate-180" : "",
            active ? "text-primary" : "text-muted-foreground/50",
          )}
        />
      </button>
    </th>
  );
}
