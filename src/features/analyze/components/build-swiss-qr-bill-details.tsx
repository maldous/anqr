import { CreditCard, Globe } from "lucide-react";
import { buildPlainTextDetails } from "./build-plain-text-details";
import type { DetailEntry } from "./detail-entry";

export function buildSwissQrBillDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push({
    label: "Payment Standard",
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
        Swiss QR-bill
      </span>
    ),
    icon: <CreditCard className="w-3 h-3" />,
  });
  details.push({
    label: "Country",
    value: (
      <span className="flex items-center gap-1">
        <span className="text-lg">🇨🇭</span> Switzerland
      </span>
    ),
    icon: <Globe className="w-3 h-3" />,
  });
  details.push(...buildPlainTextDetails(payload));
  return details;
}
