export async function checkOllama() {
  const base = process.env.OLLAMA_API_BASE || "http://localhost:11434";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    // Check version
    const versionRes = await fetch(`${base}/api/version`, { signal: controller.signal });
    clearTimeout(timer);

    if (!versionRes.ok) {
      return { pass: false, detail: `Ollama responded with ${versionRes.status}` };
    }

    const versionData = await versionRes.json();
    const version = versionData.version || "unknown";

    // Check models
    const tagsRes = await fetch(`${base}/api/tags`);
    const tagsData = await tagsRes.json();
    const models = (tagsData.models || []).map((m) => m.name);

    return {
      pass: true,
      detail: `v${version}, ${models.length} models available`,
      version: versionData.version,
      models,
    };
  } catch (err) {
    return { pass: false, detail: `Unreachable: ${err.message}` };
  }
}
