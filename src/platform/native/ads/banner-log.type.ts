export type BannerLog = {
  info: (msg: string, data?: any) => void;
  error: (msg: string, data?: any) => void;
};
