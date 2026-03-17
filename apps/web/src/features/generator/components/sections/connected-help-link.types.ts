import type { HelpLinkProps } from "../../../../../../../packages/ui/web/src/primitives/help-link.types";

export type ConnectedHelpLinkProps = Omit<
  HelpLinkProps,
  "currentTier" | "setTier" | "checkPremiumAccess" | "activatePremiumAccess"
>;
