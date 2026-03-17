import { Capacitor } from "@capacitor/core";
import { showDomToast } from "./show-dom-toast";
import type { ToastDuration } from "./toast-duration";
import type { ToastPluginLike } from "./toast-plugin-like";

export const showNativeToast = async (
  message: string,
  duration: ToastDuration = "short",
): Promise<void> => {
  const text = String(message || "").trim();
  if (!text) return;

  const plugin = (
    globalThis as typeof globalThis & {
      Capacitor?: { Plugins?: { Toast?: ToastPluginLike } };
    }
  ).Capacitor?.Plugins?.Toast;
  if (Capacitor.isNativePlatform() && plugin?.show) {
    try {
      await plugin.show({ text, duration, position: "bottom" });
      return;
    } catch {
      // Fall through to DOM toast fallback.
    }
  }

  showDomToast(text, duration);
};
