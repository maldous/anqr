import type { PayloadData } from "./payload-data";

export type PayloadSerializer = (payload: PayloadData) => string;
