# Main Agent Configuration

## 1. Directory Overview

This directory contains the configuration files for the main OpenCLAW agent, defining available AI model providers, authentication profiles, and runtime settings. It serves as the central configuration hub for the agent's AI model access and authentication management within the OpenCLAW runtime system.

## 2. File Summaries

### agent/ (Subdirectory)

The main configuration container with three key files:

- **agent/README.md**: Detailed documentation for the agent subdirectory configuration including provider definitions, model metadata, and authentication profile management.

- **agent/models.json**: JSON configuration file defining available AI providers and their models. Contains provider definitions for:
  - **openrouter**: Free tier models including Llama 3.3 70B Instruct, Qwen3-Next-80B, and OpenRouter Auto
  - **openai-codex**: GitHub Copilot backend API
  - **ollama**: Local Ollama instance with Qwen2.5 Coder variants
  - **codebuff-bridge**: Local Codebuff bridge for codebuff-specific operations
  - **symphony-bridge**: Local Symphony bridge with 15+ model variants
  - **github-copilot**: GitHub Copilot provider

- **agent/auth-profiles.json**: JSON authentication profile management file containing:
  - Schema version (1)
  - Provider authentication credentials (ollama:default, openai-codex:default)
  - Last successful authentication profiles
  - Runtime usage statistics tracking error counts and last used timestamps

## 3. Overall Directory Function

This directory serves as the central configuration layer for the main OpenCLAW agent's AI model access. The configuration supports:

- **Provider Abstraction**: Multiple AI provider configurations allow the agent to route requests to different backends based on capability, cost, or availability requirements.

- **Model Selection**: Detailed model metadata enables intelligent model selection based on context window size, max tokens, and reasoning requirements.

- **Authentication Management**: Centralized auth profile management tracks credentials for different providers and maintains usage statistics for debugging and optimization.

- **Fallback Support**: Multiple providers (especially the symphony-bridge with its many models) provide redundancy if a primary provider becomes unavailable.

The configuration supports both cloud-based providers (OpenRouter, GitHub Copilot) and local/bridge options (Ollama, Codebuff, Symphony) enabling hybrid deployment strategies.

## 4. Usage Instructions

This directory is primarily used through configuration loading by the OpenCLAW agent runtime. Direct interaction is typically not required unless:

- **Adding New Providers**: Edit `agent/models.json` to add new provider configurations following the existing schema format with baseUrl, api type, and models array.

- **Updating Credentials**: Modify `agent/auth-profiles.json` to update API keys, OAuth tokens, or add new authentication profiles.

- **Usage Monitoring**: Review `usageStats` in `agent/auth-profiles.json` to track provider reliability and error patterns.

To reference these configurations in code:

```javascript
import { readFileSync } from 'fs';

const models = JSON.parse(readFileSync('./agent/models.json', 'utf-8'));
const authProfiles = JSON.parse(readFileSync('./agent/auth-profiles.json', 'utf-8'));
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