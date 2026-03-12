import type { RGBA } from '../../../modules/core/types';

export const BLACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };

// Named colors lookup
const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  transparent: '#00000000',
};

export { NAMED_COLORS };
