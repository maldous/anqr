import { MapPin } from 'lucide-react';
import type { DetailEntry } from './detail-entry';

export function appendVCardAddressEntries(details: DetailEntry[], addresses: string[]): void {
  addresses.forEach((addr) => {
    details.push({
      label: 'Address',
      value: <span className="text-xs">{addr}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  });
}
