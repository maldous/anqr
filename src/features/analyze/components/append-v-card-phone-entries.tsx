import { Phone } from 'lucide-react';
import type { DetailEntry } from './detail-entry';

export function appendVCardPhoneEntries(details: DetailEntry[], phones: string[]): void {
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
