---
name: agentverse-project-memory
description: Maintain accurate cross-session AgentVerse master memory, dated history, and module summaries after explicitly authorized project updates; never auto-push or claim ChatGPT Project Sources synchronization.
---

# AgentVerse Project Memory Manager

## Purpose

Keep the AgentVerse Digital Workforce OS repository understandable across handoffs and tooling sessions. This skill is **not** an automatic agent, deployment workflow, GitHub push trigger, or remote ChatGPT Project Sources integration.

## Read sequence

1. `PROJECT_MEMORY.md` — canonical status, URLs, guardrails.
2. `project_memory/README.md` — module index and update conventions.
3. Most recent dated `project_memory/PROJECT_MEMORY_YYYY-MM-DD.md`.
4. Affected `project_memory/modules/*.md`.
5. Current GitHub source (branch, HEAD, commits, tests) and, when relevant, public deployment. Treat source/runtime as more authoritative than stale memory.

## On explicit user instruction to update memory

1. Gather verified facts from source and tools; compare past entry against latest code and deployment. Identify contradictions and report them explicitly.
2. Update root memory with new status and concrete risk/next work, without deleting unrelated or unresolved concerns.
3. Update affected module memory only; distinguish actual implementation from design or roadmap.
4. Add a dated activity log or append to today's log. Record SHA, date/time, changed paths, exact tests run, actual result, hosted URL verified (or unavailable), open defects and next owner action.
5. Check that documents contain no secrets, credential values, sensitive customer data or unsupported marketing claims.
6. Commit/upload only when specifically authorized. A documentation commit may cause CI or Cloudflare automatic builds; avoid unnecessary manual deployment or spending.
7. State clearly that GitHub repo memory does **not** automatically update a ChatGPT Project's Sources. To reuse this memory there, the user may manually attach `PROJECT_MEMORY.md`.

## Invariants

- Public v0.4 = free **local-first** browser employee engine + bounded Workers AI + manual export + local stdio MCP.
- Local v0.2 = FastAPI/SQLite **prototype**, not public multi-tenant SaaS.
- Investor/animated pages are simulations and not hosted contract/payment workflows.
- No real customer payment, guaranteed free unlimited AI, audited security, institutionally accredited degrees, autonomous model self-training or direct ChatGPT account connection.
- User owns proprietary IP; no license, repository visibility, Cloudflare free/paid plan or financial alteration without explicit approval.
- GitHub repo reported **public** 2026-10-29 even though legacy docs claim private; verify again before subsequent action.

## Required output checklist

- [ ] Canonical project memory updated or confirmed current.
- [ ] Dated entry created for the session.
- [ ] Related module histories reconciled.
- [ ] GitHub SHA / source facts checked.
- [ ] Tests and live deployment assertions correctly qualified.
- [ ] Security and costs checked; no secrets or unwanted paid actions.
- [ ] Separate ChatGPT Project Source sync never implied.
