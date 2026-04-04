import { API_KEY } from "./api-key.mjs";
import { additionalTokens } from "./additional-tokens.mjs";

export const VALID_TOKENS = new Set([API_KEY, ...additionalTokens]);
