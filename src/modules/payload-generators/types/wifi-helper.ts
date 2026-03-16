import type { WifiAuth } from "./wifi-auth";

export interface WifiHelper {
  ssid: string;
  auth: WifiAuth;
  password?: string;
  hidden: boolean;
  eapIdentity?: string;
  eapAnonymous?: string;
  eapPhase2?: string;
  eapCaCert?: string;
}
