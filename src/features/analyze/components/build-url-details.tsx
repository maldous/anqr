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
          label: "Domain",
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
      label: "Security",
      value:
        urlData.isSecure === "true" ? (
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> HTTPS (Encrypted)
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> HTTP (Not Encrypted)
          </span>
        ),
      icon: <Shield className="w-3 h-3" />,
    },

    urlData.protocol
      ? {
          label: "Protocol",
          value: <span className="font-mono text-xs uppercase">{urlData.protocol}</span>,
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    urlData.port
      ? {
          label: "Port",
          value: <span className="font-mono text-xs">{urlData.port}</span>,
          icon: <Settings className="w-3 h-3" />,
        }
      : null,

    urlData.path
      ? {
          label: "Path",
          value: <span className="font-mono text-xs break-all">{urlData.path}</span>,
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    urlData.fragment
      ? {
          label: "Fragment",
          value: <span className="font-mono text-xs">#{urlData.fragment}</span>,
          icon: <Hash className="w-3 h-3" />,
        }
      : null,

    urlData.isShortened === "true"
      ? {
          label: "URL Type",
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Shortened ({urlData.shortenerService})
            </span>
          ),
          icon: <Link className="w-3 h-3" />,
        }
      : null,

    ...buildUrlParamEntries(urlData.params),

    {
      label: "URL Length",
      value: `${urlData.urlLength} characters`,
      icon: <Ruler className="w-3 h-3" />,
    },

    urlData.hasPercentEncoding === "true"
      ? {
          label: "Encoding",
          value: <span className="text-xs">Contains percent-encoded characters</span>,
          icon: <Binary className="w-3 h-3" />,
        }
      : null,

    {
      label: "Open URL",
      value: (
        <a
          href={payload}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in new tab <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    },
  ];

  return details.filter((entry): entry is DetailEntry => entry !== null);
}
