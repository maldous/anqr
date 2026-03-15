import { payloadCategory } from './payload-category';

export const payloadCategoryCore = payloadCategory('payload.core', 'basic', [
  ['plain_text', 'payload.plainText'],
  ['url', 'payload.url'],
]);
