import { createContext } from "react";
import type { UseQRGeneratorResult } from "./use-qr-generator-result";

// Singleton context — ensures only ONE animation loop + compositor effect runs
export const QRGeneratorContext = createContext<UseQRGeneratorResult | null>(null);
