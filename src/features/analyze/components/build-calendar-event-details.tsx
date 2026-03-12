import {
  FileText,
  Globe,
  MapPin,
  Settings,
  Type,
} from 'lucide-react';
import { parseCalendarPayload } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function buildCalendarEventDetails(payload: string): DetailEntry[] {
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
