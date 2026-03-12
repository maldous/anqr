import { FileText, Globe, Image as ImageIcon } from 'lucide-react';
import { parseVCardPayload } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function appendVCardExtras(
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
