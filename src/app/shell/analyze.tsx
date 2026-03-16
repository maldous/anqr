import { lazy } from "react";
export const Analyze = lazy(() =>
  import("@/components/analyze").then((m) => ({ default: m.Analyze })),
);
