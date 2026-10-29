# Module 03 — Local FastAPI Marketplace / Contracts / Security

**Reviewed:** 2026-10-29. **State:** v0.2 **local development prototype only**. **Do not deploy publicly unchanged.** This is distinct from the live v0.4 Cloudflare browser workspace.

## Core source

- `agentverse/app.py`: FastAPI app, SQLite schema, HMAC bearer session demo, API endpoints, contract authorization, optional LLM call.
- `agentverse/commerce.py`: illustrative sale allocation and trainer contribution rules.
- `agentverse/changes.py`: supplementary schema for contracts, renewals and buyout/ownership changes.
- `static/customer.html`: buyer portal served by FastAPI at `http://127.0.0.1:8000/start`.
- `static/index.html`: local command center at `/`; `static/world.html`: simulated city at `/world`.
- `integrations/mcp_server.py`: local Python stdio MCP adapter using authorized FastAPI token.
- `tests/test_flows.py`, `tests/test_marketplace_v2.py`: demonstration regression tests.

## Implemented demo concepts

The local app supports demo users and records for registrars, companies, buyers and trainers, agent passports, persistent SQLite records, rental contracts and expiry, permanent ownership transfers/resale listing, owner-approved renewals, owner-offered renter buyouts, revenue/trainer reward ledger simulation and evidence-reviewed-by-registry training updates. Its workbench stores agent-specific employer notes and tasks, maintains scoped access checks, discards model responses if authorizations change during an external call, and offers former employers export/delete of their own records.

**All economic figures are simulated credits; no real settlement or legal ownership transfer.** The source distinguishes reviewer-verified *platform evidence* from institutional academic accreditation. The local demo passes historic tests, but that does not establish real enterprise isolation.

## Development-only startup

- Python 3.11+.
- Windows: `START_WINDOWS.bat` from an extracted repo; macOS/Linux: `bash start_mac_linux.sh`.
- Manual: install `requirements.txt`, explicitly set `AGENTVERSE_DEMO=1` only for localhost demonstration, then `uvicorn agentverse.app:app --reload`.
- Local buyer workspace `/start`; Swagger docs `/docs`. **Never** bind demo service to public `0.0.0.0` for production traffic.
- Non-demo mode requires an explicit `AGENTVERSE_SECRET` of sufficient length and disables public registration by default; these are not sufficient production hardening.
- Server-managed `AGENTVERSE_MODEL_KEY`, `AGENTVERSE_MODEL_NAME`, `AGENTVERSE_MODEL_URL` can optionally call a compatible model. Credentials must not enter GitHub or memory files.

## Current deployment boundary

Cloudflare Wrangler publishes only `./public` and a separate `worker/index.mjs` AI route. The full Python backend, SQLite database, private context and local demo authentication **are not reachable** at the workers.dev URL. The investor preview's hiring interfaces do not invoke these FastAPI flows.

## Major security gaps before any public backend release

- Real account identity, verified registration, OAuth/MFA and revocable sessions.
- Secure managed database with tenant organization boundaries, migration strategy, encryption/backup/recovery and deletion policies.
- Independent authorization review and adversarial tenant isolation testing.
- Credential manager, secret rotation, rate limits, abuse mitigation, audit logs and safety policies for model/tools.
- Token/cookie security, privacy/consent agreements, enterprise retention and processor agreements, incident playbooks.
- Commercial licensing/transfer rights, dispute settlement, compliance and (only if enabled later) payment gateway / tax / refund support.
- Application health checks, CI/CD, infrastructure monitoring, load testing and independent security assessment.

No public launch should imply those controls exist until tested. The **public repository is presently visible** (GitHub check 2026-10-29), so references to 'private code' in older docs are outdated; do not publish credentials or databases.
