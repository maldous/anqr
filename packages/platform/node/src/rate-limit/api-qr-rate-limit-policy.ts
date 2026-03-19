export const API_QR_RATE_LIMIT_POLICY = {
  route: "/api/contract/qr",
  requestsPerMinute: 60,
  perimeterOwner: "netlify",
  fallbackOwner: "@anqr/platform-node/rate-limit",
} as const;
