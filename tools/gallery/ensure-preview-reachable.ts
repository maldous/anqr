export async function ensurePreviewReachable(baseUrl: string): Promise<void> {
  try {
    const res = await fetch(baseUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error(
      `[prerender] Preview server not reachable at ${baseUrl}. ` +
        `Start it with 'npm run preview' in another shell. (${String(e)})`,
    );
    process.exit(1);
  }
}
