import { AbstractGenericGF } from './abstract-generic-gf';

export function formatPolyCoefficientValue(field: AbstractGenericGF, coefficient: number): string {
  const alphaPower = field.log(coefficient);
  if (alphaPower === 0) return '1';
  if (alphaPower === 1) return 'a';
  return `a^${alphaPower}`;
}
