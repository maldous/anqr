import { generateGS1DigitalLink } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeGS1DigitalLink(payload: PayloadData): string {
  const gs1 = payload.gs1;
  const gtin = gs1.gtin || payload.text;
  if (gtin) {
    return generateGS1DigitalLink({
      gtin: gtin.replaceAll(/[^\d]/g, ''),
      baseUrl: gs1.resolver ? `https://${gs1.resolver}` : undefined,
      ser: gs1.serial || undefined,
      lot: gs1.batch || undefined,
      expiry: gs1.expiry?.replaceAll('-', '') || undefined,
    });
  }
  return '';
}
