import { useTranslation } from 'react-i18next';

export function GuideLinks({ language }: Readonly<{ language: string }>) {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 border-t">
      <h3 className="text-lg font-semibold mb-4">
        {t('gallery.learnMore', 'Learn how to create these styles')}
      </h3>
      <div className="flex flex-wrap gap-3">
        <a
          href={`/guide?lang=${language}#section-8`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.guideModuleStyles', 'Module Styles Guide')}
        </a>
        <a
          href={`/guide?lang=${language}#section-11`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.guideColors', 'Colors & Gradients Guide')}
        </a>
        <a
          href={`/learn?lang=${language}`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.learnArticles', 'Browse Learn Articles')}
        </a>
      </div>
    </div>
  );
}
