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
  Type,
} from 'lucide-react';
import { parseUrlPayload } from './payload-parsers';
import { buildUrlSocialEntries } from './build-url-social-entries';
import { buildUrlParamEntries } from './build-url-param-entries';
import type { DetailEntry } from './detail-entry';
import { detectSocialPlatform } from './detect-social-platform';

export function buildUrlDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const urlData = parseUrlPayload(payload);
  const socialPlatform = detectSocialPlatform(payload);

  details.push(...buildUrlSocialEntries(socialPlatform));

  if (urlData.hostname) {
    details.push({
      label: 'Domain',
      value: (
        <span className="flex items-center gap-1">
          {urlData.isSecure === 'true' && <Lock className="w-3 h-3 text-green-500" />}
          <span className="font-mono text-xs">{urlData.hostname}</span>
        </span>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }

  details.push({
    label: 'Security',
    value:
      urlData.isSecure === 'true' ? (
        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
          <Lock className="w-3 h-3" /> HTTPS (Encrypted)
        </span>
      ) : (
        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> HTTP (Not Encrypted)
        </span>
      ),
    icon: <Shield className="w-3 h-3" />,
  });

  if (urlData.protocol) {
    details.push({
      label: 'Protocol',
      value: <span className="font-mono text-xs uppercase">{urlData.protocol}</span>,
      icon: <Link className="w-3 h-3" />,
    });
  }

  if (urlData.port) {
    details.push({
      label: 'Port',
      value: <span className="font-mono text-xs">{urlData.port}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (urlData.path) {
    details.push({
      label: 'Path',
      value: <span className="font-mono text-xs break-all">{urlData.path}</span>,
      icon: <Link className="w-3 h-3" />,
    });
  }

  if (urlData.fragment) {
    details.push({
      label: 'Fragment',
      value: <span className="font-mono text-xs">#{urlData.fragment}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (urlData.isShortened === 'true') {
    details.push({
      label: 'URL Type',
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Shortened ({urlData.shortenerService})
        </span>
      ),
      icon: <Link className="w-3 h-3" />,
    });
  }

  details.push(...buildUrlParamEntries(urlData.params));

  details.push({
    label: 'URL Length',
    value: `${urlData.urlLength} characters`,
    icon: <Ruler className="w-3 h-3" />,
  });

  if (urlData.hasPercentEncoding === 'true') {
    details.push({
      label: 'Encoding',
      value: <span className="text-xs">Contains percent-encoded characters</span>,
      icon: <Binary className="w-3 h-3" />,
    });
  }

  details.push({
    label: 'Open URL',
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
  });
  return details;
}
