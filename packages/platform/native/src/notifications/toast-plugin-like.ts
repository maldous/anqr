import type { ToastDuration } from "./toast-duration";

export type ToastPluginLike = {
  show?: (options: {
    text: string;
    duration?: ToastDuration;
    position?: "top" | "center" | "bottom";
  }) => Promise<void>;
};
