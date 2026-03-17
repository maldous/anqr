import { lazy } from "react";
export const Analyze = lazy(() =>
  import("../features/analyze/components/analyze").then((m) => ({ default: m.Analyze })),
);
