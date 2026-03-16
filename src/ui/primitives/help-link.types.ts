import type { Tier } from "@/store/qr-store";

export type HelpLinkProps = {
  href?: string;
  anchor?: string;
  requiredTier?: Tier;
  title?: string;
  className?: string;
};
