import { CreditCard, Settings } from "lucide-react";
import { buildPlainTextDetails } from "./build-plain-text-details";
import type { DetailEntry } from "./detail-entry";

export function buildEmvQrDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push(
    {
      label: "Payment Standard",
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
          EMVCo QR
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    },
    {
      label: "Format",
      value: "Merchant-Presented Mode",
      icon: <Settings className="w-3 h-3" />,
    },
    ...buildPlainTextDetails(payload),
  );
  return details;
}
