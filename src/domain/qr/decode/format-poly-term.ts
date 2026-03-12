import type { GFField } from './gf-field.types';
import { formatPolyTermSign } from './format-poly-term-sign';
import { formatPolyCoefficientValue } from './format-poly-coefficient-value';
import { formatPolyDegreeLabel } from './format-poly-degree-label';

export function formatPolyTerm(
  field: GFField,
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
