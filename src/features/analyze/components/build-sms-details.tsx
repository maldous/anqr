import { MessageSquare, Phone, Type } from 'lucide-react';
import { parseSmsPayload } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function buildSmsDetails(payload: string): DetailEntry[] {
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
