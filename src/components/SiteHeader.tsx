import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Beste laadpaal", href: "/beste-laadpaal" },
  { label: "Laadpalen", href: "/laadpalen" },
  { label: "Laadpunten", href: "/laadpunten" },
  { label: "Per auto", href: "/auto" },
  { label: "Laadkost", href: "/laadkost-berekenen" },
  { label: "Gids", href: "/gids" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight text-secondary"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          laadpaal.vlaanderen
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/offerte"
            className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm"
          >
            Vraag 3 offertes
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label={open ? "Sluit menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-border">
          <nav className="container max-w-7xl mx-auto py-3 flex flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md",
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/offerte"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground font-medium"
            >
              Vraag 3 offertes
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
