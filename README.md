# Reverse Tutor (v1.1 experimentation build)

A prompt-iteration app where the user teaches a confused student persona. The student reveals misconceptions gradually, while a hidden judge scores pedagogical quality and emits an emoticon/tag signal during the session.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- OpenRouter Chat Completions API
- Zod schema validation for judge JSON
- In-memory server sessions + localStorage client recap persistence
- SSE streaming for student responses

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.local.example .env.local
   ```
3. Set `OPENROUTER_API_KEY` in `.env.local`.
4. Run dev server:
   ```bash
   npm run dev
   ```

## Key API routes

- `POST /api/chat`
  - Appends user turn
  - Runs Student + Grader
  - Optionally runs Auditor (`ENABLE_AUDITOR=true`)
  - Streams student text via SSE
  - Sends final emoticon/tag event
- `POST /api/session/end`
  - Runs session synthesis
  - Returns recap moments + aggregate summary

## Context engineering rules implemented

- Per-call fresh message arrays from canonical session state
- Strict context isolation by role (grader only sees subject/scenario, never full brief)
- User message wrapping with `<user_message>` tags
- Prompt-injection attempt logging (non-blocking)
- Rolling summary compression after soft window threshold
- Hard session cap at 50 turns
- Zod-validated judge JSON responses with resilient fallback behavior

## Free-tier note

On unfunded OpenRouter accounts (50 requests/day), keep `ENABLE_AUDITOR=false` for normal experimentation throughput. Auditor can be enabled for stricter runs when needed.

## Model reliability

- Default student model is `openrouter/free`.
- Optional env var `STUDENT_MODEL_FALLBACKS` accepts comma-separated fallback models.
- Chat route automatically retries student generation with fallback models when OpenRouter returns a no-endpoint 404 for the current student model.
