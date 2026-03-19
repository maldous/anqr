import type { HelpLinkProps } from "@/ui/web";

export type ConnectedHelpLinkProps = Omit<
  HelpLinkProps,
  "currentTier" | "setTier" | "checkPremiumAccess" | "activatePremiumAccess"
>;
