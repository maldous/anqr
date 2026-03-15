import { FileText } from 'lucide-react';
import { buildPlainTextDetails } from './build-plain-text-details';
import type { DetailEntry } from './detail-entry';

export function buildDefaultDetails(payload: string): DetailEntry[] {
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
