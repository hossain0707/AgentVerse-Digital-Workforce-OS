# Module 04 — Deployment, Workers AI and External Clients

**Reviewed:** 2026-10-29. **Cloudflare service status:** live v0.4 binding and public pages verified via read-only HTTP fetch; real inference not retested in this documentation session.

## Public endpoints

- Animated world: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/`
- Working workspace: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/workspace.html`
- Investor simulation: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/investor.html`
- MCP/PC guide: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/mcp-setup.html`
- Downloadable stdio bridge: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/downloads/agentverse-mcp.mjs`
- AI service status: `https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/api/engine/status`; returned `version:0.4`, `ai:true` on 2026-10-29.

## Cloudflare build configuration

- Service: `agentverse-digital-workforce-os`; website hostname above.
- GitHub: `hossain0707/AgentVerse-Digital-Workforce-OS`, `main`. Current GitHub connector reports repository **public**; previous deployment docs claim private and should be corrected separately if authorized.
- Build root **repository root `/`**. Build command blank. Deploy command `npx wrangler deploy`.
- Wrangler: `main: ./worker/index.mjs`, `assets.directory: ./public`, `assets.binding: ASSETS`, `run_worker_first: ['/api/*']`. Never publish entire repository as assets and never make `./public` the *Git build root*.
- Cloudflare Worker: `AI` Workers AI binding, `PER_IP` and `GLOBAL_AI` limiters. Model `@cf/meta/llama-3.1-8b-instruct-fp8`.
- Wrangler settings examined: best-effort 2 AI requests/minute per IP and 12 globally. Additional Cloudflare Free daily limits apply; `ai:true` means configured bindings, **not guaranteed model availability**.
- Free plan only. No automatic paid fallback, payment processor, new domains, premium services or billing changes without user confirmation.

## Safe deploy procedure

1. Read current branch and source; verify tests before publishing.
2. Confirm `wrangler.jsonc` still scopes static assets to `./public` only and Worker code uses bounded `/api/*` routes.
3. Commit only authorized files (prefer PR/review for risky runtime changes); never commit or display credentials/datasets.
4. GitHub commit **does not prove Cloudflare deployed**. Inspect deployment logs and check live `/api/engine/status` version and all important URL responses.
5. Check a real Cloudflare AI task from same-origin workspace when quota allows; record actual response/failures and don't infer success from `ai:true` alone.
6. Verify offline fallback, storage migration, backups, mobile view, disabled payment functionality and zero exposure of Python APIs.
7. If Cloudflare deployment fails or would require paid services, leave prior live release intact; stop and ask before any billing changes.

A documentation-only commit can still trigger a Git-connected deployment automatically. Avoid manually triggering additional deployment or TinyFish charge unless explicitly authorized by the user.

## External AI clients: what currently works

### ChatGPT Web/desktop (manual workflow)

In the public workspace, use `ChatGPT & PC` tab: compile/copy role + bounded knowledge + current task, paste it into the user's own ChatGPT conversation, then optionally paste the answer into AgentVerse as an *external* task result. A ChatGPT subscription is **not an OpenAI API key**. This is not a signed-in cross-service account integration and does not sync memories automatically.

### Desktop MCP bridge (local stdio)

`public/downloads/agentverse-mcp.mjs` is built from the repo's `tools/agentverse-mcp-runtime.mjs` (build utility `tools/build-mcp.mjs`). Instructions at `/mcp-setup.html` cover Node.js 20+, saved portable AgentVerse JSON and local MCP-capable clients (e.g., Claude Desktop). Bridge tools can retrieve agent profiles, search local reference excerpts, prepare context for host AI and perform deterministic offline work. Write actions require an explicit consent flag and export a **new** backup file, never silently overwrite the source. No network calls or arbitrary local file traversal; still treat host client permissions carefully.

### Legacy local FastAPI MCP adapter

`integrations/mcp_server.py` connects to a locally running FastAPI instance with a user bearer token. It is unrelated to the downloadable zero-dependency v0.4 backup bridge. Neither is a hosted OAuth-protected ChatGPT remote MCP app.

### Future connector target (not built)

Remote MCP endpoint with OAuth2, scoped account permissions, discovery/authorization/revocation, customer consent, audit logs, rate budgets, support for compatible ChatGPT/Claude clients and applicable platform review. Optional customer-selected model/local inference adapters with their own access control.

## Operational security

Never expose a Python demo server, login secrets, user backup JSON, credential files or sensitive training content through the public Cloudflare site. Cloud AI sends selected prompt excerpts to Cloudflare model processing; do not advertise end-to-end private local inference. A `workers.dev` site being public does not imply user data is stored securely on a server.
