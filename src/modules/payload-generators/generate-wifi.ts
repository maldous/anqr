import type { WifiHelper } from './types';

/** Generate WiFi configuration string */
export function generateWifi(params: WifiHelper): string {
  const escapeWifi = (s: string) => s.replaceAll(/[\\";,:]/g, String.raw`\$&`);

  let wifi = 'WIFI:';
  wifi += `T:${params.auth};`;
  wifi += `S:${escapeWifi(params.ssid)};`;

  if (params.password && params.auth !== 'nopass') {
    wifi += `P:${escapeWifi(params.password)};`;
  }

  if (params.hidden) {
    wifi += 'H:true;';
  }

  if (params.eapIdentity) wifi += `I:${escapeWifi(params.eapIdentity)};`;
  if (params.eapAnonymous) wifi += `A:${escapeWifi(params.eapAnonymous)};`;
  if (params.eapPhase2) wifi += `PH2:${params.eapPhase2};`;

  wifi += ';';
  return wifi;
}
