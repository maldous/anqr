import React from "react";
import i18n from "i18next";

export function buildWifiSecurityBadge(sec: string): { badge: React.ReactNode; note: string } {
  if (sec.includes("WPA3")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          {i18n.t("analyze.wpa3Strongest", "WPA3 (Strongest)")}
        </span>
      ),
      note: i18n.t("analyze.wpa3Note", "AES-256 encryption, latest standard"),
    };
  }
  if (sec.includes("WPA2")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          {i18n.t("analyze.wpa2Strong", "WPA2 (Strong)")}
        </span>
      ),
      note: i18n.t("analyze.wpa2Note", "AES encryption, widely compatible"),
    };
  }
  if (sec.includes("WPA")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {i18n.t("analyze.wpaModerate", "WPA (Moderate)")}
        </span>
      ),
      note: i18n.t("analyze.wpaNote", "TKIP encryption, upgrade recommended"),
    };
  }
  if (sec.includes("WEP")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          {i18n.t("analyze.wepWeak", "WEP (Weak)")}
        </span>
      ),
      note: i18n.t("analyze.wepNote", "⚠️ Deprecated, easily cracked"),
    };
  }
  if (sec === "NOPASS" || sec === "OPEN" || sec === "") {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          {i18n.t("analyze.openNoSecurity", "Open (No Security)")}
        </span>
      ),
      note: i18n.t("analyze.openNoSecurityNote", "⚠️ No encryption, avoid for sensitive data"),
    };
  }
  return { badge: null, note: "" };
}
