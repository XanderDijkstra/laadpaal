import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { chargers } from "@/data/chargers";

interface Pick {
  category: string;
  badge: string;
  chargerSlug: string;
  why: string;
  ideal: string;
}

const PICKS: Pick[] = [
  {
    category: "Beste keuze overall",
    badge: "OVERALL",
    chargerSlug: "easee-charge-up",
    why: "De Easee Charge Up combineert een scherpe prijs met de polished app-ervaring waar Easee om bekend staat. Modulair systeem (uitbreidbaar tot 3 chargers), sterke fasebalancering en betrouwbare prestaties bij koud weer. Geen MID-meter, dus minder geschikt voor bedrijfswagens — voor pure thuisgebruik raken weinig modellen aan deze waarde.",
    ideal: "Particulieren met één EV, geen bedrijfswagen-context, woningen met 1- of 3-fase aansluiting.",
  },
  {
    category: "Beste budget keuze",
    badge: "BUDGET",
    chargerSlug: "heidelberg-energy-control",
    why: "Geen app, geen wifi, geen RFID — pure laadhardware uit Duitsland voor onder de €1.100 all-in. Voor wie 's nachts laadt en geen variabel tarief heeft is dit volstrekt voldoende. Lange Duitse staat-van-dienst en eenvoudige installatie.",
    ideal: "Eenvoudige opstelling met één EV, vast tarief, geen plannen voor zonneladen of bedrijfswagen-terugbetaling.",
  },
  {
    category: "Beste premium keuze",
    badge: "PREMIUM",
    chargerSlug: "alfen-eve-single-pro-line",
    why: "Industriële Nederlandse kwaliteit met MID-meter standaard, OCPP-implementatie van enterprise-niveau en bewezen 5+ jaar uptime. Wat Alfen mist op app-glamour wint hij ruim terug op betrouwbaarheid en uitbreidbaarheid. De referentie voor zakelijke installaties in de Benelux.",
    ideal: "Bedrijfswagen met werkgever-terugbetaling, VME's, bedrijven die OCPP nodig hebben.",
  },
  {
    category: "Beste keuze voor zonnepanelen",
    badge: "SOLAR",
    chargerSlug: "myenergi-zappi",
    why: "Letterlijk ontworpen voor zonneladen. Drie laadmodi (Eco+, Eco, Fast) regelen exact hoeveel u uit het PV-overschot wilt halen versus uit het net. Geen Belgische distributie zo breed als Easee, maar dé referentie voor PV-eigenaars die elke zonnige kWh willen benutten.",
    ideal: "Huishoudens met 6 kWp+ aan zonnepanelen die hun overschot in de auto willen laden in plaats van het terug te leveren tegen het lage tarief.",
  },
  {
    category: "Beste keuze voor bedrijfswagen",
    badge: "BEDRIJFSWAGEN",
    chargerSlug: "zaptec-go-2",
    why: "MID-meter standaard (klasse B), 5 jaar garantie, robuuste 4G/Wi-Fi/Ethernet connectiviteit en automatische rapportage naar de werkgever. Je krijgt al de smart-features van een midrange charger, maar dan fiscaal in orde voor terugbetaling aan het CREG-tarief.",
    ideal: "Werknemer met elektrische bedrijfswagen waar de werkgever het verbruik via MID-meter terugbetaalt.",
  },
  {
    category: "Beste keuze voor dynamisch tarief",
    badge: "DYNAMIC",
    chargerSlug: "ohme-home-pro",
    why: "Ohme synchroniseert rechtstreeks met dynamische energieleveranciers (Bolt, ENGIE Drive, TotalEnergies Pulse) en plant uw laadbeurt automatisch in de goedkoopste uren. Bespaart €100-€250/jaar bij een dynamisch tarief — in 1-2 jaar is de meerprijs terugverdiend.",
    ideal: "Klanten van Bolt, ENGIE Drive of vergelijkbare dynamische leveranciers die kunnen laden tussen 22u en 7u.",
  },
  {
    category: "Beste keuze voor multi-EV / VME",
    badge: "MULTI",
    chargerSlug: "zaptec-pro",
    why: "Schaalbaar tot 100+ chargers via Zaptec Cloud, centraal beheer, OCPP 1.6/2.0, MID-meter standaard. De keuze voor appartementsgebouwen, kantoorparkings en flotenbeheerders die later willen kunnen uitbreiden zonder hardware te wijzigen.",
    ideal: "VME's, appartementsgebouwen, bedrijven die nu één charger nodig hebben maar over 2-3 jaar 10+.",
  },
  {
    category: "Beste keuze voor enthousiast",
    badge: "POWER USER",
    chargerSlug: "go-e-charger-gemini-22",
    why: "Open API, native integratie met Home Assistant, openHAB en EVCC. Voor wie zelf de regie wilt voeren over laadlogica via een smart-home opzet. Compact, MID standaard, en een enthousiaste community die hardware tweaken normaal vindt.",
    ideal: "Smart-home enthousiastelingen die hun laadpaal willen integreren met PV-monitoring, batterij en huisautomatisering.",
  },
];

