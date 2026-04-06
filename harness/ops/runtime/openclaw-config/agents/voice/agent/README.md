# Voice Agent Models Configuration

## 1. Directory Overview

This directory contains the AI model configuration file for the OpenClaw voice agent. It defines the available AI providers and their models that the voice agent can use for processing text-based tasks. The configuration supports multiple provider backends including OpenRouter, Ollama, and Symphony Bridge.

## 2. File Summaries

- **models.json** - Configuration file defining available AI providers and models for the voice agent. Contains provider configurations including:
  - **OpenRouter**: Free models including Llama 3.3 70B Instruct, Qwen3-Next-80B, and OpenRouter Auto
  - **OpenAI Codex**: Configured for openai-codex-responses API (no models listed)
  - **Ollama**: Local models including qwen2.5-coder:0.5b, qwen2.5-coder:3b-instruct, and qwen3-coder-next:latest
  - **Symphony Bridge**: Local provider with multiple model variants (main, text, codex, codebuff, groq, mistral, gemini, gemini-lite, openrouter, huggingface, fireworks, together, sambanova, cerebras, ollama-local)

## 3. Overall Directory Function

This directory serves as the model configuration hub for the voice agent. The models.json file enables the voice agent to route requests to different AI providers based on availability, cost, and capability requirements. The configuration supports both free tier models (OpenRouter) and local deployment options (Ollama, Symphony Bridge), providing flexibility for different operational scenarios.

The Symphony Bridge integration allows the voice agent to leverage the local ANQR (Agentic Number Query Runner) provider routing system, which manages provider selection, credit allocation, and failover logic.

## 4. Usage Instructions

This directory is primarily used through configuration loading by the voice agent system. The models.json is read at runtime to determine available AI backends:

```javascript
import models from './models.json';

// Access provider configurations
const openrouterConfig = models.providers.openrouter;
const ollamaConfig = models.providers.ollama;
const symphonyConfig = models.providers['symphony-bridge'];
```

## 5. Dependencies

### Runtime Requirements
- **API Keys**: OPENROUTER_API_KEY and OLLAMA_API_KEY environment variables for respective providers
- **Symphony Bridge**: Local HTTP service at http://127.0.0.1:18790/v1 with API key "local-symphony"
- **Ollama**: Local service at http://127.0.0.1:11434 for local model inference

### Internal Dependencies
- **Symphony Bridge** - Local provider routing and credit gate system
- **OpenClaw Voice Agent** - System that consumes this configuration

### External Services
- **OpenRouter** - Free tier AI model hosting at https://openrouter.ai/api/v1

## 6. Additional Comments

- **Cost Optimization**: All configured models have zero cost (input/output/cache both 0), making this configuration suitable for budget-conscious deployments
- **Context Windows**: Varies by model - OpenRouter models support up to 131K tokens, Ollama and Symphony models support 32K tokens
- **Max Output**: All models configured with 8192 max tokens output limit
- **Reasoning Models**: No reasoning models (e.g., o1, o3-mini) are currently enabled in this configuration
- **Provider Priority**: Symphony Bridge provides the most model options (15+ variants) and serves as the primary local routing mechanism
- **Local First**: Both Ollama and Symphony Bridge configurations support fully offline operation when local services are available