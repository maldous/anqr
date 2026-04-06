# Main Agent Configuration

## 1. Directory Overview

This directory contains the configuration files for the main OpenCLAW agent, defining available AI model providers, authentication profiles, and runtime settings. It serves as the central configuration hub for the agent's AI model access and authentication management.

## 2. File Summaries

### models.json

Configuration file defining available AI providers and their models. Contains provider definitions for:

- **openrouter**: Free tier models including Llama 3.3 70B Instruct, Qwen3-Next-80B, and OpenRouter Auto. Uses OpenAI-compatible completions API at `https://openrouter.ai/api/v1`. Requires `OPENROUTER_API_KEY`.

- **openai-codex**: GitHub Copilot backend API at `https://api.individual.githubcopilot.com` using the `openai-codex-responses` API type.

- **ollama**: Local Ollama instance at `http://127.0.0.1:11434`. Available models include Qwen2.5 Coder 0.5B, Qwen2.5 Coder 3B Instruct, and Qwen3 Coder Next. Uses the native Ollama API.

- **codebuff-bridge**: Local Codebuff bridge at `http://127.0.0.1:4318/v1` with API key `local-bridge`. Provides Codebuff Base model for codebuff-specific operations.

- **symphony-bridge**: Local Symphony bridge at `http://127.0.0.1:18790/v1` with API key `local-symphony`. Offers multiple models including main, text, codex, codebuff, groq, mistral, gemini, gemini-lite, openrouter, huggingface, fireworks, together, sambanova, cerebras, and ollama-local.

- **github-copilot**: GitHub Copilot provider configuration at `https://api.individual.githubcopilot.com`.

Each model entry includes metadata: id, name, context window size (typically 32K-131K), max tokens (8192), reasoning flag, input types, and cost structure (all zero for free/local models).

### auth-profiles.json

Authentication profile management file containing:

- **Version**: Schema version (1)
- **Profiles**: Authentication credentials for providers
  - `ollama:default`: API key authentication for local Ollama (`key: "ollama-local"`)
  - `openai-codex:default`: OAuth authentication for GitHub Copilot with access token, refresh token, expiration timestamp, and account ID (currently set to placeholder values)

- **lastGood**: Map of last successful authentication profiles (empty)

- **usageStats**: Runtime usage statistics tracking error count and last used timestamp for each profile (e.g., `ollama:default` has 0 errors, last used at timestamp 1774319914088)

## 3. Overall Directory Function

This directory serves as the central configuration layer for the main agent's AI model access. The files work together to provide:

- **Provider Abstraction**: Multiple AI provider configurations allow the agent to route requests to different backends based on capability, cost, or availability requirements.

- **Model Selection**: Detailed model metadata enables intelligent model selection based on context window size, max tokens, and reasoning requirements.

- **Authentication Management**: Centralized auth profile management tracks credentials for different providers and maintains usage statistics for debugging and optimization.

- **Fallback Support**: Multiple providers (especially the symphony-bridge with its many models) provide redundancy if a primary provider becomes unavailable.

The configuration supports both cloud-based providers (OpenRouter, GitHub Copilot) and local/bridge options (Ollama, Codebuff, Symphony) enabling hybrid deployment strategies.

## 4. Usage Instructions

This directory is primarily used through configuration loading by the OpenCLAW agent runtime. Direct interaction is typically not required unless:

- **Adding New Providers**: Edit `models.json` to add new provider configurations following the existing schema format with baseUrl, api type, and models array.

- **Updating Credentials**: Modify `auth-profiles.json` to update API keys, OAuth tokens, or add new authentication profiles.

- **Usage Monitoring**: Review `usageStats` in `auth-profiles.json` to track provider reliability and error patterns.

To reference these configurations in code:

```javascript
import { readFileSync } from 'fs';

const models = JSON.parse(readFileSync('./models.json', 'utf-8'));
const authProfiles = JSON.parse(readFileSync('./auth-profiles.json', 'utf-8'));
```

## 5. Dependencies

### Environment Variables

- `OPENROUTER_API_KEY`: Required for OpenRouter provider access
- `OLLAMA_API_KEY`: Optional, defaults to "ollama-local" for local Ollama

### Runtime Requirements

- Node.js or compatible JavaScript runtime for JSON parsing
- Access to configured provider endpoints (local or remote)
- Valid API keys for cloud providers (OpenRouter, GitHub Copilot)

### Internal Dependencies

- Symphony bridge must be running at `http://127.0.0.1:18790` for symphony-bridge models
- Codebuff bridge must be running at `http://127.0.0.1:4318` for codebuff-bridge models
- Ollama must be running locally at `http://127.0.0.1:11434` for ollama models

## 6. Additional Comments

- **Zero-Cost Focus**: Most configurations point to free or local models to minimize operational costs while maintaining capability diversity.

- **Provider Prioritization**: The configuration suggests a hierarchy: local/bridge options first (Ollama, Symphony, Codebuff), then free cloud options (OpenRouter), then paid options (GitHub Copilot).

- **OAuth Token Management**: The openai-codex profile contains placeholder OAuth credentials that need to be updated with real values for GitHub Copilot integration.

- **Extensibility**: The JSON schema allows easy addition of new providers and models without code changes - just update the configuration files.

- **Model Diversity**: The symphony-bridge alone provides access to 15+ different model variants covering reasoning, coding, text, and multimodal capabilities.