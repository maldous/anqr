import { Capacitor } from '@capacitor/core';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  Moon,
  PanelLeft,
  Play,
  Share2,
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import { Tabs, TabsList, TabsTrigger } from '@/ui/primitives/tabs';
import { type GalleryCategory } from '@/content/gallery/gallery-manifest';
import { useBannerHeight } from '@/ui/hooks/useBannerHeight';
import { isRtlLanguage, languages, loadLocale } from '@/app/i18n';
import { trackEvent } from '@/infra/telemetry/zaraz';
import { copyToClipboard } from '@/platform/browser/clipboard';
import { buildHeaderShareConfig } from '@/components/header/build-header-share-config';
import { prepareInterstitial } from '@/modules/platform';
import { getShareableUrl } from '@/modules/share-links';
import { type Tier, useQRStore } from '@/store/qr-store';
import { resolveHeaderPage, type HeaderPage } from '@/components/header/header-resolve-page';
import { changeTierWithAdGate } from '@/components/header/header-tier-gate';
import { getInitialDarkMode } from '@/components/header/header-dark-mode';
import { setupScrollObservers } from '@/components/header/header-scroll-observers';
import { HeaderLanguageMenu } from '@/components/header/header-language-menu';
import { HeaderMobileNav } from '@/components/header/header-mobile-nav';
import { HeaderDesktopNav } from '@/components/header/header-desktop-nav';
import { HeaderGalleryFilter } from '@/components/header/header-gallery-filter';
import { HeaderMobileFooter } from '@/components/header/header-mobile-footer';

