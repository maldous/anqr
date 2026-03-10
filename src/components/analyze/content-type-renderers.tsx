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
// detectSocialPlatform
// ---------------------------------------------------------------------------
export function detectSocialPlatform(
  url: string
): { name: string; badge: React.ReactNode; extractedInfo?: React.ReactNode } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // WhatsApp
    if (
      hostname.includes('wa.me') ||
      hostname.includes('whatsapp.com') ||
      hostname.includes('api.whatsapp.com')
    ) {
      const phoneMatch = pathname.match(/\/(\d+)/);
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
        ) : null,
      };
    }

    // Facebook
    if (
      hostname.includes('facebook.com') ||
      hostname.includes('fb.com') ||
      hostname.includes('fb.me') ||
      hostname.includes('m.facebook.com')
    ) {
      return {
        name: 'Facebook',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
            Facebook
          </span>
        ),
      };
    }

    // Instagram
    if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
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
        extractedInfo: username ? <span className="font-mono text-xs">@{username}</span> : null,
      };
    }

    // Twitter/X
    if (
      hostname.includes('twitter.com') ||
      hostname.includes('x.com') ||
      hostname.includes('t.co')
    ) {
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
        extractedInfo: username ? <span className="font-mono text-xs">@{username}</span> : null,
      };
    }

    // YouTube
    if (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('m.youtube.com')
    ) {
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
        extractedInfo: videoId ? <span className="font-mono text-xs">Video: {videoId}</span> : null,
      };
    }

    // LinkedIn
    if (hostname.includes('linkedin.com') || hostname.includes('lnkd.in')) {
      return {
        name: 'LinkedIn',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-white">
            LinkedIn
          </span>
        ),
      };
    }

    // TikTok
    if (hostname.includes('tiktok.com') || hostname.includes('vm.tiktok.com')) {
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
        ) : null,
      };
    }

    // Telegram
    if (
      hostname.includes('t.me') ||
      hostname.includes('telegram.me') ||
      hostname.includes('telegram.org')
    ) {
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
        ) : null,
      };
    }

    // Discord
    if (
      hostname.includes('discord.gg') ||
      hostname.includes('discord.com') ||
      hostname.includes('discordapp.com')
    ) {
      return {
        name: 'Discord',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
            Discord
          </span>
        ),
      };
    }

    // Snapchat
    if (hostname.includes('snapchat.com') || hostname.includes('snap.com')) {
      return {
        name: 'Snapchat',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
            👻 Snapchat
          </span>
        ),
      };
    }

    // Reddit
    if (hostname.includes('reddit.com') || hostname.includes('redd.it')) {
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
        ) : null,
      };
    }

    // Pinterest
    if (hostname.includes('pinterest.com') || hostname.includes('pin.it')) {
      return {
        name: 'Pinterest',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-700 text-white">
            Pinterest
          </span>
        ),
      };
    }

    // App Store (Apple)
    if (hostname.includes('apps.apple.com') || hostname.includes('itunes.apple.com')) {
      return {
        name: 'App Store',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            App Store
          </span>
        ),
      };
    }

    // Google Play Store
    if (hostname.includes('play.google.com')) {
      return {
        name: 'Google Play',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Google Play
          </span>
        ),
      };
    }

    // Spotify
    if (hostname.includes('spotify.com') || hostname.includes('open.spotify.com')) {
      return {
        name: 'Spotify',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
            ♫ Spotify
          </span>
        ),
      };
    }

    // GitHub
    if (hostname.includes('github.com') || hostname.includes('gist.github.com')) {
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
        ) : null,
      };
    }

    // PayPal
    if (hostname.includes('paypal.com') || hostname.includes('paypal.me')) {
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
          ) : null,
      };
    }

    // Venmo
    if (hostname.includes('venmo.com')) {
      return {
        name: 'Venmo',
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400 text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Venmo
          </span>
        ),
      };
    }

    // Cash App
    if (hostname.includes('cash.app')) {
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
        ) : null,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// buildContentTypeDetails
