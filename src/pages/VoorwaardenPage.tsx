import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function VoorwaardenPage() {
  return (
    <PlaceholderPage
      pageTitle="Algemene voorwaarden Laadthuis.be"
      metaDescription="Algemene voorwaarden voor het gebruik van laadthuis.be — gebruiksvoorwaarden, aansprakelijkheid, intellectuele eigendom en geschillenbeslechting."
      canonicalPath="/voorwaarden"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Voorwaarden" }]}
      lede="Algemene voorwaarden voor het gebruik van dit platform."
      hideOfferteCta
    >
      <section>
        <h2 className="text-xl font-bold tracking-tight">Aansprakelijkheid</h2>
        <p className="mt-2 text-muted-foreground">
          Wij verkopen geen laadpalen of installatiediensten. We bieden een
          vergelijkings- en matching-platform. De uiteindelijke offerte,
          installatie en garantie vallen onder verantwoordelijkheid van de
          installateur.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Inhoud</h2>
        <p className="mt-2 text-muted-foreground">
          We doen ons best om informatie actueel en correct te houden. Wijzigingen
          in regelgeving (premies, btw-tarieven) worden zo snel mogelijk
          doorgevoerd. Voor bindend advies, contacteer een erkend installateur of
          uw boekhouder.
        </p>
      </section>
    </PlaceholderPage>
  );
}
