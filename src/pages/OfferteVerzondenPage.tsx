import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";
import { guides } from "@/data/guides";

export default function OfferteVerzondenPage() {
  const location = useLocation();
  const gemeente =
    (location.state as { gemeente?: string | null } | null)?.gemeente ?? null;

  usePageMeta({
    title: `Aanvraag verzonden | ${SITE.shortName}`,
    description: "Uw offerte-aanvraag is ontvangen. U hoort binnen 24 uur van erkende installateurs.",
    canonical: `${SITE.url}/offerte/verzonden`,
    noindex: true,
  });

  return (
    <PageShell width="prose">
      <Card className="p-8 mt-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Aanvraag ontvangen
            </h1>
            <p className="text-muted-foreground">
              U hoort binnen 24 uur van 3 erkende installateurs
              {gemeente ? ` in ${gemeente}` : ""}.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <p>
            <strong>Wat nu?</strong> We sturen uw aanvraag door naar de meest
            geschikte installateurs in uw postcode-gebied. Zij nemen rechtstreeks
            contact met u op voor een offerte op maat.
          </p>
          <p>
            Geen ongewenste opvolging vanuit ons. Geen gedeelde gegevens met
            andere bedrijven dan de gematchte installateurs.
          </p>
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Lees verder terwijl u wacht
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {guides.slice(0, 4).map((g) => (
            <Link
              key={g.slug}
              to={`/gids/${g.slug}`}
              className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition"
            >
              <div className="font-semibold">{g.title}</div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {g.lede}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-primary text-sm">
                Lees gids <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
