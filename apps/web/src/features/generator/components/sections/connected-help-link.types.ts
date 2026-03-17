import type { HelpLinkProps } from "@/ui/primitives/help-link.types";

export type ConnectedHelpLinkProps = Omit<
  HelpLinkProps,
  "currentTier" | "setTier" | "checkPremiumAccess" | "activatePremiumAccess"
>;
