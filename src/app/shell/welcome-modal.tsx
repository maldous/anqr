import { lazy } from "react";

export const WelcomeModal = lazy(() =>
  import("@/components/WelcomeModal").then((m) => ({ default: m.WelcomeModal })),
);
