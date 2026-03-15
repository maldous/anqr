import { AdUnit } from '@/platform/ads/components/AdUnit';
import type { StaticPageType } from './StaticPage.types';

export function StaticPageArticleFooter({
  page,
  lastUpdated,
  t,
}: Readonly<{
  page: StaticPageType;
  lastUpdated?: string;
  t: (key: string) => string;
}>) {
  return (
    <>
      <div className="mt-8 flex justify-center">
        <AdUnit slot={`${page}-bottom`} width={728} height={90} format="horizontal" />
      </div>

      <div className="mt-8 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          {t('accessibility.lastUpdated')}: {lastUpdated}
        </p>
      </div>
    </>
  );
}
