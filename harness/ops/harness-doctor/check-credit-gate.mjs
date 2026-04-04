// Generated from ../../scripts/ops/harness-doctor.mjs:115

export async function checkCreditGate() {
  try {
    // Try to load and probe the credit gate
    const { selectProvider } = await import("../integrations/model/symphony-credit-gate.mjs");
    const provider = await selectProvider();

    if (provider) {
      return {
        pass: true,
        detail: `Provider selected: ${provider.name}`,
        provider: provider.name,
      };
    }
    return {
      pass: false,
      detail: "No provider available",
      provider: null,
    };
  } catch {
    return {
      pass: false,
      detail: `Error: could not load credit gate`,
      provider: null,
    };
  }
}
