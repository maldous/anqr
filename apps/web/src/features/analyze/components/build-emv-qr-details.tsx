import { CreditCard, Settings } from "lucide-react";
import i18n from "i18next";
import { buildPlainTextDetails } from "./build-plain-text-details";
import type { DetailEntry } from "./detail-entry";

export function buildEmvQrDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push(
    {
      label: i18n.t("analyze.paymentStandard", "Payment Standard"),
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
          {i18n.t("analyze.emvcoQr", "EMVCo QR")}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    },
    {
      label: i18n.t("analyze.format", "Format"),
      value: i18n.t("analyze.merchantPresentedMode", "Merchant-Presented Mode"),
      icon: <Settings className="w-3 h-3" />,
    },
    ...buildPlainTextDetails(payload),
  );
  return details;
}
