import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { CheckCircle2 } from "lucide-react";

export default function VoorInstallateursPage() {
  return (
    <PlaceholderPage
      pageTitle="Krijg gekwalificeerde laadpaal-leads in uw werkgebied"
      metaDescription="Geen Solvari-stijl gedeelde leads. Post-form-scoring, geografische exclusiviteit, transparante pricing voor laadpaal-installateurs in Vlaanderen."
      canonicalPath="/voor-installateurs"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Voor installateurs" }]}
      lede="Wij sturen gekwalificeerde leads — geen ‘deel met 3 concurrenten’ en geen prijsdruk. Drie tier-opties, transparante pricing, geen verplichtingen."
      hideOfferteCta
    >
      <section className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <Pill tone="muted" className="mb-3">Standaard</Pill>
          <div className="font-mono text-2xl font-bold">€60-90 / lead</div>
          <p className="text-sm text-muted-foreground mt-2">
            Gedeeld met max. 2 andere installateurs in postcode-gebied.
          </p>
        </Card>
        <Card className="p-6 border-primary/30 bg-primary/5">
          <Pill tone="success" className="mb-3">Exclusief 48u</Pill>
          <div className="font-mono text-2xl font-bold text-primary">€120-180 / lead</div>
          <p className="text-sm text-muted-foreground mt-2">
            48 uur first-look. Daarna automatisch released naar Tier 2.
          </p>
        </Card>
        <Card className="p-6">
          <Pill tone="info" className="mb-3">Geografisch exclusief</Pill>
          <div className="font-mono text-2xl font-bold">vanaf €1.200/m</div>
          <p className="text-sm text-muted-foreground mt-2">
            Vast bedrag per maand voor alle leads in een gekozen gemeentenlijst.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-tight">Hoe wij verschillen</h2>
        <ul className="mt-3 space-y-2">
          {[
            "Post-form scoring — geen ruwe leads, alleen Tier 1+",
            "Geografische exclusiviteit beschikbaar",
            "Transparante prijsstelling — zonder veiling",
            "Geen verplichting per maand bij Standard tier",
          ].map((p) => (
            <li key={p} className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-tight">Geïnteresseerd?</h2>
        <p className="mt-2 text-muted-foreground">
          Stuur een mail naar{" "}
          <a className="text-primary underline" href="mailto:partners@laadpaal.vlaanderen">
            partners@laadpaal.vlaanderen
          </a>{" "}
          met uw gemeentenlijst en het tier dat u interesseert. We plannen een
          intake-gesprek binnen de week.
        </p>
      </section>
    </PlaceholderPage>
  );
}
