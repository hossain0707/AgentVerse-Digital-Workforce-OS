# Module 01 — Product, Personas, Experience and Roadmap

**Reviewed:** 2026-10-29. **Status:** Public v0.4 working beta plus separate local v0.2 marketplace prototype. See `../../PROJECT_MEMORY.md`.

## North-star product

AgentVerse is a standalone Digital Workforce Operating System intended to make agents feel like skilled, persistent digital employees. The long-term product includes a career passport, education and evaluation evidence, controlled work, portable permitted experience, employer-specific confidential memory, tools/model adapters, and regulated rights/licensing/contracts for hiring, purchase or transfer. Education stages (school/university/research) are **simulation labels / platform assessed competency** unless an actual accredited institution attests them. This is not a fictional claim that AI has human degrees or personhood.

**Distinguish** this product from NEXUS-100 (multi-orchestrator OS) and Falvorn AI (browser/web automation); don't link their repositories or architecture unless explicitly instructed.

## Primary users

- **Individual/creator:** creates custom employee, chooses a professional role, teaches a working style, supplies permitted documents, evaluates outputs, moves it between their own computers.
- **Student/teacher:** starts from a tutor or apprentice template and records exercises, not accredited certifications.
- **Professional/researcher:** gives a research or software employee documents and assigns bounded text tasks with source-labelled excerpts and human review.
- **Company/team (future SaaS):** contracts employees to restricted org workspaces with guarded connectors; secure multi-tenant data separation must precede actual shared hosting.
- **Trainer/academy (future):** contributes evaluated training, may earn contractually agreed rewards only after verification and legal implementation.
- **Investor:** explores publicly available animation and explicitly simulated hiring walkthrough, distinct from the working employee UI.

## User promise by release

| Capability | Public v0.4 | Local Python v0.2 | Later scope |
| --- | --- | --- | --- |
| Create and edit employees | Yes, in browser | Admin creates employee identities | Account/org-level roles and permissions |
| Ready-made roles | Six templates | Demo agent catalog | Trusted evaluated skill packs |
| Save reference documents | Text files in browser | Scoped notes, not full document indexing | PDF/DOCX, semantic search, source permissions |
| Teaching and feedback | Owner-supplied prompt memory and ratings | Registrar-reviewed training records | Reproducible benchmarks and attestations |
| Real task generation | Cloudflare Workers AI within quota | Optional configured external API | User-chosen providers, local models, governed tools |
| ChatGPT use | Manual copy/paste prompt and answer | No official remote MCP | Authenticated supported remote MCP and app review |
| MCP desktop bridge | Download Node stdio and exported JSON | Python stdio adapter to local API | Managed OAuth, scoped consent and revocation |
| Hire/rent/buy/resell | Investor-only simulation | Demo credits and contracts | Security-audited real multiuser marketplace |
| Cloud accounts/sync | No | Local demo users only | Identity-backed persistent cloud storage |
| Real payments | No | No, credits only | Only after legal/payment review and user approval |

## User guidance / investor pitch

Pitch honestly: 'Working public beta in which people create, teach, and use local-first AI employees, with optional cloud inference and portable memory; future vision for authenticated career marketplace.' Do NOT claim: 100% finished SaaS; unlimited free AI; independent academic degrees; paid transactions; autonomous agent execution on PCs; real ChatGPT account linkage; or encrypted customer-workspace isolation in the public site.

## Roadmap ordered by genuine blockers

1. **Product usability:** guided onboarding and truthful examples, actual live inference tests, knowledge citations and error reporting.
2. **Authenticated identity and secure persistence:** modern auth, multiuser org isolation, recovery, encryption, backups and privacy requirements.
3. **Real knowledge and skills:** document pipeline, semantic/hybrid search, provenance/permission controls, benchmarks, signed/reviewed skill achievements.
4. **Real agent actions:** bounded tools, browser/desktop authorization, auditable approvals, secure execution sandbox and cost controls.
5. **Compatible integrations:** direct remote MCP / OAuth through supported ChatGPT/Claude pathways, plus optional local models and customer-managed provider keys.
6. **Marketplace economics:** actual contracts, ownership/licensing, trainer rewards, buyer protections and optional paid processor only after required legal/security work.
7. **Production resilience:** performance, disaster recovery, observability, security audit, rollout/canary and incident response.

## Non-goals for free phase

No real payment checkout, card collection or referral payouts; no paid Cloudflare subscription; no autonomous procurement or tool use; no confidential-enterprise file ingestion into a shared inference account. Preserve all rights under the owner’s existing proprietary LICENSE.
