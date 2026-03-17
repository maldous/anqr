// ---------------------------------------------------------------------------
// 13. URL parser with comprehensive breakdown
// ---------------------------------------------------------------------------
export interface UrlParseResult {
  full: string;
  protocol: string | null;
  hostname: string | null;
  port: string | null;
  path: string | null;
  queryString: string | null;
  fragment: string | null;
  isSecure: string | null;
  isShortened: string | null;
  shortenerService: string | null;
  params: Array<{ key: string; value: string }>;
  urlLength: string;
  hasPercentEncoding: string | null;
}
