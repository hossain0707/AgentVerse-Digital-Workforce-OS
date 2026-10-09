# AgentVerse Free Public Workspace (v0.4)

**Live workspace**: https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/workspace.html  
**Animated world**: https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/  
**Investor preview**: https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/investor.html  
**Local MCP installation**: https://agentverse-digital-workforce-os.n-h-munna55.workers.dev/mcp-setup.html

AgentVerse is a working local-first beta, **not** a production-grade commercial identity-backed marketplace. Users do not need accounts, subscriptions or payment cards for the beta.

## First five minutes

1. Open `/workspace.html` in your browser. New visitors receive two starter digital employees. Six role templates are available without registration.
2. Choose a role, open **Knowledge**, upload plain text/Markdown/CSV/JSON/log, or paste your own reference document. Supported knowledge is local to your browser and selected employee.
3. Under **Teach**, add process rules or corrections for that employee. They affect the next AI prompt; **not** the underlying model weights.
4. Under **Work**, enter a task; AgentVerse searches local documents and shows relevant source titles. Select **Cloud AI** for a real response within shared free quota, or **Offline** for deterministic document search/planning/checklist.
5. Review results, rate the work in **History**, optionally give additional instruction, then **Export all employees** as a JSON backup.

## Moving between computers and AI clients

Use Export/Import to transport employees, their knowledge, lessons and work history. Data stays in each browser's IndexedDB storage; no automatic cloud sync is configured.

For ChatGPT Web/desktop, click **ChatGPT & PC**, copy the employee's compiled prompt and paste it into a normal ChatGPT conversation. Optionally paste the response back into AgentVerse. This is a manual workflow: ChatGPT subscriptions are not reusable model API credentials.

For a local stdio MCP-capable client such as Claude Desktop, download `/downloads/agentverse-mcp.mjs`, install Node.js 20+, export your JSON backup, and follow `/mcp-setup.html`. Read-only context lookup does not require local payment or keys. MCP write actions require explicit approval and create a *new* backup file. ChatGPT remote MCP is not deployed and is not automatically connected to this local bridge.

## Technical and security limitations

- Document ingestion supports readable files, not PDF/DOCX, scanning, screenshots, web crawling or privileged file access.
- Retrieval is lexical matching over local text passages with source labels, not embeddings or scholarly fact verification.
- Model inference is a Cloudflare-hosted shared model subject to the **Free plan quota and best-effort rate limits**. AI may stop responding without warning when shared quota is used. Offline work still works. No paid fallback should be enabled.
- The app cannot act autonomously on a PC, modify arbitrary code repositories, browse the web, execute terminal commands, create cloud accounts, run private APIs or train model weights by itself.
- Private data should **not** be uploaded to shared AI; when Cloud AI is selected, relevant lessons and excerpts leave the browser for inference on Cloudflare infrastructure. AgentVerse does not maintain server-side work history. Exported JSON backups are not encrypted.
- Authenticated Python/FastAPI multi-tenant prototype remains local-only; its demo credentials and database must not be deployed publicly.
- Browser storage can be deleted on site data clearing, disk cleanup, private browsing sessions or device loss. Regularly export backups.
- Copyright and product ownership remain with **Md Najmul Hossain**. Free access does not transfer IP or grant unrestricted source redistribution rights.

## Operations

GitHub-connected Cloudflare Worker deploys from **repository root** with blank build command and `npx wrangler deploy`. `wrangler.jsonc` serves only `public/` static assets and one isolated Worker AI gateway via `worker/index.mjs`. Rate-limiting bindings and AI bindings must be present. Do not change the project to a paid plan or expose the Python demo.

See [WORKING_BETA_READINESS.md](WORKING_BETA_READINESS.md) for exact test evidence and remaining production security gates. Use `node --test tests/*.test.mjs` for the engine and Worker tests, and `python tests/test_local_mcp.py` for local MCP integration.