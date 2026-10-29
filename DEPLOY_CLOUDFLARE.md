# Cloudflare deployment — AgentVerse free public beta

The current build contains the existing animated world, investor preview and a real local-first customer workspace. Deploy **from the repository root** (`./`, not `./public`). The Wrangler configuration at root chooses only `public/` as static assets and `worker/index.mjs` as the isolated optional AI gateway. The Python FastAPI backend must never be exposed.

**GitHub repo:** `hossain0707/AgentVerse-Digital-Workforce-OS` (public as checked on 2026-10-29); branch `main`. **Cloudflare service:** `agentverse-digital-workforce-os`. **Build command:** blank; **deploy:** `npx wrangler deploy`. **Plan:** Free only. Keep automatic upgrades, paid bindings, paid models, credit cards, add-ons and payments disabled.

Worker bindings must be created by the Wrangler deployment: `AI` (Workers AI model `@cf/meta/llama-3.1-8b-instruct-fp8`), and two rate limits `PER_IP`, `GLOBAL_AI`, defined in `wrangler.jsonc`. If the deploy fails, fix the **root directory** first: `./`. Do not configure `./public` as build root; that is only the published **asset directory**.

Verify these:

- `/` — animated concept site, plus link to workspace
- `/investor.html` — simulated investor walkthrough, plus link to workspace
- `/workspace.html` — create/edit/teach/export/import agents; offline tool succeeds
- `/api/engine/status` — JSON response; `ai:true` only if all free bindings are present
- `POST /api/engine/run` from the same-origin workspace — live inference; never publish/demo passwords or external API keys

Cloudflare Workers AI Free allocation is limited; once exhausted, requests fail and users can use offline tools. The app stores all histories **only locally in each visitor's browser**. See [docs/FREE_PUBLIC_BETA.md](docs/FREE_PUBLIC_BETA.md).

No feature here should ever require checkout or payment. **Do not deploy `agentverse/app.py` publicly.**
