/**
 * Pure payload parser functions extracted from the Analyze component.
 *
 * Each function was originally wrapped in `useCallback(..., [])` with an empty
 * dependency array, confirming they are pure (no React state / prop references).
 */

// ---------------------------------------------------------------------------
// 1. WiFi payload parser – parses WIFI:T:WPA;S:Name;P:pass;H:true;;
// ---------------------------------------------------------------------------
export function parseWifiPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    ssid: null,
    password: null,
    security: null,
    hidden: null,
    eapMethod: null,
    identity: null,
    anonymousIdentity: null,
    phase2: null,
  };

  if (!payload.toUpperCase().startsWith('WIFI:')) return result;

  // Remove WIFI: prefix and trailing ;;
  const content = payload.slice(5).replace(/;;\s*$/, '');
  const parts = content.split(';');

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).toUpperCase();
    const value = part.slice(colonIdx + 1);

    switch (key) {
      case 'S':
        result.ssid = value;
        break;
      case 'P':
        result.password = value;
        break;
      case 'T':
        result.security = value.toUpperCase();
        break;
      case 'H':
        result.hidden = value.toLowerCase() === 'true' ? 'true' : 'false';
        break;
      case 'E':
        result.eapMethod = value;
        break;
      case 'I':
        result.identity = value;
        break;
      case 'A':
        result.anonymousIdentity = value;
        break;
      case 'PH2':
        result.phase2 = value;
        break;
    }
  }

  return result;
}
