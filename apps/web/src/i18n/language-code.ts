import type { languages } from "./languages";

export type LanguageCode = (typeof languages)[number]["code"];
