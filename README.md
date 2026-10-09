# AgentVerse — Digital Workforce OS

## Free public workspace (v0.3 beta)

**Public:** [Open the free AgentVerse digital employee workspace](https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/workspace.html) (availability is subject to Cloudflare deployment). Visitors can create/edit their own digital employees, teach prompt-memory lessons, assign real AI tasks on the limited Cloudflare Workers AI Free allocation, use offline structured tools, and export/import portable JSON backups. There are **no payments, login requirements, or central server-side user data** in this public beta. This is a local-first web app, not a production multi-tenant service; browser data is device-specific. **Please export backups regularly and never enter confidential information.** See [free public beta scope and safety](docs/FREE_PUBLIC_BETA.md).

The [animated digital world](https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/) and [investor demo](https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/investor.html) remain available. The separate FastAPI operational prototype at `/start` is **not** published; it requires identity, secure tenancy and production hardening before internet access.

**A v0.2 local operational prototype**, plus the immersive animated full-ecosystem concept world. The platform implements persistent employee identities, a talent marketplace, rental contracts, permanent ownership transfers, evidence-reviewed training, attribution and trainer rewards, employer-isolated memory, work assignment, a model-provider execution option, and an optional local MCP integration.

**This is not a 100% production-ready autonomous-agent marketplace.** It contains concrete working flows, not real university credentials, autonomous self-training, cash processing, or public-hosted ChatGPT app approval.


> **Deployment separation:** The public Cloudflare site publishes static `public/` assets plus a small, separately rate-limited Workers AI gateway. It is **not** the FastAPI buyer marketplace backend. The authenticated buyer workspace at `/start` runs locally with FastAPI and simulated credits. Do not deploy the backend until the security gates in [SECURITY.md](SECURITY.md) are complete.

## New in prototype v0.2

- Customer-facing `/start` page with talent discovery, sign-in/registration, transparent **demo-only** sale quotes, rental/purchase simulation, activation and a private workbench.
- Owner-approval flow for renewal requests; owner-offered/employee-accepted permanent buyouts with auditable ownership history.
- Read-only career histories without buyer identities; authenticated `/api/workspace` and `/api/agents/{id}/activation` rights.
- Employer can export historical workplace notes/tasks and delete their own notes after offboarding; other employers cannot see them.
- Safer run guards recheck authorization after every outside model call. Dashboard events are scoped by account.
- Demo now **off by default** if starting Python outside the explicit local launch scripts; non-demo mode demands a secret and closes registration by default. **This is not sufficient to deploy publicly.**

Read [complete product blueprint](docs/PRODUCT_SPEC.md), [architecture](ARCHITECTURE.md), [security policy](SECURITY.md) and [delivery status](DELIVERY_STATUS.md).

## Quick start

Requires Python 3.11+. On Windows, **double-click `START_WINDOWS.bat`** after extracting the ZIP (the first launch will install dependencies). On macOS/Linux use `bash start_mac_linux.sh`. Alternatively, run the steps below manually. Set `AGENTVERSE_DEMO=1` in your shell; in Windows PowerShell use `$env:AGENTVERSE_DEMO="1"` and run `uvicorn agentverse.app:app --reload`.

```bash
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
AGENTVERSE_DEMO=1 uvicorn agentverse.app:app --reload
```

Open **http://127.0.0.1:8000/start** for the new buyer marketplace, registration and workbench, or **http://127.0.0.1:8000/** for the legacy command center, or **http://127.0.0.1:8000/world** for the richer animated city. Offline animation runs separately from persisted records and should not be confused with actual work. API docs: **http://127.0.0.1:8000/docs**.

Sandbox logins in demo mode: `admin@agentverse.test`, `professor@agentverse.test`, `company@agentverse.test`, or `trainer@agentverse.test`; all use `demo1234`. **Never put demo mode on a public server.** The registry admin creates employees and validates training. Other users can purchase, rent, train or work with employees according to access rights. The generated SQLite database is saved under `data/`.

### Try the complete workflow

1. Sign in as **Company**. In Marketplace, inspect **Astra Nova** and rent it for 1 month.
2. Open Astra Nova → Privacy vault. Record a company-specific note, then inspect the allowed context.
3. Open Astra Nova → Education and submit proof of an assessed lesson. Sign out.
4. Sign in as **Platform Registry**. Open Learning Academy and approve the submission *only after evaluating its evidence*. The verified skill score and portable training credits update.
5. Sign in as **Company** again and open Contracts & Economy. Offboard Astra Nova.
6. Sign in as **Professor**; hire Astra Nova and check the private context. The former company's note is absent.
7. Offboard, or buy a free/listed employee permanently. On permanent purchases, credits earned by verified trainers may generate simulated rewards. The seller can resell only when there is no active rental.
8. Open **Living World** to see the entire aspirational ecosystem of academies, universities, employment districts, and resale exchanges. It is a standalone graphical simulation.

