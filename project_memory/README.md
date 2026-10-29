# AgentVerse Project Memory — Index and Protocol

This directory preserves project-wide and module-specific development context so a future ChatGPT, Claude, Codex, or human maintainer can continue the same **AgentVerse Digital Workforce OS** without relying on unstated conversation memory.

## Read first

1. [`../PROJECT_MEMORY.md`](../PROJECT_MEMORY.md): canonical current project identity, URLs, architecture, functionality, restrictions, risk and roadmap.
2. [`../AGENTS.md`](../AGENTS.md): developer-agent rules that protect the live site, licensing, privacy and release quality.
3. [`PROJECT_MEMORY_2026-10-29.md`](PROJECT_MEMORY_2026-10-29.md): baseline chronological history.
4. Module files from [`modules/`](modules/) for the subsystem you are changing.
5. Exact active source files, current branch, unit/integration test results, and runtime deployment. **Never trust memory above source evidence.**

## Module memory map

| File | Purpose |
| --- | --- |
| [`modules/01-product-and-roadmap.md`](modules/01-product-and-roadmap.md) | Product concept, customer needs, phases, promised vs planned features |
| [`modules/02-public-engine-and-knowledge.md`](modules/02-public-engine-and-knowledge.md) | Browser UI, persistence, knowledge, teaching, retrieval, task execution |
| [`modules/03-marketplace-backend.md`](modules/03-marketplace-backend.md) | Local-only FastAPI contract/ownership/economy prototype and security |
| [`modules/04-deployment-and-integrations.md`](modules/04-deployment-and-integrations.md) | Cloudflare, Workers AI, local MCP, ChatGPT and platform operations |
| [`modules/05-testing-and-release.md`](modules/05-testing-and-release.md) | Evidence, release checks, production risk and remaining quality gates |

## Update workflow

- **When a real change is requested and authorized:** inspect the current repository and deployment first. Update relevant source and tests. Report test outcomes honestly.
- **Update the canonical root `PROJECT_MEMORY.md`:** summarize the current product status, significant architectural choices, feature changes, unresolved issues and next actions. Keep it readable and current.
- **Update the relevant module memory:** actual implemented behavior, paths, test commands, risk and design decisions; do not overwrite unrelated subsystem histories.
- **Create or append a dated file** `PROJECT_MEMORY_YYYY-MM-DD.md` with timeline, commit SHA, links, tests performed, deployment verification, risks, handover. Preserve older dates.
- **Do not publish automatically:** GitHub commits, Cloudflare deployments, TinyFish wallet spending, paid services, repository visibility, IP/license modifications and ChatGPT Project Source changes need explicit user direction. A docs-only commit might trigger a linked CI/deployment; do not claim otherwise.
- **No sensitive data:** GitHub is currently PUBLIC according to the connector (2026-10-29). Never store credentials, API tokens, private prompts, employer files, database dumps, payment details or customer PII in these Markdown files.
- **ChatGPT Project → Sources:** these repo files are not synchronized into a ChatGPT Project automatically. Download `PROJECT_MEMORY.md` and manually attach it to that Project's Sources if needed.

## Conventions

- Use `Implemented / Tested / Deployed / Planned / Blocked / Unknown` labels where meaningful.
- Stamp verification date and separate historical tests from tests performed in the current task.
- Do not describe browser-local knowledge as an encrypted multi-tenant employer vault.
- Do not advertise unlimited free AI inference, accredited degrees, actual ownership/payment settlement or official ChatGPT integration.
- Distinguish `public/` Cloudflare free beta, `static/` legacy local UI, `agentverse/` local FastAPI.
- Preserve all rights under Md Najmul Hossain and the existing proprietary `LICENSE` unless the owner authorizes a licensing change.

**Initialized:** 2026-10-29.