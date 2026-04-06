# ANQR Symphony Provider Health

## 1. Directory Overview

This directory contains provider health monitoring functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It implements a health probing mechanism that periodically checks provider availability and responsiveness, enabling the credit-gate to make intelligent routing decisions based on real-time provider status.

The provider health module maintains a health state cache that tracks provider availability, response times, and error rates, supporting both active probing (scheduled health checks) and passive monitoring (tracking errors from production traffic).

## 2. File Summaries

### Core Health Monitoring

- **index.mjs** - Main module exporting the public API including `getProviderHealth`, `probeProvider`, `startHealthProbing`, `stopHealthProbing`, `HEALTH_STATES`, and configuration constants. Provides the entry point for all health monitoring functionality.

- **runtime.mjs** - Runtime carry-forward that imports and executes the main index module. Provides a CLI entry point for direct execution when needed.

- **get-provider-health.mjs** - Implements the health state getter logic. Returns the current health state for a given provider from the health cache, including availability status, response time metrics, error counts, and last probe timestamp.

- **probe-provider.mjs** - Implements the actual health probe execution. Makes a test request to the provider endpoint to verify availability and measure responsiveness. Updates the health cache with probe results.

- **start-health-probing.mjs** - Implements the health probing scheduler. Starts periodic health checks for all registered providers at configurable intervals using setInterval.

- **stop-health-probing.mjs** - Implements the health probing cleanup. Stops all scheduled health probes and clears the probe intervals.

- **health-states.mjs** - Defines the health state enumeration including `HEALTHY`, `DEGRADED`, `UNHEALTHY`, `UNKNOWN` states with associated metadata.

## 3. Overall Directory Function

This directory provides the health monitoring layer for the Symphony provider system. It enables:

- **Active Probing**: Scheduled health checks that periodically verify provider availability
- **Passive Monitoring**: Tracking errors from production traffic to detect degraded providers
- **Health State Cache**: In-memory and optionally persisted cache of provider health states
- **Configurable Intervals**: Adjustable probe frequency based on provider characteristics
- **Automatic Recovery Detection**: Identifies when providers recover from degraded states

The health module integrates with the credit-gate to provide real-time provider status during selection, ensuring traffic is routed to healthy providers and avoiding known degraded or unavailable providers.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The index.mjs facade is the canonical entry point:

```javascript
import { getProviderHealth, startHealthProbing } from "./ops/integrations/model/symphony-provider-health/index.mjs";
```

### Starting Health Probing

```javascript
// Start periodic health checks for all providers
startHealthProbing();
```

### Getting Provider Health

```javascript
// Get current health for a specific provider
const health = getProviderHealth("openai");
console.log(health.state); // "HEALTHY", "DEGRADED", "UNHEALTHY", or "UNKNOWN"
```

### Stopping Health Probing

```javascript
// Stop all scheduled health probes
stopHealthProbing();
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for health monitoring output
- **./health-states.mjs** - Health state enumeration
- **../symphony-credit-gate/providers.mjs** - Provider registry for health check targets

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **setInterval** - For scheduled health probes

### Configuration Dependencies

- **HEALTH_PROBE_INTERVAL_MS** - Interval between health checks (default: 60000)
- **HEALTH_PROBE_TIMEOUT_MS** - Timeout for individual health probes (default: 5000)
- **HEALTH_PROBE_RETRIES** - Number of retries before marking unhealthy (default: 3)

## 6. Additional Comments

- **Fail-Open Design**: Providers default to UNKNOWN state, which allows traffic to flow if health monitoring hasn't completed yet.

- **Adaptive Probing**: The module supports adjusting probe frequency based on provider state - healthy providers may be probed less frequently than degraded ones.

- **Error Tracking**: Passive monitoring tracks errors from production requests, providing a more realistic view of provider health than synthetic probes alone.

- **Integration with Credit-Gate**: Health state is used by the credit-gate during provider selection to avoid unhealthy providers and prefer healthy ones.