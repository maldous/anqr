import { lazy } from "react";
export const Analyze = lazy(() =>
  import("@/components/Analyze").then((m) => ({ default: m.Analyze })),
);
