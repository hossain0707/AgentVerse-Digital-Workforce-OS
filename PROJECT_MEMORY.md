# AgentVerse — Project Master Memory

> **Last reviewed:** 2026-10-29 (Asia/Seoul)  
> **Purpose:** Canonical cross-session handover and project continuity for the independent AgentVerse Digital Workforce OS. Read this file *before* making changes.  
> **Repository:** https://github.com/hossain0707/AgentVerse-Digital-Workforce-OS  
> **Checked main HEAD before this documentation update:** `e0e19054d12015b65eb071f0b9c2ae26c3a7d508` (v0.4, 2026-10-09)  
> **Live product version checked 2026-10-29:** `0.4` via `/api/engine/status`.  
> **Owner / copyright:** Md Najmul Hossain. `LICENSE`: proprietary; all rights reserved.  
> **GitHub visibility warning:** The GitHub connector reported **PUBLIC** on 2026-10-29; earlier README/deployment documentation describes the repository as private, which is now stale. Do not assume privacy. Do not change visibility without explicit permission.

## 1. Executive project identity

**AgentVerse — Digital Workforce OS** is an independent AI digital employee platform, not the user's NEXUS-100 orchestration system and not Falvorn AI. Its long-term vision is a marketplace and education/career operating system where digital employee identities persist over time, accumulate evidence-backed skills, perform authorized work, use model and tool integrations, and may be hired, rented, licensed, or transferred under controlled contracts. Users should be able to create, educate, edit, operate, assess, and port AI employees across compatible environments. Future institutional training, employer isolation, resales and contributor rewards are *planned product capabilities*, not current live-service guarantees.

**Important distinction:** Three experiences currently coexist:
1. **Public animated world**: interactive conceptual simulation, not actual autonomous employees or transactions.
2. **Public v0.4 local-first workspace**: the usable free beta with agent templates, uploaded knowledge, teaching notes, offline tools, Cloudflare Workers AI task inference, feedback, exports and local MCP bridge.
3. **Separate local FastAPI marketplace v0.2**: Python + SQLite operations for contracts, ownership, demo credits, training review, employer-scoped notes, and optional external model execution. It is **not publicly hosted** and **must not be exposed unchanged**.

Do not merge these capabilities in marketing copy or call the combined offering 100% production-grade. The public workspace is a functional beta, not audited multi-tenant SaaS.

## 2. Important URLs (verified 2026-10-29)

| Resource | URL | Truthful purpose |
| --- | --- | --- |
| Public animated world | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/ | Ten-district concept / simulation |
| Public working employee workspace | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/workspace.html | Free local-first employee operations |
| Investor tour | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/investor.html | Simulated hiring and career passport pitch |
| Local MCP setup guide | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/mcp-setup.html | PC-compatible stdio MCP instructions |
| Downloadable MCP bridge | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/downloads/agentverse-mcp.mjs | Local Node.js bridge from exported JSON |
| Cloudflare API status | https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/api/engine/status | Reports service `AgentVerse working beta`, version `0.4`, `ai:true` |
| GitHub repository | https://github.com/hossain0707/AgentVerse-Digital-Workforce-OS | Source (currently public according to GitHub) |
| Cloudflare console | https://dash.cloudflare.com/ | Worker deployment/monitoring; authentication required |

The public status endpoint reports an AI binding, **not** proof that a live inference request always succeeds. Free quotas and operational errors still apply.

## 3. Technology and code map

### Public site and local-first worker

