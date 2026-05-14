# ANQR Project Overview

## Purpose
ANQR is a QR code generation, analysis, and sharing product. The 1.0 launch surface is:
- `apps/web` — Vite SPA (primary web app)
- `netlify/` — serverless functions and edge functions (public HTTP QR API and MCP)

Not in current launch claim: `apps/api`, Android, iOS.

## Tech Stack
- **Runtime**: Node.js >=25.8.0
- **Language**: TypeScript (strict)
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Radix UI, Zustand, Zod
- **Testing**: Vitest (unit), Playwright (e2e/smoke), WebdriverIO/Appium (mobile)
- **Linting**: oxlint, oxfmt (formatter)
- **Spelling**: cspell
- **Git hooks**: lefthook
- **Deployment**: Netlify (web + functions + edge functions)
- **Mobile**: Capacitor (Android + iOS shells — not in 1.0 claim)
- **Package manager**: npm workspaces (npm 10.x)
- **AI/LLM**: Vercel AI SDK, multiple providers (OpenAI, Groq, Google, OpenRouter, etc.)
- **Project tracking**: Linear
- **Source control**: GitHub

## Repository Structure
```
apps/           deployable targets (web, api, mobile)
packages/       shared architecture packages (domain, application, ui, platform, contracts, etc.)
src/            transitional monolith (being decomposed into packages/)
tests/          integration, smoke, scenario tests
netlify/        serverless + edge functions
harness/        repo-local automation (ops scripts, harness runner)
services/systemd/ systemd unit files for background services
docs/           governance docs, ADRs, standards, workflows
```
