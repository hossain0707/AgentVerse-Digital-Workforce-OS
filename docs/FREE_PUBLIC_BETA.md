# AgentVerse Free Public Beta — scope and launch safety

The shareable digital workforce workspace is at `/workspace.html` in the existing Cloudflare Worker. It is an **actual editable workspace**, separate from the animated `/` and the `/investor.html` concept walkthrough.

## What works without an account or a payment

- Create, rename, re-role and delete up to 24 digital employee identities on the current device.
- Give each employee separate operating instructions and up to 80 owner-supplied lessons. Lessons influence prompts for later model calls, but do **not** change model weights or prove accredited skill.
- Run work assignments through an explicitly labeled offline planning/checklist/extractive tool (works without a provider).
- When the optional Workers AI binding is available and the free quota is not exhausted, run an **actual LLM inference request** and store the output in your own browser.
- Review up to 80 stored tasks per employee, delete lessons, export/import portable JSON backups.
- No login, credit card, payment processor, permanent online account, server-side user histories, or access to other users' data.
- The animated concept site and the investor tour remain available.

## Local-first privacy and caveats

- Agent records are saved in browser localStorage. They are NOT synced across machines, not centrally backed up, and not safe as the sole copy of valuable data. Users must export JSON backups. Browser data clearing and private-browsing sessions can delete records.
- Browser code is not a secure multi-tenant employer vault. Do not submit client secrets, confidential documents, regulated or high-risk personal data.
- **AI mode sends the selected agent role, instructions, recent user-supplied lessons and assignment to Cloudflare's model infrastructure**. Users must consent by selecting AI mode. Never silently send background prompts.
- Model outputs can be inaccurate or unsafe; require human review. The app cannot access files, run arbitrary code, browse websites, install software, fine-tune weights, or execute third-party actions.
- Training is context memory (prompting), not actual model fine-tuning. User-submitted lessons are never labeled independently verified.
- The existing Python FastAPI/SQLite backend stays **private and local-only** until a separate production-security project (identity, tenant isolation, encryption, backups, abuse protection and audit) is complete.
- The proprietary copyright and ownership under **Md Najmul Hossain** remain unchanged. Free platform access does not grant a source redistribution or resale license.

## Cost and fair use

- Static website and Worker requests run on Cloudflare Workers Free plan limits.
- Workers AI Free includes **10,000 Neurons per day** (provider terms as of October 2026). Requests fail at free quotas; users can switch to offline mode. No paid plan or billing upgrade should be enabled.
- Worker has **2 AI calls per minute per IP** and **12 per minute globally**, as best-effort protective limits. These are not billing guarantees. Maximum AI request size and model output tokens are also capped.
- Do not advertise unlimited free AI. Free plan service can be exhausted, throttled or unavailable.

## Deployment instructions for owner

Root of repository must be the Cloudflare Workers Git build root: `./` (not `./public`). The Wrangler configuration itself specifies `assets.directory = "./public"`; this safely isolates public files. Build command is blank and deploy command is `npx wrangler deploy`.

1. Keep the repository private and the Cloudflare service on **Free** plan.
2. Deploy `main` with `wrangler.jsonc`, `worker/index.mjs` and static files in `public/`.
3. Cloudflare must accept a Workers AI binding called `AI` and two Rate Limiting bindings `PER_IP` and `GLOBAL_AI` as specified in Wrangler. If binding setup fails, leave the existing static site intact and debug in a test environment; do not enable paid services.
4. Test `GET /api/engine/status`, `POST /api/engine/run` from same origin, and `GET /workspace.html`; verify a real model response, rate-limit denial, export/import, and mobile usability.
5. Monitor Workers/Workers AI free allowance and check that no accidental paid plan was enabled.

For local testing: `node --test tests/*.test.mjs` and `python -m http.server 8000 --directory public` (offline tools work but AI route requires the Worker).

## Future production architecture

Public cloud accounts, payment transactions and multi-tenant employer secrets need a separate identity-backed durable database, recovery/backups, verified learning/evaluation, server-side contract ownership, threat modeling and legal/privacy review. Cloudflare D1 Free can provide an experimental database, but production requirements and limits must be assessed independently. Do not reuse demo credentials on public endpoints.