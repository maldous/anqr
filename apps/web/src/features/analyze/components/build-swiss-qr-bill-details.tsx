import { CreditCard, Globe } from "lucide-react";
import i18n from "i18next";
import { buildPlainTextDetails } from "./build-plain-text-details";
import type { DetailEntry } from "./detail-entry";

export function buildSwissQrBillDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push(
    {
      label: i18n.t("analyze.paymentStandard", "Payment Standard"),
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
          {i18n.t("analyze.swissQrBill", "Swiss QR-bill")}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    },
    {
      label: i18n.t("analyze.country", "Country"),
      value: (
        <span className="flex items-center gap-1">
          <span className="text-lg">🇨🇭</span> {i18n.t("analyze.switzerland", "Switzerland")}
        </span>
      ),
      icon: <Globe className="w-3 h-3" />,
    },
    ...buildPlainTextDetails(payload),
  );
  return details;
}
