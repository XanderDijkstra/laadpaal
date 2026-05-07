import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function OverOnsPage() {
  return (
    <PlaceholderPage
      pageTitle="Over Laadthuis — onafhankelijk en eerlijk"
      metaDescription="Onafhankelijk vergelijkingsplatform voor laadpalen in Vlaanderen. Wij verkopen geen hardware — wij matchen u met erkende installateurs."
      canonicalPath="/over-ons"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Over ons" }]}
      lede="Onafhankelijk vergelijkingsplatform voor laadpalen in Vlaanderen. Wij verkopen geen hardware — wij matchen u met erkende installateurs en factureren geen pay-for-placement in onze redactionele inhoud."
    >
      <section>
        <h2 className="text-xl font-bold tracking-tight">Wat we doen</h2>
        <p className="mt-2 text-muted-foreground">
          We bieden eerlijke, actuele informatie over thuislaadpalen in Vlaanderen
          en verbinden particulieren met maximaal drie erkende installateurs in
          hun postcode-gebied.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Hoe wij verdienen</h2>
        <p className="mt-2 text-muted-foreground">
          Installateur-partners betalen een vaste prijs per gekwalificeerde lead
          (€60-90 standaard, €120-180 exclusief). Dat is volledig losgekoppeld
          van onze redactionele inhoud. Geen merk wordt naar voren geduwd in
          ruil voor budget.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Onze redactionele standaarden</h2>
        <p className="mt-2 text-muted-foreground">
          Vergelijkingen tonen altijd zowel sterke als zwakke punten. Premie-
          informatie wordt actueel gehouden — afgelopen premies worden nooit als
          actief vermeld. GDPR-compliant.
        </p>
      </section>
    </PlaceholderPage>
  );
}
