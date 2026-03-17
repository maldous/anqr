import { useQRStore } from "@/store/qr-store";
import { HelpLink } from "@/ui/primitives/help-link";
import type { ConnectedHelpLinkProps } from "./connected-help-link.types";

export function ConnectedHelpLink(props: Readonly<ConnectedHelpLinkProps>) {
  const currentTier = useQRStore((s) => s.tier);
  const setTier = useQRStore((s) => s.setTier);
  const checkPremiumAccess = useQRStore((s) => s.checkPremiumAccess);
  const activatePremiumAccess = useQRStore((s) => s.activatePremiumAccess);

  return (
    <HelpLink
      {...props}
      currentTier={currentTier}
      setTier={setTier}
      checkPremiumAccess={checkPremiumAccess}
      activatePremiumAccess={activatePremiumAccess}
    />
  );
}