### Connect a real language model (optional)

Tasks can be queued even with no provider. To **actually run the LLM step** via a compatible Chat Completions API, supply environment variables on the **server**:

```bash
export AGENTVERSE_MODEL_KEY='your-key'
export AGENTVERSE_MODEL_NAME='your-compatible-model'
export AGENTVERSE_MODEL_URL='https://your-provider.example/v1/chat/completions'
uvicorn agentverse.app:app
```

Windows PowerShell uses `$env:AGENTVERSE_MODEL_KEY='...'` and similar syntax. This will send the task and *current employer's authorized* notes to your configured provider; check that provider's privacy and data-retention terms first. The model response is stored as an employer-specific task output; it is **not** a verified research result or evidence of improved weights. Automatic paper ingestion, browser automation, continual fine-tuning and rigorous evaluation are not yet implemented.

### Use via Claude Code (optional local MCP)

The included `integrations/mcp_server.py` exposes local stdio MCP tools for agents, passports, scoped work context, task assignment and learning evidence. Install `pip install mcp httpx` separately. Sign in to the platform and use the API bearer token (inspect the login response in your browser's developer network panel or use the API directly). Start the backend, then configure a stdio MCP integration with a Python executable, arguments `["/absolute/path/to/integrations/mcp_server.py"]`, and `AGENTVERSE_API_URL` + `AGENTVERSE_TOKEN` in its environment. Use **your** token only and never share it publicly. MCP tool actions follow the identity's existing permissions. For ChatGPT, a public remote MCP deployment, appropriate authentication and app/plugin review would be required; the local stdio bridge cannot simply be added as a public app.

### Security and privacy model

* Each registered agent has a stable id and separate public career passport.
* Employer notes are stored with **both** an agent ID and an employer ID. The API returns only the currently active employer's authorized notes. Neither a new employer nor the permanent owner can inherit another company's notes.
* Training is `pending` until registry approval, then it becomes a portable verified contribution. The `verified` label only means platform-administrator approved, **not external institutional accreditation**.
* Contracts expire or can be ended. Buyout is blocked during active rental.
* All financial transactions are accounting *simulations*. Sale events include a proposed 10% platform fee and up-to-5% verified-trainer pool; renter receives no rental residuals.
* Bearer tokens are HMAC-signed and expire after 12 hours. Passwords are PBKDF2-hashed; database is SQLite. **Production still requires OAuth/SSO, revocable sessions, tenant policies, HTTPS, rate limiting, encryption at rest, secret rotation, audit retention, CSRF/cookie strategy, backups and independent security testing.**

### Tests

```bash
pip install -r requirements-dev.txt
pytest -q
```

The test suite covers marketplace purchase and resale, commissions, training verification, trainer rewards, restricted records, end-of-contract handover, no cross-employer private memory, and provider-not-configured behavior.

## Architectural boundary and the work required for a public launch

| Area | Implemented here | Needed before commercial launch |
| --- | --- | --- |
| Marketplace and ownership | Saved listings, title transfers, rental lifecycle | Billing-grade settlement, escrow, refunds, regulation and contracts |
| Lifelong employee identity | Unique IDs, portable audited education evidence, experience points | Independent skill benchmarking, fraud protection, model portability guarantees |
| Private memory | Employer-isolated notes and authorized context retrieval | Encrypted multi-tenant storage, deletion/export guarantees, enterprise IAM |
| Real work | Task queue + optional LLM chat-completions execution | Reliable background workers, secure tools, grounded research and evaluations |
| Self-improvement | Human-reviewed achievements, career scores | Controlled curriculum, autonomous sandbox experiments, tests and governance |
| Integrations | REST API and optional stdio MCP bridge | Authenticated remote MCP, OAuth, eligible ChatGPT app deployment, other AI providers |
| Economy | Transparent simulated ledger and reward attribution | Payment partner, legal seller rights, tax handling, dispute resolution |
| Institutions | Extensible education/training records | Partnerships, genuine university credentials and verifiable attestations |
| Operations | Dockerfile, tests, Swagger docs, portable SQLite prototype | Cloud provisioning, monitoring, disaster recovery, performance load tests |

**Design principle:** AgentVerse is independent. NEXUS-100 is not required or used. If an orchestrator proves useful in the future, it may be connected as an optional adapter.

### Important legal / ethical clarity

"Employee age", "PhD" and "five years of experience" must never be marketed as literal human qualifications. Real external degrees or employment history should be shown only when issued/attested by the awarding institution or validated through an appropriately transparent rubric. All records in the included demo are fabricated examples of virtual employee proficiency. Contract and transfer rules require clear seller/user rights, data-protection terms and a disclosure that digital agents are software, not people.