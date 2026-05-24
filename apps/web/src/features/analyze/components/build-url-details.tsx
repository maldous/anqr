import {
  AlertTriangle,
  Binary,
  ChevronRight,
  Globe,
  Hash,
  Link,
  Lock,
  Ruler,
  Settings,
  Shield,
} from "lucide-react";
import i18n from "i18next";
import { parseUrlPayload } from "./payload-parsers";
import { buildUrlSocialEntries } from "./build-url-social-entries";
import { buildUrlParamEntries } from "./build-url-param-entries";
import type { DetailEntry } from "./detail-entry";
import { detectSocialPlatform } from "./detect-social-platform";

export function buildUrlDetails(payload: string): DetailEntry[] {
  const urlData = parseUrlPayload(payload);
  const socialPlatform = detectSocialPlatform(payload);

  const details: (DetailEntry | null)[] = [
    ...buildUrlSocialEntries(socialPlatform),

    urlData.hostname
      ? {
          label: i18n.t("analyze.domain", "Domain"),
          value: (
            <span className="flex items-center gap-1">
              {urlData.isSecure === "true" && <Lock className="w-3 h-3 text-green-500" />}
              <span className="font-mono text-xs">{urlData.hostname}</span>
            </span>
          ),
          icon: <Globe className="w-3 h-3" />,
        }
      : null,

    {
      label: i18n.t("analyze.security", "Security"),
      value:
        urlData.isSecure === "true" ? (
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> {i18n.t("analyze.httpsEncrypted", "HTTPS (Encrypted)")}
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />{" "}
            {i18n.t("analyze.httpNotEncrypted", "HTTP (Not Encrypted)")}
          </span>
        ),
      icon: <Shield className="w-3 h-3" />,
    },

    urlData.protocol
      ? {
          label: i18n.t("analyze.protocol", "Protocol"),
          value: <span className="font-mono text-xs uppercase">{urlData.protocol}</span>,
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    urlData.port
      ? {
          label: i18n.t("analyze.port", "Port"),
          value: <span className="font-mono text-xs">{urlData.port}</span>,
          icon: <Settings className="w-3 h-3" />,
        }
      : null,

    urlData.path
      ? {
          label: i18n.t("analyze.path", "Path"),
          value: <span className="font-mono text-xs break-all">{urlData.path}</span>,
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    urlData.fragment
      ? {
          label: i18n.t("analyze.fragment", "Fragment"),
          value: <span className="font-mono text-xs">#{urlData.fragment}</span>,
          icon: <Hash className="w-3 h-3" />,
        }
      : null,

    urlData.isShortened === "true"
      ? {
          label: i18n.t("analyze.urlType", "URL Type"),
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {i18n.t("analyze.shortenedService", "Shortened ({{service}})", {
                service: String(urlData.shortenerService ?? ""),
              })}
            </span>
          ),
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    ...buildUrlParamEntries(urlData.params),

    {
      label: i18n.t("analyze.urlLength", "URL Length"),
      value: i18n.t("analyze.nCharacters", "{{count}} characters", {
        count: Number(urlData.urlLength),
      }),
      icon: <Ruler className="w-3 h-3" />,
    },

    urlData.hasPercentEncoding === "true"
      ? {
          label: i18n.t("analyze.encoding", "Encoding"),
          value: (
            <span className="text-xs">
              {i18n.t("analyze.containsPercentEncoded", "Contains percent-encoded characters")}
            </span>
          ),
          icon: <Binary className="w-3 h-3" />,
        }
      : null,

    {
      label: i18n.t("analyze.openUrl", "Open URL"),
      value: (
        <a
          href={payload}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {i18n.t("analyze.openInNewTab", "Open in new tab")} <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    },
  ];

  return details.filter((entry): entry is DetailEntry => entry !== null);
}
