import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, Fuel, Home, Zap } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro, cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

// Realistische tarieven Q1 2026 (CREG)
const HOME_RATE = 0.32;       // €/kWh huishoudelijk
const PUBLIC_RATE = 0.55;     // €/kWh publieke AC-laadpaal
const FAST_RATE = 0.79;       // €/kWh DC snellader
const PV_RATE = 0.05;         // marginale kost zelfgeladen kWh
const FUEL_RATE = 1.78;       // €/L benzine
const FUEL_CONS = 6.5;        // L/100km benzineauto

export default function LaadkostCalculatorPage() {
  usePageMeta({
    title: `Laadkost berekenen — wat kost het laden van uw EV in 2026? | ${SITE.shortName}`,
    description:
      "Bereken uw jaarlijkse laadkost: thuis, publiek of via zonnepanelen. Inclusief vergelijking met een benzineauto en realistische CREG-tarieven 2026.",
    canonical: `${SITE.url}/laadkost-berekenen`,
    ogImage: `${SITE.url}/og/default.svg`,
  });

  const [kmPerJaar, setKmPerJaar] = useState(15000);
  const [verbruik, setVerbruik] = useState(18);   // kWh / 100 km
  const [pctThuis, setPctThuis] = useState(80);   // % van laden gebeurt thuis
  const [pctPublic, setPctPublic] = useState(15); // % publiek AC
  const [pctPv, setPctPv] = useState(0);          // % van thuis-laden uit eigen PV
  const [hasPv, setHasPv] = useState(false);

  const result = useMemo(() => {
    const totalKwh = (kmPerJaar * verbruik) / 100;
    const pctFast = Math.max(0, 100 - pctThuis - pctPublic);

    const homeKwh = totalKwh * (pctThuis / 100);
    const publicKwh = totalKwh * (pctPublic / 100);
    const fastKwh = totalKwh * (pctFast / 100);

    const pvKwh = hasPv ? homeKwh * (pctPv / 100) : 0;
    const homeNetKwh = homeKwh - pvKwh;

    const homeCost = homeNetKwh * HOME_RATE;
    const pvCost = pvKwh * PV_RATE;
    const publicCost = publicKwh * PUBLIC_RATE;
    const fastCost = fastKwh * FAST_RATE;
    const totalCost = homeCost + pvCost + publicCost + fastCost;
    const avgKwh = totalCost / totalKwh;
    const costPer100Km = (totalCost / kmPerJaar) * 100;

    // Vergelijking met benzineauto
    const fuelCost = (kmPerJaar * FUEL_CONS / 100) * FUEL_RATE;
    const savingsVsFuel = fuelCost - totalCost;

    return {
      totalKwh,
      pctFast,
      homeKwh,
      pvKwh,
      homeNetKwh,
      publicKwh,
      fastKwh,
      homeCost,
      pvCost,
      publicCost,
      fastCost,
      totalCost,
      avgKwh,
      costPer100Km,
      fuelCost,
      savingsVsFuel,
    };
  }, [kmPerJaar, verbruik, pctThuis, pctPublic, pctPv, hasPv]);

  // Houd percentages binnen totaal 100
  function setThuis(v: number) {
    const newThuis = Math.min(100, Math.max(0, v));
    if (newThuis + pctPublic > 100) setPctPublic(100 - newThuis);
    setPctThuis(newThuis);
  }
  function setPublic(v: number) {
    const newPublic = Math.min(100 - pctThuis, Math.max(0, v));
    setPctPublic(newPublic);
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laadkost berekenen" },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Laadkost berekenen — EV laadkost calculator",
            url: `${SITE.url}/laadkost-berekenen`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <header>
        <Pill tone="success" className="mb-2">
          Bijgewerkt met CREG-tarieven Q1 2026
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Laadkost berekenen: wat kost EV-laden u écht?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          Vul uw kilometers, gemiddeld verbruik en hoe vaak u thuis versus
          publiek laadt — wij berekenen uw jaarlijkse laadkost en vergelijken
          met een benzineauto. Tarieven gebaseerd op CREG Q1 {new Date().getFullYear()}.
        </p>
      </header>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Uw situatie</h2>
          </div>

          <Slider
            label="Kilometers per jaar"
            value={kmPerJaar}
            onChange={setKmPerJaar}
            min={5000}
            max={40000}
            step={1000}
            display={`${kmPerJaar.toLocaleString("nl-BE")} km`}
          />

          <Slider
            label="Verbruik"
            value={verbruik}
            onChange={setVerbruik}
            min={12}
            max={28}
            step={0.5}
            display={`${verbruik.toLocaleString("nl-BE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh / 100 km`}
            help="Gemiddeld 16-20 kWh; SUV's zitten 20-25, kleine EV's 13-16."
          />

          <Slider
            label="% laden thuis"
            value={pctThuis}
            onChange={setThuis}
            min={0}
            max={100}
            step={5}
            display={`${pctThuis} %`}
          />

          <Slider
            label="% laden publieke AC-paal"
            value={pctPublic}
            onChange={setPublic}
            min={0}
            max={100 - pctThuis}
            step={5}
            display={`${pctPublic} %`}
            help={`Resterend ${result.pctFast}% via DC-snellader.`}
          />

          <div className="mt-6 pt-5 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPv}
                onChange={(e) => setHasPv(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-medium text-sm">
                Ik heb zonnepanelen en doe aan zonneladen
              </span>
            </label>

            {hasPv ? (
              <div className="mt-3">
                <Slider
                  label="% thuis-laden uit eigen PV-overschot"
                  value={pctPv}
                  onChange={setPctPv}
                  min={0}
                  max={100}
                  step={5}
                  display={`${pctPv} %`}
                  help="Realistisch: 30-50% bij 6 kWp, 50-70% bij 9 kWp+."
                />
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-6 bg-primary/5 border-primary/30">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Uw resultaat</h2>
          </div>

          <div className="space-y-4">
            <Big
              label="Jaarlijkse laadkost"
              value={formatEuro(Math.round(result.totalCost))}
              accent
            />
            <div className="grid grid-cols-2 gap-3">
              <Big
                label="Per 100 km"
                value={`€${result.costPer100Km.toFixed(2)}`}
              />
              <Big
                label="Gem. €/kWh"
                value={`€${result.avgKwh.toFixed(3)}`}
              />
            </div>

            <div className="pt-4 border-t border-primary/20 text-sm space-y-2">
              <Row
                label="Thuis (net)"
                value={`${formatEuro(Math.round(result.homeCost))} (${Math.round(result.homeNetKwh)} kWh)`}
              />
              {result.pvKwh > 0 ? (
                <Row
                  label="Eigen PV"
                  value={`${formatEuro(Math.round(result.pvCost))} (${Math.round(result.pvKwh)} kWh)`}
                />
              ) : null}
              <Row
                label="Publiek AC"
                value={`${formatEuro(Math.round(result.publicCost))} (${Math.round(result.publicKwh)} kWh)`}
              />
              <Row
                label="DC-snellader"
                value={`${formatEuro(Math.round(result.fastCost))} (${Math.round(result.fastKwh)} kWh)`}
              />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">vs. benzineauto</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Een benzineauto met {FUEL_CONS} L/100 km verbruikt op {kmPerJaar.toLocaleString("nl-BE")} km
              ongeveer{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatEuro(Math.round(result.fuelCost))}
              </span>{" "}
              brandstof.
            </p>
            <div
              className={cn(
                "mt-3 p-3 rounded-md font-semibold text-sm",
                result.savingsVsFuel >= 0
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-warning/10 text-warning border border-warning/20",
              )}
            >
              {result.savingsVsFuel >= 0
                ? `EV bespaart u ${formatEuro(Math.round(result.savingsVsFuel))} per jaar`
                : `EV kost ${formatEuro(Math.round(-result.savingsVsFuel))} méér per jaar`}
            </div>
          </div>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Tarieven in detail</h2>
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Bron
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Tarief
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Wanneer typisch
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 px-3">Eigen PV-overschot</td>
                <td className="py-2 px-3 font-mono">€{PV_RATE.toFixed(2)}/kWh</td>
                <td className="py-2 px-3 text-muted-foreground">
                  Marginale kost — je 'verloren' terugleveringsvergoeding
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">Thuis (huishoudelijk)</td>
                <td className="py-2 px-3 font-mono">€{HOME_RATE.toFixed(2)}/kWh</td>
                <td className="py-2 px-3 text-muted-foreground">
                  CREG Q1 {new Date().getFullYear()} - gemiddeld levertarief
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">Publieke AC-paal (11-22 kW)</td>
                <td className="py-2 px-3 font-mono">€{PUBLIC_RATE.toFixed(2)}/kWh</td>
                <td className="py-2 px-3 text-muted-foreground">
                  Allego, TotalEnergies, Pluginvest, … incl. parkeerkost
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">DC-snellader (50-350 kW)</td>
                <td className="py-2 px-3 font-mono">€{FAST_RATE.toFixed(2)}/kWh</td>
                <td className="py-2 px-3 text-muted-foreground">
                  IONITY, Fastned, Tesla Supercharger non-Tesla
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">Benzine (referentie)</td>
                <td className="py-2 px-3 font-mono">€{FUEL_RATE.toFixed(2)}/L</td>
                <td className="py-2 px-3 text-muted-foreground">
                  Gemiddelde pompprijs E10 2026
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Hoe verlaagt u uw laadkost verder?
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Tip
            icon={<Home className="h-5 w-5" />}
            title="Laad ’s nachts"
            link="/gids/capaciteitstarief-laadpaal"
            text="Tussen 22u en 7u valt uw laadbeurt samen met een rustig huishouden. Bespaart €100-€250/jaar via laag capaciteitstarief."
          />
          <Tip
            icon={<Zap className="h-5 w-5" />}
            title="Combineer met PV"
            link="/gids/laadpaal-en-zonnepanelen"
            text="Eigen overschot benutten verlaagt uw kost van €0,32 naar €0,05/kWh. Bij 6 kWp PV bespaart u typisch €200-€400/jaar."
          />
          <Tip
            icon={<Calculator className="h-5 w-5" />}
            title="Kies smart laden"
            link="/gids/slimme-laadpaal-vs-basis"
            text="Een slimme laadpaal die automatisch op nachttarief of PV laadt, betaalt zichzelf binnen 1-2 jaar terug."
          />
          <Tip
            icon={<Fuel className="h-5 w-5" />}
            title="Vermijd snelladen"
            link="/gids/laadpaal-kosten-totaal"
            text="DC-snellader is 2,5× duurder dan thuisladen. Plan langere reizen rond goedkopere AC-laadstops als het kan."
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Veelgestelde vragen
        </h2>
        <div className="mt-5 divide-y divide-border border border-border rounded-md bg-card">
          {FAQS.map((f, i) => (
            <details key={i} className="group p-5">
              <summary className="cursor-pointer font-semibold flex items-start justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-3 text-muted-foreground leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <OfferteCta
          title="Klaar om thuis te laden?"
          subtitle="Een eigen laadpaal verdient zichzelf typisch in 2-3 jaar terug door bespaarde publieke laadkosten. 3 erkende installateurs sturen u offertes."
        />
      </div>
    </PageShell>
  );
}

const FAQS = [
  {
    q: "Welke tarieven gebruikt deze calculator?",
    a: `Voor thuisladen gebruiken we het CREG Q1-tarief van €${HOME_RATE.toFixed(2)}/kWh — dat is het officiële referentietarief dat ook werkgevers gebruiken voor terugbetaling. Publieke AC: €${PUBLIC_RATE.toFixed(2)}/kWh (gemiddelde van Allego, TotalEnergies, Pluginvest). DC-snelladers: €${FAST_RATE.toFixed(2)}/kWh (IONITY, Fastned). Eigen PV: €${PV_RATE.toFixed(2)}/kWh als marginale kost.`,
  },
  {
    q: "Klopt het verschil met benzine echt?",
    a: `We rekenen met ${FUEL_CONS} L/100 km voor een gemiddelde benzineauto en €${FUEL_RATE.toFixed(2)}/L. Een EV met 18 kWh/100 km die thuis laadt aan €${HOME_RATE.toFixed(2)} kost ongeveer €5,76/100 km — versus €11,57 voor benzine. Dat is een vermindering van ongeveer 50%.`,
  },
  {
    q: "Telt het capaciteitstarief mee?",
    a: "Niet rechtstreeks in deze calculator — het capaciteitstarief telt voor uw maandpiek (kW), niet per kWh. Maar slim laden buiten huishoudpieken kan uw maandpiek met enkele kW verlagen, wat €100-€500/jaar scheelt. Lees onze gids over capaciteitstarief.",
  },
  {
    q: "Wat als ik enkel publiek laad?",
    a: "Zet '% laden thuis' op 0 en zie het verschil. Bij dagelijkse publieke laadgewoonte ligt uw jaarkost typisch 60-80% hoger dan met een thuislaadpaal. Een thuislaadpaal van €1.500 verdient zichzelf vaak in 2-3 jaar terug.",
  },
  {
    q: "Bevat dit ook abonnementskosten van laadpas?",
    a: "Nee. De meeste laadpassen (MOBIVE, Allego) hebben €1-€5/maand vaste kost — dit zit niet in de berekening. Voor incidenteel publiek laden hoeft u geen abonnement.",
  },
  {
    q: "Ik heb een bedrijfswagen — geldt dit dan ook?",
    a: "Voor u zijn de laadkosten effectief €0 als de werkgever het verbruik terugbetaalt aan het CREG-tarief. Lees onze gids over bedrijfswagen-terugbetaling. Deze calculator is bedoeld voor wie zelf de laadkosten draagt.",
  },
];

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
  help?: string;
}

function Slider({ label, value, onChange, min, max, step, display, help }: SliderProps) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-sm font-semibold text-primary">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
      {help ? <div className="text-xs text-muted-foreground mt-1">{help}</div> : null}
    </div>
  );
}

function Big({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          "font-mono font-bold mt-1",
          accent ? "text-3xl md:text-4xl text-primary" : "text-xl",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </div>
  );
}

function Tip({
  icon,
  title,
  text,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="p-5 rounded-md border border-border bg-card hover:border-primary/50 transition flex gap-3"
    >
      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{text}</div>
      </div>
    </Link>
  );
}
