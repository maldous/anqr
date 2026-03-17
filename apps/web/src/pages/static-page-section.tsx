import type { PageSection } from "../i18n/static";
import { Button } from "../../../../packages/ui/web/src/primitives/button";
import { getImageUrl } from "./static-page-image-url";
import { renderTextWithLinks } from "./static-page-text";

export function StaticPageSection({
  section,
  index,
  lang,
  hasToc,
  isMainHeading = false,
  onNavigate,
  registerSectionRef,
}: Readonly<{
  section: PageSection;
  index: number;
  lang: string;
  hasToc: boolean;
  isMainHeading?: boolean;
  onNavigate?: (slug: string) => void;
  registerSectionRef?: (slug: string, el: HTMLElement | null) => void;
}>) {
  const slug = `section-${index}`;
  const paragraphClassName = hasToc
    ? "text-sm sm:text-base text-muted-foreground leading-relaxed"
    : "text-base text-muted-foreground leading-relaxed";
  const listClassName = hasToc
    ? "list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground"
    : "list-disc pl-5 space-y-2 text-base text-muted-foreground";

  return (
    <section
      key={section.heading}
      id={hasToc ? slug : undefined}
      data-slug={hasToc ? slug : undefined}
      ref={hasToc ? (el) => registerSectionRef?.(slug, el) : undefined}
      className={(() => {
        if (!hasToc) return "space-y-4";
        const mainHeadingClass = isMainHeading
          ? "mt-8 pt-6 border-t border-border first:mt-0 first:pt-0 first:border-t-0"
          : "";
        return `space-y-3 sm:space-y-4 scroll-mt-20 ${mainHeadingClass}`;
      })()}
    >
      {!hasToc && <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>}
      {hasToc && isMainHeading && (
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          <a
            href={`#${slug}`}
            className="hover:text-primary transition-colors"
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.(slug);
            }}
          >
            {section.heading}
          </a>
        </h2>
      )}
      {hasToc && !isMainHeading && (
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
          <a
            href={`#${slug}`}
            className="hover:text-primary transition-colors"
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.(slug);
            }}
          >
            {section.heading}
          </a>
        </h3>
      )}

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph.slice(0, 50)} className={paragraphClassName}>
          {renderTextWithLinks(paragraph, lang)}
        </p>
      ))}

      {section.bullets && section.bullets.length > 0 && (
        <ul className={listClassName}>
          {section.bullets.map((bullet) => (
            <li key={bullet} className={hasToc ? "leading-relaxed" : undefined}>
              {renderTextWithLinks(bullet, lang)}
            </li>
          ))}
        </ul>
      )}

      {section.images && section.images.length > 0 && (
        <div className="space-y-4 my-4">
          {section.images.map((image) => (
            <figure key={image.src} className="w-full">
              <img
                src={getImageUrl(image.src)}
                alt={image.alt}
                className="w-full rounded-lg shadow-md border"
                loading="lazy"
              />
              {image.caption && (
                <figcaption className="text-sm sm:text-base text-muted-foreground mt-2 text-justify italic">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {section.links && section.links.some((link) => link.href.startsWith("http")) && (
        <div className="flex flex-wrap gap-3 mt-4">
          {section.links
            .filter((link) => link.href.startsWith("http"))
            .map((link) => (
              <Button key={link.href} asChild variant="outline" size="default">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </Button>
            ))}
        </div>
      )}
    </section>
  );
}
