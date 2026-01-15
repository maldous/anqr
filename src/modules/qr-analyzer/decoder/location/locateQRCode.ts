import {FinderPattern, FinderPatternGroup, QRLocation, code, location, patterns, t} from '../shared';
/**
 * Locate the QR code from 3 finder patterns
 * Returns the corner locations or null if patterns can't be identified
 */
export function locateQRCode(patterns: FinderPattern[]): { location: QRLocation; patterns: FinderPatternGroup }

