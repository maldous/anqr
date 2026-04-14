# External Services Inventory

## Objective

Capture external dependencies and ownership.

| Service            | Use case                                                      | Criticality | Env/secret owner | Runtime owner         | Observability owner    | Cost owner | Notes                                          |
| ------------------ | ------------------------------------------------------------- | ----------- | ---------------- | --------------------- | ---------------------- | ---------- | ---------------------------------------------- |
| Apple              | iOS build signing, App Store Connect, TestFlight distribution | High        | Operator         | Engineering / Release | Release management     | Operator   | Required for iOS release pipeline              |
| Argos              | Device configuration / mobile build environment variable      | Low         | Operator         | Engineering           | Engineering            | Operator   | Appears only as `ARGOS_DEVICE_TYPE` env        |
| Brevo              | SMTP email delivery for notifications/support                 | Medium      | Operator         | Harness               | Reliability            | Operator   | Uses `BREVO_SMTP_KEY`                          |
| Bing               | Search indexing and SEO analytics                             | Low         | Growth           | Growth                | Growth                 | Operator   | Bing Webmaster Tools                           |
| Capacitor          | Cross-platform mobile shell bridging web app to Android/iOS   | Critical    | Engineering      | Engineering           | Engineering            | Operator   | Required for mobile apps                       |
| Cerebras           | AI model provider via API                                     | Medium      | Operator         | Harness               | Harness                | Operator   | Token `CEREBRAS_TOKEN`                         |
| Cloudflare         | DNS, CDN, caching, edge protection, Zaraz scripts             | High        | Operator         | Reliability           | Reliability            | Operator   | `CLOUDFLARE_TOKEN*`                            |
| ElevenLabs         | Optional audio/voice generation capability                    | Low         | Operator         | Harness               | Harness                | Operator   | `ELEVENLABS_API_KEY`                           |
| Gemini (Google AI) | AI model provider used through routing layer                  | Medium      | Operator         | Harness               | Harness                | Operator   | `GEMINI_TOKEN`, `GOOGLE_GEMINI_API_KEY`        |
| GitHub             | Source control, CI, issue automation integration              | Critical    | Operator         | Engineering / Harness | Engineering            | Operator   | `GITHUB_TOKEN`, `GITHUB_MODELS_TOKEN`          |
| GitLab             | XX                                                            | XX          | XX               | XX                    | XX                     | XX         | Currently unused but listed for classification |
| Google             | Analytics, Ads, Search Console, APIs (Places, Gemini)         | High        | Operator         | Product / Growth      | Growth                 | Operator   | Includes GA, Ads, AdSense, AdMob               |
| Groq               | AI inference provider for LLM routing                         | Medium      | Operator         | Harness               | Harness                | Operator   | `GROQ_TOKEN`                                   |
| Hugging Face       | Model repository and inference provider                       | Medium      | Operator         | Harness               | Harness                | Operator   | `HUGGING_TOKEN`, `HUGGING_FACE_READ_TOKEN`     |
| Linear             | Issue tracking and automation orchestration                   | High        | Operator         | Harness               | Harness                | Operator   | `LINEAR_API_KEY`                               |
| Mistral            | AI inference provider                                         | Medium      | Operator         | Harness               | Harness                | Operator   | `MISTRAL_TOKEN`                                |
| msmtp              | Local SMTP relay for system email                             | Medium      | Operator         | Harness               | Reliability            | Operator   | `MSMTP_KEY`                                    |
| MyMemory           | Translation API used by system utilities                      | Low         | Operator         | Harness               | Harness                | Operator   | `MYMEMORY_EMAIL`                               |
| Netlify            | Hosting platform, serverless functions, CI builds             | Critical    | Operator         | Engineering           | Reliability            | Operator   | `NETLIFY_API_TOKEN`                            |
| Ollama             | Local model runtime and inference router                      | Medium      | Engineering      | Harness               | Harness                | Operator   | `OLLAMA_API_BASE`, `OLLAMA_API_KEY`            |
| OpenAI             | Primary hosted LLM provider                                   | High        | Operator         | Harness               | Harness                | Operator   | `OPENAI_API_KEY`                               |
| OpenRouter         | Aggregated model provider routing layer                       | High        | Operator         | Harness               | Harness                | Operator   | `OPENROUTER_TOKEN`                             |
| SambaNova          | AI model provider                                             | Medium      | Operator         | Harness               | Harness                | Operator   | `SAMBANOVA_TOKEN`                              |
| Sentry             | Error monitoring and crash reporting                          | High        | Operator         | Reliability           | Reliability            | Operator   | `SENTRY_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| Snyk               | Dependency and vulnerability scanning                         | High        | Operator         | Engineering           | Security / Engineering | Operator   | `SNYK_TOKEN`                                   |
| Sonar              | Code quality and static analysis service                      | High        | Operator         | Engineering           | Engineering            | Operator   | `SONAR_TOKEN`                                  |
| SonarQube          | Static analysis host and quality gate system                  | High        | Operator         | Engineering           | Engineering            | Operator   | `SONARQUBE_TOKEN`, `SONAR_HOST_URL`            |
| X (Twitter)        | Public communication channel / brand presence                 | Low         | Growth           | Growth                | Growth                 | Operator   | External marketing presence                    |
