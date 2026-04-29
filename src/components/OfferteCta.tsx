import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OfferteCtaPrefill {
  postcode?: string;
  model?: string;
  auto?: string;
  gemeente?: string;
}

export interface OfferteCtaProps {
  variant?: "inline" | "card" | "sticky";
  className?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  prefill?: OfferteCtaPrefill;
}

function buildHref(prefill?: OfferteCtaPrefill) {
  if (!prefill) return "/offerte";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(prefill)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/offerte?${qs}` : "/offerte";
}

export function OfferteCta({
  variant = "card",
  className,
  title = "Klaar voor offertes?",
  subtitle = "3 erkende installateurs sturen u een offerte op maat binnen 24 uur. Volledig gratis en vrijblijvend.",
  cta = "Vraag 3 offertes aan",
  prefill,
}: OfferteCtaProps) {
  const href = buildHref(prefill);

  if (variant === "inline") {
    return (
      <Link
        to={href}
        className={cn(
          "inline-flex items-center gap-2 h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm",
          className,
        )}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  if (variant === "sticky") {
    return (
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur p-3 lg:hidden",
          className,
        )}
      >
        <Link
          to={href}
          className="flex h-11 items-center justify-center rounded-md bg-primary text-primary-foreground font-medium gap-2"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-lg border border-primary/20 bg-primary/5 p-6 md:p-8",
        className,
      )}
    >
      <h3 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-prose">{subtitle}</p>
      <Link
        to={href}
        className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Geen verplichtingen · Reactie binnen 24 uur · 6% btw automatisch
        berekend
      </p>
    </aside>
  );
}
