# Module 02 — Public Employee Engine, Knowledge and Memory

**Reviewed:** 2026-10-29. **Status:** Functional public local-first v0.4 release; see `../../docs/WORKING_BETA_READINESS.md`.

**2026-10-29 reliability patch:** `engine-app.mjs` treats malformed existing browser data as a blocking read error; failed writes display an unsaved warning and suppress success notices. A failed import restores the prior in-memory state. Startup no longer writes an unchanged snapshot or sends a cross-tab update. The `service-worker.js` cache key is bumped to `v0.4.1`. `tests/storage.test.mjs` covers corrupt local data and failed storage writes.

## Files / responsibilities

- `public/workspace.html` — Work, Knowledge, Teach, Edit, History, ChatGPT & PC tabs, onboarding and role templates.
- `public/engine-app.mjs` — UI actions, storage and migration, offline/cloud execution, user-review/evaluation, backup/export/import and copy/paste workflows.
- `public/engine-core.mjs` — employee records, presets, documents, lexical retrieval, bounded prompts, tasks, feedback, backup version validation.
- `public/engine.css` — mobile/desktop responsive styles; `public/service-worker.js`, `public/workspace.webmanifest` — limited offline-capable shell.

## Actual data model and limits

Each employee has a generated local ID, name, role, system instructions, creation/update dates, owner-supplied lessons, knowledge documents and task history. Tasks contain instruction, output, mode (`ai`, `offline`, `external`), status, source titles and optional owner assessment. Text is rendered with safe DOM text insertion; imported backup data is shape/size validated. Browser-local identity is not centralized identity verification.

Current UI supports readable `.txt`, `.md`, `.csv`, `.json`, `.log`, up to **12 knowledge documents per employee**, up to **60,000 characters per document** (other aggregate size and backup caps apply). These are file/text *contents* copied into local browser storage, not a network file connector. PDF/DOCX/web URLs, scanning and OCR not supported in this release.

`FORMAT = 'agentverse-workspace-v1'`, `VERSION = 2` in the core module; current backup parser supports migration from earlier v0.3 version 1. **Do not change backup schema without writing migration and round-trip tests.** The code enforces bounded lesson, task, prompt and export lengths; source code is authority if these values are altered.

## Source-aware knowledge execution

1. User uploads/pastes permitted text to employee's local knowledge.
2. Engine splits documents into passages, normalizes terms and ranks lexical overlap with the task and role.
3. Up to a small capped number of relevant passages are selected and labelled `[Source N]` with owner-supplied title.
4. `buildAIMessages` combines selected passages, agent role and instructions, owner lessons, recent owner feedback, and the current task, within context caps.
5. `Cloud AI` sends *only the selected task/context* to the public Worker; user must deliberately select/execute it. The backend runs a bounded Cloudflare-hosted model and returns a response (when quota allows) marked unverified.
6. Result, source titles and later owner evaluation are saved locally. Subsequent task prompts can include bounded recent feedback.

**Not** a semantic vector DB, independent fact-checker, citation lookup on the internet, fine-tuning pipeline or self-learning model. Prompt-injection and data quality risks remain; reference content must be treated as untrusted. Source labels mark user-supplied excerpts rather than verified bibliographic citations.

## Offline and cloud modes

Offline methods: `knowledge` (extractive local source retrieval), `plan` (template), `checklist` (template), `summary` (extractive task text). Never label these as external model execution. Cloud mode posts JSON to `/api/engine/run`; model `@cf/meta/llama-3.1-8b-instruct-fp8`, free shared quota, per-IP/global throttling. No browser tools, file-system access or privileged actions are granted by Cloud mode.

## Persistence, privacy and portability

IndexedDB is preferred; localStorage fallback can have smaller limits. Origin-local, per-browser, per-device data is **not auto-synced or remotely backed up**. Exported JSON contains agent instructions, documents, tasks, lessons and reviews **in plaintext**; store carefully, avoid sensitive client content. No account or customer password required. Import/export on second PC is manual. Browser clearing/incognito/disk cleanup can delete all state.

When Cloud AI is chosen, relevant excerpts and lessons are transmitted to Cloudflare model processing; AgentVerse does not keep central histories in the Worker. Warn before using regulated/client-private data and avoid silent background inference.

## Browser and service-worker caveats

The service worker caches only the app shell, not AI inference. Running offline cannot fetch Cloudflare AI. A stale PWA cache can display old assets after deployment; check `service-worker.js` cache version and ensure updated assets are served when publishing. Verify version, storage migration, cross-tab stale-state warnings and mobile layout after changes.

## Core test commands

`node --test tests/*.test.mjs`; browser DOM tests: `python tests/test_browser_ui.py` with its documented dependencies (the 2026-10-09 release test mocked cloud inference and storage). Add specific tests for new retrieval logic, backup migration, XSS handling, per-document caps and real cloud fallback behavior before new marketing claims.
