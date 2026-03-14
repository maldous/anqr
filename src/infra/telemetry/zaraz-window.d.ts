export interface ZarazWindow {
  zaraz?: {
    track: (eventName: string, properties?: Record<string, string | number | boolean>) => void;
  };
}