- `public/index.html` — animated digital city and project concept; preserve existing animation.
- `public/investor.html` — standalone investor flow; all simulated hires, prices and qualifications are illustrative.
- `public/workspace.html` — practical employee interface; tabs: Work, Knowledge, Teach, Edit, History, ChatGPT & PC.
- `public/engine-app.mjs` — browser UI/controller, data import/export, IndexedDB persistence with localStorage fallback, source display, assignment execution and user feedback.
- `public/engine-core.mjs` — pure-ish domain model, employee presets, knowledge ingestion, lexical document chunk retrieval, bounded AI context, teaching, task and owner review records, backup validation/migration and offline tools.
- `public/engine.css` — responsive workspace styles.
- `public/service-worker.js`, `public/workspace.webmanifest`, `public/agentverse-icon.svg` — installable/limited offline shell.
- `worker/index.mjs` — Cloudflare Worker with `/api/engine/status` and `/api/engine/run`; Workers AI binding `AI`, global/per-IP rate limits; bounded request/response sizes; no public third-party tool execution or centralized agent histories.
- `wrangler.jsonc` — deploy entrypoint, Worker script and asset scope; **Cloudflare project Git build root `/`**, publish assets only from `./public`, main script `./worker/index.mjs`. Preserve the free plan and existing bindings.
- `public/mcp-setup.html`, `public/downloads/agentverse-mcp.mjs` — user-facing local integration help and downloadable no-dependency Node.js bridge.
- `tools/agentverse-mcp-runtime.mjs`, `tools/build-mcp.mjs` — MCP bridge implementation/build utility.

### Local-only legacy operational backend (separate)

- `agentverse/app.py`: FastAPI auth, user-scoped marketplace, assets, contracts, learning, tasks and scoped memory APIs; development SQLite.
- `agentverse/commerce.py`, `agentverse/changes.py`: demonstration sale allocation and additive schema/contract operations.
- `static/customer.html`, `static/index.html`, `static/world.html`: local buyer portal, command center, and animated world at local FastAPI routes.
- `integrations/mcp_server.py`: local Python MCP adapter using local API bearer token (different from public downloadable bridge).
- `START_WINDOWS.bat`, `start_mac_linux.sh`, `requirements.txt`, `Dockerfile`, `docker-compose.yml`: local development/install helpers, **not proof of production deployment**.
- `tests/test_flows.py`, `tests/test_marketplace_v2.py`: backend regression coverage.

### Source documentation already present

- `README.md`: overview and quickstart, includes some historical text.
- `docs/FREE_PUBLIC_BETA.md`: user instructions and truthful v0.4 scope.
- `docs/WORKING_BETA_READINESS.md`: release evidence, security boundaries and production gaps.
- `docs/PRODUCT_SPEC.md`: intended full lifecycle and actor access matrix, largely reflects v0.2 blueprint.
- `ARCHITECTURE.md`: target system architecture; not all services exist.
- `DELIVERY_STATUS.md`: historical v0.2 snapshot, not a current certification.
- `SECURITY.md`: known restrictions.
- `DEPLOY_CLOUDFLARE.md`: deployment notes; **incorrectly says repo is private as of 2026-10-29**.

## 4. v0.4 features — what is genuinely usable

The user opens the Cloudflare workspace without registration/payment. New browser visits start with two employees and can choose from six role templates, including research, tutoring/education, software, data and other professional workflows. The browser stores each employee's name, role, operating instructions, unique local identity, text knowledge, owner lessons, task outputs, source labels, and user evaluation history.

Knowledge ingestion: typed/pasted material or **readable** `.txt`, `.md`, `.csv`, `.json`, `.log` files. Each employee supports up to 12 documents of up to 60,000 characters per document according to current UI; documents are chunked and ranked by lexical overlap with the assignment. Relevant excerpts are included in the Cloud AI prompt with labels such as `[Source 1]`. This is **not** embeddings/RAG with a vector database, web research, OCR, automatic scientific verification, or ingestion of PDF/DOCX.

Teaching: save instructions and examples and rate completed work. Recent lessons and owner evaluation notes are used as bounded prompt context for later tasks. No model weights are updated, no university accreditation is implied and no autonomous self-learning is achieved.

