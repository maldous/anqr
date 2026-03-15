import type { ContentTypeDetails } from '@/modules/qr-analyzer';
import { buildDefaultDetails } from './build-default-details';
import { buildPlainTextDetails } from './build-plain-text-details';
import { DETAIL_BUILDERS } from './detail-builders';

// ---------------------------------------------------------------------------
// buildContentTypeDetails
// ---------------------------------------------------------------------------
export function buildContentTypeDetails(
  contentType: ContentTypeDetails,
  payload: string
): Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> {
  const builder = DETAIL_BUILDERS[contentType.type];
  const details = builder ? builder(payload) : buildDefaultDetails(payload);

  if (details.length === 0) {
    return buildPlainTextDetails(payload);
  }

  return details;
}
