export async function runClientQuietly(client, options) {
  const originalConsoleError = console.error;
  try {
    console.error = () => {};
    return await client.run(options);
  } finally {
    console.error = originalConsoleError;
  }
}
