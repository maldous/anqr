import type { PayloadData } from './payload-data';

export function serializeCrypto(payload: PayloadData): string {
  const c = payload.crypto;
  const payment = `${c.type}:${c.address}`;
  const params = new URLSearchParams();
  if (c.amount) params.set('amount', c.amount.toString());
  if (c.label) params.set('label', c.label);
  const paramStr = params.toString();
  return paramStr ? `${payment}?${paramStr}` : payment;
}
