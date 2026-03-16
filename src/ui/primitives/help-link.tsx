/**
 * HelpLink Component
 * Contextual help links that navigate to guide/learn pages.
 * Automatically switches tier if linking to generator features requiring higher tier.
 * Honors AdMob rewarded ad requirement for professional tier on native platforms.
 */

import { HelpCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQRStore } from "@/store/qr-store";
import { buildNavigationUrl } from "./build-help-link-navigation-url";
import { handleTierUpgrade } from "./handle-help-link-tier-upgrade";
import type { HelpLinkProps } from "./help-link-props";
import { parseTierFromUrl } from "./parse-help-link-tier-from-url";
import { performSPANavigation } from "./perform-help-link-navigation";

export function HelpLink({
  href,
  anchor,
  requiredTier,
  title,
  className = "",
}: Readonly<HelpLinkProps>) {
  // Convert anchor shorthand to full href
  const resolvedHref = anchor ? `/guide#${anchor}` : href || "/guide";
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

      if (effectiveTier && resolvedHref.startsWith("/")) {
        const proceed = await handleTierUpgrade(
          effectiveTier,
          currentTier,
          setTier,
          checkPremiumAccess,
          activatePremiumAccess,
          setLoadingAd,
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
    ],
  );

  return (
    <a
      href={resolvedHref}
      onClick={handleClick}
      className={`inline-flex items-center justify-center ml-1 p-1 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 transition-all ${loadingAd ? "pointer-events-none opacity-50" : ""} ${className}`}
      title={title || t("common.learnMore")}
    >
      {loadingAd ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <HelpCircle className="h-4 w-4" />
      )}
    </a>
  );
}
