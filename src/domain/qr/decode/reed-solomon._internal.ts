import { AbstractGenericGF } from './abstract-generic-gf';
export function formatPolyTermSign(coefficient: number, hasExistingTerms: boolean): string {
  if (coefficient < 0) return ' - ';
  if (hasExistingTerms) return ' + ';
  return '';
}

export function formatPolyCoefficientValue(field: AbstractGenericGF, coefficient: number): string {
  const alphaPower = field.log(coefficient);
  if (alphaPower === 0) return '1';
  if (alphaPower === 1) return 'a';
  return `a^${alphaPower}`;
}

export function formatPolyDegreeLabel(degree: number): string {
  if (degree === 0) return '';
  if (degree === 1) return 'x';
  return `x^${degree}`;
}

export function formatPolyTerm(
  field: AbstractGenericGF,
  degree: number,
  coefficient: number,
  hasExistingTerms: boolean
): string {
  let result = formatPolyTermSign(coefficient, hasExistingTerms);
  const absCoefficient = coefficient < 0 ? -coefficient : coefficient;
  if (degree === 0 || absCoefficient !== 1) {
    result += formatPolyCoefficientValue(field, absCoefficient);
  }
  result += formatPolyDegreeLabel(degree);
  return result;
}

