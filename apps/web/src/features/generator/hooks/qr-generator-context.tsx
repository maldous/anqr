import type { UseQRGeneratorResult } from "./hooks-shared-types";
import { createContext } from "react";

export const QRGeneratorContext = createContext<UseQRGeneratorResult | null>(null);
