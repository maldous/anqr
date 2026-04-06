# OpenClaw Agent Configuration

## 1. Directory Overview

This directory contains agent configuration files for the OpenClaw runtime system. It defines model providers, authentication profiles, and settings for different agent types (main and voice). The configurations enable the OpenClaw system to connect to various AI model providers through a unified interface.

## 2. File Summaries

### Subdirectories

**main/** - Main agent configuration:
- Contains configuration for the primary OpenClaw agent including model definitions and authentication profiles
- See [main/README.md](main/README.md) for detailed documentation

**voice/** - Voice agent configuration:
- Contains configuration for the voice-specific OpenClaw agent
- Similar structure to main but optimized for voice interaction workloads
- See [voice/README.md](voice/README.md) for detailed documentation

### Root Level

- **README.md** - This file. Provides documentation for the agents configuration directory.

## 3. Overall Directory Function

The agents directory serves as the central configuration hub for OpenClaw runtime agents. It organizes agent-specific settings into two primary categories:

- **Main Agent**: Handles primary code execution, file operations, and general task automation
- **Voice Agent**: Handles voice-specific interactions and audio processing tasks

Each agent subdirectory contains:
- `models.json` - Defines available AI model providers and their configurations
- `auth-profiles.json` - Manages authentication credentials and usage statistics

The configuration supports multiple provider types including OpenRouter, Ollama, Symphony Bridge, and OpenAI Codex, enabling flexible model selection based on task requirements and cost optimization.

## 4. Usage Instructions

This directory is primarily used by the OpenClaw runtime system. Configuration files are loaded at startup to determine:

- Which AI model providers are available
- Authentication credentials for each provider
- Default model selection for each agent type
- Usage tracking and error handling preferences

To modify agent configurations:
1. Edit the appropriate `models.json` file to add/remove providers or models
2. Update `auth-profiles.json` to configure authentication credentials
3. Restart the OpenClaw runtime to apply changes

## 5. Dependencies

### Internal Dependencies

- **OpenClaw Runtime** - Loads and applies these configurations
- **Model Provider APIs** - OpenRouter, Ollama, Symphony Bridge, etc.

### External Services

- **OpenRouter** - External model aggregation service (requires `OPENROUTER_API_KEY`)
- **Ollama** - Local model serving (requires `OLLAMA_API_KEY` if configured)
- **Symphony Bridge** - Internal model routing service (localhost:18790)
- **OpenAI Codex** - GitHub Copilot's backend API

### Runtime Requirements

- Valid API keys for configured providers
- Network access to provider endpoints
- Symphony Bridge running on localhost:18790 (for symphony-bridge models)
- Ollama running on localhost:11434 (for local models)

## 6. Additional Comments

- All models in this configuration have zero cost (`cost: { input: 0, output: 0 }`) as they use free tiers or internal routing
- The `symphony-bridge` provider provides the most model options including groq, mistral, gemini, openrouter, and more
- Authentication profiles track usage statistics and last-used timestamps for debugging and optimization
- The `ollama:default` profile is pre-configured with a placeholder key; replace with actual credentials for production use
- Each agent type can have independent model configurations allowing for optimized resource allocation based on workload