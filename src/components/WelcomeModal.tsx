import { DynamicTestId } from '@/components/ui/dynamic-testid';
/**
 * WelcomeModal Component
 *
 * A splash screen / welcome dialog shown to new visitors or when content has been updated.
 * Only shown on web (not native apps). Tracks last seen version in localStorage.
 */

import { Capacitor } from '@capacitor/core';
import {
  Check,
  Globe,
  Image,
  Palette,
  QrCode,
  ScanSearch,
  Share2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { languages } from '@/i18n';
import { trackEvent } from '@/lib/zaraz';

// Increment this version whenever you want to show the modal again to all users
const WELCOME_VERSION = '2026.03.10';
const STORAGE_KEY = 'anqr-welcome-seen';
const ONBOARDING_STARTED_AT_KEY = 'anqr:onboarding-started-at-ms';
const ONBOARDING_COMPLETED_AT_KEY = 'anqr:onboarding-completed-at-ms';
const ONBOARDING_FIRST_SUCCESS_AT_KEY = 'anqr:onboarding-first-success-at-ms';
const ONBOARDING_STEPS = ['intro', 'language', 'permissions', 'first_success'] as const;
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

interface WelcomeModalProps {
  readonly onClose?: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  // Check if we should show the modal
  useEffect(() => {
    // Skip on native platforms - they have their own onboarding
    if (Capacitor.isNativePlatform()) return;

    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== WELCOME_VERSION) {
      // Small delay for smoother page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const now = Date.now();
    localStorage.setItem(ONBOARDING_STARTED_AT_KEY, String(now));
    localStorage.removeItem(ONBOARDING_COMPLETED_AT_KEY);
    localStorage.removeItem(ONBOARDING_FIRST_SUCCESS_AT_KEY);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    trackEvent('onboarding_step', { step: currentStep, action: 'view' });
  }, [isVisible, currentStep]);

  const handleDismiss = useCallback(
    (reason: string) => {
      const now = Date.now();
      const startedAtRaw = localStorage.getItem(ONBOARDING_STARTED_AT_KEY);
      const startedAt = startedAtRaw ? Number.parseInt(startedAtRaw, 10) : NaN;
      const durationMs = Number.isFinite(startedAt) && startedAt > 0 ? now - startedAt : null;

      if (!localStorage.getItem(ONBOARDING_COMPLETED_AT_KEY)) {
        localStorage.setItem(ONBOARDING_COMPLETED_AT_KEY, String(now));
        trackEvent('onboarding_completed', {
          reason,
          completed_step: currentStep,
          duration_ms: durationMs ?? -1,
        });
      }

      setIsClosing(true);
      localStorage.setItem(STORAGE_KEY, WELCOME_VERSION);
      // Wait for animation to complete
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        onClose?.();
      }, 200);
    },
    [currentStep, onClose]
  );

  const handleNextStep = useCallback(() => {
    if (isFinalStep) {
      handleDismiss('get_started');
      return;
    }

    trackEvent('onboarding_step', { step: currentStep, action: 'continue' });
    setCurrentStepIndex((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
  }, [currentStep, handleDismiss, isFinalStep]);

  const stepContent = useMemo<
    Record<OnboardingStep, { title: string; description: string; detail: string }>
  >(
    () => ({
      intro: {
        title: t('welcome.onboardingIntroTitle', 'Start fast'),
        description: t(
          'welcome.onboardingIntroDesc',
          'Create your first QR in under a minute with this guided setup.'
        ),
        detail: t(
          'welcome.onboardingIntroDetail',
          'You can skip any step and edit everything later from the sidebar.'
        ),
      },
      language: {
        title: t('welcome.onboardingLanguageTitle', 'Choose your language'),
        description: t(
          'welcome.onboardingLanguageDesc',
          'Set the interface language now so labels and help match your workflow.'
        ),
        detail: t(
          'welcome.onboardingLanguageDetail',
          'Language can be changed anytime from the header language menu.'
        ),
      },
      permissions: {
        title: t('welcome.onboardingPermissionsTitle', 'Permissions are point-of-need'),
        description: t(
          'welcome.onboardingPermissionsDesc',
          'Camera permission is requested only when you tap Analyze or use camera overlay.'
        ),
        detail: t(
          'welcome.onboardingPermissionsDetail',
          'No upfront permission prompt appears during onboarding.'
        ),
      },
      first_success: {
        title: t('welcome.onboardingSuccessTitle', 'Reach first success'),
        description: t(
          'welcome.onboardingSuccessDesc',
          'Enter content, confirm the preview scans, then export or share your first QR.'
        ),
        detail: t(
          'welcome.onboardingSuccessDetail',
          'We track time-to-first-success to improve onboarding drop-off points.'
        ),
      },
    }),
    [t]
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isClosing) {
        handleDismiss('escape');
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isClosing, handleDismiss]);

  if (!isVisible) return null;

  // Select a subset of language flags to display
  const featuredLanguages = languages.slice(0, 12);
  const remainingCount = languages.length - featuredLanguages.length;

  const features = [
    { icon: QrCode, title: t('welcome.feature1Title'), desc: t('welcome.feature1Desc') },
    { icon: ScanSearch, title: t('welcome.feature2Title'), desc: t('welcome.feature2Desc') },
    { icon: Image, title: t('welcome.feature3Title'), desc: t('welcome.feature3Desc') },
    { icon: Palette, title: t('welcome.feature4Title'), desc: t('welcome.feature4Desc') },
    { icon: Zap, title: t('welcome.feature5Title'), desc: t('welcome.feature5Desc') },
    { icon: Share2, title: t('welcome.feature6Title'), desc: t('welcome.feature6Desc') },
  ];

  const activeStepContent = stepContent[currentStep];

  // Grouped updates by date - newest first
  const updateGroups = [
    {
      date: t('welcome.updateDate4'),
      items: [
        t('welcome.update17'),
        t('welcome.update19'),
        t('welcome.update14'),
        t('welcome.update15'),
        t('welcome.update16'),
        t('welcome.update20'),
      ],
    },
    {
      date: t('welcome.updateDate2'),
      items: [
        t('welcome.update5'),
        t('welcome.update6'),
        t('welcome.update7'),
        t('welcome.update8'),
        t('welcome.update9'),
        t('welcome.update10'),
        t('welcome.update11'),
      ],
    },
    {
      date: t('welcome.updateDate1'),
      items: [
        t('welcome.update1'),
        t('welcome.update2'),
        t('welcome.update3'),
        t('welcome.update4'),
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      aria-hidden="true"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent border-none"
        onClick={() => handleDismiss('backdrop')}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <dialog
        open
        className={`relative bg-card border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ margin: 0 }}
        aria-labelledby="welcome-title"
      >
        <div className="contents">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/5 to-primary/10">
            <button
              type="button"
              onClick={() => handleDismiss('close_button')}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h1 id="welcome-title" className="text-2xl font-bold text-foreground">
                  {t('welcome.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('welcome.subtitle')}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{t('welcome.intro')}</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Guided onboarding flow */}
            <section className="rounded-lg border bg-muted/20 p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                {t('welcome.guidedOnboardingTitle', 'Guided onboarding')}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  return (
                    <span
                      key={step}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isDone
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-background text-muted-foreground'
                      }`}
                    >
                      {idx + 1}. {t(`welcome.step_${step}`, step.replace('_', ' '))}
                    </span>
                  );
                })}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{activeStepContent.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{activeStepContent.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{activeStepContent.detail}</p>
            </section>

            {/* Features Grid */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('welcome.featuresTitle')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div
                    key={`feature-${feature.title}`}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <feature.icon className="h-5 w-5 text-primary mb-2" />
                    <h3 className="text-xs font-medium text-foreground mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-snug">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What's New */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                {t('welcome.whatsNewTitle')}
              </h2>
              <div className="space-y-4">
                {updateGroups.map((group) => (
                  <div key={`group-${group.date}`}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{group.date}</p>
                    <ul className="space-y-2">
                      {group.items.map((update) => (
                        <li
                          key={`update-${update}`}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{update}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                {t('welcome.languagesTitle')}
              </h2>
              <div className="flex flex-wrap gap-2 items-center">
                {featuredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      trackEvent('onboarding_step', {
                        step: 'language',
                        action: 'select_language',
                        language: lang.code,
                      });
                    }}
                    className={`px-2 py-1 rounded-md text-sm transition-colors ${
                      i18n.language === lang.code ||
                      i18n.language.startsWith(lang.code.split('-')[0])
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    title={lang.nativeName}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    <span className="text-xs">{lang.nativeName.split(' ')[0]}</span>
                  </button>
                ))}
                {remainingCount > 0 && (
                  <span className="text-xs text-muted-foreground px-2">
                    +{remainingCount} {t('welcome.moreLanguages')}
                  </span>
                )}
              </div>
            </section>

            {/* Quick Start */}
            <section className="bg-muted/30 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">
                {t('welcome.quickStartTitle')}
              </h2>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-medium text-foreground">1.</span> {t('welcome.step1')}
                </li>
                <li>
                  <span className="font-medium text-foreground">2.</span> {t('welcome.step2')}
                </li>
                <li>
                  <span className="font-medium text-foreground">3.</span> {t('welcome.step3')}
                </li>
              </ol>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{t('welcome.footerNote')}</p>
            <Button
              data-testid={DynamicTestId.resolve('welcome-get-started', 'welcome-get-started')}
              size="sm"
              onClick={handleNextStep}
            >
              {isFinalStep ? t('welcome.getStarted') : t('welcome.nextStep', 'Next step')}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
