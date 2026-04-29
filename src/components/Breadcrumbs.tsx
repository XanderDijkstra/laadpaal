import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { SITE } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE.url}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav
        aria-label="Kruimelpad"
        className="flex items-center text-sm text-muted-foreground gap-1 flex-wrap"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <span key={idx} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          );
        })}
      </nav>
      <JsonLd data={jsonLd} />
    </>
  );
}
