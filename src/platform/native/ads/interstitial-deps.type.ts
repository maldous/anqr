export type InterstitialDeps = {
  adMobAvailable: boolean;
  AdMob: any;
  preparedInterstitialKeys: Set<string>;
  log: {
    info: (msg: string, data?: any) => void;
    error: (msg: string, data?: any) => void;
    warn: (msg: string, data?: any) => void;
  };
};
