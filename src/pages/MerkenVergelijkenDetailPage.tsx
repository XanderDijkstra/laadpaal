import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { brands } from "@/data/brands";
import { comparisons } from "@/data/comparisons";
import {
  parsePairSlug,
  pairSlug,
  statsForBrand,
  brandVerdict,
  whenToPick,
  allBrandPairs,
} from "@/lib/brandPairs";
import { authorJsonLd, publisherJsonLd } from "@/lib/authors";
import { LAST_UPDATED, formatNlDate } from "@/lib/lastUpdated";

export default function MerkenVergelijkenDetailPage() {
  const { slug } = useParams();
  const parsed = slug ? parsePairSlug(slug) : null;
  if (!parsed) return <NotFoundPage />;

  const [aSlug, bSlug] = parsed;
  const a = brands.find((br) => br.slug === aSlug);
  const b = brands.find((br) => br.slug === bSlug);
  if (!a || !b) return <NotFoundPage />;

  const sa = statsForBrand(a);
  const sb = statsForBrand(b);
  const verdict = brandVerdict(sa, sb);
  const reasonsA = whenToPick(sa, sb);
  const reasonsB = whenToPick(sb, sa);

  // Cross-links: model-vs-model comparisons that pair the two brands
  const directComparisons = comparisons.filter((c) => {
    const cA = sa.models.some((m) => m.slug === c.a) || sa.models.some((m) => m.slug === c.b);
    const cB = sb.models.some((m) => m.slug === c.a) || sb.models.some((m) => m.slug === c.b);
    return cA && cB;
  });

  const otherPairs = allBrandPairs()
    .filter((p) => p !== pairSlug(aSlug, bSlug))
    .filter((p) => p.includes(aSlug) || p.includes(bSlug))
    .slice(0, 6);

  usePageMeta({
    title: `${a.name} vs ${b.name}: welk laadpaal-merk past bij u?`,
    description: `${a.name} versus ${b.name} laadpalen vergeleken: prijs, vermogen, MID-meter, garantie. ${verdict}`.slice(0, 160),
    canonical: `${SITE.url}/merken-vergelijken/${pairSlug(aSlug, bSlug)}`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Merken", href: "/merken" },
        { label: `${a.name} vs ${b.name}` },
      ]}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${a.name} vs ${b.name}: welk laadpaal-merk past bij u?`,
            description: verdict,
            datePublished: LAST_UPDATED,
            dateModified: LAST_UPDATED,
            url: `${SITE.url}/merken-vergelijken/${pairSlug(aSlug, bSlug)}`,
            mainEntityOfPage: `${SITE.url}/merken-vergelijken/${pairSlug(aSlug, bSlug)}`,
            inLanguage: "nl-BE",
            author: authorJsonLd(),
            publisher: publisherJsonLd(),
            mentions: [
              { "@type": "Brand", name: a.name },
              { "@type": "Brand", name: b.name },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${a.name} en ${b.name} laadpaal modellen`,
            itemListElement: [...sa.models, ...sb.models].map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE.url}/laadpalen/${m.slug}`,
              name: m.name,
            })),
          },
        ]}
      />

      <header>
        <Pill tone="muted" className="mb-2">
          Merk vergelijking
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {a.name} <span className="text-muted-foreground">vs</span> {b.name}
        </h1>
        <p className="text-base md:text-lg text-foreground mt-4 border-l-4 border-primary pl-4 max-w-3xl">
          <strong>Korte conclusie:</strong> {verdict}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Bijgewerkt {formatNlDate(LAST_UPDATED)} door Redactie Laadthuis
        </div>
      </header>

      <section className="mt-10 grid md:grid-cols-2 gap-4">
        <BrandCard brand={a} stats={sa} />
        <BrandCard brand={b} stats={sb} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Specs naast elkaar
        </h2>
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                  Specificatie
                </th>
                <th className="text-left py-2 px-3 font-semibold">{a.name}</th>
                <th className="text-left py-2 px-3 font-semibold">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row
                label="Aantal modellen"
                a={String(sa.models.length)}
                b={String(sb.models.length)}
              />
              <Row
                label="Prijsrange (all-in)"
                a={`${formatEuro(sa.minPrice)} – ${formatEuro(sa.maxPrice)}`}
                b={`${formatEuro(sb.minPrice)} – ${formatEuro(sb.maxPrice)}`}
              />
              <Row
                label="Gem. prijs"
                a={formatEuro(sa.avgPrice)}
                b={formatEuro(sb.avgPrice)}
                highlight={Math.abs(sa.avgPrice - sb.avgPrice) >= 200}
              />
              <Row label="Max vermogen" a={`${sa.maxKw} kW`} b={`${sb.maxKw} kW`} />
              <Row
                label="MID-meter standaard"
                a={pct(sa.midShare)}
                b={pct(sb.midShare)}
              />
              <Row
                label="App-bediening"
                a={pct(sa.appShare)}
                b={pct(sb.appShare)}
              />
              <Row
                label="Max garantie"
                a={`${sa.warrantyMax} jaar`}
                b={`${sb.warrantyMax} jaar`}
              />
              <Row
                label="Land van herkomst"
                a={`${a.countryFlag} ${a.country}`}
                b={`${b.countryFlag} ${b.country}`}
              />
              {a.founded && b.founded ? (
                <Row
                  label="Opgericht"
                  a={String(a.founded)}
                  b={String(b.founded)}
                />
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <ReasonsCard
          title={`Wanneer kiezen voor ${a.name}?`}
          flag={a.countryFlag}
          reasons={reasonsA}
          ctaSlug={a.slug}
          ctaLabel={`Bekijk ${a.name} modellen`}
        />
        <ReasonsCard
          title={`Wanneer kiezen voor ${b.name}?`}
          flag={b.countryFlag}
          reasons={reasonsB}
          ctaSlug={b.slug}
          ctaLabel={`Bekijk ${b.name} modellen`}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Modellen-lineup
        </h2>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <ModelList brand={a} stats={sa} />
          <ModelList brand={b} stats={sb} />
        </div>
      </section>

      {directComparisons.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Direct model-vs-model vergelijkingen
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {directComparisons.map((c) => (
              <Link
                key={c.slug}
                to={`/vergelijken/${c.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
              >
                <div className="font-semibold line-clamp-1">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {c.verdict}
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-primary text-xs font-medium">
                  Lees vergelijking <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {otherPairs.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Andere merk-vergelijkingen
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {otherPairs.map((p) => {
              const [x, y] = parsePairSlug(p) ?? ["", ""];
              const bx = brands.find((br) => br.slug === x);
              const by = brands.find((br) => br.slug === y);
              if (!bx || !by) return null;
              return (
                <Link
                  key={p}
                  to={`/merken-vergelijken/${p}`}
                  className="p-3 rounded-md border border-border bg-card hover:border-primary/50 transition text-sm flex items-center justify-between"
                >
                  <span>
                    {bx.name} <span className="text-muted-foreground">vs</span>{" "}
                    {by.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <OfferteCta
          title="Twijfelt u nog tussen merken?"
          subtitle="3 erkende installateurs adviseren u op basis van uw situatie — gratis offertes binnen 24 uur."
        />
      </div>
    </PageShell>
  );
}

function pct(share: number): string {
  return `${Math.round(share * 100)} %`;
}

function Row({
  label,
  a,
  b,
  highlight,
}: {
  label: string;
  a: string;
  b: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-primary/5" : ""}>
      <td className="py-2 px-3 text-muted-foreground">{label}</td>
      <td className="py-2 px-3 font-mono">{a}</td>
      <td className="py-2 px-3 font-mono">{b}</td>
    </tr>
  );
}

function BrandCard({
  brand,
  stats,
}: {
  brand: (typeof brands)[number];
  stats: ReturnType<typeof statsForBrand>;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <span>{brand.countryFlag}</span>
        <span>{brand.country}</span>
        {brand.founded ? <span>· sinds {brand.founded}</span> : null}
      </div>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{brand.name}</h2>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
        {brand.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <Pill tone="info">
          {stats.models.length} {stats.models.length === 1 ? "model" : "modellen"}
        </Pill>
        <Pill tone="muted">vanaf {formatEuro(stats.minPrice)}</Pill>
        <Pill tone={stats.midShare === 1 ? "success" : "muted"}>
          {pct(stats.midShare)} MID
        </Pill>
      </div>
      <Link
        to={`/merken/${brand.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
      >
        Volledig {brand.name} overzicht <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}

function ReasonsCard({
  title,
  flag,
  reasons,
  ctaSlug,
  ctaLabel,
}: {
  title: string;
  flag: string;
  reasons: string[];
  ctaSlug: string;
  ctaLabel: string;
}) {
  return (
    <Card className="p-5">
      <h3 className="font-bold flex items-center gap-2">
        <span aria-hidden>{flag}</span>
        {title}
      </h3>
      {reasons.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Beide merken zijn vergelijkbaar op deze dimensie — kies op basis van
          model-specifieke voorkeuren.
        </p>
      )}
      <Link
        to={`/merken/${ctaSlug}`}
        className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
      >
        {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}

function ModelList({
  brand,
  stats,
}: {
  brand: (typeof brands)[number];
  stats: ReturnType<typeof statsForBrand>;
}) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">
        {brand.countryFlag} {brand.name}
      </div>
      <ul className="divide-y divide-border border border-border rounded-md bg-card">
        {stats.models.map((m) => (
          <li key={m.slug}>
            <Link
              to={`/laadpalen/${m.slug}`}
              className="block p-3 hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{m.name}</div>
                <div className="font-mono text-sm">
                  {formatEuro(m.priceAllInFrom)}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Pill tone="info" className="text-[10px]">
                  {m.maxKw} kW
                </Pill>
                <Pill tone="muted" className="text-[10px]">
                  {m.phases}-fase
                </Pill>
                {m.midMeter ? (
                  <Pill tone="success" className="text-[10px]">
                    MID
                  </Pill>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
