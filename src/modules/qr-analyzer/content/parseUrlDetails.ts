import {ContentTypeDetails, url} from './shared';
export function parseUrlDetails(url: string): Partial<ContentTypeDetails> {
  try {
    const urlObj = new URL(url);
    const result: Partial<ContentTypeDetails> = {};

    // Check for UTM parameters
    const utmSource = urlObj.searchParams.get('utm_source');
    const utmMedium = urlObj.searchParams.get('utm_medium');
    const utmCampaign = urlObj.searchParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
      result.hasUtmParams = true;
      result.utmSource = utmSource || undefined;
      result.utmMedium = utmMedium || undefined;
      result.utmCampaign = utmCampaign || undefined;
    }

    return result;
  } catch {
    return {};
  }
}

