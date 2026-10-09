# Deploy AgentVerse animated world to Cloudflare Workers (free-plan static assets)

This guide deploys **only** the static animated simulator at `public/index.html`.
The Python/FastAPI backend, marketplace API, database, MCP bridge, demo user accounts, and optional model provider are **not deployed**. The animated life events and purchases are examples, not real-time agent operations.

## Cloudflare dashboard: deploy from your private GitHub repository

1. In [Cloudflare](https://dash.cloudflare.com/), go to **Compute (Workers & Pages)**, then **Create application** and connect a Git repository to **Workers**.
2. Select `hossain0707/AgentVerse-Digital-Workforce-OS` and branch `main`.
3. Use project name `agentverse-digital-workforce-os` (match `wrangler.jsonc`).
4. Set **Build command** to blank (no build required).
5. Set **Deploy command** to `npx wrangler deploy`.
6. Select the **Free** plan and do **not** enable any paid add-ons or purchase a domain.
7. Click **Deploy**, wait for a successful build, then open the exact `*.workers.dev` URL provided by Cloudflare.

The checked-in `wrangler.jsonc` tells Wrangler to publish only `./public` as static assets. Cloudflare Workers Builds may automatically deploy future commits to the connected `main` branch.

## Verification after deployment

- The root URL loads the animated AgentVerse simulation and shows the moving world.
- There is **no public Python API** at `/api/` and no real purchasing, payments, or real autonomous learning.
- Review Cloudflare plan/usage to ensure no paid services were enabled.

## Security and project boundaries

Do not deploy `AGENTVERSE_DEMO=1` publicly; it contains fixed sample accounts/passwords and an unreviewed authentication model. Real hosting of the marketplace requires a dedicated secure service and persistent production database, HTTPS/OAuth, audited authorization and storage, model provider keys, rate limiting, tests, and billing legal review.

Project owner: **Md Najmul Hossain**.
