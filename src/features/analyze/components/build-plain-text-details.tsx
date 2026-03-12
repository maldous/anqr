import { Binary, Settings, Type } from 'lucide-react';
import { analyzePlainText } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function buildPlainTextDetails(payload: string): DetailEntry[] {
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
