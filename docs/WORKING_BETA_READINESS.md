# AgentVerse v0.4 — launch-readiness and security evidence

**Owner:** Md Najmul Hossain  
**Product status:** Free local-first, usable public beta. **Not an independently audited enterprise-grade multi-tenant SaaS.**

## What is implemented and usable now

| Capability | Actual implementation | Important boundary |
| --- | --- | --- |
| Prebuilt AI employees | Six curated role templates; two starter employees appear on first visit | The model is shared, not a trained specialist model per employee |
| Persistent employee identity | UUID-based employee records with editable roles and instructions | Identity is per browser and portable backup, not a cloud account |
| Knowledge library | Text/Markdown/CSV/JSON/log upload and pasted documents; lexical chunk retrieval and prompt source labels | No PDF/DOCX parser, semantic embeddings or web crawling |
| Education and feedback | Explicit user lessons, owner-rated task history, feedback in next prompts | No model fine-tuning, academic degrees or independent skill scoring |
| AI execution | Cloudflare Workers AI model with per-IP/global rate limits and free-quota failure | Quota shared across users, not guaranteed unlimited; output needs review |
| Offline execution | Deterministic knowledge search, plan, checklist and extractive text summary | Not a generative model or live external research |
| Persistence | IndexedDB first; migration from v0.3 browser localStorage; limited fallback and user-exported JSON backups | No cloud-sync, password protection, encrypted tenant vault or remote recovery |
| Local AI-client bridge | Downloadable stdio MCP script (Node.js 20+, zero dependencies), reads exactly a selected portable backup; explicit approval before writing NEW export | No automatic website synchronization, no verified ChatGPT remote MCP connection |
| Manual ChatGPT flow | Copy task/employee context, use existing ChatGPT session, paste result and save it as external work | ChatGPT Plus/Pro does not give a provider API key; handoff is manual |
| UI | Responsive desktop/mobile interface, limited installable offline shell, explicit privacy notices | Offline shell can't make cloud requests without connectivity |
| Security | Separate static site/Worker AI gateway; same-origin requests; explicit model invocation; no public Python demo backend; safe DOM text insertion | Third-party audit, compliance, full auth/tenant data protection still required |

## Technical security boundaries

- The separate Python FastAPI + SQLite demo stays private and is NOT mounted into this Cloudflare deployment. Its sample logins must never be disclosed through public hosting.
- Worker AI route is only `/api/engine/run` and status `/api/engine/status`; request format and size validation, no server storage, no third-party tool capabilities, no auto-billing or payment processor, simple Cloudflare rate-limiting bindings; AI model is called only for user-clicked assignments.
- Reference excerpts and lessons are owner-supplied, not verified. Retrieved text is untrusted; prompt injection cannot be completely prevented by prompt wording. Never submit corporate secrets, health records, regulated data or third-party private files to shared Cloudflare inference.
- Browser state is stored only for its origin and browser profile. Exported backup JSON is readable and **not encrypted**; owners must store and share it safely.
- Static content is rendered by `textContent` or fixed markup; no untrusted HTML interpretation. HTML CSP limits scripts/styles to this origin; external websites open with `noopener noreferrer`.
- The MCP bridge reads only the JSON file explicitly passed as its sole CLI argument, uses no network libraries, exposes no arbitrary file-system tool, and writes a new export (never overwrites original) after a `consent: true` tool call. Host clients must still be trusted.

## Tests and verification commands

Run from repository root:

```bash
node --test tests/*.test.mjs
python tests/test_local_mcp.py
```

The v0.4 test set includes 16 engine/API tests and a 7-tool MCP stdio integration flow (initialize, tools/list, agent listing, knowledge search, prompt preparation, write consent and safe export). A Chromium DOM end-to-end test was also run with local storage and cloud inference mocked: creating knowledge, retrieving citations, running mocked AI, saving lessons, evaluating history, manual ChatGPT prompt and external answer, plus mobile overflow check. **This is not independent cloud-API load testing or a third-party security audit.**

In the live Cloudflare environment, additionally verify:

1. `/workspace.html`, `/`, `/investor.html`, `/mcp-setup.html`, `/downloads/agentverse-mcp.mjs` all open publicly.
2. `GET /api/engine/status` returns v0.4 and an enabled AI binding.
3. Select Astra Nova, enter a task, and run an offline Knowledge search; source excerpts appear, marked as owner-provided.
4. Run **one** Cloud AI task with a source and verify its response (subject to remaining free quota), then inspect task history.
5. Export backup JSON; reload the browser; verify IndexedDB persistence; import into a second browser and verify identity/knowledge/history survive.
6. Inspect storage/quota errors, normal/incognito modes, cross-tab warning, mobile layout, and Cloudflare free quota consumption.
7. Confirm no paid Cloudflare plan, paid AI model, premium add-ons or auto-upgrade settings were enabled.

## What must be completed before claiming full production-grade SaaS

- Audited login/signup, multi-factor authentication, account recovery, consent management, and organization/role scoping.
- Real secure multi-tenant cloud storage, encryption, backup/restore, retention policies, export/deletion controls, audit logs, uptime/incident monitoring, and tested disaster recovery.
- Document processing for PDF/DOCX, robust retrieval with source permission enforcement, task isolation, automated evaluation and quality monitoring, and optional local-model execution.
- Hosted authenticated remote MCP for ChatGPT and other hosts (OAuth2 consent, per-user scoped tokens, verified endpoint and application review where needed).
- Model spending budgets, abuse prevention, anti-bot limits and explicit pricing when moving beyond free shared inference.
- Payment settlement, refunds, tax/legal contracts and the full multi-owner marketplace, intentionally disabled for this free phase.
- Independent penetration test, privacy/legal review and ongoing operational support before accepting confidential enterprise workloads.

No software is provably “100%” bug-free or secure. Publish truthful scope, maintain versioned releases, measure failures and iterate based on evidence.