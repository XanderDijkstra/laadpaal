import { type GuideFAQ } from "@/data/types";
import { JsonLd } from "../JsonLd";
import { InlineText } from "./InlineText";

export function GuideFAQList({ faqs }: { faqs: GuideFAQ[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
        Veelgestelde vragen
      </h2>
      <div className="mt-5 divide-y divide-border border border-border rounded-md bg-card">
        {faqs.map((f, i) => (
          <details key={i} className="group p-5">
            <summary className="cursor-pointer font-semibold flex items-start justify-between gap-4">
              <span>{f.q}</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                ⌄
              </span>
            </summary>
            <div className="mt-3 text-muted-foreground leading-relaxed">
              <InlineText text={f.a} />
            </div>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
