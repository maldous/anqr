import type { BreadcrumbProps } from './breadcrumb.props';

export function Breadcrumb({ items, lang }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
      aria-label="Breadcrumb"
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
