import type { BizCardParams } from '../../modules/payload-generators/types';

/** Generate BizCard format (older format, simple) */
export function generateBizCard(params: BizCardParams): string {
  const lines: string[] = ['BIZCARD:'];

  const fields: string[] = [];
  if (params.firstName) fields.push(`N:${params.firstName}`);
  if (params.lastName) fields.push(`X:${params.lastName}`);
  if (params.title) fields.push(`T:${params.title}`);
  if (params.company) fields.push(`C:${params.company}`);
  if (params.phone) fields.push(`B:${params.phone}`);
  if (params.email) fields.push(`E:${params.email}`);
  if (params.address) fields.push(`A:${params.address}`);

  lines.push(...fields, ';');
  return lines.join(';');
}
