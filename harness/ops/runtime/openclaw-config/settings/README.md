# ANQR Openclaw Config - Settings

## 1. Directory Overview

This directory contains runtime configuration settings for the Openclaw voice agent system. These settings control various aspects of the voice agent's behavior and capabilities.

## 2. File Summaries

- **tts.json** - Text-to-Speech configuration file. Contains settings that control the automatic TTS feature. Currently configured with `"auto": "off"`, meaning automatic text-to-speech is disabled.

## 3. Overall Directory Function

This directory serves as the configuration layer for Openclaw voice agent settings. The TTS (Text-to-Speech) configuration controls whether speech synthesis should be triggered automatically or require manual activation. The current setting (`"auto": "off"`) suggests that TTS output requires explicit activation rather than being triggered automatically during voice conversations.

## 4. Usage Instructions

This directory is primarily used through imports from other Openclaw configuration modules. The settings are loaded at runtime to configure voice agent behavior.

To modify TTS settings:

```bash
# Edit tts.json to change TTS behavior
nano ops/runtime/openclaw-config/settings/tts.json
```

Valid values for TTS auto mode:
- `"on"` - Enable automatic TTS
- `"off"` - Disable automatic TTS (manual activation required)

## 5. Dependencies

### Internal Dependencies

- Parent directory `ops/runtime/openclaw-config/` loads and merges these settings

### Runtime Requirements

- Node.js with JSON parsing capability
- Valid JSON format in configuration files

## 6. Additional Comments

- The TTS setting is currently in a disabled state (`auto: "off"`), which may be appropriate for scenarios where voice output should be triggered explicitly
- This configuration follows a JSON-based settings pattern common in the Openclaw system
- Additional configuration files may be added to this directory as the voice agent system evolves