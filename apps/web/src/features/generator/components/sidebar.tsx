import {
  Download,
  Droplets,
  FileText,
  Image,
  Palette,
  Play,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Type,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdUnit } from "@/analytics/ads";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/web";
import { DynamicTestId } from "../../../lib/dynamic-testid";
import { HighlightedLabel, SearchProvider } from "../search/search-context";
import { useQRStore } from "../../../state/qr-store";
import { filterStillVisibleSections } from "./filter-still-visible-sections";
import { getVisibleSectionIds } from "./get-visible-section-ids";
import { SectionLoadFallback } from "./sidebar-section-load-fallback";
import { OPEN_SECTIONS_STORAGE_KEY, loadStoredOpenSections } from "./sidebar-open-sections";
import type { SidebarProps } from "./sidebar-types";

const PayloadSection = lazy(() =>
  import("./sections/payload-section").then((m) => ({ default: m.PayloadSection })),
);
const OverlaySection = lazy(() =>
  import("./sections/overlay-section").then((m) => ({ default: m.OverlaySection })),
);
const QREncodingSection = lazy(() =>
  import("./sections/qr-encoding-section").then((m) => ({
    default: m.QREncodingSection,
  })),
);
const RenderSection = lazy(() =>
  import("./sections/render-section").then((m) => ({ default: m.RenderSection })),
);
const AnimationSection = lazy(() =>
  import("./sections/animation-section").then((m) => ({ default: m.AnimationSection })),
);
const OutputSection = lazy(() =>
  import("./sections/output-section").then((m) => ({ default: m.OutputSection })),
);
const WatermarkSection = lazy(() =>
  import("./sections/watermark-section").then((m) => ({ default: m.WatermarkSection })),
);
const MetadataSection = lazy(() =>
  import("./sections/metadata-section").then((m) => ({ default: m.MetadataSection })),
);
const ShareSection = lazy(() =>
  import("./sections/share-section").then((m) => ({ default: m.ShareSection })),
);
const SafetySection = lazy(() =>
  import("./sections/safety-section").then((m) => ({ default: m.SafetySection })),
);

const SECTIONS = [
  { id: "payload", labelKey: "sections.payload", icon: Type, tier: "basic" as const },
  { id: "overlay", labelKey: "sections.overlay", icon: Image, tier: "basic" as const },
  { id: "qr", labelKey: "sections.qrEncoding", icon: QrCode, tier: "advanced" as const },
  { id: "render", labelKey: "sections.rendering", icon: Palette, tier: "advanced" as const },
  { id: "animation", labelKey: "sections.animation", icon: Play, tier: "advanced" as const },
  { id: "output", labelKey: "sections.output", icon: Download, tier: "advanced" as const },
  {
    id: "watermark",
    labelKey: "sections.watermark",
    icon: Droplets,
    tier: "professional" as const,
  },
  { id: "metadata", labelKey: "sections.metadata", icon: FileText, tier: "professional" as const },
  { id: "share", labelKey: "sections.share", icon: Share2, tier: "professional" as const },
  { id: "safety", labelKey: "sections.safety", icon: Shield, tier: "professional" as const },
];

const VALID_SECTION_IDS = new Set(SECTIONS.map((section) => section.id));

