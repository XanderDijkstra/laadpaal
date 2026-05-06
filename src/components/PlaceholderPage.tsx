import { type ReactNode } from "react";
import { PageShell } from "./PageShell";
import { type BreadcrumbItem } from "./Breadcrumbs";
import { OfferteCta } from "./OfferteCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SITE } from "@/lib/site";

export interface PlaceholderPageProps {
  pageTitle: string;
  metaDescription: string;
  canonicalPath: string;
  breadcrumbs?: BreadcrumbItem[];
  lede?: string;
  children?: ReactNode;
  hideOfferteCta?: boolean;
}

export function PlaceholderPage({
  pageTitle,
  metaDescription,
  canonicalPath,
  breadcrumbs,
  lede,
  children,
  hideOfferteCta,
}: PlaceholderPageProps) {
  usePageMeta({
    title: pageTitle,
    description: metaDescription,
    canonical: `${SITE.url}${canonicalPath}`,
  });

  return (
    <PageShell breadcrumbs={breadcrumbs}>
      <header className="mt-2">
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">
          {pageTitle}
        </h1>
        {lede ? (
          <p className="text-base md:text-lg text-muted-foreground mt-3 border-l-4 border-primary pl-4 max-w-3xl">
            {lede}
          </p>
        ) : null}
      </header>
      <div className="mt-8 md:mt-12 space-y-8">{children}</div>
      {!hideOfferteCta ? (
        <div className="mt-16">
          <OfferteCta />
        </div>
      ) : null}
    </PageShell>
  );
}
