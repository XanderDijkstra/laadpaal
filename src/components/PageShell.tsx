import { type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

export interface PageShellProps {
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  // grid:  centered max-w-7xl container with vertical padding (default)
  // prose: centered max-w-3xl container for long-form articles
  // flush: no container — content is rendered edge-to-edge so each
  //        section can manage its own background + width
  width?: "prose" | "grid" | "flush";
}

export function PageShell({
  breadcrumbs,
  children,
  width = "grid",
}: PageShellProps) {
  if (width === "flush") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main
        className={`flex-1 container ${
          width === "prose" ? "max-w-3xl" : "max-w-7xl"
        } mx-auto py-6 md:py-10`}
      >
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div className={breadcrumbs ? "mt-4" : ""}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