Execution: `Cloud AI` calls the Cloudflare-hosted `@cf/meta/llama-3.1-8b-instruct-fp8` model if free quotas and rate limits allow; returned text is recorded locally as unverified AI output. `Offline` modes include local knowledge search, deterministic plan, checklist and extractive summary. An offline template is **not** genuine LLM reasoning. The app cannot browse websites, operate a user's PC, execute arbitrary code, connect to cloud accounts or run private external tools.

Persistence: IndexedDB preferred; localStorage fallback; exported JSON records include documents, lessons, task history and feedback; older v0.3 backups can migrate. No central AgentVerse account, shared cross-device cloud sync, encrypted remote vault or server backup. JSON backups are unencrypted; users must protect them and export regularly.

Integrations: **manual ChatGPT** copy/paste task prompt and optional answer import; downloadable local **stdio MCP** bridge for compatible clients, typically Node.js 20+ and a selected export file. Its tools read the selected file, and explicit `consent:true` is needed for writes to a *new* backup; no arbitrary system tools. **Direct hosted authenticated ChatGPT remote MCP/OAuth is NOT implemented.** ChatGPT Plus/Pro is not a transferable OpenAI API key.

## 5. Intended full marketplace — current implementation boundary

The *local* v0.2 backend prototypes buyer/company/trainer/registrar roles, agent passports, sales/resales, short-term rentals, contract expiry, owner-approved renewals, offered/accepted buyouts, verified-by-local-registry training evidence, simulated commissions/trainer rewards, separate employer notes and revocable task access. Optional tasks can use a server-provided OpenAI-compatible model key. SQLite, demo/test users, local credentials and incomplete authorization/compliance make it unsuitable for public hosting. No money moves; the live public page does not expose the backend or contracts.

Long-term roadmap: real customer accounts, employer/tenant isolation, durable encrypted cloud storage and backups, controlled education/evaluation, tools and safe runtimes, genuine contract/licensing workflows, remote authenticated MCP, billing/legal compliance when payments are eventually enabled. User currently wants public access **free of charge** and does not want paid Cloudflare or payment services activated without approval.

## 6. Deployment and operational guardrails

- **Cloudflare Worker name:** `agentverse-digital-workforce-os`; account-specific `workers.dev` hostname shown above.
- **Git integration:** `hossain0707/AgentVerse-Digital-Workforce-OS`, branch `main`.
- **Git build root:** `/` (repository root, never `./public`).
- **Build command:** blank. **Deploy command:** `npx wrangler deploy`.
- **Static assets:** `./public` per Wrangler; do not publish `static/` or Python/backend files.
- **Worker bindings:** `AI` for Cloudflare Workers AI, `PER_IP`, `GLOBAL_AI` rate limiters. Configured model `@cf/meta/llama-3.1-8b-instruct-fp8`. Wrangler currently lists limits of 2 requests/min per IP and 12 requests/min globally (best effort), subject to service allowances.
- **Billing:** Free plan; visitors pay nothing. Free AI capacity is limited and not a guaranteed unlimited service. No hidden paid fallback, paid models or domains without explicit consent.
- **Deployment verification:** do not treat GitHub commits as successfully published until public pages and `/api/engine/status` have been checked. For a docs-only push, do not manually trigger deployment or change runtime settings.
- **Security:** never push secrets, API keys, sample login passwords or private customer records into memory files. The repository is **currently public**; do not confuse a public repository with the public-only asset directory or suggest proprietary source is inaccessible.

## 7. Tested evidence, accuracy and unresolved gaps

**Recorded v0.4 release testing (2026-10-09):** 16 Node engine/Worker tests passed, a local stdio MCP integration flow passed, and a Chromium DOM test with *mocked* cloud AI and storage covered knowledge, citation display, saved lessons, task flow, feedback, manual ChatGPT handoff and mobile layout. These are previously reported tests, **not rerun as part of this documentation update**. On 2026-10-29, public GET checks confirmed the animated world, workspace, investor tour, MCP guide and version `0.4` status route are reachable. A configured AI binding is not a verified end-to-end live inference result.

