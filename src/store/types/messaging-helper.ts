export interface MessagingHelper {
  platform: "whatsapp" | "telegram" | "signal" | "viber" | "line" | "messenger";
  identifier: string;
  message?: string;
}
