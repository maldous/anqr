/**
 * Wait for bridge to be ready by polling health endpoint
 */
export async function waitForBridgeReady(baseUrl: string, timeoutMs = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      
      if (res.ok) {
        return true;
      }
    } catch {
      // Bridge not ready yet, wait and retry
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  return false;
}
