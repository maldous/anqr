import type { PageDefinition } from "@/i18n/static";
import { ContactEmailLink, ContactRedditLink } from "./static-page-shell-parts";
import { StaticPageArticleFooter } from "./static-page-article-footer";
import { StaticPageSection } from "./static-page-section";
import type { TocGroup } from "./static-page-types";
import type { StaticPageType } from "./StaticPage.types";

export function StaticPageArticle({
  def,
  page,
  lang,
  hasToc,
  tocGroups,
  onNavigate,
  registerSectionRef,
  t,
}: Readonly<{
  def: PageDefinition;
  page: StaticPageType;
  lang: string;
  hasToc: boolean;
  tocGroups: TocGroup[];
  onNavigate: (slug: string) => void;
  registerSectionRef: (slug: string, el: HTMLElement | null) => void;
  t: (key: string) => string;
}>) {
  return (
    <article
      className={
        hasToc
          ? "max-w-3xl mx-auto px-4 sm:px-6 py-4 text-justify"
          : "max-w-3xl mx-auto px-6 py-4 text-justify"
      }
    >
      <div className={hasToc ? "space-y-8 sm:space-y-10" : "space-y-10"}>
        {def.sections.map((section, index) => (
          <StaticPageSection
            key={section.heading}
            section={section}
            index={index}
            lang={lang}
            hasToc={hasToc}
            isMainHeading={hasToc && tocGroups.some((group) => group.id === `section-${index}`)}
            onNavigate={onNavigate}
            registerSectionRef={registerSectionRef}
          />
        ))}

        {!hasToc && page === "contact" && (
          <div className="grid gap-6 md:grid-cols-2">
            <ContactEmailLink />
            <ContactRedditLink />
          </div>
        )}
      </div>

      <StaticPageArticleFooter page={page} lastUpdated={def.lastUpdated} t={t} />
    </article>
  );
}