export default function BesteLaadpaalPage() {
  const year = new Date().getFullYear();
  usePageMeta({
    title: `Beste laadpaal ${year}: onze 8 winnaars per categorie | ${SITE.shortName}`,
    description: `Onafhankelijke koopgids ${year}: de beste laadpaal voor thuis, voor bedrijfswagens, voor zonnepanelen en voor budget. 36 modellen vergeleken, 8 winnaars.`,
    canonical: `${SITE.url}/beste-laadpaal`,
    ogImage: `${SITE.url}/og/default.svg`,
  });

  const picksWithCharger = PICKS.map((p) => ({
    ...p,
    charger: chargers.find((c) => c.slug === p.chargerSlug)!,
  }));

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: `Beste laadpaal ${year}` },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Beste laadpaal ${year}: 8 winnaars per categorie`,
            description: `Onafhankelijke koopgids ${year}. 36 modellen vergeleken, 8 winnaars per gebruiksprofiel.`,
            datePublished: `${year}-01-15`,
            dateModified: `${year}-01-15`,
            url: `${SITE.url}/beste-laadpaal`,
            author: { "@type": "Organization", name: SITE.name },
            publisher: { "@type": "Organization", name: SITE.name },
            image: `${SITE.url}/og/default.svg`,
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Beste laadpaal ${year} per categorie`,
            itemListElement: picksWithCharger.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${p.category}: ${p.charger.name}`,
              url: `${SITE.url}/laadpalen/${p.charger.slug}`,
            })),
          },
        ]}
      />

      <header>
        <Pill tone="success" className="mb-2">
          Bijgewerkt januari {year}
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          Beste laadpaal {year}: onze 8 winnaars per categorie
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
          De ‘beste laadpaal’ bestaat niet — de juiste laadpaal hangt af van uw
          situatie. We hebben 36 modellen van 18 merken naast elkaar gelegd en
          per gebruiksprofiel een winnaar gekozen. Geen sponsoring, geen
          affiliate links — enkel onze eerlijke aanbeveling.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">In één oogopslag</h2>
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Categorie
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Winnaar
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Vermogen
                </th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  All-in vanaf
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {picksWithCharger.map((p) => (
                <tr key={p.chargerSlug} className="hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{p.category}</td>
                  <td className="py-2 px-3">
                    <Link
                      to={`/laadpalen/${p.charger.slug}`}
                      className="text-primary hover:underline"
                    >
                      {p.charger.name}
                    </Link>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">
                    {p.charger.maxKw} kW · {p.charger.phases}-fase
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold">
                    {formatEuro(p.charger.priceAllInFrom)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 space-y-8">
        {picksWithCharger.map((p, idx) => (
          <Card key={p.chargerSlug} className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 px-3 items-center rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wider">
                {p.badge}
              </span>
              <span className="text-sm text-muted-foreground">
                #{idx + 1} · {p.category}
              </span>
            </div>
            <h2 className="mt-3 font-heading text-2xl md:text-3xl font-bold tracking-tight">
              {p.charger.name}
            </h2>
            <div className="mt-2 text-sm text-muted-foreground">
              {p.charger.brand} · {p.charger.maxKw} kW · {p.charger.phases}-fase ·
              {p.charger.midMeter ? " MID-meter standaard ·" : ""} {p.charger.warrantyYears} jaar garantie
            </div>
            <div className="mt-3 font-mono font-bold text-xl">
              vanaf {formatEuro(p.charger.priceAllInFrom)} all-in
            </div>

            <p className="mt-4 leading-relaxed">{p.why}</p>

            <div className="mt-4 p-4 rounded-md bg-muted/40 border border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ideaal voor
              </div>
              <div className="mt-1 text-sm">{p.ideal}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/laadpalen/${p.charger.slug}`}
                className="inline-flex items-center gap-1 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Bekijk volledige review
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/offerte?model=${p.charger.slug}`}
                className="inline-flex items-center gap-1 h-10 px-4 rounded-md border border-border text-sm font-medium hover:border-primary/50"
              >
                Vraag offertes voor de {p.charger.name}
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Hoe wij hebben gekozen
        </h2>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          We baseren ons op publiek beschikbare specs, eigenaar-feedback uit
          installateurs-netwerken in Vlaanderen en de officiële prijslijsten van
          erkende verdelers. Geen enkele fabrikant betaalt om in deze lijst te
          staan.
        </p>
        <ul className="mt-4 space-y-3 max-w-3xl">
          <Criterion>
            <strong>Prijs/kwaliteit:</strong> niet de goedkoopste, niet de
            duurste — wat krijgt u voor uw geld in deze categorie?
          </Criterion>
          <Criterion>
            <strong>Beschikbaarheid in BE:</strong> minstens drie verdelers
            actief in Vlaanderen met onderhoud-support.
          </Criterion>
          <Criterion>
            <strong>Bewezen levensduur:</strong> minimaal 3 jaar verkoop in BE,
            geen actieve recall of ernstige firmware-issues open.
          </Criterion>
          <Criterion>
            <strong>Eerlijke specs:</strong> we kijken naar wat er werkelijk in
            de doos zit (MID, RFID, OCPP), niet naar marketingclaims.
          </Criterion>
          <Criterion>
            <strong>Bruikbaarheid voor de doelgroep:</strong> een PV-charger is
            anders dan een budget-charger — beide zijn ‘goed’ in hun context.
          </Criterion>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Veelgestelde vragen
        </h2>
        <div className="mt-5 divide-y divide-border border border-border rounded-md bg-card">
          <Q
            q="Welke laadpaal is écht ‘de beste’?"
            a="Geen enkele. De Easee Charge Up wint voor het gemiddelde gezin, maar verliest direct van Zappi voor PV-eigenaars en van Alfen voor bedrijfswagens. Kies op basis van uw situatie — niet op een algemene 'top 1' lijst."
          />
          <Q
            q="Zit Wallbox of Tesla niet in de lijst?"
            a="Beide zijn solide opties (Wallbox Pulsar Plus, Tesla Wall Connector) maar in geen enkele categorie de duidelijke #1. Voor Wallbox: Easee biedt vergelijkbare smart-features tegen lagere prijs. Voor Tesla: enkel zinvol als u in het Tesla-ecosysteem zit."
          />
          <Q
            q="Hoe vaak werken we deze lijst bij?"
            a="Twee keer per jaar of bij significante product-updates. Datum bovenaan toont laatste herziening."
          />
          <Q
            q="Krijgt u een commissie als ik via deze pagina koop?"
            a="Nee. Wij verdienen aan de offerteflow (installateurs betalen voor leads), niet aan productverkopen. Onze ranking blijft daarom puur op merites gebaseerd."
          />
          <Q
            q="Wat als mijn favoriete model niet vermeld staat?"
            a="Bekijk onze /laadpalen pagina voor alle 36 modellen met sortering en filters. Daar kunt u zelf vergelijken op vermogen, kabel, MID-meter en budget."
          />
        </div>
      </section>

      <div className="mt-16">
        <OfferteCta
          title="Niet zeker welke past bij uw situatie?"
          subtitle="3 erkende installateurs sturen u offertes met gepersonaliseerd advies — gratis en vrijblijvend."
        />
      </div>
    </PageShell>
  );
}

function Criterion({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function Q({ q, a }: { q: string; a: string }) {
  return (
    <details className="group p-5">
      <summary className="cursor-pointer font-semibold flex items-start justify-between gap-4">
        <span>{q}</span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">
          ⌄
        </span>
      </summary>
      <div className="mt-3 text-muted-foreground leading-relaxed">{a}</div>
    </details>
  );
}
