import { Grid3x3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  gallerySectionManifest,
  type GalleryCategory,
} from "../../content/gallery/gallery-manifest";
import { DynamicIcon } from "./dynamic-icon";

export function HeaderGalleryFilter({
  galleryFilter,
  onGalleryFilterChange,
}: Readonly<{
  galleryFilter: GalleryCategory | "all";
  onGalleryFilterChange?: (filter: GalleryCategory | "all") => void;
}>) {
  const { t } = useTranslation();
  return (
    <div className="hidden lg:flex items-center gap-1">
      <button
        type="button"
        onClick={() => onGalleryFilterChange?.("all")}
        className={`p-2 rounded-md transition-colors ${galleryFilter === "all" ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        title={t("accessibility.allCategories")}
        aria-label={t("accessibility.allCategories", "Show all categories")}
        aria-pressed={galleryFilter === "all"}
      >
        <Grid3x3 className="w-4 h-4" aria-hidden="true" />
      </button>
      {gallerySectionManifest.map((section) => (
        <button
          type="button"
          key={section.id}
          onClick={() => onGalleryFilterChange?.(section.id)}
          className={`p-2 rounded-md transition-colors ${galleryFilter === section.id ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          title={section.title}
          aria-label={`Filter by ${section.title}`}
          aria-pressed={galleryFilter === section.id}
        >
          <DynamicIcon name={section.icon} className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
