import { lazy } from "react";

export const StaticPage = lazy(() =>
  import("@/components/StaticPage").then((m) => ({ default: m.StaticPage })),
);
