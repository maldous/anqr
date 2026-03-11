import React, { useState, useCallback } from 'react';
import {
  AlertTriangle,
  Binary,
  ChevronRight,
  Check,
  ClipboardCopy,
  CreditCard,
  Eye,
  FileText,
  Globe,
  Hash,
  Image as ImageIcon,
  Info,
  Link,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  Settings,
  Shield,
  Smartphone,
  Type,
  Wallet,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContentTypeDetails } from '@/modules/qr-analyzer';
import {
  analyzePlainText,
  parseCryptoPayload,
  parseCalendarPayload,
  parseEmailPayload,
  parseEpcSepaPayload,
  parseGeoPayload,
  parseMeCardPayload,
  parseOtpAuthPayload,
  parseSmsPayload,
  parseTelPayload,
  parseUpiPayload,
  parseUrlPayload,
  parseVCardPayload,
  parseWifiPayload,
} from '@/components/analyze/payload-parsers';

// ---------------------------------------------------------------------------
// CopyButton (inline replica from Analyze.tsx)
// ---------------------------------------------------------------------------
interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-7 gap-1.5 text-xs ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardCopy className="w-3 h-3" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Social Platform Matcher Registry
// ---------------------------------------------------------------------------
type SocialPlatformResult = {
  name: string;
  badge: React.ReactNode;
  extractedInfo?: React.ReactNode;
};

interface SocialPlatformMatcher {
  hostPatterns: string[];
  resolve: (hostname: string, pathname: string, urlObj: URL) => SocialPlatformResult;
}

