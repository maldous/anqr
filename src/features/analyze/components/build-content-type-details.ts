import type { ContentTypeDetails } from '@/modules/qr-analyzer';
import { DETAIL_BUILDERS, buildDefaultDetails, buildPlainTextDetails } from './content-type-renderers._internal';

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
