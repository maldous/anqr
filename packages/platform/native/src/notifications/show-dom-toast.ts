import type { ToastDuration } from "./toast-duration";
import { getToastDurationMs } from "./get-toast-duration-ms";

const DOM_TOAST_ID = "anqr-native-toast";

export function showDomToast(message: string, duration: ToastDuration): void {
  if (typeof document === "undefined") return;

  let node = document.getElementById(DOM_TOAST_ID);
  if (!node) {
    node = document.createElement("div");
    node.id = DOM_TOAST_ID;
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.style.position = "fixed";
    node.style.left = "50%";
    node.style.bottom = "24px";
    node.style.transform = "translateX(-50%)";
    node.style.maxWidth = "min(92vw, 560px)";
    node.style.padding = "10px 14px";
    node.style.borderRadius = "10px";
    node.style.background = "rgba(15, 23, 42, 0.94)";
    node.style.color = "#fff";
    node.style.fontSize = "14px";
    node.style.lineHeight = "1.3";
    node.style.zIndex = "2147483647";
    node.style.pointerEvents = "none";
    node.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
    node.style.opacity = "0";
    node.style.transition = "opacity 140ms ease-out";
    document.body.appendChild(node);
  }

  node.textContent = message;
  node.style.opacity = "1";

  const timeoutKey = "__anqrToastTimeout";
  const existing = (
    node as HTMLElement & { [key: string]: ReturnType<typeof setTimeout> | undefined }
  )[timeoutKey];
  if (existing) clearTimeout(existing);
  (node as HTMLElement & { [key: string]: ReturnType<typeof setTimeout> | undefined })[timeoutKey] =
    globalThis.setTimeout(() => {
      node.style.opacity = "0";
    }, getToastDurationMs(duration));
}
