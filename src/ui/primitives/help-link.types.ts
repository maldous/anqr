import type { Tier } from "@/lib/tier";

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
};
