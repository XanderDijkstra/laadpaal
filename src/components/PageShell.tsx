import { type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

export interface PageShellProps {
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  width?: "prose" | "grid";
}

export function PageShell({
  breadcrumbs,
  children,
  width = "grid",
}: PageShellProps) {
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
