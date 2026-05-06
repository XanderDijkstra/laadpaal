import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      pageTitle="Privacybeleid Laadthuis.be"
      metaDescription="Hoe laadthuis.be omgaat met uw persoonsgegevens — kort, duidelijk en GDPR-conform. Geen verkoop aan derden, geen tracking-cookies."
      canonicalPath="/privacy"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      lede="Kort en duidelijk: welke gegevens we verzamelen, waarvoor we ze gebruiken, en wat uw rechten zijn."
      hideOfferteCta
    >
      <section>
        <h2 className="text-xl font-bold tracking-tight">Wat we verzamelen</h2>
        <p className="mt-2 text-muted-foreground">
          Naam, e-mail, telefoon, postcode, en de informatie die u zelf invult
          op het offerteformulier (situatie, voertuig, voorkeuren).
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Waarvoor we het gebruiken</h2>
        <p className="mt-2 text-muted-foreground">
          Uitsluitend om u te matchen met maximaal 3 erkende installateurs in
          uw postcode-gebied. We delen uw gegevens niet met andere partijen,
          en we gebruiken ze niet voor ongewenste opvolging.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Bewaartijd</h2>
        <p className="mt-2 text-muted-foreground">
          Maximaal 12 maanden, daarna automatisch verwijderd.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Uw rechten</h2>
        <p className="mt-2 text-muted-foreground">
          U kunt op elk moment inzage, correctie of verwijdering vragen via{" "}
          <a className="text-primary underline" href="mailto:privacy@laadthuis.be">
            privacy@laadthuis.be
          </a>
          .
        </p>
      </section>
    </PlaceholderPage>
  );
}
