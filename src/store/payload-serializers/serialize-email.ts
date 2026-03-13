import type { PayloadData } from './payload-data';

export function serializeEmail(payload: PayloadData): string {
  const mailto = `mailto:${payload.email.to}`;
  const params = new URLSearchParams();
  if (payload.email.subject) params.set('subject', payload.email.subject);
  if (payload.email.body) params.set('body', payload.email.body);
  const paramStr = params.toString();
  return paramStr ? `${mailto}?${paramStr}` : mailto;
}
