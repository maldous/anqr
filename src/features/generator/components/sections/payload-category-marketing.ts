import { payloadCategory } from './payload-category';

export const payloadCategoryMarketing = payloadCategory('payload.marketing', 'professional', [
  ['utm_link', 'payload.utmLink'],
  ['short_link', 'payload.shortLink'],
]);
