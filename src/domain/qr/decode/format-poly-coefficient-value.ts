import type { GFField } from './gf-field.types';

export function formatPolyCoefficientValue(field: GFField, coefficient: number): string {
  const alphaPower = field.log(coefficient);
  if (alphaPower === 0) return '1';
  if (alphaPower === 1) return 'a';
  return `a^${alphaPower}`;
}
