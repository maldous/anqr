export type QrGeneratePromptArgs = {
  readonly intent: "url" | "wifi" | "contact" | "payment" | "plain_text";
  readonly data?: string;
  readonly format?: "png" | "svg";
};
