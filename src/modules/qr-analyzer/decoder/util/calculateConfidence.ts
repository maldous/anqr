import {score} from '../shared';

export function calculateConfidence(
  hasEcc: boolean,
  hasMask: boolean,
  hasMatrix: boolean,
  hasAdequateQuietZone: boolean
): 'high' | 'medium' | 'low' {
  const score = (hasEcc ? 1 : 0) + (hasMask ? 1 : 0) + (hasMatrix ? 1 : 0) + (hasAdequateQuietZone ? 1 : 0);
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

