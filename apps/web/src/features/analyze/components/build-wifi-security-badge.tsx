import React from "react";

export function buildWifiSecurityBadge(sec: string): { badge: React.ReactNode; note: string } {
  if (sec.includes("WPA3")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          WPA3 (Strongest)
        </span>
      ),
      note: "AES-256 encryption, latest standard",
    };
  }
  if (sec.includes("WPA2")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          WPA2 (Strong)
        </span>
      ),
      note: "AES encryption, widely compatible",
    };
  }
  if (sec.includes("WPA")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          WPA (Moderate)
        </span>
      ),
      note: "TKIP encryption, upgrade recommended",
    };
  }
  if (sec.includes("WEP")) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          WEP (Weak)
        </span>
      ),
      note: "⚠️ Deprecated, easily cracked",
    };
  }
  if (sec === "NOPASS" || sec === "OPEN" || sec === "") {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          Open (No Security)
        </span>
      ),
      note: "⚠️ No encryption, avoid for sensitive data",
    };
  }
  return { badge: null, note: "" };
}
