import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { OfferteCta } from "@/components/OfferteCta";
import { Pill } from "@/components/ui/Pill";
import NotFoundPage from "./NotFoundPage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatEuro } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { comparisons } from "@/data/comparisons";
import { chargers } from "@/data/chargers";

export default function VergelijkenDetailPage() {
  const { slug } = useParams();
  const cmp = comparisons.find((c) => c.slug === slug);
  if (!cmp) return <NotFoundPage />;

  const a = chargers.find((c) => c.slug === cmp.a);
  const b = chargers.find((c) => c.slug === cmp.b);

  usePageMeta({
    title: `${cmp.title} | ${SITE.shortName}`,
    description: cmp.verdict.slice(0, 155),
    canonical: `${SITE.url}/vergelijken/${cmp.slug}`,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Vergelijken" },
        { label: cmp.title },
      ]}
      width="prose"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: cmp.title,
          url: `${SITE.url}/vergelijken/${cmp.slug}`,
        }}
      />
      <header>
        <Pill tone="muted" className="mb-2">
          Vergelijking
        </Pill>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {cmp.title}
        </h1>
        <p className="text-base md:text-lg text-foreground mt-4 border-l-4 border-primary pl-4">
          <strong>Korte conclusie:</strong> {cmp.verdict}
        </p>
      </header>

      {a && b ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Specs naast elkaar</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Specificatie</th>
                  <th className="text-left py-2 pr-4 font-semibold">{a.name}</th>
                  <th className="text-left py-2 font-semibold">{b.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Max vermogen</td>
                  <td className="py-2 pr-4 font-mono">{a.maxKw} kW</td>
                  <td className="py-2 font-mono">{b.maxKw} kW</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Kabel</td>
                  <td className="py-2 pr-4">{a.cable === "vast" ? "Vast" : "Type 2 socket"}</td>
                  <td className="py-2">{b.cable === "vast" ? "Vast" : "Type 2 socket"}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">MID-meter</td>
                  <td className="py-2 pr-4">{a.midMeter ? "Ja" : "Nee"}</td>
                  <td className="py-2">{b.midMeter ? "Ja" : "Nee"}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Garantie</td>
                  <td className="py-2 pr-4">{a.warrantyYears} jaar</td>
                  <td className="py-2">{b.warrantyYears} jaar</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">All-in vanaf</td>
                  <td className="py-2 pr-4 font-mono">{formatEuro(a.priceAllInFrom)}</td>
                  <td className="py-2 font-mono">{formatEuro(b.priceAllInFrom)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Link
              to={`/laadpalen/${a.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
            >
              <div className="text-xs text-muted-foreground">Bekijk volledig</div>
              <div className="font-semibold">{a.name} →</div>
            </Link>
            <Link
              to={`/laadpalen/${b.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
            >
              <div className="text-xs text-muted-foreground">Bekijk volledig</div>
              <div className="font-semibold">{b.name} →</div>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Andere vergelijkingen</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {comparisons
            .filter((c) => c.slug !== cmp.slug)
            .slice(0, 4)
            .map((c) => (
              <Link
                key={c.slug}
                to={`/vergelijken/${c.slug}`}
                className="p-4 rounded-md border border-border bg-card hover:border-primary/50"
              >
                <div className="font-semibold">{c.title}</div>
              </Link>
            ))}
        </div>
      </section>

      <div className="mt-12">
        <OfferteCta
          title="Niet zeker welke past?"
          subtitle="Krijg advies van 3 erkende installateurs op basis van uw situatie."
        />
      </div>
    </PageShell>
  );
}
