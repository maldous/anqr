import { lazy } from "react";

export const WelcomeModal = lazy(() =>
  import("@/features/onboarding/components/welcome-modal").then((m) => ({
    default: m.WelcomeModal,
  })),
);
