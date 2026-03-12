import React from 'react';

// ---------------------------------------------------------------------------
// Social Platform Matcher Registry
// ---------------------------------------------------------------------------
export type SocialPlatformResult = {
  name: string;
  badge: React.ReactNode;
  extractedInfo?: React.ReactNode;
};