const SOCIAL_PLATFORM_MATCHERS: SocialPlatformMatcher[] = [
  {
    hostPatterns: ['wa.me', 'whatsapp.com', 'api.whatsapp.com'],
    resolve: (_hostname, pathname) => {
      const phoneMatch = pathname.match(/(\d+)/);
      const phone = phoneMatch ? phoneMatch[1] : null;
      return {
        name: 'WhatsApp',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            WhatsApp
          </span>
        ),
        extractedInfo: phone ? (
          <a href={`tel:+${phone}`} className="font-mono text-xs text-primary hover:underline">
            +{phone}
          </a>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['facebook.com', 'fb.com', 'fb.me', 'm.facebook.com'],
    resolve: () => ({
      name: 'Facebook',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
          Facebook
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['instagram.com', 'instagr.am'],
    resolve: (_hostname, pathname) => {
      const usernameMatch = pathname.match(/^\/([^/]+)/);
      const username =
        usernameMatch && !['p', 'reel', 'stories', 'explore'].includes(usernameMatch[1])
          ? usernameMatch[1]
          : null;
      return {
        name: 'Instagram',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
            Instagram
          </span>
        ),
        extractedInfo: username ? (
          <span className="font-mono text-xs">@{username}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['twitter.com', 'x.com', 't.co'],
    resolve: (_hostname, pathname) => {
      const usernameMatch = pathname.match(/^\/([^/]+)/);
      const username =
        usernameMatch && !['search', 'explore', 'home', 'i', 'intent'].includes(usernameMatch[1])
          ? usernameMatch[1]
          : null;
      return {
        name: 'X (Twitter)',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white dark:bg-white dark:text-black">
            𝕏
          </span>
        ),
        extractedInfo: username ? (
          <span className="font-mono text-xs">@{username}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    resolve: (hostname, pathname, urlObj) => {
      let videoId: string | null = null;
      if (hostname.includes('youtu.be')) {
        videoId = pathname.slice(1).split('?')[0];
      } else {
        const vParam = urlObj.searchParams.get('v');
        if (vParam) videoId = vParam;
      }
      return {
        name: 'YouTube',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
            ▶ YouTube
          </span>
        ),
        extractedInfo: videoId ? (
          <span className="font-mono text-xs">Video: {videoId}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['linkedin.com', 'lnkd.in'],
    resolve: () => ({
      name: 'LinkedIn',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-white">
          LinkedIn
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['tiktok.com', 'vm.tiktok.com'],
    resolve: (_hostname, pathname) => {
      const usernameMatch = pathname.match(/^\/@([^/]+)/);
      return {
        name: 'TikTok',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white">
            ♪ TikTok
          </span>
        ),
        extractedInfo: usernameMatch ? (
          <span className="font-mono text-xs">@{usernameMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['t.me', 'telegram.me', 'telegram.org'],
    resolve: (_hostname, pathname) => {
      const usernameMatch = pathname.match(/^\/([^/]+)/);
      return {
        name: 'Telegram',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500 text-white">
            Telegram
          </span>
        ),
        extractedInfo: usernameMatch ? (
          <span className="font-mono text-xs">@{usernameMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['discord.gg', 'discord.com', 'discordapp.com'],
    resolve: () => ({
      name: 'Discord',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
          Discord
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['snapchat.com', 'snap.com'],
    resolve: () => ({
      name: 'Snapchat',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
          👻 Snapchat
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['reddit.com', 'redd.it'],
    resolve: (_hostname, pathname) => {
      const subredditMatch = pathname.match(/^\/r\/([^/]+)/);
      return {
        name: 'Reddit',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-600 text-white">
            Reddit
          </span>
        ),
        extractedInfo: subredditMatch ? (
          <span className="font-mono text-xs">r/{subredditMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['pinterest.com', 'pin.it'],
    resolve: () => ({
      name: 'Pinterest',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-700 text-white">
          Pinterest
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['apps.apple.com', 'itunes.apple.com'],
    resolve: () => ({
      name: 'App Store',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          App Store
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['play.google.com'],
    resolve: () => ({
      name: 'Google Play',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          Google Play
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['spotify.com', 'open.spotify.com'],
    resolve: () => ({
      name: 'Spotify',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
          ♫ Spotify
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['github.com', 'gist.github.com'],
    resolve: (_hostname, pathname) => {
      const repoMatch = pathname.match(/^\/([^/]+)\/([^/]+)/);
      return {
        name: 'GitHub',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800">
            GitHub
          </span>
        ),
        extractedInfo: repoMatch ? (
          <span className="font-mono text-xs">
            {repoMatch[1]}/{repoMatch[2]}
          </span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['paypal.com', 'paypal.me'],
    resolve: (hostname, pathname) => {
      const usernameMatch = pathname.match(/^\/([^/]+)/);
      return {
        name: 'PayPal',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            PayPal
          </span>
        ),
        extractedInfo:
          usernameMatch && hostname.includes('paypal.me') ? (
            <span className="font-mono text-xs">@{usernameMatch[1]}</span>
          ) : undefined,
      };
    },
  },
  {
    hostPatterns: ['venmo.com'],
    resolve: () => ({
      name: 'Venmo',
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400 text-white flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Venmo
        </span>
      ),
    }),
  },
  {
    hostPatterns: ['cash.app'],
    resolve: (_hostname, pathname) => {
      const cashtagMatch = pathname.match(/^\/(\$[^/]+)/);
      return {
        name: 'Cash App',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Cash App
          </span>
        ),
        extractedInfo: cashtagMatch ? (
          <span className="font-mono text-xs">{cashtagMatch[1]}</span>
        ) : undefined,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// detectSocialPlatform
// ---------------------------------------------------------------------------
export function detectSocialPlatform(
  url: string
): { name: string; badge: React.ReactNode; extractedInfo?: React.ReactNode } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    const matcher = SOCIAL_PLATFORM_MATCHERS.find((m) =>
      m.hostPatterns.some((p) => hostname.includes(p))
    );
    return matcher ? matcher.resolve(hostname, pathname, urlObj) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Content Type Detail Builders
// ---------------------------------------------------------------------------
type DetailEntry = { label: string; value: React.ReactNode; icon?: React.ReactNode };

function buildPlainTextDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const analysis = analyzePlainText(payload);
  details.push({
    label: 'Character Count',
    value: `${analysis.charCount} characters`,
    icon: <Type className="w-3 h-3" />,
  });
  details.push({
    label: 'Word Count',
    value: `${analysis.wordCount} words`,
    icon: <Type className="w-3 h-3" />,
  });
  details.push({
    label: 'Line Count',
    value: `${analysis.lineCount} lines`,
    icon: <Type className="w-3 h-3" />,
  });
  if (analysis.hasEmoji) {
    details.push({
      label: 'Contains Emoji',
      value: <span className="text-amber-600 dark:text-amber-400">Yes</span>,
      icon: <Type className="w-3 h-3" />,
    });
  }
  if (analysis.hasNonAscii) {
    details.push({
      label: 'Contains Non-ASCII',
      value: <span className="text-blue-600 dark:text-blue-400">Yes (UTF-8)</span>,
      icon: <Binary className="w-3 h-3" />,
    });
  }
  details.push({
    label: 'Encoding Recommendation',
    value: <span className="font-medium">{analysis.encodingRecommendation}</span>,
    icon: <Settings className="w-3 h-3" />,
  });
  return details;
}

function buildUrlSocialEntries(
  socialPlatform: ReturnType<typeof detectSocialPlatform>
): DetailEntry[] {
  if (!socialPlatform) return [];
  const entries: DetailEntry[] = [
    {
      label: 'Platform',
      value: socialPlatform.badge,
      icon: <Globe className="w-3 h-3" />,
    },
  ];
  if (socialPlatform.extractedInfo) {
    entries.push({
      label: socialPlatform.name === 'WhatsApp' ? 'Phone' : 'Handle',
      value: socialPlatform.extractedInfo,
      icon:
        socialPlatform.name === 'WhatsApp' ? (
          <Phone className="w-3 h-3" />
        ) : (
          <Type className="w-3 h-3" />
        ),
    });
  }
  return entries;
}

function buildUrlParamEntries(
  params: Array<{ key: string; value: string }> | undefined
): DetailEntry[] {
  if (!params || params.length === 0) return [];
  const entries: DetailEntry[] = [
    {
      label: 'Query Parameters',
      value: <span className="font-medium">{params.length} parameter(s)</span>,
      icon: <Settings className="w-3 h-3" />,
    },
  ];
  params.slice(0, 5).forEach((param) => {
    entries.push({
      label: `  └ ${param.key}`,
      value: <span className="font-mono text-xs truncate max-w-[150px] block">{param.value}</span>,
      icon: <ChevronRight className="w-3 h-3 text-muted-foreground" />,
    });
  });
  if (params.length > 5) {
    entries.push({
      label: '',
      value: <span className="text-xs text-muted-foreground">...and {params.length - 5} more</span>,
    });
  }
  return entries;
}

function buildUrlDetails(payload: string): DetailEntry[] {
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

function buildWifiSecurityBadge(sec: string): { badge: React.ReactNode; note: string } {
  if (sec.includes('WPA3')) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          WPA3 (Strongest)
        </span>
      ),
      note: 'AES-256 encryption, latest standard',
    };
  }
  if (sec.includes('WPA2')) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
          WPA2 (Strong)
        </span>
      ),
      note: 'AES encryption, widely compatible',
    };
  }
  if (sec.includes('WPA')) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          WPA (Moderate)
        </span>
      ),
      note: 'TKIP encryption, upgrade recommended',
    };
  }
  if (sec.includes('WEP')) {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          WEP (Weak)
        </span>
      ),
      note: '⚠️ Deprecated, easily cracked',
    };
  }
  if (sec === 'NOPASS' || sec === 'OPEN' || sec === '') {
    return {
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
          Open (No Security)
        </span>
      ),
      note: '⚠️ No encryption, avoid for sensitive data',
    };
  }
  return { badge: null, note: '' };
}

function buildWifiDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const wifiData = parseWifiPayload(payload);

  if (wifiData.ssid) {
    details.push({
      label: 'Network Name (SSID)',
      value: <span className="font-mono text-xs font-medium">{wifiData.ssid}</span>,
      icon: <Wifi className="w-3 h-3" />,
    });
  }

  if (wifiData.security) {
    const sec = String(wifiData.security).toUpperCase();
    const { badge: securityBadge, note: securityNote } = buildWifiSecurityBadge(sec);

    details.push({
      label: 'Security Type',
      value: securityBadge ?? <span className="font-mono text-xs">{wifiData.security}</span>,
      icon: <Shield className="w-3 h-3" />,
    });

    if (securityNote) {
      details.push({
        label: 'Security Note',
        value: <span className="text-xs text-muted-foreground">{securityNote}</span>,
        icon: <Info className="w-3 h-3" />,
      });
    }
  }

  if (wifiData.password) {
    const pwd = String(wifiData.password);
    details.push({
      label: 'Password',
      value: (
        <span className="font-mono text-xs">
          {'•'.repeat(Math.min(pwd.length, 12))}
          <span className="text-muted-foreground ml-1">({pwd.length} chars)</span>
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }

  details.push({
    label: 'Hidden Network',
    value:
      wifiData.hidden === 'true' ? (
        <span className="text-amber-600 dark:text-amber-400">Yes (won't appear in scan)</span>
      ) : (
        <span className="text-green-600 dark:text-green-400">No (visible)</span>
      ),
    icon: <Eye className="w-3 h-3" />,
  });

  if (wifiData.eapMethod) {
    details.push({
      label: 'EAP Method',
      value: <span className="font-mono text-xs">{wifiData.eapMethod}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (wifiData.identity) {
    details.push({
      label: 'Identity',
      value: <span className="font-mono text-xs">{wifiData.identity}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (wifiData.phase2) {
    details.push({
      label: 'Phase 2',
      value: <span className="font-mono text-xs">{wifiData.phase2}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  return details;
}

function appendVCardPhoneEntries(details: DetailEntry[], phones: string[]): void {
  phones.forEach((phone) => {
    const [type, number] = phone.includes(':') ? phone.split(': ') : ['Phone', phone];
    details.push({
      label: type,
      value: (
        <a
          href={`tel:${number.replaceAll(/[^+\d]/g, '')}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  });
}

function appendVCardEmailEntries(details: DetailEntry[], emails: string[]): void {
  emails.forEach((email) => {
    const [type, address] = email.includes(':') ? email.split(': ') : ['Email', email];
    details.push({
      label: type,
      value: (
        <a href={`mailto:${address}`} className="font-mono text-xs text-primary hover:underline">
          {address}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  });
}

function appendVCardAddressEntries(details: DetailEntry[], addresses: string[]): void {
  addresses.forEach((addr) => {
    details.push({
      label: 'Address',
      value: <span className="text-xs">{addr}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  });
}

function appendVCardExtras(
  details: DetailEntry[],
  vcardData: ReturnType<typeof parseVCardPayload>
): void {
  if (vcardData.birthday) {
    details.push({
      label: 'Birthday',
      value: vcardData.birthday,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.url) {
    details.push({
      label: 'Website',
      value: (
        <a
          href={String(vcardData.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {String(vcardData.url)}
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  if (vcardData.note) {
    details.push({
      label: 'Notes',
      value: (
        <span className="text-xs">
          {String(vcardData.note).slice(0, 100)}
          {String(vcardData.note).length > 100 ? '...' : ''}
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.hasPhoto === 'true') {
    details.push({
      label: 'Photo',
      value: <span className="text-green-600 dark:text-green-400">Embedded</span>,
      icon: <ImageIcon className="w-3 h-3" />,
    });
  }
}

function buildVCardDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const vcardData = parseVCardPayload(payload);

  if (vcardData.version) {
    details.push({
      label: 'vCard Version',
      value: <span className="font-mono text-xs">v{vcardData.version}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.fullName) {
    details.push({
      label: 'Full Name',
      value: <span className="font-medium">{vcardData.fullName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.organization) {
    details.push({
      label: 'Organization',
      value: vcardData.organization,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.title) {
    details.push({
      label: 'Title',
      value: vcardData.title,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  const phones = vcardData.phones as string[];
  if (phones && phones.length > 0) appendVCardPhoneEntries(details, phones);

  const emails = vcardData.emails as string[];
  if (emails && emails.length > 0) appendVCardEmailEntries(details, emails);

  const addresses = vcardData.addresses as string[];
  if (addresses && addresses.length > 0) appendVCardAddressEntries(details, addresses);

  appendVCardExtras(details, vcardData);
  return details;
}

function buildMeCardDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const mecardData = parseMeCardPayload(payload);

  if (mecardData.name) {
    details.push({
      label: 'Name',
      value: <span className="font-medium">{mecardData.name}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.organization) {
    details.push({
      label: 'Organization',
      value: mecardData.organization,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.phone) {
    details.push({
      label: 'Phone',
      value: (
        <a
          href={`tel:${String(mecardData.phone).replaceAll(/[^+\d]/g, '')}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {mecardData.phone}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }
  if (mecardData.email) {
    details.push({
      label: 'Email',
      value: (
        <a
          href={`mailto:${mecardData.email}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {mecardData.email}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }
  if (mecardData.address) {
    details.push({
      label: 'Address',
      value: <span className="text-xs">{mecardData.address}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (mecardData.birthday) {
    details.push({
      label: 'Birthday',
      value: mecardData.birthday,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.url) {
    details.push({
      label: 'Website',
      value: (
        <a
          href={String(mecardData.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {mecardData.url}
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  if (mecardData.note) {
    details.push({
      label: 'Notes',
      value: <span className="text-xs">{mecardData.note}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}

function buildEmailDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const emailData = parseEmailPayload(payload);

  if (emailData.provider) {
    const providerColors: Record<string, string> = {
      Gmail: 'bg-red-500/10 text-red-600 dark:text-red-400',
      'Microsoft Outlook': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'Yahoo Mail': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      'Apple iCloud': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      ProtonMail: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };
    const colorClass = providerColors[String(emailData.provider)] || 'bg-muted text-foreground';
    details.push({
      label: 'Email Provider',
      value: (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {emailData.provider}
        </span>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }

  if (emailData.to) {
    details.push({
      label: 'Recipient',
      value: (
        <a
          href={`mailto:${emailData.to}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {emailData.to}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }

  if (emailData.domain) {
    details.push({
      label: 'Domain',
      value: <span className="font-mono text-xs">{emailData.domain}</span>,
      icon: <Globe className="w-3 h-3" />,
    });
  }

  if (emailData.subject) {
    details.push({
      label: 'Subject',
      value: <span className="text-xs font-medium">{emailData.subject}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (emailData.body) {
    details.push({
      label: 'Body Preview',
      value: (
        <span className="text-xs text-muted-foreground">
          {String(emailData.body).slice(0, 80)}
          {String(emailData.body).length > 80 ? '...' : ''}
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (emailData.cc) {
    details.push({
      label: 'CC',
      value: <span className="font-mono text-xs">{emailData.cc}</span>,
      icon: <Mail className="w-3 h-3" />,
    });
  }
  if (emailData.bcc) {
    details.push({
      label: 'BCC',
      value: <span className="font-mono text-xs">{emailData.bcc}</span>,
      icon: <Mail className="w-3 h-3" />,
    });
  }
  return details;
}

function buildTelDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const telData = parseTelPayload(payload);

  if (telData.country && telData.countryFlag) {
    details.push({
      label: 'Country',
      value: (
        <span className="flex items-center gap-1">
          <span className="text-lg">{telData.countryFlag}</span>
          <span>{telData.country}</span>
        </span>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }

  if (telData.countryCode) {
    details.push({
      label: 'Country Code',
      value: <span className="font-mono text-xs font-medium">{telData.countryCode}</span>,
      icon: <Phone className="w-3 h-3" />,
    });
  }

  if (telData.number) {
    details.push({
      label: 'Phone Number',
      value: (
        <a
          href={`tel:${telData.number}`}
          className="font-mono text-sm text-primary hover:underline font-medium"
        >
          {telData.formatted || telData.number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }

  details.push({
    label: 'Action',
    value: (
      <a
        href={`tel:${telData.number}`}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <Phone className="w-3 h-3" /> Tap to call
      </a>
    ),
    icon: <ChevronRight className="w-3 h-3" />,
  });
  return details;
}

function buildSmsDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const smsData = parseSmsPayload(payload);

  if (smsData.number) {
    details.push({
      label: 'Recipient',
      value: (
        <a
          href={`tel:${String(smsData.number).replaceAll(/[^+\d]/g, '')}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {smsData.number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }

  if (smsData.body) {
    details.push({
      label: 'Message',
      value: <span className="text-xs">{smsData.body}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (smsData.charCount) {
    details.push({
      label: 'Character Count',
      value: `${smsData.charCount} characters`,
      icon: <Type className="w-3 h-3" />,
    });
  }

  if (smsData.segmentCount) {
    details.push({
      label: 'SMS Segments',
      value: (
        <span
          className={Number(smsData.segmentCount) > 1 ? 'text-amber-600 dark:text-amber-400' : ''}
        >
          {smsData.segmentCount} segment(s)
          {Number(smsData.segmentCount) > 1 && ' (may cost more)'}
        </span>
      ),
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }
  return details;
}

function buildGeoDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const geoData = parseGeoPayload(payload);

  if (geoData.latitude !== null && geoData.longitude !== null) {
    details.push({
      label: 'Latitude',
      value: (
        <span className="font-mono text-xs">
          {Number(geoData.latitude).toFixed(6)}° {geoData.latHemisphere}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
    details.push({
      label: 'Longitude',
      value: (
        <span className="font-mono text-xs">
          {Number(geoData.longitude).toFixed(6)}° {geoData.lonHemisphere}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.latDms && geoData.lonDms) {
    details.push({
      label: 'DMS Format',
      value: (
        <span className="font-mono text-xs">
          {geoData.latDms}, {geoData.lonDms}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.altitude !== null) {
    details.push({
      label: 'Altitude',
      value: `${geoData.altitude}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.uncertainty !== null) {
    details.push({
      label: 'Uncertainty',
      value: `±${geoData.uncertainty}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.googleMapsUrl) {
    details.push({
      label: 'Google Maps',
      value: (
        <a
          href={String(geoData.googleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in Google Maps <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.appleMapsUrl) {
    details.push({
      label: 'Apple Maps',
      value: (
        <a
          href={String(geoData.appleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in Apple Maps <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.osmUrl) {
    details.push({
      label: 'OpenStreetMap',
      value: (
        <a
          href={String(geoData.osmUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in OpenStreetMap <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  return details;
}

function buildCryptoDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const cryptoData = parseCryptoPayload(payload);

  if (cryptoData.network) {
    const networkColors: Record<string, string> = {
      Bitcoin: 'bg-orange-500 text-white',
      Ethereum: 'bg-purple-500 text-white',
      Litecoin: 'bg-gray-500 text-white',
      Dogecoin: 'bg-yellow-500 text-black',
    };
    const colorClass = networkColors[String(cryptoData.network)] || 'bg-muted text-foreground';
    details.push({
      label: 'Network',
      value: (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {cryptoData.network}
        </span>
      ),
      icon: <Wallet className="w-3 h-3" />,
    });
  }

  if (cryptoData.addressPreview) {
    details.push({
      label: 'Address',
      value: <span className="font-mono text-xs">{cryptoData.addressPreview}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (cryptoData.address) {
    details.push({
      label: 'Full Address',
      value: (
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] break-all max-w-[150px]">
            {cryptoData.address}
          </span>
          <CopyButton text={String(cryptoData.address)} />
        </div>
      ),
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (cryptoData.amount) {
    details.push({
      label: 'Amount',
      value: (
        <span className="font-mono text-sm font-bold">
          {cryptoData.amount} {cryptoData.network}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (cryptoData.label) {
    details.push({
      label: 'Label',
      value: cryptoData.label,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (cryptoData.message) {
    details.push({
      label: 'Message',
      value: <span className="text-xs">{cryptoData.message}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (cryptoData.explorerUrl) {
    details.push({
      label: 'Block Explorer',
      value: (
        <a
          href={String(cryptoData.explorerUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View on blockchain <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  return details;
}

function buildEpcSepaDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const epcData = parseEpcSepaPayload(payload);

  details.push({
    label: 'Payment Standard',
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
        EPC/SEPA Credit Transfer
      </span>
    ),
    icon: <CreditCard className="w-3 h-3" />,
  });

  if (epcData.serviceTag) {
    details.push({
      label: 'Service Tag',
      value: <span className="font-mono text-xs">{epcData.serviceTag}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (epcData.version) {
    details.push({
      label: 'Version',
      value: <span className="font-mono text-xs">{epcData.version}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (epcData.beneficiaryName) {
    details.push({
      label: 'Beneficiary',
      value: <span className="font-medium">{epcData.beneficiaryName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (epcData.iban) {
    details.push({
      label: 'IBAN',
      value: (
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs">{epcData.iban}</span>
          <CopyButton text={String(epcData.iban).replaceAll(/\s/g, '')} />
        </div>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.bic) {
    details.push({
      label: 'BIC/SWIFT',
      value: <span className="font-mono text-xs">{epcData.bic}</span>,
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.amount) {
    details.push({
      label: 'Amount',
      value: (
        <span className="font-mono text-sm font-bold">
          {epcData.currency || 'EUR'} {epcData.amount}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.referenceType) {
    details.push({
      label: 'Reference Type',
      value: <span className="font-mono text-xs">{epcData.referenceType}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }
  if (epcData.reference) {
    details.push({
      label: 'Reference',
      value: <span className="font-mono text-xs">{epcData.reference}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (epcData.remittanceInfo) {
    details.push({
      label: 'Remittance Info',
      value: <span className="text-xs">{epcData.remittanceInfo}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}

function buildUpiDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const upiData = parseUpiPayload(payload);

  details.push({
    label: 'Payment Standard',
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
        UPI (India)
      </span>
    ),
    icon: <Smartphone className="w-3 h-3" />,
  });

  if (upiData.vpa) {
    details.push({
      label: 'UPI ID (VPA)',
      value: <span className="font-mono text-xs font-medium">{upiData.vpa}</span>,
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (upiData.payeeName) {
    details.push({
      label: 'Payee Name',
      value: <span className="font-medium">{upiData.payeeName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (upiData.amount) {
    details.push({
      label: 'Amount',
      value: (
        <span className="font-mono text-sm font-bold">
          {upiData.currency || 'INR'} {upiData.amount}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (upiData.transactionRef) {
    details.push({
      label: 'Transaction Ref',
      value: <span className="font-mono text-xs">{upiData.transactionRef}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (upiData.transactionNote) {
    details.push({
      label: 'Note',
      value: <span className="text-xs">{upiData.transactionNote}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (upiData.merchantCode) {
    details.push({
      label: 'Merchant Code',
      value: <span className="font-mono text-xs">{upiData.merchantCode}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  return details;
}

function buildEmvQrDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push({
    label: 'Payment Standard',
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
        EMVCo QR
      </span>
    ),
    icon: <CreditCard className="w-3 h-3" />,
  });
  details.push({
    label: 'Format',
    value: 'Merchant-Presented Mode',
    icon: <Settings className="w-3 h-3" />,
  });
  details.push(...buildPlainTextDetails(payload));
  return details;
}

function buildSwissQrBillDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  details.push({
    label: 'Payment Standard',
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
        Swiss QR-bill
      </span>
    ),
    icon: <CreditCard className="w-3 h-3" />,
  });
  details.push({
    label: 'Country',
    value: (
      <span className="flex items-center gap-1">
        <span className="text-lg">🇨🇭</span> Switzerland
      </span>
    ),
    icon: <Globe className="w-3 h-3" />,
  });
  details.push(...buildPlainTextDetails(payload));
  return details;
}

function buildCalendarEventDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const calData = parseCalendarPayload(payload);

  if (calData.summary) {
    details.push({
      label: 'Event',
      value: <span className="font-medium">{calData.summary}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.isAllDay) {
    details.push({
      label: 'Type',
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
          All-Day Event
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.startFormatted) {
    details.push({
      label: 'Start',
      value: <span className="text-sm">{calData.startFormatted}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.endFormatted) {
    details.push({
      label: 'End',
      value: <span className="text-sm">{calData.endFormatted}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.duration) {
    details.push({
      label: 'Duration',
      value: <span className="font-mono text-xs">{calData.duration}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.timezone) {
    details.push({
      label: 'Timezone',
      value: <span className="font-mono text-xs">{calData.timezone}</span>,
      icon: <Globe className="w-3 h-3" />,
    });
  }

  if (calData.location) {
    details.push({
      label: 'Location',
      value: <span className="text-xs">{calData.location}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (calData.description) {
    const desc = String(calData.description);
    details.push({
      label: 'Description',
      value: (
        <span className="text-xs text-muted-foreground">
          {desc.slice(0, 100)}
          {desc.length > 100 ? '...' : ''}
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.recurrenceFormatted) {
    details.push({
      label: 'Recurrence',
      value: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {calData.recurrenceFormatted}
        </span>
      ),
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (calData.organizer) {
    details.push({
      label: 'Organizer',
      value: <span className="text-xs">{calData.organizer}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (calData.attendeesCount) {
    details.push({
      label: 'Attendees',
      value: `${calData.attendeesCount} invited`,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}

function buildOtpAuthDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const otpData = parseOtpAuthPayload(payload);

  if (otpData.type) {
    details.push({
      label: 'Type',
      value: (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            otpData.type === 'TOTP'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}
        >
          {otpData.type === 'TOTP' ? 'Time-based OTP' : 'Counter-based OTP'}
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }

  if (otpData.issuer) {
    details.push({
      label: 'Issuer',
      value: <span className="font-medium">{otpData.issuer}</span>,
      icon: <Shield className="w-3 h-3" />,
    });
  }

  if (otpData.account) {
    details.push({
      label: 'Account',
      value: <span className="font-mono text-xs">{otpData.account}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (otpData.algorithm) {
    details.push({
      label: 'Algorithm',
      value: (
        <div className="text-right">
          <span className="font-mono text-xs">{otpData.algorithm}</span>
          {otpData.algorithmNote && (
            <div className="text-[10px] text-muted-foreground">{otpData.algorithmNote}</div>
          )}
        </div>
      ),
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (otpData.digits) {
    details.push({
      label: 'Code Length',
      value: `${otpData.digits} digits`,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  appendOtpTimingEntries(details, otpData);
  return details;
}

function appendOtpTimingEntries(
  details: DetailEntry[],
  otpData: ReturnType<typeof parseOtpAuthPayload>
): void {
  if (otpData.period && otpData.type === 'TOTP') {
    details.push({
      label: 'Refresh Period',
      value: `${otpData.period} seconds`,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (otpData.counter && otpData.type === 'HOTP') {
    details.push({
      label: 'Counter',
      value: <span className="font-mono text-xs">{otpData.counter}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }
  if (otpData.hasSecret) {
    details.push({
      label: 'Secret',
      value: (
        <span
          className={
            otpData.hasSecret === 'Missing'
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }
        >
          {otpData.hasSecret}
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }
}

function buildDefaultDetails(payload: string): DetailEntry[] {
  const details = buildPlainTextDetails(payload);

  if (payload.length > 0) {
    const preview = payload.length > 200 ? `${payload.slice(0, 200)}...` : payload;
    details.push({
      label: 'Content Preview',
      value: <span className="text-xs font-mono break-all">{preview}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}

// ---------------------------------------------------------------------------
// Detail Builder Registry
// ---------------------------------------------------------------------------
const DETAIL_BUILDERS: Record<string, (payload: string) => DetailEntry[]> = {
  url: buildUrlDetails,
  wifi: buildWifiDetails,
  vcard: buildVCardDetails,
  mecard: buildMeCardDetails,
  email: buildEmailDetails,
  tel: buildTelDetails,
  sms: buildSmsDetails,
  geo: buildGeoDetails,
  crypto_bitcoin: buildCryptoDetails,
  crypto_ethereum: buildCryptoDetails,
  crypto_other: buildCryptoDetails,
  epc_sepa: buildEpcSepaDetails,
  upi: buildUpiDetails,
  emv_qr: buildEmvQrDetails,
  swiss_qr_bill: buildSwissQrBillDetails,
  calendar_event: buildCalendarEventDetails,
  otp_auth: buildOtpAuthDetails,
};

// ---------------------------------------------------------------------------
// buildContentTypeDetails
// ---------------------------------------------------------------------------
export function buildContentTypeDetails(
  contentType: ContentTypeDetails,
  payload: string
): Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> {
  const builder = DETAIL_BUILDERS[contentType.type];
  const details = builder ? builder(payload) : buildDefaultDetails(payload);

  if (details.length === 0) {
    return buildPlainTextDetails(payload);
  }

  return details;
}
