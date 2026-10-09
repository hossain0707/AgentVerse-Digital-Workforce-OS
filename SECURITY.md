# Security policy and prototype restrictions

**AgentVerse v0.2 is a development prototype. Do not expose its FastAPI backend to public internet traffic or accept real customer data or payments.**

## Current safeguards

- Backend demo mode must be *explicitly* selected with `AGENTVERSE_DEMO=1`. The local launch scripts opt into demo mode and bind to `127.0.0.1`.
- Non-demo Python imports require `AGENTVERSE_SECRET` at least 32 characters, and public registration is disabled unless explicitly enabled. These are launch blockers, not a production security guarantee.
- Login tokens are HMAC-signed and checked server-side. Server checks role and current contract/ownership for employee operations.
- A contract-to-own transfer requires a current-owner offer and active renter acceptance; renewals require current-owner review.
- Task output is discarded if ownership/contract permissions change during an external model call.
- Employer notes and outputs are stored per user/agent and are **not portable** into a different buyer's authorized context. The originating employer can export and delete their own notes after offboarding.
- All money events are illustrative ledger entries. No checkout API, payment card handling or provider transactions exist.
- The public Cloudflare deployment publishes `./public` static assets and a restricted Workers AI route only. It does not publish FastAPI, database, passwords or user accounts. Browser records stay on that visitor's device; AI-mode messages are sent to the Cloudflare model for inference. See [FREE_PUBLIC_BETA.md](docs/FREE_PUBLIC_BETA.md).

## Known limitations to fix BEFORE external launch

- SQLite single-process development setup; no managed tenancy, encryption at rest or backup/restore procedure.
- No audited OAuth/SSO/MFA, revocable session registry, email verification, login rate limiting or brute-force defence.
- Basic PBKDF2 password hashing is present; consider updated password storage and secret rotation.
- Browser demo uses bearer tokens for APIs; require CSRF/cookie strategy and CSP/XSS hardening for production.
- Training reviewer currently approves by role, without institutional attestation. Reviewers must reject employer secrets in portable course labels.
- The backend can call a user-configured OpenAI-compatible provider using a server-side key; risk controls, output validation, provider spend controls and full audit trails are not implemented.
- Self-improving models, continuous crawling/observation, cloning prevention and customer payment settlement do not exist.
- Legal requirements (privacy, cross-border data transfers, contracts, terms, tax, money transmission where applicable) require professional review.

## Reporting security concerns

Contact the repository owner through private channels. Do not submit private user data, production secrets, or working exploitation details to a public issue. Rotate exposed credentials immediately.
## Free public beta (Cloudflare Worker)

The new public `/workspace.html` is **local-first**, not a production multi-tenant server. Its lessons, agents and history are saved in each browser; there is no cloud account or backup. Its AI endpoint uses a specific Workers AI Free-plan model, input/output caps, same-origin checks and best-effort global/per-IP rate limiting. No payments, open API keys, stored user secrets, employer authorization claims, or Python backend are exposed. Only explicit AI-mode tasks leave the browser. See [the scope and launch-safety document](docs/FREE_PUBLIC_BETA.md).
