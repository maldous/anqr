export const PROFILES = {
  quick: ["repo-structure", "typecheck", "lint", "cspell-coverage", "ast-density"],
  continuous: [
    "repo-structure",
    "ollama-health",
    "litellm-routing",
    "pipeline-latency",
    "linear-rag-pipeline",
  ],
  full: [
    "repo-structure",
    "typecheck",
    "lint",
    "depcruise",
    "cspell-coverage",
    "ast-density",
    "docs-freshness",
    "ollama-health",
    "litellm-routing",
    "sonar-audit",
    "pipeline-latency",
    "linear-rag-pipeline",
  ],
};
