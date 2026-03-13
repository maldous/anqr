/**
 * HelpLink Component
 * Contextual help links that navigate to guide/learn pages.
 * Automatically switches tier if linking to generator features requiring higher tier.
 * Honors AdMob rewarded ad requirement for professional tier on native platforms.
 */

import { Capacitor } from '@capacitor/core';
import { HelpCircle, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createLogger } from '@/infra/logging/logger';
import { prepareRewardedAd, showRewardedAd } from '@/modules/platform';
import { type Tier, useQRStore } from '@/store/qr-store';

const log = createLogger('HELP');

type HelpLinkProps = {
  /** Path to navigate to, e.g., '/guide#section-5' or '/learn' */
  href?: string;
  /** Anchor within the guide page (shorthand for href='/guide#anchor') */
  anchor?: string;
  /** Tier required for the linked feature (overrides tab= in URL if provided) */
  requiredTier?: Tier;
  /** Tooltip text (defaults to 'Learn more') */
  title?: string;
  /** Additional CSS classes */
  className?: string;
};

/** Extract tier from tab= query parameter in URL */
const parseTierFromUrl = (href: string): Tier | undefined => {
  const regex = /[?&]tab=(basic|advanced|professional)(?:&|#|$)/;
  const match = regex.exec(href);
  return match ? (match[1] as Tier) : undefined;
};

const requestProfessionalAccess = async (
  activatePremiumAccess: () => void,
  setLoadingAd: (loading: boolean) => void
): Promise<boolean> => {
  setLoadingAd(true);
  try {
    const reward = await showRewardedAd('premium');
    if (!reward) {
      setLoadingAd(false);
      return false;
    }
    activatePremiumAccess();
  } catch (error) {
    log.error('Failed to show rewarded ad', { error });
    setLoadingAd(false);
    return false;
  }
  setLoadingAd(false);
  prepareRewardedAd('premium');
  return true;
};

const handleTierUpgrade = async (
  effectiveTier: Tier,
  currentTier: Tier,
  setTier: (tier: Tier) => void,
  checkPremiumAccess: () => boolean,
  activatePremiumAccess: () => void,
  setLoadingAd: (loading: boolean) => void
): Promise<boolean> => {
  const tierOrder: Tier[] = ['basic', 'advanced', 'professional'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(effectiveTier);

  if (requiredIndex <= currentIndex) return true;

  if (effectiveTier === 'professional' && Capacitor.isNativePlatform()) {
    if (!checkPremiumAccess()) {
      const granted = await requestProfessionalAccess(activatePremiumAccess, setLoadingAd);
      if (!granted) return false;
    }
  }

  setTier(effectiveTier);
  return true;
};

const buildNavigationUrl = (
  resolvedHref: string,
  language: string
): { fullHref: string; hash: string } => {
  let path = resolvedHref;
  let hash = '';
  let query = '';

  const hashIndex = resolvedHref.indexOf('#');
  if (hashIndex !== -1) {
    hash = resolvedHref.substring(hashIndex);
    path = resolvedHref.substring(0, hashIndex);
  }

  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    query = path.substring(queryIndex);
    path = path.substring(0, queryIndex);
  }

  if (!query.includes('lang=')) {
    const separator = query ? '&' : '?';
    query = `${query}${separator}lang=${language}`;
  }

  return { fullHref: `${path}${query}${hash}`, hash };
};

const performSPANavigation = (fullHref: string, hash: string): void => {
  globalThis.history.pushState({}, '', fullHref);
  globalThis.dispatchEvent(new PopStateEvent('popstate'));

  if (hash) {
    const anchorId = hash.substring(1);
    setTimeout(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  } else {
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

export function HelpLink({
  href,
  anchor,
  requiredTier,
  title,
  className = '',
}: Readonly<HelpLinkProps>) {
  // Convert anchor shorthand to full href
  const resolvedHref = anchor ? `/guide#${anchor}` : href || '/guide';
  const { t, i18n } = useTranslation();
  const setTier = useQRStore((s) => s.setTier);
  const currentTier = useQRStore((s) => s.tier);
  const checkPremiumAccess = useQRStore((s) => s.checkPremiumAccess);
  const activatePremiumAccess = useQRStore((s) => s.activatePremiumAccess);
  const [loadingAd, setLoadingAd] = useState(false);

  // Determine the effective required tier: explicit prop takes precedence, otherwise parse from URL
  const effectiveTier = requiredTier ?? parseTierFromUrl(resolvedHref);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();

      if (effectiveTier && resolvedHref.startsWith('/')) {
        const proceed = await handleTierUpgrade(
          effectiveTier,
          currentTier,
          setTier,
          checkPremiumAccess,
          activatePremiumAccess,
          setLoadingAd
        );
        if (!proceed) return;
      }

      const { fullHref, hash } = buildNavigationUrl(resolvedHref, i18n.language);
      performSPANavigation(fullHref, hash);
    },
    [
      resolvedHref,
      effectiveTier,
      currentTier,
      setTier,
      checkPremiumAccess,
      activatePremiumAccess,
      i18n.language,
    ]
  );

  return (
    <a
      href={resolvedHref}
      onClick={handleClick}
      className={`inline-flex items-center justify-center ml-1 p-1 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 transition-all ${loadingAd ? 'pointer-events-none opacity-50' : ''} ${className}`}
      title={title || t('common.learnMore')}
    >
      {loadingAd ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <HelpCircle className="h-4 w-4" />
      )}
    </a>
  );
}
