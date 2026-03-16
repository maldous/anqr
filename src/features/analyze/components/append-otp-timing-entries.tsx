import { Hash, Lock, Settings } from "lucide-react";
import { parseOtpAuthPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function appendOtpTimingEntries(
  details: DetailEntry[],
  otpData: ReturnType<typeof parseOtpAuthPayload>,
): void {
  if (otpData.period && otpData.type === "TOTP") {
    details.push({
      label: "Refresh Period",
      value: `${otpData.period} seconds`,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (otpData.counter && otpData.type === "HOTP") {
    details.push({
      label: "Counter",
      value: <span className="font-mono text-xs">{otpData.counter}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }
  if (otpData.hasSecret) {
    details.push({
      label: "Secret",
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
