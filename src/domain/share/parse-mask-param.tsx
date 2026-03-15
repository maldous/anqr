import { parseIntParam } from './parse-int-param';

export function parseMaskParam(params: URLSearchParams): number | 'auto' | undefined {
  if (!params.has('mask')) return undefined;
  return params.get('mask') === 'auto' ? 'auto' : parseIntParam(params.get('mask'));
}
