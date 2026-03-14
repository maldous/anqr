import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GallerySection } from '@/content/gallery/gallery-items';
import { HorizontalAd } from './horizontal-ad';
import { DynamicIcon } from './gallery-icon-registry';
import { GalleryCard } from './gallery-card';

export function GallerySectionComponent({
  section,
  isExpanded,
  onToggle,
  showAdAfter,
}: Readonly<{
  section: GallerySection;
  isExpanded: boolean;
  onToggle: () => void;
  showAdAfter?: string;
}>) {
  const { t } = useTranslation();
  const sectionTitle = t(`gallery.sections.${section.id}.title`, { defaultValue: section.title });
  const sectionDescription = t(`gallery.sections.${section.id}.description`, {
    defaultValue: section.description,
  });

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 mb-4 group"
        title={isExpanded ? t('gallery.collapse') : t('gallery.expand')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <DynamicIcon
              name={section.icon}
              className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {sectionTitle}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({section.items.length})
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">{sectionDescription}</p>
          </div>
        </div>
        <div className="p-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-4">
          {section.items.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {showAdAfter && <HorizontalAd slot={showAdAfter} />}
    </div>
  );
}
