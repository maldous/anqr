import { AdUnit } from "@/platform/ads/components/AdUnit";
import { Breadcrumb } from "./static-page-shell-parts";
import type { StaticPageType } from "./StaticPage.types";

export function StaticPageContentHeader({
  page,
  breadcrumb,
  lang,
  title,
  description,
}: Readonly<{
  page: StaticPageType;
  breadcrumb?: string[];
  lang: string;
  title: string;
  description: string;
}>) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {breadcrumb && (
          <div className="flex justify-center mb-2">
            <Breadcrumb items={breadcrumb} lang={lang} />
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-center">
          <AdUnit slot={`${page}-top`} width={728} height={90} format="horizontal" />
        </div>
      </div>
    </>
  );
}
