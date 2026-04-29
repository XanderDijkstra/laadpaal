import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function ContactPage() {
  return (
    <PlaceholderPage
      pageTitle="Contact"
      metaDescription="Heeft u een vraag of feedback? We zijn bereikbaar via e-mail."
      canonicalPath="/contact"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      lede="Heeft u een vraag, feedback of een correctie op een artikel? We horen het graag."
      hideOfferteCta
    >
      <section>
        <h2 className="text-xl font-bold tracking-tight">E-mail</h2>
        <p className="mt-2">
          <a className="text-primary underline" href="mailto:hello@laadpaal.vlaanderen">
            hello@laadpaal.vlaanderen
          </a>
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Voor installateurs</h2>
        <p className="mt-2">
          <a className="text-primary underline" href="mailto:partners@laadpaal.vlaanderen">
            partners@laadpaal.vlaanderen
          </a>
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold tracking-tight">Voor offerte-aanvragen</h2>
        <p className="mt-2 text-muted-foreground">
          Voor een nieuwe offerte-aanvraag, gebruik het{" "}
          <a className="text-primary underline" href="/offerte">
            offerteformulier
          </a>{" "}
          — dan komt uw aanvraag direct bij de juiste installateurs.
        </p>
      </section>
    </PlaceholderPage>
  );
}
