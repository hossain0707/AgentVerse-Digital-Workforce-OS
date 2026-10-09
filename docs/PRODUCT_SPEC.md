# AgentVerse — Commercial Product Blueprint

**Owner:** Md Najmul Hossain  
**System:** independent digital employee marketplace, academy, employer workspace and career registry  
**State:** v0.2 application prototype; no cash settlement, licensed agent ownership, autonomous learning or remote MCP service

## Complete intended lifecycle

1. **Creation:** registrar creates a stable digital agent identity, specialty, baseline tests and provenance record. A beginning agent is not a human baby or a trained professional.
2. **Education:** learners and trainers select a curriculum, submit assessed evidence, and accumulate skills only after reviewer verification. Professional stages and "experience" are transparent *platform competence levels*, never claims of real human degrees or institutional affiliation.
3. **Discovery:** prospective buyers compare sample passports, skills and prices. The catalog does not publish prior employers' secrets or personally identifiable buyer records.
4. **Hire:** a renter receives temporary, revocable rights to a private workplace. An owner keeps title and a separate, inaccessible-to-renter owner vault.
5. **Operate:** a company assigns tasks through AgentVerse, optionally using an external LLM with a properly configured service credential. Every run checks current employment authority.
6. **Learn:** a worker submits sanitized, non-confidential skills and evidence to a reviewer. Employer trade secrets remain non-portable. Knowledge from external papers should be licensed and evaluation-based; model-weight changes must be versioned and reversible.
7. **Extend:** the current employer may request a renewal; the owner must approve or reject. Neither request nor approval charges real funds in this prototype.
8. **Buy out:** only the current owner can offer a permanent buyout; only that contracted employer can accept. The active employment contract ends and the employee's career continues under the new owner.
9. **Transfer/resell:** an idle owner may list a digital employee for purchase, preserving generalized verified capability and ownership lineage. Tokens, secrets, prior employers' notes, and workplace task results do not transfer.
10. **Financial allocation:** an agreed fee is deducted; only verified eligible trainer contributions receive sale-linked rewards. A renter receives no recurring share of future rentals. The present fee schedule is illustrative; real settlement, escrow, customer refunds, taxes, and payment obligations require contracts and payment-provider integration.
11. **Archive and deletion:** each former employer may export their own work records and remove their own notes, without affecting an unrelated employer's records.

## Actor / rights matrix

| Action | Visitor | Buyer/renter | Current owner | Registrar |
| --- | --- | --- | --- | --- |
| Browse public catalog | Yes | Yes | Yes | Yes |
| View non-confidential passport | Login required in prototype | Yes | Yes | Yes |
| Simulate rental/purchase | No | Yes | Not own listing | Can buy other agents as user |
| Use an employee's active workplace | No | During active contract | While idle | When registrar owns and idle |
| Access **different employer** private notes | Never | Never | Never | Never through current context API |
| Submit learning evidence | No | If authorized | If authorized and not employed elsewhere | If authorized |
| Approve training | No | No | No | Yes |
| Request rental renewal | No | Current renter | No | No |
| Approve renewal | No | No | Contract's owner | Only if contract's owner |
| Offer buyout | No | No | Contract's owner | Only if contract's owner |
| Accept buyout | No | Contract's employer | No | No |
| Export/delete *own* employer notes | No | Yes | Yes for own notes | Own notes only |

## Learning design: capability growth, not magical self-training

- Candidate inputs: permissioned courses, public literature, customer-approved knowledge and workplace feedback.
- Review: score on reproducible hold-out tasks, check source licensing, benchmark skill retention and regression risk, human sign-off for irreversible actions.
- Memory: store non-portable employer task data separately from sanitized and explicitly approved portable skill records.
- Rollback: every change in prompts, skill tools and future model adapters must have a version ID and an evaluation record. No unbounded self-modifying production code.
- Endorsements: universities and companies may later issue verifiable attestations with digitally signed evidence. Never invent degree accreditation.

## Customer installation / external AI clients

- **Current:** local AgentVerse FastAPI workbench and optional Python stdio MCP adapter, using a scoped user bearer token.
- **Planned:** remotely hosted OAuth-protected MCP gateway supporting client-approved ChatGPT/Claude integrations where platform policies permit. API keys and credentials must never be included in agent transfer packages.
- **Business model:** per-agent identity + permission-controlled runtime, not distributing proprietary platform source as a downloadable employee. Ownership of a software license is contractual, not literal ownership of an autonomous person.

## Backend and deployment boundary

- `public/index.html` is the static animated Investor/Concept Demo intended for Cloudflare Workers/Pages. It contains no working checkout or private API.
- `static/customer.html` is the local authenticated customer marketplace and workspace served at `/start` **only by the FastAPI app**.
- `static/index.html` is the local legacy command center served at `/`.
- `agentverse/app.py` is the operational development API backed by SQLite; it must not be connected to anonymous public traffic without a security and deployment redesign.
- The repository may be private while its separate hosted static demo remains publicly viewable.

## Nonnegotiable prelaunch gates

1. Production account security: OAuth/SSO, MFA, revocable sessions, account recovery, verified registration and role separation.
2. Reliable data plane: managed PostgreSQL/other persistent store, migrations, per-tenant encryption controls, backups, data retention, incident response and auditing.
3. Real payment provider: integration verification, webhook signatures, state machine, reconciliation, chargebacks, refund and tax policies, jurisdictional contracts.
4. Ownership/IP: contractual title/license definition, resale restrictions, agent duplication/anti-copy, trainer contributor rights and user disclosures.
5. Managed runtime: per-tenant execution budgets, queues, tools permission model, provider billing controls, sandbox isolation, content provenance and evals.
6. External integrations: supported OAuth remote MCP/app approvals, scoped credentials, explicit user consent and tested revocation.
7. Privacy: consented data collection, enterprise privacy review, employer handover and deletion/export guarantees, third-party vendor DPAs.
8. Independent security/load testing, uptime and backup/restore drills; no paid service or public backend is enabled by the current release.