export function Sidebar({ isOpen, onClose, mobileHeightPercent = 45 }: Readonly<SidebarProps>) {
  // Use individual selectors to avoid re-renders when unrelated state changes
  const tier = useQRStore((s) => s.tier);
  const searchQuery = useQRStore((s) => s.searchQuery);
  const setSearchQuery = useQRStore((s) => s.setSearchQuery);
  const { t, i18n } = useTranslation();
  const [openSections, setOpenSections] = useState<string[]>(() =>
    loadStoredOpenSections(VALID_SECTION_IDS),
  );

  // Force re-render when language changes by using i18n.language as a key dependency
  const _currentLanguage = i18n.language;
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Preserve open/closed accordion state when switching between editor and analyze views.
  useEffect(() => {
    if (!("sessionStorage" in globalThis)) return;
    try {
      globalThis.sessionStorage.setItem(OPEN_SECTIONS_STORAGE_KEY, JSON.stringify(openSections));
    } catch {
      // Ignore storage quota/private mode issues; state will still work for this mount.
    }
  }, [openSections]);

  // Click outside to close on tablet and desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Don't close if clicking inside the sidebar
      if (sidebarRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on a Radix UI portal element (dropdowns, selects, dialogs, tabs, etc.)
      // These are rendered outside the sidebar but are part of the UI
      const targetElement = target as HTMLElement;
      if (
        targetElement.closest?.("[data-radix-popper-content-wrapper]") ||
        targetElement.closest?.("[data-radix-select-viewport]") ||
        targetElement.closest?.("[data-radix-menu-content]") ||
        targetElement.closest?.("[data-radix-dialog-content]") ||
        targetElement.closest?.("[data-radix-tabs-list]") ||
        targetElement.closest?.('[role="listbox"]') ||
        targetElement.closest?.('[role="menu"]') ||
        targetElement.closest?.('[role="dialog"]') ||
        targetElement.closest?.('[role="tablist"]') ||
        targetElement.closest?.("header") ||
        // Don't close when clicking on the welcome modal
        targetElement.closest?.("dialog")
      ) {
        return;
      }

      // Close on tablet (md-lg) and desktop (lg+) when clicking outside
      if (globalThis.innerWidth >= 768) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Reset all settings
  const handleReset = () => {
    if (confirm("Reset all settings to defaults?")) {
      globalThis.location.reload();
    }
  };

  // Filter sections by tier and search
  const visibleSectionIds = getVisibleSectionIds(SECTIONS, tier, searchQuery, t);
  const visibleSections = SECTIONS.filter((section) => visibleSectionIds.includes(section.id));

  // Auto-expand sections that match the search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchingSections = getVisibleSectionIds(SECTIONS, tier, query, t);

      if (matchingSections.length > 0) {
        setOpenSections(matchingSections);
      }
    }
    // Note: Don't reset when search is cleared - let user keep their open sections
    // Include currentLanguage to re-run search when language changes
  }, [searchQuery, tier, t]);

  // When tier changes, keep currently open sections that are still visible,
  // and add any newly available sections if user upgraded
  useEffect(() => {
    setOpenSections((prev) => filterStillVisibleSections(SECTIONS, prev, tier));
  }, [tier]);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "payload":
        return <PayloadSection />;
      case "qr":
        return <QREncodingSection />;
      case "render":
        return <RenderSection />;
      case "overlay":
        return <OverlaySection />;
      case "animation":
        return <AnimationSection />;
      case "output":
        return <OutputSection />;
      case "watermark":
        return <WatermarkSection />;
      case "metadata":
        return <MetadataSection />;
      case "share":
        return <ShareSection />;
      case "safety":
        return <SafetySection />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop for tablet only (md to lg) - mobile uses split view, no backdrop needed */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-30 hidden md:block lg:hidden appearance-none border-none cursor-default"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
        >
          <span className="sr-only">Close sidebar</span>
        </button>
      )}

      <aside
        aria-label="QR code settings"
        ref={sidebarRef}
        data-testid={DynamicTestId.resolve("sidebar", "sidebar")}
        className={`
          ${/* Mobile: relative in-flow element for split view */ ""}
          ${/* Tablet: fixed overlay */ ""}
          ${/* Desktop: fixed sidebar */ ""}
          mobile-sidebar-height
          md:fixed md:inset-y-0 md:top-0 md:start-0 md:end-auto md:z-50
          w-full md:w-80 lg:w-96 bg-card md:border-e md:shadow-xl
          transform transition-[transform,opacity] duration-300 ease-in-out
          ${
            isOpen
              ? "md:h-auto md:translate-x-0 rtl:md:-translate-x-0 opacity-100 md:border-b-0"
              : "md:h-auto md:-translate-x-full rtl:md:translate-x-full opacity-0 pointer-events-none md:pointer-events-auto"
          }
          flex flex-col overflow-hidden flex-shrink-0
        `}
        style={
          {
            "--mobile-height": isOpen ? `${mobileHeightPercent}%` : "0",
          } as React.CSSProperties
        }
      >
        {/* Sections - scrolls within container */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-1 scrollbar-hide"
          data-testid={DynamicTestId.resolve("sidebar-scroll", "sidebar-scroll")}
        >
          {/* Search bar styled like accordion items */}
          <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 rounded-md shadow-sm mb-[6px]">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("header.searchSettings")}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground"
              title={t("header.searchSettings")}
            />
            {searchQuery && (
              <button
                type="button"
                className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
                title={t("common.reset")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground ml-auto"
              onClick={handleReset}
              title={t("common.reset")}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
            {visibleSections.map((section) => {
              const Icon = section.icon;
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-none mb-[6px]"
                  data-testid={DynamicTestId.resolve(
                    `accordion-${section.id}`,
                    `accordion-${section.id}`,
                  )}
                >
                  <AccordionTrigger
                    className="hover:no-underline py-3 px-3 bg-muted/50 rounded-md shadow-sm [&>svg]:ml-auto"
                    title={`${t(section.labelKey)} settings - Click to expand`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <SearchProvider searchQuery={searchQuery}>
                          <HighlightedLabel>{t(section.labelKey)}</HighlightedLabel>
                        </SearchProvider>
                      </span>
                      {section.tier !== "basic" && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            section.tier === "advanced"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          }`}
                        >
                          {section.tier === "advanced" ? "ADV" : "PRO"}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent
                    className="pb-4 pt-3 px-4 mt-1 bg-card rounded-md shadow-sm border"
                    style={{
                      contentVisibility: "auto",
                      containIntrinsicSize: "auto 520px",
                    }}
                  >
                    <SearchProvider searchQuery={searchQuery}>
                      <Suspense fallback={<SectionLoadFallback />}>
                        {renderSection(section.id)}
                      </Suspense>
                    </SearchProvider>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Desktop Ad below settings - only visible on large screens */}
        <div className="hidden lg:block p-4 border-t flex-shrink-0">
          <AdUnit slot="sidebar-bottom" width={"100%"} height={250} format="rectangle" />
        </div>
      </aside>
    </>
  );
}
