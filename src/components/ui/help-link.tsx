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
import { createLogger } from '@/lib/logger';
import { prepareRewardedAd, showRewardedAd } from '@/modules/platform';
import { type Tier, useQRStore } from '@/store/qr-store';

const log = createLogger('HELP');

interface HelpLinkProps {
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
}

/** Extract tier from tab= query parameter in URL */
function parseTierFromUrl(href: string): Tier | undefined {
  const regex = /[?&]tab=(basic|advanced|professional)(?:&|#|$)/;
  const match = regex.exec(href);
  return match ? (match[1] as Tier) : undefined;
}

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

      // If linking to generator with a required tier, handle tier switching
      if (effectiveTier && resolvedHref.startsWith('/')) {
        const tierOrder: Tier[] = ['basic', 'advanced', 'professional'];
        const currentIndex = tierOrder.indexOf(currentTier);
        const requiredIndex = tierOrder.indexOf(effectiveTier);

        if (requiredIndex > currentIndex) {
          // Professional tier on native platform requires watching ad (same flow as Header.tsx)
          if (effectiveTier === 'professional' && Capacitor.isNativePlatform()) {
            // If already has premium access, allow direct selection
            if (!checkPremiumAccess()) {
              // Show rewarded ad
              setLoadingAd(true);
              try {
                const reward = await showRewardedAd('premium');
                if (!reward) {
                  // User didn't complete the ad - don't navigate or change tier
                  setLoadingAd(false);
                  return;
                }
                // User watched the ad, grant premium access
                activatePremiumAccess();
              } catch (error) {
                log.error('Failed to show rewarded ad', { error });
                setLoadingAd(false);
                return;
              }
              setLoadingAd(false);
              // Prepare next ad
              prepareRewardedAd('premium');
            }
          }
          // Set the tier (for all tiers, after ad if needed)
          setTier(effectiveTier);
        }
      }

      // Parse href to handle hash and query params correctly
      // Format: /path?query=value#hash or /path#hash or /path?query=value
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

      // Add language parameter if not present
      if (!query.includes('lang=')) {
        const separator = query ? '&' : '?';
        query = `${query}${separator}lang=${i18n.language}`;
      }

      // Build full URL: path + query + hash
      const fullHref = `${path}${query}${hash}`;

      // Navigate using history API for SPA navigation
      globalThis.history.pushState({}, '', fullHref);
      globalThis.dispatchEvent(new PopStateEvent('popstate'));

      // Scroll to top for page navigation, or to anchor if present
      if (hash) {
        const anchor = hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        globalThis.scrollTo({ top: 0, behavior: 'smooth' });
      }
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

export default HelpLink;
