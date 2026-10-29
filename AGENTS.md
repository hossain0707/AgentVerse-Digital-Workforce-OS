# AgentVerse Developer & AI Agent Instructions

**Repository:** `hossain0707/AgentVerse-Digital-Workforce-OS`  
**Owner:** Md Najmul Hossain  
**Last revised:** 2026-10-29

## Before starting any work

1. Read `PROJECT_MEMORY.md` (authoritative current handover), `project_memory/README.md`, the latest `project_memory/PROJECT_MEMORY_YYYY-MM-DD.md`, and the relevant `project_memory/modules/*.md` file(s).
2. Inspect actual repo HEAD and the source of the requested component; check `README.md`, `SECURITY.md`, `docs/WORKING_BETA_READINESS.md` for current scope and known issues. Treat source and verified deployment as higher priority than written memory.
3. If the task calls for a code change, inspect test coverage and make a reproducible plan. Never present historical test results as fresh runs.

## Project boundaries

- AgentVerse is an independent digital employee system, **not** NEXUS-100 or Falvorn AI.
- Preserve separate layers: public animated concept, investor simulation, real local-first v0.4 workspace, and private-to-internet/local-only v0.2 FastAPI marketplace.
- User-facing free offering must stay free unless the owner approves a billing change. No paid Cloudflare/AI upgrade, automatic fallback payments or real payment processing.
- **Never publish demo FastAPI backend, SQLite data or credentials** with Cloudflare. Static assets must remain under `public/`.
- ChatGPT integration currently means manual prompt handoff; local MCP is stdio and file-based. Do not imply official hosted ChatGPT OAuth or direct account connection.
- Knowledge is owner-supplied and retrieval is lexical; do not imply PDF parsing, independent fact verification, degrees or model fine-tuning unless implemented and tested.
- Product license is proprietary; retain copyright and attribution. GitHub visibility was **public** on 2026-10-29 despite older docs claiming private; do not silently change it.

## Editing, testing and memory updates

- Make minimal, reviewed changes. Avoid disrupting existing animations and public links.
- Test updated code, migration logic, API rate limits, backups, privacy and mobile layout; record commands and outcomes precisely.
- A GitHub commit, Cloudflare deployment, private-to-public visibility change, GitHub license modification or TinyFish use/spending requires user authorization. Do not enable continuous background pushes on your own.
- Update `PROJECT_MEMORY.md` for current facts and major decisions, affected module history file(s), and **dated** `project_memory/PROJECT_MEMORY_YYYY-MM-DD.md` for a concrete session. Do not rewrite old dated logs as though they occurred today.
- Never insert API keys, tokens, private user info, customer documents, passwords, bank/payment details or production environment values into memory files. The repository may be public.
- **ChatGPT Project → Sources is NOT auto-updated.** If the user asks to add project context to ChatGPT Project Sources, provide the root Markdown for manual attachment or use a specifically authorized project-files workflow, never claim a repo commit synchronized that separate surface.

## Standard checks

```bash
node --test tests/*.test.mjs
python tests/test_local_mcp.py
python -m pytest -q
```

For public release, verify GET `/`, `/workspace.html`, `/investor.html`, `/mcp-setup.html`, `/api/engine/status` and actual same-origin AI request if quota permits. Git build root must be `/`, deploy command `npx wrangler deploy`, Wrangler asset directory `./public`. Do not imply status `ai:true` proves successful inference.

## Outcome reporting

Use factual labels: `implemented`, `locally tested`, `publicly deployed`, `planned`, `blocked`, `unknown`. Link exact verified source/commit paths and report unmet production gates. Do not claim a 100% production-grade or certified enterprise system without independent security, authentication, privacy, load and disaster-recovery evidence.

For structured upkeep, see [`.agents/skills/agentverse-project-memory/SKILL.md`](.agents/skills/agentverse-project-memory/SKILL.md).