// ---------------------------------------------------------------------------
export function buildContentTypeDetails(
  contentType: ContentTypeDetails,
  payload: string
): Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> {
  const details: Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = [];

  // Helper to add plain text analysis as fallback
  const addPlainTextAnalysis = () => {
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
  };

  switch (contentType.type) {
    case 'url': {
      const urlData = parseUrlPayload(payload);
      const socialPlatform = detectSocialPlatform(payload);

      // Social platform badge first if detected
      if (socialPlatform) {
        details.push({
          label: 'Platform',
          value: socialPlatform.badge,
          icon: <Globe className="w-3 h-3" />,
        });
        if (socialPlatform.extractedInfo) {
          details.push({
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
      }

      // Domain with security indicator
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

      // Security status
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

      // Protocol
      if (urlData.protocol) {
        details.push({
          label: 'Protocol',
          value: <span className="font-mono text-xs uppercase">{urlData.protocol}</span>,
          icon: <Link className="w-3 h-3" />,
        });
      }

      // Port (if non-standard)
      if (urlData.port) {
        details.push({
          label: 'Port',
          value: <span className="font-mono text-xs">{urlData.port}</span>,
          icon: <Settings className="w-3 h-3" />,
        });
      }

      // Path
      if (urlData.path) {
        details.push({
          label: 'Path',
          value: <span className="font-mono text-xs break-all">{urlData.path}</span>,
          icon: <Link className="w-3 h-3" />,
        });
      }

      // Fragment/Hash
      if (urlData.fragment) {
        details.push({
          label: 'Fragment',
          value: <span className="font-mono text-xs">#{urlData.fragment}</span>,
          icon: <Hash className="w-3 h-3" />,
        });
      }

      // Shortened URL detection
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

      // Query parameters
      const params = urlData.params;
      if (params && params.length > 0) {
        details.push({
          label: 'Query Parameters',
          value: <span className="font-medium">{params.length} parameter(s)</span>,
          icon: <Settings className="w-3 h-3" />,
        });
        // Show first 5 params
        params.slice(0, 5).forEach((param) => {
          details.push({
            label: `  └ ${param.key}`,
            value: (
              <span className="font-mono text-xs truncate max-w-[150px] block">{param.value}</span>
            ),
            icon: <ChevronRight className="w-3 h-3 text-muted-foreground" />,
          });
        });
        if (params.length > 5) {
          details.push({
            label: '',
            value: (
              <span className="text-xs text-muted-foreground">...and {params.length - 5} more</span>
            ),
          });
        }
      }

      // URL length and encoding
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

      // Clickable link
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
      break;
    }

    case 'wifi': {
      const wifiData = parseWifiPayload(payload);

      // SSID
      if (wifiData.ssid) {
        details.push({
          label: 'Network Name (SSID)',
          value: <span className="font-mono text-xs font-medium">{wifiData.ssid}</span>,
          icon: <Wifi className="w-3 h-3" />,
        });
      }

      // Security type with detailed explanation
      if (wifiData.security) {
        const sec = String(wifiData.security).toUpperCase();
        let securityBadge: React.ReactNode;
        let securityNote = '';

        if (sec.includes('WPA3')) {
          securityBadge = (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              WPA3 (Strongest)
            </span>
          );
          securityNote = 'AES-256 encryption, latest standard';
        } else if (sec.includes('WPA2')) {
          securityBadge = (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              WPA2 (Strong)
            </span>
          );
          securityNote = 'AES encryption, widely compatible';
        } else if (sec.includes('WPA')) {
          securityBadge = (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              WPA (Moderate)
            </span>
          );
          securityNote = 'TKIP encryption, upgrade recommended';
        } else if (sec.includes('WEP')) {
          securityBadge = (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
              WEP (Weak)
            </span>
          );
          securityNote = '⚠️ Deprecated, easily cracked';
        } else if (sec === 'NOPASS' || sec === 'OPEN' || sec === '') {
          securityBadge = (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
              Open (No Security)
            </span>
          );
          securityNote = '⚠️ No encryption, avoid for sensitive data';
        } else {
          securityBadge = <span className="font-mono text-xs">{wifiData.security}</span>;
        }

        details.push({
          label: 'Security Type',
          value: securityBadge,
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

      // Password (masked)
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

      // Hidden network
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

      // Enterprise settings
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
      break;
    }

    case 'vcard': {
      const vcardData = parseVCardPayload(payload);

      // vCard version
      if (vcardData.version) {
        details.push({
          label: 'vCard Version',
          value: <span className="font-mono text-xs">v{vcardData.version}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Full name
      if (vcardData.fullName) {
        details.push({
          label: 'Full Name',
          value: <span className="font-medium">{vcardData.fullName}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Organization & Title
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

      // Phone numbers (clickable)
      const phones = vcardData.phones as string[];
      if (phones && phones.length > 0) {
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

      // Email addresses (clickable)
      const emails = vcardData.emails as string[];
      if (emails && emails.length > 0) {
        emails.forEach((email) => {
          const [type, address] = email.includes(':') ? email.split(': ') : ['Email', email];
          details.push({
            label: type,
            value: (
              <a
                href={`mailto:${address}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {address}
              </a>
            ),
            icon: <Mail className="w-3 h-3" />,
          });
        });
      }

      // Addresses
      const addresses = vcardData.addresses as string[];
      if (addresses && addresses.length > 0) {
        addresses.forEach((addr) => {
          details.push({
            label: 'Address',
            value: <span className="text-xs">{addr}</span>,
            icon: <MapPin className="w-3 h-3" />,
          });
        });
      }

      // Birthday
      if (vcardData.birthday) {
        details.push({
          label: 'Birthday',
          value: vcardData.birthday,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // URL
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

      // Note
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

      // Photo indicator
      if (vcardData.hasPhoto === 'true') {
        details.push({
          label: 'Photo',
          value: <span className="text-green-600 dark:text-green-400">Embedded</span>,
          icon: <ImageIcon className="w-3 h-3" />,
        });
      }
      break;
    }

    case 'mecard': {
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
      break;
    }

    case 'email': {
      const emailData = parseEmailPayload(payload);

      // Provider badge
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

      // Recipient
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

      // Domain
      if (emailData.domain) {
        details.push({
          label: 'Domain',
          value: <span className="font-mono text-xs">{emailData.domain}</span>,
          icon: <Globe className="w-3 h-3" />,
        });
      }

      // Subject
      if (emailData.subject) {
        details.push({
          label: 'Subject',
          value: <span className="text-xs font-medium">{emailData.subject}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Body preview
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

      // CC/BCC
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
      break;
    }

    case 'tel': {
      const telData = parseTelPayload(payload);

      // Country with flag
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

      // Country code
      if (telData.countryCode) {
        details.push({
          label: 'Country Code',
          value: <span className="font-mono text-xs font-medium">{telData.countryCode}</span>,
          icon: <Phone className="w-3 h-3" />,
        });
      }

      // Phone number (clickable)
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

      // Call action
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
      break;
    }

    case 'sms': {
      const smsData = parseSmsPayload(payload);

      // Phone number
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

      // Message body
      if (smsData.body) {
        details.push({
          label: 'Message',
          value: <span className="text-xs">{smsData.body}</span>,
          icon: <MessageSquare className="w-3 h-3" />,
        });
      }

      // Character count
      if (smsData.charCount) {
        details.push({
          label: 'Character Count',
          value: `${smsData.charCount} characters`,
          icon: <Type className="w-3 h-3" />,
        });
      }

      // SMS segments
      if (smsData.segmentCount) {
        details.push({
          label: 'SMS Segments',
          value: (
            <span
              className={
                Number(smsData.segmentCount) > 1 ? 'text-amber-600 dark:text-amber-400' : ''
              }
            >
              {smsData.segmentCount} segment(s)
              {Number(smsData.segmentCount) > 1 && ' (may cost more)'}
            </span>
          ),
          icon: <MessageSquare className="w-3 h-3" />,
        });
      }
      break;
    }

    case 'geo': {
      const geoData = parseGeoPayload(payload);

      // Coordinates in decimal
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

      // DMS format
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

      // Altitude
      if (geoData.altitude !== null) {
        details.push({
          label: 'Altitude',
          value: `${geoData.altitude}m`,
          icon: <MapPin className="w-3 h-3" />,
        });
      }

      // Uncertainty
      if (geoData.uncertainty !== null) {
        details.push({
          label: 'Uncertainty',
          value: `±${geoData.uncertainty}m`,
          icon: <MapPin className="w-3 h-3" />,
        });
      }

      // Map links
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
      break;
    }

    case 'crypto_bitcoin':
    case 'crypto_ethereum':
    case 'crypto_other': {
      const cryptoData = parseCryptoPayload(payload);

      // Network badge
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

      // Address preview
      if (cryptoData.addressPreview) {
        details.push({
          label: 'Address',
          value: <span className="font-mono text-xs">{cryptoData.addressPreview}</span>,
          icon: <Hash className="w-3 h-3" />,
        });
      }

      // Full address with copy
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

      // Amount
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

      // Label
      if (cryptoData.label) {
        details.push({
          label: 'Label',
          value: cryptoData.label,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Message
      if (cryptoData.message) {
        details.push({
          label: 'Message',
          value: <span className="text-xs">{cryptoData.message}</span>,
          icon: <MessageSquare className="w-3 h-3" />,
        });
      }

      // Block explorer
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
      break;
    }

    case 'epc_sepa': {
      const epcData = parseEpcSepaPayload(payload);

      // Payment standard badge
      details.push({
        label: 'Payment Standard',
        value: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            EPC/SEPA Credit Transfer
          </span>
        ),
        icon: <CreditCard className="w-3 h-3" />,
      });

      // Service tag & version
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

      // Beneficiary
      if (epcData.beneficiaryName) {
        details.push({
          label: 'Beneficiary',
          value: <span className="font-medium">{epcData.beneficiaryName}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // IBAN (formatted)
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

      // BIC
      if (epcData.bic) {
        details.push({
          label: 'BIC/SWIFT',
          value: <span className="font-mono text-xs">{epcData.bic}</span>,
          icon: <CreditCard className="w-3 h-3" />,
        });
      }

      // Amount & currency
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

      // Reference
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

      // Remittance info
      if (epcData.remittanceInfo) {
        details.push({
          label: 'Remittance Info',
          value: <span className="text-xs">{epcData.remittanceInfo}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }
      break;
    }

    case 'upi': {
      const upiData = parseUpiPayload(payload);

      // Payment standard badge
      details.push({
        label: 'Payment Standard',
        value: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
            UPI (India)
          </span>
        ),
        icon: <Smartphone className="w-3 h-3" />,
      });

      // VPA
      if (upiData.vpa) {
        details.push({
          label: 'UPI ID (VPA)',
          value: <span className="font-mono text-xs font-medium">{upiData.vpa}</span>,
          icon: <CreditCard className="w-3 h-3" />,
        });
      }

      // Payee name
      if (upiData.payeeName) {
        details.push({
          label: 'Payee Name',
          value: <span className="font-medium">{upiData.payeeName}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Amount & currency
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

      // Transaction reference
      if (upiData.transactionRef) {
        details.push({
          label: 'Transaction Ref',
          value: <span className="font-mono text-xs">{upiData.transactionRef}</span>,
          icon: <Hash className="w-3 h-3" />,
        });
      }

      // Transaction note
      if (upiData.transactionNote) {
        details.push({
          label: 'Note',
          value: <span className="text-xs">{upiData.transactionNote}</span>,
          icon: <MessageSquare className="w-3 h-3" />,
        });
      }

      // Merchant code
      if (upiData.merchantCode) {
        details.push({
          label: 'Merchant Code',
          value: <span className="font-mono text-xs">{upiData.merchantCode}</span>,
          icon: <Settings className="w-3 h-3" />,
        });
      }
      break;
    }

    case 'emv_qr': {
      // Payment standard badge
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
      // Add plain text analysis for additional info
      addPlainTextAnalysis();
      break;
    }

    case 'swiss_qr_bill': {
      // Payment standard badge
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
      // Add plain text analysis for additional info
      addPlainTextAnalysis();
      break;
    }

    case 'calendar_event': {
      const calData = parseCalendarPayload(payload);

      // Event summary
      if (calData.summary) {
        details.push({
          label: 'Event',
          value: <span className="font-medium">{calData.summary}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // All-day indicator
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

      // Start date/time
      if (calData.startFormatted) {
        details.push({
          label: 'Start',
          value: <span className="text-sm">{calData.startFormatted}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // End date/time
      if (calData.endFormatted) {
        details.push({
          label: 'End',
          value: <span className="text-sm">{calData.endFormatted}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Duration
      if (calData.duration) {
        details.push({
          label: 'Duration',
          value: <span className="font-mono text-xs">{calData.duration}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Timezone
      if (calData.timezone) {
        details.push({
          label: 'Timezone',
          value: <span className="font-mono text-xs">{calData.timezone}</span>,
          icon: <Globe className="w-3 h-3" />,
        });
      }

      // Location
      if (calData.location) {
        details.push({
          label: 'Location',
          value: <span className="text-xs">{calData.location}</span>,
          icon: <MapPin className="w-3 h-3" />,
        });
      }

      // Description
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

      // Recurrence
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

      // Organizer
      if (calData.organizer) {
        details.push({
          label: 'Organizer',
          value: <span className="text-xs">{calData.organizer}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Attendees
      if (calData.attendeesCount) {
        details.push({
          label: 'Attendees',
          value: `${calData.attendeesCount} invited`,
          icon: <FileText className="w-3 h-3" />,
        });
      }
      break;
    }

    case 'otp_auth': {
      const otpData = parseOtpAuthPayload(payload);

      // Type badge
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

      // Issuer
      if (otpData.issuer) {
        details.push({
          label: 'Issuer',
          value: <span className="font-medium">{otpData.issuer}</span>,
          icon: <Shield className="w-3 h-3" />,
        });
      }

      // Account
      if (otpData.account) {
        details.push({
          label: 'Account',
          value: <span className="font-mono text-xs">{otpData.account}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }

      // Algorithm
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

      // Digits
      if (otpData.digits) {
        details.push({
          label: 'Code Length',
          value: `${otpData.digits} digits`,
          icon: <Hash className="w-3 h-3" />,
        });
      }

      // Period (for TOTP)
      if (otpData.period && otpData.type === 'TOTP') {
        details.push({
          label: 'Refresh Period',
          value: `${otpData.period} seconds`,
          icon: <Settings className="w-3 h-3" />,
        });
      }

      // Counter (for HOTP)
      if (otpData.counter && otpData.type === 'HOTP') {
        details.push({
          label: 'Counter',
          value: <span className="font-mono text-xs">{otpData.counter}</span>,
          icon: <Hash className="w-3 h-3" />,
        });
      }

      // Secret status
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
      break;
    }
    default: {
      // For plain text and unknown types, always provide comprehensive analysis
      addPlainTextAnalysis();

      // Content preview
      if (payload.length > 0) {
        const preview = payload.length > 200 ? `${payload.slice(0, 200)}...` : payload;
        details.push({
          label: 'Content Preview',
          value: <span className="text-xs font-mono break-all">{preview}</span>,
          icon: <FileText className="w-3 h-3" />,
        });
      }
      break;
    }
  }

  // Ensure we always have at least some details
  if (details.length === 0) {
    addPlainTextAnalysis();
  }

  return details;
}
