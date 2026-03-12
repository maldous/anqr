import type { EmailHelper } from './types';

/** Generate email (mailto) URI */
export function generateEmail(params: EmailHelper): string {
  let mailto = `mailto:${params.to}`;
  const queryParams = new URLSearchParams();

  if (params.subject) queryParams.set('subject', params.subject);
  if (params.body) queryParams.set('body', params.body);

  const paramStr = queryParams.toString();
  if (paramStr) mailto += `?${paramStr}`;

  return mailto;
}
