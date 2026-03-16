import type { UseQRGeneratorResult } from "@/features/generator/hooks/hooks-shared-types";
import { createContext } from "react";

export const QRGeneratorContext = createContext<UseQRGeneratorResult | null>(null);
