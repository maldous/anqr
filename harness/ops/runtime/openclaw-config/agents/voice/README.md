# OpenClaw Voice Agent Configuration

## 1. Directory Overview

This directory contains the configuration files for the OpenClaw voice agent in the ANQR (Agentic Number Query Runner) harness system. The voice agent is responsible for handling voice-based interactions and text processing tasks. This directory holds the model configurations that define which AI providers and models the voice agent can use for processing requests.

## 2. File Summaries

- **README.md** - This file. Provides documentation for the voice agent configuration directory.

- **agent/** - Subdirectory containing voice agent-specific configurations:
  - **models.json** - Configuration file defining available AI providers and models for the voice agent. Contains provider configurations including OpenRouter (free models), OpenAI Codex, Ollama (local models), and Symphony Bridge (local routing).
  - **agent/README.md** - Documentation for the agent subdirectory with detailed model configuration information.

## 3. Overall Directory Function

This directory serves as the configuration hub for the OpenClaw voice agent's AI model selection. The configuration enables the voice agent to route requests to different AI providers based on availability, cost optimization, and capability requirements. The directory supports multiple deployment scenarios:

- **Free tier models** via OpenRouter for budget-conscious operations
- **Local inference** via Ollama for offline or private deployments
- **Provider routing** via Symphony Bridge for intelligent provider selection and failover

The voice agent uses these configurations to determine which AI backend to use for processing text-based tasks, voice interactions, and code generation requests.

## 4. Usage Instructions

This directory is primarily used through configuration loading by the voice agent system. The models.json file is read at runtime to determine available AI backends:

```javascript
import models from './agent/models.json';

// Access provider configurations
const openrouterConfig = models.providers.openrouter;
const ollamaConfig = models.providers.ollama;
const symphonyConfig = models.providers['symphony-bridge'];
```

To update the voice agent's available models, edit the `agent/models.json` file and restart the voice agent service.

## 5. Dependencies

### Runtime Requirements
- **API Keys**: OPENROUTER_API_KEY environment variable for OpenRouter provider
- **OLLAMA_API_KEY** environment variable for Ollama provider (if using local models)
- **Symphony Bridge**: Local HTTP service running at http://127.0.0.1:18790/v1 with API key "local-symphony"
- **Ollama**: Local service at http://127.0.0.1:11434 for local model inference

### Internal Dependencies
- **Symphony Bridge** - Local provider routing and credit gate system for intelligent model selection
- **OpenClaw Voice Agent** - The main system that consumes this configuration

### External Services
- **OpenRouter** - Free tier AI model hosting at https://openrouter.ai/api/v1
- **OpenAI** - Codex API at https://chatgpt.com/backend-api

## 6. Additional Comments

- **Cost Optimization**: All configured models have zero cost (input/output/cache both 0), making this configuration suitable for budget-conscious deployments
- **Context Windows**: Varies by provider - OpenRouter models support up to 131K tokens, Ollama and Symphony Bridge models support 32K tokens
- **Max Output**: All models configured with 8192 max tokens output limit
- **Reasoning Models**: No reasoning models (e.g., o1, o3-mini) are currently enabled in this configuration
- **Provider Priority**: Symphony Bridge provides the most model variants (15+) and serves as the primary local routing mechanism for provider selection, credit allocation, and automatic failover
- **Local First**: Both Ollama and Symphony Bridge configurations support fully offline operation when local services are available
- **Multi-Provider Support**: The configuration enables flexible routing across multiple providers for high availability and load distribution