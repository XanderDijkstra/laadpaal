import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { JsonLd } from "@/components/JsonLd";
import { VATCalculator } from "@/components/VATCalculator";
import { OfferteCta } from "@/components/OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { brands } from "@/data/brands";
import { evModels } from "@/data/evModels";
import { gemeenten } from "@/data/gemeenten";
import { guides } from "@/data/guides";

const TOP_BRANDS = [
  "zaptec",
  "easee",
  "wallbox",
  "alfen",
  "peblar",
  "smappee",
  "tesla",
  "myenergi",
];
const TOP_EV = [
  "tesla-model-y",
  "tesla-model-3",
  "bmw-i4",
  "volvo-ex30",
  "audi-q4-e-tron",
  "kia-ev6",
  "vw-id4",
  "hyundai-ioniq-5",
  "skoda-enyaq",
  "polestar-2",
  "mercedes-eqa",
  "porsche-taycan",
];
const TOP_GEMEENTEN = [
  "antwerpen",
  "gent",
  "brugge",
  "leuven",
  "hasselt",
  "mechelen",
  "aalst",
  "sint-niklaas",
  "kortrijk",
  "oostende",
  "roeselare",
  "genk",
];

const FAQ = [
  {
    q: "Heb ik recht op 6% btw op mijn laadpaal?",
    a: "Ja, als uw woning minimaal 10 jaar oud is, de installatie gebeurt door een erkend installateur, en de laadpaal in/aan/in de garage van uw privéwoning komt. Uw installateur past het tarief automatisch toe op de factuur.",
  },
  {
    q: "Welk laadvermogen heb ik thuis nodig?",
    a: "Voor de meeste particulieren volstaat 11 kW. Een nacht laden geeft u 70-90 km extra rijbereik per uur. 22 kW is enkel zinvol als uw EV dat ook AC accepteert (Renault Megane E-Tech, Porsche Taycan), wat bij minder dan 5% van de modellen het geval is.",
  },
  {
    q: "Mag ik zelf een laadpaal installeren?",
    a: "Nee. Voor 6% btw én voor de verplichte AREI-keuring is een erkend installateur vereist. Zelf monteren betekent automatisch 21% btw én een hoog risico op afkeuring.",
  },
  {
    q: "Hoe lang duurt de installatie?",
    a: "Standaard plaatsing duurt een halve dag (4 uur), inclusief de bekabeling van meterkast naar laadpaalpositie. Bij verzwaring van 1- naar 3-fase kan het 1-2 dagen worden, afhankelijk van Fluvius-planning.",
  },
  {
    q: "Is een AREI-keuring verplicht?",
    a: "Ja, sinds AREI 2020 vereist elke nieuwe laadpaalinstallatie een keuring door een erkend organisme (Vinçotte, BTV, ACEG…). De keuring is meestal inbegrepen in de offerte van uw installateur.",
  },
  {
    q: "Wat is dynamic load balancing?",
    a: "Een functie die uw laadvermogen automatisch terugschakelt wanneer andere toestellen veel verbruiken. Voorkomt dat uw hoofdzekering springt — vooral nuttig bij oudere aansluitingen of capaciteitstarief in Vlaanderen.",
  },
  {
    q: "1-fase of 3-fase laadpaal?",
    a: "Hangt af van uw aansluiting. 1-fase 40A geeft maximaal 7,4 kW. 3-fase geeft 11 of 22 kW. Verzwaring van 1- naar 3-fase wordt aangevraagd bij Fluvius — uw installateur kan dit voor u inplannen.",
  },
  {
    q: "Kan ik laden combineren met zonnepanelen?",
    a: "Ja. Meerdere chargers (Smappee EV Wall, MyEnergi Zappi, Zaptec met overschot-modus) ondersteunen ‘zonneladen’: ze laden uitsluitend met PV-overschot. Hiermee vermijdt u het lage terugleveringstarief.",
  },
];

