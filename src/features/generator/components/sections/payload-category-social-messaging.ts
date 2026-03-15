import { payloadCategory } from './payload-category';

export const payloadCategorySocialMessaging = payloadCategory(
  'payload.socialMessaging',
  'advanced',
  [
    ['social_profile', 'payload.socialProfile'],
    ['messaging_link', 'payload.messagingLink'],
  ]
);
