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