export default function HomePage() {
  usePageMeta({
    title: `Laadpaal vergelijken — 3 gratis offertes | ${SITE.shortName}`,
    description:
      "Vergelijk gratis offertes van erkende installateurs in jouw gemeente. 6% btw automatisch berekend. Zaptec, Easee, Wallbox en meer.",
    canonical: `${SITE.url}/`,
  });

  return (
    <PageShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.url,
            inLanguage: "nl-BE",
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-2">
        <div>
          <Pill tone="success" className="mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            6% btw bij installatie in oudere woning
          </Pill>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
            Laadpaal voor thuis. Ontvang 3 offertes, kies de beste.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-prose">
            Vergelijk gratis offertes van erkende installateurs in uw gemeente.
            Profiteer van 6% btw, krijg minstens 3 jaar garantie, en laad thuis
            voordeliger dan op een publieke laadpaal.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/offerte"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
            >
              Ontvang 3 gratis offertes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/laadpalen"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-input bg-background hover:bg-muted"
            >
              Bekijk laadpaalmodellen
            </Link>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Snel starten</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Vul uw postcode in en wij sturen u door naar het offerteformulier
            voor uw gemeente.
          </p>
          <PostcodeQuickForm />
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Antwoord binnen 24 uur",
              "Tot 3 erkende installateurs",
              "Volledig gratis en vrijblijvend",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* TRUST STRIP */}
      <section className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, label: "30+ erkende installateurs" },
          { icon: CheckCircle2, label: "6% btw automatisch berekend" },
          { icon: Clock, label: "Reactie binnen 24 uur" },
          { icon: Zap, label: "Geen verplichtingen" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-md border border-border bg-card"
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </section>

      {/* THREE STEPS */}
      <section className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Hoe het werkt
        </h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              n: 1,
              title: "Beschrijf uw situatie",
              body: "5 stappen, in 2 minuten. We vragen alleen wat installateurs echt nodig hebben.",
            },
            {
              n: 2,
              title: "Ontvang 3 offertes op maat",
              body: "Tot 3 erkende installateurs in uw postcode-gebied sturen u een offerte binnen 24 uur.",
            },
            {
              n: 3,
              title: "Kies en plan installatie",
              body: "Vergelijk prijs, garantie en planning. U beslist — geen druk, geen verplichtingen.",
            },
          ].map((step) => (
            <Card key={step.n} className="p-6">
              <div className="font-mono text-2xl font-bold text-primary">
                0{step.n}
              </div>
              <h3 className="mt-2 font-semibold text-lg">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CORNERSTONE TOOLS — buying guide + calculator */}
      <section className="mt-14 md:mt-20 grid md:grid-cols-2 gap-4">
        <Link
          to="/beste-laadpaal"
          className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition group"
        >
          <div className="text-xs font-semibold tracking-wider text-primary uppercase">
            Koopgids {new Date().getFullYear()}
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight">
            Beste laadpaal van {new Date().getFullYear()}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            36 modellen vergeleken, 8 winnaars per gebruiksprofiel: overall,
            budget, premium, voor PV, voor bedrijfswagen.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:underline">
            Bekijk de winnaars →
          </div>
        </Link>
        <Link
          to="/laadkost-berekenen"
          className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition group"
        >
          <div className="text-xs font-semibold tracking-wider text-primary uppercase">
            Calculator
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight">
            Bereken uw laadkost
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Wat kost u laden per jaar — thuis, publiek of via zonnepanelen?
            Inclusief vergelijking met een benzineauto.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:underline">
            Open calculator →
          </div>
        </Link>
      </section>

      {/* VAT CALCULATOR */}
      <section className="mt-14 md:mt-20">
        <VATCalculator />
      </section>

      {/* TOP BRANDS */}
      <Section
        title="Toonaangevende laadpaalmerken"
        subtitle="Vergelijk specs en prijzen per merk."
        link={{ href: "/merken", label: "Alle merken" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOP_BRANDS.map((slug) => {
            const brand = brands.find((b) => b.slug === slug);
            if (!brand) return null;
            return (
              <Link
                key={slug}
                to={`/merken/${slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
              >
                <div className="font-semibold">{brand.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {brand.countryFlag} {brand.country}
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* TOP EV MODELS */}
      <Section
        title="Welke laadpaal past bij uw EV?"
        subtitle="Aanbevelingen op basis van laadvermogen en eigenaar-feedback."
        link={{ href: "/auto", label: "Alle modellen" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOP_EV.map((slug) => {
            const ev = evModels.find((e) => e.slug === slug);
            if (!ev) return null;
            return (
              <Link
                key={slug}
                to={`/auto/${slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
              >
                <div className="text-xs text-muted-foreground">{ev.brand}</div>
                <div className="font-semibold">{ev.name}</div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  AC max {ev.acMaxKw} kW
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* TOP GEMEENTEN */}
      <Section
        title="Erkende installateurs in uw gemeente"
        subtitle="Vraag offertes aan in uw postcode-gebied."
        link={{ href: "/gemeente", label: "Alle gemeenten" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOP_GEMEENTEN.map((slug) => {
            const g = gemeenten.find((x) => x.slug === slug);
            if (!g) return null;
            return (
              <Link
                key={slug}
                to={`/gemeente/${slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
              >
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {g.provincie}
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* PREMIE BLOCK */}
      <section className="mt-14 md:mt-20">
        <Card className="p-6 md:p-8 border-warning/30 bg-warning/5">
          <Pill tone="warning" className="mb-3">
            Stand van zaken 2026
          </Pill>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welke premies bestaan vandaag nog?
          </h2>
          <p className="mt-3 max-w-prose">
            De federale belastingvermindering eindigde op 31 augustus 2024. De
            Vlaamse aankooppremie sloot op 22 november 2024. De BIV-vrijstelling
            voor nieuwe EVs verviel op 1 januari 2026. Wat blijft over: het{" "}
            <strong>6% btw-tarief</strong> voor woningen ≥ 10 jaar oud, enkele{" "}
            lokale gemeentepremies, en voor ondernemers de{" "}
            <strong>100% aftrek</strong> tot eind 2026.
          </p>
          <Link
            to="/gids/laadpaal-premie-2026"
            className="mt-5 inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Lees de volledige stand van zaken
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Veelgestelde vragen
        </h2>
        <div className="mt-6 divide-y divide-border border border-border rounded-lg bg-card">
          {FAQ.map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="cursor-pointer font-semibold flex items-start justify-between gap-4">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* RECENT GUIDES */}
      <Section
        title="Recente gidsen"
        subtitle="Eerlijke, actuele uitleg over laadpalen in Vlaanderen."
        link={{ href: "/gids", label: "Alle gidsen" }}
      >
        <div className="grid md:grid-cols-3 gap-4">
          {guides.slice(0, 3).map((g) => (
            <Link
              key={g.slug}
              to={`/gids/${g.slug}`}
              className="p-5 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm transition"
            >
              <Pill tone="muted" className="mb-2 text-[10px]">
                {g.category}
              </Pill>
              <h3 className="font-semibold">{g.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {g.lede}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="mt-14 md:mt-20">
        <OfferteCta
          title="Klaar om offertes te ontvangen?"
          subtitle="Vul het formulier in 2 minuten in. We sturen u door naar 3 erkende installateurs in uw gemeente — gratis, vrijblijvend, met 6% btw automatisch berekend."
          cta="Vraag 3 offertes aan"
        />
      </section>
    </PageShell>
  );
}

function Section({
  title,
  subtitle,
  link,
  children,
}: {
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          ) : null}
        </div>
        {link ? (
          <Link
            to={link.href}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            {link.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PostcodeQuickForm() {
  return (
    <form
      className="mt-4 flex flex-col sm:flex-row gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const postcode = String(fd.get("postcode") ?? "").trim();
        const params = postcode ? `?postcode=${encodeURIComponent(postcode)}` : "";
        window.location.href = `/offerte${params}`;
      }}
    >
      <input
        name="postcode"
        type="text"
        inputMode="numeric"
        pattern="[1-9][0-9]{3}"
        maxLength={4}
        placeholder="Postcode (bv. 9000)"
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Postcode"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
      >
        Start aanvraag
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
