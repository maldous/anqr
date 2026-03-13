import type { PayloadData } from './payload-data';

export function serializeWifi(payload: PayloadData): string {
  const w = payload.wifi;
  let wifi = `WIFI:T:${w.auth};S:${w.ssid};`;
  if (w.password) wifi += `P:${w.password};`;
  if (w.hidden) wifi += 'H:true;';
  wifi += ';';
  return wifi;
}
