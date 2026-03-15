import type { ZarazWindow } from './zaraz-window';

declare global {
  interface Window {
    zaraz?: ZarazWindow['zaraz'];
  }
}

export {};
