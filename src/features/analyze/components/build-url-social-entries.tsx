import { Globe, Phone, Type } from 'lucide-react';
import type { DetailEntry } from './detail-entry';
import { detectSocialPlatform } from './detect-social-platform';

export function buildUrlSocialEntries(
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
