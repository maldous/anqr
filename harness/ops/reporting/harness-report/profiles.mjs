export const PROFILES = {
  quick: ["repo-structure", "typecheck", "lint", "knip", "ast-density"],
  continuous: [
    "repo-structure",
    "ollama-health",
    "litellm-routing",
    "pipeline-latency",
    "source-rag-index",
    "linear-rag-pipeline",
  ],
  full: [
    "repo-structure",
    "typecheck",
    "lint",
    "depcruise",
    "knip",
    
    "ast-density",
    "docs-freshness",
    "ollama-health",
    "litellm-routing",
    "sonar-audit",
    "pipeline-latency",
    "source-rag-index",
    "linear-rag-pipeline",
  ],
};