**Still not done:** externally audited authentication, organization/multi-tenant model, encrypted central storage and backup recovery, independent penetration test, robust browser/file safety review, PDF/DOCX ingestion, semantic vector search, full-grade tool sandbox, automated trusted learning evaluations, direct hosted ChatGPT app integration, production customer payment settlement and legal requirements, production reliability/load testing, real collaborative multi-user marketplace, transparent customer support/incident operations.

**Documentation conflicts to resolve later:** GitHub visibility is `public` but old README/`DEPLOY_CLOUDFLARE.md` say private; `DELIVERY_STATUS.md` is an October 9 v0.2 snapshot; `ARCHITECTURE.md` describes a target design. Before changing these files, avoid overwriting historical evidence; update labels explicitly.

## 8. Next engineering priorities (not committed as product capabilities)

1. Confirm desired access model and legal/privacy requirements. Add authenticated user accounts and secure server-backed persistence with per-user/organization authorization and recovery; test backups and deletion.
2. Implement real document pipeline (PDF/DOCX extraction where lawful, chunking/indexing, semantic retrieval with citation/evaluation and customer source permissions). Never ingest arbitrary private PC data automatically.
3. Add user-managed model adapters and usage policies: supported providers, optional local inference, per-user budgets/limits, secrets vault, and explicit user consent.
4. Implement remote MCP/OAuth with user-scoped permissions and supported ChatGPT/Claude clients; avoid claiming a direct ChatGPT account link without it.
5. Give agents meaningful benchmarked skills, evaluation regressions, approval workflow, traceable lessons, versioned capability reports, and controlled tools. Avoid unbounded autonomous learning claims.
6. Release a secure, multi-user marketplace only after tenant isolation, contracts, data rights and billing/legal design are reviewed. Keep free-first plan for now.
7. Audit repository visibility/IP posture, update stale deployment docs, protect main branch, add monitoring, incident playbooks and release automation.

## 9. Exact handover/update protocol

1. Read `PROJECT_MEMORY.md`, `AGENTS.md`, `project_memory/README.md`, latest dated memory, and related module memory before implementation.
2. Inspect **current** GitHub HEAD, source changes, tests, deployment status and user instructions. Current source wins over stale memory.
3. Clearly label each fact as **implemented**, **tested**, **deployed**, **planned** or **unknown**. Do not promise 100% correctness or security from a successful build.
4. Update root `PROJECT_MEMORY.md` for relevant state changes, append a new dated entry in `project_memory/PROJECT_MEMORY_YYYY-MM-DD.md`, and update affected module file(s). Retain historical events; never silently erase a prior failure.
5. A GitHub write requires specific user authorization. Do not silently auto-push or turn on background GitHub synchronization. ChatGPT **Project → Sources is not automatically synchronized**; a user can manually attach a downloaded root memory file there.
6. Do not touch unrelated repositories, do not activate paid services, do not publish backend secrets, do not deploy public Python demo, do not change license/visibility/payment policy without explicit authorization.

## 10. Memory index

- `project_memory/README.md` — index, scope and update rules.
- `project_memory/PROJECT_MEMORY_2026-10-29.md` — baseline chronology/status snapshot.
- `project_memory/modules/01-product-and-roadmap.md` — goals, personas and honest capability boundaries.
- `project_memory/modules/02-public-engine-and-knowledge.md` — working architecture and data lifecycle.
- `project_memory/modules/03-marketplace-backend.md` — local Python app, contracts, security gaps.
- `project_memory/modules/04-deployment-and-integrations.md` — Cloudflare, local MCP, model and release operations.
- `project_memory/modules/05-testing-and-release.md` — evidence, test commands, quality gates and next release plan.
- `.agents/skills/agentverse-project-memory/SKILL.md` — agent-facing memory-maintenance workflow.

---

**Source-of-truth hierarchy:** actual source, live deployment and test results > current canonical memory > historical dated memory > speculative roadmap. Never imply this file updates automatically.