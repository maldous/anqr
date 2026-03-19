import {
    applyAnimationBasicParams,
    applyAnimationPatternParams,
    applyDitheringParams,
    applyEccIntensityLimits,
    applyMetadataParams,
    applyOutputAdvancedParams,
    applyOutputBasicParams,
    applyOverlayAdvancedParams,
    applyOverlayPreprocessingParams,
    applyOverlayTransformParams,
    applyQaAndAutoParams,
    applyQrEncodingParams,
    applyRenderBasicStyles,
    applyRenderColorAndPaletteStyles,
    applyRenderEyeAndFrameStyles,
    applySafetyParams,
    applySubpixelAndHalftoneParams,
    applyTierAndPayloadParams,
    applyWatermarkParams,
    parseUrlParams,
    type UrlImportStore,
    useQRGeneratorContext,
} from "@/application/generator";
import { showNativeToast } from "@/platform/native";
import { BusyOverlay, MobileDivider, TooltipProvider } from "@/ui/web";
import { Capacitor } from "@capacitor/core";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GalleryCategory } from "../content/gallery/gallery-manifest";
import { Preview } from "../features/generator/components/preview";
import { Sidebar } from "../features/generator/components/sidebar";
import {
    DEFAULT_MOBILE_SPLIT,
    MAX_MOBILE_SPLIT,
    MIN_MOBILE_SPLIT,
    MOBILE_SPLIT_STORAGE_KEY,
} from "../features/generator/model/mobile-split";
import { isRtlLanguage, loadLocale } from "../i18n";
import type { StaticPageType } from "../pages/static-page";
import { getPageFromLocation, type PageView } from "../routing/page-resolution";
import { trimRoutePath } from "../routing/trim-route-path";
import { updateCanonicalUrl, updateHreflangLinks } from "../seo/head-links";
import { useQRStore } from "../state/qr-store";
import { Analyze } from "./analyze";
import type { CapacitorAppPlugin } from "./capacitor-app-plugin";
import { Gallery } from "./gallery";
import { Header } from "./header/header";
import { LazyLoadFallback } from "./lazy-load-fallback";
import { log } from "./log";
import { StaticPage } from "./static-page";
import { useBannerHeight } from "./use-banner-height";
import { WelcomeModal } from "./welcome-modal";

