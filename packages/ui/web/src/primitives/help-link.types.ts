import type { Tier } from "./tier.types";

export type HelpLinkProps = {
  href?: string;
  anchor?: string;
  requiredTier?: Tier;
  title?: string;
  className?: string;
  currentTier: Tier;
  setTier: (tier: Tier) => void;
  checkPremiumAccess: () => boolean;
  activatePremiumAccess: () => void;
  requestProfessionalAccess?: (
    activatePremiumAccess: () => void,
    setLoadingAd: (loading: boolean) => void,
  ) => Promise<boolean>;
};
