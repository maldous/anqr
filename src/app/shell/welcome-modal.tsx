import { lazy } from "react";

export const WelcomeModal = lazy(() =>
  import("@/components/welcome-modal").then((m) => ({ default: m.WelcomeModal })),
);
