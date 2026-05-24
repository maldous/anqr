import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildGalleryRenderImageUrl,
  buildGalleryUrl,
  getGalleryImagePath,
} from "../../../content/gallery/gallery-items";
import type { GalleryCardProps } from "./gallery-card.types";

export function GalleryCard({ item }: Readonly<GalleryCardProps>) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fallbackStage, setFallbackStage] = useState(0);
  const primaryImageSrc = useMemo(() => getGalleryImagePath(item), [item]);
  const [imageSrc, setImageSrc] = useState(primaryImageSrc);

  const shareUrl = buildGalleryUrl(item);
  const itemTitle = t(`gallery.items.${item.id}.title`, { defaultValue: item.title });
  const itemDescription = t(`gallery.items.${item.id}.description`, {
    defaultValue: item.description,
  });

  useEffect(() => {
    setImageError(false);
    setFallbackStage(0);
    setImageSrc(primaryImageSrc);
  }, [primaryImageSrc]);

  const handleImageError = () => {
    // Primary path is the prerendered PNG. If that's somehow missing
    // (e.g. a new gallery item was added without re-running the prerender
    // script), fall back to the dynamic server render so the card isn't
    // permanently blank.
    if (fallbackStage === 0) {
      setFallbackStage(1);
      setImageSrc(buildGalleryRenderImageUrl(item, "png"));
      return;
    }
    setImageError(true);
  };

  return (
    <a
      href={shareUrl}
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${itemTitle} - ${itemDescription}. Open in generator.`}
    >
      <div
        className={`
        relative overflow-hidden rounded-lg bg-card
        border border-border shadow-md
        transition-all duration-200 ease-out origin-center
        ${isHovered ? "scale-[1.28] z-50 shadow-2xl border-blue-500 dark:border-blue-400" : "z-0"}
      `}
      >
        <div className="aspect-square w-full bg-muted p-1">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs">{t("accessibility.imageUnavailable")}</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={itemTitle}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>
      </div>

      <div
        className={`mt-1 px-0.5 transition-opacity duration-200 ${isHovered ? "opacity-0" : "opacity-100"}`}
      >
        <h4 className="text-xs font-semibold text-foreground truncate">{itemTitle}</h4>
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
          {itemDescription}
        </p>
      </div>
    </a>
  );
}
