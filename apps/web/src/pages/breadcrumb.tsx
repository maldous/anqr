import { useTranslation } from "react-i18next";
import type { BreadcrumbProps } from "./breadcrumb.types";

export function Breadcrumb({ items, lang }: BreadcrumbProps) {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
      aria-label={t("accessibility.breadcrumb", "Breadcrumb")}
    >
      <a href={`/?lang=${lang}`} className="hover:text-primary transition-colors">
        ANQR
      </a>
      {items.map((item, idx) => (
        <span key={item} className="flex items-center gap-2">
          <span className="text-muted-foreground/50">/</span>
          {idx === items.length - 1 ? (
            <span className="text-foreground font-medium">{item}</span>
          ) : (
            <a
              href={`/${item.toLowerCase()}?lang=${lang}`}
              className="hover:text-primary transition-colors"
            >
              {item}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
