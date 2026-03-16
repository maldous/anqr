// ---------------------------------------------------------------------------
// 6. SMS parser
// ---------------------------------------------------------------------------
export function parseSmsPayload(payload: string): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {
    number: null,
    body: null,
    charCount: null,
    segmentCount: null,
  };

  let content = payload;
  if (payload.toLowerCase().startsWith("sms:")) content = payload.slice(4);
  else if (payload.toLowerCase().startsWith("smsto:")) content = payload.slice(6);

  const [number, queryPart] = content.split("?");
  result.number = number;

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    result.body = params.get("body");
    if (result.body) {
      result.charCount = result.body.length;
      // SMS segments: 160 chars for GSM-7, 70 for Unicode
      const hasUnicode = /\P{ASCII}/u.test(result.body);
      const charsPerSegment = hasUnicode ? 70 : 160;
      result.segmentCount = Math.ceil(result.body.length / charsPerSegment);
    }
  }

  return result;
}
