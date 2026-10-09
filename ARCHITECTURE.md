# AgentVerse target architecture

```mermaid
flowchart TB
 U[Buyer / Trainer / Company / Institution] --> W[Web Marketplace + Buyer Workspace]
 U --> M[ChatGPT / Claude Code / Third-party AI Clients]
 M --> G[OAuth / Remote MCP Gateway (future)]
 W --> API[AgentVerse API Gateway]
 G --> API
 API --> R[Career Registry + Passport]
 API --> C[Rental / Ownership Contract Engine]
 API --> L[Learning + Verifiable Evaluation]
 API --> E[Task Runtime + Model / Tool Adapter]
 API --> F[Economy Ledger + Marketplace]
 E --> X[Employer-isolated Knowledge Vault]
 E --> P[Provider Models / Customer Compute]
 C --> Q[Offboard and Employer Context Revocation]
 L --> R
 F --> C
 F --> T[Settlement + Trainer Royalty Rules]
 X -. no old-employer access .-> Q
 I[Optional University / Academy Providers] --> L
```

Core separation: immutable identity / portable verified career facts / non-portable employer workspace / separately revocable model and tool access. In the prototype, these are grouped into one FastAPI process with SQLite tables, to keep runtime and testing straightforward. A production deployment should separate boundaries by tenant, not merely split services into microservices.

## Implemented v0.2 modules

- `agentverse/app.py`: local FastAPI routes and RBAC/authorization
- `agentverse/commerce.py`: consistent demo credit allocation; no card/checkout processing
- `agentverse/changes.py`: additive SQLite schema additions for buyout offers, renewals and ownership lineage
- `static/customer.html`: local buyer onboarding and scoped workbench
- `static/index.html`: legacy local command center
- `public/index.html`: investor-only static simulation (Cloudflare deploy root)
- `integrations/mcp_server.py`: user-token-scoped local stdio bridge (not remote OAuth MCP)
- `tests/test_marketplace_v2.py`: end-to-end API contract, privacy and revocation regression tests

Keep permanent skill/identity storage distinct from employer-owned data. An employee can transfer an externally verified portable skill but not proprietary outputs, private tool connections, API keys, or workplace memory. See `docs/PRODUCT_SPEC.md` and `SECURITY.md` for full policies.