# Module 05 — Quality Evidence, Release Checklist and Open Gates

**Reviewed:** 2026-10-29. Distinguish previous release tests from any tests actually run today.

**2026-10-29 local check:** `node --test tests/*.test.mjs` passed 18/18 after the storage change; `python tests/test_local_mcp.py` passed. `python -m pytest -q` could not run because `pytest` is not installed in this environment. No live browser, Cloudflare inference, load or penetration test was performed for this patch.

## Verified / reported evidence

| Evidence | Result | When / limitations |
| --- | --- | --- |
| Node engine and Worker unit/regression suite | 16 tests passed | Reported in 2026-10-09 v0.4 release; not rerun during 2026-10-29 memory task |
| Local stdio MCP integration | Passed initialization/tool listing/read/approved write/export flow | Prior 2026-10-09 release; not a ChatGPT remote connector test |
| Chromium DOM UI test | Passed practical knowledge, AI mock, history/feedback, transfer and mobile layout | Local test with **mocked** cloud model/storage; not load or independent security validation |
| Cloudflare page accessibility | Animated root, workspace, investor, MCP guide accessible | Rechecked via public read-only fetch 2026-10-29 |
| Cloudflare version/binding | `/api/engine/status` reports `0.4`, `ai:true` | Rechecked 2026-10-29; does NOT prove a live AI response |
| Local Python API tests | Historical 13 regression checks | Documented in `DELIVERY_STATUS.md` for v0.2; not rerun here |
| Penetration/load/tenant isolation audit | **Not demonstrated** | Must not label enterprise-ready until completed |
| Full hosted marketplace billing/auth | **Not deployed** | Only public local-first beta available |

## Local test commands

From repo root:

```bash
node --test tests/*.test.mjs
python tests/test_local_mcp.py
# browser UI test when dependencies are configured:
python tests/test_browser_ui.py
# local-only FastAPI regression tests:
python -m pytest -q
```

If dependencies/environment are missing, report that plainly. Never say tests passed unless actually run or clearly attributed to historical release logs. Release smoke tests should cover both safe static pages and the Worker API, plus actual model quota, storage migration and backup round-trip.

## New-release preflight

- Read `PROJECT_MEMORY.md`, relevant module history and current source branch; inspect diff and complete tests.
- Review GitHub visibility and public licensing; no secrets, demo logins in published artifacts, customer data or real credentials.
- Preserve Cloudflare Free plan and static asset scope; don't accidentally deploy `agentverse/app.py`.
- Check workers.dev homepage, workspace, investor, MCP guide and downloadable bridge; require correct status version.
- Verify AI route returns a reviewable model output (if quota allows), rate limits reject abuse, and errors never leak sensitive configuration.
- Test real import/export including documents, history and feedback; backup migration; IndexedDB fallback; cross-tab edits and safety notices.
- Test on mobile and desktop, keyboard accessibility and CSP/XSS boundaries; avoid claims beyond test coverage.
- Record exact commit, date, environment, outcome and unresolved issues in dated memory file.
- Only call the release 'production-grade' after separate independent security review, multiuser auth/tenant controls, cloud backup/recovery, observability and realistic load/incident tests.

## Critical open product risks

1. No hosted account identity, durable server data or tested tenant isolation. Browser storage can be lost.
2. Source excerpts supplied by visitors may be malicious/inaccurate. Retrieval is lexical and does not validate external citations.
3. Shared free Cloudflare model inference may hit quotas or quality/performance limits; rate limits are best-effort and free availability is not guaranteed.
4. User-exported portable JSON contains readable content; not encrypted or secure for client secrets.
5. No native PC execution, automated code changes, full autonomous training or official remote ChatGPT app.
6. Local Python marketplace must remain offline until an independent security design and privacy/legal review are complete.
7. Existing docs wrongly reference private repository (GitHub public on 2026-10-29); reconcile without assuming intent to switch visibility.
8. Need DAST/SAST/dependency/license audits, disaster-recovery exercises, privacy and regulatory reviews before enterprise onboarding.

## Release/decision log

- v0.1 initial app, GitHub repo and animation — 2026-10-09.
- v0.2 local marketplace, contracts and privacy regression — 2026-10-09.
- v0.3 free worker and local-first public employee demo — 2026-10-09.
- v0.4 knowledge library, six professions, ratings, portable backups and local MCP — 2026-10-09; SHA `e0e19054d12015b65eb071f0b9c2ae26c3a7d508`.
- 2026-10-29: project master memory and agent maintenance convention initialized; **documentation-only** request, not a new product release.

Continue dated logs for future implementation and avoid overwriting the factual historical timeline.