export function AppContent() {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>("editor");
  const [galleryFilter, setGalleryFilter] = useState<GalleryCategory | "all">("all");
  const [mobileSplitPercent, setMobileSplitPercent] = useState(DEFAULT_MOBILE_SPLIT);
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerHeight = useBannerHeight();
  const { download, isExporting, canvas: generatedCanvas } = useQRGeneratorContext();

  // Handle mobile divider drag
  const handleMobileDividerDrag = useCallback((deltaY: number) => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    if (containerHeight <= 0) return;

    // Convert pixel delta to percentage
    const deltaPercent = (deltaY / containerHeight) * 100;

    setMobileSplitPercent((prev) => {
      const newValue = prev + deltaPercent;
      return Math.max(MIN_MOBILE_SPLIT, Math.min(MAX_MOBILE_SPLIT, newValue));
    });
  }, []);

  // Save split position to localStorage on drag end
  // Use a ref to get the current value to avoid recreating the callback
  const mobileSplitPercentRef = useRef(mobileSplitPercent);
  mobileSplitPercentRef.current = mobileSplitPercent;
  const lastBackPressAtRef = useRef(0);

  const handleMobileDividerDragEnd = useCallback(() => {
    localStorage.setItem(MOBILE_SPLIT_STORAGE_KEY, String(mobileSplitPercentRef.current));
  }, []);

  // Load saved split position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(MOBILE_SPLIT_STORAGE_KEY);
    if (saved) {
      const parsed = Number.parseFloat(saved);
      if (!Number.isNaN(parsed) && parsed >= MIN_MOBILE_SPLIT && parsed <= MAX_MOBILE_SPLIT) {
        setMobileSplitPercent(parsed);
      }
    }
  }, []);

  // NOTE: We use useQRStore.getState() for setters in the URL params effect below
  // instead of subscribing to the store here. This prevents App from re-rendering
  // on every store change. Setters are stable references so getState() is safe.
  // See issue #15 in tbd.txt for details on this optimization.

  const navigateTo = useCallback((page: PageView) => {
    const nextPath = page === "editor" ? "/" : `/${page}`;
    const nextSearch = page === "editor" ? globalThis.location.search : "";

    // Avoid unnecessary history entries.
    const current = trimRoutePath(globalThis.location.pathname);
    if (current === nextPath && globalThis.location.search === nextSearch) {
      setCurrentPage(page);
      return;
    }

    globalThis.history.pushState({}, "", `${nextPath}${nextSearch}`);
    setCurrentPage(page);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle location changes for routing (paths + legacy hash)
  useEffect(() => {
    const handleLocationChange = async () => {
      setCurrentPage(getPageFromLocation());

      // Process lang parameter on every navigation (works on all pages)
      const params = new URLSearchParams(globalThis.location.search);
      const lang = params.get("lang");
      if (lang && lang !== i18n.language) {
        await loadLocale(lang);
        i18n.changeLanguage(lang);
      }
    };

    handleLocationChange();

    globalThis.addEventListener("popstate", handleLocationChange);
    globalThis.addEventListener("hashchange", handleLocationChange);
    return () => {
      globalThis.removeEventListener("popstate", handleLocationChange);
      globalThis.removeEventListener("hashchange", handleLocationChange);
    };
  }, [i18n]);

  // Handle Android back press (hardware button + swipe-back gesture)
  // OnBackPressedDispatcher in MainActivity.java intercepts all back presses
  // and dispatches a custom 'androidBackPress' event to the web view.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAndroidBackPress = async () => {
      // Navigate internally: gallery/analyze/static -> editor
      if (currentPage !== "editor") {
        navigateTo("editor");
        return;
      }

      // In editor, try to go back in browser history
      if (globalThis.history.length > 1) {
        globalThis.history.back();
        return;
      }

      // On editor with no history: double-back-to-exit (reuse same ref as hardware back handler)
      const now = Date.now();
      if (now - lastBackPressAtRef.current < 1500) {
        const appPlugin = (
          globalThis as typeof globalThis & {
            Capacitor?: { Plugins?: { App?: CapacitorAppPlugin } };
          }
        ).Capacitor?.Plugins?.App;
        await appPlugin?.exitApp?.();
        return;
      }
      lastBackPressAtRef.current = now;
      await showNativeToast("Press back again to exit", "short");
    };

    // Listen for the custom event dispatched from native Android
    document.addEventListener("androidBackPress", handleAndroidBackPress);

    return () => {
      document.removeEventListener("androidBackPress", handleAndroidBackPress);
    };
  }, [currentPage, navigateTo]);

  // Convenience booleans for view states
  const showGallery = currentPage === "gallery";
  const showAnalyze = currentPage === "analyze";
  const showStaticPage = [
    "about",
    "privacy",
    "terms",
    "contact",
    "guide",
    "learn",
    "examples",
    "translate",
  ].includes(currentPage);
  const showEditor = currentPage === "editor";

  // Update document title, RTL direction, and hreflang links when language/page changes
  useEffect(() => {
    if (showEditor) {
      document.title = `${t("app.name")} - ${t("app.tagline")}`;
    }

    // Apply RTL direction based on current language
    const isRtl = isRtlLanguage(i18n.language);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language.split("-")[0];

    updateHreflangLinks(showEditor, currentPage);
    updateCanonicalUrl(showEditor, currentPage, i18n.language);

    // Cleanup: remove hreflang links when component unmounts or dependencies change
    return () => {
      for (const el of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
        el.remove();
      }
    };
  }, [showEditor, currentPage, t, i18n.language]);

  // Load overlay image from URL
  // Takes store reference to avoid subscribing component to store changes
  const loadOverlayFromUrl = useCallback(
    async (
      url: string,
      store: Pick<ReturnType<typeof useQRStore.getState>, "setOverlayUrl" | "setOverlayFile" | "setOverlayEnabled">,
    ) => {
      // On native platforms, bundled assets (public/) are available locally.
      // Convert remote anqr.link URLs to local paths to avoid cross-origin issues.
      let fetchUrl = url;
      if (Capacitor.isNativePlatform() && url.startsWith("https://anqr.link/")) {
        const localPath = url.replace("https://anqr.link", "");
        fetchUrl = `${globalThis.location.origin}${localPath}`;
        log.debug("Resolved overlay to local path", { original: url, local: fetchUrl });
      }

      // Validate that it's a proper URL
      try {
        const parsed = new URL(fetchUrl);
        if (!parsed.protocol.startsWith("http")) {
          log.warn("Invalid overlay URL", { url, reason: "must be http/https" });
          return;
        }
      } catch {
        log.warn("Invalid overlay URL format", { url });
        return;
      }

      try {
        log.debug("Loading overlay from URL", { url: fetchUrl });
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

        const blob = await response.blob();
        const filename = url.split("/").pop()?.split("?")[0] || "image";
        const file = new File([blob], filename, { type: blob.type });

        store.setOverlayUrl(url);
        store.setOverlayFile(file);
        store.setOverlayEnabled(true);
        log.debug("Overlay loaded successfully");
      } catch (err) {
        log.error("Failed to load overlay from URL", { error: err, url });
      }
    },
    [],
  );

  useEffect(() => {
    if (getPageFromLocation() !== "editor") return;
    const params = parseUrlParams();
    const store: UrlImportStore = {
      ...useQRStore.getState(),
      patchState: useQRStore.setState as UrlImportStore["patchState"],
    };

    if (params.lang) i18n.changeLanguage(params.lang);

    applyTierAndPayloadParams(params, store);
    applyQrEncodingParams(params, store);
    applyRenderBasicStyles(params, store);
    applyRenderEyeAndFrameStyles(params, store);
    applyRenderColorAndPaletteStyles(params, store);
    applyOverlayTransformParams(params, store);
    applyOverlayAdvancedParams(params, store);
    applyOverlayPreprocessingParams(params, store);
    applyDitheringParams(params, store);
    applySubpixelAndHalftoneParams(params, store);
    applyAnimationBasicParams(params, store);
    applyAnimationPatternParams(params, store);
    applyOutputBasicParams(params, store);
    applyOutputAdvancedParams(params, store);
    applySafetyParams(params, store);
    applyQaAndAutoParams(params, store);
    applyWatermarkParams(params, store);
    applyMetadataParams(params, store);
    applyEccIntensityLimits(params, store);

    if (params.overlayUrl) loadOverlayFromUrl(params.overlayUrl, store);
  }, [loadOverlayFromUrl, i18n]);

  return (
    <TooltipProvider>
      {/* Skip to main content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none"
        aria-label={t("accessibility.skipToMainContent", "Skip to main content")}
      >
        {t("accessibility.skipToMainContent", "Skip to main content")}
      </a>
      <div className="h-screen bg-background flex flex-col overflow-hidden relative">
        {/* Global busy overlay for export operations */}
        <BusyOverlay
          visible={isExporting}
          stage={t("preview.busy.workingOnIt", "Working on it...")}
          cancelLabel={t("common.cancel", "Cancel")}
        />
        {/* Welcome modal for first-time visitors (web only) */}
        <Suspense fallback={null}>
          <WelcomeModal />
        </Suspense>
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={showEditor ? sidebarOpen : false}
          onExport={download}
          showGallery={showGallery}
          activePage={currentPage}
          galleryFilter={galleryFilter}
          onGalleryFilterChange={setGalleryFilter}
          onNavigate={navigateTo}
        />
        <div
          ref={containerRef}
          className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
          style={{ marginTop: "calc(52px + max(var(--sat, 0px), env(safe-area-inset-top, 0px)))" }}
        >
          {/* Mobile layout: Sidebar and Preview in column, both visible */}
          {/* Desktop/Tablet: Sidebar is fixed, Preview takes remaining space */}

          {/* Sidebar - only shown in editor mode */}
          {showEditor && (
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              mobileHeightPercent={mobileSplitPercent}
            />
          )}

          {/* Mobile divider - drag to resize sidebar/preview split */}
          {showEditor && sidebarOpen && (
            <MobileDivider
              onDrag={handleMobileDividerDrag}
              onDragEnd={handleMobileDividerDragEnd}
            />
          )}

          {/* Main content area - conditionally render active page */}
          {/* Content is constrained above footer and AdMob banner */}
          {/* On native: account for footer (~40px) + share/export bar (~48px) + AdMob banner (dynamic) */}
          {/* On web: just footer (~48px) */}
          <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
            style={{
              paddingBottom: (() => {
                const isNative = Capacitor.isNativePlatform();
                const editorPadding = isNative ? bannerHeight + 88 : 48;
                const nonEditorPadding = isNative ? bannerHeight + 40 : 48;
                return showEditor ? `${editorPadding}px` : `${nonEditorPadding}px`;
              })(),
            }}
          >
            <Preview sidebarOpen={sidebarOpen} hidden={!showEditor} />
            <Suspense fallback={<LazyLoadFallback />}>
              {showAnalyze && <Analyze onNavigate={navigateTo} generatedCanvas={generatedCanvas} />}
              {showGallery && <Gallery filter={galleryFilter} />}
              {showStaticPage && <StaticPage page={currentPage as StaticPageType} />}
            </Suspense>
          </div>
        </div>
        {/* Fixed Footer - visible on all platforms */}
        {/* On native: positioned just above AdMob banner. Ad is pinned to safe area, footer sits above it. */}
        <footer
          className={`border-t bg-background py-2 fixed left-0 right-0 z-40 transition-all duration-300 ${sidebarOpen && showEditor ? "lg:ms-96" : ""}`}
          style={{ bottom: Capacitor.isNativePlatform() ? `${bannerHeight}px` : "0" }}
        >
          {/* Inner wrapper with margins to center over QR area (between ad columns) */}
          <div className="px-4 lg:mx-[160px] text-center flex items-center justify-center min-h-[24px]">
            <p className="text-[10px] sm:text-xs text-muted-foreground" dir="auto">
              <a
                href="/guide"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("guide");
                }}
              >
                {t("nav.guide")}
              </a>
              {" · "}
              <a
                href="/about"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("about");
                }}
              >
                {t("nav.about")}
              </a>
              {" · "}
              <a
                href="https://www.iubenda.com/privacy-policy/70266922"
                className="iubenda-noiframe iubenda-embed hover:underline"
                title={t("nav.privacy")}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("nav.privacy")}
              </a>
              {" · "}
              <a
                href="/terms"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("terms");
                }}
              >
                {t("nav.terms")}
              </a>
              {" · "}
              <a
                href="/contact"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("contact");
                }}
              >
                {t("nav.contact")}
              </a>
              {" · "}
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
