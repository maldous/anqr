import {
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { parseMeCardPayload } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function buildMeCardDetails(payload: string): DetailEntry[] {
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
