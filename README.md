# AgentVerse — Digital Workforce OS

AgentVerse is an independent research prototype for a marketplace of persistent AI digital employees. It includes a local FastAPI application, SQLite-backed identities and contracts, a simulated marketplace and accounting ledger, trainer-reviewed achievements, employer-isolated private notes, a task workbench with optional model-provider execution, a local MCP adapter, and an immersive animated concept world.

> **Development prototype — not production ready.** Payments, credentials, professional experience, continuous autonomous learning, employer transfers, and revenue splits shown in the prototype are demonstrations, not real-world guarantees. Never expose the demo login accounts on the public internet.

## Quick start

Python 3.11+ required.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn agentverse.app:app --reload
```

Open `http://127.0.0.1:8000/` for the application, `/world` for the animated city, and `/docs` for REST documentation. On Windows you can use `START_WINDOWS.bat`; on macOS/Linux use `bash start_mac_linux.sh`.

Sandbox accounts in local demo mode: `admin@agentverse.test`, `professor@agentverse.test`, `company@agentverse.test`, `trainer@agentverse.test`; password `demo1234`. **Do not deploy these accounts or the prototype publicly.**

## Core concepts

- Persistent employee identity and portable, verified career achievements
- Academy submissions and administrator review; no fabricated third-party accreditation
- Hiring, time-limited rental, permanent transfers, and resale workflows
- Employer-specific notes isolated from employees' portable public skills
- Simulated financial accounting and trainer contribution rewards
- REST workbench, optional configured model provider, and local stdio MCP integration
- Standalone animated long-term AgentVerse ecosystem simulation

## Run tests

```bash
pip install -r requirements-dev.txt
pytest -q
```

## Current engineering limitations

This is not yet a continuously self-improving digital scientist, legally verified hiring marketplace, production payment service, public ChatGPT marketplace app, or accredited education platform. Before external launch, implement robust authorization, OAuth/SSO, real billing and refund flows, compliant legal terms, secure cloud tenancy and secret management, external agent evaluation, audited memory transfer, anti-copy licensing, worker queues, automated learning with safety review, and independent security testing.

NEXUS-100 is not a dependency. For details see `ARCHITECTURE.md` and `DELIVERY_STATUS.md`.

**Project owner:** Md Najmul Hossain. No open-source license is granted by this README; any licensing terms must be added explicitly.
