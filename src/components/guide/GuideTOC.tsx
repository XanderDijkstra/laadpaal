import { type GuideBlock } from "@/data/types";
import { slugifyHeading } from "./GuideContent";

export function GuideTOC({ blocks }: { blocks: GuideBlock[] }) {
  const headings = blocks.filter(
    (b): b is Extract<GuideBlock, { type: "h2" }> => b.type === "h2",
  );
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Inhoudsopgave"
      className="rounded-md border border-border bg-muted/30 p-5 mt-6"
    >
      <div className="font-semibold text-sm mb-2">Inhoud</div>
      <ol className="list-decimal pl-5 space-y-1 text-sm marker:text-muted-foreground">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${slugifyHeading(h.text)}`}
              className="text-foreground hover:text-primary hover:underline"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
