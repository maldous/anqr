import { payloadCategory } from './payload-category';

export const payloadCategoryLocationNetwork = payloadCategory(
  'payload.locationNetwork',
  'advanced',
  [
    ['geo', 'payload.geo'],
    ['wifi', 'payload.wifiNetwork'],
  ]
);