export function Header({
  onToggleSidebar,
  onExport,
  sidebarOpen = false,
  showGallery = false,
  activePage,
  galleryFilter = 'all',
  onGalleryFilterChange,
  onNavigate,
}: Readonly<{
  onToggleSidebar?: () => void;
  onExport?: () => void;
  sidebarOpen?: boolean;
  showGallery?: boolean;
  activePage?: HeaderPage;
  galleryFilter?: GalleryCategory | 'all';
  onGalleryFilterChange?: (filter: GalleryCategory | 'all') => void;
  onNavigate?: (page: HeaderPage) => void;
}>) {
  const tier = useQRStore((s) => s.tier);
  const qr = useQRStore((s) => s.qr);
  const render = useQRStore((s) => s.render);
  const overlay = useQRStore((s) => s.overlay);
  const animation = useQRStore((s) => s.animation);
  const output = useQRStore((s) => s.output);
  const safety = useQRStore((s) => s.safety);
  const qa = useQRStore((s) => s.qa);
  const auto = useQRStore((s) => s.auto);
  const watermark = useQRStore((s) => s.watermark);
  const metadata = useQRStore((s) => s.metadata);

  const setTier = useQRStore((s) => s.setTier);
  const getPayloadText = useQRStore((s) => s.getPayloadText);
  const activatePremiumAccess = useQRStore((s) => s.activatePremiumAccess);
  const checkPremiumAccess = useQRStore((s) => s.checkPremiumAccess);
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isLangMenuClosing, setIsLangMenuClosing] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const bannerHeight = useBannerHeight();
  const langButtonRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const updateScrollIndicators = useCallback(() => {
    const el = headerScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const scrollHeader = useCallback((direction: 'left' | 'right') => {
    const el = headerScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const el = headerScrollRef.current;
    if (!el) return;
    return setupScrollObservers(el, updateScrollIndicators);
  }, [updateScrollIndicators]);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = async (code: string) => {
    await loadLocale(code);
    i18n.changeLanguage(code);
    trackEvent('language_switch', { language: code });
    closeLangMenu();
  };

  const closeLangMenu = () => {
    if (langMenuOpen) {
      setIsLangMenuClosing(true);
      setLangMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setIsMobileMenuClosing(true);
      setMobileMenuOpen(false);
    }
  };

  const resolvedPage: HeaderPage = resolveHeaderPage(activePage, showGallery);
  const isEditor = resolvedPage === 'editor';
  const isGallery = resolvedPage === 'gallery';

  useEffect(() => {
    const isDark = getInitialDarkMode();
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      prepareInterstitial('generation');
    }
  }, []);

  const handleTierChange = (newTier: Tier) => {
    void changeTierWithAdGate(
      newTier,
      setTier,
      checkPremiumAccess,
      activatePremiumAccess,
      setLoadingAd
    );
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleShare = async () => {
    const shareConfig = buildHeaderShareConfig({
      getPayloadText,
      lang: i18n.language,
      qr,
      render,
      overlay,
      animation,
      output,
      safety,
      qa,
      auto,
      watermark,
      metadata,
    });
    const url = getShareableUrl(shareConfig);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      trackEvent('share', { method: 'copy_link' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header
        className={`border-b bg-card shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${sidebarOpen && isEditor ? 'lg:ms-96' : ''}`}
        style={{ paddingTop: 'max(var(--sat, 0px), env(safe-area-inset-top, 0px))' }}
      >
        <div className="relative flex items-center h-[52px]">
          {/* Left scroll indicator (start side in RTL) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollHeader('left')}
              className={`absolute z-10 flex items-center justify-center w-8 h-full cursor-pointer transition-colors ${
                isRtlLanguage(i18n.language)
                  ? 'right-0 bg-gradient-to-l from-card to-transparent hover:from-muted'
                  : 'left-0 bg-gradient-to-r from-card to-transparent hover:from-muted'
              }`}
              title={t('accessibility.scrollLeft')}
              aria-label={t('accessibility.scrollLeft', 'Scroll left')}
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
          )}

          {/* Right scroll indicator (end side in RTL) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollHeader('right')}
              className={`absolute z-10 flex items-center justify-center w-8 h-full cursor-pointer transition-colors ${
                isRtlLanguage(i18n.language)
                  ? 'left-0 bg-gradient-to-r from-card to-transparent hover:from-muted'
                  : 'right-0 bg-gradient-to-l from-card to-transparent hover:from-muted'
              }`}
              title={t('accessibility.scrollRight')}
              aria-label={t('accessibility.scrollRight', 'Scroll right')}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
          )}

          <div
            ref={headerScrollRef}
            className="px-2 sm:px-4 flex items-center justify-between w-full h-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex items-center gap-1 sm:gap-3 lg:gap-6 shrink-0">
              {/* Settings toggle - only in editor mode, placeholder space on other pages */}
              {isEditor ? (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="flex items-center justify-center w-8 h-8 hover:opacity-80 cursor-pointer"
                  title={t('accessibility.toggleSettings')}
                  aria-label={t('accessibility.toggleSettings', 'Toggle settings panel')}
                  aria-expanded={sidebarOpen}
                >
                  <PanelLeft className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </button>
              ) : (
                /* Placeholder space to keep layout consistent with Generator */
                <div className="hidden lg:block w-8 h-8" />
              )}

              {/* ANQR logo/title - always navigates to generator */}
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  onNavigate?.('editor');
                }}
                className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer"
                title={`${t('app.name')} - ${t('app.tagline')}`}
                aria-label={`${t('app.name', 'ANQR')} - ${t('nav.generator', 'Go to Generator')}`}
              >
                <span className="text-xl font-bold leading-6" aria-hidden="true">
                  ANQR
                </span>
              </button>

              {/* Desktop Nav */}
              <HeaderDesktopNav resolvedPage={resolvedPage} onNavigate={onNavigate} />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
              {/* Gallery Filter - icon buttons right-justified next to dark mode toggle */}
              {isGallery && (
                <HeaderGalleryFilter
                  galleryFilter={galleryFilter}
                  onGalleryFilterChange={onGalleryFilterChange}
                />
              )}

              {/* Tier Toggle */}
              {isEditor && (
                <>
                  <div className="hidden sm:block">
                    <Tabs
                      value={tier}
                      onValueChange={(v) => handleTierChange(v as Tier)}
                      data-testid={DynamicTestId.resolve('tier-tabs', 'tier-tabs')}
                    >
                      <TabsList className="shadow-sm">
                        <TabsTrigger
                          value="basic"
                          className="text-xs px-3"
                          title={t('tiers.basic')}
                          disabled={loadingAd}
                          data-testid={DynamicTestId.resolve('tier-tab-basic', 'tier-tab-basic')}
                        >
                          {t('tiers.basic')}
                        </TabsTrigger>
                        <TabsTrigger
                          value="advanced"
                          className="text-xs px-3"
                          title={t('tiers.advanced')}
                          disabled={loadingAd}
                          data-testid={DynamicTestId.resolve(
                            'tier-tab-advanced',
                            'tier-tab-advanced'
                          )}
                        >
                          {t('tiers.advanced')}
                        </TabsTrigger>
                        <TabsTrigger
                          value="professional"
                          className="text-xs px-3 gap-1"
                          title={
                            Capacitor.isNativePlatform() && !checkPremiumAccess()
                              ? t('tiers.watchAdForPro')
                              : t('tiers.professional')
                          }
                          disabled={loadingAd}
                          data-testid={DynamicTestId.resolve(
                            'tier-tab-professional',
                            'tier-tab-professional'
                          )}
                          aria-label={
                            Capacitor.isNativePlatform() && !checkPremiumAccess()
                              ? t('tiers.watchAdForPro', 'Watch ad for Professional')
                              : t('tiers.professional', 'Professional')
                          }
                        >
                          {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                            <Play className="w-3 h-3" aria-hidden="true" />
                          )}
                          {t('tiers.professional')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="sm:hidden">
                    <Select
                      value={tier}
                      onValueChange={(v) => handleTierChange(v as Tier)}
                      disabled={loadingAd}
                    >
                      <SelectTrigger
                        className="w-[72px] h-9 text-xs"
                        data-testid={DynamicTestId.resolve('tier-select', 'tier-select')}
                        aria-label={t('accessibility.selectTier', 'Select feature tier')}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="basic"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-basic',
                            'tier-option-basic'
                          )}
                        >
                          {t('tiers.basic')}
                        </SelectItem>
                        <SelectItem
                          value="advanced"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-advanced',
                            'tier-option-advanced'
                          )}
                        >
                          {t('tiers.advanced')}
                        </SelectItem>
                        <SelectItem
                          value="professional"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-professional',
                            'tier-option-professional'
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                              <Play className="w-3 h-3" aria-hidden="true" />
                            )}
                            {t('tiers.professional')}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Actions */}
              {isEditor && (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-sm"
                    onClick={handleShare}
                    title={t('accessibility.copyShareLink')}
                    aria-label={
                      copied
                        ? t('share.copied', 'Link copied')
                        : t('accessibility.copyShareLink', 'Copy share link')
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    )}
                    {copied ? t('share.copied') : t('header.share')}
                  </Button>
                  <Button
                    size="sm"
                    className="shadow-sm"
                    onClick={onExport}
                    title={t('accessibility.exportQrCode')}
                    aria-label={t('accessibility.exportQrCode', 'Export QR code')}
                    data-testid={DynamicTestId.resolve('export-button', 'export-button')}
                  >
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t('header.export')}
                  </Button>
                </div>
              )}

              {/* Language Selector */}
              <HeaderLanguageMenu
                langMenuOpen={langMenuOpen}
                isLangMenuClosing={isLangMenuClosing}
                langButtonRef={langButtonRef}
                currentLang={currentLang}
                onToggle={() => (langMenuOpen ? closeLangMenu() : setLangMenuOpen(true))}
                onClose={closeLangMenu}
                onChangeLanguage={changeLanguage}
                onCloseAnimationEnd={() => setIsLangMenuClosing(false)}
              />

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9"
                title={darkMode ? t('header.lightMode') : t('header.darkMode')}
                aria-label={
                  darkMode
                    ? t('header.lightMode', 'Switch to light mode')
                    : t('header.darkMode', 'Switch to dark mode')
                }
                aria-pressed={darkMode}
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>

              {/* Mobile Menu Button - shows when desktop nav is hidden (below lg breakpoint) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => (mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true))}
                title={t('accessibility.openNavMenu')}
                aria-label={t('accessibility.openNavMenu', 'Open navigation menu')}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - shows when desktop nav is hidden (below lg breakpoint) */}
        <HeaderMobileNav
          mobileMenuOpen={mobileMenuOpen}
          isMobileMenuClosing={isMobileMenuClosing}
          resolvedPage={resolvedPage}
          onNavigate={onNavigate}
          onClose={closeMobileMenu}
          onCloseAnimationEnd={() => setIsMobileMenuClosing(false)}
        />
      </header>

      {/* Mobile Footer Bar */}
      {isEditor && (
        <HeaderMobileFooter
          handleShare={handleShare}
          onExport={onExport}
          copied={copied}
          bannerHeight={bannerHeight}
        />
      )}
    </>
  );
}
