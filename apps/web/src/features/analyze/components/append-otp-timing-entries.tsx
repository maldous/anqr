import { Hash, Lock, Settings } from "lucide-react";
import i18n from "i18next";
import { parseOtpAuthPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function appendOtpTimingEntries(
  details: DetailEntry[],
  otpData: ReturnType<typeof parseOtpAuthPayload>,
): void {
  if (otpData.period && otpData.type === "TOTP") {
    details.push({
      label: i18n.t("analyze.refreshPeriod", "Refresh Period"),
      value: i18n.t("analyze.nSeconds", "{{count}} seconds", { count: Number(otpData.period) }),
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (otpData.counter && otpData.type === "HOTP") {
    details.push({
      label: i18n.t("analyze.counter", "Counter"),
      value: <span className="font-mono text-xs">{otpData.counter}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }
  if (otpData.hasSecret) {
    details.push({
      label: i18n.t("analyze.secret", "Secret"),
      value: (
        <span
          className={
            otpData.hasSecret === "Missing"
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }
        >
          {otpData.hasSecret}
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }
}
