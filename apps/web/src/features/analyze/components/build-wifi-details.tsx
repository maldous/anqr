import { Eye, FileText, Info, Lock, Settings, Shield, Wifi } from "lucide-react";
import i18n from "i18next";
import { parseWifiPayload } from "./payload-parsers";
import { buildWifiSecurityBadge } from "./build-wifi-security-badge";
import type { DetailEntry } from "./detail-entry";

export function buildWifiDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const wifiData = parseWifiPayload(payload);

  if (wifiData.ssid) {
    details.push({
      label: i18n.t("analyze.networkSsid", "Network Name (SSID)"),
      value: <span className="font-mono text-xs font-medium">{wifiData.ssid}</span>,
      icon: <Wifi className="w-3 h-3" />,
    });
  }

  if (wifiData.security) {
    const sec = String(wifiData.security).toUpperCase();
    const { badge: securityBadge, note: securityNote } = buildWifiSecurityBadge(sec);

    details.push({
      label: i18n.t("analyze.securityType", "Security Type"),
      value: securityBadge ?? <span className="font-mono text-xs">{wifiData.security}</span>,
      icon: <Shield className="w-3 h-3" />,
    });

    if (securityNote) {
      details.push({
        label: i18n.t("analyze.securityNote", "Security Note"),
        value: <span className="text-xs text-muted-foreground">{securityNote}</span>,
        icon: <Info className="w-3 h-3" />,
      });
    }
  }

  if (wifiData.password) {
    const pwd = String(wifiData.password);
    details.push({
      label: i18n.t("analyze.password", "Password"),
      value: (
        <span className="font-mono text-xs">
          {"•".repeat(Math.min(pwd.length, 12))}
          <span className="text-muted-foreground ml-1">
            ({i18n.t("analyze.nChars", "{{count}} chars", { count: pwd.length })})
          </span>
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }

  details.push({
    label: i18n.t("analyze.hiddenNetwork", "Hidden Network"),
    value:
      wifiData.hidden === "true" ? (
        <span className="text-amber-600 dark:text-amber-400">
          {i18n.t("analyze.wifiHidden", "Yes (won't appear in scan)")}
        </span>
      ) : (
        <span className="text-green-600 dark:text-green-400">
          {i18n.t("analyze.wifiVisible", "No (visible)")}
        </span>
      ),
    icon: <Eye className="w-3 h-3" />,
  });

  if (wifiData.eapMethod) {
    details.push({
      label: i18n.t("analyze.eapMethod", "EAP Method"),
      value: <span className="font-mono text-xs">{wifiData.eapMethod}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (wifiData.identity) {
    details.push({
      label: i18n.t("analyze.identity", "Identity"),
      value: <span className="font-mono text-xs">{wifiData.identity}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (wifiData.phase2) {
    details.push({
      label: i18n.t("analyze.phase2", "Phase 2"),
      value: <span className="font-mono text-xs">{wifiData.phase2}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  return details;
}
