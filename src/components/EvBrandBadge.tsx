import { cn } from "@/lib/utils";

// Editorial brand wordmarks for EV manufacturers. These are NOT trademark
// logos — they're plain-text pills in the manufacturer's signature color,
// used to visually distinguish brands across listings. Replace with
// licensed logo files later if needed.
interface BrandStyle {
  bg: string;
  fg: string;
  abbr: string;
}

const STYLES: Record<string, BrandStyle> = {
  tesla:          { bg: "#cc0000", fg: "#fff", abbr: "Tesla" },
  bmw:            { bg: "#1c69d4", fg: "#fff", abbr: "BMW" },
  audi:           { bg: "#0a0a0a", fg: "#fff", abbr: "Audi" },
  "mercedes-benz":{ bg: "#1f1f1f", fg: "#fff", abbr: "Mercedes" },
  porsche:        { bg: "#d5001c", fg: "#fff", abbr: "Porsche" },
  volvo:          { bg: "#1c2c5b", fg: "#fff", abbr: "Volvo" },
  polestar:       { bg: "#0a0a0a", fg: "#fff", abbr: "Polestar" },
  volkswagen:     { bg: "#001e50", fg: "#fff", abbr: "VW" },
  renault:        { bg: "#efdf00", fg: "#000", abbr: "Renault" },
  hyundai:        { bg: "#002c5f", fg: "#fff", abbr: "Hyundai" },
  kia:            { bg: "#bb162b", fg: "#fff", abbr: "Kia" },
  mg:             { bg: "#bf2e1a", fg: "#fff", abbr: "MG" },
  peugeot:        { bg: "#1f1f1f", fg: "#fff", abbr: "Peugeot" },
  cupra:          { bg: "#a89c8b", fg: "#fff", abbr: "CUPRA" },
  "skoda":        { bg: "#4ba82e", fg: "#fff", abbr: "Škoda" },
};

const FALLBACK: BrandStyle = { bg: "#475569", fg: "#fff", abbr: "EV" };

function brandKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function EvBrandBadge({
  brand,
  size = "sm",
  className,
}: {
  brand: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const style = STYLES[brandKey(brand)] ?? { ...FALLBACK, abbr: brand };
  const sizeCls =
    size === "xs"
      ? "h-5 px-1.5 text-[10px]"
      : size === "sm"
        ? "h-6 px-2 text-xs"
        : size === "md"
          ? "h-8 px-3 text-sm"
          : "h-12 px-5 text-base";

  return (
    <span
      aria-label={`${brand} merk`}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold tracking-tight uppercase",
        sizeCls,
        className,
      )}
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {style.abbr}
    </span>
  );
}
