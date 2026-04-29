import { type GuideBlock } from "@/data/types";
import { InlineText } from "./InlineText";
import { cn } from "@/lib/utils";

const calloutTone = {
  info: "border-secondary/30 bg-secondary/5",
  warning: "border-warning/30 bg-warning/5",
  success: "border-success/30 bg-success/5",
} as const;

export function GuideContent({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="mt-8 space-y-5 max-w-prose">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-base leading-relaxed text-foreground">
          <InlineText text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2
          id={slugify(block.text)}
          className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-12 first:mt-0"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-heading text-lg md:text-xl font-bold tracking-tight mt-8">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
          {block.items.map((it, i) => (
            <li key={i} className="text-base leading-relaxed">
              <InlineText text={it} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-6 space-y-2 marker:text-muted-foreground">
          {block.items.map((it, i) => (
            <li key={i} className="text-base leading-relaxed">
              <InlineText text={it} />
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside
          className={cn(
            "rounded-md border p-5",
            calloutTone[block.tone ?? "info"],
          )}
        >
          {block.title ? (
            <div className="font-semibold mb-1.5">{block.title}</div>
          ) : null}
          <div className="text-sm leading-relaxed">
            <InlineText text={block.text} />
          </div>
        </aside>
      );
    case "table":
      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm border-y border-border">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left py-2 px-3 font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "py-2 px-3 align-top",
                        ci > 0 ? "font-mono" : "",
                      )}
                    >
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export { slugify as slugifyHeading };
