import type { TelHelper } from './types';

/** Generate telephone URI */
export function generateTel(params: TelHelper): string {
  return `tel:${params.number.replaceAll(/\s+/g, '')}`;
}
